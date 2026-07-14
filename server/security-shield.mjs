import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityShield = ({ allowedOrigins = [] } = {}) => [
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "https://www.tradingview-widget.com", "https://s3.tradingview.com"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "connect-src": ["'self'", "https://fapi.binance.com", "https://api.bitget.com", "wss://ws.bitget.com", ...allowedOrigins],
        "frame-src": ["'self'", "https://www.tradingview-widget.com", "https://s.tradingview.com"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }),
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Too many requests. Please wait and retry.' }
  }),
  (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.length && origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ ok: false, error: 'Origin blocked by security shield.' });
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  }
];

export const sanitizeBody = (req, _res, next) => {
  const clean = (value) => {
    if (typeof value === 'string') return value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim();
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, clean(val)]));
    }
    return value;
  };
  req.body = clean(req.body || {});
  next();
};

export const verifyWebhookSignature = (secret) => (req, res, next) => {
  if (!secret) return next();
  const signature = req.headers['x-webhook-signature'];
  if (!signature || signature !== secret) {
    return res.status(401).json({ ok: false, error: 'Invalid webhook signature.' });
  }
  next();
};