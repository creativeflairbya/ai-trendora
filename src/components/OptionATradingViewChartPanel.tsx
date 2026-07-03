import React, { useEffect, useMemo, useRef } from 'react';
import { AssetData, Timeframe } from '../types';

interface OptionATradingViewChartPanelProps {
  asset: AssetData;
  timeframe: Timeframe;
  holdingPeriod: string;
  onLivePriceChange: (price: number | null) => void;
}

const timeframeToTradingViewInterval: Record<Timeframe, string> = {
  '15m': '15',
  '1H': '60',
  '4H': '240',
  '1D': 'D'
};

const bitgetWsUrl = 'wss://ws.bitget.com/v2/ws/public';
const bitgetTickerUrl = 'https://api.bitget.com/api/v2/mix/market/ticker';

const tradingViewSymbolMap: Record<string, string> = {
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

export const OptionATradingViewChartPanel: React.FC<OptionATradingViewChartPanelProps> = ({
  asset,
  timeframe,
  onLivePriceChange
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const tvSymbol = tradingViewSymbolMap[asset.bitgetSymbol] || asset.bitgetSymbol;
  const tvInterval = timeframeToTradingViewInterval[timeframe] || '15';

  const chartUrl = useMemo(() => {
    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      withdateranges: true,
      range: '1D',
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: true,
      details: true,
      hotlist: true,
      calendar: true,
      hide_legend: false,
      toolbar_bg: '#f1f3f6',
      studies: ['Volume@tv-basicstudies'],
      watchlist: ['BITGET:BTCUSDT.P', 'BITGET:ETHUSDT.P', 'BITGET:SOLUSDT.P', 'BITGET:XAUUSDT.P', 'BITGET:XAGUSDT.P', 'BITGET:CLUSDT.P', 'BITGET:NATGASUSDT.P'],
      show_popup_button: true,
      popup_width: '1200',
      popup_height: '800',
      support_host: 'https://www.tradingview.com'
    };
    return `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
  }, [tvInterval, tvSymbol]);

  useEffect(() => {
    onLivePriceChange(null);
    wsRef.current?.close();

    const updateFromRest = async () => {
      try {
        const res = await fetch(`${bitgetTickerUrl}?symbol=${asset.bitgetSymbol}&productType=USDT-FUTURES`, { cache: 'no-store' });
        if (!res.ok) return;
        const payload = await res.json();
        const ticker = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        const price = Number(ticker?.lastPr || ticker?.markPrice || ticker?.bidPr || ticker?.askPr);
        if (Number.isFinite(price) && price > 0) onLivePriceChange(price);
      } catch {
        // Keep silent; websocket can still provide updates.
      }
    };

    updateFromRest();
    const restTimer = window.setInterval(updateFromRest, 1500);

    const ws = new WebSocket(bitgetWsUrl);
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [
          { instType: 'USDT-FUTURES', channel: 'ticker', instId: asset.bitgetSymbol },
          { instType: 'USDT-FUTURES', channel: 'trade', instId: asset.bitgetSymbol }
        ]
      }));
    };
    ws.onerror = () => onLivePriceChange(null);
    ws.onclose = () => onLivePriceChange(null);
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
      if (price && Number.isFinite(price)) onLivePriceChange(price);
    };

    const pingTimer = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping');
    }, 25000);

    return () => {
      window.clearInterval(restTimer);
      window.clearInterval(pingTimer);
      ws.close();
    };
  }, [asset.bitgetSymbol, onLivePriceChange]);

  return (
    <div className="h-[760px] overflow-hidden rounded-2xl border border-slate-800 bg-white shadow-xl">
      <iframe
        title={`${asset.symbol} TradingView Advanced Chart`}
        src={chartUrl}
        className="h-full w-full border-0"
        allowFullScreen
      />
    </div>
  );
};