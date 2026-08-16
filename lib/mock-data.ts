import type { Trade, TradeResult, TradeStrategy, TradingSession } from "@/lib/types";
import { sessions, strategies } from "@/lib/types";

const startingEquity = 25000;

export const trades: Trade[] = [
  {
    id: "T-1088",
    pair: "EUR/USD",
    direction: "Buy",
    strategy: ["KIL", "LQ"],
    strategyPoints: ["London killzone active", "Liquidity sweep confirmed", "Displacement candle closed", "Target stayed at 3RR"],
    area: "Funded Challenge",
    session: "London",
    entry: 1.0842,
    stopLoss: 1.0812,
    takeProfit: 1.0932,
    riskAmount: 500,
    rewardAmount: 1500,
    rr: 3,
    result: "TP",
    profitLoss: 1500,
    rMultiple: 3,
    date: "2026-06-28",
    purgingTime: "09:30",
    screenshotUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=1200&auto=format&fit=crop",
    notes: "Clean killzone displacement after liquidity sweep. Held for full 3RR target.",
    mistake: "None",
    emotion: "Patient",
  },
  {
    id: "T-1087",
    pair: "GBP/USD",
    direction: "Sell",
    strategy: ["LQ"],
    strategyPoints: ["External liquidity swept", "Entry before full confirmation"],
    area: "Forward Testing",
    session: "New York",
    entry: 1.2744,
    stopLoss: 1.2784,
    takeProfit: 1.2624,
    riskAmount: 450,
    rewardAmount: 1350,
    rr: 3,
    result: "SL",
    profitLoss: -450,
    rMultiple: -1,
    date: "2026-06-27",
    purgingTime: "14:15",
    screenshotUrl: "",
    notes: "Liquidity taken, but no clean continuation. Entry was early.",
    mistake: "Entered before confirmation",
    emotion: "Impatient",
  },
  {
    id: "T-1086",
    pair: "XAU/USD",
    direction: "Buy",
    strategy: ["IRL to ERL", "OF"],
    strategyPoints: ["IRL tapped", "ERL target clean", "No opposing news risk"],
    area: "Funded Challenge",
    session: "London",
    entry: 2338.4,
    stopLoss: 2329.4,
    takeProfit: 2365.4,
    riskAmount: 700,
    rewardAmount: 2100,
    rr: 3,
    result: "TP",
    profitLoss: 2100,
    rMultiple: 3,
    date: "2026-06-24",
    purgingTime: "10:00",
    screenshotUrl: "",
    notes: "Internal range liquidity to external range liquidity played cleanly.",
    mistake: "None",
    emotion: "Confident",
  },
  {
    id: "T-1085",
    pair: "USD/JPY",
    direction: "Sell",
    strategy: ["ERL to IRL"],
    area: "Backtesting",
    session: "Asia",
    entry: 159.22,
    stopLoss: 159.72,
    takeProfit: 157.72,
    riskAmount: 400,
    rewardAmount: 1200,
    rr: 3,
    result: "BE",
    profitLoss: 0,
    rMultiple: 0,
    date: "2026-06-21",
    purgingTime: "02:45",
    screenshotUrl: "",
    notes: "Moved to break-even after partial displacement. No follow-through.",
    mistake: "Moved stop early",
    emotion: "Calm",
  },
  {
    id: "T-1084",
    pair: "AUD/USD",
    direction: "Buy",
    strategy: ["OF"],
    area: "Backtesting",
    session: "London",
    entry: 0.6621,
    stopLoss: 0.6596,
    takeProfit: 0.6696,
    riskAmount: 350,
    rewardAmount: 1050,
    rr: 3,
    result: "Partial",
    profitLoss: 620,
    rMultiple: 1.77,
    date: "2026-06-18",
    purgingTime: "08:20",
    screenshotUrl: "",
    notes: "Order flow stayed bullish, partials taken before target.",
    mistake: "Exited partial too soon",
    emotion: "Cautious",
  },
  {
    id: "T-1083",
    pair: "EUR/JPY",
    direction: "Sell",
    strategy: ["Model #1"],
    area: "Account Challenge",
    session: "New York",
    entry: 171.42,
    stopLoss: 171.92,
    takeProfit: 169.92,
    riskAmount: 500,
    rewardAmount: 1500,
    rr: 3,
    result: "TP",
    profitLoss: 1500,
    rMultiple: 3,
    date: "2026-06-14",
    purgingTime: "15:30",
    screenshotUrl: "",
    notes: "Model #1 conditions aligned after NY liquidity run.",
    mistake: "None",
    emotion: "Patient",
  },
  {
    id: "T-1082",
    pair: "GBP/JPY",
    direction: "Buy",
    strategy: ["SMT"],
    area: "Forward Testing",
    session: "New York",
    entry: 203.42,
    stopLoss: 202.92,
    takeProfit: 204.92,
    riskAmount: 650,
    rewardAmount: 1950,
    rr: 3,
    result: "SL",
    profitLoss: -650,
    rMultiple: -1,
    date: "2026-06-11",
    purgingTime: "16:05",
    screenshotUrl: "",
    notes: "SMT idea was valid, but price did not respect lower timeframe structure.",
    mistake: "Oversized risk",
    emotion: "Frustrated",
  },
  {
    id: "T-1081",
    pair: "USD/CAD",
    direction: "Sell",
    strategy: ["2SMT"],
    area: "Account Challenge",
    session: "Asia",
    entry: 1.3688,
    stopLoss: 1.3718,
    takeProfit: 1.3598,
    riskAmount: 300,
    rewardAmount: 900,
    rr: 3,
    result: "Open",
    profitLoss: 0,
    rMultiple: 0,
    date: "2026-06-08",
    purgingTime: "01:10",
    screenshotUrl: "",
    notes: "Open position. Target remains 3RR.",
    mistake: "None",
    emotion: "Calm",
  },
  {
    id: "T-1080",
    pair: "NZD/USD",
    direction: "Buy",
    strategy: ["KIL"],
    area: "Backtesting",
    session: "Asia",
    entry: 0.6091,
    stopLoss: 0.6066,
    takeProfit: 0.6166,
    riskAmount: 250,
    rewardAmount: 750,
    rr: 3,
    result: "TP",
    profitLoss: 750,
    rMultiple: 3,
    date: "2026-06-04",
    purgingTime: "03:00",
    screenshotUrl: "",
    notes: "Asia range expansion delivered the cleanest 3RR of the week.",
    mistake: "None",
    emotion: "Focused",
  },
  {
    id: "T-1079",
    pair: "EUR/USD",
    direction: "Sell",
    strategy: ["LQ", "SMT"],
    area: "Forward Testing",
    session: "London",
    entry: 1.0912,
    stopLoss: 1.0942,
    takeProfit: 1.0822,
    riskAmount: 400,
    rewardAmount: 1000,
    rr: 2.5,
    result: "Partial",
    profitLoss: 480,
    rMultiple: 1.2,
    date: "2026-05-29",
    purgingTime: "09:45",
    screenshotUrl: "",
    notes: "Trade did not respect 3RR plan. Closed partials into opposing liquidity.",
    mistake: "Accepted sub-3RR target",
    emotion: "Uncertain",
  },
  {
    id: "T-1078",
    pair: "XAU/USD",
    direction: "Sell",
    strategy: ["OF"],
    area: "Funded Challenge",
    session: "New York",
    entry: 2368.2,
    stopLoss: 2378.2,
    takeProfit: 2338.2,
    riskAmount: 800,
    rewardAmount: 2400,
    rr: 3,
    result: "SL",
    profitLoss: -800,
    rMultiple: -1,
    date: "2026-05-22",
    purgingTime: "14:30",
    screenshotUrl: "",
    notes: "News volatility invalidated clean order flow read.",
    mistake: "Ignored news risk",
    emotion: "Aggressive",
  },
  {
    id: "T-1077",
    pair: "GBP/USD",
    direction: "Buy",
    strategy: ["IRL to ERL"],
    area: "Funded Challenge",
    session: "London",
    entry: 1.2664,
    stopLoss: 1.2624,
    takeProfit: 1.2784,
    riskAmount: 500,
    rewardAmount: 1500,
    rr: 3,
    result: "TP",
    profitLoss: 1500,
    rMultiple: 3,
    date: "2026-05-16",
    purgingTime: "09:10",
    screenshotUrl: "",
    notes: "Strong expansion from internal to external liquidity pool.",
    mistake: "None",
    emotion: "Patient",
  },
];

