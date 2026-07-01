export type MarketCategory = 'crypto' | 'gold' | 'oil' | 'gas' | 'silver';

export type Timeframe = '15m' | '1H' | '4H' | '1D';

export type SignalAction = 'BUY' | 'SELL' | 'WAIT';

export type MarketRegime = 'Quantum Institutional Trend (99% Confluence)' | 'Smart Money Order Block Squeeze' | 'Trending Bullish' | 'Trending Bearish' | 'Ranging Consolidated' | 'High Volatility (News Sensitive)';

export type LanguageCode = 'en' | 'es' | 'ar' | 'ur' | 'fr';

export type UserRole = 'SUPER_ADMIN' | 'PRO_TRADER' | 'STARTER_USER' | 'FREE_USER';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetData {
  id: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  tradingViewSymbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  regime: MarketRegime;
  rsi: number;
  macd: string;
  ema20: number;
  ema50: number;
  supportZone: [number, number];
  resistanceZone: [number, number];
  candles: Record<Timeframe, Candle[]>;
  setupQuality: 'HIGH' | 'WEAK' | 'WAIT';
  currentSignal?: {
    action: SignalAction;
    entryZone: [number, number];
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    confidence: number;
    historicalSuccessRate: number;
    riskLevel: 'Zero-Ruin Shield' | 'Low' | 'Medium' | 'High';
    timeframe: Timeframe;
    holdingDuration: string;
    simpleExplanation: string;
    advancedExplanation: string;
    similarHistory: {
      date: string;
      asset: string;
      outcome: '+4.8% Institutional Target Hit' | '+3.5% Quant Precision Hit' | 'Breakeven / Capital Shielded';
      confidenceWhenIssued: number;
    }[];
  };
  weakReason?: string;
  saferAlternatives?: {
    assetId: string;
    symbol: string;
    name: string;
    confidence: number;
    action: SignalAction;
    reason: string;
  }[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  signalsCount: string;
  validity: string;
  markets: string[];
  features: string[];
  highlight?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isMasterAccount: boolean;
  planId: string;
  creditsRemaining: number | 'Unlimited';
  maxCredits: number | 'Unlimited';
  language: LanguageCode;
  currency: 'USD' | 'PKR' | 'EUR';
  watchlist: string[];
  apiKey: string;
  serverEndpoint: string;
}

export interface AdminPaymentConfig {
  easypaisaTillNumber: string;
  easypaisaAccountTitle: string;
  jazzcashTillNumber: string;
  jazzcashAccountTitle: string;
  binancePayTrc20Address: string;
  binanceMerchantId: string;
  bankAccountTitle: string;
  bankIban: string;
  bankName: string;
  stripePublishableKey: string;
  enableLocalWallets: boolean;
  enableUsdtCrypto: boolean;
  enableDirectBank: boolean;
  enableStripeCards: boolean;
}

export interface ServerConfig {
  apiBaseUrl: string;
  websocketFeedUrl: string;
  dbType: 'PostgreSQL' | 'MySQL' | 'MongoDB';
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  jwtSecret: string;
  aiEngineModel: string;
  fairUseRateLimit: number;
}
