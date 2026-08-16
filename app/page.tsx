import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, Check, Clock, LockKeyhole, MessageCircle, Play, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { MonthlyPerformanceChart } from "@/components/charts/monthly-performance-chart";
import { CalendarHeatmap } from "@/components/calendar-heatmap";
import { calendarDays, equityCurve, monthlyPerformance } from "@/lib/mock-data";

const features = [
  {
    icon: BookOpenCheck,
    title: "Structured trade journal",
    description: "Capture entries, stops, targets, risk, R-multiple, emotions, mistakes, notes, and screenshots in one clean workflow.",
  },
  {
    icon: BarChart3,
    title: "Decision-grade analytics",
    description: "See what is working across pairs, strategies, sessions, direction, emotions, and mistake categories.",
  },
  {
    icon: ShieldCheck,
    title: "Private account workspace",
    description: "Each trader gets a protected workspace, so journal data stays separated and visible only to the signed-in account.",
  },
  {
    icon: LockKeyhole,
    title: "Manual-only security",
    description: "No broker passwords, no account credentials, and no broker connections. TET Community is built only for journaling and analysis.",
  },
];

const plans = ["Unlimited manual trades", "Printable reports", "Dashboard and analytics", "Private cloud sync"];
const whatsappLink = "https://wa.me/252633454984?text=Hello%2C%20I%20want%20TET%20Community%20pricing%20and%20setup.";

const comingSoonAds = [
  {
    icon: Play,
    title: "Chart Replay Backtesting",
    description: "Replay market candles step by step and test your setup before live execution.",
    metric: "Replay mode",
  },
  {
    icon: Scissors,
    title: "Slice The Market Move",
    description: "Cut a full chart into clean segments: entry, confirmation, reaction, TP, and SL zones.",
    metric: "Chart slicing",
  },
  {
    icon: BarChart3,
    title: "Setup Review Timeline",
    description: "Break down each backtest into planned risk, 3RR target, session, and outcome.",
    metric: "3RR review",
  },
  {
    icon: Sparkles,
    title: "Smart Practice Lab",
    description: "Build a library of screenshots and replay examples for KIL, LQ, SMT, OF, and Model #1.",
    metric: "Setup library",
  },
  {
    icon: Clock,
    title: "Session Replay",
    description: "Test Asia, London, and New York behavior without mixing practice data with live trades.",
    metric: "Session focus",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-30 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark className="h-[52px] w-[52px] shrink-0 sm:h-14 sm:w-14" />
            <span className="font-semibold tracking-tight">TET Community</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#preview" className="hover:text-foreground">Dashboard</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Launch app
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 -z-10 opacity-22"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--background) 0%, transparent 42%, var(--background) 100%), url('/brand/tet-community-logo.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="market-grid absolute inset-0 -z-10 opacity-35" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="pt-8">
            <Badge variant="secondary" className="mb-5">For disciplined traders</Badge>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Build discipline. Protect capital. Prove your edge.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              TET Community helps traders move from emotion to evidence. Every trade becomes a clear record of strategy,
              session, risk, execution quality, mistakes, and results.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Trade less randomly, review more intelligently, and build the consistency required to perform with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  Talk pricing on WhatsApp
                  <MessageCircle className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-lg border p-3 shadow-2xl">
            <div className="rounded-md border bg-background/80 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Brand preview</p>
                  <h2 className="text-xl font-semibold">TET Community trader cockpit</h2>
                </div>
                <Badge variant="positive">+12.8% MTD</Badge>
              </div>
              <div className="mb-4 overflow-hidden rounded-md border bg-black p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/tet-community-logo.png" alt="TET Community brand" className="h-36 w-full object-contain sm:h-40" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Net P/L", "$9,648"],
                  ["Win rate", "62.4%"],
                  ["Profit factor", "2.18"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border bg-card/70 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <EquityCurveChart data={equityCurve} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-card/35 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">Ads coming soon</Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A TradeView-style backtesting lab is coming.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Soon you will be able to replay candles, slice chart moves into clean review sections, and build a stronger backtesting routine inside TET Community.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/login">
                Join early
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="coming-soon-marquee overflow-hidden">
            <div className="coming-soon-track flex w-max gap-4">
              {[...comingSoonAds, ...comingSoonAds].map((item, index) => (
                <div key={`${item.title}-${index}`} className="w-[310px] shrink-0 rounded-lg border bg-background/80 p-4 shadow-xl backdrop-blur sm:w-[360px]">
                  <div className="mb-4 overflow-hidden rounded-md border bg-black p-3">
                    <div className="relative h-40">
                      <div className="absolute inset-x-2 top-6 h-px bg-white/15" />
                      <div className="absolute inset-x-2 top-20 h-px bg-white/15" />
                      <div className="absolute inset-x-2 bottom-6 h-px bg-white/15" />
                      <div className="absolute left-6 top-12 h-20 w-2 rounded-full bg-primary" />
                      <div className="absolute left-14 top-8 h-28 w-2 rounded-full bg-white" />
                      <div className="absolute left-24 top-16 h-16 w-2 rounded-full bg-primary" />
                      <div className="absolute left-36 top-6 h-28 w-2 rounded-full bg-primary" />
                      <div className="absolute left-48 top-12 h-20 w-2 rounded-full bg-white" />
                      <div className="absolute left-60 top-4 h-32 w-2 rounded-full bg-primary" />
                      <div className="absolute bottom-8 left-5 right-5 h-20 rounded-md border border-primary/50 bg-primary/15" />
                      <div className="absolute right-4 top-4 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                        {item.metric}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4">TET clarity</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A system for accountable traders.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              If you do not record what you do, you cannot improve it. TET Community turns trading behavior into measurable decisions.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="glass-panel">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Monthly performance</CardTitle>
              <CardDescription>Track profit, loss, and drawdown by month with a clean performance view.</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyPerformanceChart data={monthlyPerformance} />
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Calendar heatmap</CardTitle>
              <CardDescription>Spot your best days, risky days, and consistency patterns at a glance.</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarHeatmap days={calendarDays} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
        <Card className="glass-panel mx-auto max-w-3xl">
          <CardHeader className="text-center">
            <Badge variant="secondary" className="mx-auto mb-3">Pricing placeholder</Badge>
            <CardTitle className="text-3xl">Want TET Community for your trading workflow?</CardTitle>
            <CardDescription>Contact us on WhatsApp for pricing, setup help, and guidance on using the journal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan} className="flex items-center gap-3 rounded-md border bg-background/45 p-3">
                  <Check className="size-4 text-primary" />
                  <span className="text-sm">{plan}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button asChild size="lg">
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  Contact on WhatsApp
                  <MessageCircle className="size-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
