"use client";

import { AccountProfileManager } from "@/components/account-profile-manager";
import { AppShell } from "@/components/shell/app-shell";

export default function SystemPage() {
  return (
    <AppShell title="System" subtitle="Build and manage the account profiles used by Forward Test, Funded Challenge, and Account Challenge trades.">
      <div className="grid gap-5">
        <AccountProfileManager />
      </div>
    </AppShell>
  );
}
