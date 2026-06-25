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
 * 응급 여부를 최상위로 두고, 그다음 위험도 점수가 실제 순서를 좌우한다.
 * 도움 요청·취약도·연락 공백·방문/지원 상태는 같은 위험도 안에서 보조 가중치로 반영한다.
 */
export function priorityScore(h: Household, weather: TodayWeather): number {
  const risk = computeRisk(h, weather).score;
  const elderly = /[6-9]0대/.test(h.resident.ageBand);
  const vulnerability = Number(h.resident.alone) + Number(elderly) + Number(!!h.resident.condition);
  const careGap = Number(h.lastContactDays >= 7);
  const visit = Number(h.status === "방문예정");
  const support = Number(h.status === "지원검토" || !!h.needsSupport);
  const recentRequest = h.requestedAt ? 1 : 0;

  return (
    Number(isEmergency(h)) * 1_000_000 +
    risk * 1_000 +
    Number(!!h.helpRequested) * 100 +
    vulnerability * 20 +
    careGap * 10 +
    visit * 8 +
    support * 5 +
    recentRequest
  );
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
