
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, PiggyBank } from "lucide-react";

const setupFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type SetupFormValues = z.infer<typeof setupFormSchema>;

const USER_CREDENTIALS_KEY = "financeFlowUserCredentials";

export default function SetupAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If credentials already exist, redirect to login or home.
    // This prevents re-setup if user navigates here directly.
    try {
      if (localStorage.getItem(USER_CREDENTIALS_KEY)) {
        // If already set up, maybe they want to login
        router.replace('/login');
      }
    } catch (error) {
      console.error("Error checking existing credentials:", error);
       toast({
        title: "Storage Access Error",
        description: "Could not check for existing setup. Please ensure localStorage is enabled.",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: SetupFormValues) => {
    setIsLoading(true);
    try {
      localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(data));
      // Clear any existing login state to force re-login with new/updated credentials
      localStorage.removeItem("isLoggedIn"); 
      toast({
        title: "Account Setup Successful",
        description: "You can now log in with your credentials.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Storage Error",
        description: "Could not save your credentials. Please ensure localStorage is enabled and try again.",
        variant: "destructive",
      });
      console.error("Failed to save credentials:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center space-x-2">
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary">FinanceFlow</h1>
          </div>
          <CardTitle className="text-2xl">Setup Your Account</CardTitle>
          <CardDescription>
            Create a username and password to access FinanceFlow.
            This information will be stored locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Choose a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Setting up..." : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Create Account
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
