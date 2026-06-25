"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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
  className = "fixed right-6 z-40 flex flex-col items-end bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
}: {
  className?: string;
}) {
  const { metrics } = useAppState();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // 입력이 많은 화면에서는 축약 아이콘으로 — 콘텐츠/버튼을 가리지 않게
  const compact = pathname === "/user/profile" || pathname === "/user/help";

  return (
    <div className={className}>
      {open && (
        <div className="mb-3 w-72 animate-fade-up rounded-2xl bg-white p-4 shadow-lift ring-1 ring-ink/10">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-ink">오늘 AI 운영 효율</p>
            <button onClick={() => setOpen(false)} className="text-forest/40 hover:text-forest">✕</button>
          </div>
          <p className="mt-1 text-sm text-forest/65">LLM 미사용 처리율 <b className="text-pine">{metrics.noLlmRate}%</b></p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="전체 위험 분석" v={`${metrics.analyzed}건`} />
            <Stat label="문서 생성 요청" v={`${metrics.docRequests}건`} />
            <Stat label="실제 Bedrock 호출" v={`${metrics.llmCalls}건`} />
            <Stat label="캐시 재사용" v={`${metrics.cacheReuse}건`} />
          </div>
          <p className="mt-2 rounded-xl bg-mint-soft/60 px-3 py-2 text-xs text-forest/65">
            문서 생성 요청 {metrics.docRequests}건 = Bedrock 호출 {metrics.llmCalls} + 캐시 재사용 {metrics.cacheReuse}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-xs leading-relaxed text-forest/55">
            <li>· 위험도 계산은 코드가 처리합니다.</li>
            <li>· LLM은 문서가 필요한 곳에만, 반복 문서는 캐시를 먼저 씁니다.</li>
            <li>· 개인정보는 LLM에 직접 전달하지 않습니다.</li>
          </ul>
        </div>
      )}
      {compact ? (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="AI 운영 효율"
          className="flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-xs font-bold text-white shadow-lift ring-1 ring-lime/20 transition hover:bg-pine"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          AI {Math.round(metrics.noLlmRate)}%
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-bold text-white shadow-lift ring-1 ring-lime/20 transition hover:bg-pine"
        >
          <span className="h-2 w-2 rounded-full bg-lime" />
          AI 절감 {metrics.noLlmRate}%
        </button>
      )}
    </div>
  );
}
