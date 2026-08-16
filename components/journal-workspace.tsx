"use client";

import * as React from "react";
import { Loader2, X } from "lucide-react";
import { FloatingMessage } from "@/components/floating-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar, type TradeFilters } from "@/components/filter-bar";
import { TradeForm } from "@/components/trade-form";
import { TradeTable } from "@/components/trade-table";
import { trades as seedTrades } from "@/lib/mock-data";
import { respectedThreeRR } from "@/lib/trade-rules";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { strategies, tradingAreas, type Trade, type TradeStrategy, type TradingArea } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const initialFilters: TradeFilters = {
  query: "",
  dateFrom: "",
  dateTo: "",
  strategy: "all",
  session: "all",
  result: "all",
  direction: "all",
};

type TradeRow = {
  id: string;
  user_id: string;
  pair: string;
  direction: Trade["direction"];
  entry: number | string;
  stop_loss: number | string;
  take_profit: number | string;
  risk_amount: number | string;
  reward_amount: number | string;
  rr: number | string;
  result: Trade["result"];
  profit_loss: number | string;
  r_multiple: number | string;
  trade_date: string;
  purging_time?: string | null;
  session: Trade["session"];
  strategy_names: string[] | null;
  area: string | null;
  backtest_cycle?: string | null;
  trading_account_id?: string | null;
  account_profile_name?: string | null;
  prop_firm_name?: string | null;
  account_size?: number | string | null;
  account_phase?: string | null;
  broker_name?: string | null;
  strategy_points: string[] | null;
  emotion: string | null;
  mistake: string | null;
  notes: string | null;
  screenshot_url: string | null;
  before_screenshot_url?: string | null;
  after_screenshot_url?: string | null;
};

const strategySet = new Set<string>(strategies);
const areaSet = new Set<string>(tradingAreas);
const dailyDisciplineAreas = new Set<TradingArea>(["Forward Testing", "Funded Challenge", "Account Challenge"]);

function asNumber(value: number | string) {
  return Number(value) || 0;
}

function rowToTrade(row: TradeRow): Trade {
  const strategyNames = (row.strategy_names ?? []).filter((strategy): strategy is TradeStrategy => strategySet.has(strategy));
  const area = areaSet.has(row.area ?? "") ? (row.area as TradingArea) : "Backtesting";

  return {
    id: row.id,
    pair: row.pair,
    direction: row.direction,
    strategy: strategyNames.length ? strategyNames : ["KIL"],
    strategyPoints: row.strategy_points ?? [],
    area,
    backtestCycle: row.backtest_cycle || "Journey 1",
    accountProfileId: row.trading_account_id ?? "",
    accountProfileName: row.account_profile_name ?? "",
    propFirmName: row.prop_firm_name ?? "",
    accountSize: asNumber(row.account_size ?? 0),
    accountPhase: row.account_phase ?? "",
    brokerName: row.broker_name ?? "",
    session: row.session,
    entry: asNumber(row.entry),
    stopLoss: asNumber(row.stop_loss),
    takeProfit: asNumber(row.take_profit),
    riskAmount: asNumber(row.risk_amount),
    rewardAmount: asNumber(row.reward_amount),
    rr: asNumber(row.rr),
    result: row.result,
    profitLoss: asNumber(row.profit_loss),
    rMultiple: asNumber(row.r_multiple),
    date: row.trade_date,
    purgingTime: row.purging_time?.slice(0, 5) ?? "",
    screenshotUrl: row.screenshot_url ?? "",
    beforeScreenshotUrl: row.before_screenshot_url ?? "",
    afterScreenshotUrl: row.after_screenshot_url ?? "",
    notes: row.notes ?? "",
    mistake: row.mistake ?? "None",
    emotion: row.emotion ?? "",
  };
}

