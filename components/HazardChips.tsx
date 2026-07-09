"use client";

import { HAZARDS, HAZARD_ORDER } from "@/lib/hazards";
import type { Hazard } from "@/lib/types";

/**
 * 재난 유형 선택 칩. 재난 유형별 배지 색감만 살짝 다르다.
 * 관리자·사용자·랜딩이 공유한다.
 */
export function HazardChips({
  value,
  onChange,
  size = "md",
  className = "",
}: {
  value: Hazard;
  onChange: (h: Hazard) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {HAZARD_ORDER.map((h) => {
        const def = HAZARDS[h];
        const on = h === value;
        return (
          <button
            key={h}
            onClick={() => onChange(h)}
            aria-pressed={on}
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition ${pad} ${
              on ? "shadow-soft" : "bg-white text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"
            }`}
            style={
              on
                ? { background: def.theme.soft, color: def.theme.ink, boxShadow: `inset 0 0 0 1.5px ${def.theme.fg}` }
                : undefined
            }
          >
            <span aria-hidden>{def.emoji}</span>
            {def.short}
          </button>
        );
      })}
    </div>
  );
}
