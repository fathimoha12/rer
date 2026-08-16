"use client";

import * as React from "react";
import { BookOpenCheck, Loader2, Plus, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AdminShell } from "@/components/shell/admin-shell";

type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt?: string | null;
  totalTrades: number;
  tp: number;
  sl: number;
  winRate: number;
  pnl: number;
  avgR: number;
  backtesting: number;
  forward: number;
  lastActivity: string;
  learningLevel: string;
};

type Overview = {
  totals: { users: number; trades: number; backtesting: number; forward: number; pnl: number };
  users: AdminUser[];
};

function extractYoutubeVideoId(input: string) {
  try {
    const url = new URL(input.trim());
    if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] ?? "";
    if (url.searchParams.get("v")) return url.searchParams.get("v") ?? "";
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live");
    return index >= 0 ? parts[index + 1] ?? "" : "";
  } catch {
    return input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)?.[1] ?? "";
  }
}

function extractYoutubePlaylistId(input: string) {
  try {
    return new URL(input.trim()).searchParams.get("list") ?? "";
  } catch {
    return input.match(/[?&]list=([A-Za-z0-9_-]+)/)?.[1] ?? "";
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function shortDate(value?: string | null) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function AdminDashboard() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [overview, setOverview] = React.useState<Overview | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserPassword, setNewUserPassword] = React.useState("");

  const [playlistTitle, setPlaylistTitle] = React.useState("");
  const [playlistCategory, setPlaylistCategory] = React.useState("Course playlist");
  const [playlistUrl, setPlaylistUrl] = React.useState("");
  const [playlistOrder, setPlaylistOrder] = React.useState("4");

  const [videoPlaylistId, setVideoPlaylistId] = React.useState("");
  const [videoTitle, setVideoTitle] = React.useState("");
  const [videoModule, setVideoModule] = React.useState("");
  const [videoDuration, setVideoDuration] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [videoOrder, setVideoOrder] = React.useState("1");

  async function loadOverview() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Admin overview could not load.");
      setOverview(data as Overview);
      setLoggedIn(true);
    } catch (error) {
      setOverview(null);
      if (loggedIn) setStatus(error instanceof Error ? error.message : "Admin overview could not load.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Admin login failed.");
      setLoggedIn(true);
      setPassword("");
      await loadOverview();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setLoggedIn(false);
    setOverview(null);
  }

  async function addUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newUserEmail, password: newUserPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "User could not be created.");
      setNewUserEmail("");
      setNewUserPassword("");
      setStatus(`User created: ${data.email}`);
      await loadOverview();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "User could not be created.");
    } finally {
      setLoading(false);
    }
  }

  async function addPlaylist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const playlistId = extractYoutubePlaylistId(playlistUrl);
      const firstVideoId = extractYoutubeVideoId(playlistUrl);
      const response = await fetch("/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "playlist",
          title: playlistTitle,
          category: playlistCategory,
          youtubeUrl: playlistUrl,
          playlistId,
          firstVideoId,
          playlistOrder,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Playlist could not be saved.");
      setStatus("Playlist saved. Refresh Lessons to see it.");
      setVideoPlaylistId(playlistId);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Playlist could not be saved.");
    } finally {
      setLoading(false);
    }
  }

  async function addVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video",
          playlistId: videoPlaylistId || extractYoutubePlaylistId(videoUrl),
          videoId: extractYoutubeVideoId(videoUrl),
          title: videoTitle,
          module: videoModule,
          duration: videoDuration,
          videoOrder,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Video could not be saved.");
      setVideoTitle("");
      setVideoModule("");
      setVideoDuration("");
      setVideoUrl("");
      setStatus("Video saved. Refresh Lessons to see it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Video could not be saved.");
    } finally {
      setLoading(false);
    }
  }

  if (!loggedIn) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
        <Card className="glass-panel w-full max-w-md">
          <CardHeader>
            <Badge variant="negative" className="mb-2 w-fit">Admin only</Badge>
            <CardTitle>TET Admin Login</CardTitle>
            <CardDescription>Admin username: tet. Password-ka waxaa og admin-ka kaliya.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={login}>
              <Field label="Username">
                <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="tet" />
              </Field>
              <Field label="Password">
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </Field>
              {status ? <p className="rounded-md border bg-background/50 p-3 text-sm text-muted-foreground">{status}</p> : null}
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                Login admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <AdminShell>
      <div className="grid gap-5">
      <div id="admin-overview" className="scroll-mt-24 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge variant="negative" className="mb-2">Admin mode</Badge>
          <h2 className="text-2xl font-semibold tracking-tight">TET admin control center</h2>
          <p className="text-sm text-muted-foreground">Users, course videos, and learning activity overview.</p>
        </div>
        <Button type="button" variant="outline" onClick={logout}>Logout admin</Button>
      </div>

      {status ? <p className="rounded-md border bg-background/50 p-3 text-sm text-muted-foreground">{status}</p> : null}

      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Users" value={overview?.totals.users ?? 0} />
        <Metric label="Trades" value={overview?.totals.trades ?? 0} />
        <Metric label="Backtesting" value={overview?.totals.backtesting ?? 0} />
        <Metric label="Forward" value={overview?.totals.forward ?? 0} />
        <Metric label="Total P/L" value={formatMoney(overview?.totals.pnl ?? 0)} />
      </div>

      <Card id="admin-users" className="glass-panel scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Website users
          </CardTitle>
          <CardDescription>Admin wuxuu arkaa users-ka, trades-kooda, P/L, iyo heerka cilmiga.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Level</th>
                <th className="py-3 pr-4">Trades</th>
                <th className="py-3 pr-4">TP / SL</th>
                <th className="py-3 pr-4">Win rate</th>
                <th className="py-3 pr-4">P/L</th>
                <th className="py-3 pr-4">Backtest</th>
                <th className="py-3 pr-4">Forward</th>
                <th className="py-3 pr-4">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(overview?.users ?? []).map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pr-4 font-medium">{user.email}</td>
                  <td className="py-3 pr-4"><Badge variant="outline">{user.learningLevel}</Badge></td>
                  <td className="py-3 pr-4">{user.totalTrades}</td>
                  <td className="py-3 pr-4">{user.tp} / {user.sl}</td>
                  <td className="py-3 pr-4">{user.winRate.toFixed(1)}%</td>
                  <td className="py-3 pr-4">{formatMoney(user.pnl)}</td>
                  <td className="py-3 pr-4">{user.backtesting}</td>
                  <td className="py-3 pr-4">{user.forward}</td>
                  <td className="py-3 pr-4">{shortDate(user.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card id="admin-add-user" className="glass-panel scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="size-5 text-primary" /> Add user</CardTitle>
            <CardDescription>Admin kaliya ayaa dadka website-ka u samayn kara login.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={addUser}>
              <Field label="User email">
                <Input type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} placeholder="student@example.com" required />
              </Field>
              <Field label="Temporary password">
                <Input type="password" value={newUserPassword} onChange={(event) => setNewUserPassword(event.target.value)} minLength={6} required />
              </Field>
              <Button type="submit" disabled={loading} className="w-fit">
                {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
                Create user
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card id="admin-playlists" className="glass-panel scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpenCheck className="size-5 text-primary" /> Add YouTube playlist</CardTitle>
            <CardDescription>Playlist cusub Lessons page-ka ayuu ka muuqanayaa.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={addPlaylist}>
              <Field label="Playlist title"><Input value={playlistTitle} onChange={(event) => setPlaylistTitle(event.target.value)} required /></Field>
              <Field label="Playlist URL"><Input value={playlistUrl} onChange={(event) => setPlaylistUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=...&list=..." required /></Field>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <Field label="Category">
                  <Select value={playlistCategory} onChange={(event) => setPlaylistCategory(event.target.value)}>
                    <option>Course playlist</option>
                    <option>Beginner course</option>
                    <option>Market recap</option>
                    <option>Mentorship course</option>
                  </Select>
                </Field>
                <Field label="Order"><Input value={playlistOrder} onChange={(event) => setPlaylistOrder(event.target.value)} inputMode="numeric" /></Field>
              </div>
              <Button type="submit" disabled={loading} className="w-fit">
                {loading ? <Loader2 className="animate-spin" /> : <Plus />}
                Save playlist
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card id="admin-videos" className="glass-panel scroll-mt-24 xl:col-span-2">
          <CardHeader>
            <CardTitle>Add YouTube video</CardTitle>
            <CardDescription>Video-ga waa in lagu xiraa playlist ID-ga saxda ah.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 xl:grid-cols-3" onSubmit={addVideo}>
              <Field label="Playlist ID"><Input value={videoPlaylistId} onChange={(event) => setVideoPlaylistId(event.target.value)} placeholder="PL..." required /></Field>
              <Field label="Video URL"><Input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." required /></Field>
              <Field label="Video title"><Input value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} required /></Field>
              <Field label="Module"><Input value={videoModule} onChange={(event) => setVideoModule(event.target.value)} placeholder="Entry model" /></Field>
              <Field label="Duration"><Input value={videoDuration} onChange={(event) => setVideoDuration(event.target.value)} placeholder="12:34" /></Field>
              <Field label="Order"><Input value={videoOrder} onChange={(event) => setVideoOrder(event.target.value)} inputMode="numeric" /></Field>
              <div className="xl:col-span-3">
                <Button type="submit" disabled={loading} className="w-fit">
                  {loading ? <Loader2 className="animate-spin" /> : <Plus />}
                  Save video
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="glass-panel">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
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
