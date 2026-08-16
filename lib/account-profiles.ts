"use client";

import * as React from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { AccountProfile } from "@/lib/types";

export type AccountProfileRow = {
  id: string;
  user_id: string;
  name: string;
  firm_name: string | null;
  starting_balance: number | string;
  account_type: string | null;
  currency: string;
  account_phase: string | null;
  broker_name: string | null;
  max_daily_loss: number | string | null;
  max_loss: number | string | null;
  target_profit_phase_1: number | string | null;
  target_profit_phase_2: number | string | null;
  rules_notes: string | null;
  is_active: boolean | null;
};

function asNumber(value: number | string | null | undefined) {
  return Number(value) || 0;
}

export function rowToAccountProfile(row: AccountProfileRow): AccountProfile {
  return {
    id: row.id,
    name: row.name,
    firmName: row.firm_name ?? "",
    accountSize: asNumber(row.starting_balance),
    accountType: row.account_type === "Demo Test" || row.account_type === "Live Account" ? row.account_type : "Challenge",
    accountPhase: row.account_phase ?? "",
    brokerName: row.broker_name ?? "",
    currency: row.currency || "USD",
    maxDailyLoss: asNumber(row.max_daily_loss),
    maxLoss: asNumber(row.max_loss),
    targetProfitPhase1: asNumber(row.target_profit_phase_1),
    targetProfitPhase2: asNumber(row.target_profit_phase_2),
    rulesNotes: row.rules_notes ?? "",
  };
}

export function accountProfileToRow(profile: AccountProfile, userId: string) {
  return {
    id: profile.id,
    user_id: userId,
    name: profile.name,
    firm_name: profile.firmName || null,
    starting_balance: profile.accountSize || 0,
    account_type: profile.accountType || "Challenge",
    currency: profile.currency || "USD",
    account_phase: profile.accountPhase || null,
    broker_name: profile.brokerName || null,
    max_daily_loss: profile.maxDailyLoss || 0,
    max_loss: profile.maxLoss || 0,
    target_profit_phase_1: profile.targetProfitPhase1 || 0,
    target_profit_phase_2: profile.targetProfitPhase2 || 0,
    rules_notes: profile.rulesNotes || null,
    is_active: true,
  };
}

export function accountProfileLabel(profile: AccountProfile) {
  const size = profile.accountSize ? `${profile.currency || "USD"} ${profile.accountSize.toLocaleString()}` : "No size";
  const pieces = [profile.name, profile.firmName, size, profile.accountType, profile.accountPhase].filter(Boolean);
  return pieces.join(" - ");
}

export function useAccountProfiles() {
  const [profiles, setProfiles] = React.useState<AccountProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (userResponse.error) throw userResponse.error;
      if (!user) throw new Error("Please sign in to load your accounts.");

      const response = await supabase
        .from("trading_accounts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (response.error) throw response.error;

      setProfiles(((response.data ?? []) as AccountProfileRow[]).map(rowToAccountProfile));
    } catch (loadError) {
      setProfiles([]);
      setError(loadError instanceof Error ? loadError.message : "Account profiles are not reachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { profiles, setProfiles, loading, error, reload };
}
