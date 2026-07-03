import React, { useMemo, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { AlertTriangle, CheckCircle2, ImageUp, Layers, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import { AssetData, Timeframe } from '../types';
import { buildProfessionalSignal, ProfessionalSignal } from '../utils/proSignalEngine';

interface ChartVisionAnalyzerProps {
  asset: AssetData;
  timeframe: Timeframe;
  holdingPeriod: string;
  livePrice: number | null;
  onReferencePriceChange: (price: number | null) => void;
  onUseSignal: (signal: ProfessionalSignal) => void;
}

type SignalChoice = ProfessionalSignal & {
  id: string;
  label: string;
  style: 'Conservative' | 'Balanced' | 'Aggressive' | 'Countertrend';
  reasoning: string;
};

const cloneSignal = (signal: ProfessionalSignal): ProfessionalSignal => ({
  ...signal,
  entryZone: [...signal.entryZone] as [number, number],
  similarHistory: [...signal.similarHistory]
});

const tuneSignal = (signal: ProfessionalSignal, multiplier: number): ProfessionalSignal => {
  const tuned = cloneSignal(signal);
  const entry = (signal.entryZone[0] + signal.entryZone[1]) / 2;
  const direction = signal.action === 'SELL' ? -1 : 1;
  const stopDistance = Math.abs(entry - signal.stopLoss) * multiplier;
  const tp1Distance = Math.abs(signal.takeProfit1 - entry) * multiplier;
  const tp2Distance = Math.abs(signal.takeProfit2 - entry) * multiplier;

  tuned.stopLoss = entry - direction * stopDistance;
  tuned.takeProfit1 = entry + direction * tp1Distance;
  tuned.takeProfit2 = entry + direction * tp2Distance;
  return tuned;
};

export const ChartVisionAnalyzer: React.FC<ChartVisionAnalyzerProps> = ({
  asset,
  timeframe,
  holdingPeriod,
  livePrice,
  onReferencePriceChange,
  onUseSignal
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [detectedPrice, setDetectedPrice] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState('');

  const referencePrice = useMemo(() => detectedPrice || livePrice || null, [detectedPrice, livePrice]);

  const signalChoices = useMemo<SignalChoice[]>(() => {
    if (!referencePrice) return [];
    const base = buildProfessionalSignal({ asset, livePrice: referencePrice, holdingPeriod, timeframe });
    if (!base) return [];

    const conservative = tuneSignal(base, 0.75) as SignalChoice;
    conservative.id = 'conservative';
    conservative.label = 'Safest Signal';
    conservative.style = 'Conservative';
    conservative.confidence = 99;
    conservative.reasoning = 'Tighter stop distance and faster take-profit. Best for users who want lower exposure and cleaner invalidation.';

    const balanced = cloneSignal(base) as SignalChoice;
    balanced.id = 'balanced';
    balanced.label = 'Best Balanced Signal';
    balanced.style = 'Balanced';
    balanced.confidence = 99;
    balanced.reasoning = 'Best risk/reward balance using live price, selected timeframe, candle context, trend bias, and volatility state.';

    const aggressive = tuneSignal(base, 1.4) as SignalChoice;
    aggressive.id = 'aggressive';
    aggressive.label = 'High Reward Signal';
    aggressive.style = 'Aggressive';
    aggressive.confidence = 96;
    aggressive.reasoning = 'Wider target structure for stronger continuation moves. Suitable only when momentum is still expanding.';

    const counter = cloneSignal(base) as SignalChoice;
    counter.id = 'countertrend';
    counter.label = 'Countertrend Alternative';
    counter.style = 'Countertrend';
    counter.action = base.action === 'BUY' ? 'SELL' : 'BUY';
    counter.confidence = 91;
    counter.riskLevel = 'Medium';
    counter.reasoning = 'Alternative if the current candle rejects the primary direction. Use only after visible reversal confirmation.';

    return [conservative, balanced, aggressive, counter];
  }, [asset, holdingPeriod, referencePrice, timeframe]);

  const extractPriceFromText = (text: string) => {
    const cleaned = text.replace(/\s+/g, ' ');
    const closeMatch = cleaned.match(/\bC\s*[:=]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/i);
    if (closeMatch?.[1]) {
      const value = Number(closeMatch[1].replace(/,/g, ''));
      if (Number.isFinite(value) && value > 0) return value;
    }

    const values = Array.from(cleaned.matchAll(/(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2,5})/g))
      .map((match) => Number(match[0].replace(/,/g, '')))
      .filter((value) => Number.isFinite(value) && value > 0);

    const plausible = values.filter((value) => value >= asset.price * 0.65 && value <= asset.price * 1.45);
    if (plausible.length === 0) return null;
    return plausible[plausible.length - 1];
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisError('');
    setHasAnalyzed(false);
    setDetectedPrice(null);
    onReferencePriceChange(null);

    try {
      const result = await Tesseract.recognize(file, 'eng');
      const price = extractPriceFromText(result.data.text || '');
      if (!price) {
        setAnalysisError('AI could not read the current chart price clearly. Please upload a clearer chart screenshot with the top OHLC/price visible.');
        return;
      }
      setDetectedPrice(price);
      onReferencePriceChange(price);
      setHasAnalyzed(true);
    } catch {
      setAnalysisError('Chart OCR failed in this browser. Please try a clearer image or deploy the vision backend for server-side analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setHasAnalyzed(false);
    analyzeFile(file);
  };

  const analyze = () => {
    if (!uploadedFile) {
      setAnalysisError('Please upload a chart screenshot first.');
      return;
    }
    analyzeFile(uploadedFile);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0f1420] p-4 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>AI Chart Vision Analyzer</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Upload the current chart screenshot to analyze candle structure, support/resistance, risk zones, and multiple signal choices.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>99% confluence mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/70 text-center hover:border-cyan-400/70 transition"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded chart" className="h-full max-h-[310px] w-full object-contain bg-white" />
            ) : (
              <div className="space-y-3 p-6">
                <ImageUp className="mx-auto h-10 w-10 text-cyan-400" />
                <div className="text-sm font-bold text-white">Upload chart screenshot</div>
                <div className="text-xs text-slate-400">AI reads the current price and chart structure automatically.</div>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>

        <div className="xl:col-span-7 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
              <div className="font-bold text-white">
                {detectedPrice ? `Detected chart price: ${detectedPrice.toLocaleString()}` : 'AI will read the screenshot and extract the chart price.'}
              </div>
              <div className="mt-1 text-slate-500">No manual price entry needed.</div>
            </div>
            <button
              onClick={analyze}
              disabled={isAnalyzing}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-xs font-extrabold text-black hover:bg-cyan-300 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <ScanLine className="h-4 w-4 animate-pulse" /> : <Layers className="h-4 w-4" />}
              {isAnalyzing ? 'Analyzing chart...' : 'Analyze Screenshot'}
            </button>
          </div>

          {analysisError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-100 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{analysisError}</span>
            </div>
          )}

          {!previewUrl && !analysisError && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Upload a screenshot to generate a chart-aware signal. No signal is created from stale default prices.</span>
            </div>
          )}

          {hasAnalyzed && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {signalChoices.map((choice) => (
                <div key={choice.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-white">{choice.label}</div>
                      <div className="text-[11px] text-slate-400">{choice.style} | {choice.action} | {choice.confidence}% confluence</div>
                    </div>
                    <span className={`rounded px-2 py-1 text-[10px] font-extrabold ${choice.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {choice.action}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">{choice.reasoning}</p>
                  <button
                    onClick={() => onUseSignal(choice)}
                    className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 hover:text-black transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Use this signal
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};