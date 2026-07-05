import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Award
} from 'lucide-react';
import { UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PRICING_PLANS } from '../data/pricingPlans';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  openPricingModal: () => void;
  openCapitalShield: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setCurrentTab,
  user,
  openPricingModal,
  openCapitalShield
}) => {
  const t = TRANSLATIONS[user.language];

  return (
    <div className="min-h-screen pb-24 md:pb-16 bg-[#0b0e14] text-slate-100 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-glow" />
      <div className="absolute top-96 right-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INSTITUTIONAL LIVE CHARTS — HYBRID ENGINE V5.0</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          AI Signals. <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Simple Decisions.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          {t.subTagline}
        </p>

        {/* Hero Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setCurrentTab('terminal')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-black font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:brightness-110 transition flex items-center justify-center space-x-2.5 group"
          >
            <span>Launch Live AI Terminal</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={openCapitalShield}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-teal-500/40 text-teal-300 font-bold text-base hover:bg-slate-800 transition flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>{t.capitalShieldBtn}</span>
          </button>
        </div>

        {/* Feature Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3 Free Signals Available Instantly</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Crypto, Gold, Oil & Silver in ALL Plans</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Built-in Zero-Ruin Capital Shield</span>
          </div>
        </div>

      </section>

      {/* Core Product Philosophy & Restraint Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
              <Award className="w-4 h-4" />
              <span>CORE PRODUCT PHILOSOPHY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why We Say <span className="text-amber-400">“WAIT”</span> When Other Bots Lie
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed text-sm sm:text-base">
              To make users truly profitable over months and years, an expert AI system should never force a blind trade. ChartSignal AI is built with honesty first:
            </p>
            <ul className="mt-6 space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Forced Signals:</strong> If volatility or news spikes make a chart unpredictable, ChartSignal AI declares <span className="text-amber-400 font-bold">AVOID / WAIT</span>.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Safer Alternative Routing:</strong> When an asset is weak, our engine automatically ranks other markets (Crypto, Gold, Oil, Silver) and directs you to where the cleanest setup exists.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>3 Credible Accuracy Metrics:</strong> Current Setup Confidence, Strategy Historical Success rate, and Market Risk Level displayed transparently.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Main User Experience Flow</span>
              <span className="text-xs text-emerald-400 font-mono">APP JOURNEY</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">1</div>
                <div>
                  <div className="font-bold text-white">Land & Get 3 Free Signals</div>
                  <div className="text-slate-400">No credit card required to test live markets</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center">2</div>
                <div>
                  <div className="font-bold text-white">Select Language & Open Terminal</div>
                  <div className="text-slate-400">Available in English, Spanish, Arabic (RTL), Urdu/Hindi & French</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center">3</div>
                <div>
                  <div className="font-bold text-white">Select Asset & Click "Get AI Signal"</div>
                  <div className="text-slate-400">High setup? Full Entry/SL/TP shown. Weak setup? Alternatives suggested!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Stage Hybrid Architecture Breakdown */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">Best Practical Architecture</h2>
          <p className="mt-2 text-slate-400 text-sm">Not just an LLM chatbot pretending to predict markets. Our 6-Stage Hybrid Engine processes real quant metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
            <h3 className="font-bold text-white text-base">Market Data Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Collects live and historical data for crypto pairs, spot gold, silver, and WTI oil across 15m to 1D timeframes.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">2</div>
            <h3 className="font-bold text-white text-base">Technical Analysis Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Computes EMAs (20/50), RSI, MACD, ATR, support/resistance zones, breakout detection, trend strength, and volume confirmation.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">3</div>
            <h3 className="font-bold text-white text-base">Market Regime Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Determines if the market is trending, ranging, volatile, or news-sensitive before permitting a trade evaluation.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">4</div>
            <h3 className="font-bold text-white text-base">Signal Scoring Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Scores each setup based on trend alignment, confirmation quality, volatility risk, and reward/risk ratio.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">5</div>
            <h3 className="font-bold text-white text-base">AI Explanation Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Summarizes complex quant setups into simple language or multilingual guidance for everyday traders.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">6</div>
            <h3 className="font-bold text-white text-base">Alternative Opportunity Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">If selected asset is unsuitable, ranks other assets by confidence and suggests the best alternative setups.</p>
          </div>
        </div>
      </section>

      {/* Pricing Ladder Overview Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">Final Pricing Recommendation</h2>
          <p className="mt-2 text-slate-400 text-sm">All supported markets (Crypto, Gold, Oil, Silver) included in EVERY tier.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                plan.highlight
                  ? 'bg-[#12192b] border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'bg-[#0f1420] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {plan.badge && (
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mb-3 uppercase tracking-wider ${
                    plan.highlight ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-base font-bold text-white">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-extrabold font-mono text-white">{plan.price}</span>
                  <span className="ml-1 text-xs text-slate-400">/{plan.period}</span>
                </div>
                <div className="mt-3 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {plan.signalsCount}
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={openPricingModal}
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                  plan.highlight
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {plan.id === 'free' ? 'Included Free' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
