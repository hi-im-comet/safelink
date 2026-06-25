// 사용자 앱 전용 mock 위험도 엔진.
// 오늘 날씨 + 저장된 주거 프로필을 조합해 점수·구성·요인칩·사유·행동계획을 만든다.
// (관리자 쪽 computeRisk는 가구 고정 점수를 쓰고, 이 엔진은 사용자가 편집하는 프로필을 반영한다.)
import type { Grade, TodayWeather } from "@/lib/types";
import { gradeOf } from "@/lib/risk/score";
import { CAREGIVER_REASON } from "@/lib/mock/guardian";
import { isElderly } from "@/lib/mock/user";

type P = Record<string, string>;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const has = (v?: string) => !!(v ?? "").trim();

function weatherScore(w: TodayWeather): number {
  let s = 38;
  if (w.alert) s += 24;
  if (w.nightHeat) s += 10;
  s += Math.max(0, w.feelsLike - 33) * 2;
  s += w.humidity >= 70 ? 8 : w.humidity >= 60 ? 4 : 0;
  return clamp(s);
}

function housingScore(p: P): number {
  let s = 22;
  if (/남서향|서향/.test(p.direction ?? "")) s += 15;
  else if (/남향|남동향/.test(p.direction ?? "")) s += 6;
  if (p.floor === "최상층" || p.floor === "반지하") s += 14;
  if (p.buildingAge === "노후") s += 10;
  else if (p.buildingAge === "보통") s += 3;
  if (p.windowSize === "큼") s += 8;
  else if (p.windowSize === "보통") s += 3;
  if (p.insulation === "약함") s += 4; // 단열 약하면 여름에도 불리
  if (p.vent === "잘 안 됨") s += 8;
  else if (p.vent === "보통") s += 3;
  else s -= 4;
  if (p.curtain === "없음") s += 8;
  else if (p.curtain === "일반") s += 2;
  else s -= 4; // 암막
  if (p.ac === "없음") s += 16;
  else if (p.ac !== "둘 다") s += 6; // 1대(벽걸이/스탠드)
  if (p.fan === "없음") s += 6;
  if (p.cost === "높음") s += 10;
  else if (p.cost === "보통") s += 3;
  return clamp(s);
}

function lifestyleScore(p: P): number {
  let s = 12;
  if (p.dayStay === "종일 재택") s += 30;
  else if (p.dayStay === "오후 오래") s += 22;
  else if (p.dayStay === "오후 잠깐") s += 10;
  if (p.hotHome === "거의 항상") s += 12;
  else if (p.hotHome === "자주") s += 7;
  else if (p.hotHome === "가끔") s += 3;
  if (p.heatSensitivity === "매우 힘든 편") s += 12;
  else if (p.heatSensitivity === "많이 타는 편") s += 8;
  else if (p.heatSensitivity === "보통") s += 3;
  return clamp(s);
}

// 건강·돌봄 점수 — 마이페이지 정보(info) 기반
function careScore(info: P): number {
  let s = 8;
  if (isElderly(info.birth)) s += 22;
  if (info.chronic === "있음" || has(info.conditions)) s += 16;
  if (info.disability === "있음" || has(info.disabilityType)) s += 10;
  if (info.mobility === "불편") s += 10;
  if (info.alone === "예") s += 14;
  if (info.helperCohabit !== "예") s += 6; // 도움 줄 동거인 없음
  if (info.guardianReach === "어려움") s += 12;
  else if (info.guardianReach === "가능") s -= 6;
  if (info.checkCycle === "거의 없음") s += 14;
  else if (info.checkCycle === "2주 1회") s += 8;
  else if (info.checkCycle === "매일") s -= 4;
  if (info.meds === "있음" || has(info.medications)) s += 6;
  return clamp(s);
}

function coolingAccessScore(p: P): number {
  let s = 10;
  if (p.ac === "없음") s += 35;
  else if (p.ac !== "둘 다") s += 12;
  if (p.fan === "없음") s += 10;
  if (p.cost === "높음") s += 18;
  else if (p.cost === "보통") s += 6;
  if (p.curtain === "없음") s += 8;
  if (p.coolingPriority === "절약 우선") s += 8;
  else if (p.coolingPriority === "균형") s += 3;
  if (p.acUsableHours === "거의 안 씀") s += 12;
  else if (p.acUsableHours === "하루 1시간 이내") s += 6;
  if (p.sleepCooling === "거의 안 함") s += 8;
  else if (p.sleepCooling === "부담됨") s += 4;
  return clamp(s);
}

function acLabel(ac?: string): string {
  if (ac === "없음") return "에어컨 없음";
  if (ac === "둘 다") return "에어컨 2대";
  return "에어컨 1대";
}

