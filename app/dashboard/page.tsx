"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  CircleDot,
  Clock,
  LineChart,
  Percent,
  Scale,
  Sigma,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { CalendarHeatmap } from "@/components/calendar-heatmap";
import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { MonthlyPerformanceChart } from "@/components/charts/monthly-performance-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { ResultDistributionChart } from "@/components/charts/result-distribution-chart";
import { RMultipleDistributionChart } from "@/components/charts/r-multiple-distribution-chart";
import { StatCard } from "@/components/stat-card";
import { StrategyAnalyticsTable } from "@/components/strategy-analytics-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppLanguage } from "@/components/language-settings";
import { buildTradeAnalytics, useSupabaseTrades } from "@/lib/trade-data";
import { formatCurrency, formatPercent } from "@/lib/utils";

const sessionLabels = {
  Asia: "Asia",
  London: "London",
  "New York": "New York",
};

export default function DashboardPage() {
  const language = useAppLanguage();
  const so = language === "so";
  const { trades, accountEmail, loading, error } = useSupabaseTrades();
  const {
    dashboardMetrics,
    sessionPerformance,
    sessionTotals,
    strategyPerformance,
    strategyAnalytics,
    equityCurve,
    monthlyPerformance,
    tpVsSlData,
    rMultipleDistribution,
    calendarDays,
  } = buildTradeAnalytics(trades);

  const generalStats = [
    { label: "Total Trades", value: `${dashboardMetrics.totalTrades}`, change: "Manual journal entries", icon: Sigma },
    { label: "Total TP", value: `${dashboardMetrics.totalTp}`, change: "Full target wins", icon: Target, tone: "positive" as const },
    { label: "Total SL", value: `${dashboardMetrics.totalSl}`, change: "Stopped trades", icon: TrendingDown, tone: "negative" as const },
    { label: "Total BE", value: `${dashboardMetrics.totalBe}`, change: "Break-even closes", icon: CircleDot },
    { label: "Total Open Trades", value: `${dashboardMetrics.totalOpen}`, change: "Unrealized positions", icon: CalendarDays },
    {
      label: "Total Profit/Loss",
      value: formatCurrency(dashboardMetrics.totalProfitLoss),
      change: "Closed trade P/L",
      icon: BadgeDollarSign,
      tone: dashboardMetrics.totalProfitLoss >= 0 ? ("positive" as const) : ("negative" as const),
    },
    { label: "Win Rate", value: formatPercent(dashboardMetrics.winRate), change: "TP / closed trades", icon: Percent, tone: "positive" as const },
    { label: "Loss Rate", value: formatPercent(dashboardMetrics.lossRate), change: "SL / closed trades", icon: ArrowDownRight, tone: "negative" as const },
    { label: "Average R:R", value: dashboardMetrics.averageRr.toFixed(2), change: "Objective is 3.00", icon: Scale },
    { label: "Profit Factor", value: dashboardMetrics.profitFactor.toFixed(2), change: "TP profit / SL loss", icon: BarChart3, tone: "positive" as const },
  ];

  const priceStats = [
    { label: "Total Entry Price Average", value: dashboardMetrics.averageEntry.toFixed(4), change: "All pairs combined", icon: LineChart },
    { label: "Maximum SL", value: dashboardMetrics.maxSl.toFixed(4), change: "Highest stop price", icon: TrendingUp },
    { label: "Minimum SL", value: dashboardMetrics.minSl.toFixed(4), change: "Lowest stop price", icon: TrendingDown },
    { label: "Maximum TP", value: dashboardMetrics.maxTp.toFixed(4), change: "Highest target price", icon: ArrowUpRight },
    { label: "Minimum TP", value: dashboardMetrics.minTp.toFixed(4), change: "Lowest target price", icon: ArrowDownRight },
    { label: "Biggest Profit", value: formatCurrency(dashboardMetrics.biggestProfit), change: "Best TP trade", icon: BadgeDollarSign, tone: "positive" as const },
    { label: "Biggest Loss", value: formatCurrency(dashboardMetrics.biggestLoss), change: "Worst SL trade", icon: BadgeDollarSign, tone: "negative" as const },
    { label: "Average Profit", value: formatCurrency(dashboardMetrics.averageProfit), change: "TP trades only", icon: TrendingUp, tone: "positive" as const },
    { label: "Average Loss", value: formatCurrency(dashboardMetrics.averageLoss), change: "SL trades only", icon: TrendingDown, tone: "negative" as const },
    { label: "Best Purging Time", value: dashboardMetrics.bestPurgingTime?.time ?? "-", change: dashboardMetrics.bestPurgingTime ? `${formatCurrency(dashboardMetrics.bestPurgingTime.pnl)} net` : "No time data", icon: Clock, tone: "positive" as const },
    { label: "Worst Purging Time", value: dashboardMetrics.worstPurgingTime?.time ?? "-", change: dashboardMetrics.worstPurgingTime ? `${formatCurrency(dashboardMetrics.worstPurgingTime.pnl)} net` : "No time data", icon: Clock, tone: "negative" as const },
  ];

  return (
    <AppShell title="Dashboard" subtitle={so ? "3RR objective, session totals, strategy edge, iyo tayada trades-ka." : "3RR objective, session totals, strategy edge, and trade quality metrics."}>
      <div className="grid min-w-0 gap-6">
        <DataStatus loading={loading} error={error} accountEmail={accountEmail} trades={trades.length} />

        <section className="grid min-w-0 gap-4">
          <SectionHeading title="General totals" description={so ? "Soo koobid guud: TP, SL, BE, Open, P/L, win rate, loss rate, R:R, iyo profit factor." : "Core journal health across TP, SL, BE, Open, P/L, win rate, loss rate, R:R, and profit factor."} />
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {generalStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="grid min-w-0 gap-4">
          <SectionHeading title="Session totals" description={so ? "Asia, London, iyo New York: TP/SL iyo win-rate si cad." : "Asia, London, and New York performance with TP/SL and win-rate clarity."} />
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sessionTotals.flatMap((item) => [
              <StatCard key={`${item.session}-trades`} label={`Total ${sessionLabels[item.session]} Trades`} value={`${item.trades}`} change={formatCurrency(item.pnl)} icon={Sigma} />,
              <StatCard key={`${item.session}-tp`} label={`Total ${sessionLabels[item.session]} TP`} value={`${item.tp}`} change="Full 3RR wins" icon={Target} tone="positive" />,
              <StatCard key={`${item.session}-sl`} label={`Total ${sessionLabels[item.session]} SL`} value={`${item.sl}`} change="Stopped trades" icon={TrendingDown} tone="negative" />,
              <StatCard key={`${item.session}-wr`} label={`${sessionLabels[item.session]} Win Rate`} value={formatPercent(item.winRate)} change="TP / closed trades" icon={Percent} tone="positive" />,
            ])}
          </div>
        </section>

        <section className="grid min-w-0 gap-4">
          <SectionHeading title="Price and risk statistics" description={so ? "Entry, stop, target, profit, iyo loss statistics ee journal-kaaga." : "Entry, stop, target, profit, and loss statistics for your manual journal."} />
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {priceStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[1.18fr_0.82fr]">
          <Card className="glass-panel min-w-0">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Equity curve</CardTitle>
                <CardDescription>Closed trade balance growth from your manual journal.</CardDescription>
              </div>
              <Badge variant="positive">3RR model</Badge>
            </CardHeader>
            <CardContent>
              <EquityCurveChart data={equityCurve} />
            </CardContent>
          </Card>

          <Card className="glass-panel min-w-0">
            <CardHeader>
              <CardTitle>Calendar heatmap</CardTitle>
              <CardDescription>Daily realized P/L and no-trade days.</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarHeatmap days={calendarDays} />
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <ChartCard title="TP vs SL chart" description="TP, SL, BE, Partial, and Open result distribution.">
            <ResultDistributionChart data={tpVsSlData} />
          </ChartCard>
          <ChartCard title="Session performance" description="Asia vs London vs New York net P/L.">
            <PerformanceBarChart data={sessionPerformance} />
          </ChartCard>
          <ChartCard title="Strategy performance" description="Net P/L by KIL, LQ, IRL/ERL, OF, Model #1, SMT, and 2SMT.">
            <PerformanceBarChart data={strategyPerformance} />
          </ChartCard>
          <ChartCard title="Monthly profit/loss" description="TP profit and SL loss by month.">
            <MonthlyPerformanceChart data={monthlyPerformance} />
          </ChartCard>
          <ChartCard title="R-multiple distribution" description="How often trades finish at -1R, 0R, partial R, or full 3R+.">
            <RMultipleDistributionChart data={rMultipleDistribution} />
          </ChartCard>
        </div>

        <StrategyAnalyticsTable data={strategyAnalytics} />
      </div>
    </AppShell>
  );
}

function DataStatus({ loading, error, accountEmail, trades }: { loading: boolean; error: string; accountEmail: string; trades: number }) {
  if (!loading && !error && trades > 0) {
    return (
      <Card className="glass-panel">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Dashboard is showing private account data{accountEmail ? `: ${accountEmail}` : ""}.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel">
      <CardContent className="py-4 text-sm text-muted-foreground">
        {loading ? "Loading dashboard data..." : error || "No trades have been saved yet. Add a trade in the Journal to fill the dashboard."}
      </CardContent>
    </Card>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-panel min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
