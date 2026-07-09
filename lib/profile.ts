// 사용자 입력 폼 구성 + 기본값. 로그인 없이 localStorage에만 저장된다.
import type { UserMode, UserProfile } from "@/lib/types";

export const AGE_BANDS = ["10대 이하", "20~30대", "40~50대", "60대", "70대", "80대 이상"];
export const HOUSING_TYPES = ["아파트", "단독주택", "반지하", "1층", "고층"];
export const RELATIONS = ["부모님", "조부모", "가족", "지인"];

// 데모용 기본 예시 — 모드별로 다르게 채운다 (입력 화면에서 자유롭게 수정 가능)
export const DEMO_PROFILE_SELF: UserProfile = {
  name: "",
  ageBand: "40~50대",
  region: "햇살동",
  housing: "반지하",
  alone: false,
  healthRisk: false,
  hasAc: true,
  heatingWeak: false,
  hasCar: true,
  hasPet: false,
  guardianNeeded: false,
};

export const DEMO_PROFILE_GUARDIAN: UserProfile = {
  name: "어머니",
  relation: "부모님",
  ageBand: "70대",
  region: "햇살동",
  housing: "반지하",
  alone: true,
  healthRisk: true,
  hasAc: false,
  heatingWeak: true,
  hasCar: false,
  hasPet: false,
  guardianNeeded: true,
};

export function defaultProfile(mode: UserMode): UserProfile {
  return mode === "guardian" ? { ...DEMO_PROFILE_GUARDIAN } : { ...DEMO_PROFILE_SELF };
}

/* ── 폼 구성 (섹션으로 분리) ─────────────────────────────── */
export type FieldType = "text" | "chips" | "toggle";

export interface FormField {
  key: keyof UserProfile;
  type: FieldType;
  label?: string;
  selfLabel?: string;
  guardianLabel?: string;
  options?: string[];
  placeholder?: string;
  selfPlaceholder?: string;
  guardianPlaceholder?: string;
  hint?: string;
  selfHint?: string;
  guardianHint?: string;
  guardianOnly?: boolean;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export const FORM_SECTIONS: FormSection[] = [
  {
    title: "기본 정보",
    fields: [
      { key: "name", type: "text", selfLabel: "이름 또는 별칭", guardianLabel: "가족 이름 또는 별칭", selfPlaceholder: "예: 홍길동 / 나", guardianPlaceholder: "예: 어머니" },
      { key: "relation", type: "chips", label: "관계", options: RELATIONS, guardianOnly: true },
      { key: "ageBand", type: "chips", label: "연령대", options: AGE_BANDS },
      { key: "region", type: "text", label: "동네", placeholder: "예: 햇살동" },
    ],
  },
  {
    title: "거주 환경",
    fields: [
      { key: "housing", type: "chips", label: "거주 형태", options: HOUSING_TYPES },
      { key: "hasAc", type: "toggle", label: "에어컨 있음", hint: "여름철 냉방이 가능한가요?" },
      { key: "heatingWeak", type: "toggle", label: "난방 취약", hint: "겨울철 난방이 부담되거나 어렵나요?" },
    ],
  },
  {
    title: "건강·생활 조건",
    fields: [
      { key: "alone", type: "toggle", label: "혼자 거주", selfHint: "현재 혼자 지내시나요?", guardianHint: "가족이 혼자 지내시나요?" },
      { key: "healthRisk", type: "toggle", label: "건강 취약", hint: "기저질환·호흡기 질환 등이 있나요?" },
      { key: "hasCar", type: "toggle", label: "차량 보유", hint: "이동·침수 대비에 반영됩니다" },
      { key: "hasPet", type: "toggle", label: "반려동물", hint: "대피·강풍 대비에 반영됩니다" },
    ],
  },
  {
    title: "비상 연락",
    fields: [
      {
        key: "guardianNeeded",
        type: "toggle",
        selfLabel: "비상 연락 필요",
        guardianLabel: "보호자 연락 필요",
        selfHint: "위험 시 비상 연락이 필요한가요?",
        guardianHint: "위험 시 보호자 확인이 필요한가요?",
      },
    ],
  },
];
