import { UserProfile, ServerConfig, AdminPaymentConfig } from '../types';
import { MOCK_ASSETS } from './mockMarkets';
import { PRICING_PLANS } from './pricingPlans';

export const ACCOUNT_PRESETS: Record<string, UserProfile> = {
  master: {
    id: 'usr_master_super_admin_001',
    name: 'Master Account (Unrestricted VIP)',
    email: 'admin@chartanalyst.ai',
    role: 'SUPER_ADMIN',
    isMasterAccount: true,
    planId: 'unlimited',
    creditsRemaining: 'Unlimited',
    maxCredits: 'Unlimited',
    language: 'en',
    currency: 'USD',
    watchlist: ['btc-usdt', 'xau-usd', 'ngas-usd', 'xag-usd', 'sol-usdt'],
    apiKey: 'tr_live_master_998877665544332211_unrestricted',
    serverEndpoint: 'https://api.trendora.ai/v1'
  },
  pro: {
    id: 'usr_pro_trader_882',
    name: 'Carlos Mendoza (Pro Trader)',
    email: 'carlos@mx-crypto.es',
    role: 'PRO_TRADER',
    isMasterAccount: false,
    planId: 'pro',
    creditsRemaining: 114,
    maxCredits: 120,
    language: 'es',
    currency: 'USD',
    watchlist: ['btc-usdt', 'xau-usd'],
    apiKey: 'tr_live_pro_443322110099',
    serverEndpoint: 'https://api.trendora.ai/v1'
  },
  starter: {
    id: 'usr_starter_pk_331',
    name: 'Ahmad Raza (Starter Pass)',
    email: 'ahmad.raza@pk-traders.com',
    role: 'STARTER_USER',
    isMasterAccount: false,
    planId: 'starter',
    creditsRemaining: 9,
    maxCredits: 12,
    language: 'ur',
    currency: 'PKR',
    watchlist: ['xau-usd', 'wti-oil'],
    apiKey: 'tr_live_starter_1122334455',
    serverEndpoint: 'https://api.trendora.ai/v1'
  },
  free: {
    id: 'usr_free_guest_009',
    name: 'Beginner Guest Account',
    email: 'beginner@trendora.ai',
    role: 'FREE_USER',
    isMasterAccount: false,
    planId: 'free',
    creditsRemaining: 3,
    maxCredits: 3,
    language: 'en',
    currency: 'USD',
    watchlist: ['btc-usdt'],
    apiKey: 'tr_live_free_demo_000111',
    serverEndpoint: 'https://api.trendora.ai/v1'
  }
};

export const DEFAULT_ADMIN_PAYMENT_CONFIG: AdminPaymentConfig = {
  easypaisaTillNumber: '0300-9988776 (Till: 88421)',
  easypaisaAccountTitle: 'Trendora AI Solutions PK',
  jazzcashTillNumber: '0301-4433221 (Till: 55219)',
  jazzcashAccountTitle: 'Trendora Market Intelligence',
  sadapayAccountNumber: '0302-1122334',
  sadapayAccountTitle: 'ChartSignal AI',
  binancePayTrc20Address: 'TL8x92mKA982PqxR92TrendoraPayAI99',
  binanceMerchantId: 'MERCHANT_ID_88421990',
  bankAccountTitle: 'Trendora Technologies Pvt Ltd',
  bankIban: 'PK88MEZN0001992288443321',
  bankName: 'Meezan Bank / HBL / Standard Chartered',
  stripePublishableKey: 'pk_live_51M09...TrendoraStripeAI',
  enableLocalWallets: true,
  enableUsdtCrypto: true,
  enableDirectBank: true,
  enableStripeCards: true
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  apiBaseUrl: 'https://api.yourdomain.com/v1',
  websocketFeedUrl: 'wss://ws.yourdomain.com/feed',
  dbType: 'PostgreSQL',
  dbHost: 'db.yourserver.internal',
  dbPort: '5432',
  dbName: 'trendora_prod_db',
  dbUser: 'trendora_admin',
  jwtSecret: 'jwt_sec_live_9988aabbccdd_trendora_hybrid_v50',
  aiEngineModel: 'quantum-hybrid-engine-v5.0-99acc',
  fairUseRateLimit: 300
};

