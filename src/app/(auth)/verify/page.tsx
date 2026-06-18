"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { verifyCodeSchema, type VerifyCodeInput } from "@/lib/validations";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const justRegistered = searchParams.get("registered") === "true";
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Pick<VerifyCodeInput, "code">>({
    resolver: zodResolver(verifyCodeSchema.pick({ code: true })),
    defaultValues: { code: "" },
  });

  async function onSubmit({ code }: Pick<VerifyCodeInput, "code">) {
    setError(null);

    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailParam, code }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(getAuthErrorMessage(result.error || "Verification failed"));
      return;
    }

    setVerified(true);
    router.replace("/verify?verified=true");
  }

  if (searchParams.get("verified") === "true" || verified) {
    return (
      <Card glass className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-400/10">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle>Email Verified</CardTitle>
          <CardDescription>
            Your email has been verified. You can now access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!justRegistered || !emailParam) {
    return (
      <Card glass className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Create an account first, then enter the code we email you.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ascend-purple/10">
          <Mail className="h-8 w-8 text-ascend-purple" />
        </div>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <strong className="text-foreground">{emailParam}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              {...register("code")}
            />
            {errors.code && <p className="text-xs text-red-400">{errors.code.message}</p>}
          </div>
          {error && (
            <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code? Check your spam folder or{" "}
          <Link href="/register" className="text-ascend-purple hover:underline">
            try signing up again
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Suspense>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
