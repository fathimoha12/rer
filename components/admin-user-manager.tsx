"use client";

import * as React from "react";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const ownerEmail = "fathimhmmd418@gmail.com";

export function AdminUserManager({ currentEmail }: { currentEmail: string }) {
  const isOwner = currentEmail.trim().toLowerCase() === ownerEmail;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!isOwner) return null;

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatus("");

    try {
      const supabase = getSupabaseBrowserClient();
      const sessionResponse = await supabase.auth.getSession();
      const token = sessionResponse.data.session?.access_token;
      if (!token) throw new Error("Owner session expired. Sign in again and retry.");

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "User could not be created.");

      setEmail("");
      setPassword("");
      setStatus(`User created: ${result.email}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "User could not be created.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-panel xl:col-span-2">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <ShieldCheck className="size-4" />
          Owner access only
        </div>
        <CardTitle>User access</CardTitle>
        <CardDescription>Create login accounts for traders manually. Public registration is also available from the login page.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={createUser}>
          <div className="grid gap-2">
            <Label>New user email</Label>
            <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="newtrader@example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Temporary password</Label>
            <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Add user
            </Button>
          </div>
        </form>
        {status ? <p className="mt-4 rounded-md border bg-background/45 p-3 text-sm text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
