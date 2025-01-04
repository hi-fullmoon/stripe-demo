import SubscriptionForm from '@/components/PaymentForm';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-10 text-center">
      <Link href="/subscription" className="text-blue-500 hover:text-blue-700 mr-10">
        订阅
      </Link>
      <Link href="/recharge" className="text-blue-500 hover:text-blue-700">
        充值
      </Link>
    </main>
  );
}
