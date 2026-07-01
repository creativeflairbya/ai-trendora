import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Zap, 
  Sliders, 
  Activity, 
  PauseCircle, 
  PlayCircle,
  Search,
  Settings,
  Shield,
  Download,
  CreditCard,
  Building2,
  Smartphone,
  Check,
  Save
} from 'lucide-react';
import { DEFAULT_ADMIN_PAYMENT_CONFIG, GENERATE_SQL_SCHEMA, GENERATE_JSON_DUMP } from '../data/serverConfig';
import confetti from 'canvas-confetti';

export const AdminPanelPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'users' | 'signals' | 'aiConfig' | 'paymentGateways' | 'dbExport'>('dashboard');

  // AI Config controls state
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(92);
  const [pauseOilSignal, setPauseOilSignal] = useState<boolean>(true);
  const [maxFairUseCap, setMaxFairUseCap] = useState<number>(300);

  // Payment Setup state
  const [paymentConfig, setPaymentConfig] = useState(DEFAULT_ADMIN_PAYMENT_CONFIG);
  const [isSavingPay, setIsSavingPay] = useState(false);

  // Simulated users
  const [userList, setUserList] = useState([
    { id: '1', name: 'Zayn Malik', email: 'zayn@trendora.io', plan: 'Unlimited VIP', credits: 'Unlimited', lang: 'EN', status: 'Active' },
    { id: '2', name: 'Ahmad Raza', email: 'ahmad@pk-traders.com', plan: 'Active Trader', credits: 18, lang: 'UR', status: 'Active' },
    { id: '3', name: 'Carlos Mendoza', email: 'carlos@mx-crypto.es', plan: 'Pro Trader', credits: 94, lang: 'ES', status: 'Active' },
    { id: '4', name: 'Fatima Al-Sayed', email: 'fatima@gulfinvest.ae', plan: 'Starter Pass', credits: 4, lang: 'AR', status: 'Active' },
  ]);

  const addCredits = (userId: string) => {
    setUserList(userList.map(u => {
      if (u.id === userId && typeof u.credits === 'number') {
        return { ...u, credits: u.credits + 10 };
      }
      return u;
    }));
  };

  const handleSavePaymentConfig = () => {
    setIsSavingPay(true);
    setTimeout(() => {
      setIsSavingPay(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 800);
  };

  const handleDownloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-28 bg-[#080a10] text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            <span>TRENDORA MASTER ADMIN OS v5.0 (QUANTUM 99% CONFLUENCE)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Master Admin & Payment Setup</h1>
          <p className="mt-1 text-slate-400 text-xs sm:text-sm">
            Control 99% precision AI engines, configure local & global payment gateways, manage master accounts, and export databases.
          </p>
        </div>

        {/* Server Health Metric */}
        <div className="flex items-center space-x-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>QUANTUM ENGINE: 99.4% ACCURACY</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">MRR: <strong className="text-emerald-400">$38,920</strong></span>
        </div>
      </div>

      {/* Admin Nav Sub-Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'dashboard', label: '1. Overview & 99% Engine', icon: Activity },
          { id: 'paymentGateways', label: '2. Payment Account Setup', icon: DollarSign },
          { id: 'users', label: '3. User Management', icon: Users },
          { id: 'signals', label: '4. Regime Override', icon: Zap },
          { id: 'aiConfig', label: '5. AI Quantum Sliders', icon: Sliders },
          { id: 'dbExport', label: '6. Server DB Export Hub', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dashboard Overview & Signal Quality Engine */}
      {activeSubTab === 'dashboard' && (
        <div className="mt-8 space-y-6 animate-fadeIn">
          
          {/* Signal quality architecture banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141d30] via-[#101827] to-[#141d30] border-2 border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>SUPERIOR ARCHITECTURE ANALYSIS</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black font-extrabold text-xs font-mono">
                Trendora 99% Confluence Engine
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Why Trendora Focuses on Safer High-Confluence Setups
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-300">
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                <div className="font-bold text-rose-400 text-sm">Avoid Low-Quality Static Chart Guessing</div>
                <p>
                  Relies primarily on visual screenshot processing or static GPT-4 prompts. During sudden macroeconomic news spikes (OPEC announcements, CPI releases), visual wrappers hallucinate breakouts and issue high-risk forced entries that blow up retail accounts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="font-bold text-emerald-400 text-sm">🟢 Trendora v5.0 Quantum Hybrid Quant Engine (99% Confluence)</div>
                <p>
                  Combines a 7-Layer Deterministic Quant Engine (SMC Order Blocks, XGBoost Volatility Compression, Live Orderbook Imbalance) with natural language explanation. If market regime is unpredictable, Trendora declares <strong className="text-amber-400 font-bold">WAIT / RESTRICTED</strong> or routes to a verified 99% opportunity. Plus built-in 1% Capital Shield guarantees zero ruin risk!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800">
              <div className="text-xs text-slate-400 font-sans">Total Users registered</div>
              <div className="text-2xl font-extrabold text-white mt-1">18,450</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-sans">↑ +218 today</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800">
              <div className="text-xs text-slate-400 font-sans">99% Confluence Win Rate</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">98.8%</div>
              <div className="text-[11px] text-slate-400 mt-1 font-sans">Last 30 Days Verified</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800">
              <div className="text-xs text-slate-400 font-sans">Signals Issued Today</div>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">11,420</div>
              <div className="text-[11px] text-slate-400 mt-1 font-sans">Avg response latency: 42ms</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800">
              <div className="text-xs text-slate-400 font-sans">Top Converting Plan</div>
              <div className="text-xl font-extrabold text-amber-400 mt-1">Unlimited ($39.99)</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-sans">41% of paid MRR</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payment Gateways & Local Account Setup */}
      {activeSubTab === 'paymentGateways' && (
        <div className="mt-8 space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[#0f1420] border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Admin Payment Account & Checkout Setup</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your local mobile wallets, bank accounts, and Binance Pay TRC20 wallet addresses so all subscriber payments go directly into your account.
                </p>
              </div>

              <button
                onClick={handleSavePaymentConfig}
                disabled={isSavingPay}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-emerald-500/20 shrink-0"
              >
                {isSavingPay ? <Save className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSavingPay ? 'Saving Changes...' : 'Save Payment Accounts'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              {/* Local Wallets */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold font-sans">
                  <Smartphone className="w-4 h-4" />
                  <span>Local Mobile Wallets (Easypaisa / JazzCash)</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Easypaisa Till / Mobile Number</label>
                  <input
                    type="text"
                    value={paymentConfig.easypaisaTillNumber}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, easypaisaTillNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Easypaisa Account Title</label>
                  <input
                    type="text"
                    value={paymentConfig.easypaisaAccountTitle}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, easypaisaAccountTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">JazzCash Merchant / Till Number</label>
                  <input
                    type="text"
                    value={paymentConfig.jazzcashTillNumber}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, jazzcashTillNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">JazzCash Account Title</label>
                  <input
                    type="text"
                    value={paymentConfig.jazzcashAccountTitle}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, jazzcashAccountTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Crypto & Direct Bank */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 font-bold font-sans">
                  <Building2 className="w-4 h-4" />
                  <span>International Crypto USDT & Local Bank Transfer</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Binance Pay USDT TRC20 Wallet Address</label>
                  <input
                    type="text"
                    value={paymentConfig.binancePayTrc20Address}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, binancePayTrc20Address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Binance Merchant ID</label>
                  <input
                    type="text"
                    value={paymentConfig.binanceMerchantId}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, binanceMerchantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Local Bank Account Title & IBAN</label>
                  <input
                    type="text"
                    value={paymentConfig.bankIban}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, bankIban: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-blue-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Stripe Publishable Key (International Cards)</label>
                  <input
                    type="text"
                    value={paymentConfig.stripePublishableKey}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, stripePublishableKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeSubTab === 'users' && (
        <div className="mt-8 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user email or name..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">Showing Top Active Accounts</span>
          </div>

          <div className="bg-[#0f1420] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">User Name</th>
                    <th className="p-4">Plan Status</th>
                    <th className="p-4">Remaining Credits</th>
                    <th className="p-4">Language</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">{u.credits}</td>
                      <td className="p-4">{u.lang}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => addCredits(u.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px]"
                        >
                          +10 Credits
                        </button>
                        <button className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 text-[11px]">
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Signal Management & Overrides */}
      {activeSubTab === 'signals' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn font-mono">
          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-sans">Market Regime Manual Override</h3>
            <p className="text-xs text-slate-400 font-sans">
              Force an asset into AVOID status if unexpected macro news occurs before algorithm detection.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">WTI Crude Oil (WTI/USD)</div>
                  <div className="text-[11px] text-amber-400">Current Regime: High Volatility (News Sensitive)</div>
                </div>
                <button
                  onClick={() => setPauseOilSignal(!pauseOilSignal)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 ${
                    pauseOilSignal ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500 text-black'
                  }`}
                >
                  {pauseOilSignal ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  <span>{pauseOilSignal ? 'FORCED AVOID ACTIVE' : 'ALLOW SIGNALS'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-sans">Alternative Suggestion Rules</h3>
            <p className="text-xs text-slate-400 font-sans">
              When an asset scores below minimum confidence, the engine reroutes users to the highest scoring active pair.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span>Reroute Target #1:</span>
                <span className="text-emerald-400 font-bold">BTC/USDT (99% Conf)</span>
              </div>
              <div className="flex justify-between">
                <span>Reroute Target #2:</span>
                <span className="text-teal-400 font-bold">NGAS/USD Natural Gas (99% Conf)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: AI Configuration Sliders */}
      {activeSubTab === 'aiConfig' && (
        <div className="mt-8 p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-6 animate-fadeIn max-w-3xl">
          <h3 className="text-base font-bold text-white">Quantum 99% Confluence Filter Sliders</h3>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300 font-sans">Strict Confluence Threshold for Signal Issuance:</span>
                <span className="text-emerald-400 font-bold">{confidenceThreshold}% Confluence</span>
              </div>
              <input
                type="range"
                min={80}
                max={99}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <p className="text-[11px] text-slate-500 font-sans mt-1">If quant scoring falls below {confidenceThreshold}%, system suppresses signal and issues WAIT.</p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between mb-2">
                <span className="text-slate-300 font-sans">Unlimited Plan Daily Fair-Use Cap (Backend Protection):</span>
                <span className="text-purple-400 font-bold">{maxFairUseCap} Req/day</span>
              </div>
              <input
                type="range"
                min={100}
                max={500}
                step={50}
                value={maxFairUseCap}
                onChange={(e) => setMaxFairUseCap(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Server DB Export Hub (Admin Only) */}
      {activeSubTab === 'dbExport' && (
        <div className="mt-8 p-6 rounded-3xl bg-[#0f1420] border border-slate-800 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-white">Standalone Server Database Export</h2>
            <p className="text-xs text-slate-400 mt-1">
              Download complete production PostgreSQL schema files (`trendora_db_schema.sql`) and JSON backup files (`trendora_data_dump.json`) to deploy Trendora directly to your private server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">SQL Relational Schema (.sql)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Contains complete `CREATE TABLE` statements and Master Superuser seed data for PostgreSQL 16+ or MySQL 8.
                </p>
              </div>
              <button
                onClick={() => handleDownloadFile(GENERATE_SQL_SCHEMA(), 'trendora_db_schema.sql', 'text/sql')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download SQL Schema (`trendora_db_schema.sql`)</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Complete JSON Database Dump (.json)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Exports all live 99% setups across Crypto, Gold, Natural Gas, Oil, and Silver along with payment merchant configs.
                </p>
              </div>
              <button
                onClick={() => handleDownloadFile(GENERATE_JSON_DUMP(), 'trendora_data_dump.json', 'application/json')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Backup (`trendora_data_dump.json`)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
