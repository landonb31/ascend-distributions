"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { subDays, format, parseISO, isBefore, startOfDay } from "date-fns";
import { Calendar, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { AnalyticsDaily } from "@/types";

const PLATFORM_COLORS = ["#8B5CF6", "#3B82F6", "#1DB954", "#FC3C44", "#FF0000", "#FF9900", "#FEAA2D"];

type DateRange = "7" | "30" | "90" | "365";

interface AnalyticsDashboardProps {
  analytics: AnalyticsDaily[];
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30");

  const filteredData = useMemo(() => {
    const days = parseInt(dateRange, 10);
    const cutoff = startOfDay(subDays(new Date(), days));
    return analytics.filter((a) => {
      const d = parseISO(a.date);
      return !isBefore(d, cutoff);
    });
  }, [analytics, dateRange]);

  const streamsByDate = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((a) => {
      map.set(a.date, (map.get(a.date) || 0) + a.streams);
    });
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const revenueByDate = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((a) => {
      map.set(a.date, (map.get(a.date) || 0) + Number(a.revenue));
    });
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const platformBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((a) => {
      const platform = a.platform || "Other";
      map.set(platform, (map.get(platform) || 0) + a.streams);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const countryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((a) => {
      if (!a.country) return;
      map.set(a.country, (map.get(a.country) || 0) + a.streams);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  const totalStreams = filteredData.reduce((sum, a) => sum + a.streams, 0);
  const totalRevenue = filteredData.reduce((sum, a) => sum + Number(a.revenue), 0);
  const uniqueCountries = new Set(filteredData.map((a) => a.country).filter(Boolean)).size;

  const chartData =
    streamsByDate.length > 0
      ? streamsByDate
      : generatePlaceholderDates(parseInt(dateRange, 10));

  const tooltipStyle = {
    backgroundColor: "rgba(0,0,0,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
  };

  if (analytics.length === 0) {
    return (
      <Card glass>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold">No analytics data yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Once your releases go live, streaming data will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 flex-1">
          <Card glass className="glass-hover">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Streams</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(totalStreams)}</p>
            </CardContent>
          </Card>
          <Card glass className="glass-hover">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card glass className="glass-hover">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Countries</p>
              <p className="text-2xl font-bold mt-1">{uniqueCountries}</p>
            </CardContent>
          </Card>
        </div>

        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="streams">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="streams" className="mt-6 space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base">Streams Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="analyticsStreams" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickFormatter={(v) => format(parseISO(v), "MMM d")}
                    />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={formatNumber} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(v) => format(parseISO(v as string), "MMM d, yyyy")}
                      formatter={(value: number) => [formatNumber(value), "Streams"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8B5CF6"
                      fill="url(#analyticsStreams)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Streams by Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              {platformBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No platform data</p>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" tickFormatter={formatNumber} />
                      <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" width={100} fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatNumber(v), "Streams"]} />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByDate.length > 0 ? revenueByDate : chartData}>
                    <defs>
                      <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickFormatter={(v) => format(parseISO(v), "MMM d")}
                    />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(v) => format(parseISO(v as string), "MMM d, yyyy")}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="url(#analyticsRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="mt-6 space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {countryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No audience location data yet
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={countryBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {countryBreakdown.map((_, i) => (
                            <Cell key={i} fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNumber(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {countryBreakdown.map((c, i) => (
                      <div key={c.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: PLATFORM_COLORS[i % PLATFORM_COLORS.length] }}
                          />
                          <span>{c.name}</span>
                        </div>
                        <span className="text-muted-foreground">{formatNumber(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function generatePlaceholderDates(days: number) {
  return Array.from({ length: Math.min(days, 14) }, (_, i) => ({
    date: format(subDays(new Date(), Math.min(days, 14) - 1 - i), "yyyy-MM-dd"),
    value: 0,
  }));
}
