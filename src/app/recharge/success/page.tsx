'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const [status, setStatus] = useState<'success' | 'processing' | 'error'>('processing');
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    if (paymentIntent) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        {status === 'success' ? '支付成功！' : status === 'processing' ? '正在处理...' : '支付失败'}
      </h1>
      <p className="mb-6">
        {status === 'success' ? '您的账户已经成功充值' : status === 'error' ? '支付过程中发生错误' : '请稍候...'}
      </p>
      <Link href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
        返回首页
      </Link>
    </div>
  );
}
