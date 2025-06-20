"use client";

import { useState, useEffect, useMemo } from "react";
import type { Transaction } from "@/types";
import Header from "@/components/layout/Header";
import BalanceDisplay from "@/components/BalanceDisplay";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
  }, [toast]);

  useEffect(() => {
    if (isInitialLoadComplete) {
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
    }
  }, [transactions, isInitialLoadComplete, toast]);

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
      className: data.type === 'income' ? 'bg-accent border-accent text-accent-foreground' : 'bg-card border-border',
    });
  };
  
  // Display transactions in chronological order for the table (newest first)
  const sortedTransactions = useMemo(() => [...transactions], [transactions]);


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
