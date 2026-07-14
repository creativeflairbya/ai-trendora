# ChartSignal AI Binance Signal API

This backend uses Binance free futures APIs for structured signal generation.

## Run API

```bash
npm install
node server/binance-signal-api.mjs
```

Default port:

```text
8790
```

## Generate Signal

```text
GET /api/v1/signal/BTCUSDT?timeframes=5m,15m,30m
```

Example:

```bash
curl "http://localhost:8790/api/v1/signal/BTCUSDT?timeframes=5m,15m,30m"
```

## Multi-Timeframe Confluence

The API analyzes each requested timeframe separately.

Example logic:

```text
5m bullish + 15m bullish + 30m bullish = BUY
5m bearish + 15m bearish + 30m bearish = SELL
mixed bullish/bearish = WAIT
```

## Confluence Score

Score range:

```text
-5 to +5
```

Inputs:

- RSI
- MACD
- EMA20 / EMA50
- Bollinger Bands
- Volume confirmation

## Futures Metrics

The API also fetches:

- Binance futures price
- Mark price
- Funding rate
- Open interest

## Signal Logging

Every generated signal logs:

- timestamp
- symbol
- action
- entry zone
- stop-loss
- take-profit 1
- take-profit 2
- status
- outcome

## View Logs

```text
GET /api/v1/signals
```

## Public Stats

```text
GET /api/v1/stats
```

Returns:

- total signals
- pending
- won
- lost
- win rate
- average R:R
- drawdown placeholder

## Auto Resolve Outcomes

```text
POST /api/v1/resolve
```

This checks current price and updates pending signals to:

```text
Won / Lost / Pending
```

## 90-Day Backtesting

Before publishing a strategy, run a 90-day historical replay using Binance klines and the same confluence function.

Recommended future endpoint:

```text
GET /api/v1/backtest/BTCUSDT?timeframes=5m,15m,30m&period=90d
```
