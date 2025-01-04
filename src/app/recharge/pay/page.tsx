'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/recharge/success`,
      },
    });

    if (submitError) {
      setError(submitError.message ?? '支付失败');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 mt-4 disabled:bg-gray-400"
      >
        {processing ? '处理中...' : '确认支付'}
      </button>
    </form>
  );
}

export default function PayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    const amount = searchParams.get('amount');
    const email = searchParams.get('email');

    if (!amount || !email) {
      router.push('/recharge');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(amount),
            email: email,
          }),
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error:', error);
        alert('创建支付失败，请重试');
        router.push('/recharge');
      }
    };

    createPaymentIntent();
  }, [searchParams, router]);

  if (!clientSecret) {
    return <div className="max-w-md mx-auto p-6">加载中...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">支付</h1>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
          },
        }}
      >
        <CheckoutForm />
      </Elements>
    </div>
  );
}
