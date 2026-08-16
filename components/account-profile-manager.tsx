"use client";

import * as React from "react";
import { Edit3, Trash2 } from "lucide-react";
import { accountProfileLabel, accountProfileToRow, type AccountProfileRow, rowToAccountProfile, useAccountProfiles } from "@/lib/account-profiles";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { accountTypes, type AccountProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emptyAccountProfile: AccountProfile = {
  id: "",
  name: "",
  firmName: "",
  accountSize: 0,
  accountType: "Challenge",
  accountPhase: "Phase 1",
  brokerName: "",
  currency: "USD",
  maxDailyLoss: 0,
  maxLoss: 0,
  targetProfitPhase1: 0,
  targetProfitPhase2: 0,
  rulesNotes: "",
};

export function AccountProfileManager() {
  const { profiles, setProfiles, loading, error } = useAccountProfiles();
  const [status, setStatus] = React.useState("");
  const [editingAccountId, setEditingAccountId] = React.useState("");
  const [draft, setDraft] = React.useState<AccountProfile>(emptyAccountProfile);

  async function saveAccountProfile() {
    setStatus("");
    try {
      const supabase = getSupabaseBrowserClient();
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (userResponse.error) throw userResponse.error;
      if (!user) throw new Error("Fadlan login samee si aad system account u kaydiso.");
      if (!draft.name.trim()) throw new Error("Profile name geli, tusaale FTMO 10K Phase 1.");
      if (!draft.firmName.trim()) throw new Error("Company/prop firm geli, tusaale FTMO.");

      const profile = { ...draft, id: editingAccountId || draft.id || crypto.randomUUID(), name: draft.name.trim(), firmName: draft.firmName.trim() };
      const response = await supabase.from("trading_accounts").upsert(accountProfileToRow(profile, user.id)).select("*").single();
      if (response.error) throw response.error;

      const savedProfile = rowToAccountProfile(response.data as AccountProfileRow);
      setProfiles((current) => {
        const exists = current.some((item) => item.id === savedProfile.id);
        return exists ? current.map((item) => (item.id === savedProfile.id ? savedProfile : item)) : [savedProfile, ...current];
      });
      resetDraft();
      setStatus("System account profile-ka waa la kaydiyay.");
    } catch (saveError) {
      setStatus(saveError instanceof Error ? saveError.message : "System account lama kaydin.");
    }
  }

  async function deleteAccountProfile(profile: AccountProfile) {
    if (!window.confirm(`Hide ${profile.name}? Trades hore ma tirmayaan, laakiin account-kan select-ka kama soo muuqan doono.`)) return;
    setStatus("");
    try {
      const supabase = getSupabaseBrowserClient();
      const response = await supabase.from("trading_accounts").update({ is_active: false }).eq("id", profile.id);
      if (response.error) throw response.error;
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
      if (editingAccountId === profile.id) resetDraft();
      setStatus("System account profile-ka waa la qariyay.");
    } catch (deleteError) {
      setStatus(deleteError instanceof Error ? deleteError.message : "System account lama qarin.");
    }
  }

  function resetDraft() {
    setEditingAccountId("");
    setDraft(emptyAccountProfile);
  }

  function editAccountProfile(profile: AccountProfile) {
    setEditingAccountId(profile.id);
    setDraft(profile);
    setStatus("");
  }

  const updateDraft = <K extends keyof AccountProfile>(key: K, value: AccountProfile[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>System account profiles</CardTitle>
        <CardDescription>
          Ku qor xogta account-kaaga: profile name, account size, account type, company rules, Phase 1 target, iyo Phase 2 target. Markaad mid dhameyso mid kale ayaad ku dari kartaa.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Profile name">
            <Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="FTMO 10K Phase 1" />
          </Field>
          <Field label="Company / prop firm">
            <Input value={draft.firmName} onChange={(event) => updateDraft("firmName", event.target.value)} placeholder="FTMO" />
          </Field>
          <Field label="Account size">
            <NumberInput value={draft.accountSize} onChange={(value) => updateDraft("accountSize", value)} placeholder="10000" />
          </Field>
          <Field label="Account type">
            <Select value={draft.accountType} onChange={(event) => updateDraft("accountType", event.target.value as AccountProfile["accountType"])}>
              {accountTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </Field>
          <Field label="Current phase / level">
            <Input value={draft.accountPhase} onChange={(event) => updateDraft("accountPhase", event.target.value)} placeholder="Phase 1, Phase 2, Funded" />
          </Field>
          <Field label="Broker">
            <Input value={draft.brokerName} onChange={(event) => updateDraft("brokerName", event.target.value)} placeholder="IC Markets" />
          </Field>
          <Field label="Currency">
            <Select value={draft.currency} onChange={(event) => updateDraft("currency", event.target.value)}>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>KES</option>
              <option>JPY</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Maximum daily loss">
            <NumberInput value={draft.maxDailyLoss} onChange={(value) => updateDraft("maxDailyLoss", value)} placeholder="500" />
          </Field>
          <Field label="Maximum loss">
            <NumberInput value={draft.maxLoss} onChange={(value) => updateDraft("maxLoss", value)} placeholder="1000" />
          </Field>
          <Field label="Target profit Phase 1">
            <NumberInput value={draft.targetProfitPhase1} onChange={(value) => updateDraft("targetProfitPhase1", value)} placeholder="1000" />
          </Field>
          <Field label="Target profit Phase 2">
            <NumberInput value={draft.targetProfitPhase2} onChange={(value) => updateDraft("targetProfitPhase2", value)} placeholder="500" />
          </Field>
        </div>

        <Field label="Rules / conditions">
          <Textarea
            value={draft.rulesNotes}
            onChange={(event) => updateDraft("rulesNotes", event.target.value)}
            placeholder="Tusaale: no overtrading, max daily loss, max loss, target profit, news rules, payout rules..."
          />
        </Field>

        {status || error ? <p className="rounded-md border bg-background/45 p-3 text-sm text-muted-foreground">{status || error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={saveAccountProfile}>
            {editingAccountId ? "Update profile" : "Save profile"}
          </Button>
          {editingAccountId ? (
            <Button type="button" variant="outline" onClick={resetDraft}>
              Cancel edit
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div>
            <h3 className="text-sm font-semibold">All system accounts</h3>
            <p className="mt-1 text-xs text-muted-foreground">Haddii aad leedahay laba FTMO 10K, profile name gaar ah sii si trade form-ku u kala garto.</p>
          </div>
          {loading ? <p className="rounded-md border bg-background/45 p-3 text-sm text-muted-foreground">Loading system accounts...</p> : null}
          {!loading && !profiles.length ? <p className="rounded-md border bg-background/45 p-3 text-sm text-muted-foreground">System accounts wali lama samayn.</p> : null}
          <div className="grid gap-2">
            {profiles.map((profile) => (
              <div key={profile.id} className="rounded-md border bg-background/45 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{accountProfileLabel(profile)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Daily loss {profile.currency} {profile.maxDailyLoss.toLocaleString()} · Max loss {profile.currency} {profile.maxLoss.toLocaleString()} · P1 target {profile.currency}{" "}
                      {profile.targetProfitPhase1.toLocaleString()} · P2 target {profile.currency} {profile.targetProfitPhase2.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => editAccountProfile(profile)}>
                      <Edit3 className="size-4" />
                      Edit
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => deleteAccountProfile(profile)}>
                      <Trash2 className="size-4" />
                      Hide
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NumberInput({ value, onChange, placeholder }: { value: number; onChange: (value: number) => void; placeholder: string }) {
  return <Input type="number" inputMode="decimal" value={value || ""} onChange={(event) => onChange(Number(event.target.value) || 0)} placeholder={placeholder} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
