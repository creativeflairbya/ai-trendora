import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { securityShield, sanitizeBody } from './security-shield.mjs';

const app = express();
const PORT = Number(process.env.AUTH_API_PORT || 8792);
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);

app.use(cors({ origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : true }));
app.use(express.json({ limit: '1mb' }));
app.use(...securityShield({ allowedOrigins: ALLOWED_ORIGINS }));
app.use(sanitizeBody);

const resetTokens = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ChartSignal Auth Email API', smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER) });
});

app.post('/password-reset', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ ok: false, message: 'Valid email required.' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 30;
  resetTokens.set(token, { email, expiresAt });
  const resetUrl = `${APP_URL.replace(/\/$/, '')}/reset-password?resetToken=${token}`;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return res.json({ ok: true, message: 'Reset token created. Configure SMTP to send real emails.', resetUrl });
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'ChartSignal AI Password Reset',
    html: `<p>Click the secure link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  });

  res.json({ ok: true, message: 'Password reset email sent.' });
});

app.post('/password-change', (req, res) => {
  const token = String(req.body.token || '');
  const password = String(req.body.password || '');
  const record = resetTokens.get(token);
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ ok: false, message: 'Invalid or expired reset token.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' });
  }
  resetTokens.delete(token);
  res.json({ ok: true, message: 'Password changed. Connect this endpoint to your production database user table.' });
});

app.listen(PORT, () => {
  console.log(`ChartSignal Auth Email API running on http://localhost:${PORT}`);
});