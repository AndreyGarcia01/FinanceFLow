
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
import { PiggyBank, LogIn } from "lucide-react";

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const USER_CREDENTIALS_KEY = "financeFlowUserCredentials";
const LOGGED_IN_KEY = "isLoggedIn";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userCredentialsExist, setUserCredentialsExist] = useState(false);

  useEffect(() => {
    try {
      const creds = localStorage.getItem(USER_CREDENTIALS_KEY);
      if (creds) {
        setUserCredentialsExist(true);
      } else {
        router.replace("/setup-account");
      }
    } catch (error) {
        console.error("Error accessing localStorage for credentials check:", error);
        toast({
            title: "Storage Access Error",
            description: "Could not check for an existing user account. Please ensure localStorage is enabled.",
            variant: "destructive",
        });
    }
  }, [router, toast]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const storedCredentialsString = localStorage.getItem(USER_CREDENTIALS_KEY);
      if (!storedCredentialsString) {
        toast({
          title: "Login Failed",
          description: "No account found. Please set up an account first.",
          variant: "destructive",
        });
        router.push("/setup-account");
        setIsLoading(false);
        return;
      }

      const storedCredentials = JSON.parse(storedCredentialsString);

      if (
        data.username === storedCredentials.username &&
        data.password === storedCredentials.password
      ) {
        localStorage.setItem(LOGGED_IN_KEY, "true");
        router.replace("/");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred during login. Check credentials or try setting up your account again.",
        variant: "destructive",
      });
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            {userCredentialsExist ? "Enter your credentials to access your account." : "Redirecting to account setup..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userCredentialsExist ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your username" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Login
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <p className="text-center text-muted-foreground">Loading or redirecting...</p>
          )}
           {!userCredentialsExist && (
             <Button variant="link" className="mt-4 w-full" onClick={() => router.push('/setup-account')}>
                Go to Account Setup
            </Button>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
