import type { FilterKey, Grade, Household, TodayWeather } from "@/lib/types";
import { computeRisk } from "@/lib/risk/score";

export const ADMIN_FILTER_KEYS: FilterKey[] = ["all", "highrisk", "call", "visit", "support", "done"];

export function matchesAdminFilter(h: Household, key: FilterKey, grade: Grade): boolean {
  if (key === "all") return true;
  if (key === "highrisk") return grade === "urgent";
  if (key === "call") return h.status !== "완료" && (h.status === "전화중" || (grade === "call" && h.status === "대기"));
  if (key === "visit") return h.status === "방문예정";
  if (key === "support") return h.status !== "완료" && (h.status === "지원검토" || !!h.needsSupport);
  if (key === "done") return h.status === "완료";
  return false;
}

export function getAdminCounts(households: Household[], weather: TodayWeather): Record<FilterKey, number> {
  const graded = households.map((h) => ({ h, grade: computeRisk(h, weather).grade }));
  return Object.fromEntries(
    ADMIN_FILTER_KEYS.map((key) => [
      key,
      graded.filter(({ h, grade }) => matchesAdminFilter(h, key, grade)).length,
    ]),
  ) as Record<FilterKey, number>;
}
