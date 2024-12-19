import Stripe from 'stripe';

export const STRIPE_API_VERSION = '2024-11-20.acacia' as Stripe.LatestApiVersion;

export const STRIPE_PRICES = {
  MONTHLY: 'price_1QXObmHoe7Ol6CSIhSX5hOuL',
  YEARLY: 'price_1QXObmHoe7Ol6CSIvVCYZoxE',
};

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: STRIPE_PRICES.MONTHLY,
    name: '月度订阅',
    price: 9.99,
    interval: 'month',
  },
  YEARLY: {
    id: STRIPE_PRICES.YEARLY,
    name: '年度订阅',
    price: 99.99,
    interval: 'year',
  },
};
