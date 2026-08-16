import { Download, ImageIcon } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const posters = [
  "01-build-discipline.png",
  "02-prove-your-edge.png",
  "03-three-rr-objective.png",
  "04-session-performance.png",
  "05-strategy-dashboard.png",
  "06-backtesting-lab.png",
  "07-demo-challenge.png",
  "08-funded-challenge.png",
  "09-emotion-control.png",
  "10-mistake-breakdown.png",
  "11-calendar-heatmap.png",
  "12-xauusd-journal.png",
  "13-long-vs-short.png",
  "14-reports-print.png",
  "15-manual-journal-security.png",
  "16-risk-management.png",
  "17-open-trades.png",
  "18-trader-profile.png",
  "19-weekly-review.png",
  "20-whatsapp-pricing.png",
];

function titleFromFile(file: string) {
  return file
    .replace(/^\d+-/, "")
    .replace(".png", "")
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PostersPage() {
  return (
    <AppShell title="Social Posters" subtitle="Download-ready TET Community social media ads with sample trading metrics.">
      <div className="grid gap-5">
        <Card className="glass-panel">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <ImageIcon className="size-4" />
              20 ready-to-post creatives
            </div>
            <CardTitle>TET Community marketing poster pack</CardTitle>
            <CardDescription>
              Use these 1080x1350 PNG posters for Instagram, Facebook, WhatsApp status, Telegram, and other social channels.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {posters.map((poster) => {
            const src = `/social-posters/${poster}`;
            return (
              <Card key={poster} className="overflow-hidden">
                <div className="bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={titleFromFile(poster)} className="aspect-[4/5] w-full object-cover" />
                </div>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{titleFromFile(poster)}</p>
                    <p className="text-xs text-muted-foreground">1080 x 1350 PNG</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a href={src} download={poster}>
                      <Download className="size-4" />
                      Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
