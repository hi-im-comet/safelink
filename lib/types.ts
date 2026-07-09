// SafeLink AI — 공통 타입
// 위험도 등급은 80↑ 긴급 / 60~79 주의(전화·방문) / 40~59 안내 / 40↓ 관찰 기준.

/** 지원하는 생활재난 유형 */
export type Hazard = "heat" | "flood" | "cold" | "dust" | "wind";

export type Grade = "urgent" | "call" | "guide" | "monitor";

export type Status = "대기" | "전화중" | "방문예정" | "지원검토" | "완료";

/** 관리자 상태 필터 키 */
export type FilterKey = "all" | "highrisk" | "call" | "visit" | "support" | "done";

/** 도움 요청 출처 */
export type HelpSource = "user" | "guardian" | "system";

/** 사용자 앱 사용 모드 — 본인 안전 / 보호자 확인 */
export type UserMode = "self" | "guardian";

/**
 * 시연용 가구 데이터 (실제 DB 없음).
 * 각 가구는 하나의 주요 재난 유형에 속하며, 재난 유형을 바꾸면 리스트가 바뀐다.
 */
export interface Household {
  id: string; // H-001 ...
  region: string; // 동네
  hazard: Hazard; // 이 가구의 주요 재난 유형
  score: number; // 위험 점수 0~100 (시연용 고정값)
  ageInfo: string; // "70대 · 독거" 같은 요약
  factors: string[]; // 주요 취약 조건
  actions: string[]; // 필요한 조치
  assignee: string | null; // 담당자
  status: Status;
  dday: number; // D-day (0 이하이면 오늘 처리 필요)
  needsSupport?: boolean; // 지원 검토 필요
  helpRequested?: boolean; // 사용자/보호자 도움 요청 → 최상단
  requestedAt?: string | null; // 요청 시각(ISO)
  helpReasons?: string[]; // 요청 사유
  helpSource?: HelpSource; // 요청 출처
  isUser?: boolean; // 사용자 앱과 연결된 가구
}

/**
 * 사용자가 직접 입력하는 본인/가족 정보. localStorage에만 저장된다.
 * 로그인·서버 전송 없음.
 */
export interface UserProfile {
  name: string; // 이름 또는 별칭 (보호자 모드에서는 등록 가족의 이름)
  relation?: string; // 보호자 모드: 관계(부모님/조부모/가족/지인)
  ageBand: string; // 연령대
  region: string; // 동네
  housing: string; // 아파트 / 단독주택 / 반지하 / 1층 / 고층
  alone: boolean; // 혼자 거주
  healthRisk: boolean; // 건강 취약(기저질환·호흡기 등)
  hasAc: boolean; // 에어컨 있음
  heatingWeak: boolean; // 난방 취약
  hasCar: boolean; // 차량 보유
  hasPet: boolean; // 반려동물
  guardianNeeded: boolean; // 보호자 연락 필요
}

/** 규칙 기반 위험 분석 결과 (사용자 앱) */
export interface RiskAssessment {
  hazard: Hazard;
  score: number; // 0~100
  grade: Grade;
  tags: string[]; // 위험 태그
  description: string; // 쉬운 설명 문장
  checklist: string[]; // 오늘 해야 할 일
  breakdown: { label: string; value: number }[]; // 점수 구성
}
