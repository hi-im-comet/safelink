"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAppState } from "@/lib/store/AppState";
import { householdCounts } from "@/lib/risk/score";
import { HAZARDS } from "@/lib/hazards";
import { CopyButton } from "@/components/CopyButton";

const PRIORITIES: Record<string, string[]> = {
  heat: ["도움 요청 가구 즉시 확인", "고위험 독거 가구 전화 확인", "에어컨 없는 가구 무더위쉼터 안내", "냉방용품 지원 검토", "방문 필요 가구 담당자 배정"],
  flood: ["반지하·저층 가구 사전 대피 안내", "도움 요청 가구 즉시 확인", "차량 보유 가구 이동 안내", "하천 인접 가구 대피소 안내", "모래주머니·배수 점검 배정"],
  cold: ["독거 고령 가구 안부 확인", "난방 취약 가구 전화 확인", "동파 위험 가구 방문 점검", "난방비 지원 검토", "도움 요청 가구 즉시 확인"],
  dust: ["호흡기 질환 가구 외출 자제 안내", "고령·어린이 가구 실내 공기 관리 안내", "마스크 지원 검토", "실외근무자 안내", "도움 요청 가구 확인"],
  wind: ["고층·노후 가구 창문 고정 안내", "낙하물·간판 위험 점검 배정", "차량 보유 가구 안전 안내", "해안·하천 인접 가구 대피 안내", "도움 요청 가구 확인"],
};

export function DaySummary() {
  const { households, selectedHazard } = useAppState();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const list = useMemo(
    () => households.filter((h) => h.hazard === selectedHazard),
    [households, selectedHazard],
  );
  const c = householdCounts(list);
  const def = HAZARDS[selectedHazard];
  const priorities = PRIORITIES[selectedHazard];

  const text = `오늘 ${def.label} 상황(${def.today.alert})에서 우선 확인 대상 ${c.highrisk}가구를 분류했습니다. 도움 요청 ${c.help}건은 최상단에 배치되었고, 전화 확인 ${c.call}건, 방문 확인 ${c.visit}건, 지원 검토 ${c.support}건이 남아 있습니다. 오늘 처리가 필요한 가구를 먼저 확인하고, 담당자별로 방문·전화를 배정하는 것이 좋습니다.`;

  const stats: [string, string][] = [
    ["우선 확인 대상", `${c.highrisk}`],
    ["도움 요청", `${c.help}`],
    ["전화 확인", `${c.call}`],
    ["방문 확인", `${c.visit}`],
    ["지원 검토", `${c.support}`],
  ];

  const copyText = `${text}\n\n[운영 우선순위]\n${priorities.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;

  function openModal() {
    setOpen(true);
    setStatus("loading");
    setTimeout(() => setStatus("done"), 600);
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-pine"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-lime" />
        오늘 운영 브리핑
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg animate-fade-up rounded-xl3 bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-ink">오늘 {def.label} 운영 브리핑</h2>
              <button onClick={() => setOpen(false)} className="text-forest/40 hover:text-forest">✕</button>
            </div>

            {status === "loading" ? (
              <div className="mt-5 flex flex-col gap-2">
                {[92, 80, 86, 64].map((w, i) => (
                  <div key={i} className="shimmer h-3.5 rounded-full" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <>
                <p className="mt-4 rounded-2xl bg-mist/70 p-4 text-sm leading-relaxed text-ink">{text}</p>

                <div className="mt-4">
                  <p className="text-sm font-bold text-pine">운영 우선순위</p>
                  <ol className="mt-2 flex flex-col gap-1.5">
                    {priorities.map((p, i) => (
                      <li key={p} className="flex gap-2.5 text-sm text-ink">
                        <span className="tnum font-bold text-green">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {stats.map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-paper-warm px-2 py-2.5 text-center ring-1 ring-ink/5">
                      <div className="tnum text-lg font-extrabold text-ink">{value}</div>
                      <div className="text-[0.7rem] text-forest/50">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-forest/40">운영 문안은 AI 보조로 작성되었습니다.</span>
                  <CopyButton text={copyText} />
                </div>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
