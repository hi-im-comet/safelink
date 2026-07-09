// 관리자 우선순위·통계 헬퍼. 시연용 가구 데이터(고정 점수)를 기준으로 계산한다.
import type { FilterKey, Grade, Household } from "@/lib/types";
import { gradeOf } from "@/lib/hazards";
import { TOTAL_HOUSEHOLDS } from "@/lib/mock/households";

export function gradeOfHousehold(h: Household): Grade {
  return gradeOf(h.score);
}

/**
 * 운영 우선순위 점수 — 단순 위험도가 아니라 도움요청·상태·오늘처리 여부를 조합한다.
 */
export function priorityScore(h: Household): number {
  let s = h.score;
  if (h.helpRequested) s += 30;
  if (h.status === "방문예정") s += 6;
  if (h.status === "전화중") s += 4;
  if (h.needsSupport) s += 3;
  if (h.dday <= 0) s += 5;
  return s;
}

export function sortByPriority(list: Household[]): Household[] {
  return [...list].sort((a, b) => {
    const pa = priorityScore(a);
    const pb = priorityScore(b);
    if (pb !== pa) return pb - pa;
    if (b.score !== a.score) return b.score - a.score;
    return (b.requestedAt ?? "").localeCompare(a.requestedAt ?? "");
  });
}

export function matchFilter(h: Household, key: FilterKey): boolean {
  const grade = gradeOf(h.score);
  if (key === "all") return true;
  if (key === "highrisk") return grade === "urgent";
  if (key === "call") return h.status === "전화중" || (grade === "call" && h.status === "대기");
  if (key === "visit") return h.status === "방문예정";
  if (key === "support") return !!h.needsSupport;
  if (key === "done") return h.status === "완료";
  return false;
}

/** KPI·필터가 공유하는 counts (전달된 리스트 = 선택 재난 유형 기준) */
export function householdCounts(list: Household[]) {
  const c = (fn: (h: Household) => boolean) => list.filter(fn).length;
  return {
    total: TOTAL_HOUSEHOLDS,
    queue: list.length,
    highrisk: c((h) => gradeOf(h.score) === "urgent"),
    call: c((h) => h.status === "전화중" || (gradeOf(h.score) === "call" && h.status === "대기")),
    visit: c((h) => h.status === "방문예정"),
    support: c((h) => !!h.needsSupport),
    done: c((h) => h.status === "완료"),
    help: c((h) => !!h.helpRequested),
  };
}
