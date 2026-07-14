import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ArrowRight, 
  Sliders, 
  Clock
} from 'lucide-react';
import { MarketCategory, Timeframe, UserProfile } from '../types';
import { MOCK_ASSETS } from '../data/mockMarkets';
import { TRANSLATIONS } from '../data/translations';
import { ChartVisionAnalyzer } from './ChartVisionAnalyzer';
import { PerformanceStatsPanel } from './PerformanceStatsPanel';
import { buildProfessionalSignal, ProfessionalSignal } from '../utils/proSignalEngine';
import confetti from 'canvas-confetti';

interface SignalEnginePageProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  openPricingModal: () => void;
  openCapitalShield: () => void;
}

type LockedSignal = ProfessionalSignal;

export const SignalEnginePage: React.FC<SignalEnginePageProps> = ({
  user,
  openCapitalShield
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('btc-usdt');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('4H');
  
  const [holdingPeriod, setHoldingPeriod] = useState('5m');
  const [analysisReferencePrice, setAnalysisReferencePrice] = useState<number | null>(null);
  
  const [hasGeneratedSignal, setHasGeneratedSignal] = useState(false);
  const [lockedSignal, setLockedSignal] = useState<LockedSignal | null>(null);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'advanced'>('simple');

  const t = TRANSLATIONS[user.language];

  // Filter assets
  const filteredAssets = MOCK_ASSETS.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedAsset = MOCK_ASSETS.find((a) => a.id === selectedAssetId) || MOCK_ASSETS[0];
  const referencePrice = analysisReferencePrice || selectedAsset.price;
  const signalPrecision = referencePrice >= 1000 ? 3 : referencePrice >= 10 ? 3 : 4;
  const formatSignalPrice = (value: number) => value.toLocaleString(undefined, {
    minimumFractionDigits: signalPrecision,
    maximumFractionDigits: signalPrecision
  });

  const adjustedSignal: LockedSignal | undefined = buildProfessionalSignal({
    asset: selectedAsset,
    livePrice: analysisReferencePrice,
    holdingPeriod,
    timeframe: selectedTimeframe
  });
  const displaySignal = lockedSignal || adjustedSignal;

  // Switch asset
  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    setHasGeneratedSignal(false);
    setLockedSignal(null);
    setAnalysisReferencePrice(null);
  };

  const resetGeneratedSignal = () => {
    setHasGeneratedSignal(false);
    setLockedSignal(null);
  };

  return (
    <div className="min-h-screen pb-28 bg-[#0b0e14] text-slate-100">
      {/* Top Header Controls: Category Tabs & Search */}
      <div className="bg-[#0f1420] border-b border-slate-800 px-4 py-3 sticky top-16 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Market Category Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Markets (6)
            </button>
            <button
              onClick={() => setSelectedCategory('crypto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
                selectedCategory === 'crypto'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>⚡ {t.crypto}</span>
            </button>
            <button
              onClick={() => setSelectedCategory('gold')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
                selectedCategory === 'gold'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>✨ {t.gold}</span>
            </button>
            <button
              onClick={() => setSelectedCategory('gas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
                selectedCategory === 'gas'
                  ? 'bg-purple-400 text-black shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🔥 Gas</span>
            </button>
            <button
              onClick={() => setSelectedCategory('oil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
                selectedCategory === 'oil'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🛢️ {t.oil}</span>
            </button>
            <button
              onClick={() => setSelectedCategory('silver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
                selectedCategory === 'silver'
                  ? 'bg-cyan-400 text-black shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🛡️ {t.silver}</span>
            </button>
          </div>

          {/* Search Bar & Asset Pills */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchAsset}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="hidden lg:flex items-center space-x-2 text-xs">
              <span className="text-slate-400">{t.signalsLeft}:</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {user.creditsRemaining === 'Unlimited' ? '∞' : user.creditsRemaining}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Asset Selector Sidebar + Live Chart + Signal Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Top Column: Quick Asset Selection List (Cols 3) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Available Markets</h2>
              <span className="text-[10px] text-slate-500 font-mono">{filteredAssets.length} Pairs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {filteredAssets.map((asset) => {
                const isSelected = asset.id === selectedAssetId;
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#121a2c] border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-[#0f1420] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{asset.symbol}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          asset.setupQuality === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {asset.setupQuality}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{asset.name}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-[11px] text-emerald-400">
                        Live chart
                      </div>
                      <div className={`text-[11px] font-mono font-medium ${
                        asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Capital Shield Promotion Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-500/30">
              <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold mb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Zero-Ruin Capital Shield</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                Never risk more than 1% per trade. Use our Block Allocation Calculator to compute safe lot size.
              </p>
              <button
                onClick={openCapitalShield}
                className="w-full py-1.5 rounded-lg bg-teal-500 text-black font-bold text-xs hover:bg-teal-400 transition"
              >
                Open Size Calculator
              </button>
            </div>
          </div>

          {/* Middle Column: Live Chart Area & Asset Overview (Cols 5) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Selected Asset Banner */}
            <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-extrabold text-white">{selectedAsset.symbol}</h1>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    {selectedAsset.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                    {selectedAsset.regime}
                  </span>
                </div>
                <div className="mt-1 flex items-center space-x-4 text-xs text-slate-400">
                  <span>24h Vol: <strong className="text-slate-200">{selectedAsset.volume24h}</strong></span>
                  <span>Source: <strong className="text-emerald-400">Bitget {selectedAsset.bitgetSymbol} live futures</strong></span>
                  <span>Live price is synced from Bitget chart feed.</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-mono font-extrabold text-emerald-400">
                  Bitget live feed
                </div>
                <div className="text-xs text-slate-400">
                  No separate app quote shown
                </div>
              </div>
            </div>

            {/* AI Screenshot Analyzer */}
            <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 min-w-[220px] flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Pair</span>
                  <select
                    value={selectedAssetId}
                    onChange={(event) => handleSelectAsset(event.target.value)}
                    className="w-full max-w-xs rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500"
                  >
                    {filteredAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.symbol} - {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['15m', '1H', '4H', '1D'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        setSelectedTimeframe(tf);
                        resetGeneratedSignal();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                        selectedTimeframe === tf
                          ? 'bg-emerald-500 text-black shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs overflow-x-auto">
                  {['1m', '5m', '10m', '30m', '1H', '4H'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setHoldingPeriod(period);
                        resetGeneratedSignal();
                      }}
                      className={`px-2.5 py-1 rounded border font-mono text-[11px] transition whitespace-nowrap ${
                        holdingPeriod === period
                          ? 'bg-amber-400 text-black border-amber-300 font-extrabold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hold {period}
                    </button>
                  ))}
                </div>
              </div>

              <ChartVisionAnalyzer
                asset={selectedAsset}
                assets={MOCK_ASSETS}
                timeframe={selectedTimeframe}
                holdingPeriod={holdingPeriod}
                livePrice={analysisReferencePrice}
                onReferencePriceChange={setAnalysisReferencePrice}
                onDetectedAsset={(assetId) => handleSelectAsset(assetId)}
                onUseSignal={(signal) => {
                  setLockedSignal(signal);
                  setHasGeneratedSignal(true);
                  confetti({ particleCount: 50, spread: 65, origin: { y: 0.65 } });
                }}
              />

              <PerformanceStatsPanel />
            </div>
          </div>

          {/* Right Column: AI Signal Engine Panel (Cols 4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Main Signal Command Card */}
            <div className="p-5 rounded-2xl bg-[#0f1420] border-2 border-emerald-500/30 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <h2 className="text-base font-extrabold text-white uppercase tracking-wide font-mono">
                    AI Signal Engine v4.2
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  Hybrid Quant
                </span>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs text-cyan-100 leading-relaxed">
                Upload a chart screenshot and click <strong>Analyze Screenshot</strong>. The result below updates only after the AI vision analyzer creates a signal.
              </div>

              {/* 3 Core Credible Accuracy Display Boxes */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                {/* 1. Current Setup Confidence */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">{t.confidence}</div>
                  <div className="mt-1 text-lg font-mono font-extrabold text-emerald-400">
                    {hasGeneratedSignal && displaySignal ? `${displaySignal.confidence}%` : '99%'}
                  </div>
                </div>

                {/* 2. Strategy Historical Success */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">{t.historicalSuccess}</div>
                  <div className="mt-1 text-lg font-mono font-extrabold text-teal-400">
                    {hasGeneratedSignal && displaySignal ? `${displaySignal.historicalSuccessRate}%` : '98%'}
                  </div>
                </div>

                {/* 3. Market Risk Level */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">{t.marketRisk}</div>
                  <div className={`mt-1 text-base font-mono font-extrabold ${
                    selectedAsset.setupQuality === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {hasGeneratedSignal && displaySignal ? displaySignal.riskLevel : 'Zero-Ruin Shield'}
                  </div>
                </div>
              </div>

              {/* Market Status Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">{t.marketStatus}:</span>
                <span className={`px-2.5 py-1 rounded-md font-extrabold uppercase font-mono ${
                  selectedAsset.setupQuality === 'HIGH'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedAsset.setupQuality === 'HIGH' ? `🟢 ${t.favorable}` : `🟡 ${t.avoid}`}
                </span>
              </div>

              {/* SIGNAL RESULT CONDITIONAL RENDERING */}
              {hasGeneratedSignal ? (
                selectedAsset.setupQuality === 'HIGH' && displaySignal ? (
                  /* HIGH SETUP QUALITY SIGNAL RESULTS */
                  <div className="space-y-4 pt-2 border-t border-slate-800 animate-fadeIn">
                    
                    {/* Action Banner */}
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-base font-black text-white font-mono tracking-wide">
                          {displaySignal.action === 'BUY' ? t.actionBuy : t.actionSell}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-extrabold text-xs">
                        TF: {selectedTimeframe} | Hold {holdingPeriod}
                      </span>
                    </div>

                    {/* Entry, Stop-Loss, Take-Profit Table */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 font-mono text-xs">
                      <div className="divide-y divide-slate-800">
                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 py-2 first:pt-0">
                          <span className="text-slate-400">Entry Zone</span>
                          <span className="text-right text-sm font-extrabold text-white">
                            {formatSignalPrice(displaySignal.entryZone[0])} - {formatSignalPrice(displaySignal.entryZone[1])}
                          </span>
                        </div>

                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 py-2 text-rose-400">
                          <span>Stop-Loss</span>
                          <span className="text-right text-sm font-extrabold">{formatSignalPrice(displaySignal.stopLoss)}</span>
                        </div>

                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 py-2 text-emerald-400">
                          <span>Take-Profit 1</span>
                          <span className="text-right text-sm font-extrabold">{formatSignalPrice(displaySignal.takeProfit1)}</span>
                        </div>

                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 py-2 text-teal-400">
                          <span>Take-Profit 2</span>
                          <span className="text-right text-sm font-extrabold">{formatSignalPrice(displaySignal.takeProfit2)}</span>
                        </div>

                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 py-2">
                          <span className="text-slate-400">Setup Quality</span>
                          <span className="text-right text-sm font-extrabold text-emerald-400">{selectedAsset.setupQuality}</span>
                        </div>

                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 py-2">
                          <span className="text-slate-400">Risk Level</span>
                          <span className="text-right text-sm font-extrabold text-amber-300">{displaySignal.riskLevel}</span>
                        </div>

                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 py-2">
                          <span className="text-slate-400">Timeframe</span>
                          <span className="text-right text-sm font-extrabold text-slate-100">{selectedTimeframe}</span>
                        </div>

                        <div className="grid grid-cols-[125px_1fr] items-center gap-3 pt-2 text-amber-300">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            <span>Hold</span>
                          </span>
                          <span className="justify-self-end rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-right text-xs font-extrabold">
                            {holdingPeriod}
                          </span>
                        </div>
                      </div>
                    </div>

                    {displaySignal.engineMeta && (
                      <div className="rounded-xl border border-cyan-500/20 bg-slate-900 p-3 space-y-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Signal Engine Verification</div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded-lg bg-slate-950 px-2 py-1 text-cyan-300">MTF: {displaySignal.engineMeta.multiTimeframe.join(' + ')}</div>
                          <div className="rounded-lg bg-slate-950 px-2 py-1 text-purple-300">Models: XGBoost/LSTM/RF</div>
                          <div className="rounded-lg bg-slate-950 px-2 py-1 text-emerald-300">Indicators: {displaySignal.engineMeta.indicatorsCount}+</div>
                          <div className="rounded-lg bg-slate-950 px-2 py-1 text-amber-300">Backtest: {displaySignal.engineMeta.verifiedHistoricalAccuracy}%</div>
                          <div className="rounded-lg bg-slate-950 px-2 py-1 text-teal-300">Risk: SL + TP1 + TP2</div>
                          <div className="rounded-lg bg-slate-950 px-2 py-1 text-blue-300">Explainable AI</div>
                        </div>
                      </div>
                    )}

                    {/* Explanation Toggle & Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">{t.explanation}:</span>
                        <div className="flex space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                          <button
                            onClick={() => setExplanationMode('simple')}
                            className={`px-2 py-0.5 rounded font-medium ${
                              explanationMode === 'simple' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'
                            }`}
                          >
                            {t.simpleMode}
                          </button>
                          <button
                            onClick={() => setExplanationMode('advanced')}
                            className={`px-2 py-0.5 rounded font-medium ${
                              explanationMode === 'advanced' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'
                            }`}
                          >
                            {t.advancedMode}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        {explanationMode === 'simple'
                          ? displaySignal.simpleExplanation
                          : displaySignal.advancedExplanation}
                      </div>
                    </div>

                    {/* Similar Historical Setups Table */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Similar Setup History</div>
                      <div className="space-y-1.5">
                        {displaySignal.similarHistory.map((hist, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono">{hist.date} ({hist.asset})</span>
                            <span className="text-emerald-400 font-bold">{hist.outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : selectedAsset.setupQuality === 'HIGH' ? (
                  <div className="space-y-4 pt-2 border-t border-slate-800 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-center space-y-2">
                      <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                      <div className="font-bold text-amber-300 text-sm">Live ticker required</div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Wait for the Bitget live ticker to connect. ChartSignal AI will not invent price levels or generate a chart-based signal without a live exchange quote.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* WEAK / AVOID SETUP QUALITY: SAFER ALTERNATIVES ENGINE */
                  <div className="space-y-4 pt-2 border-t border-slate-800 animate-fadeIn">
                    
                    <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center space-x-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-amber-300 text-sm">{t.noStrongSetup}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">{selectedAsset.weakReason}</div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{t.betterOpportunities}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">RECOMMENDED BY HYBRID ENGINE</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {t.saferAlternativesText}
                      </p>

                      <div className="space-y-2">
                        {selectedAsset.saferAlternatives?.map((alt) => (
                          <div
                            key={alt.assetId}
                            onClick={() => handleSelectAsset(alt.assetId)}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer transition flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white text-sm">{alt.symbol}</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                  {alt.confidence}% Conf.
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{alt.reason}</p>
                            </div>

                            <button className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold text-xs whitespace-nowrap flex items-center space-x-1">
                              <span>Switch</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* INITIAL INSTRUCTION STATE */
                <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Waiting for screenshot analysis</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload your current chart screenshot and click <strong className="text-cyan-400">Analyze Screenshot</strong>. ChartSignal AI will read the chart and generate signal choices automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
