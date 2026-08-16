"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["var(--primary)", "oklch(0.7 0.12 230)", "oklch(0.75 0.13 80)", "oklch(0.66 0.2 28)", "oklch(0.62 0.11 310)"];

export function BreakdownChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--popover-foreground)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col justify-center gap-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: colors[index % colors.length] }} />
              <span>{item.name}</span>
            </div>
            <span className="font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
