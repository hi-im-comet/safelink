import type { TodayWeather } from "@/lib/types";

// 오늘의 날씨 — 지역 공통값(규칙 엔진의 날씨 위험도 35%에 들어감).
// 폭염경보 발효일이라 baseline이 높다.
export const TODAY_WEATHER: TodayWeather = {
  highTemp: 37,
  feelsLike: 40,
  humidity: 72,
  alert: "폭염경보",
  nightHeat: true,
  score: 90,
  summary: "낮 최고 37도, 체감 40도. 야간에도 28도 이상 열대야가 이어집니다.",
};

// 매일 오전 6시 자동 갱신 컨셉을 화면에 드러내기 위한 라벨
export const LOCATION = "인천 미추홀구";
export const TODAY_LABEL = "2026년 6월 24일 수요일";
export const UPDATED_LABEL = "오전 6:00 자동 갱신";
// 한 줄 날씨 표기
export const WEATHER_LINE = "최고 37℃ · 체감 40℃ · 폭염경보 · 열대야 지속";

// 기후위험 종류 — 복합 위험 구조. MVP 실제 계산은 폭염(heat)만.
export type HazardType = "heat" | "cold" | "flood" | "air";
// 주 위험(가장 큰 위험) + 오늘 동시에 주의할 위험들
export const PRIMARY_HAZARD: HazardType = "heat";
export const ACTIVE_HAZARDS: HazardType[] = ["heat", "air"]; // 예: 주 위험 폭염 + 동시 주의 미세먼지
export const HAZARD_LABELS: Record<HazardType, string> = {
  heat: "폭염",
  cold: "한파",
  flood: "홍수·침수",
  air: "미세먼지·산불연기",
};
// 짧은 라벨(칩용)
export const HAZARD_SHORT: Record<HazardType, string> = { heat: "폭염", cold: "한파", flood: "침수", air: "미세먼지" };
// 관리자/소개 화면의 모듈 상태 표시 (활성/대기) — PRIMARY_HAZARD가 활성
export const HAZARD_MODULES: { key: HazardType; label: string; status: "활성" | "대기" }[] = [
  { key: "heat", label: "폭염", status: "활성" },
  { key: "cold", label: "한파", status: "대기" },
  { key: "flood", label: "침수", status: "대기" },
  { key: "air", label: "미세먼지", status: "대기" },
];
