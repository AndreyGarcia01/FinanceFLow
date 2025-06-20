"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction } from "@/types";
import { PlusCircle, MinusCircle } from "lucide-react";

const transactionFormSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }).max(100, { message: "Description must be 100 characters or less." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  type: z.enum(["income", "expense"], {
    required_error: "Please select a transaction type.",
  }),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onAddTransaction: (data: Omit<Transaction, "id" | "date">) => void;
}

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
    },
  });

  function onSubmit(data: TransactionFormValues) {
    onAddTransaction(data);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries, Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">
                    <div className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4 text-accent-foreground" />
                      Income
                    </div>
                  </SelectItem>
                  <SelectItem value="expense">
                     <div className="flex items-center">
                      <MinusCircle className="mr-2 h-4 w-4 text-destructive" />
                      Expense
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">Add Transaction</Button>
      </form>
    </Form>
  );
}
