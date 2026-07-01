import { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: '$0',
    period: 'forever',
    signalsCount: '3 Total Requests',
    validity: 'Lifetime Access',
    markets: ['Crypto', 'Gold', 'Oil', 'Silver'],
    features: [
      '3 free signal requests total',
      'All 4 supported markets included',
      'Standard confidence analysis',
      'Simple plain-language explanation',
      'Safer alternative suggestions if no signal found',
      'Zero risk Capital Shield calculator'
    ]
  },
  {
    id: 'starter',
    name: 'Starter Pass',
    price: '$2.99',
    period: '7 days',
    badge: 'Popular Entry',
    signalsCount: '12 Signal Requests',
    validity: 'Valid for 7 days',
    markets: ['Crypto', 'Gold', 'Oil', 'Silver'],
    features: [
      '12 signal requests across all 4 markets',
      'Valid for 7 full days',
      'Simple explanation engine',
      'Confidence + Risk view meter',
      'Full signal history & outcome tracking',
      'Access to Capital Shield sizing tool'
    ]
  },
  {
    id: 'active',
    name: 'Active Trader',
    price: '$9.99',
    period: '30 days',
    badge: 'Best Value',
    highlight: true,
    signalsCount: '25 Signal Requests',
    validity: 'Valid for 30 days',
    markets: ['Crypto', 'Gold', 'Oil', 'Silver'],
    features: [
      '25 high-precision signal requests',
      'Valid for 30 full days',
      'Enhanced signal history & analytics',
      'Watchlist real-time price alerts',
      'Multi-timeframe signal comparison view (15m to 1D)',
      'Safer alternative opportunity routing'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Trader',
    price: '$29.99',
    period: '30 days',
    badge: 'Pro Choice',
    signalsCount: '120 Signal Requests',
    validity: 'Valid for 30 days',
    markets: ['Crypto', 'Gold', 'Oil', 'Silver'],
    features: [
      '120 signal requests across all markets',
      'Advanced AI explanation mode (Full quant engine breakdown)',
      'Block Allocation Assistant (Capital Shield precision calculator)',
      'Priority signal generation queue (<1 sec latency)',
      'Deeper win-rate analytics & historical drawdown view',
      'Custom alert webhooks & sound notifications'
    ]
  },
  {
    id: 'unlimited',
    name: 'Unlimited VIP',
    price: '$39.99',
    period: 'per month',
    badge: 'Ultimate Power',
    signalsCount: 'Unlimited Requests',
    validity: 'Monthly Auto-Renew / Fair-Use',
    markets: ['Crypto', 'Gold', 'Oil', 'Silver'],
    features: [
      'Unlimited AI signal requests (Fair-use backend protection)',
      'Full AI Explanation + Quant Deep-Dive',
      'Safer alternative recommendation engine',
      'Unlimited Watchlist + Instant Real-Time Alerts',
      'Multi-timeframe hybrid engine scanner',
      'Advanced Terminal Dashboard & Top Opportunities Scanner',
      'Highest VIP processing priority & 24/7 dedicated support'
    ]
  }
];
