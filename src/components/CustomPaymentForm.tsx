'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { STRIPE_PLAN_TYPE } from '@/constants';

interface CustomPaymentFormProps {
  planType: STRIPE_PLAN_TYPE;
  clientSecret: string;
}

export default function CustomPaymentForm({ planType, clientSecret }: CustomPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState<string>('1317812522@qq.com');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !email) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          receipt_email: email,
        },
      });

      if (error) {
        setErrorMessage(error.message || '支付失败，请重试');
      }
    } catch (err) {
      console.error('支付处理错误:', err);
      setErrorMessage('支付处理过程中出现错误');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">支付详情</h3>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            电子邮箱
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="your@email.com"
          />
        </div>
        <PaymentElement />
        {errorMessage && <div className="mt-4 text-red-600 text-sm">{errorMessage}</div>}
        <button
          type="submit"
          disabled={!stripe || isProcessing || !email}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? '处理中...' : '确认支付'}
        </button>
      </div>
    </form>
  );
}
