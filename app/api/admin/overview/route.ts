import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminSession } from "@/lib/admin-auth";

type TradeAdminRow = {
  user_id: string;
  area: string | null;
  result: string;
  profit_loss: number | string;
  r_multiple: number | string;
  trade_date: string;
  created_at: string;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Admin overview is not configured. Add SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function asNumber(value: number | string) {
  return Number(value) || 0;
}

function learningLevel(totalTrades: number, backtestingTrades: number, forwardTrades: number, winRate: number) {
  if (forwardTrades >= 20 && winRate >= 55) return "Forward test ready";
  if (backtestingTrades >= 100 && winRate >= 50) return "100 backtests complete";
  if (backtestingTrades >= 50) return "Backtesting progress";
  if (totalTrades > 0) return "Beginner practice";
  return "Not started";
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Admin login is required." }, { status: 401 });
  }

  try {
    const supabase = getAdminClient();
    const [usersResponse, tradesResponse] = await Promise.all([
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from("trades").select("user_id, area, result, profit_loss, r_multiple, trade_date, created_at").order("created_at", { ascending: false }),
    ]);

    if (usersResponse.error) throw usersResponse.error;
    if (tradesResponse.error) throw tradesResponse.error;

    const trades = (tradesResponse.data ?? []) as TradeAdminRow[];
    const users = usersResponse.data.users.map((user) => {
      const userTrades = trades.filter((trade) => trade.user_id === user.id);
      const closed = userTrades.filter((trade) => trade.result !== "Open");
      const tp = userTrades.filter((trade) => trade.result === "TP").length;
      const sl = userTrades.filter((trade) => trade.result === "SL").length;
      const backtesting = userTrades.filter((trade) => trade.area === "Backtesting").length;
      const forward = userTrades.filter((trade) => trade.area === "Forward Testing").length;
      const pnl = userTrades.reduce((sum, trade) => sum + asNumber(trade.profit_loss), 0);
      const avgR = userTrades.length ? userTrades.reduce((sum, trade) => sum + asNumber(trade.r_multiple), 0) / userTrades.length : 0;
      const winRate = closed.length ? (tp / closed.length) * 100 : 0;
      const lastTrade = userTrades[0];

      return {
        id: user.id,
        email: user.email ?? "No email",
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        totalTrades: userTrades.length,
        tp,
        sl,
        winRate,
        pnl,
        avgR,
        backtesting,
        forward,
        lastActivity: lastTrade?.created_at ?? user.last_sign_in_at ?? user.created_at,
        learningLevel: learningLevel(userTrades.length, backtesting, forward, winRate),
      };
    });

    const totals = {
      users: users.length,
      trades: trades.length,
      backtesting: trades.filter((trade) => trade.area === "Backtesting").length,
      forward: trades.filter((trade) => trade.area === "Forward Testing").length,
      pnl: trades.reduce((sum, trade) => sum + asNumber(trade.profit_loss), 0),
    };

    return NextResponse.json({ users, totals });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin overview could not be loaded." },
      { status: 500 },
    );
  }
}
