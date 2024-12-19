import { STRIPE_API_VERSION } from '@/constants';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export async function POST(request: Request) {
  try {
    const { priceId, email } = await request.json();

    // 查找或创建 customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: {
          // 可以添加其他元数据
          createdAt: new Date().toISOString(),
        },
      });
    }

    console.log('customer', customer);

    // 创建 checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      metadata: {
        customerId: customer.id,
        priceId,
      },
    });
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('创建订阅失败:', error);
    return NextResponse.json(
      {
        error: '创建订阅时出错',
        details: error.message,
        type: error.type,
      },
      { status: 500 }
    );
  }
}
