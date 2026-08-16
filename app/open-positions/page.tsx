"use client";

import * as React from "react";
import { Edit3, Eye, Loader2, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { FloatingMessage } from "@/components/floating-message";
import { TradeForm } from "@/components/trade-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { rowToTrade, tradeToRow, type TradeRow, useSupabaseTrades } from "@/lib/trade-data";
import type { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function tradeAccountTitle(trade: Trade) {
  if (trade.area === "Backtesting") return "Backtesting";
  return trade.accountProfileName || trade.propFirmName || "No account";
}

function tradeAccountMeta(trade: Trade) {
  if (trade.area === "Backtesting") return "";
  const size = trade.accountSize ? formatCurrency(trade.accountSize) : "No size";
  return [trade.propFirmName, size, trade.accountPhase].filter(Boolean).join(" · ");
}

export default function OpenPositionsPage() {
  const { trades, setTrades, accountEmail, loading, error } = useSupabaseTrades();
  const [editingTrade, setEditingTrade] = React.useState<Trade | null>(null);
  const [previewTrade, setPreviewTrade] = React.useState<Trade | null>(null);
  const [message, setMessage] = React.useState("");
  const [tone, setTone] = React.useState<"danger" | "success" | "neutral">("neutral");
  const openTrades = trades.filter((trade) => trade.result === "Open");

  function showMessage(nextMessage: string, nextTone: "danger" | "success" | "neutral" = "neutral") {
    setMessage(nextMessage);
    setTone(nextTone);
  }

  async function saveTrade(trade: Trade) {
    try {
      const supabase = getSupabaseBrowserClient();
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (userResponse.error) throw userResponse.error;
      if (!user) throw new Error("Fadlan login samee ka hor intaadan trade update-gareyn.");

      const response = await supabase.from("trades").update(tradeToRow(trade, user.id)).eq("id", trade.id).select("*").single();
      if (response.error) throw response.error;

      const savedTrade = rowToTrade(response.data as TradeRow);
      setTrades((current) => current.map((item) => (item.id === savedTrade.id ? savedTrade : item)));
      setEditingTrade(null);
      showMessage("Open position-ka waa la update gareeyay.", "success");
    } catch (saveError) {
      showMessage(saveError instanceof Error ? saveError.message : "Open position could not be updated.", "danger");
      throw saveError;
    }
  }

  async function deleteTrade(trade: Trade) {
    if (!window.confirm(`Delete open position ${trade.pair}?`)) return;
    try {
      const supabase = getSupabaseBrowserClient();
      const response = await supabase.from("trades").delete().eq("id", trade.id);
      if (response.error) throw response.error;
      setTrades((current) => current.filter((item) => item.id !== trade.id));
      showMessage("Open position-ka waa la delete gareeyay.", "success");
    } catch (deleteError) {
      showMessage(deleteError instanceof Error ? deleteError.message : "Open position could not be deleted.", "danger");
    }
  }

  return (
    <AppShell title="Open Positions" subtitle="Review every currently open trade and close it with an after image when TP, SL, BE, or Partial happens.">
      <FloatingMessage message={message} tone={tone} onClose={() => setMessage("")} />
      <div className="grid gap-5">
        <Card className="glass-panel">
          <CardContent className="py-4 text-sm text-muted-foreground">
            {loading ? "Loading open positions..." : error || `Open positions are private${accountEmail ? `: ${accountEmail}` : ""}.`}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Open positions</CardTitle>
            <CardDescription>Mark the trade as TP, SL, BE, or Partial when it closes, then upload the after/last image.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid place-items-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading...</span>
              </div>
            ) : openTrades.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>R:R</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        <div className="font-medium">{trade.date}</div>
                        <div className="text-xs text-muted-foreground">{trade.purgingTime || "No time"}</div>
                      </TableCell>
                      <TableCell className="font-medium">{trade.pair}</TableCell>
                      <TableCell>{trade.area}</TableCell>
                      <TableCell>
                        <div className="font-medium">{tradeAccountTitle(trade)}</div>
                        {trade.area !== "Backtesting" ? <div className="text-xs text-muted-foreground">{tradeAccountMeta(trade)}</div> : null}
                      </TableCell>
                      <TableCell>{trade.session}</TableCell>
                      <TableCell>{trade.rr.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => setPreviewTrade(trade)} aria-label="View open position">
                            <Eye className="size-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setEditingTrade(trade)} aria-label="Edit open position">
                            <Edit3 className="size-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => deleteTrade(trade)} aria-label="Delete open position">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Open positions ma jiraan hadda.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingTrade ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg border bg-background/95 p-4 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Edit open position</h2>
                <p className="mt-1 text-sm text-muted-foreground">Choose TP, SL, BE, or Partial, add the after/last image, then review and agree.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditingTrade(null)} aria-label="Close edit position">
                <X className="size-4" />
              </Button>
            </div>
            <TradeForm selectedTrade={editingTrade} initialArea={editingTrade.area} lockArea onCancel={() => setEditingTrade(null)} onSave={saveTrade} />
          </div>
        </div>
      ) : null}

      {previewTrade ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <Card className="glass-panel max-h-[88vh] w-full max-w-3xl overflow-auto">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{previewTrade.pair} open position</CardTitle>
                <CardDescription>{previewTrade.date} - {previewTrade.area} - {previewTrade.session}</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setPreviewTrade(null)} aria-label="Close open position">
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Badge variant="secondary">Open</Badge>
              <Badge variant="outline">{tradeAccountTitle(previewTrade)}</Badge>
              <p className="text-sm text-muted-foreground sm:col-span-2">{previewTrade.notes || "No notes yet."}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
