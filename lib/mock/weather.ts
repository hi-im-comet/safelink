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
