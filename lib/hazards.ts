// SafeLink AI — 생활재난 유형 정의 + 규칙 기반 위험 분석 엔진.
// 복잡한 AI 모델이 아니라 규칙 기반 점수 계산이다. (화면에서는 "AI 자동분류"로 표현)
// 외부 API / LLM 키 없이 완전히 동작한다.
import type { Grade, Hazard, RiskAssessment, UserMode, UserProfile } from "@/lib/types";
import {
  hasCardioMetabolic,
  hasDisability,
  hasDiseases,
  hasEmergencyMemo,
  hasMedications,
  hasRespiratory,
  healthSummaryFlags,
  healthTags,
  needsCommunication,
  needsMobility,
} from "@/lib/health";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// 한글 받침에 따라 은/는
const eunNeun = (word: string): string => {
  const c = word.charCodeAt(word.length - 1);
  if (Number.isNaN(c) || c < 0xac00 || c > 0xd7a3) return "은(는)";
  return (c - 0xac00) % 28 === 0 ? "는" : "은";
};

/* ────────────────────────────────────────────────────────────
 * 등급
 * ──────────────────────────────────────────────────────────── */
export function gradeOf(score: number): Grade {
  if (score >= 80) return "urgent";
  if (score >= 60) return "call";
  if (score >= 40) return "guide";
  return "monitor";
}

export const GRADE_META: Record<Grade, { user: string; admin: string; short: string }> = {
  urgent: { user: "위험 높음", admin: "긴급 확인", short: "긴급" },
  call: { user: "주의", admin: "오늘 중 전화·방문", short: "전화" },
  guide: { user: "행동요령", admin: "행동요령 안내", short: "안내" },
  monitor: { user: "안정", admin: "일반 관찰", short: "관찰" },
};

/* ────────────────────────────────────────────────────────────
 * 사용자 앱 위험 점수 단계 (0~49 관심 / 50~69 주의 / 70~84 경계 / 85~100 고위험)
 * ──────────────────────────────────────────────────────────── */
export type RiskBandKey = "watch" | "caution" | "alert" | "danger";

export interface RiskBand {
  key: RiskBandKey;
  label: string;
  desc: string;
  fg: string;
  soft: string;
  ink: string;
}

const BANDS: { min: number; band: RiskBand }[] = [
  { min: 85, band: { key: "danger", label: "고위험", desc: "지금 바로 대비가 필요한 단계", fg: "#BD4A2C", soft: "#F5E3DB", ink: "#7E2D17" } },
  { min: 70, band: { key: "alert", label: "경계", desc: "오늘 안전 행동이 꼭 필요한 단계", fg: "#C9881F", soft: "#F6EBD0", ink: "#7C5410" } },
  { min: 50, band: { key: "caution", label: "주의", desc: "생활 속 주의가 필요한 단계", fg: "#5F8C1E", soft: "#EAF3D6", ink: "#3C560F" } },
  { min: 0, band: { key: "watch", label: "관심", desc: "평소처럼 지내되 상황을 지켜보는 단계", fg: "#2E8B6B", soft: "#D8F2E4", ink: "#13503D" } },
];

export function riskBand(score: number): RiskBand {
  return (BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1]).band;
}

/* ────────────────────────────────────────────────────────────
 * 재난 유형 정의
 * ──────────────────────────────────────────────────────────── */
export interface HazardTheme {
  fg: string; // 배지 글자/포인트
  soft: string; // 배지 배경
  ink: string; // 진한 글자
  bar: string; // 게이지 색
}

export interface HazardMetric {
  label: string;
  value: string;
  warn?: boolean;
}

export interface HazardDef {
  key: Hazard;
  label: string; // 폭염
  short: string; // 칩용
  emoji: string;
  metrics: string[]; // 대표 지표
  vulnConditions: string[]; // 취약 조건
  theme: HazardTheme;
  today: {
    severity: number; // 오늘 재난 강도 0~100
    alert: string; // 특보
    headline: string; // 한 줄 요약
    stats: HazardMetric[]; // 오늘의 지표 값(시연용)
  };
}

