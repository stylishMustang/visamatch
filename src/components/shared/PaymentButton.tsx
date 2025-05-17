'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PaymentButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({ className, children = 'fPayment' }: PaymentButtonProps) {
  const router = useRouter();

  const handlePaymentClick = () => {
    router.push('/payment');
  };

  return (
    <Button onClick={handlePaymentClick} className={`bg-green-600 hover:bg-green-700 text-white ${className || ''}`}>
      {children}
    </Button>
  );
}
