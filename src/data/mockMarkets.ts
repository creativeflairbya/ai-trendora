import { AssetData } from '../types';

const generateCandles = (basePrice: number, volatility: number, count = 24) => {
  const candles = [];
  let currentPrice = basePrice * (1 - (Math.random() * 0.02 - 0.01));
  const now = new Date();
  
  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const change = (Math.random() - 0.48) * volatility;
    const open = currentPrice;
    const close = Number((open + change).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * (volatility * 0.4)).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * (volatility * 0.4)).toFixed(2));
    const volume = Math.floor(Math.random() * 50000 + 12000);
    
    candles.push({ time, open: Number(open.toFixed(2)), high, low, close, volume });
    currentPrice = close;
  }

  // Keep the chart and signal quote aligned: the final candle is always the displayed live price.
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    const open = Number((basePrice - volatility * 0.18).toFixed(2));
    const close = Number(basePrice.toFixed(2));
    candles[candles.length - 1] = {
      ...last,
      open,
      close,
      high: Number((Math.max(open, close) + volatility * 0.24).toFixed(2)),
      low: Number((Math.min(open, close) - volatility * 0.18).toFixed(2))
    };
  }
  return candles;
};

export const MOCK_ASSETS: AssetData[] = [
  {
    id: 'btc-usdt',
    symbol: 'BTC/USDT',
    name: 'Bitcoin Perpetual',
    category: 'crypto',
    tradingViewSymbol: 'BINANCE:BTCUSDT',
    price: 60840.50,
    change24h: 3.82,
    high24h: 61650.00,
    low24h: 59200.00,
    volume24h: '$48.8B',
    regime: 'Quantum Institutional Trend (99% Confluence)',
    rsi: 65.4,
    macd: 'Super-Trend Crossover (+184.2)',
    ema20: 60100.00,
    ema50: 59450.00,
    supportZone: [60200, 60600],
    resistanceZone: [61800, 62500],
    setupQuality: 'HIGH',
    candles: {
      '15m': generateCandles(60840.50, 120, 24),
      '1H': generateCandles(60840.50, 280, 24),
      '4H': generateCandles(60840.50, 580, 24),
      '1D': generateCandles(60840.50, 1200, 24)
    },
    currentSignal: {
      action: 'BUY',
      entryZone: [60600, 60900],
      stopLoss: 59850,
      takeProfit1: 61680,
      takeProfit2: 62550,
      confidence: 99,
      historicalSuccessRate: 98,
      riskLevel: 'Zero-Ruin Shield',
      timeframe: '4H',
      holdingDuration: '2 to 6 Hours (Intraday Quantum Hold)',
      simpleExplanation: '99% Confluence achieved. Institutional liquidity sweep confirmed above EMA-20. Trendora validates live orderbook delta before issuing entry guidance.',
      advancedExplanation: 'SMC order block retest at 60,600 coincides with XGBoost Volatility Compression break. Risk-to-Reward ratio is 3.8:1. Zero-Ruin Capital Shield locks maximum loss at 1% bankroll.',
      similarHistory: [
        { date: 'Yesterday', asset: 'BTC/USDT', outcome: '+4.8% Institutional Target Hit', confidenceWhenIssued: 99 },
        { date: '3 days ago', asset: 'SOL/USDT', outcome: '+3.5% Quant Precision Hit', confidenceWhenIssued: 98 },
        { date: '1 week ago', asset: 'BTC/USDT', outcome: '+4.8% Institutional Target Hit', confidenceWhenIssued: 99 }
      ]
    }
  },
  {
    id: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Spot Gold Macro',
    category: 'gold',
    tradingViewSymbol: 'OANDA:XAUUSD',
    price: 4028.66,
    change24h: 1.85,
    high24h: 4032.00,
    low24h: 4016.00,
    volume24h: '$84.2B',
    regime: 'Smart Money Order Block Squeeze',
    rsi: 62.1,
    macd: 'Bullish Expansion (+16.8)',
    ema20: 4025.40,
    ema50: 4021.10,
    supportZone: [4024.00, 4026.00],
    resistanceZone: [4031.00, 4032.50],
    setupQuality: 'HIGH',
    candles: {
      '15m': generateCandles(4028.66, 2.1, 42),
      '1H': generateCandles(4028.66, 4.2, 42),
      '4H': generateCandles(4028.66, 9.5, 42),
      '1D': generateCandles(4028.66, 18.0, 42)
    },
    currentSignal: {
      action: 'BUY',
      entryZone: [4027.80, 4029.10],
      stopLoss: 4024.90,
      takeProfit1: 4031.80,
      takeProfit2: 4034.40,
      confidence: 99,
      historicalSuccessRate: 98,
      riskLevel: 'Zero-Ruin Shield',
      timeframe: '1H',
      holdingDuration: '45 to 90 Minutes (Fast Precision Scalp)',
      simpleExplanation: 'Central bank physical reserve hoarding plus safe-haven demand create a 99% institutional buy setup on the 1H order block.',
      advancedExplanation: 'Institutional orderflow shows aggressive bids at 4,027.800. ATR contraction signals impending high-momentum breakout.',
      similarHistory: [
        { date: '2 days ago', asset: 'XAU/USD', outcome: '+3.5% Quant Precision Hit', confidenceWhenIssued: 98 },
        { date: '5 days ago', asset: 'XAU/USD', outcome: '+4.8% Institutional Target Hit', confidenceWhenIssued: 99 }
      ]
    }
  },
  {
    id: 'ngas-usd',
    symbol: 'NGAS/USD',
    name: 'Natural Gas Henry Hub',
    category: 'gas',
    tradingViewSymbol: 'NYMEX:NG1!',
    price: 3.485,
    change24h: 6.25,
    high24h: 3.520,
    low24h: 3.240,
    volume24h: '$14.8B',
    regime: 'Quantum Institutional Trend (99% Confluence)',
    rsi: 68.4,
    macd: 'Breakout Expansion (+0.142)',
    ema20: 3.320,
    ema50: 3.180,
    supportZone: [3.380, 3.420],
    resistanceZone: [3.650, 3.800],
    setupQuality: 'HIGH',
    candles: {
      '15m': generateCandles(3.485, 0.04, 24),
      '1H': generateCandles(3.485, 0.08, 24),
      '4H': generateCandles(3.485, 0.15, 24),
      '1D': generateCandles(3.485, 0.28, 24)
    },
    currentSignal: {
      action: 'BUY',
      entryZone: [3.450, 3.490],
      stopLoss: 3.360,
      takeProfit1: 3.680,
      takeProfit2: 3.850,
      confidence: 99,
      historicalSuccessRate: 98,
      riskLevel: 'Zero-Ruin Shield',
      timeframe: '4H',
      holdingDuration: '12 to 24 Hours (Multi-Session Hold)',
      simpleExplanation: 'Winter supply inventory drawdowns confirm a 99% accuracy breakout. Natural gas has cleared seasonal resistance with immense volume.',
      advancedExplanation: 'SMC order block alignment across 1H, 4H, and 1D charts. Machine learning models project a 4.2:1 reward-to-risk ratio.',
      similarHistory: [
        { date: 'Yesterday', asset: 'NGAS/USD', outcome: '+4.8% Institutional Target Hit', confidenceWhenIssued: 99 },
        { date: '1 week ago', asset: 'NGAS/USD', outcome: '+3.5% Quant Precision Hit', confidenceWhenIssued: 97 }
      ]
    }
  },
  {
    id: 'wti-oil',
    symbol: 'WTI/USD',
    name: 'Crude Oil WTI Futures',
    category: 'oil',
    tradingViewSymbol: 'TVC:USOIL',
    price: 72.15,
    change24h: -1.24,
    high24h: 73.80,
    low24h: 71.40,
    volume24h: '$36.2B',
    regime: 'High Volatility (News Sensitive)',
    rsi: 44.1,
    macd: 'Bearish Convergence',
    ema20: 72.85,
    ema50: 73.90,
    supportZone: [70.50, 71.00],
    resistanceZone: [73.80, 74.50],
    setupQuality: 'WEAK',
    weakReason: 'Geopolitical OPEC+ quota statements pending within 3 hours. Standard AI bots lose 70% of trades during news spikes. Trendora restraint mode protects your capital.',
    saferAlternatives: [
      {
        assetId: 'btc-usdt',
        symbol: 'BTC/USDT',
        name: 'Bitcoin Perpetual',
        confidence: 99,
        action: 'BUY',
        reason: '99% Institutional Confluence above $67,500 order block.'
      },
      {
        assetId: 'ngas-usd',
        symbol: 'NGAS/USD',
        name: 'Natural Gas Henry Hub',
        confidence: 99,
        action: 'BUY',
        reason: 'Seasonal inventory breakout with 4.2:1 reward/risk.'
      }
    ],
    candles: {
      '15m': generateCandles(72.15, 0.45, 24),
      '1H': generateCandles(72.15, 0.85, 24),
      '4H': generateCandles(72.15, 1.45, 24),
      '1D': generateCandles(72.15, 2.80, 24)
    }
  },
  {
    id: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Spot Silver Industrial',
    category: 'silver',
    tradingViewSymbol: 'TVC:SILVER',
    price: 33.15,
    change24h: 3.40,
    high24h: 33.50,
    low24h: 31.90,
    volume24h: '$22.5B',
    regime: 'Quantum Institutional Trend (99% Confluence)',
    rsi: 64.8,
    macd: 'Bullish Expansion (+0.84)',
    ema20: 32.20,
    ema50: 31.45,
    supportZone: [32.40, 32.70],
    resistanceZone: [34.20, 35.00],
    setupQuality: 'HIGH',
    candles: {
      '15m': generateCandles(33.15, 0.15, 24),
      '1H': generateCandles(33.15, 0.32, 24),
      '4H': generateCandles(33.15, 0.65, 24),
      '1D': generateCandles(33.15, 1.25, 24)
    },
    currentSignal: {
      action: 'BUY',
      entryZone: [32.95, 33.20],
      stopLoss: 32.35,
      takeProfit1: 34.50,
      takeProfit2: 35.80,
      confidence: 99,
      historicalSuccessRate: 98,
      riskLevel: 'Zero-Ruin Shield',
      timeframe: '4H',
      holdingDuration: '4 to 8 Hours (Intraday Swing)',
      simpleExplanation: 'Industrial solar demand surge confirmed by 99% quant rating. Silver has broken multi-month macro resistance.',
      advancedExplanation: 'Gold/Silver ratio contraction indicates silver outperformance phase. Clean liquidity void up to $34.50.',
      similarHistory: [
        { date: '3 days ago', asset: 'XAG/USD', outcome: '+4.8% Institutional Target Hit', confidenceWhenIssued: 98 },
        { date: '2 weeks ago', asset: 'XAG/USD', outcome: 'Breakeven / Capital Shielded', confidenceWhenIssued: 96 }
      ]
    }
  },
  {
    id: 'sol-usdt',
    symbol: 'SOL/USDT',
    name: 'Solana Layer-1',
    category: 'crypto',
    tradingViewSymbol: 'BINANCE:SOLUSDT',
    price: 184.40,
    change24h: 5.12,
    high24h: 189.00,
    low24h: 175.50,
    volume24h: '$18.4B',
    regime: 'Quantum Institutional Trend (99% Confluence)',
    rsi: 65.2,
    macd: 'Bullish Momentum',
    ema20: 180.00,
    ema50: 172.00,
    supportZone: [178.00, 181.00],
    resistanceZone: [195.00, 205.00],
    setupQuality: 'HIGH',
    candles: {
      '15m': generateCandles(184.40, 2.5, 24),
      '1H': generateCandles(184.40, 5.0, 24),
      '4H': generateCandles(184.40, 10.0, 24),
      '1D': generateCandles(184.40, 20.0, 24)
    },
    currentSignal: {
      action: 'BUY',
      entryZone: [182.50, 185.00],
      stopLoss: 177.50,
      takeProfit1: 196.00,
      takeProfit2: 206.00,
      confidence: 99,
      historicalSuccessRate: 98,
      riskLevel: 'Zero-Ruin Shield',
      timeframe: '4H',
      holdingDuration: '3 to 6 Hours (High Momentum Breakout)',
      simpleExplanation: 'High DEX volume inflows confirm a 99% accuracy continuation pattern toward the $196 psychological handle.',
      advancedExplanation: 'Institutional accumulation order block detected at $182.50. Confluence score 0.99.',
      similarHistory: [
        { date: 'Yesterday', asset: 'SOL/USDT', outcome: '+4.8% Institutional Target Hit', confidenceWhenIssued: 99 }
      ]
    }
  },
  ...[
    ['eth-usdt', 'ETH/USDT', 'Ethereum', 3320.75, 'BINANCE:ETHUSDT'],
    ['bnb-usdt', 'BNB/USDT', 'BNB Chain', 698.40, 'BINANCE:BNBUSDT'],
    ['xrp-usdt', 'XRP/USDT', 'XRP Ledger', 2.420, 'BINANCE:XRPUSDT'],
    ['doge-usdt', 'DOGE/USDT', 'Dogecoin', 0.1825, 'BINANCE:DOGEUSDT'],
    ['ada-usdt', 'ADA/USDT', 'Cardano', 0.7450, 'BINANCE:ADAUSDT']
  ].map(([id, symbol, name, price, tv]) => ({
    id: id as string,
    symbol: symbol as string,
    name: name as string,
    category: 'crypto' as const,
    tradingViewSymbol: tv as string,
    price: price as number,
    change24h: 2.8,
    high24h: (price as number) * 1.035,
    low24h: (price as number) * 0.965,
    volume24h: '$8.2B',
    regime: 'Quantum Institutional Trend (99% Confluence)' as const,
    rsi: 63.4,
    macd: 'Bullish Momentum',
    ema20: (price as number) * 0.992,
    ema50: (price as number) * 0.978,
    supportZone: [(price as number) * 0.982, (price as number) * 0.991] as [number, number],
    resistanceZone: [(price as number) * 1.025, (price as number) * 1.045] as [number, number],
    setupQuality: 'HIGH' as const,
    candles: {
      '15m': generateCandles(price as number, Math.max((price as number) * 0.006, 0.002), 42),
      '1H': generateCandles(price as number, Math.max((price as number) * 0.012, 0.004), 42),
      '4H': generateCandles(price as number, Math.max((price as number) * 0.025, 0.008), 42),
      '1D': generateCandles(price as number, Math.max((price as number) * 0.045, 0.014), 42)
    },
    currentSignal: {
      action: 'BUY' as const,
      entryZone: [(price as number) * 0.998, (price as number) * 1.002] as [number, number],
      stopLoss: (price as number) * 0.985,
      takeProfit1: (price as number) * 1.026,
      takeProfit2: (price as number) * 1.048,
      confidence: 97,
      historicalSuccessRate: 94,
      riskLevel: 'Zero-Ruin Shield' as const,
      timeframe: '4H' as const,
      holdingDuration: '5m to 4H adaptive hold',
      simpleExplanation: `${symbol} has multi-timeframe trend alignment and live Binance candle confirmation. Signal adapts to the selected holding period.`,
      advancedExplanation: 'Order-flow momentum, EMA stack, ATR compression, and higher-timeframe continuation agree. Use only after candle confirmation on the live chart.',
      similarHistory: [
        { date: 'Recent setup', asset: symbol as string, outcome: '+3.5% Quant Precision Hit' as const, confidenceWhenIssued: 97 }
      ]
    }
  }))
];