export function calculateRMultiple(trade: Pick<Trade, "riskAmount" | "profitLoss">) {
  return trade.riskAmount > 0 ? Number((trade.profitLoss / trade.riskAmount).toFixed(2)) : 0;
}

export function respectedThreeRR(trade: Pick<Trade, "rr">) {
  return trade.rr >= 3;
}

const tpTrades = trades.filter((trade) => trade.result === "TP");
const slTrades = trades.filter((trade) => trade.result === "SL");
const closedTrades = trades.filter((trade) => trade.result !== "Open");
const grossProfit = closedTrades.filter((trade) => trade.profitLoss > 0).reduce((sum, trade) => sum + trade.profitLoss, 0);
const grossLoss = Math.abs(closedTrades.filter((trade) => trade.profitLoss < 0).reduce((sum, trade) => sum + trade.profitLoss, 0));

export const dashboardMetrics = {
  totalTrades: trades.length,
  totalTp: tpTrades.length,
  totalSl: slTrades.length,
  totalBe: trades.filter((trade) => trade.result === "BE").length,
  totalOpen: trades.filter((trade) => trade.result === "Open").length,
  totalProfitLoss: closedTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
  winRate: closedTrades.length ? (tpTrades.length / closedTrades.length) * 100 : 0,
  lossRate: closedTrades.length ? (slTrades.length / closedTrades.length) * 100 : 0,
  averageRr: trades.reduce((sum, trade) => sum + trade.rr, 0) / trades.length,
  profitFactor: grossLoss ? grossProfit / grossLoss : grossProfit,
  averageEntry: trades.reduce((sum, trade) => sum + trade.entry, 0) / trades.length,
  maxSl: Math.max(...trades.map((trade) => trade.stopLoss)),
  minSl: Math.min(...trades.map((trade) => trade.stopLoss)),
  maxTp: Math.max(...trades.map((trade) => trade.takeProfit)),
  minTp: Math.min(...trades.map((trade) => trade.takeProfit)),
  biggestProfit: Math.max(...trades.map((trade) => trade.profitLoss)),
  biggestLoss: Math.min(...trades.map((trade) => trade.profitLoss)),
  averageProfit:
    closedTrades.filter((trade) => trade.profitLoss > 0).reduce((sum, trade) => sum + trade.profitLoss, 0) /
    Math.max(1, closedTrades.filter((trade) => trade.profitLoss > 0).length),
  averageLoss:
    closedTrades.filter((trade) => trade.profitLoss < 0).reduce((sum, trade) => sum + trade.profitLoss, 0) /
    Math.max(1, closedTrades.filter((trade) => trade.profitLoss < 0).length),
};

