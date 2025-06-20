"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

interface BalanceDisplayProps {
  balance: number;
}

export default function BalanceDisplay({ balance }: BalanceDisplayProps) {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setDisplayBalance(balance);
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300); // Duration of animation
    return () => clearTimeout(timer);
  }, [balance]);

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(displayBalance);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium text-primary">
          Current Balance
        </CardTitle>
        <DollarSign className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div 
          className={`text-4xl font-bold ${animate ? 'balance-value-animate text-primary' : ''}`}
          // Use key to force re-render and re-trigger animation if desired, but CSS class approach is fine.
          // key={balance} 
        >
          {formattedBalance}
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Your financial snapshot
        </p>
      </CardContent>
    </Card>
  );
}
