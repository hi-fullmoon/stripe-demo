import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_API_VERSION } from '@/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    // 获取价格信息
    const price = await stripe.prices.retrieve(priceId);

    // 创建支付意向
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount || 0,
      currency: price.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        priceId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('创建支付意向失败:', error);
    return NextResponse.json({ error: '创建支付意向失败' }, { status: 500 });
  }
}
