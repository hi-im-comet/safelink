"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Hazard } from "@/lib/types";
import { HAZARDS } from "@/lib/hazards";
import { sheltersFor, SHELTER_TYPE, SHELTER_API_NOTE } from "@/lib/mock/shelters";

// 같은 시설 명칭(임시대피소 등)이 중복되지 않도록 유형 라벨 기준으로 dedupe
function dedupeTypes(hazards: Hazard[]): Hazard[] {
  const seen = new Set<string>();
  return hazards.filter((h) => {
    const t = SHELTER_TYPE[h];
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}

export function ShelterSheet({
  hazard,
  label = "대피소·쉼터 보기",
  className = "",
}: {
  hazard: Hazard;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const def = HAZARDS[hazard];
  const list = sheltersFor(hazard);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || "rounded-2xl bg-white py-3.5 text-center text-sm font-semibold text-forest ring-1 ring-ink/8 transition hover:ring-green/30"}
      >
        {label}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md animate-fade-up rounded-xl3 bg-white p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-extrabold text-ink">가까운 {SHELTER_TYPE[hazard]}</h2>
                <p className="mt-0.5 text-xs text-forest/55">오늘 {def.label} 상황에서 이용할 수 있는 장소</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-forest/40 hover:text-forest">✕</button>
            </div>

            <ul className="mt-4 flex flex-col gap-2">
              {list.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3 rounded-2xl bg-mist/60 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{s.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dedupeTypes(s.hazards).map((h) => (
                        <span
                          key={h}
                          className="rounded-full px-2 py-0.5 text-[0.7rem] font-semibold"
                          style={{ background: HAZARDS[h].theme.soft, color: HAZARDS[h].theme.ink }}
                        >
                          {SHELTER_TYPE[h]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-pine">{s.walk}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 rounded-xl bg-paper-warm px-3 py-2.5 text-xs leading-relaxed text-forest/55 ring-1 ring-ink/5">
              {SHELTER_API_NOTE}
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