// 재난 유형별 배지 색감만 살짝 다르게 (초록 기반 디자인은 유지)
export const HAZARDS: Record<Hazard, HazardDef> = {
  heat: {
    key: "heat",
    label: "폭염",
    short: "폭염",
    emoji: "🔥",
    metrics: ["기온", "체감온도", "습도", "열대야", "냉방 취약"],
    vulnConditions: ["고령자", "혼자 거주", "에어컨 없음", "노후주택", "기저질환"],
    theme: { fg: "#BD4A2C", soft: "#F5E3DB", ink: "#7E2D17", bar: "#BD4A2C" },
    today: {
      severity: 82,
      alert: "폭염경보",
      headline: "낮 최고 36℃ · 체감 39℃ · 열대야 지속",
      stats: [
        { label: "기온", value: "36℃" },
        { label: "체감온도", value: "39℃", warn: true },
        { label: "습도", value: "70%" },
        { label: "열대야", value: "지속", warn: true },
        { label: "냉방 취약", value: "주의" },
      ],
    },
  },
  flood: {
    key: "flood",
    label: "홍수·침수",
    short: "홍수·침수",
    emoji: "🌊",
    metrics: ["강수량", "침수 위험", "하천 인접", "반지하", "배수 취약"],
    vulnConditions: ["반지하·1층 거주", "이동 어려움", "차량 보유", "노약자 동거"],
    theme: { fg: "#2F6DB5", soft: "#DEEAF6", ink: "#234E80", bar: "#2F6DB5" },
    today: {
      severity: 88,
      alert: "호우경보",
      headline: "시간당 40㎜ 집중호우 · 하천 수위 상승",
      stats: [
        { label: "강수량", value: "40㎜/h", warn: true },
        { label: "침수 위험", value: "높음", warn: true },
        { label: "하천 수위", value: "경계" },
        { label: "반지하", value: "주의", warn: true },
        { label: "배수", value: "지연" },
      ],
    },
  },
  cold: {
    key: "cold",
    label: "한파",
    short: "한파",
    emoji: "❄️",
    metrics: ["기온", "체감온도", "한파주의보", "난방 취약", "동파 위험"],
    vulnConditions: ["난방비 부담", "노후주택", "고령자", "독거", "건강 취약"],
    theme: { fg: "#3E90A8", soft: "#DCEDF2", ink: "#22596A", bar: "#3E90A8" },
    today: {
      severity: 78,
      alert: "한파주의보",
      headline: "아침 최저 -12℃ · 체감 -18℃ · 동파 주의",
      stats: [
        { label: "기온", value: "-12℃", warn: true },
        { label: "체감온도", value: "-18℃", warn: true },
        { label: "특보", value: "한파주의보" },
        { label: "난방 취약", value: "주의" },
        { label: "동파", value: "위험" },
      ],
    },
  },
  dust: {
    key: "dust",
    label: "미세먼지",
    short: "미세먼지",
    emoji: "😷",
    metrics: ["PM10", "PM2.5", "초미세먼지", "환기 주의"],
    vulnConditions: ["호흡기 질환", "어린이", "고령자", "실외근무자"],
    theme: { fg: "#A8763C", soft: "#EFE5D6", ink: "#6E4A20", bar: "#A8763C" },
    today: {
      severity: 80,
      alert: "미세먼지 나쁨",
      headline: "PM10 121㎍ · 초미세먼지 나쁨 · 환기 주의",
      stats: [
        { label: "PM10", value: "121㎍", warn: true },
        { label: "PM2.5", value: "68㎍", warn: true },
        { label: "초미세먼지", value: "나쁨", warn: true },
        { label: "환기", value: "주의" },
      ],
    },
  },
  wind: {
    key: "wind",
    label: "태풍·강풍",
    short: "태풍·강풍",
    emoji: "🌪️",
    metrics: ["강풍", "강수량", "외출 위험", "창문·옥상·간판 위험"],
    vulnConditions: ["고층 거주", "노후 창문", "해안·하천 인접", "반려동물", "차량 보유"],
    theme: { fg: "#5E7C8C", soft: "#E1E9ED", ink: "#39525F", bar: "#5E7C8C" },
    today: {
      severity: 70,
      alert: "강풍주의보",
      headline: "순간최대 21㎧ 강풍 · 낙하물 주의",
      stats: [
        { label: "순간풍속", value: "21㎧", warn: true },
        { label: "강수량", value: "15㎜" },
        { label: "외출 위험", value: "높음", warn: true },
        { label: "낙하물", value: "주의" },
      ],
    },
  },
};