function buildChips(p: P, info: P, w: TodayWeather, caregiver: boolean): string[] {
  const chips: string[] = [`체감 ${w.feelsLike}℃`, `습도 ${w.humidity}%`, w.alert];
  if (p.direction) chips.push(p.direction);
  if (p.floor === "최상층" || p.floor === "반지하") chips.push(p.floor);
  if (p.buildingAge === "노후") chips.push("노후 주택");
  if (p.windowSize === "큼") chips.push("창문 큼");
  if (p.vent === "잘 안 됨") chips.push("환기 약함");
  chips.push(acLabel(p.ac));
  if (p.fan === "없음") chips.push("선풍기 없음");
  if (p.cost && p.cost !== "낮음") chips.push(`냉방비 ${p.cost}`);
  if (p.dayStay === "오후 오래" || p.dayStay === "종일 재택") chips.push("오후 재택");
  if (p.heatSensitivity === "많이 타는 편" || p.heatSensitivity === "매우 힘든 편") chips.push("더위 민감도 높음");
  if (info.alone === "예") chips.push("혼자 거주");
  // 건강·돌봄 — 구체적 나이·질환명은 노출하지 않고 요약 칩으로만 (상세는 마이페이지)
  const healthVuln =
    isElderly(info.birth) ||
    info.chronic === "있음" ||
    has(info.conditions) ||
    info.disability === "있음" ||
    has(info.disabilityType) ||
    info.mobility === "불편" ||
    has(info.medications);
  chips.push(healthVuln ? "건강 취약요인 있음" : "개인 취약도 낮음");
  return chips.slice(0, caregiver ? 16 : 12);
}

function buildReason(p: P, info: P, caregiver: boolean): string {
  if (caregiver) return CAREGIVER_REASON;
  const housing = [`${p.direction} ${p.household}`];
  if (p.dayStay === "종일 재택" || p.dayStay === "오후 오래") housing.push("오후 재택");
  if (p.heatSensitivity === "많이 타는 편" || p.heatSensitivity === "매우 힘든 편") housing.push("더위 민감도 높음");

  const health: string[] = [];
  if (isElderly(info.birth)) health.push("고령");
  if (info.chronic === "있음" || has(info.conditions)) health.push("기저질환");
  if (info.disability === "있음" || has(info.disabilityType)) health.push("장애");
  if (info.mobility === "불편") health.push("이동 불편");
  if (info.alone === "예") health.push("혼자 거주");

  const base = housing.join(", ");
  return health.length
    ? `${base}에 더해 ${health.slice(0, 2).join("·")} 정보가 있어 폭염 시 건강 위험을 함께 고려했습니다.`
    : `${base} 조건 때문에 오후 1시~4시 실내 과열 가능성이 큽니다.`;
}

export interface ProfileRisk {
  score: number;
  grade: Grade;
  breakdown: { label: string; value: number }[];
  chips: string[];
  reason: string;
}

/**
 * 오늘 위험도 = 날씨 위험도 + 집 환경 취약도 + 생활패턴 + 건강/돌봄 + 활성 기후위험별 가중치
 *
 * 활성 기후위험(activeHazard)에 따라 반영 요소가 달라지도록 확장 가능한 구조:
 *  - heat(폭염):  체감온도 · 습도 · 방향 · 창문 · 냉방 접근성 · 더위 민감도
 *  - cold(한파):  체감온도 · 단열 · 난방 방식 · 틈새 바람 · 고령/질환
 *  - flood(침수): 강수량 · 반지하/저지대 · 배수 상태 · 출입구 높이 · 이동 불편
 *  - air(공기질): 미세먼지 농도 · 창문 밀폐 · 공기청정기 · 호흡기 질환
 *
 * MVP의 실제 계산은 heat(폭염)만 구현한다. (집 환경의 한파/침수/공기질 입력값은 저장만 됨)
 */
export function computeProfileRisk(p: P, info: P, w: TodayWeather, caregiver: boolean): ProfileRisk {
  const weather = weatherScore(w);
  const housing = housingScore(p);
  const lifestyle = lifestyleScore(p);
  const care = careScore(info);
  const cooling = coolingAccessScore(p);

  let score: number;
  let breakdown: { label: string; value: number }[];
  if (caregiver) {
    score = clamp(weather * 0.3 + housing * 0.3 + care * 0.3 + cooling * 0.1);
    breakdown = [
      { label: "날씨 위험도", value: weather },
      { label: "집 환경 취약도", value: housing },
      { label: "돌봄 공백", value: care },
      { label: "냉방 접근성", value: cooling },
    ];
  } else {
    score = clamp(weather * 0.3 + housing * 0.35 + lifestyle * 0.2 + care * 0.15);
    breakdown = [
      { label: "날씨 위험도", value: weather },
      { label: "집 환경 취약도", value: housing },
      { label: "생활패턴 위험도", value: lifestyle },
      { label: "건강·돌봄", value: care },
    ];
  }

  return { score, grade: gradeOf(score), breakdown, chips: buildChips(p, info, w, caregiver), reason: buildReason(p, info, caregiver) };
}

