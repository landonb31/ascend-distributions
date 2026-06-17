"use client";

import { useMemo } from "react";
import { Download, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  cn,
  formatCurrency,
  formatDate,
  formatNumber,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import type { Royalty, Track } from "@/types";

interface RoyaltyWithTrack extends Royalty {
  track?: Pick<Track, "title" | "artist_name"> | null;
}

interface RoyaltiesDashboardProps {
  royalties: RoyaltyWithTrack[];
}

export function RoyaltiesDashboard({ royalties }: RoyaltiesDashboardProps) {
  const totals = useMemo(() => {
    const total = royalties.reduce((sum, r) => sum + Number(r.artist_share), 0);
    const pending = royalties
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + Number(r.artist_share), 0);
    const paid = royalties
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + Number(r.artist_share), 0);
    return { total, pending, paid };
  }, [royalties]);

  const byTrack = useMemo(() => {
    const map = new Map<string, { title: string; artist: string; amount: number; streams: number }>();
    royalties.forEach((r) => {
      const key = r.track_id || "unknown";
      const existing = map.get(key) || {
        title: r.track?.title || "Unknown Track",
        artist: r.track?.artist_name || "—",
        amount: 0,
        streams: 0,
      };
      existing.amount += Number(r.artist_share);
      existing.streams += r.streams;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [royalties]);

  const byPlatform = useMemo(() => {
    const map = new Map<string, { amount: number; streams: number }>();
    royalties.forEach((r) => {
      const existing = map.get(r.platform) || { amount: 0, streams: 0 };
      existing.amount += Number(r.artist_share);
      existing.streams += r.streams;
      map.set(r.platform, existing);
    });
    return Array.from(map.entries())
      .map(([platform, data]) => ({ platform, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [royalties]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    royalties.forEach((r) => {
      const month = r.period_start.slice(0, 7);
      map.set(month, (map.get(month) || 0) + Number(r.artist_share));
    });
    return Array.from(map.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [royalties]);

  function exportCsv() {
    const headers = [
      "Track",
      "Artist",
      "Platform",
      "Period Start",
      "Period End",
      "Streams",
      "Amount",
      "Artist Share",
      "Status",
    ];
    const rows = royalties.map((r) => [
      r.track?.title || "",
      r.track?.artist_name || "",
      r.platform,
      r.period_start,
      r.period_end,
      r.streams,
      r.amount,
      r.artist_share,
      r.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascend-royalties-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (royalties.length === 0) {
    return (
      <Card glass>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold">No royalty data yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Royalties will appear here once your releases start generating revenue.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Total Revenue" value={formatCurrency(totals.total)} icon={DollarSign} />
        <StatsCard title="Pending" value={formatCurrency(totals.pending)} icon={Clock} />
        <StatsCard title="Paid Out" value={formatCurrency(totals.paid)} icon={CheckCircle} />
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">Revenue by Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Track</th>
                  <th className="pb-3 pr-4 font-medium">Artist</th>
                  <th className="pb-3 pr-4 font-medium text-right">Streams</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {byTrack.map((row) => (
                  <tr key={row.title + row.artist} className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4">{row.title}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.artist}</td>
                    <td className="py-3 pr-4 text-right">{formatNumber(row.streams)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Platform</th>
                    <th className="pb-3 pr-4 font-medium text-right">Streams</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {byPlatform.map((row) => (
                    <tr key={row.platform} className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4">{row.platform}</td>
                      <td className="py-3 pr-4 text-right">{formatNumber(row.streams)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Month</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {byMonth.map((row) => (
                    <tr key={row.month} className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4">
                        {formatDate(`${row.month}-01`)}
                      </td>
                      <td className="py-3 text-right font-medium">{formatCurrency(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">All Royalty Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Track</th>
                  <th className="pb-3 pr-4 font-medium">Platform</th>
                  <th className="pb-3 pr-4 font-medium">Period</th>
                  <th className="pb-3 pr-4 font-medium text-right">Share</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {royalties.slice(0, 50).map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4">{r.track?.title || "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.platform}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">
                      {formatDate(r.period_start)} – {formatDate(r.period_end)}
                    </td>
                    <td className="py-3 pr-4 text-right font-medium">
                      {formatCurrency(Number(r.artist_share))}
                    </td>
                    <td className="py-3">
                      <Badge className={cn(getStatusColor(r.status))}>
                        {getStatusLabel(r.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
