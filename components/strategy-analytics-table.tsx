import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TradeStrategy } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function StrategyAnalyticsTable({
  data,
}: {
  data: Array<{ strategy: TradeStrategy; trades: number; tp: number; sl: number; winRate: number; pnl: number; averageRMultiple: number }>;
}) {
  return (
    <Card className="glass-panel min-w-0">
      <CardHeader>
        <CardTitle>Strategy analytics</CardTitle>
        <CardDescription>Total trades, TP, SL, win rate, P/L, and average R multiple for every model.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">Trades</TableHead>
              <TableHead className="text-right">TP</TableHead>
              <TableHead className="text-right">SL</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
              <TableHead className="text-right">P/L</TableHead>
              <TableHead className="text-right">Avg R</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.strategy}>
                <TableCell>
                  <Badge variant="secondary">{item.strategy}</Badge>
                </TableCell>
                <TableCell className="text-right">{item.trades}</TableCell>
                <TableCell className="text-right text-emerald-500">{item.tp}</TableCell>
                <TableCell className="text-right text-red-500">{item.sl}</TableCell>
                <TableCell className="text-right">{formatPercent(item.winRate)}</TableCell>
                <TableCell className={item.pnl >= 0 ? "text-right font-medium text-emerald-500" : "text-right font-medium text-red-500"}>
                  {formatCurrency(item.pnl)}
                </TableCell>
                <TableCell className="text-right">{item.averageRMultiple.toFixed(2)}R</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
