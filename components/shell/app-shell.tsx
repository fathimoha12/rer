"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  CircleDot,
  Database,
  FastForward,
  FlaskConical,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Settings,
  ShieldCheck,
  Trophy,
  WalletCards,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trade Journal", href: "/journal", icon: BookOpenCheck },
  { name: "Open Positions", href: "/open-positions", icon: CircleDot },
  { name: "System", href: "/system", icon: Database },
  { name: "Lessons", href: "/lessons", icon: GraduationCap },
  { name: "Backtesting", href: "/backtesting", icon: FlaskConical },
  { name: "Forward Test", href: "/forward-testing", icon: FastForward },
  { name: "Funded Challenge", href: "/funded-challenge", icon: Trophy },
  { name: "Account Challenge", href: "/account-challenge", icon: WalletCards },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Posters", href: "/posters", icon: ImageIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Local demo mode may not have account service environment variables.
    }

    window.localStorage.removeItem("edge-journal-session");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card/70 p-4 backdrop-blur-xl lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 rounded-md px-1 py-2">
          <BrandMark className="size-16 shrink-0" />
          <div>
            <p className="text-base font-semibold tracking-tight">TET Community</p>
            <p className="text-xs text-muted-foreground">Triple Edge Trader OS</p>
          </div>
        </Link>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/12 text-primary ring-1 ring-primary/15",
                )}
              >
                <item.icon className="size-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 grid gap-3 rounded-lg border bg-background/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            High-security journal
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            No broker credentials are stored. Secure account rules keep trader data scoped to each signed-in account.
          </p>
          <Button type="button" variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/78 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                <PanelLeft className="size-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button type="button" variant="outline" size="icon" onClick={handleLogout} aria-label="Logout" title="Logout">
                <LogOut className="size-4" />
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/journal">Add trade</Link>
              </Button>
            </div>
          </div>
          <nav className="flex overflow-x-auto border-t lg:hidden">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-24 flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium text-muted-foreground",
                    isActive && "text-primary",
                  )}
                >
                  <item.icon className="size-4" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
