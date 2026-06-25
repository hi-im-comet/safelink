// 규칙 기반 위험도 엔진 — LLM을 쓰지 않는다.
// 최종 위험도 = 날씨 35% + 개인 취약도 25% + 주거·냉방 25% + 돌봄 공백·도움요청 15%
import type { Grade, Household, RiskResult, TodayWeather } from "@/lib/types";

export const WEIGHTS = {
  weather: 0.35,
  personal: 0.25,
  housing: 0.25,
  care: 0.15,
} as const;

export const GRADE_META: Record<
  Grade,
  { label: string; short: string; min: number; tone: string }
> = {
  urgent: { label: "긴급 확인", short: "긴급", min: 80, tone: "ember" },
  call: { label: "오늘 중 전화·방문", short: "전화", min: 60, tone: "amber" },
  guide: { label: "행동요령 안내", short: "안내", min: 40, tone: "lime" },
  monitor: { label: "일반 모니터링", short: "관찰", min: 0, tone: "mint" },
};

export function gradeOf(score: number): Grade {
  if (score >= 80) return "urgent";
  if (score >= 60) return "call";
  if (score >= 40) return "guide";
  return "monitor";
}

/** 도움 요청이 들어온 가구는 돌봄 공백 점수를 끌어올린다 (요청 자체가 신호). */
export function careWithRequest(base: number, helpRequested?: boolean): number {
  return helpRequested ? Math.max(base, 95) : base;
}

export function computeRisk(
  h: Household,
  weather: TodayWeather,
): RiskResult {
  const care = careWithRequest(h.components.care, h.helpRequested);
  const mk = (weight: number, value: number) => ({ weight, value, weighted: value * weight });

  const breakdown = {
    weather: mk(WEIGHTS.weather, weather.score),
    personal: mk(WEIGHTS.personal, h.components.personal),
    housing: mk(WEIGHTS.housing, h.components.housing),
    care: mk(WEIGHTS.care, care),
  };

  const score = Math.round(
    breakdown.weather.weighted +
      breakdown.personal.weighted +
      breakdown.housing.weighted +
      breakdown.care.weighted,
  );

  return { score, grade: gradeOf(score), breakdown };
}

/** 응급 요청 여부 (응급 카테고리 태그 또는 119 대상) */
export function isEmergency(h: Household): boolean {
  return !!(h.helpTags?.includes("응급 확인") || h.helpContactTag === "응급 확인 필요");
}

/**
 * 운영 우선순위 점수.
 * 단순 최신순이 아니라 응급성 + 위험도 + 요청/취약도/공백을 조합한다.
 *   응급 +100 · 위험도(그대로) · 도움요청 +20 · 취약 +15 · 연락공백 +10
 *   · 방문필요 +8 · 지원검토 +5 · 최근요청 +3(작게)
 */
export function priorityScore(h: Household, weather: TodayWeather): number {
  const risk = computeRisk(h, weather).score;
  const grade = gradeOf(risk);
  const elderly = /[6-9]0대/.test(h.resident.ageBand);
  const vulnerable = h.resident.alone || elderly || !!h.resident.condition;
  const needsCall = h.status === "전화중" || (grade === "call" && h.status === "대기");

  // 정렬 기준: 응급 → 위험도 → 도움 요청 → 취약도 → 연락 공백 → 방문 → 전화 → 지원 → 최근 요청
  let s = risk;
  if (isEmergency(h)) s += 100;
  if (h.helpRequested) s += 20;
  if (vulnerable) s += 15;
  if (h.lastContactDays >= 7) s += 10;
  if (h.status === "방문예정") s += 8;
  if (needsCall) s += 6;
  if (h.needsSupport) s += 5;
  if (h.helpRequested) s += 3; // 최근 요청 가산은 작게 — 단독으로 앞지르지 못하게
  return s;
}

/** KPI · 필터 · 운영 브리핑이 공유하는 단일 counts 객체 (오늘 처리 큐 기준) */
export function householdCounts(households: Household[], weather: TodayWeather) {
  const graded = households.map((h) => ({ h, grade: computeRisk(h, weather).grade }));
  const c = (fn: (x: { h: Household; grade: Grade }) => boolean) => graded.filter(fn).length;
  return {
    total: 240, // 전체 관리 가구 (상수)
    queue: households.length, // 오늘 처리 큐
    highrisk: c(({ grade }) => grade === "urgent"),
    call: c(({ h, grade }) => h.status === "전화중" || (grade === "call" && h.status === "대기")),
    visit: c(({ h }) => h.status === "방문예정"),
    support: c(({ h }) => !!h.needsSupport),
    done: c(({ h }) => h.status === "완료"),
    help: c(({ h }) => !!h.helpRequested),
  };
}

/**
 * 우선순위 정렬: priorityScore 내림차순.
 * 동점이면 위험도, 그다음 요청 시각(최신)으로 보조 정렬.
 */
export function sortByPriority(
  households: Household[],
  weather: TodayWeather,
): Household[] {
  return [...households].sort((a, b) => {
    const pa = priorityScore(a, weather);
    const pb = priorityScore(b, weather);
    if (pb !== pa) return pb - pa;
    const ra = computeRisk(a, weather).score;
    const rb = computeRisk(b, weather).score;
    if (rb !== ra) return rb - ra;
    return (b.requestedAt ?? "").localeCompare(a.requestedAt ?? "");
  });
}
