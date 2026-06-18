"use client";

import { Play } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { ChartDataPoint } from "@/types";

interface StreamsChartProps {
  data: ChartDataPoint[];
}

export function StreamsChart({ data }: StreamsChartProps) {
  const chartData = data.length > 0 ? data : generatePlaceholderData();

  return (
    <Card glass className="border-white/10 overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ascend-purple/30 to-ascend-purple/5">
            <Play className="h-4 w-4 text-ascend-purple" />
          </div>
          <div>
            <CardTitle className="text-base">Streams Over Time</CardTitle>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="streamsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                fontSize={12}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={formatNumber} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
                formatter={(value: number) => [formatNumber(value), "Streams"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                fill="url(#streamsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function generatePlaceholderData(): ChartDataPoint[] {
  return Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
    value: 0,
  }));
}
