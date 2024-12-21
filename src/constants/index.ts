import Stripe from 'stripe';

export const STRIPE_API_VERSION = '2024-11-20.acacia' as Stripe.LatestApiVersion;

export enum STRIPE_PLAN_TYPE {
  Free = 'Free',
  Basic = 'Basic',
  Pro = 'Pro',
}

export const STRIPE_PRICES = {
  [STRIPE_PLAN_TYPE.Free]: '',
  [STRIPE_PLAN_TYPE.Basic]: 'price_1QXObmHoe7Ol6CSIhSX5hOuL',
  [STRIPE_PLAN_TYPE.Pro]: 'price_1QXObmHoe7Ol6CSIvVCYZoxE',
};

export const SUBSCRIPTION_PLANS = {
  [STRIPE_PLAN_TYPE.Free]: {
    id: STRIPE_PLAN_TYPE.Free,
    priceId: STRIPE_PRICES[STRIPE_PLAN_TYPE.Basic],
    name: 'Free',
    price: 0,
    interval: 'month',
  },
  [STRIPE_PLAN_TYPE.Basic]: {
    id: STRIPE_PLAN_TYPE.Basic,
    name: 'Basic',
    priceId: STRIPE_PRICES[STRIPE_PLAN_TYPE.Basic],
    price: 10,
    interval: 'month',
  },
  [STRIPE_PLAN_TYPE.Pro]: {
    id: STRIPE_PLAN_TYPE.Pro,
    name: 'Pro',
    priceId: STRIPE_PRICES[STRIPE_PLAN_TYPE.Pro],
    price: 20,
    interval: 'month',
  },
};
