'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CustomPaymentForm from '@/components/CustomPaymentForm';
import { SUBSCRIPTION_PLANS, STRIPE_PLAN_TYPE } from '@/constants';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<STRIPE_PLAN_TYPE>(STRIPE_PLAN_TYPE.Basic);
  const [clientSecret, setClientSecret] = useState<string>('');

  const handlePlanSelect = async (planType: STRIPE_PLAN_TYPE) => {
    setSelectedPlan(planType);
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: SUBSCRIPTION_PLANS[planType].priceId,
        }),
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('创建支付意向失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">选择订阅计划</h2>
          <p className="mt-4 text-xl text-gray-600">选择最适合您需求的计划</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border ${
                selectedPlan === plan.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
              } bg-white p-6 shadow-sm`}
            >
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">¥{plan.price}</span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">/{plan.interval}</span>
                </p>
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {selectedPlan === plan.id ? '已选择' : '选择此计划'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {clientSecret && !isLoading && (
          <div className="mt-12 max-w-md mx-auto">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0070f3',
                  },
                },
              }}
            >
              <CustomPaymentForm planType={selectedPlan} clientSecret={clientSecret} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