// 칩·탭 순서
export const HAZARD_ORDER: Hazard[] = ["heat", "flood", "cold", "dust", "wind"];

// 오늘의 주 위험(랜딩/기본 선택)
export const PRIMARY_HAZARD: Hazard = "flood";

export const LOCATION = "우리 동네";
export const TODAY_LABEL = "2026년 7월 9일 목요일";
export const UPDATED_LABEL = "오전 6:00 자동 갱신";

/* ────────────────────────────────────────────────────────────
 * 프로필 조건 헬퍼
 * ──────────────────────────────────────────────────────────── */
const isElderly = (p: UserProfile) => /60대|70대|80대/.test(p.ageBand);
const isChild = (p: UserProfile) => /10대|어린이/.test(p.ageBand);
const isLowFloor = (p: UserProfile) => p.housing === "반지하" || p.housing === "1층";
const isBasement = (p: UserProfile) => p.housing === "반지하";
const isHighFloor = (p: UserProfile) => p.housing === "고층";
const isHouse = (p: UserProfile) => p.housing === "단독주택";

/* ────────────────────────────────────────────────────────────
 * 재난 유형별 취약도(0~100) + 위험 태그
 * ──────────────────────────────────────────────────────────── */
function vulnerability(p: UserProfile, hazard: Hazard): { vuln: number; tags: string[] } {
  let v = 0;
  const tags: string[] = [];

  switch (hazard) {
    case "heat": {
      v = 20;
      if (p.alone) { v += 14; tags.push("독거"); }
      if (isElderly(p)) { v += 18; tags.push("고령자"); }
      if (p.healthRisk) { v += 18; tags.push("건강 취약"); }
      if (!p.hasAc) { v += 26; tags.push("냉방 취약"); }
      if (isBasement(p)) { v += 10; tags.push("반지하 열기"); }
      if (isHighFloor(p)) { v += 10; tags.push("최상층 복사열"); }
      if (isHouse(p)) v += 6;
      if (tags.length === 0) tags.push("폭염 대비");
      break;
    }
    case "flood": {
      v = 18;
      if (isBasement(p)) { v += 34; tags.push("침수 취약", "저층 거주"); }
      else if (isLowFloor(p)) { v += 20; tags.push("저층 거주"); }
      else tags.push("호우 주의");
      if (p.hasCar) { v += 14; tags.push("차량 이동 필요"); }
      if (p.alone) v += 10;
      if (isElderly(p)) v += 8;
      if (p.healthRisk) { v += 12; tags.push("이동 지원 필요"); }
      if (p.guardianNeeded) v += 4;
      tags.push("대피 장소 확인");
      break;
    }
    case "cold": {
      v = 18;
      tags.push("한파 취약");
      if (isElderly(p)) { v += 18; tags.push("고령자"); }
      if (p.alone) { v += 12; }
      if (p.heatingWeak) { v += 30; tags.push("난방 취약"); }
      if (p.healthRisk) { v += 16; tags.push("건강 취약"); }
      if (isHouse(p) || isBasement(p)) { v += 8; tags.push("동파 위험"); }
      if (p.alone || isElderly(p)) tags.push("안부 확인 필요");
      break;
    }
    case "dust": {
      v = 16;
      tags.push("호흡기 주의", "외출 자제", "환기 주의");
      if (p.healthRisk) { v += 48; tags.push("건강 취약"); }
      if (isElderly(p)) { v += 18; tags.push("고령자"); }
      if (isChild(p)) { v += 18; tags.push("어린이 주의"); }
      if (p.alone) v += 4;
      break;
    }
    case "wind": {
      v = 18;
      tags.push("강풍 주의", "창문 고정", "외출 제한", "비상용품 준비");
      if (isHighFloor(p)) { v += 22; tags.push("고층 낙하물 주의"); }
      if (isHouse(p)) { v += 16; tags.push("노후 창문 주의"); }
      if (p.hasCar) { v += 12; }
      if (p.hasPet) { v += 8; tags.push("반려동물 대비"); }
      if (isBasement(p)) v += 4;
      if (p.healthRisk) v += 6;
      break;
    }
  }

  // 중복 제거
  return { vuln: clamp(v), tags: Array.from(new Set(tags)).slice(0, 6) };
}