export const sessionTotals = sessions.map((session) => {
  const sessionTrades = trades.filter((trade) => trade.session === session);
  const tp = sessionTrades.filter((trade) => trade.result === "TP").length;
  const sl = sessionTrades.filter((trade) => trade.result === "SL").length;
  const closed = sessionTrades.filter((trade) => trade.result !== "Open");

  return {
    session,
    trades: sessionTrades.length,
    tp,
    sl,
    winRate: closed.length ? (tp / closed.length) * 100 : 0,
    pnl: sessionTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
  };
});

export const strategyAnalytics = strategies.map((strategy) => {
  const strategyTrades = trades.filter((trade) => trade.strategy.includes(strategy));
  const tp = strategyTrades.filter((trade) => trade.result === "TP").length;
  const sl = strategyTrades.filter((trade) => trade.result === "SL").length;
  const closed = strategyTrades.filter((trade) => trade.result !== "Open");

  return {
    strategy,
    trades: strategyTrades.length,
    tp,
    sl,
    winRate: closed.length ? (tp / closed.length) * 100 : 0,
    pnl: strategyTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
    averageRMultiple: strategyTrades.length
      ? strategyTrades.reduce((sum, trade) => sum + trade.rMultiple, 0) / strategyTrades.length
      : 0,
  };
});

