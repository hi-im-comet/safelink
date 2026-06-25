import type { UserProfile } from "@/lib/types";

// 사용자 시나리오 — 남서향 원룸 거주자 (PDF 예시 1)
export const USER_PROFILE: UserProfile = {
  household: "원룸",
  direction: "남서향",
  floor: "중층",
  ac: true,
  costBurden: "보통",
  pattern: "오후에 재택",
};

// 오늘의 위험도 (사용자 본인) — 규칙 엔진 결과를 그대로 사용.
export const USER_TODAY = {
  score: 55,
  headline: "오후 1시~4시, 남서향 직사광으로 실내 온도가 크게 오를 수 있어요.",
};

// 오늘의 행동계획 — 시간 블록별. 블록마다 1~2개 짧은 행동만.
export const ACTION_PLAN: { block: string; time: string; items: string[] }[] = [
  { block: "오전", time: "6~11시", items: ["창문을 열어 환기를 마치세요.", "기온이 오르기 전 집 안의 열을 빼주세요."] },
  { block: "점심 전", time: "11~12시", items: ["커튼·블라인드를 닫아 직사광을 막으세요."] },
  {
    block: "오후 피크",
    time: "1~4시",
    items: ["짧게 사전 냉방하고 선풍기와 함께 쓰세요.", "도서관·카페·학교 등 시원한 실내공간을 이용하세요."],
  },
  { block: "저녁", time: "5~8시", items: ["실내 온도가 내려가면 다시 환기하세요."] },
  { block: "밤", time: "9시 이후", items: ["열대야 대비, 취침 전 적정 온도로 짧게 냉방하세요."] },
];

// 내 주거환경 고정 프로필 기본값 (남서향 원룸 시나리오)
export const PROFILE_DEFAULT: Record<string, string> = {
  // 공통 집 정보
  household: "원룸",
  direction: "남서향",
  floor: "중층",
  buildingAge: "보통",
  insulation: "보통",
  windowSize: "큼",
  vent: "보통",
  sealing: "보통",
  // 생활패턴
  lifeRhythm: "낮 활동",
  dayStay: "오후 오래",
  sleepTime: "밤",
  outdoor: "보통",
  hotHome: "자주",
  // 폭염
  ac: "벽걸이",
  fan: "있음",
  curtain: "일반",
  cost: "보통",
  heatSensitivity: "많이 타는 편",
  // 한파
  heating: "개별난방",
  heatingCost: "보통",
  coldSensitivity: "보통",
  // 침수
  lowland: "아니오",
  drainage: "보통",
  entryHeight: "비슷함",
  floodExp: "없음",
  // 공기질
  airPurifier: "없음",
  filterStatus: "보통",
};

// 보호자 모드 — 부모님 집 정보 기본값 (오래된 아파트 · 독거 고령)
export const CAREGIVER_PROFILE_DEFAULT: Record<string, string> = {
  household: "아파트",
  direction: "남향",
  floor: "중층",
  buildingAge: "노후",
  insulation: "약함",
  windowSize: "보통",
  vent: "보통",
  sealing: "틈새 있음",
  lifeRhythm: "낮 활동",
  dayStay: "종일 재택",
  sleepTime: "밤",
  outdoor: "적음",
  hotHome: "거의 항상",
  ac: "벽걸이",
  fan: "있음",
  curtain: "일반",
  cost: "높음",
  heatSensitivity: "매우 힘든 편",
  heating: "전기장판 중심",
  heatingCost: "높음",
  coldSensitivity: "많이 타는 편",
  lowland: "아니오",
  drainage: "보통",
  entryHeight: "비슷함",
  floodExp: "없음",
  airPurifier: "없음",
  filterStatus: "약함",
};

