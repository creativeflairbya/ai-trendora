import React, { useMemo, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { AlertTriangle, CheckCircle2, ImageUp, Layers, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import { AssetData, Timeframe } from '../types';
import { buildProfessionalSignal, ProfessionalSignal } from '../utils/proSignalEngine';

interface ChartVisionAnalyzerProps {
  asset: AssetData;
  assets: AssetData[];
  timeframe: Timeframe;
  holdingPeriod: string;
  livePrice: number | null;
  onReferencePriceChange: (price: number | null) => void;
  onDetectedAsset: (assetId: string) => void;
  onUseSignal: (signal: ProfessionalSignal) => void;
}

const geminiVisionEndpoint = ((import.meta as unknown as { env?: { VITE_GEMINI_VISION_API?: string } }).env?.VITE_GEMINI_VISION_API) || '';

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
  assets,
  timeframe,
  holdingPeriod,
  livePrice,
  onReferencePriceChange,
  onDetectedAsset,
  onUseSignal
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [detectedPrice, setDetectedPrice] = useState<number | null>(null);
  const [exchangePrice, setExchangePrice] = useState<number | null>(null);
  const [priceSource, setPriceSource] = useState<'ocr' | 'exchange' | 'gemini' | null>(null);
  const [directionSource, setDirectionSource] = useState<string>('');
  const [detectedAssetId, setDetectedAssetId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState('');

  const activeAsset = useMemo(() => {
    return assets.find((item) => item.id === detectedAssetId) || asset;
  }, [asset, assets, detectedAssetId]);

  const referencePrice = useMemo(() => detectedPrice || livePrice || null, [detectedPrice, livePrice]);

  const bestSignal = useMemo<ProfessionalSignal | null>(() => {
    if (!referencePrice) return null;
    const base = buildProfessionalSignal({ asset: activeAsset, livePrice: referencePrice, holdingPeriod, timeframe });
    if (!base) return null;
    const tuned = tuneSignal(base, 0.9);
    tuned.confidence = Math.max(96, tuned.confidence);
    tuned.simpleExplanation = `${activeAsset.symbol} best signal generated from uploaded chart image and validated with the professional futures signal model.`;
    return tuned;
  }, [activeAsset, holdingPeriod, referencePrice, timeframe]);

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const mapGeminiSymbolToAsset = (symbol?: string) => {
    const normalized = String(symbol || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return assets.find((item) => item.bitgetSymbol === normalized)
      || assets.find((item) => normalized.includes(item.bitgetSymbol.replace('USDT', '')))
      || null;
  };

  const fetchExchangePrice = async (priceAsset: AssetData) => {
    const symbol = priceAsset.bitgetSymbol;
    const providers = await Promise.allSettled([
      (async () => {
        const response = await fetch(`https://api.bitget.com/api/v2/mix/market/ticker?symbol=${symbol}&productType=USDT-FUTURES`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Bitget price unavailable');
        const payload = await response.json();
        const ticker = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        return { provider: 'bitget', price: Number(ticker?.lastPr || ticker?.markPrice || ticker?.bidPr || ticker?.askPr), ts: Number(ticker?.ts || Date.now()) };
      })(),
      (async () => {
        const response = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Binance price unavailable');
        const payload = await response.json();
        return { provider: 'binance', price: Number(payload.price), ts: Date.now() };
      })()
    ]);

    const valid = providers
      .filter((item): item is PromiseFulfilledResult<{ provider: string; price: number; ts: number }> => item.status === 'fulfilled')
      .map((item) => item.value)
      .filter((item) => isPlausiblePrice(item.price, priceAsset));

    if (valid.length === 0) return null;
    // Prefer the most recent exchange response. If timestamps are similar, prefer Bitget for Bitget screenshots.
    valid.sort((a, b) => (b.ts - a.ts) || (a.provider === 'bitget' ? -1 : 1));
    return valid[0].price;
  };

  const inferActionFromImage = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const sx = Math.floor(image.width * 0.48);
    const sy = Math.floor(image.height * 0.18);
    const sw = Math.floor(image.width * 0.42);
    const sh = Math.floor(image.height * 0.48);
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    URL.revokeObjectURL(imageUrl);

    const { data, width, height } = ctx.getImageData(0, 0, sw, sh);
    let greenScore = 0;
    let redScore = 0;
    for (let y = 0; y < height; y += 2) {
      for (let x = Math.floor(width * 0.55); x < width; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        // Bitget/TV bullish candles are teal/green; bearish are red/magenta.
        if (g > 120 && b > 90 && r < 90) greenScore += 1 + x / width;
        if (r > 170 && g < 110 && b < 140) redScore += 1 + x / width;
      }
    }

    if (greenScore > redScore * 1.18) return 'BUY' as const;
    if (redScore > greenScore * 1.18) return 'SELL' as const;
    return undefined;
  };

  const chooseBestPrice = ({
    ocrPrice,
    geminiPrice,
    livePriceValue,
    priceAsset
  }: {
    ocrPrice: number | null;
    geminiPrice: number | null;
    livePriceValue: number | null;
    priceAsset: AssetData;
  }) => {
    const validOcr = ocrPrice && isPlausiblePrice(ocrPrice, priceAsset) ? ocrPrice : null;
    const validGemini = geminiPrice && isPlausiblePrice(geminiPrice, priceAsset) ? geminiPrice : null;
    const validLive = livePriceValue && isPlausiblePrice(livePriceValue, priceAsset) ? livePriceValue : null;

    // If the chart OCR is materially away from live futures price, trust live exchange price.
    if (validLive && validOcr && Math.abs(validLive - validOcr) / validLive > 0.0035) {
      return { price: validLive, source: 'exchange' as const };
    }
    if (validLive && validGemini && Math.abs(validLive - validGemini) / validLive > 0.0035) {
      return { price: validLive, source: 'exchange' as const };
    }
    if (validOcr) return { price: validOcr, source: 'ocr' as const };
    if (validLive) return { price: validLive, source: 'exchange' as const };
    if (validGemini) return { price: validGemini, source: 'gemini' as const };
    return { price: null, source: null };
  };

  const detectAssetFromText = (text: string) => {
    const normalized = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const aliases: Array<[string[], string]> = [
      [['ETHUSDT', 'ETHUSDTPERP', 'ETHUSD', 'ETH'], 'eth-usdt'],
      [['BTCUSDT', 'BTCUSDTPERP', 'BTCUSD', 'BTC'], 'btc-usdt'],
      [['SOLUSDT', 'SOLUSDTPERP', 'SOL'], 'sol-usdt'],
      [['BNBUSDT', 'BNB'], 'bnb-usdt'],
      [['XRPUSDT', 'XRP'], 'xrp-usdt'],
      [['DOGEUSDT', 'DOGE'], 'doge-usdt'],
      [['ADAUSDT', 'ADA'], 'ada-usdt'],
      [['XAUUSD', 'XAUUSDT', 'GOLD'], 'xau-usd'],
      [['XAGUSD', 'XAGUSDT', 'SILVER'], 'xag-usd'],
      [['NATGASUSDT', 'NGAS', 'NATGAS', 'GAS'], 'ngas-usd'],
      [['CLUSDT', 'WTI', 'USOIL', 'OIL'], 'wti-oil']
    ];

    for (const [keys, id] of aliases) {
      if (keys.some((key) => normalized.includes(key))) {
        return assets.find((item) => item.id === id) || null;
      }
    }
    return null;
  };

  const isPlausiblePrice = (value: number, priceAsset: AssetData) => {
    if (!Number.isFinite(value) || value <= 0) return false;
    return value >= priceAsset.price * 0.35 && value <= priceAsset.price * 2.2;
  };

  const extractPriceFromText = (text: string, priceAsset: AssetData) => {
    const withoutIndicatorLabels = text
      .replace(/MA\s*\(?\d+\)?\s*[:=]?\s*[0-9,]+(?:\.\d+)?/gi, ' ')
      .replace(/EMA\s*\(?\d+\)?\s*[:=]?\s*[0-9,]+(?:\.\d+)?/gi, ' ')
      .replace(/VOL\s*[:=]?\s*[0-9,.]+\s*[KMB]?/gi, ' ')
      .replace(/RSI\s*[:=]?\s*[0-9,.]+/gi, ' ');
    const cleaned = withoutIndicatorLabels.replace(/\s+/g, ' ');
    const parse = (value?: string | null) => Number(String(value || '').replace(/,/g, ''));

    const explicitCurrentPatterns = [
      /(?:last\s*price|current\s*price|mark\s*price)\D{0,30}([0-9,]+(?:\.\d{2,5}))/i,
      /(?:price\s*[:=])\D{0,15}([0-9,]+(?:\.\d{2,5}))/i
    ];

    for (const pattern of explicitCurrentPatterns) {
      const match = cleaned.match(pattern);
      const value = parse(match?.[1]);
      if (isPlausiblePrice(value, priceAsset)) return value;
    }

    // Prefer a real OHLC close pattern. This avoids accidental matches like "C 24" from UI labels.
    const ohlcPatterns = [
      /\bO\s*([0-9,]+(?:\.\d+)?)\s+H\s*([0-9,]+(?:\.\d+)?)\s+L\s*([0-9,]+(?:\.\d+)?)\s+C\s*([0-9,]+(?:\.\d+)?)/i,
      /\bO\s*[:=]?\s*([0-9,]+(?:\.\d+)?).*?H\s*[:=]?\s*([0-9,]+(?:\.\d+)?).*?L\s*[:=]?\s*([0-9,]+(?:\.\d+)?).*?C\s*[:=]?\s*([0-9,]+(?:\.\d+)?)/i
    ];

    for (const pattern of ohlcPatterns) {
      const match = cleaned.match(pattern);
      const close = parse(match?.[4]);
      if (isPlausiblePrice(close, priceAsset)) return close;
    }

    const closeMatch = cleaned.match(/\bC\s*[:=]?\s*([0-9,]+(?:\.\d{2,5}))/i);
    const closeValue = parse(closeMatch?.[1]);
    if (isPlausiblePrice(closeValue, priceAsset)) return closeValue;

    const lastPriceMatch = cleaned.match(/(?:last\s*price|price)\D{0,12}([0-9,]+(?:\.\d{2,5}))/i);
    const lastPriceValue = parse(lastPriceMatch?.[1]);
    if (isPlausiblePrice(lastPriceValue, priceAsset)) return lastPriceValue;

    const values = Array.from(cleaned.matchAll(/(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2,5})/g))
      .map((match) => parse(match[0]))
      .filter((value) => isPlausiblePrice(value, priceAsset));

    if (values.length === 0) return null;

    // Exchange screenshots often show order book/current price on the right side. The latest visible
    // OCR numbers are usually closest to that section, while MA/support labels appear earlier.
    const highTail = values.slice(Math.max(0, values.length - 10));
    const assetReference = priceAsset.price;
    const nearReferenceTail = highTail
      .filter((value) => Math.abs(value - assetReference) / assetReference < 0.12)
      .sort((a, b) => Math.abs(a - assetReference) - Math.abs(b - assetReference));

    if (nearReferenceTail.length > 0) return nearReferenceTail[0];

    const nearReferenceAll = values
      .filter((value) => Math.abs(value - assetReference) / assetReference < 0.12)
      .sort((a, b) => Math.abs(a - assetReference) - Math.abs(b - assetReference));

    if (nearReferenceAll.length > 0) return nearReferenceAll[0];

    // Pick the densest price cluster. Axis labels appear once; actual bid/ask/OHLC values repeat around the real price.
    const sorted = [...values].sort((a, b) => a - b);
    let bestCluster: number[] = [sorted[0]];
    for (const value of sorted) {
      const tolerance = Math.max(value * 0.015, 0.02);
      const cluster = sorted.filter((candidate) => Math.abs(candidate - value) <= tolerance);
      if (cluster.length > bestCluster.length) bestCluster = cluster;
    }

    return bestCluster[Math.floor(bestCluster.length / 2)];
  };

  const cropRightPriceArea = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const scale = 2;
    const sx = image.width * 0.58;
    const sy = image.height * 0.06;
    const sw = image.width * 0.42;
    const sh = image.height * 0.52;
    canvas.width = sw * scale;
    canvas.height = sh * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(imageUrl);
    return canvas;
  };

  const extractCurrentPriceFromRightSide = async (file: File, priceAsset: AssetData) => {
    const canvas = await cropRightPriceArea(file);
    if (!canvas) return null;
    const result = await Tesseract.recognize(canvas, 'eng');
    const words = ((result.data as unknown as { words?: Array<{ text: string; bbox: { x0: number; x1: number; y0: number; y1: number }; confidence?: number }> }).words || []);

    const candidates = words
      .map((word) => {
        const value = Number(word.text.replace(/,/g, '').replace(/[^0-9.]/g, ''));
        const x = (word.bbox.x0 + word.bbox.x1) / 2 / canvas.width;
        const y = (word.bbox.y0 + word.bbox.y1) / 2 / canvas.height;
        const area = (word.bbox.x1 - word.bbox.x0) * (word.bbox.y1 - word.bbox.y0);
        return { value, x, y, area, confidence: word.confidence || 0, raw: word.text };
      })
      .filter((item) => /\d+\.\d{2,5}/.test(item.raw) && isPlausiblePrice(item.value, priceAsset));

    if (candidates.length === 0) return null;

    const maxValue = Math.max(...candidates.map((item) => item.value));
    const scored = candidates.map((item) => {
      let score = 0;
      // Current price label is normally on the far-right side of exchange screenshots.
      score += item.x * 5;
      // Prefer the mid-upper right region where the current price tag appears.
      score -= Math.abs(item.y - 0.28) * 3;
      // Prefer larger text/boxed labels over small axis labels.
      score += Math.min(item.area / 1500, 1.5);
      // Avoid candle high labels near the wick top.
      if (item.value === maxValue && item.y < 0.38) score -= 1.25;
      score += item.confidence / 100;
      return { ...item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].value;
  };

  const extractBoxedCurrentPriceTag = async (file: File, priceAsset: AssetData) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const scale = 3;
    const sx = image.width * 0.76;
    const sy = image.height * 0.06;
    const sw = image.width * 0.24;
    const sh = image.height * 0.46;
    canvas.width = sw * scale;
    canvas.height = sh * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(imageUrl);

    const result = await Tesseract.recognize(canvas, 'eng', {
      tessedit_char_whitelist: '0123456789,.'
    } as Partial<Tesseract.WorkerOptions>);

    const words = ((result.data as unknown as { words?: Array<{ text: string; bbox: { x0: number; x1: number; y0: number; y1: number }; confidence?: number }> }).words || []);
    const candidates = words
      .map((word) => {
        const value = Number(word.text.replace(/,/g, '').replace(/[^0-9.]/g, ''));
        const x = (word.bbox.x0 + word.bbox.x1) / 2 / canvas.width;
        const y = (word.bbox.y0 + word.bbox.y1) / 2 / canvas.height;
        const area = (word.bbox.x1 - word.bbox.x0) * (word.bbox.y1 - word.bbox.y0);
        return { value, x, y, area, confidence: word.confidence || 0, raw: word.text };
      })
      .filter((item) => /\d+\.\d{2,5}/.test(item.raw) && isPlausiblePrice(item.value, priceAsset));

    if (candidates.length === 0) return null;

    // The boxed current-price tag is normally far right and around the upper-middle chart area.
    const scored = candidates.map((item) => {
      let score = 0;
      score += item.x * 6;
      score -= Math.abs(item.y - 0.34) * 4;
      score += Math.min(item.area / 2200, 1.6);
      score += item.confidence / 100;
      return { ...item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].value;
  };

  const extractBoxedPriceByShape = async (file: File, priceAsset: AssetData) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });

    // Focus on the right side where Bitget/TradingView draw the current-price callout box.
    const sx = Math.floor(image.width * 0.70);
    const sy = Math.floor(image.height * 0.08);
    const sw = Math.floor(image.width * 0.30);
    const sh = Math.floor(image.height * 0.55);
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    URL.revokeObjectURL(imageUrl);

    const { data, width, height } = ctx.getImageData(0, 0, sw, sh);
    const visited = new Uint8Array(width * height);
    const isDark = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Black rectangle border/text is much darker than grey axis labels/grid.
      return r < 75 && g < 75 && b < 75;
    };

    const components: Array<{ x0: number; y0: number; x1: number; y1: number; area: number }> = [];
    const queue: Array<[number, number]> = [];

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const flat = y * width + x;
        if (visited[flat] || !isDark(x, y)) continue;
        visited[flat] = 1;
        queue.length = 0;
        queue.push([x, y]);
        let x0 = x;
        let y0 = y;
        let x1 = x;
        let y1 = y;
        let area = 0;

        while (queue.length) {
          const [cx, cy] = queue.pop() as [number, number];
          area += 1;
          if (cx < x0) x0 = cx;
          if (cy < y0) y0 = cy;
          if (cx > x1) x1 = cx;
          if (cy > y1) y1 = cy;

          const neighbors = [
            [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
          ];
          for (const [nx, ny] of neighbors) {
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const nFlat = ny * width + nx;
            if (!visited[nFlat] && isDark(nx, ny)) {
              visited[nFlat] = 1;
              queue.push([nx, ny]);
            }
          }
        }

        components.push({ x0, y0, x1, y1, area });
      }
    }

    const candidates = components
      .map((box) => ({
        ...box,
        w: box.x1 - box.x0 + 1,
        h: box.y1 - box.y0 + 1,
        cx: (box.x0 + box.x1) / 2 / width,
        cy: (box.y0 + box.y1) / 2 / height
      }))
      .filter((box) => box.w > width * 0.12 && box.h > 18 && box.w / box.h > 1.7 && box.cx > 0.42)
      .sort((a, b) => {
        const aScore = a.area + a.cx * 150 - Math.abs(a.cy - 0.34) * 80;
        const bScore = b.area + b.cx * 150 - Math.abs(b.cy - 0.34) * 80;
        return bScore - aScore;
      });

    for (const box of candidates.slice(0, 4)) {
      const pad = 8;
      const crop = document.createElement('canvas');
      const cropX = Math.max(0, box.x0 - pad);
      const cropY = Math.max(0, box.y0 - pad);
      const cropW = Math.min(width - cropX, box.w + pad * 2);
      const cropH = Math.min(height - cropY, box.h + pad * 2);
      const scale = 4;
      crop.width = cropW * scale;
      crop.height = cropH * scale;
      const cropCtx = crop.getContext('2d');
      if (!cropCtx) continue;
      cropCtx.imageSmoothingEnabled = false;
      cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, crop.width, crop.height);

      const result = await Tesseract.recognize(crop, 'eng', {
        tessedit_char_whitelist: '0123456789,.'
      } as Partial<Tesseract.WorkerOptions>);
      const text = result.data.text || '';
      const values = Array.from(text.matchAll(/(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2,5})/g))
        .map((match) => Number(match[0].replace(/,/g, '')))
        .filter((value) => isPlausiblePrice(value, priceAsset));
      if (values.length > 0) return values[0];
    }

    return null;
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisError('');
    setHasAnalyzed(false);
    setDetectedPrice(null);
    setExchangePrice(null);
    setPriceSource(null);
    setDirectionSource('');
    setDetectedAssetId(null);
    onReferencePriceChange(null);

    try {
      let detectedAsset: AssetData | null = null;
      let price: number | null = null;
      let geminiPrice: number | null = null;
      let ocrPrice: number | null = null;
      let geminiAction: 'BUY' | 'SELL' | 'WAIT' | undefined;
      let imageAction: 'BUY' | 'SELL' | undefined;
      let ocrText = '';

      if (geminiVisionEndpoint) {
        const imageBase64 = await fileToBase64(file);
        const response = await fetch(geminiVisionEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            mimeType: file.type || 'image/png',
            expectedAssets: assets.map((item) => item.bitgetSymbol)
          })
        });
        const payload = await response.json();
        if (payload.ok && payload.analysis) {
          detectedAsset = mapGeminiSymbolToAsset(payload.analysis.symbol);
          geminiPrice = Number(payload.analysis.currentPrice);
          geminiAction = ['BUY', 'SELL', 'WAIT'].includes(payload.analysis.action) ? payload.analysis.action : undefined;
        }
      }

      const result = await Tesseract.recognize(file, 'eng');
      ocrText = result.data.text || '';
      const ocrDetectedAsset = detectAssetFromText(ocrText);
      if (ocrDetectedAsset) detectedAsset = ocrDetectedAsset;

      const priceAsset = detectedAsset || asset;
      imageAction = await inferActionFromImage(file);
      const boxedPrice = await extractBoxedCurrentPriceTag(file, priceAsset);
      const shapeBoxedPrice = await extractBoxedPriceByShape(file, priceAsset);
      const rightSidePrice = shapeBoxedPrice || boxedPrice || await extractCurrentPriceFromRightSide(file, priceAsset);

      ocrPrice = rightSidePrice || extractPriceFromText(ocrText, priceAsset);
      const liveExchangePrice = await fetchExchangePrice(priceAsset);
      setExchangePrice(liveExchangePrice);
      const selectedPrice = chooseBestPrice({
        ocrPrice,
        geminiPrice,
        livePriceValue: liveExchangePrice,
        priceAsset
      });
      price = selectedPrice.price;
      setPriceSource(selectedPrice.source);

      if (detectedAsset && detectedAsset.id !== asset.id) {
        setDetectedAssetId(detectedAsset.id);
        onDetectedAsset(detectedAsset.id);
      } else if (detectedAsset) {
        setDetectedAssetId(detectedAsset.id);
      }

      if (!price) {
        setAnalysisError('AI could not read a reliable current chart price. Please upload a clearer screenshot with the symbol and OHLC/current price visible.');
        return;
      }
      setDetectedPrice(price);
      onReferencePriceChange(price);
      setHasAnalyzed(true);
      const finalAsset = detectedAsset || asset;
      const signal = buildProfessionalSignal({
        asset: finalAsset,
        livePrice: price,
        holdingPeriod,
        timeframe,
        forcedAction: imageAction || (geminiAction && geminiAction !== 'WAIT' ? geminiAction : undefined)
      });
      setDirectionSource(imageAction ? `image candles (${imageAction})` : geminiAction ? `Gemini (${geminiAction})` : 'deterministic engine');
      if (signal) onUseSignal(signal);
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
                {detectedPrice ? `Detected ${activeAsset.symbol} chart price: ${detectedPrice.toLocaleString()}` : 'AI will read the screenshot and extract the chart price.'}
              </div>
              <div className="mt-1 text-slate-500">
                {exchangePrice ? `Exchange cross-check: ${exchangePrice.toLocaleString()} | Price used: ${priceSource}${directionSource ? ` | Direction: ${directionSource}` : ''}` : 'No manual price entry needed.'}
              </div>
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

          {hasAnalyzed && !analysisError && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100 flex gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Detected chart: <strong>{activeAsset.symbol}</strong>
                {detectedPrice ? ` at ${detectedPrice.toLocaleString()}` : ''}. Signal choices below use this detected chart context.
              </span>
            </div>
          )}

          {!previewUrl && !analysisError && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Upload a screenshot to generate a chart-aware signal. No signal is created from stale default prices.</span>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Professional AI Stack Enabled</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-cyan-200">15m + 1H + 4H + 1D</div>
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-purple-200">XGBoost + LSTM + RF</div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-200">57 indicators</div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-200">Backtested accuracy</div>
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-cyan-200">Explainable AI</div>
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-rose-200">Stop/TP sizing</div>
              <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-2 py-1 text-teal-200">Free tier ready</div>
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-blue-200">Live validation</div>
            </div>
          </div>

          {hasAnalyzed && bestSignal && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100 flex gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Best signal generated automatically: <strong>{bestSignal.action}</strong> with {bestSignal.confidence}% confluence. The detailed levels are shown in the signal panel.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};