/* ────────────────────────────────────────────────────────────
 * 쉬운 설명 문장
 * ──────────────────────────────────────────────────────────── */
function describe(p: UserProfile, hazard: Hazard, grade: Grade): string {
  const who = p.name?.trim() ? `${p.name}님` : "회원님";
  const home = p.alone ? `${p.housing}에 혼자 사시고` : `${p.housing}에 사시고`;
  const strong = grade === "urgent" || grade === "call";

  switch (hazard) {
    case "heat":
      return `${who}은 ${home} ${p.hasAc ? "냉방은 가능하지만" : "에어컨이 없어"} 오늘 같은 폭염에는 낮 12시~5시 실내 온도가 크게 오를 수 있어요.${strong ? " 수분 섭취와 시원한 실내 이용을 챙겨주세요." : ""}`;
    case "flood":
      return `${who}은 ${home} ${isLowFloor(p) ? "저층·반지하라 집중호우 때 침수 위험이 큽니다." : "오늘 집중호우로 하천·저지대 접근에 주의가 필요합니다."}${p.hasCar ? " 차량은 미리 높은 곳으로 옮겨주세요." : ""}`;
    case "cold":
      return `${who}은 ${home} ${p.heatingWeak ? "난방이 취약해" : ""} 오늘 같은 한파에는 실내 저체온과 수도 동파에 주의가 필요합니다.${p.alone && isElderly(p) ? " 오늘은 안부 확인이 필요한 날이에요." : ""}`;
    case "dust":
      return `${who}은 ${p.healthRisk ? "호흡기·건강 취약 정보가 있어" : ""} 오늘처럼 미세먼지가 나쁜 날에는 외출을 줄이고 실내 공기 관리가 필요합니다.`;
    case "wind":
      return `${who}은 ${home} ${isHighFloor(p) ? "고층이라 강풍 때 창문·낙하물 위험이 큽니다." : "오늘 강풍으로 외출과 창가 물건에 주의가 필요합니다."}${p.hasPet ? " 반려동물이 놀라지 않도록 안전한 공간을 마련해 주세요." : ""}`;
  }
}

/* ────────────────────────────────────────────────────────────
 * 오늘 해야 할 일 체크리스트
 * ──────────────────────────────────────────────────────────── */
function checklist(p: UserProfile, hazard: Hazard): string[] {
  switch (hazard) {
    case "heat": {
      const list = [
        p.hasAc ? "냉방기 사용 여부를 확인하세요." : "에어컨이 없다면 무더위쉼터·도서관 등 시원한 곳을 이용하세요.",
        "물을 충분히 마셨는지 확인하세요.",
        "낮 12시~5시 외출을 피하세요.",
      ];
      if (p.alone && isElderly(p)) list.push("오전·저녁 안부 확인을 받으세요.");
      return list;
    }
    case "flood": {
      const list = [
        "현관 앞 배수구와 창문 주변을 확인하세요.",
        isLowFloor(p) ? "반지하·저층이라면 침수 전 대피 가능한 장소를 확인하세요." : "저지대·지하 공간 접근을 피하세요.",
      ];
      if (p.hasCar) list.push("차량은 지하주차장보다 높은 곳으로 이동하세요.");
      list.push("하천·계곡 주변 접근을 피하세요.");
      return list;
    }
    case "cold": {
      const list = [
        "난방 상태와 실내 온도를 확인하세요.",
        "수도 동파 방지를 위해 물을 약하게 틀어두세요.",
      ];
      if (p.alone && isElderly(p)) list.push("독거 고령이라면 오전/저녁 2회 안부를 확인하세요.");
      else list.push("외출 시 체온 유지에 신경 쓰세요.");
      return list;
    }
    case "dust": {
      const list = [
        "창문을 닫고 공기청정기를 사용하세요.",
        p.healthRisk ? "호흡기 질환이 있다면 외출을 줄이고 마스크를 착용하세요." : "외출 시 KF 마스크를 착용하세요.",
        "실내 환기는 미세먼지 농도가 낮은 시간에 짧게 하세요.",
      ];
      return list;
    }
    case "wind": {
      const list = [
        "창문을 잠그고 창가 물건을 치우세요.",
        "외출을 자제하고 하천·해안 주변 접근을 피하세요.",
        "정전 대비 보조배터리와 손전등을 준비하세요.",
      ];
      if (isHighFloor(p)) list.push("고층이라면 창가에서 떨어져 계세요.");
      if (p.hasPet) list.push("반려동물을 실내 안전한 공간에 두세요.");
      return list;
    }
  }
}

