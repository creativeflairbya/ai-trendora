import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramData, UTCTimestamp, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { AssetData } from '../types';

interface LiveMarketChartProps {
  asset: AssetData;
  holdingPeriod: string;
  onLivePriceChange?: (price: number) => void;
}

const intervalMap: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '10m': '5m',
  '30m': '30m',
  '1H': '1H',
  '4H': '4H'
};

const bitgetBaseUrl = 'https://api.bitget.com/api/v2/mix/market';
const bitgetWsUrl = 'wss://ws.bitget.com/v2/ws/public';

const formatChartPrice = (value: number) => {
  if (value >= 1000) return value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  if (value >= 10) return value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

const toCandleData = (asset: AssetData, holdingPeriod: string): CandlestickData[] => {
  const source = asset.candles['15m'] || asset.candles['1H'];
  const now = Math.floor(Date.now() / 1000);
  const step = holdingPeriod === '1m' ? 60 : holdingPeriod === '5m' ? 300 : holdingPeriod === '30m' ? 1800 : 900;
  return source.slice(-70).map((candle, index) => ({
    time: (now - (source.length - index) * step) as UTCTimestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close
  }));
};

export const LiveMarketChart: React.FC<LiveMarketChartProps> = ({ asset, holdingPeriod, onLivePriceChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastCandleRef = useRef<CandlestickData | null>(null);
  const [livePrice, setLivePrice] = useState(asset.price);
  const [isLive, setIsLive] = useState(false);
  const [feedLabel, setFeedLabel] = useState('initializing');

  const candles = useMemo(() => toCandleData(asset, holdingPeriod), [asset, holdingPeriod]);
  const volumeData = useMemo<HistogramData[]>(() => candles.map((candle, index) => ({
    time: candle.time as UTCTimestamp,
    value: asset.candles['15m'][index % asset.candles['15m'].length]?.volume || 1000,
    color: candle.close >= candle.open ? 'rgba(13, 148, 136, 0.45)' : 'rgba(239, 68, 68, 0.45)'
  })), [asset, candles]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#111827',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      },
      grid: {
        vertLines: { color: '#edf0f2' },
        horzLines: { color: '#edf0f2' }
      },
      rightPriceScale: {
        visible: true,
        borderColor: '#e5e7eb'
      },
      timeScale: {
        borderColor: '#e5e7eb',
        timeVisible: true,
        secondsVisible: holdingPeriod === '1m'
      },
      crosshair: { mode: 1 }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#f23645',
      borderDownColor: '#f23645',
      borderUpColor: '#089981',
      wickDownColor: '#f23645',
      wickUpColor: '#089981',
      priceFormat: { type: 'price', precision: asset.price >= 10 ? 3 : 4, minMove: asset.price >= 10 ? 0.001 : 0.0001 }
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: ''
    });
    chart.priceScale('').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    candleSeries.setData(candles);
    volumeSeries.setData(volumeData);
    lastCandleRef.current = candles[candles.length - 1] || null;
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [asset.id, asset.price, candles, holdingPeriod, volumeData]);

  useEffect(() => {
    setLivePrice(asset.price);
    setIsLive(false);
    setFeedLabel('initializing');
    onLivePriceChange?.(asset.price);

    wsRef.current?.close();
    const bitgetSymbol = asset.bitgetSymbol;
    const interval = intervalMap[holdingPeriod] || '5m';

    if (bitgetSymbol) {
      let cancelled = false;
      const symbol = bitgetSymbol;

      const hydrateFromBitget = async () => {
        try {
          const [klinesRes, tickerRes] = await Promise.all([
            fetch(`${bitgetBaseUrl}/candles?symbol=${symbol}&productType=USDT-FUTURES&granularity=${interval}&limit=300`, { cache: 'no-store' }),
            fetch(`${bitgetBaseUrl}/ticker?symbol=${symbol}&productType=USDT-FUTURES`, { cache: 'no-store' })
          ]);
          if (!klinesRes.ok || !tickerRes.ok) throw new Error('Bitget REST unavailable');
          const klinesPayload = await klinesRes.json();
          const tickerPayload = await tickerRes.json();
          if (cancelled) return;

          const klines = Array.isArray(klinesPayload.data) ? klinesPayload.data : [];
          const ticker = Array.isArray(tickerPayload.data) ? tickerPayload.data[0] : tickerPayload.data;

          const liveCandles: CandlestickData[] = klines
            .map((row: Array<string | number>): CandlestickData => ({
              time: Math.floor(Number(row[0]) / 1000) as UTCTimestamp,
              open: Number(row[1]),
              high: Number(row[2]),
              low: Number(row[3]),
              close: Number(row[4])
            }))
            .sort((a: CandlestickData, b: CandlestickData) => Number(a.time) - Number(b.time));
          const liveVolume: HistogramData[] = klines.map((row: Array<string | number>): HistogramData => {
            const open = Number(row[1]);
            const close = Number(row[4]);
            return {
              time: Math.floor(Number(row[0]) / 1000) as UTCTimestamp,
              value: Number(row[5]),
              color: close >= open ? 'rgba(13, 148, 136, 0.45)' : 'rgba(239, 68, 68, 0.45)'
            };
          }).sort((a: HistogramData, b: HistogramData) => Number(a.time) - Number(b.time));
          candleSeriesRef.current?.setData(liveCandles);
          volumeSeriesRef.current?.setData(liveVolume);
          chartRef.current?.timeScale().fitContent();
          lastCandleRef.current = liveCandles[liveCandles.length - 1] || null;

          const price = Number(ticker?.lastPr || ticker?.markPrice || lastCandleRef.current?.close || asset.price);
          setLivePrice(price);
          setFeedLabel('Bitget futures REST synced');
          onLivePriceChange?.(price);
        } catch {
          setFeedLabel('Bitget fallback candles');
        }

        if (cancelled) return;
        const ws = new WebSocket(bitgetWsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
          setIsLive(true);
          setFeedLabel('Bitget futures live stream');
          ws.send(JSON.stringify({
            op: 'subscribe',
            args: [
              { instType: 'USDT-FUTURES', channel: `candle${interval}`, instId: symbol },
              { instType: 'USDT-FUTURES', channel: 'ticker', instId: symbol },
              { instType: 'USDT-FUTURES', channel: 'trade', instId: symbol }
            ]
          }));
        };
        ws.onclose = () => setIsLive(false);
        ws.onerror = () => {
          setIsLive(false);
          setFeedLabel('Bitget stream reconnect needed');
        };
        ws.onmessage = (event) => {
          if (event.data === 'pong') return;
          const payload = JSON.parse(event.data);
          if (payload.event) return;
          const data = payload.data || [];
          const channel = payload.arg?.channel || '';

          if (channel.startsWith('candle') && data.length > 0) {
            const k = data[data.length - 1];
            const candle: CandlestickData = {
              time: Math.floor(Number(k[0]) / 1000) as UTCTimestamp,
              open: Number(k[1]),
              high: Number(k[2]),
              low: Number(k[3]),
              close: Number(k[4])
            };
            const volume: HistogramData = {
              time: candle.time as UTCTimestamp,
              value: Number(k[5]),
              color: candle.close >= candle.open ? 'rgba(13, 148, 136, 0.45)' : 'rgba(239, 68, 68, 0.45)'
            };
            lastCandleRef.current = candle;
            candleSeriesRef.current?.update(candle);
            volumeSeriesRef.current?.update(volume);
            setLivePrice(candle.close);
            onLivePriceChange?.(candle.close);
          }

          if (channel === 'ticker' && data.length > 0) {
            const ticker = data[0];
            const price = Number(ticker.lastPr || ticker.markPrice || ticker.bidPr || ticker.askPr);
            if (Number.isFinite(price)) {
              setLivePrice(price);
              onLivePriceChange?.(price);
            }
          }

          if (channel === 'trade' && data.length > 0 && lastCandleRef.current) {
            const lastTrade = data[data.length - 1];
            const tradePrice = Number(lastTrade.price || lastTrade.p || lastTrade[1]);
            if (!Number.isFinite(tradePrice)) return;
            const updatedCandle: CandlestickData = {
              ...lastCandleRef.current,
              high: Math.max(lastCandleRef.current.high, tradePrice),
              low: Math.min(lastCandleRef.current.low, tradePrice),
              close: tradePrice
            };
            lastCandleRef.current = updatedCandle;
            candleSeriesRef.current?.update(updatedCandle);
            setLivePrice(tradePrice);
            onLivePriceChange?.(tradePrice);
          }
        };

        const pingTimer = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 25000);

        ws.addEventListener('close', () => window.clearInterval(pingTimer));
      };

      hydrateFromBitget();
      return () => {
        cancelled = true;
        wsRef.current?.close();
      };
    }
  }, [asset, holdingPeriod, onLivePriceChange]);

  return (
    <div className="relative h-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 text-slate-950 backdrop-blur">
        <div>
          <div className="text-sm font-extrabold">{asset.symbol}</div>
          <div className="font-mono text-[11px] text-slate-500">Hold {holdingPeriod} | {asset.name}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-2xl font-extrabold text-red-500">{formatChartPrice(livePrice)}</div>
            <div className="text-[11px] text-slate-500">chart feed price</div>
          </div>
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isLive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>BITGET LIVE</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="h-full w-full pt-12" />
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 shadow">
        <Activity className="h-3.5 w-3.5 text-emerald-500" />
        <span>{feedLabel} | candles update continuously with selected holding timeframe</span>
      </div>
    </div>
  );
};