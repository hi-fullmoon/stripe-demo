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

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('webhook event', event.type, event);

    switch (event.type) {
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        // 记录新订阅的完整信息
        const subscriptionData = {
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          status: subscription.status,
          priceId: subscription.items.data[0].price.id,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          createdAt: new Date(subscription.created * 1000),
          // 添加计划类型标识
          planType: subscription.items.data[0].price.id === process.env.STRIPE_FREE_PRICE_ID ? 'free' : 'paid',
        };

        // TODO: 将订阅信息存入数据库
        console.log('新订阅创建:', subscriptionData);
        // 新订阅创建时
        // 1. 记录订阅信息
        // 2. 激活用户权限
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        const updatedData = {
          subscriptionId: updatedSubscription.id,
          status: updatedSubscription.status,
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
          pastDueTime: updatedSubscription.status === 'past_due' ? new Date() : null,
          // 重要的状态：
          // - active: 正常
          // - past_due: 逾期
          // - unpaid: 未付款
          // - canceled: 已取消
        };

        // TODO: 根据不同状态采取相应措施
        switch (updatedSubscription.status) {
          case 'past_due':
            // 1. 更新数据库状态
            // 2. 发送提醒邮件
            // 3. 可以给一定的宽限��
            break;
          case 'unpaid':
            // 1. 更新数据库状态
            // 2. 降级用户权限
            // 3. 发送最终通知
            break;
        }

        console.log('订阅更新:', updatedData);
        // 订阅状态更新时（比如：active -> past_due）
        // 1. 更新订阅状态
        // 2. 根据状态调整用户权限
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedData = {
          subscriptionId: deletedSubscription.id,
          status: deletedSubscription.status, // 变为 canceled
          canceledAt: new Date(deletedSubscription.canceled_at! * 1000),
          cancelReason: deletedSubscription.cancellation_details?.reason, // 'payment_failed'
          finalStatus: 'unpaid', // 最终状态为未支付
        };

        // TODO:
        // 1. 更新数据库订阅状态为 canceled
        // 2. 降级用户权限
        // 3. 发送通知邮件
        console.log('订阅取消:', deletedData);
        // 订阅被取消时
        // 1. 更新订阅状态为已取消
        // 2. 降级用户权限
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('支付流程完成:', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });
        // 首次订阅支付完成
        // 1. 确认支付成功
        // 2. 记录支付信息
        break;
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        // 这些是需要持久化存储的关键 ID
        const paymentData = {
          paymentIntentId: invoice.payment_intent, // 支付交易ID（主要）
          subscriptionId: invoice.subscription, // 订阅ID（订阅相关）
          invoiceId: invoice.id, // 发票ID
          customerId: invoice.customer, // 客户ID
          amount: invoice.total,
          status: invoice.status,
          paymentDate: new Date(invoice.created * 1000),
        };

        // TODO: 将 paymentData 存入数据库
        console.log('收费成功:', paymentData);
        // 续费支付成功
        // 1. 记录支付记录
        // 2. 更新订阅状态
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        // 订阅状态会变为 past_due（逾期）
        const failureData = {
          subscriptionId: failedInvoice.subscription,
          customerId: failedInvoice.customer,
          attemptCount: failedInvoice.attempt_count,
          nextPaymentAttempt: failedInvoice.next_payment_attempt,
          // 重要：订阅此时会变成 past_due 状态
          subscriptionStatus: 'past_due',
        };

        // TODO:
        // 1. 更新数据库中的订阅状态为 past_due
        // 2. 发送邮件通知用户支付失败
        console.log('支付失败:', failureData);
        // 支付失败
        // 1. 更新订阅状态为 past_due
        // 2. 发送提醒邮件
        break;

      case 'customer.subscription.trial_will_end':
        // 试用期即将结束
        // 发送提醒邮件
        break;

      case 'customer.subscription.pending_update_applied':
        // 订阅计划变更生效
        // 更新用户权限
        break;

      case 'invoice.upcoming':
        // 即将扣费
        // 发送提醒邮件
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // 处理支付成功逻辑
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook 错误:', error);
    return NextResponse.json({ error: 'Webhook 处理错误' }, { status: 400 });
  }
}
