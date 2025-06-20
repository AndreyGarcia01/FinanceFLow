
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Transaction } from "@/types";
import Header from "@/components/layout/Header";
import BalanceDisplay from "@/components/BalanceDisplay";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const USER_CREDENTIALS_KEY = "financeFlowUserCredentials";
const LOGGED_IN_KEY = "isLoggedIn";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let loggedIn = false;
    let credentialsExist = false;

    try {
      loggedIn = localStorage.getItem(LOGGED_IN_KEY) === "true";
      credentialsExist = !!localStorage.getItem(USER_CREDENTIALS_KEY);
    } catch (error) {
      console.error("Auth check failed (localStorage access):", error);
      toast({
        title: "Access Error",
        description: "Could not verify login status. Please ensure cookies/localStorage are enabled.",
        variant: "destructive",
      });
      router.replace("/setup-account"); // Fallback if localStorage is inaccessible
      setIsAuthCheckComplete(true);
      return;
    }

    if (loggedIn) {
      setIsAuthenticated(true);
    } else {
      if (credentialsExist) {
        router.replace("/login");
      } else {
        router.replace("/setup-account");
      }
    }
    setIsAuthCheckComplete(true);
  }, [router, toast]);

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
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === "income") {
        return acc + transaction.amount;
      } else {
        return acc - transaction.amount;
      }
    }, 0);
  }, [transactions]);

  const handleAddTransaction = (data: Omit<Transaction, "id" | "date">) => {
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
    return [...transactions];
  }, [transactions]);

  if (!isAuthCheckComplete || !isAuthenticated) {
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
