'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { SUBSCRIPTION_PLANS } from '@/constants';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

const EMAIL = '1317812522@qq.com';

export default function SubscriptionForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS.MONTHLY);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan.id,
          email: EMAIL,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || '订阅创建失败');
      }

      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        if (error) {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('订阅出错:', error);
      setError(error.message || '创建订阅时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">选择订阅计划</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="space-y-4">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <div
            key={plan.id}
            className={`p-4 border rounded-lg cursor-pointer ${selectedPlan.id === plan.id ? 'border-blue-500' : 'border-gray-200'}`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3 className="font-semibold">{plan.name}</h3>
            <p className="text-gray-600">
              ${plan.price}/{plan.interval}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '处理中...' : '订阅'}
      </button>
    </div>
  );
}