// 마이페이지 — 건강/비상/돌봄 정보 기본값 (주거설정이 아니라 여기서 관리)
export const USER_INFO_DEFAULT: Record<string, string> = {
  // 기본 정보
  name: "",
  birth: "",
  gender: "",
  blood: "확실하지 않아요",
  rh: "확실하지 않아요",
  phone: "",
  // 위치 정보 (상세주소는 LLM에 전달하지 않음)
  regionSi: "인천 미추홀구",
  regionDong: "",
  visitAddress: "",
  // 건강 정보 (목록은 쉼표로 join하여 배열처럼 저장)
  chronic: "없음",
  conditions: "",
  conditionCategory: "",
  disability: "없음",
  disabilityType: "",
  mobility: "가능",
  meds: "없음",
  medications: "",
  hospital: "",
  hospitalPhone: "",
  allergy: "",
  // 비상 연락
  guardianName: "",
  guardianRel: "",
  guardianPhone: "",
  guardian2Phone: "",
  guardianReach: "가능",
  cohabitName: "",
  cohabitPhone: "",
  emergencyPriority: "보호자 → 119",
  // 생활/돌봄
  alone: "아니오",
  helperCohabit: "예",
  checkCycle: "주 1회",
  contactTime: "저녁",
  careService: "미이용",
};

// 보호자 모드 — 부모님(어머니) 건강/돌봄 정보 (위험도 계산용)
export const CAREGIVER_INFO: Record<string, string> = {
  birth: "1953",
  chronic: "있음",
  conditions: "고혈압,당뇨",
  disability: "없음",
  disabilityType: "",
  mobility: "불편",
  meds: "있음",
  medications: "혈압약",
  alone: "예",
  helperCohabit: "아니오",
  guardianReach: "가능",
  checkCycle: "2주 1회",
};

// 생년월일 → 고령 여부 (65세 이상)
export function isElderly(birth?: string): boolean {
  const m = (birth ?? "").match(/(19|20)\d{2}/);
  if (!m) return false;
  return 2026 - parseInt(m[0], 10) >= 65;
}

// 위험도 핵심 사유 한 줄 (프로필 기반)
export function buildUserReason(p: Record<string, string> = PROFILE_DEFAULT): string {
  const v = { ...PROFILE_DEFAULT, ...(p ?? {}) };
  const stay = v.dayStay.includes("재택") || v.dayStay.includes("오래") ? "오후 재택" : v.dayStay;
  return `${v.direction} ${v.household}, ${stay}, 냉방비 부담 ${v.cost} 기준으로 오후 1시~4시 실내 과열 가능성이 큽니다.`;
}

// 예상 효과
export const EXPECTED_EFFECTS = [
  "실내 과열 시간 감소",
  "전기요금 부담 감소",
  "냉방 피크 시간대 전력 낭비 감소",
];

// 보호자/가족 안내 (PDF 예시 2)
export const GUARDIAN = {
  relation: "부모님 (70대 · 혼자 거주)",
  housing: "오래된 아파트 · 냉방비 부담 높음",
  lastCheck: "5일 전",
  headline: "오늘은 안부 확인이 필요한 날이에요.",
  steps: [
    "오후 12시 전 전화로 냉방기 사용 여부를 확인하세요.",
    "냉방비 부담 때문에 에어컨을 참는지 확인하세요.",
    "무더위쉼터 위치를 안내하세요.",
    "어지러움·두통·메스꺼움이 있으면 즉시 도움을 요청하도록 안내하세요.",
  ],
};

// 도움 요청 버튼 (PDF)
export const HELP_OPTIONS = [
  { key: "hot", label: "너무 더워요", hint: "실내가 견디기 어려워요" },
  { key: "cost", label: "냉방비가 부담돼요", hint: "에어컨 사용이 망설여져요" },
  { key: "visit", label: "방문 확인이 필요해요", hint: "직접 와서 봐주세요" },
  { key: "shelter", label: "무더위쉼터를 알고 싶어요", hint: "가까운 곳을 안내받을게요" },
] as const;
