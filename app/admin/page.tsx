"use client";

import { useMemo, useRef, useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import { computeRisk, sortByPriority } from "@/lib/risk/score";
import { ADMIN_FILTER_KEYS, matchesAdminFilter } from "@/lib/risk/adminFilters";
import { CountUp } from "@/components/CountUp";
import { PriorityRow } from "@/components/admin/PriorityRow";
import { FilterChips, type FilterDef } from "@/components/admin/FilterChips";
import { DaySummary } from "@/components/admin/DaySummary";
import type { FilterKey } from "@/lib/types";

function subtitle(key: FilterKey, count: number): string {
  if (key === "all") return "";
  const label: Record<Exclude<FilterKey, "all">, string> = {
    highrisk: "고위험 가구",
    call: "전화 확인 필요",
    visit: "방문 필요",
    support: "지원 검토",
    done: "완료 처리",
  };
  return `${label[key]} ${count}가구를 보고 있습니다.`;
}

export default function AdminDashboard() {
  const { households, weather, hydrated } = useAppState();
  const [active, setActive] = useState<FilterKey>("all");
  const [weatherOpen, setWeatherOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const graded = useMemo(
    () => households.map((h) => ({ h, grade: computeRisk(h, weather).grade })),
    [households, weather],
  );

  const counts = useMemo(() => {
    return Object.fromEntries(
      ADMIN_FILTER_KEYS.map((k) => [k, graded.filter(({ h, grade }) => matchesAdminFilter(h, k, grade)).length]),
    ) as Record<FilterKey, number>;
  }, [graded]);

  const list = useMemo(() => {
    const filtered = graded.filter(({ h, grade }) => matchesAdminFilter(h, active, grade)).map(({ h }) => h);
    return sortByPriority(filtered, weather);
  }, [graded, active, weather]);

  const filters: FilterDef[] = [
    { key: "all", label: "전체", count: counts.all },
    { key: "highrisk", label: "고위험", count: counts.highrisk },
    { key: "call", label: "전화 필요", count: counts.call },
    { key: "visit", label: "방문 필요", count: counts.visit },
    { key: "support", label: "지원 검토", count: counts.support },
    { key: "done", label: "완료", count: counts.done },
  ];

  const helpCount = households.filter((h) => h.helpRequested).length;

  function selectFilter(key: FilterKey) {
    setActive(key);
    setWeatherOpen(false);
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="stagger">
      {/* 헤더 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">오늘의 폭염 대응</h1>
          <p className="mt-1 text-forest/65">{weather.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {helpCount > 0 && (
            <button
              onClick={() => selectFilter("highrisk")}
              className="inline-flex items-center gap-2 rounded-full bg-ember-soft px-3.5 py-2 text-sm font-bold text-ember-ink transition hover:brightness-95"
            >
              <span className="h-2 w-2 rounded-full bg-ember animate-pulse" />
              응급·고위험 우선 확인
            </button>
          )}
          <DaySummary />
        </div>
      </div>

      {/* 스탯 그룹 — 비대칭, 클릭 가능 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 고위험 가구 → 고위험 필터 */}
        <button
          onClick={() => selectFilter("highrisk")}
          className={`relative overflow-hidden rounded-xl3 bg-forest p-6 text-left text-white shadow-lift transition hover:-translate-y-0.5 lg:col-span-3 ${
            active === "highrisk" ? "ring-2 ring-lime" : ""
          }`}
        >
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-ember/30 blur-2xl" />
          <p className="text-sm font-medium text-mint">고위험 가구</p>
          <div className="mt-2 flex items-end gap-1.5">
            <CountUp to={counts.highrisk} className="tnum text-6xl font-extrabold leading-none" />
            <span className="mb-1 text-lg text-white/60">가구</span>
          </div>
          <p className="mt-3 text-sm text-white/70">위험도 80점 이상 · 눌러서 필터 →</p>
        </button>

        {/* 오늘 폭염 위험 → 날씨 상세 패널 */}
        <button
          onClick={() => setWeatherOpen((o) => !o)}
          className={`rounded-xl3 bg-white p-6 text-left ring-1 ring-ink/8 shadow-soft transition hover:-translate-y-0.5 lg:col-span-6 ${
            weatherOpen ? "ring-2 ring-forest" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-forest/60">오늘 폭염 위험</p>
            <span className="rounded-full bg-ember-soft px-3 py-1 text-sm font-bold text-ember-ink">
              {weatherOpen ? "상세 닫기" : "날씨 상세 보기"}
            </span>
          </div>
          <div className="mt-4 flex items-end gap-5">
            <div className="flex items-baseline gap-1">
              <span className="tnum text-5xl font-extrabold text-ink">{weather.highTemp}</span>
              <span className="text-2xl text-forest/50">°</span>
            </div>
            <p className="mb-1 text-sm text-forest/60">
              체감 {weather.feelsLike}° · {weather.alert}
              {weather.nightHeat ? " · 열대야" : ""}
            </p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full" style={{ width: `${weather.score}%`, background: "linear-gradient(90deg,#9BD64A,#C9881F,#BD4A2C)" }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-forest/45">
            <span>전체 관리 {counts.all}가구</span>
            <span>규칙 엔진 실시간 산정</span>
          </div>
        </button>

        {/* 작업 스택 → 전화/방문/지원 필터 */}
        <div className="grid grid-cols-3 gap-4 lg:col-span-3 lg:grid-cols-1">
          <MiniWork label="전화 확인" value={counts.call} dot="bg-amber" active={active === "call"} onClick={() => selectFilter("call")} />
          <MiniWork label="방문" value={counts.visit} dot="bg-pine" active={active === "visit"} onClick={() => selectFilter("visit")} />
          <MiniWork label="지원 검토" value={counts.support} dot="bg-lime" active={active === "support"} onClick={() => selectFilter("support")} />
        </div>
      </div>

      {/* 날씨 상세 패널 */}
      {weatherOpen && (
        <div className="mt-4 animate-fade-up rounded-xl3 bg-white p-6 ring-1 ring-ink/8 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">오늘 날씨 · 폭염 상세</h3>
            <button onClick={() => setWeatherOpen(false)} className="text-forest/40 hover:text-forest">✕</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <WeatherStat label="최고기온" value={`${weather.highTemp}℃`} />
            <WeatherStat label="체감온도" value={`${weather.feelsLike}℃`} warm />
            <WeatherStat label="습도" value={`${weather.humidity}%`} />
            <WeatherStat label="특보" value={weather.alert} warm />
            <WeatherStat label="야간" value={weather.nightHeat ? "열대야 지속" : "해소"} />
          </div>
          <p className="mt-4 rounded-xl bg-mist/70 px-4 py-2.5 text-sm text-forest/70">
            이 날씨 값은 <b className="text-pine">위험도 계산(날씨 35%)</b>에 그대로 반영됩니다.
          </p>
        </div>
      )}

      {/* 우선순위 리스트 */}
      <div ref={listRef} className="mt-9 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">우선순위 리스트</h2>
            {active !== "all" && (
              <p className="mt-1 flex items-center gap-2 text-sm text-forest/60">
                {subtitle(active, counts[active])}
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
            <PriorityRow key={h.id} h={h} weather={weather} rank={i + 1} />
          ))}
          {hydrated && list.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-ink/8">
              <p className="text-forest/55">해당 조건의 가구가 없습니다.</p>
              <button onClick={() => setActive("all")} className="mt-2 text-sm font-semibold text-pine hover:underline">전체 보기</button>
            </div>
          )}
        </div>
      </div>
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

function WeatherStat({ label, value, warm }: { label: string; value: string; warm?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center ${warm ? "bg-ember-soft" : "bg-mist/70"}`}>
      <div className={`text-lg font-extrabold ${warm ? "text-ember-ink" : "text-ink"}`}>{value}</div>
      <div className="mt-0.5 text-xs text-forest/50">{label}</div>
    </div>
  );
}
