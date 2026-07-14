import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, openPricingModal }) => {
  return (
    <footer className="border-t border-slate-800 bg-[#090d14] px-4 py-8 pb-24 md:pb-8 text-sm text-slate-400">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-4">
        <div>
          <div className="text-lg font-extrabold text-white">ChartSignal AI</div>
          <p className="mt-2 text-xs leading-relaxed">AI chart screenshot analysis, futures signal guidance and risk-managed decision support.</p>
        </div>
        <div className="space-y-2">
          <div className="font-bold text-white">Product</div>
          <button onClick={() => setCurrentTab('terminal')} className="block hover:text-emerald-400">Signals</button>
          <button onClick={() => setCurrentTab('scanner')} className="block hover:text-emerald-400">Scanner</button>
          <button onClick={openPricingModal} className="block hover:text-emerald-400">Pricing</button>
        </div>
        <div className="space-y-2">
          <div className="font-bold text-white">Support</div>
          <button onClick={() => setCurrentTab('learn')} className="block hover:text-emerald-400">Learn</button>
          <a href="mailto:support@chartsignal.ai" className="block hover:text-emerald-400">Contact Support</a>
        </div>
        <div className="space-y-2">
          <div className="font-bold text-white">Legal & Security</div>
          <button onClick={() => setCurrentTab('learn')} className="block hover:text-emerald-400">Risk Disclaimer</button>
          <div className="flex items-center gap-1 text-xs"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Security Shield Enabled</div>
          <div className="flex items-center gap-1 text-xs"><Mail className="h-3.5 w-3.5 text-slate-500" /> support@chartsignal.ai</div>
        </div>
      </div>
    </footer>
  );
};