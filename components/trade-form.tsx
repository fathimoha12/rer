"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { accountProfileLabel, useAccountProfiles } from "@/lib/account-profiles";
import { calculateRMultiple, respectedThreeRR } from "@/lib/trade-rules";
import type { Trade, TradeStrategy } from "@/lib/types";
import { directions, results, sessions, strategies, tradingAreas } from "@/lib/types";

function currentTimeValue() {
  return new Date().toTimeString().slice(0, 5);
}

const emptyTrade: Trade = {
  id: "",
  pair: "EUR/USD",
  direction: "Buy",
  strategy: ["KIL"],
  strategyPoints: ["Liquidity sweep", "Displacement", "3RR target clear"],
  area: "Backtesting",
  backtestCycle: "Journey 1",
  accountProfileId: "",
  accountProfileName: "",
  propFirmName: "",
  accountSize: 0,
  accountPhase: "",
  brokerName: "",
  session: "London",
  entry: 0,
  stopLoss: 0,
  takeProfit: 0,
  riskAmount: 100,
  rewardAmount: 300,
  rr: 3,
  result: "Open",
  profitLoss: 0,
  rMultiple: 0,
  date: new Date().toISOString().slice(0, 10),
  purgingTime: currentTimeValue(),
  screenshotUrl: "",
  beforeScreenshotUrl: "",
  afterScreenshotUrl: "",
  notes: "",
  mistake: "None",
  emotion: "",
};