/* ────────────────────────────────────────────────────────────
 * 선택입력 건강·응급 정보 가산 (입력된 경우에만 반영, 과도하게 오르지 않도록 상한)
 *   건강 취약(healthRisk)은 이미 vulnerability에 반영되어 여기서 중복 가산하지 않는다.
 * ──────────────────────────────────────────────────────────── */
const HEALTH_BONUS_CAP = 30;

function healthAdjustment(p: UserProfile, hazard: Hazard): number {
  let b = 0;
  // 공통
  if (hasDisability(p)) b += 8;
  if (needsMobility(p)) b += 10;
  if (needsCommunication(p)) b += 6;
  if (hasDiseases(p)) b += 8;
  if (hasEmergencyMemo(p)) b += 3;
  // 재난 유형별 추가
  switch (hazard) {
    case "heat":
      if (hasCardioMetabolic(p)) b += 8;
      if (hasMedications(p)) b += 4;
      break;
    case "flood":
      if (needsMobility(p)) b += 12;
      if (hasDisability(p)) b += 8;
      break;
    case "cold":
      if (hasCardioMetabolic(p)) b += 8;
      break;
    case "dust":
      if (hasRespiratory(p)) b += 15;
      break;
    case "wind":
      if (needsMobility(p)) b += 8;
      if (needsCommunication(p)) b += 5;
      break;
  }
  return Math.min(b, HEALTH_BONUS_CAP);
}

// 건강·응급 정보가 있을 때 설명 문장에 덧붙이는 강화 문구 (입력된 경우에만)
function healthNote(p: UserProfile, hazard: Hazard): string {
  switch (hazard) {
    case "heat":
      if (isElderly(p) && !p.hasAc && hasDiseases(p))
        return " 고령·냉방 취약에 기저질환이 겹쳐 오늘은 특히 위험합니다. 수분을 자주 챙기고 시원한 곳을 이용하세요.";
      break;
    case "flood":
      if (isLowFloor(p) && needsMobility(p))
        return " 이동이 어려워 침수 시 대피가 늦어질 수 있으니 대피 경로와 도움 요청 방법을 미리 준비하세요.";
      break;
    case "cold":
      if (p.heatingWeak && hasDiseases(p))
        return " 난방 취약에 기저질환이 있어 실내 저체온에 특히 주의가 필요하고, 안부 확인이 권장됩니다.";
      break;
    case "dust":
      if (isElderly(p) && hasRespiratory(p))
        return " 고령·호흡기 질환으로 외출을 자제하고, 필요하면 마스크 지원을 요청하세요.";
      if (hasRespiratory(p)) return " 호흡기 질환이 있어 외출을 줄이고 마스크 착용이 필요합니다.";
      break;
    case "wind":
      if (p.hasPet) return " 반려동물과 함께 대피할 수 있도록 이동장·목줄을 미리 준비하세요.";
      if (needsMobility(p)) return " 이동이 어려우면 무리한 외출을 피하고 도움을 요청하세요.";
      break;
  }
  return "";
}

/* ────────────────────────────────────────────────────────────
 * 점수 구성(설명용 게이지)
 * ──────────────────────────────────────────────────────────── */
