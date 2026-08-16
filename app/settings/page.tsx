"use client";

import * as React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { AccountProfileManager } from "@/components/account-profile-manager";
import { AppearanceSettings } from "@/components/appearance-settings";
import { AdminUserManager } from "@/components/admin-user-manager";
import { LanguageSettings } from "@/components/language-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [profileStatus, setProfileStatus] = React.useState("");

  React.useEffect(() => {
    async function loadUser() {
      try {
        const supabase = getSupabaseBrowserClient();
        const response = await supabase.auth.getUser();
        const user = response.data.user;
        setEmail(user?.email ?? "");
        setDisplayName(String(user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? ""));
      } catch {
        setProfileStatus("Sign in to load your profile.");
      }
    }

    void loadUser();
  }, []);

  async function saveProfile() {
    setProfileStatus("");
    try {
      const supabase = getSupabaseBrowserClient();
      const response = await supabase.auth.updateUser({ data: { display_name: displayName } });
      if (response.error) throw response.error;
      setProfileStatus("Profile-ka waa la kaydiyay.");
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : "Profile-ka lama kaydin.");
    }
  }

  return (
    <AppShell title="Settings" subtitle="Your TET Community profile, account assumptions, currency, and risk preferences.">
      <div className="grid gap-5 xl:grid-cols-2">
        <AppearanceSettings />
        <LanguageSettings />

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>User profile</CardTitle>
            <CardDescription>This profile belongs to the account currently signed in.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Display name">
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your trading name" />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} disabled placeholder="Login email" />
            </Field>
            <Field label="Timezone">
              <Select defaultValue="Africa/Nairobi">
                <option>Africa/Nairobi</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </Select>
            </Field>
            {profileStatus ? <p className="rounded-md border bg-background/45 p-3 text-sm text-muted-foreground">{profileStatus}</p> : null}
            <Button type="button" className="w-fit" onClick={saveProfile}>
              Save profile
            </Button>
          </CardContent>
        </Card>

        <AdminUserManager currentEmail={email} />

        <div className="xl:col-span-2">
          <AccountProfileManager />
        </div>

        <Card className="glass-panel xl:col-span-2">
          <CardHeader>
            <CardTitle>Risk preferences</CardTitle>
            <CardDescription>Set defaults for forms and dashboard alerts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Field label="Default risk amount">
              <Input type="number" step="1" defaultValue="100" />
            </Field>
            <Field label="Default R:R target">
              <Input type="number" step="0.1" defaultValue="3" />
            </Field>
            <Field label="Max daily risk %">
              <Input type="number" step="0.1" defaultValue="3" />
            </Field>
            <Field label="Max weekly drawdown %">
              <Input type="number" step="0.1" defaultValue="6" />
            </Field>
          </CardContent>
        </Card>
      </div>
    </AppShell>
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

