import React, { useState } from 'react';
import { Bell, Plus, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { MOCK_ASSETS } from '../data/mockMarkets';

export const WatchlistAlertsPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<string[]>(['btc-usdt', 'xau-usd', 'xag-usd']);
  const [activeAlerts, setActiveAlerts] = useState<{ id: string; assetSymbol: string; condition: string; status: 'Triggered' | 'Active' }[]>([
    { id: '1', assetSymbol: 'BTC/USDT', condition: 'Price crosses above $89,000 (Regime Breakout)', status: 'Active' },
    { id: '2', assetSymbol: 'XAU/USD', condition: 'Volatility Squeeze confirmed on 1H timeframe', status: 'Triggered' },
    { id: '3', assetSymbol: 'WTI/USD', condition: 'News Event Window Ends (Return to Trending state)', status: 'Active' },
  ]);

  const toggleWatchlist = (id: string) => {
    if (watchlist.includes(id)) {
      setWatchlist(watchlist.filter((i) => i !== id));
    } else {
      setWatchlist([...watchlist, id]);
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-[#0b0e14] text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2.5">
            <Bell className="w-8 h-8 text-emerald-400" />
            <span>Watchlist & Real-Time Alerts</span>
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Configure custom multi-timeframe breakout notifications and tracking.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Watchlist Grid (Cols 7) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Your Tracked Pairs ({watchlist.length})
          </h2>

          <div className="space-y-3">
            {MOCK_ASSETS.map((asset) => {
              const isTracked = watchlist.includes(asset.id);
              return (
                <div
                  key={asset.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                    isTracked
                      ? 'bg-[#121a2c] border-emerald-500/50 shadow-lg'
                      : 'bg-[#0f1420] border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleWatchlist(asset.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition ${
                        isTracked ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isTracked ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {isTracked ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">{asset.symbol}</span>
                        <span className="text-xs text-slate-400">({asset.name})</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        Regime: <span className="text-slate-200">{asset.regime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-white">${asset.price.toLocaleString()}</div>
                    <div className={`text-xs ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts Activity Log (Cols 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Active Trigger Log
            </h2>
            <button
              onClick={() => {
                setActiveAlerts([
                  {
                    id: String(Date.now()),
                    assetSymbol: 'XAG/USD',
                    condition: 'AI Setup Quality upgraded to HIGH (Confidence 82%)',
                    status: 'Active'
                  },
                  ...activeAlerts
                ]);
              }}
              className="text-xs px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate New Alert</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-white">{alert.assetSymbol}</div>
                  <div className="text-slate-300 mt-1">{alert.condition}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  alert.status === 'Triggered'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {alert.status === 'Triggered' ? '⚡ TRIGGERED' : '● MONITORING'}
                </span>
              </div>
            ))}
          </div>

          {/* Retention Feature Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Backend Push Notification Engine</span>
            </div>
            <p className="leading-relaxed">
              When an asset leaves the <strong className="text-amber-400">Avoid / Volatile</strong> regime and enters a clean breakout pattern, our background service fires immediate mobile push alerts so you never miss a pristine entry zone.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
