import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { STRIPE_API_VERSION } from '@/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature')!;
  console.log('signature', signature);
  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('webhook event', event.type, event);

    switch (event.type) {
      case 'customer.subscription.created':
        // 处理新订阅
        // 在这里更新数据库中的用户订阅状态
        break;
      case 'customer.subscription.updated':
        // 处理订阅更新
        break;

      case 'customer.subscription.deleted':
        // 处理订阅取消
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook 错误:', error);
    return NextResponse.json({ error: 'Webhook 处理错误' }, { status: 400 });
  }
}
