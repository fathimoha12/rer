"use client";

import { AppShell } from "@/components/shell/app-shell";
import { BreakdownChart } from "@/components/charts/breakdown-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildTradeAnalytics, useSupabaseTrades } from "@/lib/trade-data";
import { ArrowDownRight, ArrowUpRight, Clock, Split, TrendingUp } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function AnalyticsPage() {
  const { trades, accountEmail, loading, error } = useSupabaseTrades();
  const { dashboardMetrics, emotions, mistakes, pairPerformance, sessionPerformance, strategyPerformance } = buildTradeAnalytics(trades);

  return (
    <AppShell title="Analytics" subtitle="Find which markets, strategies, sessions, and behaviors produce your edge.">
      <div className="grid gap-5">
        <Card className="glass-panel">
          <CardContent className="py-4 text-sm text-muted-foreground">
            {loading
              ? "Loading analytics..."
              : error || `Analytics are showing private account data${accountEmail ? `: ${accountEmail}` : ""}.`}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="TP results" value={`${dashboardMetrics.totalTp}`} change={formatPercent(dashboardMetrics.winRate)} icon={ArrowUpRight} tone="positive" />
          <StatCard label="SL results" value={`${dashboardMetrics.totalSl}`} change={formatPercent(dashboardMetrics.lossRate)} icon={ArrowDownRight} tone="negative" />
          <StatCard label="Buy/Sell model" value="Manual" change="No broker connection" icon={Split} />
          <StatCard label="Total P/L" value={formatCurrency(dashboardMetrics.totalProfitLoss)} change="Closed trades" icon={TrendingUp} tone="positive" />
          <StatCard label="Best purging time" value={dashboardMetrics.bestPurgingTime?.time ?? "-"} change={dashboardMetrics.bestPurgingTime ? `${formatCurrency(dashboardMetrics.bestPurgingTime.pnl)} net` : "No time data"} icon={Clock} tone="positive" />
          <StatCard label="Worst purging time" value={dashboardMetrics.worstPurgingTime?.time ?? "-"} change={dashboardMetrics.worstPurgingTime ? `${formatCurrency(dashboardMetrics.worstPurgingTime.pnl)} net` : "No time data"} icon={Clock} tone="negative" />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Performance by pair</CardTitle>
              <CardDescription>Net P/L and sample size by instrument.</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceBarChart data={pairPerformance} />
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Performance by strategy</CardTitle>
              <CardDescription>Which playbooks deserve more capital.</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceBarChart data={strategyPerformance} />
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Performance by session</CardTitle>
              <CardDescription>Asia, London, New York, and overlap behavior.</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceBarChart data={sessionPerformance} />
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Emotion breakdown</CardTitle>
              <CardDescription>Track the mental state behind each decision.</CardDescription>
            </CardHeader>
            <CardContent>
              <BreakdownChart data={emotions} />
            </CardContent>
          </Card>
          <Card className="glass-panel xl:col-span-2">
            <CardHeader>
              <CardTitle>Mistakes breakdown</CardTitle>
              <CardDescription>See which errors cost the most attention and capital.</CardDescription>
            </CardHeader>
            <CardContent>
              <BreakdownChart data={mistakes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
