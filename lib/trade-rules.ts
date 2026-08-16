import type { Trade } from "@/lib/types";

export function calculateRMultiple(trade: Pick<Trade, "riskAmount" | "profitLoss">) {
  return trade.riskAmount > 0 ? Number((trade.profitLoss / trade.riskAmount).toFixed(2)) : 0;
}

export function respectedThreeRR(trade: Pick<Trade, "rr">) {
  return trade.rr >= 3;
}
