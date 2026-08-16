"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingMessage({
  message,
  tone = "danger",
  onClose,
}: {
  message: string;
  tone?: "danger" | "success" | "neutral";
  onClose: () => void;
}) {
  if (!message) return null;

  const positive = tone === "success";

  return (
    <div className="fixed right-4 top-4 z-[80] w-[min(420px,calc(100vw-2rem))]">
      <div
        className={cn(
          "glass-panel flex items-start gap-3 rounded-lg border p-4 text-sm shadow-2xl",
          positive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-destructive/30 bg-destructive/10 text-destructive",
          tone === "neutral" ? "border-border bg-background/95 text-foreground" : "",
        )}
      >
        {positive ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
        <p className="leading-6">{message}</p>
        <Button type="button" variant="ghost" size="icon" className="-mr-2 -mt-2 ml-auto size-8 shrink-0" onClick={onClose} aria-label="Close message">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
