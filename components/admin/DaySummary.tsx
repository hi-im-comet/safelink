"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useAppState } from "@/lib/store/AppState";
import { getAdminCounts } from "@/lib/risk/adminFilters";
import { CopyButton } from "@/components/CopyButton";

const PRIORITIES = [
  "도움 요청 가구 즉시 확인",
  "고위험 독거 가구 전화 확인",
  "방문 필요 가구 담당자 배정",
  "냉방비·냉방용품 지원 검토",
  "무더위쉼터 안내 대상 확인",
];

export function DaySummary() {
  const { households, weather } = useAppState();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const counts = getAdminCounts(households, weather);
  const helpCount = households.filter((h) => h.helpRequested).length;
  const text = `오늘 폭염경보로 고위험 가구 ${counts.highrisk}가구가 우선 확인 대상으로 분류되었습니다. 도움 요청 ${helpCount}건은 요청 유형과 위험도를 함께 반영해 배치되었고, 전화 확인 ${counts.call}건, 방문 확인 ${counts.visit}건, 지원 검토 ${counts.support}건이 남아 있습니다. 오전 중 응급 확인 필요 가구를 먼저 확인하고, 오후 피크 시간 전 방문 필요 가구를 담당자에게 배정하는 것이 좋습니다.`;

  const stats: [string, string][] = [
    ["고위험 가구", `${counts.highrisk}`],
    ["도움 요청", `${helpCount}`],
    ["전화 확인", `${counts.call}`],
    ["방문 확인", `${counts.visit}`],
    ["지원 검토", `${counts.support}`],
  ];

  const copyText = `${text}\n\n[운영 우선순위]\n${PRIORITIES.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;

  function openModal() {
    setOpen(true);
    setStatus("loading");
    setTimeout(() => setStatus("done"), 700);
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
              <h2 className="font-display text-xl font-extrabold text-ink">오늘 폭염 운영 브리핑</h2>
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
                    {PRIORITIES.map((p, i) => (
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
