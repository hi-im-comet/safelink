"use client";

import { useMemo, useRef, useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import { householdCounts, matchFilter, sortByPriority } from "@/lib/risk/score";
import { HAZARDS, ADMIN_DEMO_NOTE, ADMIN_OPERATING_NOTE } from "@/lib/hazards";
import { CountUp } from "@/components/CountUp";
import { HazardChips } from "@/components/HazardChips";
import { PriorityRow } from "@/components/admin/PriorityRow";
import { FilterChips, type FilterDef } from "@/components/admin/FilterChips";
import { DaySummary } from "@/components/admin/DaySummary";
import type { FilterKey } from "@/lib/types";

function subtitleFor(active: FilterKey, c: ReturnType<typeof householdCounts>): string {
  switch (active) {
    case "highrisk": return `우선 확인 대상 ${c.highrisk}가구를 보고 있습니다.`;
    case "call": return `전화 확인 필요 ${c.call}가구를 보고 있습니다.`;
    case "visit": return `방문 필요 ${c.visit}가구를 보고 있습니다.`;
    case "support": return `지원 검토 ${c.support}가구를 보고 있습니다.`;
    case "done": return "완료 처리된 가구를 보고 있습니다.";
    default: return "";
  }
}

export default function AdminDashboard() {
  const { households, selectedHazard, setHazard, hydrated } = useAppState();
  const [active, setActive] = useState<FilterKey>("all");
  const listRef = useRef<HTMLDivElement>(null);
  const def = HAZARDS[selectedHazard];

  // 선택 재난 유형 기준으로 리스트가 바뀐다.
  const hazardList = useMemo(
    () => households.filter((h) => h.hazard === selectedHazard),
    [households, selectedHazard],
  );
  const counts = useMemo(() => householdCounts(hazardList), [hazardList]);
  const list = useMemo(
    () => sortByPriority(hazardList.filter((h) => matchFilter(h, active))),
    [hazardList, active],
  );

  const filters: FilterDef[] = [
    { key: "all", label: "전체", count: counts.queue },
    { key: "highrisk", label: "고위험", count: counts.highrisk },
    { key: "call", label: "전화 필요", count: counts.call },
    { key: "visit", label: "방문 필요", count: counts.visit },
    { key: "support", label: "지원 검토", count: counts.support },
    { key: "done", label: "완료", count: counts.done },
  ];

  function selectFilter(key: FilterKey) {
    setActive(key);
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function changeHazard(h: typeof selectedHazard) {
    setHazard(h);
    setActive("all");
  }

  return (
    <div className="stagger">
      {/* 헤더 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">지역 취약가구 우선 대응</h1>
          <p className="mt-1 text-forest/65">
            오늘 활성 위험 · <b style={{ color: def.theme.fg }}>{def.label}</b> · {def.today.alert} · {def.today.headline}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {counts.help > 0 && (
            <button
              onClick={() => selectFilter("highrisk")}
              className="inline-flex items-center gap-2 rounded-full bg-ember-soft px-3.5 py-2 text-sm font-bold text-ember-ink transition hover:brightness-95"
            >
              <span className="h-2 w-2 rounded-full bg-ember animate-pulse" />
              도움요청·고위험 우선 확인
            </button>
          )}
          <DaySummary />
        </div>
      </div>

      {/* 오늘 활성 위험 칩 */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-forest/45">재난 유형 선택 — 유형에 따라 위험도와 우선순위가 바뀝니다</p>
        <HazardChips value={selectedHazard} onChange={changeHazard} />
      </div>

      {/* 시연용 데이터 안내 */}
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs text-forest/55">
        <span className="h-1.5 w-1.5 rounded-full bg-forest/30" />
        {ADMIN_DEMO_NOTE}
      </p>

      {/* 스탯 그룹 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 우선 확인 대상 */}
        <button
          onClick={() => selectFilter("highrisk")}
          className={`relative overflow-hidden rounded-xl3 bg-forest p-6 text-left text-white shadow-lift transition hover:-translate-y-0.5 lg:col-span-3 ${
            active === "highrisk" ? "ring-2 ring-lime" : ""
          }`}
        >
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-ember/30 blur-2xl" />
          <p className="text-sm font-medium text-mint">우선 확인 대상</p>
          <div className="mt-2 flex items-end gap-1.5">
            <CountUp to={counts.highrisk} className="tnum text-6xl font-extrabold leading-none" />
            <span className="mb-1 text-lg text-white/60">가구</span>
          </div>
          <p className="mt-3 text-sm text-white/70">위험도 80점 이상 · 눌러서 필터 →</p>
        </button>

        {/* 오늘 재난 상황 */}
        <div className="rounded-xl3 bg-white p-6 ring-1 ring-ink/8 shadow-soft lg:col-span-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-forest/60">오늘 {def.label} 상황</p>
            <span
              className="rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: def.theme.soft, color: def.theme.ink }}
            >
              {def.today.alert}
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-ink">{def.today.headline}</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full" style={{ width: `${def.today.severity}%`, background: def.theme.bar }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {def.today.stats.map((s) => (
              <span
                key={s.label}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.warn ? "" : "bg-mist text-forest/70"}`}
                style={s.warn ? { background: def.theme.soft, color: def.theme.ink } : undefined}
              >
                {s.label} {s.value}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-forest/45">
            <span>전체 관리 {counts.total}가구 · 오늘 처리 큐 {counts.queue}</span>
            <span>규칙 기반 실시간 산정</span>
          </div>
        </div>

        {/* 작업 스택 */}
        <div className="grid grid-cols-3 gap-4 lg:col-span-3 lg:grid-cols-1">
          <MiniWork label="전화 확인" value={counts.call} dot="bg-amber" active={active === "call"} onClick={() => selectFilter("call")} />
          <MiniWork label="방문" value={counts.visit} dot="bg-pine" active={active === "visit"} onClick={() => selectFilter("visit")} />
          <MiniWork label="지원 검토" value={counts.support} dot="bg-lime" active={active === "support"} onClick={() => selectFilter("support")} />
        </div>
      </div>

      {/* 우선순위 리스트 */}
      <div ref={listRef} className="mt-9 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">우선순위 리스트 · {def.label}</h2>
            {active !== "all" && (
              <p className="mt-1 flex items-center gap-2 text-sm text-forest/60">
                {subtitleFor(active, counts)}
                <button onClick={() => setActive("all")} className="font-semibold text-pine hover:underline">전체 보기</button>
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <FilterChips filters={filters} active={active} onChange={setActive} />
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {list.map((h, i) => (
            <PriorityRow key={h.id} h={h} rank={i + 1} />
          ))}
          {hydrated && list.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-ink/8">
              <p className="text-forest/55">해당 조건의 가구가 없습니다.</p>
              <button onClick={() => setActive("all")} className="mt-2 text-sm font-semibold text-pine hover:underline">전체 보기</button>
            </div>
          )}
        </div>
      </div>

      {/* 운영 방식 안내 (차분하게) */}
      <p className="mt-10 border-t border-ink/8 pt-5 text-xs leading-relaxed text-forest/45">
        {ADMIN_OPERATING_NOTE}
      </p>
    </div>
  );
}

function MiniWork({
  label,
  value,
  dot,
  active,
  onClick,
}: {
  label: string;
  value: number;
  dot: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 ring-1 transition hover:-translate-y-0.5 ${
        active ? "ring-2 ring-forest" : "ring-ink/8"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="text-sm font-medium text-forest/70">{label}</span>
      </div>
      <CountUp to={value} className="tnum text-2xl font-extrabold text-ink" />
    </button>
  );
}
