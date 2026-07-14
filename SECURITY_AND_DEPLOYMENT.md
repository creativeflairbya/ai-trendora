# ChartSignal AI Security + Deployment Guide

## Backend Security Shield

Use the middleware in:

```text
server/security-shield.mjs
```

It adds:

- Helmet secure headers
- Content Security Policy
- Rate limiting
- Origin allowlist
- Body sanitization
- Webhook signature verification helper
- Anti-clickjacking headers
- Referrer policy
- Permissions policy

## Password Reset Email Backend

Run:

```bash
node server/auth-email-api.mjs
```

Required environment variables:

```env
AUTH_API_PORT=8792
APP_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
SMTP_HOST=smtp.yourmailhost.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=no-reply@yourdomain.com
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@yourdomain.com
```

Frontend env:

```env
VITE_AUTH_API=https://api.yourdomain.com
```

Endpoints:

```text
POST /password-reset
POST /password-change
GET /health
```

## SiteGround / Hostinger Deployment

### Static Frontend

Build locally or on CI:

```bash
npm install
npm run build
```

Upload contents of:

```text
dist/
```

to your public web root:

```text
public_html/
```

### Backend APIs

If using shared hosting, Node backends may not run persistently. Recommended:

- Hostinger VPS
- SiteGround Cloud/VPS with Node support
- Render
- Railway
- Fly.io

Run these as separate Node services:

```bash
node server/gemini-vision-api.mjs
node server/binance-signal-api.mjs
node server/auth-email-api.mjs
```

Then configure frontend env vars before build:

```env
VITE_GEMINI_VISION_API=https://api.yourdomain.com/api/v1/analyze-chart
VITE_AUTH_API=https://api.yourdomain.com
```

## Extra Protection Recommendations

- Put Cloudflare in front of the site
- Enable WAF managed rules
- Enable bot fight mode
- Enable DDoS protection
- Force HTTPS
- Use Turnstile/Captcha for signup and password reset
- Store secrets only in backend env variables
- Never expose Gemini/SMTP/payment keys in frontend