export const GENERATE_SQL_SCHEMA = (): string => {
  return `-- ==============================================================================
-- TRENDORA AI SIGNALS — MASTER DATABASE SCHEMA FOR PRODUCTION (PostgreSQL / MySQL)
-- Version: 5.0.0 Quantum Hybrid Quant Architecture (99% Confluence Engine)
-- Generated for Master Admin Self-Hosting
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'FREE_USER',
    is_master_account BOOLEAN DEFAULT FALSE,
    plan_id VARCHAR(32) DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 3,
    max_credits INTEGER DEFAULT 3,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'USD',
    api_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS markets (
    id VARCHAR(32) PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL,
    name VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL,
    current_price NUMERIC(18, 4) NOT NULL,
    change_24h NUMERIC(8, 2) NOT NULL,
    high_24h NUMERIC(18, 4) NOT NULL,
    low_24h NUMERIC(18, 4) NOT NULL,
    volume_24h VARCHAR(32),
    market_regime VARCHAR(64) NOT NULL,
    rsi_14 NUMERIC(6, 2) NOT NULL,
    macd_status VARCHAR(64) NOT NULL,
    ema_20 NUMERIC(18, 4),
    ema_50 NUMERIC(18, 4),
    support_zone_low NUMERIC(18, 4),
    support_zone_high NUMERIC(18, 4),
    resistance_zone_low NUMERIC(18, 4),
    resistance_zone_high NUMERIC(18, 4),
    setup_quality VARCHAR(16) DEFAULT 'WAIT',
    weak_reason TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id VARCHAR(32) REFERENCES markets(id) ON DELETE CASCADE,
    timeframe VARCHAR(16) NOT NULL,
    action VARCHAR(16) NOT NULL,
    entry_low NUMERIC(18, 4) NOT NULL,
    entry_high NUMERIC(18, 4) NOT NULL,
    stop_loss NUMERIC(18, 4) NOT NULL,
    take_profit_1 NUMERIC(18, 4) NOT NULL,
    take_profit_2 NUMERIC(18, 4) NOT NULL,
    confidence_score INTEGER NOT NULL,
    historical_success_rate INTEGER NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    simple_explanation TEXT NOT NULL,
    advanced_explanation TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS admin_payment_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    easypaisa_till VARCHAR(64),
    easypaisa_title VARCHAR(128),
    jazzcash_till VARCHAR(64),
    jazzcash_title VARCHAR(128),
    binance_trc20 VARCHAR(128),
    bank_iban VARCHAR(64),
    bank_title VARCHAR(128),
    stripe_pub_key VARCHAR(128),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED MASTER ACCOUNT
INSERT INTO users (id, name, email, password_hash, role, is_master_account, plan_id, credits_remaining, max_credits, api_key)
VALUES (
    'usr_master_super_admin_001',
    'Master Account (Unrestricted VIP)',
    'master@trendora.ai',
    '$2b$12$e/91K84/VfV.R4Z7O1G8e.Z8v5R/Xk2p3L4n5M6o7P8q9R0S1T2U3',
    'SUPER_ADMIN',
    TRUE,
    'unlimited',
    -1,
    -1,
    'tr_live_master_998877665544332211_unrestricted'
) ON CONFLICT (id) DO NOTHING;

-- SEED MARKETS (99% Confluence)
INSERT INTO markets (id, symbol, name, category, current_price, change_24h, high_24h, low_24h, market_regime, rsi_14, macd_status, setup_quality)
VALUES 
('btc-usdt', 'BTC/USDT', 'Bitcoin Perpetual', 'crypto', 89420.50, 4.82, 90150.00, 85200.00, 'Quantum Institutional Trend (99% Confluence)', 66.4, 'Super-Trend Crossover', 'HIGH'),
('xau-usd', 'XAU/USD', 'Spot Gold Macro', 'gold', 2928.40, 1.65, 2935.00, 2892.50, 'Smart Money Order Block Squeeze', 61.2, 'Bullish Expansion', 'HIGH'),
('ngas-usd', 'NGAS/USD', 'Natural Gas Henry Hub', 'gas', 3.485, 6.25, 3.520, 3.240, 'Quantum Institutional Trend (99% Confluence)', 68.4, 'Breakout Expansion', 'HIGH'),
('wti-oil', 'WTI/USD', 'Crude Oil WTI Futures', 'oil', 72.15, -1.24, 73.80, 71.40, 'High Volatility (News Sensitive)', 44.1, 'Bearish Convergence', 'WEAK'),
('xag-usd', 'XAG/USD', 'Spot Silver Industrial', 'silver', 33.15, 3.40, 33.50, 31.90, 'Quantum Institutional Trend (99% Confluence)', 64.8, 'Bullish Expansion', 'HIGH'),
('sol-usdt', 'SOL/USDT', 'Solana Layer-1', 'crypto', 198.40, 5.12, 204.00, 188.50, 'Quantum Institutional Trend (99% Confluence)', 65.2, 'Bullish Momentum', 'HIGH')
ON CONFLICT (id) DO NOTHING;
`;
};

export const GENERATE_JSON_DUMP = () => {
  return JSON.stringify({
    metadata: {
      appName: 'Trendora Quantum AI Market Intelligence',
      version: '5.0.0-PRO-HYBRID-99ACC',
      exportTimestamp: new Date().toISOString(),
      schemaType: 'Relational Full Dump'
    },
    masterAccount: ACCOUNT_PRESETS.master,
    paymentGatewaySettings: DEFAULT_ADMIN_PAYMENT_CONFIG,
    pricingPlans: PRICING_PLANS,
    liveMarkets: MOCK_ASSETS,
    serverEnvironment: DEFAULT_SERVER_CONFIG
  }, null, 2);
};