function tradeToRow(trade: Trade, userId: string) {
  return {
    id: trade.id,
    user_id: userId,
    pair: trade.pair,
    direction: trade.direction,
    entry: trade.entry,
    stop_loss: trade.stopLoss,
    take_profit: trade.takeProfit,
    risk_amount: trade.riskAmount,
    reward_amount: trade.rewardAmount,
    rr: trade.rr,
    result: trade.result,
    profit_loss: trade.profitLoss,
    r_multiple: trade.rMultiple,
    trade_date: trade.date,
    purging_time: trade.purgingTime || null,
    session: trade.session,
    strategy_names: trade.strategy,
    area: trade.area,
    backtest_cycle: trade.backtestCycle || "Journey 1",
    trading_account_id: trade.area === "Backtesting" ? null : trade.accountProfileId || null,
    account_profile_name: trade.area === "Backtesting" ? null : trade.accountProfileName || null,
    prop_firm_name: trade.area === "Backtesting" ? null : trade.propFirmName || null,
    account_size: trade.area === "Backtesting" ? null : trade.accountSize || null,
    account_phase: trade.area === "Backtesting" ? null : trade.accountPhase || null,
    broker_name: trade.area === "Backtesting" ? null : trade.brokerName || null,
    strategy_points: trade.strategyPoints ?? [],
    emotion: trade.emotion || null,
    mistake: trade.mistake || "None",
    notes: trade.notes || null,
    screenshot_url: trade.screenshotUrl || null,
    before_screenshot_url: trade.beforeScreenshotUrl || null,
    after_screenshot_url: trade.afterScreenshotUrl || null,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Private account storage is not reachable. Check the app setup and deploy again.";
}

export function JournalWorkspace() {
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);
  const [overviewTrade, setOverviewTrade] = React.useState<Trade | null>(null);
  const [filters, setFilters] = React.useState(initialFilters);
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [accountEmail, setAccountEmail] = React.useState("");
  const [databaseMessage, setDatabaseMessage] = React.useState("");
  const [messageTone, setMessageTone] = React.useState<"danger" | "success" | "neutral">("danger");

  function showMessage(message: string, tone: "danger" | "success" | "neutral" = "danger") {
    setDatabaseMessage(message);
    setMessageTone(tone);
  }

  const loadTrades = React.useCallback(async () => {
    setLoaded(false);
    setDatabaseMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;

      if (userResponse.error) throw userResponse.error;
      if (!user) throw new Error("Please sign in to load your private journal data.");

      setAccountEmail(user.email ?? "");

      const response = await supabase.from("trades").select("*").order("trade_date", { ascending: false }).order("created_at", { ascending: false });
      if (response.error) throw response.error;

      setTrades(((response.data ?? []) as TradeRow[]).map(rowToTrade));
    } catch (error) {
      setTrades([]);
      showMessage(getErrorMessage(error));
    } finally {
      setLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void loadTrades();
  }, [loadTrades]);

  async function getUserForWrite() {
    const supabase = getSupabaseBrowserClient();
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    if (userResponse.error) throw userResponse.error;
    if (!user) throw new Error("Fadlan login samee ka hor intaadan trade kaydin.");

    return { supabase, user };
  }

  async function saveTradeToSql(trade: Trade) {
    setBusy(true);
    setDatabaseMessage("");

    try {
      const { supabase, user } = await getUserForWrite();
      const exists = trades.some((item) => item.id === trade.id);
      const existingTrade = trades.find((item) => item.id === trade.id);
      const targetCycle = trade.backtestCycle || existingTrade?.backtestCycle || "Journey 1";
      const backtestingTrades = trades.filter((item) => item.area === "Backtesting" && (item.backtestCycle || "Journey 1") === targetCycle).length;
      const sameDayTrades = trades.filter(
        (item) =>
          item.id !== trade.id &&
          item.area === trade.area &&
          item.date === trade.date &&
          (item.backtestCycle || "Journey 1") === targetCycle,
      );

      if (trade.area === "Backtesting" && (!exists || existingTrade?.area !== "Backtesting") && backtestingTrades >= 100) {
        throw new Error(`${targetCycle} limit reached. You can save only 100 backtesting trades in one journey.`);
      }

      if (exists && existingTrade && existingTrade.area !== trade.area) {
        throw new Error("Trade hore loo diwaan geliyay section-kiisa lama beddeli karo. Haddii uu qalad yahay, delete garee kadib trade cusub ku geli section sax ah.");
      }

      if (dailyDisciplineAreas.has(trade.area)) {
        if (sameDayTrades.some((item) => item.session === trade.session)) {
          throw new Error(`Session-kan (${trade.session}) maanta trade hore ayaa laga qaatay. 3-da trade waxay u kala baxayaan Asia, London, iyo New York.`);
        }

        if (sameDayTrades.length >= 3) {
          throw new Error("Waxaad samaynaysaa over trading. Maanta 3 trade ayaa kuu dhammaatay. Orod oo yara seexo ama suuqa u yara bax si naftaadu u soo yara dagto.");
        }
      }

      const payload = tradeToRow({ ...trade, backtestCycle: targetCycle }, user.id);

      const response = exists
        ? await supabase.from("trades").update(payload).eq("id", trade.id).select("*").single()
        : await supabase.from("trades").insert(payload).select("*").single();

      if (response.error) throw response.error;

      const savedTrade = rowToTrade(response.data as TradeRow);
      setTrades((current) => (exists ? current.map((item) => (item.id === savedTrade.id ? savedTrade : item)) : [savedTrade, ...current]));
      setSelectedTrade(null);
      showMessage(exists ? "Trade-ka waa la update gareeyay." : "Trade-ka waa la diwaan geliyay.", "success");
    } catch (error) {
      showMessage(getErrorMessage(error));
      throw error;
    } finally {
      setBusy(false);
    }
  }

  async function deleteTradeFromSql(id: string) {
    setBusy(true);
    setDatabaseMessage("");

    try {
      const { supabase } = await getUserForWrite();
      const response = await supabase.from("trades").delete().eq("id", id);
      if (response.error) throw response.error;

      setTrades((current) => current.filter((trade) => trade.id !== id));
      if (overviewTrade?.id === id) setOverviewTrade(null);
      if (selectedTrade?.id === id) setSelectedTrade(null);
      showMessage("Trade-ka waa la delete gareeyay.", "success");
    } catch (error) {
      showMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function loadSampleDataToSql() {
    setBusy(true);
    setDatabaseMessage("");

    try {
      const { supabase, user } = await getUserForWrite();
      const payload = seedTrades.map((trade) => tradeToRow({ ...trade, id: crypto.randomUUID() }, user.id));
      const response = await supabase.from("trades").insert(payload).select("*");
      if (response.error) throw response.error;

      const insertedTrades = ((response.data ?? []) as TradeRow[]).map(rowToTrade);
      setTrades((current) => [...insertedTrades, ...current]);
      showMessage("Sample data waa la geliyay.", "success");
    } catch (error) {
      showMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function clearAllTradesFromSql() {
    setBusy(true);
    setDatabaseMessage("");

    try {
      const { supabase, user } = await getUserForWrite();
      const response = await supabase.from("trades").delete().eq("user_id", user.id);
      if (response.error) throw response.error;

      setTrades([]);
      setSelectedTrade(null);
      setOverviewTrade(null);
      showMessage("Trades-ka waa la nadiifiyay.", "success");
    } catch (error) {
      showMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const filteredTrades = trades.filter((trade) => {
    const query = filters.query.toLowerCase();
    const searchable = [
      trade.pair,
      trade.strategy.join(" "),
      trade.area,
      trade.notes,
      trade.emotion,
      trade.mistake,
      ...(trade.strategyPoints ?? []),
      trade.date,
      trade.purgingTime,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (!filters.dateFrom || trade.date >= filters.dateFrom) &&
      (!filters.dateTo || trade.date <= filters.dateTo) &&
      (filters.strategy === "all" || trade.strategy.includes(filters.strategy as Trade["strategy"][number])) &&
      (filters.session === "all" || trade.session === filters.session) &&
      (filters.result === "all" || trade.result === filters.result) &&
      (filters.direction === "all" || trade.direction === filters.direction)
    );
  });

  return (
    <div className="grid gap-5">
      <FloatingMessage message={databaseMessage} tone={messageTone} onClose={() => setDatabaseMessage("")} />
      <TradeForm selectedTrade={selectedTrade} onCancel={() => setSelectedTrade(null)} onSave={saveTradeToSql} />
      <Card className="glass-panel">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Trade Journal waa meesha trade cusub laga geliyo oo keliya. Trade list, edit, delete, iyo open positions waxaad ka eegaysaa qaybaha Backtesting, Forward, Funded, Account, ama Open Positions.
          {accountEmail ? ` Account: ${accountEmail}` : ""}
        </CardContent>
      </Card>

      {overviewTrade ? <TradeOverview trade={overviewTrade} onClose={() => setOverviewTrade(null)} /> : null}
    </div>
  );
}

function TradeOverview({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const qualityScore =
    (trade.result === "TP" ? 35 : trade.result === "Partial" ? 22 : trade.result === "BE" ? 14 : trade.result === "Open" ? 10 : 0) +
    (respectedThreeRR(trade) ? 25 : 0) +
    (trade.strategyPoints?.length ? Math.min(20, trade.strategyPoints.length * 5) : 0) +
    (trade.mistake.toLowerCase() === "none" ? 20 : 8);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="glass-panel max-h-[88vh] w-full max-w-4xl overflow-auto">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {trade.pair} overview
              <Badge variant={trade.result === "TP" ? "positive" : trade.result === "SL" ? "negative" : "secondary"}>{trade.result}</Badge>
              <Badge variant={respectedThreeRR(trade) ? "positive" : "negative"}>{respectedThreeRR(trade) ? "3RR respected" : "Below 3RR"}</Badge>
            </CardTitle>
            <CardDescription>
              {trade.date} - {trade.area} - {trade.session} - {trade.strategy.join(", ")} - {trade.direction}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close overview">
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <OverviewMetric label="P/L" value={formatCurrency(trade.profitLoss)} tone={trade.profitLoss >= 0 ? "positive" : "negative"} />
              <OverviewMetric label="R multiple" value={`${trade.rMultiple.toFixed(2)}R`} />
              <OverviewMetric label="Quality score" value={`${Math.min(100, qualityScore)}/100`} tone={qualityScore >= 70 ? "positive" : qualityScore < 45 ? "negative" : "neutral"} />
              <OverviewMetric label="Entry" value={String(trade.entry)} />
              <OverviewMetric label="Stop Loss" value={String(trade.stopLoss)} />
              <OverviewMetric label="Take Profit" value={String(trade.takeProfit)} />
              <OverviewMetric label="Purging time" value={trade.purgingTime || "-"} />
              <OverviewMetric label="Risk" value={formatCurrency(trade.riskAmount)} />
              <OverviewMetric label="Reward" value={formatCurrency(trade.rewardAmount)} />
              <OverviewMetric label="R:R" value={trade.rr.toFixed(2)} />
            </div>

            <div className="rounded-lg border bg-background/45 p-4">
              <h3 className="mb-3 text-sm font-semibold">Strategy qodobo</h3>
              {trade.strategyPoints?.length ? (
                <ul className="grid gap-2">
                  {trade.strategyPoints.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 size-1.5 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Qodobo strategy ah lama gelin.</p>
              )}
            </div>

            <div className="rounded-lg border bg-background/45 p-4">
              <h3 className="mb-2 text-sm font-semibold">Notes, mistake, emotion</h3>
              <p className="text-sm leading-6 text-muted-foreground">{trade.notes || "No notes yet."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={trade.mistake.toLowerCase() === "none" ? "positive" : "negative"}>Mistake: {trade.mistake}</Badge>
                <Badge variant="secondary">Emotion: {trade.emotion || "Not logged"}</Badge>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-background/45">
            {trade.screenshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trade.screenshotUrl} alt={`${trade.pair} trade screenshot`} className="h-full min-h-72 w-full object-cover" />
            ) : (
              <div className="grid min-h-72 place-items-center p-6 text-center text-sm text-muted-foreground">
                Screenshot wali lama gelin.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-lg border bg-background/45 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={tone === "positive" ? "mt-1 font-semibold text-emerald-500" : tone === "negative" ? "mt-1 font-semibold text-red-500" : "mt-1 font-semibold"}>
        {value}
      </p>
    </div>
  );
}
