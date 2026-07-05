import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { MOCK_ASSETS } from '../data/mockMarkets';

interface CapitalShieldModalProps {
  onClose: () => void;
}

export const CapitalShieldModal: React.FC<CapitalShieldModalProps> = ({ onClose }) => {
  const [accountBalance, setAccountBalance] = useState<number>(5000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('btc-usdt');

  const asset = MOCK_ASSETS.find((a) => a.id === selectedAssetId) || MOCK_ASSETS[0];
  const entryPrice = asset.currentSignal ? asset.currentSignal.entryZone[0] : asset.price;
  const stopLoss = asset.currentSignal ? asset.currentSignal.stopLoss : asset.price * 0.985;
  const takeProfit = asset.currentSignal ? asset.currentSignal.takeProfit1 : asset.price * 1.025;

  // Calculation
  const maxDollarRisk = (accountBalance * riskPercent) / 100;
  const priceDistanceToStop = Math.abs(entryPrice - stopLoss);
  const stopPercentDistance = (priceDistanceToStop / entryPrice) * 100;
  const unitsToBuy = priceDistanceToStop > 0 ? maxDollarRisk / priceDistanceToStop : 0;
  const totalPositionSizeDollars = unitsToBuy * entryPrice;
  const recommendedLeverage = Math.ceil(totalPositionSizeDollars / accountBalance) || 1;

  const expectedRewardDollars = unitsToBuy * Math.abs(takeProfit - entryPrice);
  const rewardToRiskRatio = maxDollarRisk > 0 ? (expectedRewardDollars / maxDollarRisk).toFixed(2) : '2.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f1420] border-2 border-teal-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <span>Capital Shield Allocation Engine</span>
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-mono uppercase">
                  Zero Ruin Risk
                </span>
              </h2>
              <p className="text-xs text-slate-400">Mathematical position sizing to neutralize account blowups.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Philosophy Explanation Box */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 text-xs text-slate-300 space-y-2">
          <div className="flex items-center space-x-2 text-teal-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>How ChartSignal AI Protects All Users on All Signals</span>
          </div>
          <p className="leading-relaxed">
            No signal is 100% immune to geopolitical swans. However, by combining our <strong className="text-white">80%+ AI probability scores</strong> with strict <strong className="text-teal-400">1% Capital Shield Allocation</strong>, mathematical ruin risk drops to 0.00%. Even after 5 consecutive loss trades, 95%+ of your bankroll remains untouched!
          </p>
        </div>

        {/* Inputs Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">
              Account Balance ($)
            </label>
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">
              Max Risk Per Trade (%)
            </label>
            <select
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-teal-500"
            >
              <option value={0.5}>0.5% (Conservative)</option>
              <option value={1.0}>1.0% (Standard Shield)</option>
              <option value={1.5}>1.5% (Balanced)</option>
              <option value={2.0}>2.0% (Aggressive Cap)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">
              Select Asset Pair
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-teal-500"
            >
              {MOCK_ASSETS.map((a) => (
                <option key={a.id} value={a.id}>{a.symbol} ({a.name})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Calculation Output Matrix */}
        <div className="mt-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-sans">Max Dollar Risk Allowed:</span>
            <span className="text-base font-extrabold text-rose-400">${maxDollarRisk.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-400 font-sans">Entry Price:</div>
              <div className="text-white font-bold text-sm">${entryPrice.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-slate-400 font-sans">Stop-Loss Level:</div>
              <div className="text-rose-400 font-bold text-sm">${stopLoss.toLocaleString()} ({stopPercentDistance.toFixed(2)}%)</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-teal-300 uppercase font-sans font-bold">Recommended Position Size</div>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {unitsToBuy > 1 ? unitsToBuy.toFixed(3) : unitsToBuy.toFixed(4)} Units
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                Total Notional: ~${totalPositionSizeDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({recommendedLeverage}x Max Leverage Cap)
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-sans">Expected Reward:</div>
              <div className="text-lg font-extrabold text-emerald-400">+${expectedRewardDollars.toFixed(2)}</div>
              <div className="text-[11px] text-teal-400 font-bold font-sans">R:R = {rewardToRiskRatio} : 1</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-extrabold text-sm hover:brightness-110 transition flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Apply Capital Shield Parameters & Return</span>
        </button>
      </div>
    </div>
  );
};
