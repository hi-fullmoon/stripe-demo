import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_API_VERSION } from '@/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json();

    // 取消订阅
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true, // 在当前周期结束时取消
      // 如果要立即取消，使用下面的方式：
      // cancel_at: 'now'
    });

    return NextResponse.json({
      success: true,
      cancelAt: subscription.cancel_at,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (error: any) {
    console.error('取消订阅失败:', error);
    return NextResponse.json({ error: '取消订阅失败', details: error.message }, { status: 500 });
  }
}
