// 사용자 입력 폼 구성 + 기본값. 로그인 없이 localStorage에만 저장된다.
import type { HealthInfo, UserMode, UserProfile } from "@/lib/types";
import {
  BLOOD_TYPES,
  CAN_EVAC_OPTIONS,
  CONTACT_PREF_OPTIONS,
  DISEASE_OPTIONS,
  HAVING_OPTIONS,
  MED_STORAGE_OPTIONS,
  MEDICAL_DEVICE_OPTIONS,
  MOBILITY_STATUS_OPTIONS,
  SENSORY_OPTIONS,
  SUPPORT_OPTIONS,
  SYMPTOM_OPTIONS,
  YESNO_OPTIONS,
} from "@/lib/health";

export const AGE_BANDS = ["10대 이하", "20~30대", "40~50대", "60대", "70대", "80대 이상"];
export const HOUSING_TYPES = ["아파트", "단독주택", "반지하", "1층", "고층"];
export const RELATIONS = ["부모님", "조부모", "가족", "지인"];

// 선택입력 건강·응급 정보의 기본값(미입력) — 새 필드가 없는 기존 프로필과의 호환용
export const EMPTY_HEALTH = {
  disabilityStatus: "",
  disabilityDetail: "",
  mobilitySupportNeeded: "",
  mobilityStatus: "",
  evacuationHelpNeeded: "",
  elevatorDependency: "",
  canEvacuateAlone: "",
  mobilityMemo: "",
  communicationSupportNeeded: "",
  contactPreference: "",
  sensorySupport: [],
  communicationMemo: "",
  chronicDiseases: [],
  diseaseDetail: "",
  recentSymptoms: [],
  medicationStatus: "",
  medications: "",
  medStorage: "",
  allergyStatus: "",
  allergies: "",
  medicalDevices: [],
  bloodType: "",
  hospitalName: "",
  emergencyMemo: "",
  evacuationKit: "",
} satisfies Required<HealthInfo>;

// 데모용 기본 예시 = "샘플 정보로 체험하기" 값 (입력 화면에서 자유롭게 수정 가능)
export const DEMO_PROFILE_SELF: UserProfile = {
  name: "나",
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
  // 건강·응급 정보: 대부분 미입력/없음 (선택입력임을 보여주는 예시)
  ...EMPTY_HEALTH,
  mobilityStatus: "independent",
  evacuationHelpNeeded: "no",
  communicationSupportNeeded: "no",
  chronicDiseases: ["none"],
  medicationStatus: "no",
  allergyStatus: "",
  bloodType: "",
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
  // 건강·응급 정보 일부 입력된 예시
  ...EMPTY_HEALTH,
  mobilityStatus: "stairs",
  evacuationHelpNeeded: "yes",
  canEvacuateAlone: "hard",
  communicationSupportNeeded: "no",
  contactPreference: "guardian",
  chronicDiseases: ["hypertension", "diabetes"],
  medicationStatus: "yes",
  medications: "혈압약, 당뇨약",
  allergyStatus: "unknown",
  bloodType: "unknown",
  hospitalName: "햇살동 내과",
  evacuationKit: "약 3일치, 처방전",
  emergencyMemo: "전화가 안 되면 보호자에게 먼저 연락 필요",
};

export function defaultProfile(mode: UserMode): UserProfile {
  return mode === "guardian" ? { ...DEMO_PROFILE_GUARDIAN } : { ...DEMO_PROFILE_SELF };
}

/* ── 폼 구성 (섹션으로 분리) ─────────────────────────────── */
// keychips: 키/라벨 단일 선택 · multichips: 키/라벨 다중 선택(칩) · textarea: 여러 줄 입력
export type FieldType = "text" | "textarea" | "chips" | "keychips" | "multichips" | "toggle";

export interface FormField {
  key: keyof UserProfile;
  type: FieldType;
  label?: string;
  selfLabel?: string;
  guardianLabel?: string;
  options?: string[]; // chips(문자열)
  keyOptions?: { key: string; label: string }[]; // keychips / multichips
  placeholder?: string;
  selfPlaceholder?: string;
  guardianPlaceholder?: string;
  hint?: string;
  selfHint?: string;
  guardianHint?: string;
  guardianOnly?: boolean;
  rows?: number; // textarea
}

// 카드 내부 소제목 묶음 (건강·응급 지원 정보 섹션에서 사용)
export interface FormGroup {
  title: string;
  fields: FormField[];
}

