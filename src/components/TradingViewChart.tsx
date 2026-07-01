import React, { useEffect, useMemo, useRef } from 'react';
import { AssetData } from '../types';

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

interface TradingViewChartProps {
  asset: AssetData;
  holdingPeriod: string;
}

const intervalMap: Record<string, string> = {
  '1m': '1',
  '5m': '5',
  '10m': '10',
  '30m': '30',
  '1H': '60',
  '4H': '240'
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ asset, holdingPeriod }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerId = useMemo(() => `tv_chart_${asset.id}_${holdingPeriod}`.replace(/[^a-zA-Z0-9_]/g, '_'), [asset.id, holdingPeriod]);
  const interval = intervalMap[holdingPeriod] || '5';

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `<div id="${containerId}" class="h-full w-full"></div>`;

    const buildWidget = () => {
      if (!window.TradingView) return;
      new window.TradingView.widget({
        autosize: true,
        symbol: asset.tradingViewSymbol,
        interval,
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        enable_publishing: false,
        allow_symbol_change: true,
        hide_side_toolbar: false,
        details: true,
        hotlist: false,
        calendar: false,
        studies: ['Volume@tv-basicstudies'],
        container_id: containerId
      });
    };

    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript) {
      buildWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = buildWidget;
    document.body.appendChild(script);
  }, [asset.tradingViewSymbol, containerId, interval]);

  return (
    <div className="h-[620px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};