function buildBreakdown(p: UserProfile, hazard: Hazard, base: number, vuln: number, healthBonus: number) {
  const housing =
    hazard === "flood"
      ? isBasement(p) ? 92 : isLowFloor(p) ? 72 : 34
      : hazard === "wind"
        ? isHighFloor(p) ? 84 : isHouse(p) ? 66 : 38
        : hazard === "heat"
          ? isBasement(p) || isHighFloor(p) ? 70 : 44
          : isHouse(p) || isBasement(p) ? 62 : 40;
  const personal = clamp((isElderly(p) ? 40 : isChild(p) ? 28 : 14) + (p.healthRisk ? 40 : 0) + (p.alone ? 16 : 0) + healthBonus);
  const support = clamp((p.guardianNeeded ? 24 : 0) + (p.alone ? 34 : 12) + (isElderly(p) ? 30 : 10));
  return [
    { label: "재난 강도", value: base },
    { label: "주거 환경", value: housing },
    { label: "개인·건강", value: personal },
    { label: "대응 여건", value: vuln },
    { label: "돌봄 공백", value: support },
  ];
}

/* ────────────────────────────────────────────────────────────
 * 메인 — 규칙 기반 위험 분석
 * 최종 위험도 = 재난 강도 40% + 취약도 60%
 * ──────────────────────────────────────────────────────────── */
export function assessRisk(p: UserProfile, hazard: Hazard): RiskAssessment {
  const def = HAZARDS[hazard];
  const base = def.today.severity;
  const { vuln, tags } = vulnerability(p, hazard);
  const healthBonus = healthAdjustment(p, hazard);
  const score = clamp(base * 0.4 + vuln * 0.6 + healthBonus);
  const grade = gradeOf(score);
  // 기본 취약 태그 + 건강·응급 태그 (입력된 경우에만)
  const allTags = Array.from(new Set([...tags, ...healthTags(p)])).slice(0, 7);
  return {
    hazard,
    score,
    grade,
    tags: allTags,
    description: describe(p, hazard, grade) + healthNote(p, hazard),
    checklist: checklist(p, hazard),
    breakdown: buildBreakdown(p, hazard, base, vuln, healthBonus),
  };
}

/* ────────────────────────────────────────────────────────────
 * 공유 문구 (실제 전송 없음 — 복사용). 모드에 따라 문장이 달라진다.
 *   self     — 내가 가족에게 "나는 이렇게 대비할게요"
 *   guardian — 보호자가 가족에게 "이렇게 해주세요"
 * ──────────────────────────────────────────────────────────── */
// self: 내가 오늘 할 행동 (1인칭)
const SELF_SHARE: Record<Hazard, string> = {
  heat: "저는 시원한 곳에서 수분을 챙기고, 힘들면 무더위쉼터로 이동할게요.",
  flood: "저는 배수구와 창문 주변을 확인하고, 필요하면 가까운 대피소로 이동할게요.",
  cold: "저는 난방과 수도 동파를 점검하고, 몸 상태를 살필게요.",
  dust: "저는 창문을 닫고 외출을 줄이며, 필요하면 마스크를 챙길게요.",
  wind: "저는 창문을 잠그고 창가 물건을 치운 뒤 외출을 자제할게요.",
};

// guardian: 가족에게 부탁하는 행동 (2인칭)
const GUARDIAN_SHARE: Record<Hazard, string> = {
  heat: "물 자주 드시고 시원한 곳에 계세요. 어지러우면 바로 연락 주세요.",
  flood: "창문 주변과 현관 앞 배수구를 확인하시고, 물이 차오르면 바로 1층 밖이나 가까운 대피소로 이동해주세요.",
  cold: "난방 잘 켜두시고 수도 동파 조심하세요. 추우면 바로 연락 주세요.",
  dust: "창문 닫으시고 외출은 줄여주세요. 나가실 때는 마스크를 꼭 착용해주세요.",
  wind: "창문 단단히 닫으시고 창가에서 떨어져 계세요. 외출은 자제해주세요.",
};

