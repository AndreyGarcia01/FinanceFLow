
"use client";

import { PiggyBank, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
      router.replace('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show a toast message for logout failure
    }
  };

  return (
    <header className="py-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <PiggyBank className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-headline font-bold text-primary">
            FinanceFlow
          </h1>
        </div>
        {isClient && (
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
