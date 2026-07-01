import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Sparkles, Smartphone, Building2, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { PRICING_PLANS } from '../data/pricingPlans';
import confetti from 'canvas-confetti';

interface PricingModalProps {
  onClose: () => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

type PaymentMethod = 'card' | 'easypaisa' | 'jazzcash' | 'usdt' | 'bank';

export const PricingModal: React.FC<PricingModalProps> = ({ onClose, user, setUser }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(user.planId || 'active');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneOrWallet, setPhoneOrWallet] = useState('0300-1234567');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');

  const selectedPlan = PRICING_PLANS.find((p) => p.id === selectedPlanId) || PRICING_PLANS[2];

  const handleCompletePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      // Update user plan
      const creditsMap: Record<string, number | 'Unlimited'> = {
        free: 3,
        starter: 12,
        active: 25,
        pro: 120,
        unlimited: 'Unlimited'
      };

      setUser((prev) => ({
        ...prev,
        planId: selectedPlan.id,
        creditsRemaining: creditsMap[selectedPlan.id] || 25,
        maxCredits: creditsMap[selectedPlan.id] || 25
      }));

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });

      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn overflow-y-auto">
      <div className="bg-[#0f1420] border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>UPGRADE SIGNAL TERMINAL ACCESS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Select Your AI Strategy Plan</h2>
            <p className="text-xs text-slate-400 mt-1">
              All plans support Crypto, Gold, Oil, and Silver. Local and international checkout options available.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Ladder Selection Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRICING_PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#131d30] border-emerald-500 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'bg-[#0b0e14] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{plan.name}</span>
                    {plan.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="font-mono">
                    <span className="text-xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-[10px] text-slate-400">/{plan.period}</span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {plan.signalsCount}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  {isSelected ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected Plan</span>
                    </span>
                  ) : (
                    <span>Click to select</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Gateway Selection & Checkout Matrix */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-slate-800">
          
          {/* Gateway Selector (Cols 7) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Select Payment Method (Local & International)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  paymentMethod === 'card' ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div className="text-xs">Visa / Mastercard</div>
              </button>

              <button
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  paymentMethod === 'easypaisa' ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Smartphone className="w-5 h-5 text-green-400" />
                <div className="text-xs">Easypaisa (PK)</div>
              </button>

              <button
                onClick={() => setPaymentMethod('jazzcash')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  paymentMethod === 'jazzcash' ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Smartphone className="w-5 h-5 text-rose-400" />
                <div className="text-xs">JazzCash Wallet</div>
              </button>

              <button
                onClick={() => setPaymentMethod('usdt')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  paymentMethod === 'usdt' ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-mono font-extrabold text-amber-400">₮</span>
                <div className="text-xs">Binance Pay USDT</div>
              </button>

              <button
                onClick={() => setPaymentMethod('bank')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  paymentMethod === 'bank' ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Building2 className="w-5 h-5 text-blue-400" />
                <div className="text-xs">Local Bank Transfer</div>
              </button>
            </div>

            {/* Dynamic Inputs per Gateway */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              {paymentMethod === 'card' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white"
                  />
                </div>
              )}

              {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Mobile Wallet Phone Number</label>
                  <input
                    type="text"
                    value={phoneOrWallet}
                    onChange={(e) => setPhoneOrWallet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">An instant 4-digit verification prompt will be sent to your mobile wallet.</p>
                </div>
              )}

              {paymentMethod === 'usdt' && (
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-amber-400">Binance Pay / TRC20 Fast Pay</div>
                  <div className="font-mono bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                    Address: TL8x92mKA...TrendoraPayAI
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-blue-400">Direct Bank Reconciliation</div>
                  <div>Account Title: Trendora Technologies AI • IBAN: PK88MEZN••••••••</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Final Confirmation (Cols 5) */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-2">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Selected Plan:</span>
                  <span className="font-bold text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Allocation Credits:</span>
                  <span className="text-emerald-400 font-bold">{selectedPlan.signalsCount}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Fair-Use Protection:</span>
                  <span className="text-teal-400 font-bold">Included</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                  <span>Total Amount Due:</span>
                  <span className="text-lg font-extrabold text-white">{selectedPlan.price}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition flex items-center justify-center space-x-2 shadow-lg ${
                  isProcessing
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-black hover:brightness-110 shadow-emerald-500/20'
                }`}
              >
                {isProcessing ? (
                  <span>Securing Payment Verification...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Activate {selectedPlan.name} Now</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-500">
                🔒 256-Bit SSL Encrypted • Instant Credit Allocation Engine
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