export function buildShareMessage(p: UserProfile, a: RiskAssessment, mode: UserMode): string {
  const label = HAZARDS[a.hazard].label;
  const region = p.region || "우리 동네";
  // 공유 문구에는 민감정보를 자세히 쓰지 않고, 이동 도움 필요만 부드럽게 요약해 덧붙인다.
  const mobility = needsMobility(p);
  if (mode === "guardian") {
    const who = p.name?.trim() ? p.name : "가족";
    return [
      `${who}, 오늘 ${region}에 ${label} 위험이 있어요.`,
      GUARDIAN_SHARE[a.hazard],
      ...(mobility ? ["이동이 어려우시면 무리하지 마시고 바로 도움을 요청해주세요."] : []),
      "",
      "※ 긴급 상황에서는 119 및 지자체 안내를 우선하세요.",
    ].join("\n");
  }
  return [
    `오늘 ${region}에 ${label} 위험이 있어요.`,
    SELF_SHARE[a.hazard],
    ...(mobility ? ["저는 이동 도움이 필요한 상태라 상황이 나빠지면 도움을 요청하겠습니다."] : []),
    "",
    "※ 긴급 상황에서는 119 및 지자체 안내를 우선하세요.",
  ].join("\n");
}

/** 도움 요청 문구 — 모드별로 다르게 생성 (복사용) */
export function buildHelpMessage(
  p: UserProfile,
  a: RiskAssessment,
  mode: UserMode,
  requestTypes: string[],
): string {
  const label = HAZARDS[a.hazard].label;
  const region = p.region || "우리 동네";
  const needs = requestTypes.length ? requestTypes.join(", ") : "안부 확인과 대피소 안내";
  const lowFloor = p.housing === "반지하" || p.housing === "1층";
  // 문구에는 민감정보를 그대로 노출하지 않고 요약형 플래그만 담는다.
  const flags = healthSummaryFlags(p);
  if (mode === "guardian") {
    const who = p.name?.trim() ? p.name : "가족";
    const lines = [`안녕하세요. ${region}에 거주하는 ${who}의 보호자입니다. 현재 ${label} 위험이 높아 ${needs}이(가) 필요합니다.`];
    if (flags.length) lines.push(`${who}${eunNeun(who)} ${flags.join(", ")} 상태로, 방문 또는 전화 확인 시 참고 부탁드립니다.`);
    return lines.join(" ");
  }
  const lines = [`안녕하세요. 저는 ${region} 거주자입니다. 현재 ${label} 위험이 높아 ${needs}이(가) 필요합니다.`];
  if (lowFloor) lines.push(`${p.housing}에 거주하고 있습니다.`);
  if (flags.length) lines.push(`참고할 응급 정보로 ${flags.join(", ")}이(가) 있습니다.`);
  return lines.join(" ");
}

/* ────────────────────────────────────────────────────────────
 * 공통 안내 문구
 * ──────────────────────────────────────────────────────────── */
export const DISCLAIMER =
  "본 서비스는 공식 재난안전 안내를 보조하는 데모이며, 긴급 상황에서는 119 및 지자체 안내를 우선합니다.";
export const ADMIN_DEMO_NOTE = "본 화면은 서비스 흐름을 보여주기 위한 시연용 취약가구 데이터입니다.";
export const STORAGE_PRIVACY = "입력한 정보는 현재 브라우저에만 저장되며 서버로 전송되지 않습니다.";

// 대회 제출용 MVP — 로그인 없는 체험 구조를 장점으로 설명하는 공통 문구
export const MVP_BADGE = "별도 회원가입 없이 바로 체험할 수 있습니다";
export const MVP_INTRO =
  "관리자 화면은 시연용 취약가구 데이터를 사용하고, 사용자 앱은 입력한 정보를 브라우저에 저장해 개인 맞춤형 위험도와 행동요령을 제공합니다.";
export const ADMIN_OPERATING_NOTE =
  "실제 서비스에서는 지자체·복지관·생활지원사 계정으로 운영하며, 지금은 심사자가 회원가입 없이 바로 기능을 확인할 수 있도록 시연용 데이터를 제공합니다.";
