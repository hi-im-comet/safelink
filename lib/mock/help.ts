// 도움 요청 — "해결 가능한 조치" 중심. 사용자 모드(본인)와 보호자 모드(부모님 대신)는
// 항목 문구와 태그가 다르다.
export interface HelpCategory {
  key: string;
  label: string;
  tag: string;
  items: string[];
}

// 사용자 모드 — 본인이 직접 요청
export const HELP_CATEGORIES: HelpCategory[] = [
  {
    key: "emergency",
    label: "응급 증상",
    tag: "응급 확인",
    items: ["어지러움·의식 저하·호흡 곤란 확인 요청", "119 전화 연결과 보호자 연락 필요"],
  },
  {
    key: "call",
    label: "전화 확인 요청",
    tag: "전화 확인",
    items: ["오늘 중 상태 확인 전화 요청", "냉방 상태 확인 전화 요청"],
  },
  {
    key: "visit",
    label: "방문 확인 요청",
    tag: "방문 확인",
    items: ["생활지원사 방문 확인 요청", "혼자 있어 현장 확인 요청"],
  },
  {
    key: "cooling",
    label: "냉방 지원 요청",
    tag: "냉방 지원",
    items: ["냉방비 지원 상담 요청", "냉방용품 지원 요청", "에어컨 고장 확인 요청", "선풍기 추가 지원 요청"],
  },
  {
    key: "shelter",
    label: "무더위쉼터 안내",
    tag: "쉼터 안내",
    items: ["가까운 무더위쉼터 위치 안내 요청", "쉼터 이동 지원 요청", "이용 가능한 공공 실내공간 안내 요청"],
  },
];

// 보호자 모드 — 부모님/가족을 대신 요청 (말투가 다르다)
export const CAREGIVER_HELP_CATEGORIES: HelpCategory[] = [
  {
    key: "emergency",
    label: "응급 증상",
    tag: "응급 확인",
    items: ["부모님 응급 증상 확인 요청", "119 전화 연결과 보호자 동시 연락 필요"],
  },
  {
    key: "call",
    label: "전화 확인 요청",
    tag: "안부 확인",
    items: ["오늘 중 부모님 안부 전화 요청", "연락 공백으로 상태 확인 전화 요청"],
  },
  {
    key: "visit",
    label: "방문 확인 요청",
    tag: "방문 검토",
    items: ["생활지원사 방문 확인 요청", "혼자 계셔 현장 확인 요청", "보호자 방문이 어려워 대리 확인 요청"],
  },
  {
    key: "cooling",
    label: "냉방 지원 요청",
    tag: "냉방 지원",
    items: ["냉방비 지원 상담 요청", "냉방용품 지원 요청", "에어컨 고장 여부 확인 요청", "선풍기 추가 지원 요청"],
  },
  {
    key: "shelter",
    label: "무더위쉼터 안내",
    tag: "쉼터 안내",
    items: ["가까운 무더위쉼터 위치 안내 요청", "쉼터 이동 지원 요청", "이용 가능한 공공 실내공간 안내 요청"],
  },
];

// 도움 요청 연락 대상 (설명은 모드별로 다르게 — descCaregiver)
export interface HelpContact {
  key: string;
  label: string;
  desc: string;
  descCaregiver?: string;
  tag: string;
  urgent?: boolean;
}
export const HELP_CONTACTS: HelpContact[] = [
  {
    key: "119",
    label: "119 긴급",
    desc: "어지러움, 의식 저하, 호흡 곤란 등 응급 상황",
    descCaregiver: "의식 저하, 호흡 곤란 등 즉시 응급 대응이 필요한 경우",
    tag: "응급 확인 필요",
    urgent: true,
  },
  {
    key: "gov",
    label: "지자체/복지센터",
    desc: "냉방비, 냉방용품, 무더위쉼터, 방문 지원",
    descCaregiver: "냉방비, 냉방용품, 무더위쉼터, 방문 지원 요청",
    tag: "지자체 요청",
  },
  { key: "guardian", label: "보호자", desc: "가족에게 알림", descCaregiver: "가족에게 함께 알림", tag: "보호자 알림" },
  { key: "worker", label: "생활지원사/관리자", desc: "등록 가구 확인 및 방문 요청", tag: "관리자 확인" },
];

// 태그 → 관리자 추천 조치 (mock)
export const ACTIONS_BY_TAG: Record<string, string[]> = {
  "응급 확인": ["즉시 전화 확인", "119 안내", "보호자 연락"],
  "전화 확인": ["오늘 중 전화 확인", "최근 연락 이력 확인"],
  "안부 확인": ["오늘 중 안부 전화 확인", "최근 연락 이력 확인"],
  "방문 확인": ["생활지원사 방문 배정", "최근 연락 이력 확인"],
  "방문 검토": ["생활지원사 방문 배정", "최근 연락 이력 확인"],
  "냉방 지원": ["냉방비 지원 상담", "냉방용품 재고 확인", "에너지바우처 안내"],
  "쉼터 안내": ["가까운 쉼터 안내", "이동 가능 여부 확인"],
};

// 선택 항목 → 태그 (활성 카테고리 기준 — 모드별 충돌 방지)
export function tagsFromItems(items: string[], categories: HelpCategory[]): string[] {
  return categories.filter((c) => c.items.some((it) => items.includes(it))).map((c) => c.tag);
}

// 태그 목록 → 추천 조치(중복 제거, 상위 6개)
export function actionsFromTags(tags: string[]): string[] {
  const out: string[] = [];
  for (const t of tags) for (const a of ACTIONS_BY_TAG[t] ?? []) if (!out.includes(a)) out.push(a);
  return out.slice(0, 6);
}
