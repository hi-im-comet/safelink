// 보호자 앱 — 부모님/가족 대상자 정보 (PDF 예시 2)
export const GUARDIAN_TARGET = {
  relation: "어머니",
  ageBand: "70대",
  living: "혼자 거주",
  housing: "오래된 아파트",
  costBurden: "높음",
  lastCheck: "5일 전",
  riskLabel: "높음",
};

// 보호자 모드 위험도 핵심 사유 한 줄
export const CAREGIVER_REASON =
  "오래된 아파트, 혼자 거주, 냉방비 부담 높음, 최근 안부 확인 5일 전 기준으로 오늘 안부 확인이 필요합니다.";

// 오늘 보호자에게 권장하는 행동
export const GUARDIAN_ACTIONS = [
  "오후 12시 이전 전화로 안부를 확인하세요.",
  "냉방기를 사용하고 있는지 확인하세요.",
  "냉방비 부담 때문에 에어컨을 참고 있는지 확인하세요.",
  "무더위쉼터 위치를 안내하세요.",
  "두통·어지러움·메스꺼움이 있는지 확인하세요.",
];

// 가까운 무더위쉼터 (mock)
export const SHELTERS = [
  { name: "참샘1동 행정복지센터 1층", walk: "도보 4분" },
  { name: "참샘노인복지관 경로당", walk: "도보 7분" },
  { name: "참샘도서관 휴게실", walk: "도보 9분" },
];

// 보호자 도움 요청 사유
export const GUARDIAN_HELP_OPTIONS = [
  { key: "no-answer", label: "연락이 안 돼요", hint: "전화를 받지 않으세요" },
  { key: "too-hot", label: "집이 너무 더운 것 같아요", hint: "냉방이 부족해 보여요" },
  { key: "cost", label: "냉방비를 걱정하세요", hint: "에어컨을 참고 계세요" },
  { key: "visit", label: "방문 확인이 필요해요", hint: "직접 가보기 어려워요" },
] as const;
