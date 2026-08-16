"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Award, BadgeDollarSign, BookOpenCheck, Camera, CheckCircle2, Clock, Download, Edit3, Eye, ImageIcon, Lightbulb, List, Maximize2, Percent, Plus, Printer, Sigma, Target, Trash2, TrendingDown, X } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { FloatingMessage } from "@/components/floating-message";
import { StatCard } from "@/components/stat-card";
import { TradeForm } from "@/components/trade-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type AppLanguage, useAppLanguage } from "@/components/language-settings";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { rowToTrade, tradeToRow, type TradeRow, useSupabaseTrades } from "@/lib/trade-data";
import { respectedThreeRR } from "@/lib/trade-rules";
import { directions, results, sessions, type Trade, type TradingArea } from "@/lib/types";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

const challengeLimits: Record<TradingArea, number> = {
  Backtesting: 100,
  "Forward Testing": 10,
  "Funded Challenge": 100,
  "Account Challenge": 100,
};

const dailyDisciplineAreas = new Set<TradingArea>(["Forward Testing", "Funded Challenge", "Account Challenge"]);

const journeyLabels: Record<TradingArea, { title: string; sample: string; description: string }> = {
  Backtesting: {
    title: "Backtesting journeys",
    sample: "100-trade backtesting sample",
    description: "Start a fresh 100-trade journey after a losing sample, then hide or reopen older journeys for comparison.",
  },
  "Forward Testing": {
    title: "Forward testing journeys",
    sample: "10-trade forward testing journal",
    description: "Run a clean 10-trade forward journal using the same model proven in backtesting.",
  },
  "Funded Challenge": {
    title: "Funded challenge phases",
    sample: "100-trade funded challenge phase",
    description: "Keep funded challenge data separate, track drawdown pressure, and review proof for each phase.",
  },
  "Account Challenge": {
    title: "Account challenge phases",
    sample: "100-trade account challenge phase",
    description: "Separate account challenge trades by phase so each account has clean stats and screenshots.",
  },
};

const emptyFilters = {
  query: "",
  dateFrom: "",
  dateTo: "",
  session: "all",
  result: "all",
  direction: "all",
};

