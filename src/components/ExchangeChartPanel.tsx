import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { AssetData, Timeframe } from '../types';

interface ExchangeChartPanelProps {
  asset: AssetData;
  timeframe: Timeframe;
  holdingPeriod: string;
  onLivePriceChange: (price: number | null) => void;
}

const wsUrl = 'wss://ws.bitget.com/v2/ws/public';
const bitgetTickerUrl = 'https://api.bitget.com/api/v2/mix/market/ticker';

const timeframeToInterval: Record<Timeframe, string> = {
  '15m': '15',
  '1H': '60',
  '4H': '240',
  '1D': 'D'
};

const tvSymbolMap: Record<string, string> = {
  BTCUSDT: 'BITGET:BTCUSDT.P',
  ETHUSDT: 'BITGET:ETHUSDT.P',
  SOLUSDT: 'BITGET:SOLUSDT.P',
  BNBUSDT: 'BITGET:BNBUSDT.P',
  XRPUSDT: 'BITGET:XRPUSDT.P',
  DOGEUSDT: 'BITGET:DOGEUSDT.P',
  ADAUSDT: 'BITGET:ADAUSDT.P',
  XAUUSDT: 'BITGET:XAUUSDT.P',
  XAGUSDT: 'BITGET:XAGUSDT.P',
  CLUSDT: 'BITGET:CLUSDT.P',
  BZUSDT: 'BITGET:BZUSDT.P',
  NATGASUSDT: 'BITGET:NATGASUSDT.P'
};

const formatPrice = (value: number | null) => {
  if (value === null) return 'Connecting...';
  if (value >= 1000) return value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  if (value >= 10) return value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

export const ExchangeChartPanel: React.FC<ExchangeChartPanelProps> = ({ asset, timeframe, holdingPeriod, onLivePriceChange }) => {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('connecting to Bitget ticker');
  const wsRef = useRef<WebSocket | null>(null);

  const tvSymbol = tvSymbolMap[asset.bitgetSymbol] || `BITGET:${asset.bitgetSymbol}.P`;
  const interval = timeframeToInterval[timeframe] || '15';
  const iframeUrl = useMemo(() => {
    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval,
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      hide_side_toolbar: false,
      allow_symbol_change: false,
      calendar: false,
      withdateranges: true,
      studies: ['Volume@tv-basicstudies'],
      support_host: 'https://www.tradingview.com'
    };
    return `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
  }, [interval, tvSymbol]);

  useEffect(() => {
    setLivePrice(null);
    setConnected(false);
    setStatus('connecting to Bitget ticker');
    onLivePriceChange(null);
    wsRef.current?.close();

    const updateFromRest = async () => {
      try {
        const res = await fetch(`${bitgetTickerUrl}?symbol=${asset.bitgetSymbol}&productType=USDT-FUTURES`, { cache: 'no-store' });
        if (!res.ok) return;
        const payload = await res.json();
        const ticker = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        const price = Number(ticker?.lastPr || ticker?.markPrice || ticker?.bidPr || ticker?.askPr);
        if (Number.isFinite(price) && price > 0) {
          setLivePrice(price);
          setStatus('Bitget REST ticker active');
          onLivePriceChange(price);
        }
      } catch {
        // WebSocket remains the primary live path.
      }
    };

    updateFromRest();
    const restTimer = window.setInterval(updateFromRest, 1500);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setStatus('Bitget ticker connected');
      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [
          { instType: 'USDT-FUTURES', channel: 'ticker', instId: asset.bitgetSymbol },
          { instType: 'USDT-FUTURES', channel: 'trade', instId: asset.bitgetSymbol }
        ]
      }));
    };

    ws.onerror = () => {
      setConnected(false);
      setStatus('Bitget ticker connection failed');
      onLivePriceChange(null);
    };
    ws.onclose = () => {
      setConnected(false);
      setStatus('Bitget ticker disconnected');
    };
    ws.onmessage = (event) => {
      if (event.data === 'pong') return;
      const payload = JSON.parse(event.data);
      if (payload.event) return;
      const channel = payload.arg?.channel || '';
      const data = Array.isArray(payload.data) ? payload.data : [];
      let price: number | null = null;

      if (channel === 'ticker' && data[0]) {
        price = Number(data[0].lastPr || data[0].markPrice || data[0].bidPr || data[0].askPr);
      }
      if (channel === 'trade' && data.length) {
        const trade = data[data.length - 1];
        price = Number(trade.price || trade.p || trade[1]);
      }

      if (price && Number.isFinite(price)) {
        setLivePrice(price);
        setStatus('Bitget live ticker active');
        onLivePriceChange(price);
      }
    };

    const ping = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping');
    }, 25000);

    return () => {
      window.clearInterval(restTimer);
      window.clearInterval(ping);
      ws.close();
    };
  }, [asset.bitgetSymbol, onLivePriceChange]);

  const openNativeChart = () => {
    window.open(`https://www.bitget.com/futures/usdt/${asset.bitgetSymbol}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1420] shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <div className="text-lg font-extrabold text-white">{asset.symbol}</div>
          <div className="font-mono text-xs text-slate-400">{timeframe} chart | Hold {holdingPeriod} | {tvSymbol}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-2xl font-extrabold text-rose-400">{formatPrice(livePrice)}</div>
            <div className="text-[11px] text-slate-500">Bitget live ticker</div>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? 'LIVE' : 'WAIT'}
          </span>
          <button
            onClick={openNativeChart}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
          >
            <ExternalLink className="mr-1 inline h-3.5 w-3.5" /> Bitget
          </button>
        </div>
      </div>
      <div className="h-[640px] bg-white">
        <iframe title={`${asset.symbol} exchange chart`} src={iframeUrl} className="h-full w-full border-0" allowFullScreen />
      </div>
      <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-2 text-[11px] font-bold text-slate-400">
        <Activity className="h-3.5 w-3.5 text-emerald-400" />
        <span>{status}. Signal levels use this Bitget ticker; chart is hosted exchange-grade view.</span>
      </div>
    </div>
  );
};