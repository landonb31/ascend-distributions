"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function VerifyContent() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  return (
    <Card glass className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ascend-purple/10">
          {justRegistered ? (
            <Mail className="h-8 w-8 text-ascend-purple" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-400" />
          )}
        </div>
        <CardTitle>
          {justRegistered ? "Check your email" : "Email Verified"}
        </CardTitle>
        <CardDescription>
          {justRegistered
            ? "We've sent a verification link to your email address. Click the link to activate your account."
            : "Your email has been verified. You can now access your dashboard."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {justRegistered ? (
          <p className="text-sm text-muted-foreground mb-6">
            Didn&apos;t receive the email? Check your spam folder or contact support.
          </p>
        ) : null}
        <Button asChild>
          <Link href={justRegistered ? "/login" : "/dashboard"}>
            {justRegistered ? "Go to Login" : "Go to Dashboard"}
          </Link>
        </Button>
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
