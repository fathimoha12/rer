import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <Card className="glass-panel min-w-0">
      <CardContent className="grid min-h-32 gap-4 p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <p className="min-w-0 text-sm leading-5 text-muted-foreground">{label}</p>
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md border bg-background/55",
              tone === "positive" && "text-emerald-500",
              tone === "negative" && "text-red-500",
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <div className="grid min-w-0 gap-2 self-end">
          <p className="max-w-full break-words text-2xl font-semibold leading-tight tracking-tight sm:text-[1.65rem]">{value}</p>
          <span
            className={cn(
              "text-xs font-medium leading-4",
              tone === "positive" && "text-emerald-500",
              tone === "negative" && "text-red-500",
              tone === "neutral" && "text-muted-foreground",
            )}
          >
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
