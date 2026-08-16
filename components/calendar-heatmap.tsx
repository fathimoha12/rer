import { cn, formatCurrency } from "@/lib/utils";

function tone(pnl: number) {
  if (pnl > 900) return "bg-emerald-500";
  if (pnl > 0) return "bg-emerald-500/55";
  if (pnl < -300) return "bg-red-500";
  if (pnl < 0) return "bg-red-500/55";
  return "bg-muted";
}

export function CalendarHeatmap({ days }: { days: Array<{ day: number; date?: string; pnl: number }> }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
        <div key={`${day}-${index}`} className="text-center text-xs font-medium text-muted-foreground">
          {day}
        </div>
      ))}
      {days.map((day) => (
        <div
          key={day.date ?? day.day}
          title={`${day.date ?? `Day ${day.day}`}: ${formatCurrency(day.pnl)} P/L`}
          className={cn(
            "flex aspect-square min-h-10 flex-col items-center justify-center rounded-md border text-xs transition hover:scale-[1.03]",
            tone(day.pnl),
            day.pnl === 0 ? "text-muted-foreground" : "text-white",
          )}
        >
          <span className="font-medium">{day.day}</span>
          <span className="hidden text-[10px] sm:inline">{day.pnl === 0 ? "No trade" : formatCurrency(day.pnl)}</span>
        </div>
      ))}
    </div>
  );
}