export function TradingAreaPage({ area, title, subtitle }: { area: TradingArea; title: string; subtitle: string }) {
  const language = useAppLanguage();
  const { trades, setTrades, accountEmail, loading, error } = useSupabaseTrades();
  const [filters, setFilters] = React.useState(emptyFilters);
  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = React.useState<Trade | null>(null);
  const [saveMessage, setSaveMessage] = React.useState("");
  const [messageTone, setMessageTone] = React.useState<"danger" | "success" | "neutral">("danger");
  const [reportView, setReportView] = React.useState<"table" | "gallery">("table");
  const [activeCycle, setActiveCycle] = React.useState("Journey 1");
  const [showArchivedJourneys, setShowArchivedJourneys] = React.useState(false);
  const baseAreaTrades = trades.filter((trade) => trade.area === area);
  const areaJourneys = React.useMemo(() => buildAreaJourneys(baseAreaTrades, challengeLimits[area]), [area, baseAreaTrades]);
  const areaTrades = baseAreaTrades.filter((trade) => (trade.backtestCycle || "Journey 1") === activeCycle);
  const closedTrades = areaTrades.filter((trade) => trade.result !== "Open");
  const tp = areaTrades.filter((trade) => trade.result === "TP").length;
  const sl = areaTrades.filter((trade) => trade.result === "SL").length;
  const pnl = areaTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winRate = closedTrades.length ? (tp / closedTrades.length) * 100 : 0;
  const averageR = areaTrades.length ? areaTrades.reduce((sum, trade) => sum + trade.rMultiple, 0) / areaTrades.length : 0;
  const challengeLimit = challengeLimits[area];
  const challengeProgress = challengeLimit ? Math.min(100, (areaTrades.length / challengeLimit) * 100) : 0;
  const threeRTrades = areaTrades.filter(respectedThreeRR).length;
  const threeRRate = areaTrades.length ? (threeRTrades / areaTrades.length) * 100 : 0;
  const lossRate = closedTrades.length ? (sl / closedTrades.length) * 100 : 0;
  const purgingTimeStats = React.useMemo(() => buildPurgingTimeStats(areaTrades), [areaTrades]);
  const challengeComplete = Boolean(challengeLimit && areaTrades.length >= challengeLimit);
  const challengePassed = challengeComplete && winRate >= 50 && averageR > 0 && threeRRate >= 70 && tp >= sl;
  const challengeNeedsStudy = challengeComplete && !challengePassed;
  const coachingNotes = React.useMemo(() => buildCoachingNotes(areaTrades, challengeLimit, title, language), [areaTrades, challengeLimit, title, language]);

  React.useEffect(() => {
    if (!areaJourneys.length || activeCycle !== "Journey 1") return;
    const hasJourneyOne = areaJourneys.some((journey) => journey.name === "Journey 1");
    if (!hasJourneyOne) setActiveCycle(areaJourneys[areaJourneys.length - 1].name);
  }, [activeCycle, areaJourneys]);

  const filteredTrades = areaTrades.filter((trade) => {
    const query = filters.query.toLowerCase();
    const searchable = [trade.pair, trade.strategy.join(" "), trade.session, trade.result, trade.direction, trade.purgingTime, trade.notes, trade.mistake, trade.emotion]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (!filters.dateFrom || trade.date >= filters.dateFrom) &&
      (!filters.dateTo || trade.date <= filters.dateTo) &&
      (filters.session === "all" || trade.session === filters.session) &&
      (filters.result === "all" || trade.result === filters.result) &&
      (filters.direction === "all" || trade.direction === filters.direction)
    );
  });

  const sessionStats = sessions.map((session) => {
    const sessionTrades = areaTrades.filter((trade) => trade.session === session);
    const sessionClosed = sessionTrades.filter((trade) => trade.result !== "Open");
    const sessionTp = sessionTrades.filter((trade) => trade.result === "TP").length;
    const sessionSl = sessionTrades.filter((trade) => trade.result === "SL").length;
    return {
      session,
      trades: sessionTrades.length,
      tp: sessionTp,
      sl: sessionSl,
      winRate: sessionClosed.length ? (sessionTp / sessionClosed.length) * 100 : 0,
    };
  });

  function exportCsv() {
    const rows = [
      ["Date", "Purging Time", "Pair", "Direction", "Session", "Strategies", "Result", "R Multiple", "P/L", "Mistake", "Emotion"],
      ...filteredTrades.map((trade) => [
        trade.date,
        trade.purgingTime,
        trade.pair,
        trade.direction,
        trade.session,
        trade.strategy.join(" + "),
        trade.result,
        `${trade.rMultiple.toFixed(2)}R`,
        String(trade.profitLoss),
        trade.mistake,
        trade.emotion,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replaceAll(" ", "-")}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function showMessage(message: string, tone: "danger" | "success" | "neutral" = "danger") {
    setSaveMessage(message);
    setMessageTone(tone);
  }

  async function updateTradeInArea(trade: Trade) {
    setSaveMessage("");

    const disciplineError = getDailyDisciplineError(area, areaTrades, trade);
    if (disciplineError) {
      showMessage(disciplineError);
      throw new Error(disciplineError);
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (userResponse.error) throw userResponse.error;
      if (!user) throw new Error("Please sign in before saving a trade.");

      const payload = tradeToRow(
        {
          ...trade,
          area,
          backtestCycle: trade.backtestCycle || activeCycle,
        },
        user.id,
      );
      const response = await supabase.from("trades").update(payload).eq("id", trade.id).select("*").single();
      if (response.error) throw response.error;

      const savedTrade = rowToTrade(response.data as TradeRow);
      setTrades((current) => current.map((item) => (item.id === savedTrade.id ? savedTrade : item)));
      setEditingTrade(null);
      setSelectedTrade(null);
      showMessage("Trade-ka waa la update gareeyay.", "success");
    } catch (saveError) {
      showMessage(saveError instanceof Error ? saveError.message : "Trade could not be saved.");
      throw saveError;
    }
  }

  async function deleteTradeFromArea(trade: Trade) {
    if (!window.confirm(`Delete ${trade.pair} trade from ${trade.date}?`)) return;
    setSaveMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const response = await supabase.from("trades").delete().eq("id", trade.id);
      if (response.error) throw response.error;

      setTrades((current) => current.filter((item) => item.id !== trade.id));
      setSelectedTrade(null);
      setEditingTrade(null);
      showMessage("Trade-ka waa la delete gareeyay.", "success");
    } catch (deleteError) {
      showMessage(deleteError instanceof Error ? deleteError.message : "Trade could not be deleted.");
    }
  }

  return (
    <AppShell title={title} subtitle={subtitle}>
      <FloatingMessage message={saveMessage} tone={messageTone} onClose={() => setSaveMessage("")} />
      <div className="grid gap-5">
        <Card className="glass-panel">
          <CardContent className="py-4 text-sm text-muted-foreground">
            {loading
              ? "Loading section data..."
              : error || `${title} is showing private account data${accountEmail ? `: ${accountEmail}` : ""}.`}
          </CardContent>
        </Card>

          <BacktestingChallengePanel
            area={area}
            language={language}
            title={activeCycle}
            sampleTitle={journeyLabels[area].sample}
            total={areaTrades.length}
            limit={challengeLimit}
            progress={challengeProgress}
            winRate={winRate}
            lossRate={lossRate}
            averageR={averageR}
            threeRRate={threeRRate}
            passed={challengePassed}
            needsStudy={challengeNeedsStudy}
          />

          <BacktestingJourneyPanel
            sectionTitle={journeyLabels[area].title}
            description={journeyLabels[area].description}
            activeCycle={activeCycle}
            journeys={areaJourneys}
            limit={challengeLimit}
            showArchived={showArchivedJourneys}
            onSelect={(cycle) => {
              setActiveCycle(cycle);
              setReportView("table");
            }}
            onToggleArchived={() => setShowArchivedJourneys((current) => !current)}
            onStartNew={() => {
              if (areaTrades.length < challengeLimit) {
                showMessage(`${activeCycle} wali ma dhammaan. Journal cusub lama bilaabi karo ilaa ${challengeLimit} trades la gaarsiiyo.`, "neutral");
                return;
              }
              setActiveCycle(nextJourneyName([...areaJourneys.map((journey) => journey.name), activeCycle]));
              setShowArchivedJourneys(true);
              setReportView("table");
            }}
          />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          <StatCard label="Total trades" value={`${areaTrades.length}`} change={area} icon={Sigma} />
          <StatCard label="Total TP" value={`${tp}`} change="Target profits" icon={Target} tone="positive" />
          <StatCard label="Total SL" value={`${sl}`} change="Stopped trades" icon={TrendingDown} tone="negative" />
          <StatCard label="Win rate" value={formatPercent(winRate)} change="TP / closed trades" icon={Percent} tone="positive" />
          <StatCard label="Total P/L" value={formatCurrency(pnl)} change={`${averageR.toFixed(2)}R avg`} icon={BadgeDollarSign} tone={pnl >= 0 ? "positive" : "negative"} />
          <StatCard label="Best purging time" value={purgingTimeStats.best?.time ?? "-"} change={purgingTimeStats.best ? `${formatCurrency(purgingTimeStats.best.pnl)} net` : "Track trade time"} icon={Clock} tone="positive" />
          <StatCard label="Worst purging time" value={purgingTimeStats.worst?.time ?? "-"} change={purgingTimeStats.worst ? `${formatCurrency(purgingTimeStats.worst.pnl)} net loss` : "Track losing time"} icon={Clock} tone="negative" />
        </div>

        <section className="grid gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Session totals</h2>
            <p className="mt-1 text-sm text-muted-foreground">Asia, London, and New York results inside {title}.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sessionStats.flatMap((item) => [
              <StatCard key={`${item.session}-trades`} label={`Total ${item.session} Trades`} value={`${item.trades}`} change={title} icon={Sigma} />,
              <StatCard key={`${item.session}-tp`} label={`Total ${item.session} TP`} value={`${item.tp}`} change="Target profits" icon={Target} tone="positive" />,
              <StatCard key={`${item.session}-sl`} label={`Total ${item.session} SL`} value={`${item.sl}`} change="Stopped trades" icon={TrendingDown} tone="negative" />,
              <StatCard key={`${item.session}-wr`} label={`${item.session} Win Rate`} value={formatPercent(item.winRate)} change="TP / closed" icon={Percent} tone="positive" />,
            ])}
          </div>
        </section>

        <CoachingPanel title={title} limit={challengeLimit} trades={areaTrades} notes={coachingNotes} language={language} />

        <div className="grid gap-5">
          <Card className="glass-panel min-w-0">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{title} report</CardTitle>
                <CardDescription>Search, filter, print, and export trades assigned to this section.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="size-4" />
                  Print
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="size-4" />
                  CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ReportFilters filters={filters} onChange={setFilters} />
                <div className="flex w-fit rounded-md border bg-background/55 p-1">
                  <Button type="button" size="sm" variant={reportView === "table" ? "default" : "ghost"} onClick={() => setReportView("table")}>
                    <List className="size-4" />
                    Table
                  </Button>
                  <Button type="button" size="sm" variant={reportView === "gallery" ? "default" : "ghost"} onClick={() => setReportView("gallery")}>
                    <ImageIcon className="size-4" />
                    Gallery
                  </Button>
                </div>
              {reportView === "gallery" ? (
                <TradeGallery trades={filteredTrades} onOpen={setSelectedTrade} />
              ) : (
                <TradeTable trades={filteredTrades} onOpen={setSelectedTrade} onEdit={setEditingTrade} onDelete={deleteTradeFromArea} />
              )}
              {!filteredTrades.length ? <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Report-kan wali trade kuma jiro.</p> : null}
            </CardContent>
          </Card>
        </div>

        <OpenPositionsPanel trades={areaTrades.filter((trade) => trade.result === "Open")} onOpen={setSelectedTrade} onEdit={setEditingTrade} onDelete={deleteTradeFromArea} />

        {selectedTrade ? (
          <TradeDetailModal
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
            onEdit={(trade) => {
              setSelectedTrade(null);
              setEditingTrade(trade);
            }}
            onDelete={deleteTradeFromArea}
          />
        ) : null}
        {editingTrade ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
            <div className="glass-panel max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg border bg-background/95 p-4 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Edit {title} trade</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Update the data, add after image if this open position closed, then review and agree.
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setEditingTrade(null)} aria-label="Close edit trade">
                  <X className="size-4" />
                </Button>
              </div>
              <TradeForm selectedTrade={editingTrade} initialArea={area} lockArea onCancel={() => setEditingTrade(null)} onSave={updateTradeInArea} />
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

type BacktestingJourney = {
  name: string;
  trades: number;
  tp: number;
  sl: number;
  winRate: number;
  pnl: number;
  averageR: number;
  complete: boolean;
};

function buildAreaJourneys(trades: Trade[], limit: number): BacktestingJourney[] {
  const grouped = trades.reduce<Record<string, Trade[]>>((groups, trade) => {
    const cycle = trade.backtestCycle || "Journey 1";
    groups[cycle] ??= [];
    groups[cycle].push(trade);
    return groups;
  }, {});

  return Object.entries(grouped)
    .map(([name, items]) => {
      const closed = items.filter((trade) => trade.result !== "Open");
      const tp = items.filter((trade) => trade.result === "TP").length;
      const sl = items.filter((trade) => trade.result === "SL").length;
      return {
        name,
        trades: items.length,
        tp,
        sl,
        winRate: closed.length ? (tp / closed.length) * 100 : 0,
        pnl: items.reduce((sum, trade) => sum + trade.profitLoss, 0),
        averageR: items.length ? items.reduce((sum, trade) => sum + trade.rMultiple, 0) / items.length : 0,
        complete: items.length >= limit,
      };
    })
    .sort((a, b) => journeyNumber(a.name) - journeyNumber(b.name));
}

function journeyNumber(name: string) {
  const match = name.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function nextJourneyName(names: string[]) {
  const highest = names.reduce((max, name) => Math.max(max, journeyNumber(name)), 0);
  return `Journey ${highest + 1}`;
}

function emptyJourney(name: string): BacktestingJourney {
  return { name, trades: 0, tp: 0, sl: 0, winRate: 0, pnl: 0, averageR: 0, complete: false };
}

function BacktestingJourneyPanel({
  sectionTitle,
  description,
  activeCycle,
  journeys,
  limit,
  showArchived,
  onSelect,
  onToggleArchived,
  onStartNew,
}: {
  sectionTitle: string;
  description: string;
  activeCycle: string;
  journeys: BacktestingJourney[];
  limit: number;
  showArchived: boolean;
  onSelect: (cycle: string) => void;
  onToggleArchived: () => void;
  onStartNew: () => void;
}) {
  const activeJourney = journeys.find((journey) => journey.name === activeCycle) ?? emptyJourney(activeCycle);
  const archived = journeys.filter((journey) => journey.name !== activeCycle);

  return (
    <Card className="glass-panel">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{sectionTitle}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onToggleArchived}>
            {showArchived ? "Hide old journeys" : "Show old journeys"}
          </Button>
          <Button type="button" size="sm" onClick={onStartNew}>
            <Plus className="size-4" />
            Start new journey
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-5">
          <JourneyMetric label="Active" value={activeJourney.name} />
          <JourneyMetric label="Trades" value={`${activeJourney.trades}/${limit}`} />
          <JourneyMetric label="TP / SL" value={`${activeJourney.tp} / ${activeJourney.sl}`} />
          <JourneyMetric label="Win rate" value={formatPercent(activeJourney.winRate)} />
          <JourneyMetric label="P/L" value={formatCurrency(activeJourney.pnl)} tone={activeJourney.pnl >= 0 ? "positive" : "negative"} />
        </div>

        <div className="flex flex-wrap gap-2">
          {[...journeys, ...(journeys.some((journey) => journey.name === activeCycle) ? [] : [activeJourney])].map((journey) => (
            <Button key={journey.name} type="button" variant={journey.name === activeCycle ? "default" : "outline"} size="sm" onClick={() => onSelect(journey.name)}>
              {journey.name}
            </Button>
          ))}
        </div>

        {showArchived ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {archived.length ? (
              archived.map((journey) => (
                <button key={journey.name} type="button" className="rounded-lg border bg-background/45 p-4 text-left transition hover:border-primary/60" onClick={() => onSelect(journey.name)}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="font-semibold">{journey.name}</span>
                    <Badge variant={journey.complete ? "secondary" : "outline"}>{journey.trades}/{limit}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>Win rate: {formatPercent(journey.winRate)}</span>
                    <span>Avg R: {journey.averageR.toFixed(2)}R</span>
                    <span>TP/SL: {journey.tp}/{journey.sl}</span>
                    <span className={journey.pnl >= 0 ? "text-emerald-500" : "text-red-500"}>{formatCurrency(journey.pnl)}</span>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No archived journeys yet. When you start Journey 2, Journey 1 stays here for comparison.</p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function JourneyMetric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "positive" | "negative" | "neutral" }) {
  return (
    <div className="rounded-lg border bg-background/45 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={tone === "positive" ? "mt-1 font-semibold text-emerald-500" : tone === "negative" ? "mt-1 font-semibold text-red-500" : "mt-1 font-semibold"}>{value}</p>
    </div>
  );
}

function buildCoachingNotes(trades: Trade[], limit: number, title: string, language: AppLanguage) {
  const so = language === "so";
  if (!trades.length) {
    return [
      so
        ? `Bilow hal trade oo nadiif ah: before sawir, after sawir, kadib qor sababta aad u gashay iyo waxa aad baratay.`
        : `Start with one clean trade: before screenshot, after screenshot, then write why you entered and what you learned.`,
    ];
  }

  const closedTrades = trades.filter((trade) => trade.result !== "Open");
  const slTrades = trades.filter((trade) => trade.result === "SL");
  const tpTrades = trades.filter((trade) => trade.result === "TP");
  const weakRrTrades = trades.filter((trade) => trade.rr < 3);
  const mistakeCounts = countBy(trades.map((trade) => trade.mistake || "None").filter((mistake) => mistake.toLowerCase() !== "none"));
  const emotionCounts = countBy(trades.map((trade) => trade.emotion || "Not logged").filter((emotion) => emotion !== "Not logged"));
  const worstSession = sessions
    .map((session) => {
      const sessionTrades = trades.filter((trade) => trade.session === session);
      const pnl = sessionTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      return { session, pnl, trades: sessionTrades.length };
    })
    .filter((item) => item.trades)
    .sort((a, b) => a.pnl - b.pnl)[0];

  const notes = [
    so
      ? `${trades.length}/${limit} trade ayaa la geliyay. Hal model ku soco ilaa sample-ku dhammaado; ha isku darin rules cusub.`
      : `${trades.length}/${limit} trades logged. Stay with one model until the sample is complete; do not mix new rules yet.`,
  ];

  if (closedTrades.length) {
    notes.push(
      so
        ? `${tpTrades.length} TP iyo ${slTrades.length} SL. Haddii SL-ku bato, trade kasta ka hor is weydii: liquidity ma la qaaday, 1H TSQ ma cad yahay?`
        : `${tpTrades.length} TP vs ${slTrades.length} SL. If SL is catching up, ask before each trade: was liquidity taken, and is 1H TSQ clear?`,
    );
  }

  if (weakRrTrades.length) {
    notes.push(
      so
        ? `${weakRrTrades.length} trade waxay ka hooseeyeen 3RR. Trade aan 3RR cad lahayn waa in la dhaafaa, xitaa haddii entry-gu qurux badan yahay.`
        : `${weakRrTrades.length} trades were below 3RR. Skip trades without a clean 3RR path, even when the entry looks attractive.`,
    );
  }

  if (mistakeCounts[0]) {
    notes.push(
      so
        ? `Qaladka ugu badan waa ${mistakeCounts[0].name} (${mistakeCounts[0].count}x). Samee hal rule oo kaa celinaya qaladkaas trade-ka xiga.`
        : `Top mistake is ${mistakeCounts[0].name} (${mistakeCounts[0].count}x). Create one rule that blocks that mistake on the next trade.`,
    );
  } else {
    notes.push(so ? "Qalad cad wali lama hayo. Sii qor sabab sax ah; 'None' kaliya ha noqon haddii wax laga baran karo." : "No clear mistake is dominating yet. Keep writing exact reasons, not only 'None' when there is something to learn.");
  }

  if (emotionCounts[0]) {
    notes.push(
      so
        ? `Dareenka ugu badan waa ${emotionCounts[0].name}. Haddii dareenkaas loss la socdo, hal candle sug ka hor entry-ga.`
        : `Main emotion is ${emotionCounts[0].name}. If that emotion appears before losses, wait one more candle before entry.`,
    );
  }

  if (worstSession && worstSession.pnl < 0) {
    notes.push(
      so
        ? `${worstSession.session} waa session-ka ugu liita P/L. Jooji ilaa aad dib u eegto sawirrada loss-ka.`
        : `${worstSession.session} is weakest by P/L. Pause that session until you review the losing charts.`,
    );
  }

  if (trades.length >= limit && slTrades.length > tpTrades.length) {
    notes.push(
      so
        ? `${title} sample-kan wali diyaar uma aha scale. Casharrada ku noqo, screenshot-yada SL dib u eeg, kadib journey cusub bilow.`
        : `This ${title} sample is not ready to scale. Review lessons, tighten rules, then start a fresh journal.`,
    );
  }

  return notes.slice(0, 6);
}

function countBy(values: string[]) {
  return Object.values(
    values.reduce<Record<string, { name: string; count: number }>>((items, value) => {
      items[value] ??= { name: value, count: 0 };
      items[value].count += 1;
      return items;
    }, {}),
  ).sort((a, b) => b.count - a.count);
}

function getDailyDisciplineError(area: TradingArea, trades: Trade[], trade: Trade) {
  if (!dailyDisciplineAreas.has(area)) return "";

  const sameDayTrades = trades.filter((item) => item.id !== trade.id && item.date === trade.date);
  const sameSession = sameDayTrades.find((item) => item.session === trade.session);

  if (sameSession) {
    return `Session-kan (${trade.session}) maanta trade hore ayaa laga qaatay. 3-da trade waxay u kala baxayaan Asia, London, iyo New York; hal session laba jeer lagama qaadanayo.`;
  }

  if (sameDayTrades.length >= 3) {
    return "Waxaad samaynaysaa over trading. Maanta 3 trade ayaa kuu dhammaatay. Orod oo yara seexo ama suuqa u yara bax si naftaadu u soo yara dagto.";
  }

  return "";
}

function buildPurgingTimeStats(trades: Trade[]) {
  const grouped = Object.values(
    trades
      .filter((trade) => trade.purgingTime && trade.result !== "Open")
      .reduce<Record<string, { time: string; trades: number; pnl: number }>>((times, trade) => {
        const hour = trade.purgingTime.slice(0, 2);
        const time = `${hour}:00`;
        times[time] ??= { time, trades: 0, pnl: 0 };
        times[time].trades += 1;
        times[time].pnl += trade.profitLoss;
        return times;
      }, {}),
  );

  if (!grouped.length) return { best: null, worst: null };

  return {
    best: grouped.slice().sort((a, b) => b.pnl - a.pnl)[0],
    worst: grouped.slice().sort((a, b) => a.pnl - b.pnl)[0],
  };
}

type CoachingBoardStyle = "redline" | "clean" | "focus";

const coachingBoardStyleKey = "tet-community-coaching-board-style";

function CoachingPanel({ title, limit, trades, notes, language }: { title: string; limit: number; trades: Trade[]; notes: string[]; language: AppLanguage }) {
  const so = language === "so";
  const [boardStyle, setBoardStyle] = React.useState<CoachingBoardStyle>("redline");
  const [captureMessage, setCaptureMessage] = React.useState("");
  const losses = trades.filter((trade) => trade.result === "SL").length;
  const tpTrades = trades.filter((trade) => trade.result === "TP").length;
  const beTrades = trades.filter((trade) => trade.result === "BE").length;
  const partialTrades = trades.filter((trade) => trade.result === "Partial").length;
  const closedTrades = trades.filter((trade) => trade.result !== "Open");
  const pnl = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const averageR = trades.length ? trades.reduce((sum, trade) => sum + trade.rMultiple, 0) / trades.length : 0;
  const averagePnl = trades.length ? pnl / trades.length : 0;
  const winRate = closedTrades.length ? (tpTrades / closedTrades.length) * 100 : 0;
  const lossRate = closedTrades.length ? (losses / closedTrades.length) * 100 : 0;
  const threeRRate = trades.length ? (trades.filter(respectedThreeRR).length / trades.length) * 100 : 0;
  const progress = limit ? Math.min(100, (trades.length / limit) * 100) : 0;
  const screenshotPairs = trades.filter((trade) => trade.beforeScreenshotUrl && trade.afterScreenshotUrl).length;
  const topMistake = countBy(trades.map((trade) => trade.mistake || "None").filter((mistake) => mistake.toLowerCase() !== "none"))[0];
  const topSession = sessions
    .map((session) => {
      const sessionTrades = trades.filter((trade) => trade.session === session);
      return {
        session,
        trades: sessionTrades.length,
        pnl: sessionTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
      };
    })
    .filter((item) => item.trades)
    .sort((a, b) => b.pnl - a.pnl)[0];
  const verdict =
    trades.length >= limit
      ? tpTrades >= losses && averageR > 0
        ? so
          ? "Journal-ku wuu gudbay: rules-ka way shaqaynayaan. Sample-kan kaydi oo model-ka ha beddelin."
          : "Journal passed: rules are holding. Archive this sample and keep the same model."
        : so
          ? "Journal-ku wuxuu u baahan yahay review: loss ama qalad ayaa badan. Baro, adkee, kadib dib u bilow."
          : "Journal needs review: losses or mistakes are too heavy. Study, tighten, then restart."
      : so
        ? "Sample-ku wali wuu dhismayaa. Consistency ilaali ka hor intaadan profit eryan."
        : "Sample still building. Protect consistency before chasing profit.";
  const resultLine = so
    ? trades.length
      ? `Waxaad hadda haysaa ${tpTrades} TP, ${losses} SL, ${beTrades} BE, iyo ${partialTrades} partial. Win rate-ku waa ${formatPercent(winRate)}.`
      : "Wali trade lama gelin. Board-kan wuxuu bilaabmayaa marka trade-ka koowaad la qoro."
    : trades.length
      ? `You currently have ${tpTrades} TP, ${losses} SL, ${beTrades} BE, and ${partialTrades} partial. Win rate is ${formatPercent(winRate)}.`
      : "No trades yet. This board starts working after the first logged trade.";
  const riskLine = topMistake
    ? so
      ? `Khatarta ugu muuqata waa ${topMistake.name}. Qaladkaas ayaa soo noqday ${topMistake.count} jeer, markaa rule gaar ah u samee.`
      : `The clearest risk is ${topMistake.name}. It appeared ${topMistake.count} times, so give it a specific blocking rule.`
    : so
      ? "Qalad weyn wali ma soo bixin. Tani waa fiican tahay, laakiin sii qor sababta trade kasta si review-gu u noqdo sax."
      : "No dominant mistake yet. That is good, but keep logging the reason behind every trade so review stays accurate.";
  const nextAction =
    trades.length >= limit
      ? tpTrades >= losses && averageR > 0
        ? so
          ? "Sample-kan kaydi, natiijada baro, kadib isla model-kan ku soco qaybta xigta adigoo risk-ka ilaalinaya."
          : "Archive this sample, study the result, then continue with the same model while keeping risk controlled."
        : so
          ? "Ha scale-garayn. Ku noqo casharrada, dib u eeg sawirrada SL, kadib journey cusub ku bilow rules cad."
          : "Do not scale yet. Revisit the lessons, review SL screenshots, then start a fresh journey with clearer rules."
      : so
        ? `Sii wad ilaa ${limit} trades. Trade kasta ka hor hubi 3RR, liquidity, session, iyo screenshot proof.`
        : `Continue until ${limit} trades. Before every entry, confirm 3RR, liquidity, session, and screenshot proof.`;
  const styleLabels: Record<CoachingBoardStyle, string> = {
    redline: so ? "Redline" : "Redline",
    clean: so ? "Nadiif" : "Clean",
    focus: so ? "Focus" : "Focus",
  };
  const boardClasses: Record<CoachingBoardStyle, string> = {
    redline: "border-primary/35 bg-gradient-to-br from-primary/15 via-background to-background",
    clean: "border-border bg-gradient-to-br from-background via-background to-muted/35",
    focus: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-primary/10",
  };
  const accentClasses: Record<CoachingBoardStyle, string> = {
    redline: "from-primary to-red-700",
    clean: "from-foreground to-muted-foreground",
    focus: "from-emerald-500 to-primary",
  };

  React.useEffect(() => {
    const savedStyle = window.localStorage.getItem(coachingBoardStyleKey);
    if (savedStyle === "redline" || savedStyle === "clean" || savedStyle === "focus") {
      setBoardStyle(savedStyle);
    }
  }, []);

  function updateBoardStyle(style: CoachingBoardStyle) {
    setBoardStyle(style);
    window.localStorage.setItem(coachingBoardStyleKey, style);
  }

  async function downloadCoachingScreenshot() {
    setCaptureMessage(so ? "Sawirka waa la diyaarinayaa..." : "Preparing screenshot...");
    try {
      const filename = `${title.toLowerCase().replaceAll(" ", "-")}-coaching-board.png`;
      await downloadCoachingShareCard(
        {
          title,
          so,
          boardStyle,
          colorMode: getCurrentColorMode(),
          tradesLogged: trades.length,
          limit,
          progress,
          tpTrades,
          losses,
          beTrades,
          partialTrades,
          winRate,
          lossRate,
          averageR,
          averagePnl,
          threeRRate,
          screenshotPairs,
          topSession: topSession?.session ?? "-",
          resultLine,
          riskLine,
          nextAction,
          verdict,
          notes,
        },
        filename,
      );
      setCaptureMessage(so ? "Sawirkii waa la download gareeyay. Hadda waad diri kartaa." : "Screenshot downloaded. You can send it now.");
    } catch {
      setCaptureMessage(so ? "Sawirka lama qaadi karin. Isku day mar kale ama isticmaal screenshot-ka device-ka." : "Screenshot could not be captured. Try again or use your device screenshot.");
    }
  }

  return (
    <Card className="glass-panel overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-primary" />
            <CardTitle>{title} {so ? "guddiga coaching-ka" : "coaching board"}</CardTitle>
          </div>
          <Badge variant="secondary">{so ? "Sawir-ready" : "Screenshot-ready"}</Badge>
        </div>
        <CardDescription>
          {so
            ? "Board cad oo lagu fahmi karo halka aad marayso, qaladka kuu badan, iyo tallaabada xigta."
            : "A clear coaching board for status, mistakes, risk, and the next action."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/45 p-3 print:hidden">
          <div>
            <p className="text-sm font-semibold">{so ? "Qurxi coaching board-ka" : "Customize coaching board"}</p>
            <p className="text-xs text-muted-foreground">{so ? "Dooro muuqaalka aad rabto ka hor screenshot ama review." : "Choose the look you want before screenshot or review."}</p>
          </div>
          <div className="grid gap-2">
            <div className="flex flex-wrap justify-end gap-2">
              {(Object.keys(styleLabels) as CoachingBoardStyle[]).map((style) => (
                <Button key={style} type="button" size="sm" variant={boardStyle === style ? "default" : "outline"} onClick={() => updateBoardStyle(style)}>
                  {styleLabels[style]}
                </Button>
              ))}
              <Button type="button" size="sm" onClick={downloadCoachingScreenshot}>
                <Camera className="size-4" />
                {so ? "Qaado sawir" : "Download screenshot"}
              </Button>
            </div>
            {captureMessage ? <p className="text-right text-xs text-muted-foreground">{captureMessage}</p> : null}
          </div>
        </div>

        <div id="coaching-board" className={cn("rounded-xl border p-4 shadow-inner", boardClasses[boardStyle])}>
          <div className={cn("mb-4 h-1.5 rounded-full bg-gradient-to-r", accentClasses[boardStyle])} />
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{so ? "Soo koobid coach" : "Coach summary"}</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">{trades.length}/{limit} {so ? "trade la qoray" : "trades logged"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {so ? `${title} wuxuu u baahan yahay natiijo la cabbiri karo, ma aha dareen.` : `${title} needs measured evidence, not feelings.`}
              </p>
            </div>
            <Badge variant={tpTrades >= losses ? "positive" : "negative"}>
              {tpTrades} TP / {losses} SL
            </Badge>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{so ? "Progress" : "Progress"}</span>
              <span>{formatPercent(progress)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", accentClasses[boardStyle])} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MiniResult label={so ? "Win rate" : "Win rate"} value={formatPercent(winRate)} tone={winRate >= 50 ? "positive" : winRate > 0 ? "neutral" : "negative"} />
            <MiniResult label={so ? "Loss rate" : "Loss rate"} value={formatPercent(lossRate)} tone={lossRate > winRate ? "negative" : "neutral"} />
            <MiniResult label={so ? "Celcelis R" : "Average R"} value={`${averageR.toFixed(2)}R`} tone={averageR > 0 ? "positive" : averageR < 0 ? "negative" : "neutral"} />
            <MiniResult label={so ? "Celcelis P/L" : "Average P/L"} value={formatCurrency(averagePnl)} tone={averagePnl > 0 ? "positive" : averagePnl < 0 ? "negative" : "neutral"} />
            <MiniResult label={so ? "3RR discipline" : "3RR discipline"} value={formatPercent(threeRRate)} tone={threeRRate >= 70 ? "positive" : threeRRate > 0 ? "neutral" : "negative"} />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <CoachBlock icon={Target} title={so ? "Wax dhacay" : "What happened"} text={resultLine} />
            <CoachBlock icon={TrendingDown} title={so ? "Khatarta ugu weyn" : "Biggest risk"} text={riskLine} />
            <CoachBlock icon={CheckCircle2} title={so ? "Tallaabada xigta" : "Next action"} text={nextAction} />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-lg border bg-background/70 p-3">
              <p className="text-xs font-medium text-muted-foreground">{so ? "Natiijooyinka kooban" : "Quick numbers"}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <span className="rounded-md bg-muted/60 px-3 py-2">TP: <b>{tpTrades}</b></span>
                <span className="rounded-md bg-muted/60 px-3 py-2">SL: <b>{losses}</b></span>
                <span className="rounded-md bg-muted/60 px-3 py-2">BE: <b>{beTrades}</b></span>
                <span className="rounded-md bg-muted/60 px-3 py-2">Partial: <b>{partialTrades}</b></span>
                <span className="rounded-md bg-muted/60 px-3 py-2">{so ? "Sawirro" : "Screens"}: <b>{screenshotPairs}/{trades.length || limit}</b></span>
                <span className="rounded-md bg-muted/60 px-3 py-2">{so ? "Best session" : "Best session"}: <b>{topSession?.session ?? "-"}</b></span>
              </div>
            </div>

            <div className="rounded-lg border bg-background/70 p-3">
              <p className="text-xs font-medium text-muted-foreground">{so ? "Go'aanka coach-ka" : "Coach verdict"}</p>
              <p className="mt-2 text-sm font-semibold leading-6">{verdict}</p>
              <div className="mt-3 grid gap-2">
                {notes.map((note, index) => (
                  <div key={note} className="flex gap-3 rounded-md border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CoachBlock({ icon: Icon, title, text }: { icon: typeof Target; title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function getCurrentColorMode(): "dark" | "light" {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type CoachingShareCardData = {
  title: string;
  so: boolean;
  boardStyle: CoachingBoardStyle;
  colorMode: "dark" | "light";
  tradesLogged: number;
  limit: number;
  progress: number;
  tpTrades: number;
  losses: number;
  beTrades: number;
  partialTrades: number;
  winRate: number;
  lossRate: number;
  averageR: number;
  averagePnl: number;
  threeRRate: number;
  screenshotPairs: number;
  topSession: string;
  resultLine: string;
  riskLine: string;
  nextAction: string;
  verdict: string;
  notes: string[];
};

async function downloadCoachingShareCard(data: CoachingShareCardData, filename: string) {
  const width = 1200;
  const height = 1550;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  context.scale(scale, scale);
  drawCoachingCard(context, data, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("Screenshot export failed."))), "image/png", 0.95);
  });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

function drawCoachingCard(context: CanvasRenderingContext2D, data: CoachingShareCardData, width: number, height: number) {
  const theme = getCoachingCardTheme(data.boardStyle, data.colorMode);
  const padding = 64;
  const cardWidth = width - padding * 2;
  let y = padding;

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, theme.backgroundTop);
  background.addColorStop(1, theme.backgroundBottom);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.fillStyle = theme.softAccent;
  context.beginPath();
  context.arc(width - 160, 140, 170, 0, Math.PI * 2);
  context.fill();

  drawRoundRect(context, padding, padding, cardWidth, height - padding * 2, 34, theme.panel);
  drawRoundRect(context, padding, padding, cardWidth, height - padding * 2, 34, "transparent", theme.border);

  const accent = context.createLinearGradient(padding + 36, padding + 34, width - padding - 36, padding + 34);
  accent.addColorStop(0, theme.accent);
  accent.addColorStop(1, theme.accentEnd);
  drawRoundRect(context, padding + 36, y + 34, cardWidth - 72, 12, 8, accent);
  y += 82;

  context.fillStyle = theme.mutedText;
  context.font = "700 24px Arial";
  context.fillText(data.so ? "TET Community coaching report" : "TET Community coaching report", padding + 44, y);
  context.fillStyle = theme.text;
  context.font = "800 54px Arial";
  y += 66;
  context.fillText(`${data.title}`, padding + 44, y);

  drawPill(context, width - padding - 260, padding + 92, 206, 48, `${data.tpTrades} TP / ${data.losses} SL`, theme);

  y += 44;
  context.fillStyle = theme.mutedText;
  context.font = "400 26px Arial";
  context.fillText(data.so ? `${data.tradesLogged}/${data.limit} trade la qoray` : `${data.tradesLogged}/${data.limit} trades logged`, padding + 44, y);

  y += 48;
  drawProgressBar(context, padding + 44, y, cardWidth - 88, 18, data.progress, theme);
  y += 72;

  const metricGap = 18;
  const metricWidth = (cardWidth - 88 - metricGap * 2) / 3;
  drawMetricBox(context, padding + 44, y, metricWidth, data.so ? "Win rate" : "Win rate", formatPercent(data.winRate), data.winRate >= 50 ? theme.positive : theme.warning, theme);
  drawMetricBox(context, padding + 44 + metricWidth + metricGap, y, metricWidth, data.so ? "Average R" : "Average R", `${data.averageR.toFixed(2)}R`, data.averageR >= 0 ? theme.positive : theme.negative, theme);
  drawMetricBox(context, padding + 44 + (metricWidth + metricGap) * 2, y, metricWidth, "3RR", formatPercent(data.threeRRate), data.threeRRate >= 70 ? theme.positive : theme.warning, theme);
  y += 165;

  const blockGap = 18;
  const blockWidth = (cardWidth - 88 - blockGap * 2) / 3;
  drawTextBlock(context, padding + 44, y, blockWidth, data.so ? "Wax dhacay" : "What happened", data.resultLine, theme);
  drawTextBlock(context, padding + 44 + blockWidth + blockGap, y, blockWidth, data.so ? "Khatarta ugu weyn" : "Biggest risk", data.riskLine, theme);
  drawTextBlock(context, padding + 44 + (blockWidth + blockGap) * 2, y, blockWidth, data.so ? "Tallaabada xigta" : "Next action", data.nextAction, theme);
  y += 250;

  drawRoundRect(context, padding + 44, y, cardWidth - 88, 124, 22, theme.innerPanel, theme.border);
  context.fillStyle = theme.mutedText;
  context.font = "700 20px Arial";
  context.fillText(data.so ? "Go'aanka coach-ka" : "Coach verdict", padding + 72, y + 38);
  context.fillStyle = theme.text;
  context.font = "700 25px Arial";
  wrapCanvasText(context, data.verdict, padding + 72, y + 78, cardWidth - 144, 34, 2);
  y += 154;

  const miniWidth = (cardWidth - 88 - metricGap * 3) / 4;
  drawMetricBox(context, padding + 44, y, miniWidth, data.so ? "Loss rate" : "Loss rate", formatPercent(data.lossRate), data.lossRate > data.winRate ? theme.negative : theme.warning, theme, true);
  drawMetricBox(context, padding + 44 + miniWidth + metricGap, y, miniWidth, data.so ? "Average P/L" : "Average P/L", formatCurrency(data.averagePnl), data.averagePnl >= 0 ? theme.positive : theme.negative, theme, true);
  drawMetricBox(context, padding + 44 + (miniWidth + metricGap) * 2, y, miniWidth, data.so ? "Screens" : "Screens", `${data.screenshotPairs}/${data.tradesLogged || data.limit}`, theme.accent, theme, true);
  drawMetricBox(context, padding + 44 + (miniWidth + metricGap) * 3, y, miniWidth, data.so ? "Best session" : "Best session", data.topSession, theme.accentEnd, theme, true);
  y += 142;

  context.fillStyle = theme.text;
  context.font = "800 28px Arial";
  context.fillText(data.so ? "Talooyinka xiga" : "Next coaching notes", padding + 44, y);
  y += 34;

  data.notes.slice(0, 5).forEach((note, index) => {
    drawNote(context, padding + 44, y, cardWidth - 88, index + 1, note, theme);
    y += 92;
  });

  context.fillStyle = theme.mutedText;
  context.font = "700 22px Arial";
  context.fillText("tet community", padding + 44, height - padding - 38);
  context.textAlign = "right";
  context.fillText(new Date().toLocaleDateString("en-US"), width - padding - 44, height - padding - 38);
  context.textAlign = "left";
}

function getCoachingCardTheme(style: CoachingBoardStyle, colorMode: "dark" | "light") {
  const darkMode = colorMode === "dark";

  if (style === "focus") {
    return darkMode
      ? {
          backgroundTop: "#03140e",
          backgroundBottom: "#05080f",
          panel: "#07110f",
          innerPanel: "#0b1714",
          border: "#1f4f3b",
          text: "#f8fafc",
          mutedText: "#a9b8b1",
          accent: "#10b981",
          accentEnd: "#ef1018",
          softAccent: "rgba(16, 185, 129, 0.14)",
          positive: "#10b981",
          negative: "#ef4444",
          warning: "#f59e0b",
        }
      : {
          backgroundTop: "#f0fdf4",
          backgroundBottom: "#fff7f7",
          panel: "#ffffff",
          innerPanel: "#f8fffb",
          border: "#bbf7d0",
          text: "#102018",
          mutedText: "#53645b",
          accent: "#10b981",
          accentEnd: "#ef1018",
          softAccent: "rgba(16, 185, 129, 0.13)",
          positive: "#059669",
          negative: "#dc2626",
          warning: "#d97706",
        };
  }

  if (style === "clean") {
    return darkMode
      ? {
          backgroundTop: "#0f172a",
          backgroundBottom: "#020617",
          panel: "#111827",
          innerPanel: "#0f172a",
          border: "#334155",
          text: "#f8fafc",
          mutedText: "#94a3b8",
          accent: "#f8fafc",
          accentEnd: "#ef1018",
          softAccent: "rgba(148, 163, 184, 0.14)",
          positive: "#10b981",
          negative: "#ef4444",
          warning: "#f59e0b",
        }
      : {
          backgroundTop: "#f8fafc",
          backgroundBottom: "#e5e7eb",
          panel: "#ffffff",
          innerPanel: "#f8fafc",
          border: "#cbd5e1",
          text: "#0f172a",
          mutedText: "#64748b",
          accent: "#111827",
          accentEnd: "#ef1018",
          softAccent: "rgba(239, 16, 24, 0.10)",
          positive: "#059669",
          negative: "#dc2626",
          warning: "#d97706",
        };
  }

  return darkMode
    ? {
        backgroundTop: "#070b12",
        backgroundBottom: "#111827",
        panel: "#0b111c",
        innerPanel: "#101826",
        border: "#243244",
        text: "#f8fafc",
        mutedText: "#a7b4c8",
        accent: "#ef1018",
        accentEnd: "#991b1b",
        softAccent: "rgba(239, 16, 24, 0.14)",
        positive: "#10b981",
        negative: "#ef4444",
        warning: "#f59e0b",
      }
    : {
        backgroundTop: "#fff7f7",
        backgroundBottom: "#f8fafc",
        panel: "#ffffff",
        innerPanel: "#fffafa",
        border: "#fecaca",
        text: "#111827",
        mutedText: "#64748b",
        accent: "#ef1018",
        accentEnd: "#991b1b",
        softAccent: "rgba(239, 16, 24, 0.12)",
        positive: "#059669",
        negative: "#dc2626",
        warning: "#d97706",
      };
}

function drawRoundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string | CanvasGradient, stroke?: string) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  if (fill !== "transparent") {
    context.fillStyle = fill;
    context.fill();
  }
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = 2;
    context.stroke();
  }
}

function drawPill(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, text: string, theme: ReturnType<typeof getCoachingCardTheme>) {
  drawRoundRect(context, x, y, width, height, 18, theme.innerPanel, theme.border);
  context.fillStyle = theme.positive;
  context.font = "800 22px Arial";
  context.textAlign = "center";
  context.fillText(text, x + width / 2, y + 31);
  context.textAlign = "left";
}

function drawProgressBar(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, value: number, theme: ReturnType<typeof getCoachingCardTheme>) {
  drawRoundRect(context, x, y, width, height, height / 2, theme.innerPanel);
  const gradient = context.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, theme.accent);
  gradient.addColorStop(1, theme.accentEnd);
  drawRoundRect(context, x, y, Math.max(height, (width * value) / 100), height, height / 2, gradient);
}

function drawMetricBox(context: CanvasRenderingContext2D, x: number, y: number, width: number, label: string, value: string, color: string, theme: ReturnType<typeof getCoachingCardTheme>, compact = false) {
  drawRoundRect(context, x, y, width, compact ? 104 : 128, 20, theme.innerPanel, theme.border);
  context.fillStyle = theme.mutedText;
  context.font = "700 18px Arial";
  context.fillText(label, x + 22, y + 34);
  context.fillStyle = color;
  context.font = compact ? "800 28px Arial" : "800 38px Arial";
  wrapCanvasText(context, value, x + 22, y + (compact ? 72 : 88), width - 44, compact ? 28 : 38, 1);
}

function drawTextBlock(context: CanvasRenderingContext2D, x: number, y: number, width: number, title: string, text: string, theme: ReturnType<typeof getCoachingCardTheme>) {
  drawRoundRect(context, x, y, width, 220, 20, theme.innerPanel, theme.border);
  context.fillStyle = theme.accent;
  context.font = "800 22px Arial";
  context.fillText(title, x + 22, y + 38);
  context.fillStyle = theme.text;
  context.font = "500 22px Arial";
  wrapCanvasText(context, text, x + 22, y + 78, width - 44, 30, 4);
}

function drawNote(context: CanvasRenderingContext2D, x: number, y: number, width: number, index: number, text: string, theme: ReturnType<typeof getCoachingCardTheme>) {
  drawRoundRect(context, x, y, width, 78, 18, theme.innerPanel, theme.border);
  drawRoundRect(context, x + 18, y + 18, 42, 42, 21, theme.accent);
  context.fillStyle = "#ffffff";
  context.font = "800 20px Arial";
  context.textAlign = "center";
  context.fillText(String(index), x + 39, y + 46);
  context.textAlign = "left";
  context.fillStyle = theme.text;
  context.font = "500 21px Arial";
  wrapCanvasText(context, text, x + 78, y + 30, width - 102, 27, 2);
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;

  for (let index = 0; index < words.length; index += 1) {
    const testLine = line ? `${line} ${words[index]}` : words[index];
    const metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      lines += 1;
      if (lines === maxLines) {
        context.fillText(`${line.replace(/[.,;:!?-]?$/, "")}...`, x, y);
        return y + lineHeight;
      }
      context.fillText(line, x, y);
      line = words[index];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    context.fillText(line, x, y);
  }
  return y + lineHeight;
}

function tradeAccountTitle(trade: Trade) {
  if (trade.area === "Backtesting") return "Backtesting";
  return trade.accountProfileName || trade.propFirmName || "No account";
}

function tradeAccountMeta(trade: Trade) {
  if (trade.area === "Backtesting") return "";
  const size = trade.accountSize ? formatCurrency(trade.accountSize) : "No size";
  return [trade.propFirmName, size, trade.accountPhase].filter(Boolean).join(" · ");
}

function TradeTable({
  trades,
  onOpen,
  onEdit,
  onDelete,
}: {
  trades: Trade[];
  onOpen: (trade: Trade) => void;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trade date</TableHead>
          <TableHead>Purging time</TableHead>
          <TableHead>Pair</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Strategies</TableHead>
          <TableHead>Result</TableHead>
          <TableHead className="text-right">R</TableHead>
          <TableHead className="text-right">P/L</TableHead>
          <TableHead className="w-32 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => (
          <TableRow key={trade.id}>
            <TableCell>
              <div className="font-medium">{trade.date}</div>
            </TableCell>
            <TableCell>{trade.purgingTime || "-"}</TableCell>
            <TableCell>{trade.pair}</TableCell>
            <TableCell>
              <div className="font-medium">{tradeAccountTitle(trade)}</div>
              {trade.area !== "Backtesting" ? <div className="text-xs text-muted-foreground">{tradeAccountMeta(trade)}</div> : null}
            </TableCell>
            <TableCell>{trade.session}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {trade.strategy.map((strategy) => (
                  <Badge key={strategy} variant="secondary">
                    {strategy}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={trade.result === "TP" ? "positive" : trade.result === "SL" ? "negative" : "secondary"}>{trade.result}</Badge>
            </TableCell>
            <TableCell className="text-right">{trade.rMultiple.toFixed(2)}R</TableCell>
            <TableCell className={trade.profitLoss >= 0 ? "text-right font-medium text-emerald-500" : "text-right font-medium text-red-500"}>
              {formatCurrency(trade.profitLoss)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => onOpen(trade)} aria-label="View trade detail">
                  <Eye className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(trade)} aria-label="Edit trade">
                  <Edit3 className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(trade)} aria-label="Delete trade">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TradeGallery({ trades, onOpen }: { trades: Trade[]; onOpen: (trade: Trade) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {trades.map((trade) => (
        <div key={trade.id} className="overflow-hidden rounded-lg border bg-background/45">
          <button type="button" className="group relative block w-full overflow-hidden bg-muted text-left" onClick={() => onOpen(trade)} aria-label={`Open ${trade.pair} backtest detail`}>
            <GalleryImage src={trade.afterScreenshotUrl || trade.beforeScreenshotUrl || ""} label="After" />
            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
              <GalleryImage src={trade.beforeScreenshotUrl ?? ""} label="Before" />
            </div>
          </button>
          <div className="grid gap-3 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{trade.pair}</p>
                <p className="text-xs text-muted-foreground">{trade.date}</p>
              </div>
              <Badge variant={trade.result === "TP" ? "positive" : trade.result === "SL" ? "negative" : "secondary"}>{trade.result}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{trade.rMultiple.toFixed(2)}R</span>
              <span className={trade.profitLoss >= 0 ? "font-semibold text-emerald-500" : "font-semibold text-red-500"}>{formatCurrency(trade.profitLoss)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {trade.strategy.slice(0, 3).map((strategy) => (
                <Badge key={strategy} variant="secondary">
                  {strategy}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryImage({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative aspect-square bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${label} chart`} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center px-3 text-center text-xs text-muted-foreground">{label} image</div>
      )}
      <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">{label}</span>
    </div>
  );
}

function OpenPositionsPanel({
  trades,
  onOpen,
  onEdit,
  onDelete,
}: {
  trades: Trade[];
  onOpen: (trade: Trade) => void;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
}) {
  if (!trades.length) return null;

  return (
    <Card className="glass-panel">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Open positions</CardTitle>
          <CardDescription>Trades still open. Edit the position when TP, SL, BE, or Partial happens and upload the after/last image.</CardDescription>
        </div>
        <Badge variant="secondary">{trades.length} open</Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>R:R</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>
                  <div className="font-medium">{trade.date}</div>
                  <div className="text-xs text-muted-foreground">{trade.purgingTime || "No time"}</div>
                </TableCell>
                <TableCell className="font-medium">{trade.pair}</TableCell>
                <TableCell>
                  <div className="font-medium">{tradeAccountTitle(trade)}</div>
                  {trade.area !== "Backtesting" ? <div className="text-xs text-muted-foreground">{tradeAccountMeta(trade)}</div> : null}
                </TableCell>
                <TableCell>{trade.session}</TableCell>
                <TableCell>{trade.rr.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => onOpen(trade)} aria-label="View open position">
                      <Eye className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(trade)} aria-label="Edit open position">
                      <Edit3 className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(trade)} aria-label="Delete open position">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BacktestingChallengePanel({
  area,
  language,
  title,
  sampleTitle,
  total,
  limit,
  progress,
  winRate,
  lossRate,
  averageR,
  threeRRate,
  passed,
  needsStudy,
}: {
  area: TradingArea;
  language: AppLanguage;
  title: string;
  sampleTitle: string;
  total: number;
  limit: number;
  progress: number;
  winRate: number;
  lossRate: number;
  averageR: number;
  threeRRate: number;
  passed: boolean;
  needsStudy: boolean;
}) {
  const complete = total >= limit;
  const so = language === "so";

  return (
    <Card className="glass-panel overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <Badge variant={complete ? (passed ? "positive" : needsStudy ? "negative" : "secondary") : "secondary"} className="mb-3">
            {title} challenge
          </Badge>
          <CardTitle>{sampleTitle}</CardTitle>
          <CardDescription>
            {area === "Backtesting"
              ? so
                ? "Dhammeystir 100 backtest ka hor forward testing. Natiijadu waxay kuu sheegaysaa inaad hore u socoto ama casharrada ku noqoto."
                : "Complete 100 backtest trades before forward testing. The result decides whether to move forward or study lessons again."
              : area === "Forward Testing"
                ? so
                  ? `Qaado ${limit} forward-test trades adigoo isticmaalaya model-kii backtesting-ka, 3RR, iyo rules isku mid ah.`
                  : `Take ${limit} forward-test trades using the same model, same 3RR objective, and same rules from backtesting.`
                : so
                  ? "Challenge phase-kan gaar u hay si proof-ka, sessions-ka, qaladaadka, iyo 3RR result-ku nadiif u ahaadaan."
                  : "Keep this challenge phase separate so its proof, session stats, mistakes, and 3RR result stay clean."}
          </CardDescription>
        </div>
        <Button asChild type="button" size="sm" variant="outline">
          <Link href="/journal">
            <ArrowUpRight className="size-4" />
            Add from Journal
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{total}/{limit} trades</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <MiniResult label="Win rate" value={formatPercent(winRate)} />
          <MiniResult label="Loss rate" value={formatPercent(lossRate)} tone={lossRate > winRate ? "negative" : "neutral"} />
          <MiniResult label="Average R" value={`${averageR.toFixed(2)}R`} tone={averageR > 0 ? "positive" : averageR < 0 ? "negative" : "neutral"} />
          <MiniResult label="3RR discipline" value={formatPercent(threeRRate)} tone={threeRRate >= 70 ? "positive" : "neutral"} />
        </div>

        {passed ? (
          <div className="grid gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2 font-semibold">
              <Award className="size-4" />
              {so ? "Shaqo fiican. Sample-kan natiijo wanaagsan ayuu yeeshay." : "Excellent work. You completed this sample with a strong enough result."}
            </div>
            <p>
              {area === "Backtesting"
                ? so
                  ? "Tallaabada xigta: u gudub Forward Testing oo qaado 10 trades adigoo rules, model, iyo 3RR isku mid ah isticmaalaya."
                  : "Next step: move to Forward Testing and take 10 trades using the same rules, same model, and same 3RR objective."
                : so
                  ? "Tallaabada xigta: rules-ka ha beddelin, phase-kan kaydi, kadib sample cusub bilow marka review dhamaado."
                  : "Next step: keep the same rules, archive this phase, and start the next clean sample only after review."}
            </p>
            {area === "Backtesting" ? (
              <Button asChild size="sm" className="w-fit">
                <Link href="/forward-testing">Go to Forward Testing</Link>
              </Button>
            ) : null}
          </div>
        ) : needsStudy ? (
          <div className="grid gap-3 rounded-lg border border-red-500/25 bg-red-500/10 p-4 text-sm leading-6 text-red-600 dark:text-red-400">
            <div className="flex items-center gap-2 font-semibold">
              <BookOpenCheck className="size-4" />
              {so ? "Sample-kan wuxuu u baahan yahay barasho dheeraad ah ka hor scaling." : "This sample needs more study before scaling."}
            </div>
            <p>
              {so
                ? "Loss-ku wuu badan yahay ama 3RR discipline-ku ma joogto. Casharrada ku noqo, dib u eeg SMT, Model #1, TSQ, liquidity, iyo inside-bar rules, kadib sample cusub bilow."
                : "Losses are too heavy or the 3RR discipline is not consistent enough. Go back to lessons, review SMT, Model #1, TSQ, liquidity, and inside-bar rules, then start a fresh sample."}
            </p>
            <Button asChild size="sm" variant="outline" className="w-fit">
              <Link href="/lessons">Review lessons</Link>
            </Button>
          </div>
        ) : (
          <p className="rounded-lg border bg-background/45 p-4 text-sm leading-6 text-muted-foreground">
            {so
              ? `Sii wad ilaa sample-ku gaaro ${limit} trades. Geli before iyo after screenshots si trade kasta proof u yeesho, xusuus kaliya ha noqon.`
              : `Keep going until the sample reaches ${limit} trades. Add before and after screenshots so every trade has proof, not memory.`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MiniResult({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "positive" | "negative" | "neutral" }) {
  return (
    <div className="rounded-lg border bg-background/45 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={tone === "positive" ? "mt-1 text-xl font-semibold text-emerald-500" : tone === "negative" ? "mt-1 text-xl font-semibold text-red-500" : "mt-1 text-xl font-semibold"}>
        {value}
      </p>
    </div>
  );
}

function ReportFilters({ filters, onChange }: { filters: typeof emptyFilters; onChange: (filters: typeof emptyFilters) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(5,1fr)]">
      <Input placeholder="Search pair, strategy, mistake..." value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} />
      <Input type="date" value={filters.dateFrom} onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })} />
      <Input type="date" value={filters.dateTo} onChange={(event) => onChange({ ...filters, dateTo: event.target.value })} />
      <Select value={filters.session} onChange={(event) => onChange({ ...filters, session: event.target.value })}>
        <option value="all">All sessions</option>
        {sessions.map((session) => (
          <option key={session}>{session}</option>
        ))}
      </Select>
      <Select value={filters.result} onChange={(event) => onChange({ ...filters, result: event.target.value })}>
        <option value="all">All results</option>
        {results.map((result) => (
          <option key={result}>{result}</option>
        ))}
      </Select>
      <Select value={filters.direction} onChange={(event) => onChange({ ...filters, direction: event.target.value })}>
        <option value="all">Buy/Sell</option>
        {directions.map((direction) => (
          <option key={direction}>{direction}</option>
        ))}
      </Select>
    </div>
  );
}

function TradeDetailModal({
  trade,
  onClose,
  onEdit,
  onDelete,
}: {
  trade: Trade;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
}) {
  const [expandedImage, setExpandedImage] = React.useState<{ title: string; src: string; alt: string } | null>(null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
      <Card className="glass-panel max-h-[88vh] w-full max-w-4xl overflow-auto">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{trade.pair} detail</CardTitle>
            <CardDescription>
              {trade.date} - {trade.area} - {trade.session} - {trade.direction}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => onEdit(trade)}>
              <Edit3 className="size-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(trade)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close detail">
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Detail label="Result" value={trade.result} />
              <Detail label="P/L" value={formatCurrency(trade.profitLoss)} tone={trade.profitLoss >= 0 ? "positive" : "negative"} />
              <Detail label="R multiple" value={`${trade.rMultiple.toFixed(2)}R`} />
              <Detail label="Entry" value={String(trade.entry)} />
              <Detail label="Stop Loss" value={String(trade.stopLoss)} />
              <Detail label="Take Profit" value={String(trade.takeProfit)} />
              <Detail label="Purging time" value={trade.purgingTime || "-"} />
              {trade.area !== "Backtesting" ? <Detail label="Account" value={tradeAccountTitle(trade)} /> : null}
              {trade.area !== "Backtesting" ? <Detail label="Company" value={trade.propFirmName || "-"} /> : null}
              {trade.area !== "Backtesting" ? <Detail label="Account size" value={trade.accountSize ? formatCurrency(trade.accountSize) : "-"} /> : null}
              {trade.area !== "Backtesting" ? <Detail label="Phase" value={trade.accountPhase || "-"} /> : null}
              {trade.area !== "Backtesting" ? <Detail label="Broker" value={trade.brokerName || "-"} /> : null}
              <Detail label="Risk" value={formatCurrency(trade.riskAmount)} />
              <Detail label="Reward" value={formatCurrency(trade.rewardAmount)} />
              <Detail label="R:R" value={trade.rr.toFixed(2)} />
            </div>
            <div className="rounded-lg border bg-background/45 p-4">
              <h3 className="mb-3 text-sm font-semibold">Strategies</h3>
              <div className="flex flex-wrap gap-2">
                {trade.strategy.map((strategy) => (
                  <Badge key={strategy} variant="secondary">
                    {strategy}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background/45 p-4">
              <h3 className="mb-2 text-sm font-semibold">Notes</h3>
              <p className="text-sm leading-6 text-muted-foreground">{trade.notes || "No notes yet."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={trade.mistake.toLowerCase() === "none" ? "positive" : "negative"}>Mistake: {trade.mistake}</Badge>
                <Badge variant="secondary">Emotion: {trade.emotion || "Not logged"}</Badge>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {trade.beforeScreenshotUrl || trade.afterScreenshotUrl ? (
              <>
                <ImageFrame title="Before setup" src={trade.beforeScreenshotUrl ?? ""} alt={`${trade.pair} before setup`} onExpand={setExpandedImage} />
                <ImageFrame title="After result" src={trade.afterScreenshotUrl ?? ""} alt={`${trade.pair} after result`} onExpand={setExpandedImage} />
              </>
            ) : (
              <ImageFrame title="Main screenshot" src={trade.screenshotUrl} alt={`${trade.pair} trade screenshot`} onExpand={setExpandedImage} />
            )}
          </div>
        </CardContent>
      </Card>
      {expandedImage ? <FullscreenImage image={expandedImage} onClose={() => setExpandedImage(null)} /> : null}
    </div>
  );
}

function ImageFrame({ title, src, alt, onExpand }: { title: string; src: string; alt: string; onExpand: (image: { title: string; src: string; alt: string }) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background/45">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2 text-xs font-medium text-muted-foreground">
        <span>{title}</span>
        {src ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onExpand({ title, src, alt })}>
            <Maximize2 className="size-4" />
            Full screen
          </Button>
        ) : null}
      </div>
      {src ? (
        <button type="button" className="block w-full" onClick={() => onExpand({ title, src, alt })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-h-80 min-h-56 w-full object-cover" />
        </button>
      ) : (
        <div className="grid min-h-56 place-items-center p-6 text-center text-sm text-muted-foreground">Screenshot wali lama gelin.</div>
      )}
    </div>
  );
}

function FullscreenImage({ image, onClose }: { image: { title: string; src: string; alt: string }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4">
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold text-white">{image.title}</p>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X className="size-4" />
          Close
        </Button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} className="max-h-[88vh] max-w-[96vw] rounded-lg object-contain shadow-2xl" />
    </div>
  );
}

function Detail({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "positive" | "negative" | "neutral" }) {
  return (
    <div className="rounded-lg border bg-background/45 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={tone === "positive" ? "mt-1 font-semibold text-emerald-500" : tone === "negative" ? "mt-1 font-semibold text-red-500" : "mt-1 font-semibold"}>
        {value}
      </p>
    </div>
  );
}
