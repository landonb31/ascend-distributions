"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { payoutSchema, type PayoutInput } from "@/lib/validations";
import {
  cn,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
  MIN_PAYOUT_AMOUNT,
} from "@/lib/utils";
import type { Payout } from "@/types";

interface PayoutFormProps {
  availableBalance: number;
  payouts: Payout[];
}

export function PayoutForm({ availableBalance, payouts }: PayoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"paypal" | "bank_transfer">("paypal");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PayoutInput>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      amount: Math.max(availableBalance, MIN_PAYOUT_AMOUNT),
      method: "paypal",
    },
  });

  async function onSubmit(data: PayoutInput) {
    setError(null);

    if (data.amount > availableBalance) {
      setError(`Insufficient balance. Available: ${formatCurrency(availableBalance)}`);
      return;
    }

    if (data.method === "paypal" && !data.paypalEmail) {
      setError("PayPal email is required.");
      return;
    }

    if (data.method === "bank_transfer") {
      const details = data.bankDetails;
      if (!details?.accountName || !details?.accountNumber || !details?.routingNumber || !details?.bankName) {
        setError("All bank details are required.");
        return;
      }
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    const { error: insertError } = await supabase.from("payouts").insert({
      user_id: user.id,
      amount: data.amount,
      method: data.method,
      paypal_email: data.method === "paypal" ? data.paypalEmail : null,
      bank_details: data.method === "bank_transfer" ? data.bankDetails : null,
      status: "pending",
    });

    if (insertError) {
      setError("Failed to submit payout request. Please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader>
            <CardTitle className="text-base">Request Payout</CardTitle>
            <CardDescription>
              Minimum payout is {formatCurrency(MIN_PAYOUT_AMOUNT)}. Available balance:{" "}
              <span className="font-medium text-foreground">{formatCurrency(availableBalance)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableBalance < MIN_PAYOUT_AMOUNT ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Wallet className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  You need at least {formatCurrency(MIN_PAYOUT_AMOUNT)} in pending royalties to request a payout.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min={MIN_PAYOUT_AMOUNT}
                    max={availableBalance}
                    {...register("amount", { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-400">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Payout Method</Label>
                  <Select
                    value={method}
                    onValueChange={(v) => {
                      const m = v as "paypal" | "bank_transfer";
                      setMethod(m);
                      setValue("method", m);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {method === "paypal" && (
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      placeholder="you@paypal.com"
                      {...register("paypalEmail")}
                    />
                  </div>
                )}

                {method === "bank_transfer" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" {...register("bankDetails.bankName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input id="accountName" {...register("bankDetails.accountName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input id="routingNumber" {...register("bankDetails.routingNumber")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" {...register("bankDetails.accountNumber")} />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Payout"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-base">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Wallet className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No payout requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 font-medium">Amount</th>
                      <th className="pb-3 pr-4 font-medium">Method</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-b border-white/[0.04]">
                        <td className="py-3 pr-4 text-muted-foreground">{formatDate(p.created_at)}</td>
                        <td className="py-3 pr-4 font-medium">{formatCurrency(Number(p.amount))}</td>
                        <td className="py-3 pr-4 capitalize">
                          {p.method === "bank_transfer" ? "Bank" : "PayPal"}
                        </td>
                        <td className="py-3">
                          <Badge className={cn(getStatusColor(p.status))}>
                            {getStatusLabel(p.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
