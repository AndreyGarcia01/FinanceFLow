
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Transaction } from "@/types";
import Header from "@/components/layout/Header";
import BalanceDisplay from "@/components/BalanceDisplay";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const loggedIn = localStorage.getItem("isLoggedIn");
      if (loggedIn === "true") {
        setIsAuthenticated(true);
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.replace("/login"); // Fallback to login on error
    } finally {
      setIsAuthCheckComplete(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || !isAuthCheckComplete) return;

    try {
      const storedTransactions = localStorage.getItem("financeFlowTransactions");
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error("Failed to load transactions from localStorage:", error);
      toast({
        title: "Error",
        description: "Could not load transactions from local storage.",
        variant: "destructive",
      });
    }
    setIsInitialLoadComplete(true);
  }, [toast, isAuthenticated, isAuthCheckComplete]);

  useEffect(() => {
    if (!isAuthenticated || !isInitialLoadComplete || !isAuthCheckComplete) return;
    
    try {
      localStorage.setItem("financeFlowTransactions", JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage:", error);
       toast({
        title: "Error",
        description: "Could not save transactions to local storage.",
        variant: "destructive",
      });
    }
  }, [transactions, isInitialLoadComplete, toast, isAuthenticated, isAuthCheckComplete]);

  const balance = useMemo(() => {
    if (!isAuthenticated) return 0;
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === "income") {
        return acc + transaction.amount;
      } else {
        return acc - transaction.amount;
      }
    }, 0);
  }, [transactions, isAuthenticated]);

  const handleAddTransaction = (data: Omit<Transaction, "id" | "date">) => {
    if (!isAuthenticated) return;
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
    toast({
      title: "Transaction Added",
      description: `${data.type === 'income' ? 'Income' : 'Expense'} of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.amount)} recorded.`,
      className: data.type === 'income' ? 'bg-accent text-accent-foreground' : 'bg-card border-border',
    });
  };
  
  const sortedTransactions = useMemo(() => {
    if (!isAuthenticated) return [];
    return [...transactions];
  }, [transactions, isAuthenticated]);

  if (!isAuthCheckComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally not be reached if redirection works properly
    // but serves as a fallback.
    return null; 
  }

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <BalanceDisplay balance={balance} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">New Transaction</CardTitle>
              <CardDescription>Add your income or expense details below.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Transaction History</CardTitle>
              <CardDescription>View all your recorded incomes and expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={sortedTransactions} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
