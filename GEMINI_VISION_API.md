# Gemini Vision Chart Analyzer

This backend analyzes uploaded chart screenshots with Gemini and returns a structured trading-analysis JSON response.

## Important Security Note

Never put your Gemini key in React/frontend code.

If you pasted a real key into chat or code, rotate it in Google AI Studio and create a new one.

## Environment Variables

```bash
GEMINI_API_KEY=your_new_gemini_key
GEMINI_VISION_PORT=8791
```

## Run

```bash
node server/gemini-vision-api.mjs
```

Health check:

```text
http://localhost:8791/health
```

## Endpoint

```text
POST /api/v1/analyze-chart
```

Body:

```json
{
  "imageBase64": "base64_without_data_url_prefix",
  "mimeType": "image/png",
  "expectedAssets": ["BTCUSDT", "ETHUSDT", "XAUUSDT"]
}
```

Response:

```json
{
  "ok": true,
  "analysis": {
    "symbol": "ETHUSDT",
    "assetName": "Ethereum",
    "currentPrice": 1784.88,
    "action": "BUY",
    "confidence": 92,
    "riskLevel": "Medium",
    "timeframe": "1D",
    "reason": "..."
  }
}
```

## Frontend Connection

Set this in your frontend build environment:

```env
VITE_GEMINI_VISION_API=https://your-backend-domain.com/api/v1/analyze-chart
```
