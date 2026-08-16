"use client";

import { Edit3, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { respectedThreeRR } from "@/lib/trade-rules";
import type { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function TradeTable({
  trades,
  onEdit,
  onView,
  onDelete,
}: {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onView: (trade: Trade) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trade</TableHead>
          <TableHead>Pair</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Strategy</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Result</TableHead>
          <TableHead className="text-right">R:R</TableHead>
          <TableHead className="text-right">R multiple</TableHead>
          <TableHead className="text-right">P/L</TableHead>
          <TableHead>3RR</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => (
          <TableRow key={trade.id}>
            <TableCell>
              <div className="font-medium">{trade.id}</div>
              <div className="text-xs text-muted-foreground">{trade.date}</div>
              <div className="text-xs text-muted-foreground">{trade.purgingTime || "No time"}</div>
            </TableCell>
            <TableCell className="font-medium">{trade.pair}</TableCell>
            <TableCell>{trade.direction}</TableCell>
            <TableCell>
              <div className="flex max-w-56 flex-wrap gap-1">
                {trade.strategy.map((strategy) => (
                  <Badge key={strategy} variant="secondary">
                    {strategy}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>{trade.session}</TableCell>
            <TableCell>
              <Badge variant={trade.result === "TP" ? "positive" : trade.result === "SL" ? "negative" : "secondary"}>
                {trade.result}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{trade.rr.toFixed(2)}</TableCell>
            <TableCell className="text-right">{trade.rMultiple.toFixed(2)}R</TableCell>
            <TableCell className={trade.profitLoss >= 0 ? "text-right font-medium text-emerald-500" : "text-right font-medium text-red-500"}>
              {formatCurrency(trade.profitLoss)}
            </TableCell>
            <TableCell>
              <Badge variant={respectedThreeRR(trade) ? "positive" : "negative"}>{respectedThreeRR(trade) ? "Yes" : "No"}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => onView(trade)} aria-label="View trade overview" title="View trade overview">
                  <Eye className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(trade)} aria-label="Edit trade" title="Edit trade">
                  <Edit3 className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(trade.id)} aria-label="Delete trade" title="Delete trade">
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
