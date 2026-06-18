"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email");

  async function onSubmit(data: LoginInput) {
    setError(null);
    setNeedsVerification(false);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      const statusResponse = await fetch("/api/auth/account-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const status = await statusResponse.json().catch(() => ({}));

      if (status?.data?.needsVerification) {
        sessionStorage.setItem("signup_password", data.password);
        setNeedsVerification(true);
        setError("Your email isn't verified yet. Enter the 6-digit code we sent you.");
        return;
      }

      setError(getAuthErrorMessage(authError.message));
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <Card glass className="w-full max-w-md">
      <CardHeader className="text-center">
        <Logo size={48} className="mx-auto mb-4" />
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your {APP_NAME} account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-ascend-purple hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>
          {error && (
            <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-3 text-sm text-red-400">
              {error}
              {needsVerification && emailValue && (
                <p className="mt-2">
                  <Link
                    href={`/verify?registered=true&email=${encodeURIComponent(emailValue)}`}
                    className="text-ascend-purple hover:underline font-medium"
                  >
                    Enter verification code
                  </Link>
                </p>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-ascend-purple hover:underline font-medium">
            Start Free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
