"use client";

import { motion } from "framer-motion";
import { Play, TrendingUp, DollarSign, Disc3 } from "lucide-react";

const bars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative mx-auto w-full max-w-lg perspective-1000"
    >
      {/* Glow behind mockup */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-ascend-purple/30 via-ascend-blue/20 to-ascend-cyan/30 blur-3xl opacity-60" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-muted-foreground">Ascend Distributions — Dashboard</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Play, label: "Streams", value: "1.2M", color: "text-ascend-purple" },
              { icon: DollarSign, label: "Revenue", value: "$4,280", color: "text-green-400" },
              { icon: Disc3, label: "Releases", value: "8 Live", color: "text-ascend-blue" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium">Streams Over Time</span>
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <TrendingUp className="h-3 w-3" /> +34%
              </span>
            </div>
            <div className="flex items-end gap-1 h-24">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.05 }}
                  className="flex-1 rounded-sm bg-gradient-to-t from-ascend-purple/60 to-ascend-blue/80"
                />
              ))}
            </div>
          </div>

          {/* Recent release */}
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-ascend-purple to-ascend-blue" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Midnight Frequency</p>
              <p className="text-[10px] text-muted-foreground">Live on 150+ platforms</p>
            </div>
            <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-12 rounded-xl glass px-3 py-2 shadow-lg"
      >
        <p className="text-[10px] text-muted-foreground">New payout</p>
        <p className="text-sm font-bold text-green-400">+$842.50</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-6 bottom-16 rounded-xl glass px-3 py-2 shadow-lg"
      >
        <p className="text-[10px] text-muted-foreground">Spotify</p>
        <p className="text-sm font-bold">+12,400 streams</p>
      </motion.div>
    </motion.div>
  );
}
