// 데이터 접근 레이어.
// 지금은 mock + 약간의 지연으로 "서버 호출"을 흉내 낸다.
// 백엔드가 붙으면 이 파일의 본문만 fetch(...) 로 바꾸면 되고,
// 화면 컴포넌트는 손대지 않는다.
import type { Household } from "@/lib/types";
import { HOUSEHOLDS, SUMMARY } from "@/lib/mock/households";
import { TODAY_WEATHER } from "@/lib/mock/weather";
import { BASE_METRICS } from "@/lib/mock/metrics";
import {
  buildActionPlan,
  buildDailyReport,
  buildGuardianMessage,
  buildPhoneScript,
  buildVisitChecklist,
  type GeneratedDoc,
} from "@/lib/llm/templates";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── 읽기 (규칙 기반, LLM 미사용) ───────────────────────────────
export async function fetchHouseholds(): Promise<Household[]> {
  await delay(120);
  return HOUSEHOLDS;
}

export async function fetchHousehold(id: string): Promise<Household | undefined> {
  await delay(80);
  return HOUSEHOLDS.find((h) => h.id === id);
}

export async function fetchSummary() {
  await delay(60);
  return SUMMARY;
}

export async function fetchWeather() {
  await delay(60);
  return TODAY_WEATHER;
}

export async function fetchMetrics() {
  await delay(60);
  return BASE_METRICS;
}

// ── 생성 (여기에만 LLM이 들어간다 / 호출마다 지연·토큰 발생) ──────
export async function generatePhoneScript(h: Household): Promise<GeneratedDoc> {
  await delay(900);
  return buildPhoneScript(h);
}

export async function generateVisitChecklist(h: Household): Promise<GeneratedDoc> {
  await delay(900);
  return buildVisitChecklist(h);
}

export async function generateActionPlan(): Promise<GeneratedDoc> {
  await delay(800);
  return buildActionPlan();
}

export async function generateDailyReport(): Promise<GeneratedDoc> {
  await delay(1000);
  return buildDailyReport();
}

export async function generateGuardianMessage(): Promise<GeneratedDoc> {
  await delay(800);
  return buildGuardianMessage();
}
