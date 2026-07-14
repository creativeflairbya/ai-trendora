import React, { useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';

const lessons = [
  { title: 'How screenshot analysis works', body: 'Upload the latest chart screenshot. ChartSignal AI reads the symbol, current price, candle structure, support/resistance, and risk context before generating a signal.' },
  { title: 'What confluence means', body: 'Confluence combines RSI, MACD, EMA, Bollinger Bands, volume, market regime, and multi-timeframe agreement into one decision framework.' },
  { title: 'How to use stop-loss and take-profit', body: 'Never enter without a stop-loss. TP1 is the safer target; TP2 is the extended target. Use Capital Shield to limit risk per trade.' },
  { title: 'Why sometimes the system says WAIT', body: 'WAIT protects users during conflicting multi-timeframe signals, unclear screenshots, major news volatility, or weak trend confirmation.' }
];

export const LearnPage: React.FC = () => {
  const [open, setOpen] = useState(0);
  return (
    <div className="min-h-screen bg-[#0b0e14] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="h-4 w-4" /> Learn
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Trading Signal Basics</h1>
          <p className="mt-2 text-sm text-slate-400">Clickable guides for beginners and advanced users.</p>
        </div>
        <div className="space-y-3">
          {lessons.map((item, index) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-[#0f1420] overflow-hidden">
              <button onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between px-5 py-4 text-left font-bold text-white">
                {item.title}
                <ChevronDown className={`h-4 w-4 transition ${open === index ? 'rotate-180' : ''}`} />
              </button>
              {open === index && <div className="border-t border-slate-800 px-5 py-4 text-sm leading-relaxed text-slate-300">{item.body}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};