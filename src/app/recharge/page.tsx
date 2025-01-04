'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RechargeAmounts = [10, 20, 30];

export default function RechargePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRecharge = async () => {
    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount <= 0) {
      alert('请选择或输入有效的充值金额');
      return;
    }

    if (!email) {
      setEmailError('请输入邮箱地址');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }

    try {
      router.push(`/recharge/pay?amount=${amount}&email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Error:', error);
      alert('跳转失败，请重试');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">充值</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {RechargeAmounts.map((amount) => (
          <button
            key={amount}
            className={`p-4 rounded-lg border ${
              selectedAmount === amount
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 hover:border-blue-500'
            }`}
            onClick={() => {
              setSelectedAmount(amount);
              setCustomAmount('');
            }}
          >
            ${amount}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">自定义金额</label>
        <input
          type="number"
          className="w-full p-2 border rounded-lg"
          placeholder="输入充值金额"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setSelectedAmount(0);
          }}
          min="0"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">邮箱地址</label>
        <input
          type="email"
          className={`w-full p-2 border rounded-lg ${emailError ? 'border-red-500' : ''}`}
          placeholder="请输入邮箱地址"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
        />
        {emailError && <div className="text-red-500 text-sm mt-1">{emailError}</div>}
      </div>

      <button className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600" onClick={handleRecharge}>
        继续支付
      </button>
    </div>
  );
}
