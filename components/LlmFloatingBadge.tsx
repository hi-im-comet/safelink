"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store/AppState";

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-xl bg-mist/70 px-3 py-2">
      <div className="tnum text-base font-extrabold text-ink">{v}</div>
      <div className="text-xs text-forest/50">{label}</div>
    </div>
  );
}

export function LlmFloatingBadge({
  className = "fixed bottom-6 right-6 z-40 flex flex-col items-end",
}: {
  className?: string;
}) {
  const { metrics } = useAppState();
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      {open && (
        <div className="mb-3 w-72 animate-fade-up rounded-2xl bg-white p-4 shadow-lift ring-1 ring-ink/10">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-ink">저전력 AI 운영</p>
            <button onClick={() => setOpen(false)} className="text-forest/40 hover:text-forest">✕</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="전체 분석" v={`${metrics.analyzed}건`} />
            <Stat label="규칙 기반" v={`${metrics.ruleBased}건`} />
            <Stat label="LLM 호출" v={`${metrics.llmCalls}건`} />
            <Stat label="캐시 재사용" v={`${metrics.cacheReuse}건`} />
            <Stat label="LLM 미사용 처리율" v={`${metrics.noLlmRate}%`} />
            <Stat label="평균 출력 토큰" v={`${metrics.avgTokens}`} />
          </div>
          <ul className="mt-3 flex flex-col gap-1 text-xs leading-relaxed text-forest/60">
            <li>· 위험도 계산은 코드가 처리합니다.</li>
            <li>· LLM은 행동계획·전화 스크립트·체크리스트·보고서에만 씁니다.</li>
            <li>· 반복 문서는 템플릿·캐시를 먼저 사용합니다.</li>
            <li>· 개인정보는 LLM에 직접 전달하지 않습니다.</li>
          </ul>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-bold text-white shadow-lift ring-1 ring-lime/20 transition hover:bg-pine"
      >
        <span className="h-2 w-2 rounded-full bg-lime" />
        AI 절감 {metrics.noLlmRate}%
      </button>
    </div>
  );
}
