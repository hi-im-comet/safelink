"use client";

import type { FilterKey } from "@/lib/types";

export interface FilterDef {
  key: FilterKey;
  label: string;
  count: number;
}

export function FilterChips({
  filters,
  active,
  onChange,
}: {
  filters: FilterDef[];
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const on = f.key === active;
        const urgent = f.key === "highrisk";
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              on
                ? urgent
                  ? "bg-ember text-white"
                  : "bg-forest text-white"
                : "bg-white text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"
            }`}
          >
            {f.label}
            <span
              className={`tnum rounded-full px-1.5 text-xs ${
                on ? "bg-white/20" : urgent && f.count > 0 ? "bg-ember-soft text-ember-ink" : "bg-mist text-forest/55"
              }`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
