"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CandlestickChart, Loader2, LockKeyhole, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const authTimeoutMs = 15000;

function withTimeout<T>(promise: Promise<T>, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), authTimeoutMs);
    }),
  ]);
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Authentication setup error. Check the app keys and deploy again.";
}

export default function LoginPage() {
  const [mode, setMode] = React.useState<"signin" | "register">("signin");
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed")) {
      setStatus("Email confirmed. You can sign in now.");
    } else if (params.get("auth_error")) {
      setStatus("Email confirmation failed. Open the newest TET Community confirmation email and try again.");
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatus("");

    try {
      const supabase = getSupabaseBrowserClient();
      const response = await withTimeout(
        supabase.auth.signInWithPassword({ email: email.trim(), password }),
        "Sign in timed out. Check the app keys in Vercel, then deploy again.",
      );

      if (response.error) {
        setStatus(response.error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setStatus(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatus("");

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const supabase = getSupabaseBrowserClient();
      const response = await withTimeout(
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
            data: {
              display_name: displayName.trim(),
              community: "TET Community",
            },
          },
        }),
        "Registration timed out. Check the app keys in Vercel, then deploy again.",
      );

      if (response.error) {
        setStatus(response.error.message);
      } else {
        setStatus("Account created. Check your email and confirm your TET Community account before signing in.");
        setMode("signin");
        setConfirmPassword("");
      }
    } catch (error) {
      setStatus(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to landing
        </Link>

        <Card className="glass-panel">
          <CardHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CandlestickChart className="size-5" />
            </div>
            <CardTitle>TET Community account</CardTitle>
            <CardDescription>Sign in or create a public account. New users must confirm their email first.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 rounded-md border bg-background/45 p-1">
              <Button type="button" variant={mode === "signin" ? "default" : "ghost"} onClick={() => setMode("signin")}>
                Sign in
              </Button>
              <Button type="button" variant={mode === "register" ? "default" : "ghost"} onClick={() => setMode("register")}>
                Register
              </Button>
            </div>

            <form className="grid gap-4" onSubmit={mode === "signin" ? submit : register}>
              {mode === "register" ? (
                <div className="grid gap-2">
                  <Label>Display name</Label>
                  <Input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name" />
                </div>
              ) : null}
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="trader@example.com" />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
              {mode === "register" ? (
                <div className="grid gap-2">
                  <Label>Confirm password</Label>
                  <Input type="password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                </div>
              ) : null}

              {status ? <p className="rounded-md border bg-background/50 p-3 text-sm text-muted-foreground">{status}</p> : null}

              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? <LockKeyhole className="size-4" /> : <UserPlus className="size-4" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
