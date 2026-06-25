// CoolLink AI — 공통 타입
// 위험도 등급은 PDF 기준(80↑ 긴급 / 60~79 전화·방문 / 40~59 안내 / 40↓ 모니터링)

export type Grade = "urgent" | "call" | "guide" | "monitor";

export type Status = "대기" | "전화중" | "방문예정" | "지원검토" | "완료";

/** 관리자 필터 키 */
export type FilterKey = "all" | "highrisk" | "call" | "visit" | "support" | "done";

/** 위험도 구성요소 (날씨는 지역 공통값이라 별도) */
export interface RiskComponents {
  /** 개인 취약도 0~100 */
  personal: number;
  /** 주거·냉방 위험도 0~100 */
  housing: number;
  /** 돌봄 공백·도움 요청 0~100 */
  care: number;
}

export interface HousingProfile {
  type: string; // 거주 형태: 원룸/아파트/단독주택 ...
  direction: string; // 방향: 남서향 ...
  floor: string; // 층수: 반지하/저층/중층/최상층 ...
  ac: boolean; // 에어컨 보유
  costBurden: "낮음" | "보통" | "높음"; // 전기요금/냉방비 부담
  pattern: string; // 생활패턴: 오후에 재택 ...
  age?: string; // 노후 정도
}

export interface Resident {
  ageBand: string; // 연령대: 70대 ...
  alone: boolean; // 독거 여부
  condition?: string; // 기저질환 등
}

export interface Household {
  id: string; // H-001 ...
  region: string; // 행정동
  resident: Resident;
  housing: HousingProfile;
  components: RiskComponents;
  factors: string[]; // 위험 요인
  recommendedActions: string[]; // 추천 조치
  assignee: string | null; // 담당자
  status: Status;
  lastContactDays: number; // 마지막 연락/방문 후 경과일
  needsSupport?: boolean; // 지원물품(쿨매트/차광막 등) 검토 필요
  helpRequested?: boolean; // 도움 요청 들어옴 → 최상단
  requestedAt?: string | null; // 요청 시각(ISO) — 최신순 정렬
  helpReasons?: string[]; // 사용자가 누른 도움 사유 (세부 항목)
  helpTags?: string[]; // 요청 사유 태그 (관리자 리스트 표시용)
  helpContactTag?: string; // 요청 대상 태그 (지자체/응급/보호자 알림 등)
  helpSource?: HelpSource; // 요청 출처 (사용자/보호자/시스템)
  isUser?: boolean; // 사용자 모바일 앱과 연결된 가구
}

/** 도움 요청 출처 */
export type HelpSource = "user" | "guardian" | "system";

/** computeRisk 결과 */
export interface RiskResult {
  score: number; // 0~100 최종 위험도
  grade: Grade;
  breakdown: {
    weather: { weight: number; value: number; weighted: number };
    personal: { weight: number; value: number; weighted: number };
    housing: { weight: number; value: number; weighted: number };
    care: { weight: number; value: number; weighted: number };
  };
}

export interface TodayWeather {
  highTemp: number;
  feelsLike: number;
  humidity: number; // 습도 %
  alert: string; // 폭염경보 등
  nightHeat: boolean; // 야간 고온 지속
  score: number; // 날씨 위험도 0~100
  summary: string;
}

export interface ActionLog {
  id: string;
  householdId: string;
  at: string; // ISO
  result: string; // 조치 결과 (전화완료/방문완료 ...)
  note: string;
  nextVisit?: string;
  by: string;
}

export interface LlmCall {
  id: string;
  at: string;
  type: "phone_script" | "visit_checklist" | "action_plan" | "report" | "guardian_msg";
  householdId?: string;
  tokens: number;
  cached: boolean;
}

export interface UserProfile {
  household: string; // 거주 형태
  direction: string;
  floor: string;
  ac: boolean;
  costBurden: "낮음" | "보통" | "높음";
  pattern: string;
}

export interface Metrics {
  analyzed: number; // 전체 위험 분석 (규칙 기반)
  ruleBased: number; // 규칙 기반 처리
  docRequests: number; // 문서 생성 요청 (= Bedrock 호출 + 캐시 재사용)
  llmCalls: number; // 실제 Bedrock(LLM) 호출
  noLlmRate: number; // LLM 미사용 처리율 (%)
  cacheReuse: number; // 캐시 재사용
  avgTokens: number; // 평균 출력 토큰
}
