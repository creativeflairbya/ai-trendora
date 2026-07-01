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
  '10m': '15m',
  '30m': '30m',
  '1H': '1h',
  '4H': '4h'
};

const cryptoMap: Record<string, string> = {
  'btc-usdt': 'btcusdt',
  'eth-usdt': 'ethusdt',
  'sol-usdt': 'solusdt',
  'bnb-usdt': 'bnbusdt',
  'xrp-usdt': 'xrpusdt',
  'doge-usdt': 'dogeusdt',
  'ada-usdt': 'adausdt'
};

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
  const [livePrice, setLivePrice] = useState(asset.price);
  const [isLive, setIsLive] = useState(false);

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
    onLivePriceChange?.(asset.price);

    wsRef.current?.close();
    const cryptoSymbol = cryptoMap[asset.id];
    const interval = intervalMap[holdingPeriod] || '5m';

    if (cryptoSymbol) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${cryptoSymbol}@kline_${interval}`);
      wsRef.current = ws;
      ws.onopen = () => setIsLive(true);
      ws.onclose = () => setIsLive(false);
      ws.onerror = () => setIsLive(false);
      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const k = payload.k;
        const candle: CandlestickData = {
          time: Math.floor(k.t / 1000) as UTCTimestamp,
          open: Number(k.o),
          high: Number(k.h),
          low: Number(k.l),
          close: Number(k.c)
        };
        const volume: HistogramData = {
          time: candle.time as UTCTimestamp,
          value: Number(k.v),
          color: candle.close >= candle.open ? 'rgba(13, 148, 136, 0.45)' : 'rgba(239, 68, 68, 0.45)'
        };
        candleSeriesRef.current?.update(candle);
        volumeSeriesRef.current?.update(volume);
        setLivePrice(candle.close);
        onLivePriceChange?.(candle.close);
      };
      return () => ws.close();
    }

    // Commodity fallback: keeps candles moving until your paid metals/commodities feed is connected.
    const timer = window.setInterval(() => {
      setLivePrice((previous) => {
        const drift = previous * (Math.random() - 0.48) * 0.00045;
        const next = Number((previous + drift).toFixed(asset.price >= 10 ? 3 : 4));
        const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
        const candle: CandlestickData = {
          time: now,
          open: previous,
          high: Math.max(previous, next) + Math.abs(drift) * 0.7,
          low: Math.min(previous, next) - Math.abs(drift) * 0.7,
          close: next
        };
        candleSeriesRef.current?.update(candle);
        volumeSeriesRef.current?.update({
          time: now,
          value: Math.floor(Math.random() * 5000 + 900),
          color: next >= previous ? 'rgba(13, 148, 136, 0.45)' : 'rgba(239, 68, 68, 0.45)'
        });
        onLivePriceChange?.(next);
        return next;
      });
    }, holdingPeriod === '1m' ? 1200 : 1800);

    return () => window.clearInterval(timer);
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
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${isLive || asset.category !== 'crypto' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isLive || asset.category !== 'crypto' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{asset.category === 'crypto' ? 'BINANCE LIVE' : 'LIVE FEED READY'}</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="h-full w-full pt-12" />
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 shadow">
        <Activity className="h-3.5 w-3.5 text-emerald-500" />
        <span>Candles update continuously with selected holding timeframe</span>
      </div>
    </div>
  );
};