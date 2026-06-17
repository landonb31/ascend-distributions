"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface ReleaseActionsProps {
  releaseId: string;
  title: string;
}

export function ReleaseActions({ releaseId, title }: ReleaseActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading("approve");
    setError(null);
    try {
      const res = await fetch(`/api/admin/releases/${releaseId}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to approve");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (reason.length < 10) {
      setError("Rejection reason must be at least 10 characters");
      return;
    }
    setLoading("reject");
    setError(null);
    try {
      const res = await fetch(`/api/admin/releases/${releaseId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reject");
      }
      setShowReject(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      {!showReject ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={loading !== null}
          >
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowReject(true)}
            disabled={loading !== null}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      ) : (
        <Card className="border-red-500/20">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Reject &quot;{title}&quot;
            </p>
            <Textarea
              placeholder="Reason for rejection (min 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={loading !== null}
              >
                {loading === "reject" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm Reject"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowReject(false);
                  setReason("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