export function TradeForm({
  selectedTrade,
  initialArea,
  lockArea = false,
  onSave,
  onCancel,
}: {
  selectedTrade?: Trade | null;
  initialArea?: Trade["area"];
  lockArea?: boolean;
  onSave: (trade: Trade) => void | Promise<void>;
  onCancel: () => void;
}) {
  const baseEmptyTrade = React.useMemo(() => ({ ...emptyTrade, area: initialArea ?? emptyTrade.area, date: new Date().toISOString().slice(0, 10), purgingTime: currentTimeValue() }), [initialArea]);
  const [trade, setTrade] = React.useState<Trade>(selectedTrade ?? baseEmptyTrade);
  const [submitting, setSubmitting] = React.useState(false);
  const [formMessage, setFormMessage] = React.useState("");
  const [reviewTrade, setReviewTrade] = React.useState<Trade | null>(null);
  const { profiles: accountProfiles, loading: accountsLoading, error: accountsError } = useAccountProfiles();

  React.useEffect(() => {
    setTrade(selectedTrade ?? baseEmptyTrade);
  }, [baseEmptyTrade, selectedTrade]);

  const rMultiple = calculateRMultiple(trade);
  const respectedTarget = respectedThreeRR(trade);
  const strategyPointsText = (trade.strategyPoints ?? []).join("\n");
  const usesBeforeAfterScreenshots = tradingAreas.includes(trade.area);
  const isClosedResult = trade.result !== "Open";
  const needsAccountProfile = trade.area !== "Backtesting";
  const selectedAccount = accountProfiles.find((profile) => profile.id === trade.accountProfileId);

  const update = <K extends keyof Trade>(key: K, value: Trade[K]) => {
    setTrade((current) => {
      const next = { ...current, [key]: value };

      if (key === "area" && value === "Backtesting") {
        next.accountProfileId = "";
        next.accountProfileName = "";
        next.propFirmName = "";
        next.accountSize = 0;
        next.accountPhase = "";
        next.brokerName = "";
      }

      if (key === "riskAmount" || key === "rewardAmount") {
        const risk = key === "riskAmount" ? Number(value) : next.riskAmount;
        const reward = key === "rewardAmount" ? Number(value) : next.rewardAmount;
        next.rr = risk > 0 ? Number((reward / risk).toFixed(2)) : 0;
      }

      if (key === "rr" || key === "riskAmount") {
        const risk = key === "riskAmount" ? Number(value) : next.riskAmount;
        const rr = key === "rr" ? Number(value) : next.rr;
        next.rewardAmount = Number((risk * rr).toFixed(2));
      }

      next.rMultiple = calculateRMultiple(next);
      return next;
    });
  };

  function selectAccountProfile(profileId: string) {
    const profile = accountProfiles.find((item) => item.id === profileId);
    setTrade((current) => ({
      ...current,
      accountProfileId: profile?.id ?? "",
      accountProfileName: profile?.name ?? "",
      propFirmName: profile?.firmName ?? "",
      accountSize: profile?.accountSize ?? 0,
      accountPhase: profile?.accountPhase ?? "",
      brokerName: profile?.brokerName ?? "",
    }));
  }

  const toggleStrategy = (strategy: TradeStrategy) => {
    const current = trade.strategy;
    const next = current.includes(strategy) ? current.filter((item) => item !== strategy) : [...current, strategy];
    update("strategy", (next.length ? next : [strategy]) as Trade["strategy"]);
  };

  const updateImageFile = (key: "screenshotUrl" | "beforeScreenshotUrl" | "afterScreenshotUrl", file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      update(key, String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  function validateTradeForReview(nextTrade: Trade) {
    if (usesBeforeAfterScreenshots && !nextTrade.beforeScreenshotUrl) {
      return "Trade-ka lama diwaan gelin karo ilaa aad geliso first/before screenshot.";
    }

    if (usesBeforeAfterScreenshots && nextTrade.result !== "Open" && !nextTrade.afterScreenshotUrl) {
      return "Trade closed ah wuxuu u baahan yahay after/last image si natiijada loo caddeeyo.";
    }

    if (needsAccountProfile && !nextTrade.accountProfileId) {
      return "Fadlan dooro account-ka aad trade-kan ka qaadayso. Accounts-ka waxaad ka samaysan kartaa Settings.";
    }

    return "";
  }

  async function confirmReviewedTrade() {
    if (!reviewTrade) return;
    setSubmitting(true);
    setFormMessage("");

    try {
      await onSave(reviewTrade);
      setReviewTrade(null);
      setTrade(baseEmptyTrade);
    } catch {
      // Keep the review open so the trader can return and edit the rejected data.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>{selectedTrade ? "Edit trade" : "Add trade"}</CardTitle>
        <CardDescription>Every setup targets 3RR. The journal flags whether the trade respected that plan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setFormMessage("");

            const tradeToSave = usesBeforeAfterScreenshots ? { ...trade, screenshotUrl: "" } : trade;
            const nextTrade = {
              ...tradeToSave,
              id: trade.id || crypto.randomUUID(),
              rMultiple,
            };
            const validationMessage = validateTradeForReview(nextTrade);

            if (validationMessage) {
              setFormMessage(validationMessage);
              return;
            }

            setReviewTrade(nextTrade);
          }}
        >
          {formMessage ? (
            <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{formMessage}</p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Pair">
              <Select value={trade.pair} onChange={(event) => update("pair", event.target.value)}>
                <option>EUR/USD</option>
                <option>GBP/USD</option>
                <option>XAUUSD</option>
              </Select>
            </Field>
            <Field label="Direction">
              <Select value={trade.direction} onChange={(event) => update("direction", event.target.value as Trade["direction"])}>
                {directions.map((direction) => (
                  <option key={direction}>{direction}</option>
                ))}
              </Select>
            </Field>
            <Field label="Strategy">
              <div className="rounded-md border bg-background/50 p-2">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => update("strategy", [...strategies] as Trade["strategy"])}>
                    Select all
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => update("strategy", ["KIL"])}>
                    Clear
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {strategies.map((strategy) => {
                    const checked = trade.strategy.includes(strategy);
                    return (
                      <Button
                        key={strategy}
                        type="button"
                        variant={checked ? "default" : "outline"}
                        className="h-9 justify-start"
                        onClick={() => toggleStrategy(strategy)}
                      >
                        {checked ? <Check className="size-4" /> : <span className="size-4" />}
                        {strategy}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Field>
            <Field label="Session">
              <Select value={trade.session} onChange={(event) => update("session", event.target.value as Trade["session"])}>
                {sessions.map((session) => (
                  <option key={session}>{session}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Website section">
            {lockArea || selectedTrade ? (
              <Input value={trade.area} disabled />
            ) : (
              <Select value={trade.area} onChange={(event) => update("area", event.target.value as Trade["area"])}>
                {tradingAreas.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </Select>
            )}
          </Field>

          {needsAccountProfile ? (
            <div className="grid gap-4 rounded-lg border bg-background/45 p-4">
              <div>
                <h3 className="text-sm font-semibold">Select your account</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Forward/Funded/Account trades must be tied to one account profile you created in Settings. Backtesting stays independent from this data.
                </p>
              </div>
              <Field label="Account profile">
                <Select value={trade.accountProfileId ?? ""} onChange={(event) => selectAccountProfile(event.target.value)}>
                  <option value="">{accountsLoading ? "Loading accounts..." : "Select your account"}</option>
                  {accountProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {accountProfileLabel(profile)}
                    </option>
                  ))}
                </Select>
              </Field>
              {accountsError ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{accountsError}</p> : null}
              {!accountsLoading && !accountProfiles.length ? (
                <p className="rounded-md border bg-background/60 p-3 text-sm text-muted-foreground">
                  Account lama hayo weli. Tag Settings oo samee account profile sida FTMO 10K A ama FTMO 10K B, kadib halkan ayuu ka soo muuqanayaa.
                </p>
              ) : null}
              {selectedAccount ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Field label="Account label">
                    <Input value={selectedAccount.name} disabled />
                  </Field>
                  <Field label="Company">
                    <Input value={selectedAccount.firmName || "-"} disabled />
                  </Field>
                  <Field label="Account size">
                    <Input value={`${selectedAccount.currency} ${selectedAccount.accountSize.toLocaleString()}`} disabled />
                  </Field>
                  <Field label="Phase / level">
                    <Input value={selectedAccount.accountPhase || "-"} disabled />
                  </Field>
                  <Field label="Account type">
                    <Input value={selectedAccount.accountType} disabled />
                  </Field>
                  <Field label="Broker">
                    <Input value={selectedAccount.brokerName || "-"} disabled />
                  </Field>
                  <Field label="Broker safety">
                    <Input value="Never store broker password or login credentials." disabled />
                  </Field>
                </div>
              ) : null}
              {selectedAccount ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-md border bg-background/60 p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Account rules</p>
                    <div className="mt-2 grid gap-2 text-sm leading-6 text-muted-foreground">
                      <p>Maximum daily loss: {selectedAccount.currency} {selectedAccount.maxDailyLoss.toLocaleString()}</p>
                      <p>Maximum loss: {selectedAccount.currency} {selectedAccount.maxLoss.toLocaleString()}</p>
                      <p>Target profit Phase 1: {selectedAccount.currency} {selectedAccount.targetProfitPhase1.toLocaleString()}</p>
                      <p>Target profit Phase 2: {selectedAccount.currency} {selectedAccount.targetProfitPhase2.toLocaleString()}</p>
                      <p>{selectedAccount.rulesNotes || "No extra rules added yet. Add company rules inside System so they appear here before every trade."}</p>
                    </div>
                  </div>
                  <div className="rounded-md border bg-background/60 p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Broker checklist</p>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted-foreground">
                      {[
                        "Check spread, commission, slippage, and session execution.",
                        "Confirm account currency, leverage, and symbol contract size.",
                        "Do not save broker passwords, investor passwords, or login credentials.",
                      ].map((note) => (
                        <li key={note} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <Field label="Strategy qodobo / confirmations">
            <Textarea
              value={strategyPointsText}
              onChange={(event) =>
                update(
                  "strategyPoints",
                  event.target.value
                    .split("\n")
                    .map((point) => point.trim())
                    .filter(Boolean),
                )
              }
              placeholder={"Liquidity sweep\nDisplacement candle\n3RR target clear"}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <NumberField label="Entry price" value={trade.entry} onChange={(value) => update("entry", value)} />
            <NumberField label="Stop Loss price" value={trade.stopLoss} onChange={(value) => update("stopLoss", value)} />
            <NumberField label="Take Profit price" value={trade.takeProfit} onChange={(value) => update("takeProfit", value)} />
            <Field label="Date">
              <Input type="date" value={trade.date} onChange={(event) => update("date", event.target.value)} />
            </Field>
            <Field label="Purging time">
              <Input type="time" value={trade.purgingTime} onChange={(event) => update("purgingTime", event.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <NumberField label="Risk amount" value={trade.riskAmount} onChange={(value) => update("riskAmount", value)} />
            <NumberField label="Reward amount" value={trade.rewardAmount} onChange={(value) => update("rewardAmount", value)} />
            <NumberField label="R:R" value={trade.rr} onChange={(value) => update("rr", value)} />
            <Field label="Calculated R-multiple">
              <Input value={`${rMultiple.toFixed(2)}R`} disabled />
            </Field>
            <Field label="Result">
              <Select value={trade.result} onChange={(event) => update("result", event.target.value as Trade["result"])}>
                {results.map((result) => (
                  <option key={result}>{result}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <NumberField label="Profit/Loss" value={trade.profitLoss} onChange={(value) => update("profitLoss", value)} />
            <Field label="3RR respected">
              <Input value={respectedTarget ? "Yes - target is 3RR or higher" : "No - below 3RR target"} disabled />
            </Field>
            <Field label="Emotion">
              <Input value={trade.emotion} onChange={(event) => update("emotion", event.target.value)} placeholder="Patient" />
            </Field>
          </div>

          {usesBeforeAfterScreenshots ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Before screenshot">
                <Input type="file" accept="image/*" onChange={(event) => updateImageFile("beforeScreenshotUrl", event.target.files?.[0])} />
              </Field>
              <Field label={isClosedResult ? "After / last image" : "After / last image (marka trade-ku xirmo)"}>
                <Input type="file" accept="image/*" onChange={(event) => updateImageFile("afterScreenshotUrl", event.target.files?.[0])} />
              </Field>
            </div>
          ) : null}

          {!usesBeforeAfterScreenshots && trade.screenshotUrl ? (
            <div className="overflow-hidden rounded-lg border bg-background/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={trade.screenshotUrl} alt="Trade screenshot preview" className="max-h-72 w-full object-cover" />
            </div>
          ) : null}

          {usesBeforeAfterScreenshots && (trade.beforeScreenshotUrl || trade.afterScreenshotUrl) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {trade.beforeScreenshotUrl ? (
                <div className="overflow-hidden rounded-lg border bg-background/40">
                  <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Before setup</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={trade.beforeScreenshotUrl} alt="Before backtest setup" className="max-h-72 w-full object-cover" />
                </div>
              ) : null}
              {trade.afterScreenshotUrl ? (
                <div className="overflow-hidden rounded-lg border bg-background/40">
                  <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">After result</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={trade.afterScreenshotUrl} alt="After backtest result" className="max-h-72 w-full object-cover" />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mistake">
              <Input value={trade.mistake} onChange={(event) => update("mistake", event.target.value)} placeholder="None" />
            </Field>
            <Field label="Notes">
              <Textarea value={trade.notes} onChange={(event) => update("notes", event.target.value)} placeholder="What happened? Did the trade respect the 3RR model?" />
            </Field>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {selectedTrade ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : selectedTrade ? <Save className="size-4" /> : <Plus className="size-4" />}
              {selectedTrade ? "Review changes" : "Review trade"}
            </Button>
          </div>
        </form>
      </CardContent>

      {reviewTrade ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[88vh] w-full max-w-3xl overflow-auto rounded-lg border bg-background/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Iska hubi trade-ka ka hor save</h3>
                <p className="mt-1 text-sm text-muted-foreground">Haddii xogtu sax tahay taabo Agree. Haddii wax qaldan yihiin ku noqo form-ka oo edit garee.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setReviewTrade(null)} aria-label="Close review">
                <X className="size-4" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ReviewItem label="Pair" value={reviewTrade.pair} />
              <ReviewItem label="Direction" value={reviewTrade.direction} />
              <ReviewItem label="Area" value={reviewTrade.area} />
              {reviewTrade.area !== "Backtesting" ? <ReviewItem label="Account" value={reviewTrade.accountProfileName ?? "-"} /> : null}
              {reviewTrade.area !== "Backtesting" ? <ReviewItem label="Company" value={reviewTrade.propFirmName ?? "-"} /> : null}
              {reviewTrade.area !== "Backtesting" ? <ReviewItem label="Account size" value={String(reviewTrade.accountSize ?? 0)} /> : null}
              {reviewTrade.area !== "Backtesting" ? <ReviewItem label="Phase" value={reviewTrade.accountPhase ?? "-"} /> : null}
              {reviewTrade.area !== "Backtesting" ? <ReviewItem label="Broker" value={reviewTrade.brokerName ?? "-"} /> : null}
              <ReviewItem label="Session" value={reviewTrade.session} />
              <ReviewItem label="Date" value={reviewTrade.date} />
              <ReviewItem label="Purging time" value={reviewTrade.purgingTime || "-"} />
              <ReviewItem label="Result" value={reviewTrade.result} />
              <ReviewItem label="P/L" value={String(reviewTrade.profitLoss)} />
              <ReviewItem label="Entry" value={String(reviewTrade.entry)} />
              <ReviewItem label="Stop Loss" value={String(reviewTrade.stopLoss)} />
              <ReviewItem label="Take Profit" value={String(reviewTrade.takeProfit)} />
              <ReviewItem label="R:R" value={reviewTrade.rr.toFixed(2)} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background/45 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Before screenshot</p>
                {reviewTrade.beforeScreenshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reviewTrade.beforeScreenshotUrl} alt="Before screenshot review" className="max-h-56 w-full rounded-md object-cover" />
                ) : (
                  <p className="text-sm text-destructive">Missing</p>
                )}
              </div>
              <div className="rounded-lg border bg-background/45 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">After / last image</p>
                {reviewTrade.afterScreenshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reviewTrade.afterScreenshotUrl} alt="After screenshot review" className="max-h-56 w-full rounded-md object-cover" />
                ) : (
                  <p className="text-sm text-muted-foreground">{reviewTrade.result === "Open" ? "Optional while position is open" : "Missing"}</p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg border bg-background/45 p-3">
              <p className="text-xs font-medium text-muted-foreground">Strategies</p>
              <p className="mt-1 text-sm font-medium">{reviewTrade.strategy.join(" + ")}</p>
              <p className="mt-3 text-xs font-medium text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{reviewTrade.notes || "No notes yet."}</p>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setReviewTrade(null)}>
                Edit data
              </Button>
              <Button type="button" onClick={confirmReviewedTrade} disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Agree & save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/45 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value || "-"}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [inputValue, setInputValue] = React.useState(String(value));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setInputValue(String(value));
  }, [focused, value]);

  function handleChange(nextValue: string) {
    setInputValue(nextValue);

    if (nextValue.trim() === "") {
      onChange(0);
      return;
    }

    if (nextValue === "-" || nextValue === "." || nextValue === "-.") return;

    const parsed = Number(nextValue);
    if (Number.isFinite(parsed)) onChange(parsed);
  }

  function handleBlur() {
    setFocused(false);

    if (inputValue.trim() === "" || inputValue === "-" || inputValue === "." || inputValue === "-.") {
      setInputValue("0");
      onChange(0);
      return;
    }

    const parsed = Number(inputValue);
    if (Number.isFinite(parsed)) {
      setInputValue(String(parsed));
      onChange(parsed);
    }
  }

  return (
    <Field label={label}>
      <Input
        type="text"
        inputMode="decimal"
        value={inputValue}
        onFocus={() => {
          setFocused(true);
          if (Number(value) === 0 && inputValue === "0") setInputValue("");
        }}
        onBlur={handleBlur}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="0"
      />
    </Field>
  );
}
