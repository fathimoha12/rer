"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { directions, results, sessions, strategies } from "@/lib/types";

export type TradeFilters = {
  query: string;
  dateFrom: string;
  dateTo: string;
  strategy: string;
  session: string;
  result: string;
  direction: string;
};

export function FilterBar({
  filters,
  onChange,
}: {
  filters: TradeFilters;
  onChange: (filters: TradeFilters) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(6,1fr)]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Pair, notes, mistake, emotion..."
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </div>
      <Input type="date" value={filters.dateFrom} onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })} />
      <Input type="date" value={filters.dateTo} onChange={(event) => onChange({ ...filters, dateTo: event.target.value })} />
      <Select value={filters.strategy} onChange={(event) => onChange({ ...filters, strategy: event.target.value })}>
        <option value="all">All strategies</option>
        {strategies.map((strategy) => (
          <option key={strategy}>{strategy}</option>
        ))}
      </Select>
      <Select value={filters.session} onChange={(event) => onChange({ ...filters, session: event.target.value })}>
        <option value="all">All sessions</option>
        {sessions.map((session) => (
          <option key={session}>{session}</option>
        ))}
      </Select>
      <Select value={filters.result} onChange={(event) => onChange({ ...filters, result: event.target.value })}>
        <option value="all">All results</option>
        {results.map((result) => (
          <option key={result}>{result}</option>
        ))}
      </Select>
      <Select value={filters.direction} onChange={(event) => onChange({ ...filters, direction: event.target.value })}>
        <option value="all">Buy and Sell</option>
        {directions.map((direction) => (
          <option key={direction}>{direction}</option>
        ))}
      </Select>
    </div>
  );
}