export interface FormSection {
  title?: string;
  selfTitle?: string;
  guardianTitle?: string;
  note?: string;
  selfNote?: string;
  guardianNote?: string;
  badge?: string; // 예: "선택입력"
  notice?: string; // 섹션 하단 민감정보 안내
  collapsible?: boolean; // 상세 응급 정보 펼치기/접기
  fields?: FormField[]; // 평면 필드
  groups?: FormGroup[]; // 소제목 묶음
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
    selfTitle: "내 건강·응급 지원 정보",
    guardianTitle: "가족 건강·응급 지원 정보",
    selfNote: "선택입력 항목입니다. 입력한 경우 위험도 분석과 도움 요청 문구에 함께 반영됩니다.",
    guardianNote: "선택입력 항목입니다. 입력한 경우 위험도 분석과 도움 요청 문구에 함께 반영됩니다.",
    badge: "선택입력",
    collapsible: true,
    notice:
      "건강·장애·복용약 등 민감정보는 선택입력입니다. 입력하지 않아도 서비스를 이용할 수 있습니다. 입력한 정보는 현재 브라우저에만 저장되며 서버로 전송되지 않습니다.",
    groups: [
      {
        title: "이동·대피 지원",
        fields: [
          { key: "mobilityStatus", type: "keychips", selfLabel: "내 이동 상태", guardianLabel: "가족의 이동 상태", keyOptions: MOBILITY_STATUS_OPTIONS },
          { key: "evacuationHelpNeeded", type: "keychips", label: "대피 시 도움 필요", keyOptions: SUPPORT_OPTIONS },
          { key: "elevatorDependency", type: "keychips", label: "엘리베이터 없으면 이동 어려움", keyOptions: YESNO_OPTIONS },
          { key: "canEvacuateAlone", type: "keychips", label: "혼자 대피 가능 여부", keyOptions: CAN_EVAC_OPTIONS },
          {
            key: "mobilityMemo",
            type: "textarea",
            selfLabel: "내가 대피할 때 필요한 도움",
            guardianLabel: "가족이 대피할 때 필요한 도움",
            placeholder: "예: 계단 이동 어려움, 휠체어 이용, 보행기 사용, 장시간 보행 어려움",
            rows: 2,
          },
        ],
      },
      {
        title: "의사소통·인지 지원",
        fields: [
          { key: "communicationSupportNeeded", type: "keychips", label: "의사소통 도움 필요", keyOptions: SUPPORT_OPTIONS },
          { key: "contactPreference", type: "keychips", label: "연락 선호 방식", keyOptions: CONTACT_PREF_OPTIONS },
          { key: "sensorySupport", type: "multichips", label: "감각·소통 지원", keyOptions: SENSORY_OPTIONS },
          {
            key: "communicationMemo",
            type: "textarea",
            label: "의사소통 메모",
            placeholder: "예: 전화보다 문자를 선호함, 큰 글씨 안내 필요, 보호자에게 먼저 연락 필요",
            rows: 2,
          },
        ],
      },
      {
        title: "주요 질환·건강 상태",
        fields: [
          { key: "chronicDiseases", type: "multichips", selfLabel: "내 주요 질환", guardianLabel: "가족의 주요 질환", keyOptions: DISEASE_OPTIONS },
          { key: "diseaseDetail", type: "textarea", label: "질환 상세 메모", placeholder: "예: 3년 전 진단, 정기 통원 중", rows: 2 },
          { key: "recentSymptoms", type: "multichips", label: "최근 주의 증상", keyOptions: SYMPTOM_OPTIONS },
        ],
      },
      {
        title: "복용약·알레르기",
        fields: [
          { key: "medicationStatus", type: "keychips", label: "복용약 있음 여부", keyOptions: HAVING_OPTIONS },
          { key: "medications", type: "textarea", selfLabel: "내 복용약", guardianLabel: "가족의 복용약", placeholder: "예: 혈압약, 당뇨약, 흡입기, 이뇨제, 냉장 보관 약 있음", rows: 2 },
          { key: "medStorage", type: "keychips", label: "약 보관 주의", keyOptions: MED_STORAGE_OPTIONS },
          { key: "allergyStatus", type: "keychips", label: "알레르기 있음 여부", keyOptions: HAVING_OPTIONS },
          { key: "allergies", type: "textarea", selfLabel: "내 알레르기", guardianLabel: "가족의 알레르기", placeholder: "예: 페니실린, 해산물, 땅콩, 벌 알레르기", rows: 2 },
          { key: "medicalDevices", type: "multichips", label: "의료기기 사용 여부", keyOptions: MEDICAL_DEVICE_OPTIONS },
        ],
      },
      {
        title: "응급 참고 정보",
        fields: [
          { key: "bloodType", type: "keychips", selfLabel: "내 혈액형", guardianLabel: "가족의 혈액형", keyOptions: BLOOD_TYPES },
          { key: "hospitalName", type: "text", label: "주 이용 병원 또는 기관", placeholder: "예: ○○의원, ○○복지관" },
          {
            key: "emergencyMemo",
            type: "textarea",
            selfLabel: "내 응급 메모",
            guardianLabel: "가족 응급 메모",
            placeholder: "예: 더위에 취약함, 혼자 계실 때 전화 확인 필요, 계단 이동 어려움",
            rows: 2,
          },
          {
            key: "evacuationKit",
            type: "textarea",
            label: "대피 시 꼭 챙길 것",
            placeholder: "예: 약 3일치, 처방전, 보청기, 안경, 휠체어 충전기, 반려동물 이동장",
            rows: 2,
          },
        ],
      },
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
