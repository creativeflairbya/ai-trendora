import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Globe, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Bell, 
  Zap,
  CreditCard,
  ChevronDown,
  Crown,
  UserCheck
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { MOCK_ASSETS } from '../data/mockMarkets';
import { ACCOUNT_PRESETS } from '../data/serverConfig';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  openPricingModal: () => void;
  openCapitalShield: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  user,
  setUser,
  openPricingModal,
  openCapitalShield
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English (US)', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية (RTL)', flag: '🇸🇦' },
    { code: 'ur', label: 'اردو / Hindi', flag: '🇵🇰' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d121c]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Live Market Ticker Tape + Master Account Banner */}
      <div className="bg-[#07090e] border-b border-slate-800/50 py-1.5 px-4 overflow-hidden flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-8 animate-marquee overflow-hidden">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE HYBRID ENGINE v4.2 ACTIVE</span>
          </div>
          {MOCK_ASSETS.map((asset) => (
            <div key={asset.id} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-slate-400 font-semibold">{asset.symbol}</span>
              <span className="text-slate-200">${asset.price.toLocaleString()}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                asset.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </span>
            </div>
          ))}
          <div className="flex items-center space-x-2 text-amber-400 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FAIR-USE CAPITAL SHIELD ENGAGED (0% RUIN RISK)</span>
          </div>
        </div>

        {/* Master Account Quick Indicator */}
        <div className="hidden xl:flex items-center space-x-2 pl-4 border-l border-slate-800 shrink-0">
          {user.isMasterAccount ? (
            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/40 text-[10px] font-bold flex items-center space-x-1 animate-pulse">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>UNRESTRICTED MASTER ACCOUNT ACTIVE</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
              Role: <strong className="text-emerald-400">{user.role}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main App Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Trendora
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wide uppercase">
                  v4.2 App
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Signals. Simple Decisions.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/70 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'home'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('terminal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'terminal'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Signals</span>
            </button>

            <button
              onClick={() => setCurrentTab('scanner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'scanner'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </button>

            <button
              onClick={() => setCurrentTab('watchlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'watchlist'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Right Side Actions: Quick Switcher, Language, Credits & Upgrade */}
          <div className="flex items-center space-x-2">
            {/* Capital Shield Button */}
            <button
              onClick={openCapitalShield}
              className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-xs font-bold transition"
              title="Open Zero-Ruin Capital Shield Calculator"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Shield Calc</span>
            </button>
            
            {/* Account Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                  user.isMasterAccount
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title="Switch Account Preset"
              >
                {user.isMasterAccount ? <Crown className="w-3.5 h-3.5 text-black" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="hidden md:inline">{user.isMasterAccount ? 'Master Admin' : user.role.split('_')[0]}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Test Account Preset
                  </div>

                  <div className="mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setUser(ACCOUNT_PRESETS.master);
                        setShowAccountMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        user.isMasterAccount ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div>Master Super Admin</div>
                          <div className="text-[10px] text-slate-400">All Abilities Unrestricted</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setUser(ACCOUNT_PRESETS.pro);
                        setShowAccountMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        user.role === 'PRO_TRADER' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div>Pro Trader ($29.99/mo)</div>
                        <div className="text-[10px] text-slate-400">120 Signals + Quant Engine</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setUser(ACCOUNT_PRESETS.starter);
                        setShowAccountMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        user.role === 'STARTER_USER' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div>Starter Pass ($2.99)</div>
                        <div className="text-[10px] text-slate-400">12 Signals / 7 Days</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setUser(ACCOUNT_PRESETS.free);
                        setShowAccountMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        user.role === 'FREE_USER' ? 'bg-slate-800 text-slate-300 font-bold' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <div>Free Tier Beginner</div>
                        <div className="text-[10px] text-slate-400">3 Signals Total</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase">{user.language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select App Language
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setUser((prev) => ({ ...prev, language: l.code }));
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                        user.language === l.code ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {user.language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Signal Credits Display */}
            <div 
              onClick={openPricingModal}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 cursor-pointer hover:border-emerald-500/50 transition"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400 hidden sm:inline">Credits: </span>
                <span className="font-mono font-bold text-emerald-400">
                  {user.creditsRemaining === 'Unlimited' ? '∞ Unlimited' : `${user.creditsRemaining}/${user.maxCredits}`}
                </span>
              </div>
            </div>

            {/* Upgrade / Pricing Button */}
            <button
              onClick={openPricingModal}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition flex items-center space-x-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pricing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile App Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c1018]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center p-1 rounded-lg ${
            currentTab === 'home' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>
        <button
          onClick={() => setCurrentTab('terminal')}
          className={`flex flex-col items-center p-1 rounded-lg ${
            currentTab === 'terminal' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Signals</span>
        </button>
        <button
          onClick={() => setCurrentTab('scanner')}
          className={`flex flex-col items-center p-1 rounded-lg ${
            currentTab === 'scanner' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Scanner</span>
        </button>
        <button
          onClick={() => setCurrentTab('admin')}
          className={`flex flex-col items-center p-1 rounded-lg ${
            currentTab === 'admin' ? 'text-purple-400' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Admin</span>
        </button>
      </div>
    </header>
  );
};