export const equityCurve = closedTrades
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date))
  .reduce<Array<{ date: string; equity: number }>>((points, trade) => {
    const previous = points.length ? points[points.length - 1].equity : startingEquity;
    points.push({
      date: new Date(`${trade.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      equity: previous + trade.profitLoss,
    });
    return points;
  }, []);

export const monthlyPerformance = Object.values(
  closedTrades.reduce<Record<string, { month: string; profit: number; loss: number; net: number }>>((months, trade) => {
    const month = new Date(`${trade.date}T00:00:00`).toLocaleDateString("en-US", { month: "short" });
    months[month] ??= { month, profit: 0, loss: 0, net: 0 };
    if (trade.profitLoss >= 0) {
      months[month].profit += trade.profitLoss;
    } else {
      months[month].loss += trade.profitLoss;
    }
    months[month].net += trade.profitLoss;
    return months;
  }, {}),
);

export const tpVsSlData = [
  { name: "TP", value: dashboardMetrics.totalTp },
  { name: "SL", value: dashboardMetrics.totalSl },
  { name: "BE", value: dashboardMetrics.totalBe },
  { name: "Partial", value: trades.filter((trade) => trade.result === "Partial").length },
  { name: "Open", value: dashboardMetrics.totalOpen },
] satisfies Array<{ name: TradeResult; value: number }>;

export const sessionPerformance = sessionTotals.map((item) => ({
  name: item.session,
  pnl: item.pnl,
  trades: item.trades,
}));

export const strategyPerformance = strategyAnalytics.map((item) => ({
  name: item.strategy,
  pnl: item.pnl,
  trades: item.trades,
  winRate: item.winRate,
}));

export const pairPerformance = Object.values(
  trades.reduce<Record<string, { name: string; pnl: number; trades: number }>>((pairs, trade) => {
    pairs[trade.pair] ??= { name: trade.pair, pnl: 0, trades: 0 };
    pairs[trade.pair].pnl += trade.profitLoss;
    pairs[trade.pair].trades += 1;
    return pairs;
  }, {}),
);

export const rMultipleDistribution = [
  { name: "-1R", trades: trades.filter((trade) => trade.rMultiple <= -1).length },
  { name: "0R", trades: trades.filter((trade) => trade.rMultiple === 0).length },
  { name: "0-2R", trades: trades.filter((trade) => trade.rMultiple > 0 && trade.rMultiple < 2).length },
  { name: "2-3R", trades: trades.filter((trade) => trade.rMultiple >= 2 && trade.rMultiple < 3).length },
  { name: "3R+", trades: trades.filter((trade) => trade.rMultiple >= 3).length },
];

export const mistakes = Object.values(
  trades.reduce<Record<string, { name: string; value: number }>>((items, trade) => {
    items[trade.mistake] ??= { name: trade.mistake, value: 0 };
    items[trade.mistake].value += 1;
    return items;
  }, {}),
).map((item) => ({ ...item, value: Math.round((item.value / trades.length) * 100) }));

export const emotions = Object.values(
  trades.reduce<Record<string, { name: string; value: number }>>((items, trade) => {
    items[trade.emotion] ??= { name: trade.emotion, value: 0 };
    items[trade.emotion].value += 1;
    return items;
  }, {}),
).map((item) => ({ ...item, value: Math.round((item.value / trades.length) * 100) }));

export const calendarDays = Array.from({ length: 35 }, (_, index) => {
  const pnl = [420, -120, 0, 680, 110, 0, -340, 520, 760, -80, 0, 0, 980, 210, -260, 610, 430, 0, -190, 720, 1340, 0, -620, 80, 390, 0, 1180, 560, -70, 0, 240, 910, 0, -150, 1840][index];

  return {
    day: index + 1,
    pnl,
  };
});

export type SessionName = TradingSession;
export type StrategyName = TradeStrategy;