// 위험 요인과 연결된 시간대별 행동계획.
// 복합 위험(activeHazards)이 충돌하면 우선순위로 조정한다. 예) 폭염은 환기를 권장하지만
// 미세먼지가 높으면 장시간 환기를 막아야 하므로 "짧은 환기"로 대체한다.
// (MVP는 주 위험 폭염 기준으로 생성하고, 동시 위험은 홈에서 주의 문구로 안내)
export function buildPlan(
  p: P,
  w: TodayWeather,
  caregiver: boolean,
): { block: string; time: string; items: string[] }[] {
  if (caregiver) {
    return [
      { block: "오전", time: "6~11시", items: ["부모님께 전화해 냉방기 사용 여부를 확인하세요."] },
      { block: "점심 전", time: "11~12시", items: ["냉방비 부담 때문에 참고 계신지 확인하세요."] },
      { block: "오후 피크", time: "1~4시", items: ["연락이 안 되면 방문 확인 또는 도움 요청을 검토하세요."] },
      { block: "저녁", time: "5~8시", items: ["저녁에 다시 안부를 확인하세요."] },
      { block: "밤", time: "9시 이후", items: ["열대야 대비 냉방·수분 섭취를 안내하세요."] },
    ];
  }

  // 야간 활동 / 오전 취침 사용자
  const nightOwl = p.lifeRhythm === "야간 활동" || p.sleepTime === "오전" || p.sleepTime === "새벽";
  if (nightOwl) {
    return [
      { block: "오전", time: "6~11시", items: ["취침 전 짧게 냉방하고 커튼을 닫아주세요."] },
      { block: "점심 전", time: "11~12시", items: ["직사광이 들어오기 전에 차광을 시작하세요."] },
      { block: "오후 피크", time: "1~4시", items: ["집에 머문다면 선풍기와 짧은 냉방을 병행하세요."] },
      { block: "저녁", time: "5~8시", items: ["기온이 내려가면 환기하세요."] },
      { block: "밤", time: "9시 이후", items: ["활동 전 환기하고 수분을 충분히 섭취하세요."] },
    ];
  }

  // 낮 활동 / 오후 외출 사용자
  const dayOut = p.dayStay === "거의 없음" || p.outdoor === "많음";
  if (dayOut) {
    return [
      { block: "오전", time: "6~11시", items: ["환기를 마치고 외출 전 차광을 해주세요."] },
      { block: "점심 전", time: "11~12시", items: ["외출 시 햇볕을 피하고 물을 챙기세요."] },
      { block: "오후 피크", time: "1~4시", items: ["야외 이동 시간을 줄이고 시원한 실내공간을 이용하세요."] },
      { block: "저녁", time: "5~8시", items: ["귀가 후 열기가 빠진 뒤 환기하세요."] },
      { block: "밤", time: "9시 이후", items: [w.nightHeat ? "취침 전 적정 온도로 짧게 냉방하세요." : "취침 전 환기로 실내 열을 식히세요."] },
    ];
  }

  const peak =
    p.ac === "없음"
      ? ["무더위쉼터·도서관 등 시원한 실내공간을 우선 이용하세요.", "젖은 수건·통풍·선풍기로 체감 온도를 낮추세요."]
      : p.cost === "높음"
        ? ["피크 전 짧게 냉방 후 생활공간 중심으로 범위를 줄이세요.", "가까운 공공 실내공간 이용을 검토하세요."]
        : ["짧게 사전 냉방하고 선풍기와 함께 쓰세요.", "도서관·카페 등 시원한 실내공간을 이용하세요."];

  const shade =
    /남서향|서향|남향/.test(p.direction ?? "") || p.windowSize === "큼"
      ? ["커튼·블라인드를 닫아 직사광을 막으세요."]
      : ["창에 차광을 더해 직사광을 줄이세요."];

  return [
    { block: "오전", time: "6~11시", items: ["창문을 열어 환기를 마치세요.", "기온이 오르기 전 집 안의 열을 빼주세요."] },
    { block: "점심 전", time: "11~12시", items: shade },
    { block: "오후 피크", time: "1~4시", items: peak },
    { block: "저녁", time: "5~8시", items: ["실내 온도가 내려가면 다시 환기하세요."] },
    {
      block: "밤",
      time: "9시 이후",
      items: [w.nightHeat ? "열대야 대비, 취침 전 적정 온도로 짧게 냉방하세요." : "취침 전 환기로 실내 열을 식히세요."],
    },
  ];
}
