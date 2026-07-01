import React from 'react';
import { ArrowRight, Activity, ShieldCheck, Flame } from 'lucide-react';
import { MOCK_ASSETS } from '../data/mockMarkets';

interface TopScannerPageProps {
  onSelectAsset: (assetId: string) => void;
}

export const TopScannerPage: React.FC<TopScannerPageProps> = ({ onSelectAsset }) => {
  return (
    <div className="min-h-screen pb-28 bg-[#0b0e14] text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span>TOP OPPORTUNITIES SCANNER ENGINE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Live Multi-Timeframe Matrix</h1>
          <p className="mt-1 text-slate-400 text-sm">
            Instant AI confidence ranking across Crypto, Gold, WTI Oil & Silver. Updated every second.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-[#0f1420] px-4 py-2.5 rounded-xl border border-slate-800 font-mono">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Scanner Latency: <strong>42ms</strong></span>
          <span className="text-slate-600">|</span>
          <span>Regime Engine: <strong>ACTIVE</strong></span>
        </div>
      </div>

      {/* Top Ranked Opportunities Matrix Table */}
      <div className="mt-8 space-y-4">
        {MOCK_ASSETS.map((asset, index) => {
          const rank = index + 1;
          const isHigh = asset.setupQuality === 'HIGH';

          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isHigh
                  ? 'bg-[#12192b] border-emerald-500/40 hover:border-emerald-500 shadow-xl shadow-emerald-500/5'
                  : 'bg-[#0f1420] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Rank & Symbol */}
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl font-mono font-extrabold flex items-center justify-center text-base ${
                  rank === 1 ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' :
                  rank === 2 ? 'bg-slate-300 text-black' :
                  rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{rank}
                </div>

                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg font-bold text-white">{asset.symbol}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {asset.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isHigh ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {asset.setupQuality === 'HIGH' ? '🟢 PRIME SETUP' : '🟡 AVOID / WAIT'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{asset.name} • {asset.regime}</span>
                </div>
              </div>

              {/* Live Price & Confidence Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto text-xs font-mono">
                <div>
                  <div className="text-slate-400">Live Price:</div>
                  <div className="text-base font-bold text-white mt-0.5">${asset.price.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-slate-400">AI Confidence:</div>
                  <div className={`text-base font-bold mt-0.5 ${isHigh ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {asset.currentSignal ? `${asset.currentSignal.confidence}%` : isHigh ? '82%' : '44%'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">RSI & MACD:</div>
                  <div className="text-slate-200 font-bold mt-0.5">RSI {asset.rsi}</div>
                </div>

                <div>
                  <div className="text-slate-400">Win Rate History:</div>
                  <div className="text-teal-400 font-bold mt-0.5">
                    {asset.currentSignal ? `${asset.currentSignal.historicalSuccessRate}%` : '62%'}
                  </div>
                </div>
              </div>

              {/* Action Jump Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAsset(asset.id);
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center space-x-1.5 ${
                  isHigh
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>Analyze Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Philosophy Reminder Footer */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#121827] border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3 text-sm text-slate-300">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <strong>Why are some setups marked AVOID?</strong> Because our 6-stage regime engine detects unpredictable news sensitivity. Patience preserves capital.
          </div>
        </div>
      </div>
    </div>
  );
};
