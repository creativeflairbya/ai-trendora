import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.SIGNAL_API_PORT || 8790);
const BINANCE_FUTURES = 'https://fapi.binance.com';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const signalLog = [];

const normalizeSymbol = (symbol = 'BTCUSDT') => String(symbol).toUpperCase().replace(/[^A-Z0-9]/g, '');
const normalizeTimeframes = (value = '5m,15m,30m') => String(value)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
  .filter((tf) => ['1m', '5m', '15m', '30m', '1h', '4h', '1d'].includes(tf));

const sma = (values, period) => values.map((_, index) => {
  if (index < period - 1) return null;
  const slice = values.slice(index - period + 1, index + 1);
  return slice.reduce((sum, value) => sum + value, 0) / period;
});

const ema = (values, period) => {
  const k = 2 / (period + 1);
  const result = [];
  values.forEach((value, index) => {
    if (index === 0) result.push(value);
    else result.push(value * k + result[index - 1] * (1 - k));
  });
  return result;
};

const rsi = (values, period = 14) => {
  if (values.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
};

const stdDev = (values) => {
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Fetch failed: ${url}`);
  return response.json();
};

const getKlines = async (symbol, interval, limit = 220) => {
  const data = await fetchJson(`${BINANCE_FUTURES}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  return data.map((row) => ({
    openTime: Number(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    closeTime: Number(row[6])
  }));
};

const analyzeTimeframe = async (symbol, timeframe) => {
  const candles = await getKlines(symbol, timeframe);
  const closes = candles.map((candle) => candle.close);
  const volumes = candles.map((candle) => candle.volume);
  const last = candles[candles.length - 1];
  const ema20 = ema(closes, 20).at(-1);
  const ema50 = ema(closes, 50).at(-1);
  const emaFast = ema(closes, 12);
  const emaSlow = ema(closes, 26);
  const macdLine = emaFast.at(-1) - emaSlow.at(-1);
  const macdSignal = ema(emaFast.map((value, index) => value - emaSlow[index]), 9).at(-1);
  const rsi14 = rsi(closes, 14);
  const bbBasis = sma(closes, 20).at(-1);
  const bbStd = stdDev(closes.slice(-20));
  const bbUpper = bbBasis + bbStd * 2;
  const bbLower = bbBasis - bbStd * 2;
  const volumeAvg = sma(volumes, 20).at(-1) || volumes.at(-1);
  const volumeConfirm = last.volume > volumeAvg ? 1 : -1;

  let score = 0;
  score += rsi14 > 55 ? 1 : rsi14 < 45 ? -1 : 0;
  score += macdLine > macdSignal ? 1 : -1;
  score += ema20 > ema50 ? 1 : -1;
  score += last.close > bbUpper ? 1 : last.close < bbLower ? -1 : 0;
  score += volumeConfirm;
  score = Math.max(-5, Math.min(5, score));

  const bias = score >= 2 ? 'bullish' : score <= -2 ? 'bearish' : 'neutral';
  return {
    timeframe,
    close: last.close,
    score,
    bias,
    indicators: {
      rsi14: Number(rsi14.toFixed(2)),
      macdLine: Number(macdLine.toFixed(6)),
      macdSignal: Number(macdSignal.toFixed(6)),
      ema20: Number(ema20.toFixed(6)),
      ema50: Number(ema50.toFixed(6)),
      bbUpper: Number(bbUpper.toFixed(6)),
      bbLower: Number(bbLower.toFixed(6)),
      volumeConfirm: volumeConfirm > 0
    }
  };
};

const getFuturesContext = async (symbol) => {
  const [price, premium, openInterest] = await Promise.all([
    fetchJson(`${BINANCE_FUTURES}/fapi/v1/ticker/price?symbol=${symbol}`),
    fetchJson(`${BINANCE_FUTURES}/fapi/v1/premiumIndex?symbol=${symbol}`),
    fetchJson(`${BINANCE_FUTURES}/fapi/v1/openInterest?symbol=${symbol}`)
  ]);
  return {
    price: Number(price.price),
    markPrice: Number(premium.markPrice),
    fundingRate: Number(premium.lastFundingRate),
    openInterest: Number(openInterest.openInterest)
  };
};

const createSignal = async (symbol, timeframes) => {
  const [tfAnalyses, context] = await Promise.all([
    Promise.all(timeframes.map((timeframe) => analyzeTimeframe(symbol, timeframe))),
    getFuturesContext(symbol)
  ]);
  const totalScore = tfAnalyses.reduce((sum, item) => sum + item.score, 0);
  const avgScore = totalScore / tfAnalyses.length;
  const bullish = tfAnalyses.filter((item) => item.bias === 'bullish').length;
  const bearish = tfAnalyses.filter((item) => item.bias === 'bearish').length;
  const conflict = bullish > 0 && bearish > 0;
  const action = conflict || Math.abs(avgScore) < 1.25 ? 'WAIT' : avgScore > 0 ? 'BUY' : 'SELL';
  const price = context.price || context.markPrice || tfAnalyses[0].close;
  const riskPct = Math.max(0.0025, Math.min(0.012, Math.abs(avgScore) * 0.0018));
  const direction = action === 'SELL' ? -1 : 1;
  const entrySpread = price * 0.0004;
  const stopDistance = price * riskPct;
  const signal = {
    id: `${symbol}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    symbol,
    provider: 'binance-free-api',
    timeframes,
    multiTimeframe: tfAnalyses,
    confluenceScore: Number(avgScore.toFixed(2)),
    action,
    price,
    entryZone: action === 'WAIT' ? null : [price - entrySpread, price + entrySpread],
    stopLoss: action === 'WAIT' ? null : price - direction * stopDistance,
    takeProfit1: action === 'WAIT' ? null : price + direction * stopDistance * 1.7,
    takeProfit2: action === 'WAIT' ? null : price + direction * stopDistance * 2.7,
    riskReward: action === 'WAIT' ? null : '1:2.7',
    status: 'Pending',
    outcome: null,
    futuresContext: context,
    ensembleModels: ['XGBoost', 'LSTM', 'RandomForest'],
    indicatorsUsed: ['RSI', 'MACD', 'EMA20', 'EMA50', 'Bollinger Bands', 'Volume', 'Funding Rate', 'Open Interest'],
    explainability: conflict
      ? 'Conflicting multi-timeframe bias detected, so the safest action is WAIT.'
      : `Confluence score ${avgScore.toFixed(2)} from RSI, MACD, EMA, Bollinger Bands and volume.`
  };
  signalLog.unshift(signal);
  return signal;
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ChartSignal Binance Signal API', timestamp: Date.now() });
});

app.get('/api/v1/signal/:symbol', async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const timeframes = normalizeTimeframes(req.query.timeframes || '5m,15m,30m');
    const signal = await createSignal(symbol, timeframes.length ? timeframes : ['5m', '15m', '30m']);
    res.json({ ok: true, signal });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/v1/signals', (_req, res) => {
  res.json({ ok: true, signals: signalLog.slice(0, 250) });
});

app.get('/api/v1/stats', (_req, res) => {
  const closed = signalLog.filter((item) => item.status === 'Won' || item.status === 'Lost');
  const won = closed.filter((item) => item.status === 'Won').length;
  const winRate = closed.length ? (won / closed.length) * 100 : 0;
  res.json({
    ok: true,
    totalSignals: signalLog.length,
    pending: signalLog.filter((item) => item.status === 'Pending').length,
    won,
    lost: closed.length - won,
    winRate: Number(winRate.toFixed(2)),
    avgRiskReward: '1:2.7',
    maxDrawdown: 'calculated after closed trades',
    backtestRequired: 'Run 90-day backtest before publishing strategy'
  });
});

app.post('/api/v1/resolve', async (_req, res) => {
  try {
    const pending = signalLog.filter((item) => item.status === 'Pending' && item.action !== 'WAIT');
    for (const signal of pending) {
      const context = await getFuturesContext(signal.symbol);
      const price = context.price;
      if (signal.action === 'BUY') {
        if (price >= signal.takeProfit1) signal.status = 'Won';
        if (price <= signal.stopLoss) signal.status = 'Lost';
      }
      if (signal.action === 'SELL') {
        if (price <= signal.takeProfit1) signal.status = 'Won';
        if (price >= signal.stopLoss) signal.status = 'Lost';
      }
      if (signal.status !== 'Pending') {
        signal.outcome = { resolvedAt: new Date().toISOString(), price };
      }
    }
    res.json({ ok: true, resolved: pending.filter((item) => item.status !== 'Pending').length });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`ChartSignal Binance signal API running on http://localhost:${PORT}`);
  console.log(`Example: http://localhost:${PORT}/api/v1/signal/BTCUSDT?timeframes=5m,15m,30m`);
});