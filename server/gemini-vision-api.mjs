import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.GEMINI_VISION_PORT || 8791);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '12mb' }));

const safeJsonParse = (text) => {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  const slice = first >= 0 && last > first ? cleaned.slice(first, last + 1) : cleaned;
  return JSON.parse(slice);
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ChartSignal Gemini Vision API', hasKey: Boolean(GEMINI_API_KEY) });
});

app.post('/api/v1/analyze-chart', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ ok: false, error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { imageBase64, mimeType = 'image/png', expectedAssets = [] } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ ok: false, error: 'imageBase64 is required.' });
    }

    const prompt = `You are a professional futures chart analyst for a trading signal app.
Analyze the uploaded chart screenshot and return ONLY valid JSON.

Task:
1. Identify the exact trading symbol/pair visible in the screenshot.
2. Extract the current/last chart price from the screenshot. Prefer the boxed price tag on the far right edge connected to the dotted/current price line.
3. Determine whether the best futures signal is BUY, SELL, or WAIT.
4. Estimate risk level: Low, Medium, High, or Zero-Ruin Shield.
5. Explain the reason briefly.

Important:
- Do not confuse MA/support/indicator values with current chart price.
- Do not use candle high/low annotations as current price. Example: if the chart shows a wick high 1,817.56 but the right-side boxed current label is 1,813.61, return 1,813.61.
- If the chart says ETHUSDT, symbol must be ETHUSDT, not XAU.
- If unsure, return WAIT and confidence below 80.
- Supported/expected assets: ${expectedAssets.join(', ')}.

JSON schema:
{
  "symbol": "ETHUSDT",
  "assetName": "Ethereum",
  "currentPrice": 1784.88,
  "action": "BUY",
  "confidence": 92,
  "riskLevel": "Medium",
  "timeframe": "1D",
  "reason": "...",
  "detectedTextHints": ["ETHUSDT", "C 1784.88"]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(500).json({ ok: false, error: payload.error?.message || 'Gemini request failed.' });
    }

    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '{}';
    const parsed = safeJsonParse(text);
    return res.json({ ok: true, analysis: parsed });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`ChartSignal Gemini Vision API running on http://localhost:${PORT}`);
});