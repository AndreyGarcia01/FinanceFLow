"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/types";
import { TrendingUp, TrendingDown, CalendarDays } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <CalendarDays className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">No transactions yet.</p>
        <p>Add an income or expense to get started!</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="text-right w-[150px]">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="animate-in fade-in-50">
              <TableCell className="font-medium">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <Badge
                  variant={transaction.type === "income" ? "default" : "destructive"}
                  className={`capitalize ${transaction.type === 'income' ? 'bg-accent text-accent-foreground hover:bg-accent/80' : 'bg-destructive text-destructive-foreground hover:bg-destructive/80'}`}
                >
                  {transaction.type === "income" ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-semibold ${
                  transaction.type === "income"
                    ? "text-accent-foreground"
                    : "text-destructive"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
