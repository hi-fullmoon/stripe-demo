import { NextResponse } from 'next/server';
import { STRIPE_API_VERSION } from '@/constants';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    // 创建PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe使用的是最小货币单位（例如，美分）
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json({ error: 'Error creating payment intent' }, { status: 500 });
  }
}
