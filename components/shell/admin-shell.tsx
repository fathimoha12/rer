"use client";

import Link from "next/link";
import { BookOpenCheck, LayoutDashboard, LogOut, MonitorCog, PlaySquare, ShieldCheck, UserPlus, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const adminNavigation = [
  { name: "Admin Dashboard", href: "#admin-overview", icon: LayoutDashboard },
  { name: "Website Users", href: "#admin-users", icon: Users },
  { name: "Add User", href: "#admin-add-user", icon: UserPlus },
  { name: "Course Playlists", href: "#admin-playlists", icon: BookOpenCheck },
  { name: "YouTube Videos", href: "#admin-videos", icon: PlaySquare },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  async function handleAdminLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card/70 p-4 backdrop-blur-xl lg:block">
        <Link href="/admin" className="mb-8 flex items-center gap-3 rounded-md px-1 py-2">
          <BrandMark className="size-16 shrink-0" />
          <div>
            <p className="text-base font-semibold tracking-tight">TET Admin</p>
            <p className="text-xs text-muted-foreground">Private control center</p>
          </div>
        </Link>

        <nav className="space-y-1">
          {adminNavigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.name}
            </a>
          ))}
        </nav>

        <div className="absolute inset-x-4 bottom-4 grid gap-3 rounded-lg border bg-background/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            Admin only area
          </div>
          <p className="text-xs leading-5 text-muted-foreground">This page is hidden from the trader sidebar. Admin enters directly with /admin.</p>
          <Button type="button" variant="outline" size="sm" className="justify-start gap-2" onClick={handleAdminLogout}>
            <LogOut className="size-4" />
            Logout admin
          </Button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/78 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <MonitorCog className="size-4" />
                Admin control
              </div>
              <h1 className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-xl">TET Community Admin</h1>
              <p className="hidden text-sm text-muted-foreground sm:block">Users, learning progress, playlists, and course videos.</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="outline">
                <Link href="/dashboard">Open app</Link>
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={handleAdminLogout} aria-label="Logout admin">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
          <nav className="flex overflow-x-auto border-t lg:hidden">
            {adminNavigation.map((item) => (
              <a key={item.href} href={item.href} className="flex min-w-28 flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium text-muted-foreground">
                <item.icon className="size-4" />
                <span className="truncate">{item.name}</span>
              </a>
            ))}
          </nav>
        </header>

        <div className="px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
