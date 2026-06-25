"use client";

import { useState } from "react";

export function RiskDetails({
  chips,
  reason,
  breakdown,
}: {
  chips: string[];
  reason: string;
  breakdown: { label: string; value: number }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* 위험에 반영된 요인 칩 */}
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c, i) => {
          const warm = c.includes("경보") || c.startsWith("체감") || c.startsWith("습도");
          return (
            <span
              key={`${c}-${i}`}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${warm ? "bg-ember-soft text-ember-ink" : "bg-mist text-forest/75"}`}
            >
              {c}
            </span>
          );
        })}
      </div>

      {/* 왜 이 위험도인지 한 줄 */}
      <p className="mt-3 text-sm leading-relaxed text-forest/80">{reason}</p>

      {/* 점수 구성 (접기/펼치기) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pine"
      >
        점수 구성 {open ? "닫기" : "보기"}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition ${open ? "rotate-180" : ""}`}>
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs text-forest/60">{b.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-green" style={{ width: `${b.value}%` }} />
              </div>
              <span className="tnum w-8 text-right text-xs font-semibold text-forest">{b.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
