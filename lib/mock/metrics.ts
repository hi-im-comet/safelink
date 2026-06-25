import type { Metrics } from "@/lib/types";

// LLM 효율 지표 (PDF 기준 baseline). 화면에서 실제 생성 호출이 일어나면
// AppState가 llmCalls를 더해 라이브로 갱신한다.
export const BASE_METRICS: Metrics = {
  analyzed: 240,
  ruleBased: 240,
  docRequests: 26, // 문서 생성 요청 = Bedrock 호출 19 + 캐시 재사용 7
  llmCalls: 19,
  noLlmRate: 92.1,
  cacheReuse: 7,
  avgTokens: 218,
};

// LLM을 쓰지 않는 영역 / 쓰는 영역 (저전력 전략을 화면으로 설명)
export const LLM_USAGE = {
  ruleOnly: [
    "날씨 API 조회",
    "위험도 계산",
    "우선순위 정렬",
    "사용자 상태 저장",
    "업무 배정",
    "지원물품 재고",
    "기본 행동요령 매칭",
  ],
  llmOnly: [
    "위험 요인 쉬운 말 설명",
    "맞춤 행동계획 작성",
    "복지사 전화 스크립트",
    "방문 체크리스트",
    "보호자 알림 문안",
    "일일 폭염 대응 보고서",
  ],
};

// 일일 폭염 대응 보고서 (요약 카드용)
export const DAILY_REPORT = {
  date: "2026-06-24",
  weather: "폭염경보 · 낮 최고 37도 / 체감 40도",
  handled: {
    calls: 14,
    visits: 5,
    support: 7,
    shelterGuide: 22,
  },
  highlight:
    "도움 요청 2건이 오전 중 접수되어 즉시 우선 배정되었고, 반지하·최상층 가구 7곳에 냉방용품 지원을 검토했습니다.",
  carbon:
    "차광·사전냉방·냉방범위 축소 안내로 불필요한 냉방을 줄이고, 규칙 엔진으로 LLM 호출을 19건으로 억제했습니다.",
};

// AI/LLM 사용 구조 (3계층) — 서비스 소개 페이지와 관리자 보고서에서 공통 사용
export const AI_STRUCTURE = [
  {
    tier: "위험도 계산",
    mode: "코드 기반",
    note: "규칙 엔진이 점수·등급·우선순위를 계산. 반복 판단에 LLM을 쓰지 않습니다.",
    tone: "green",
  },
  {
    tier: "이미지 분석",
    mode: "선택적 AI 비전",
    note: "창 사진을 올리면 창 크기·가림·채광을 보조 파악. 선택 기능입니다.",
    tone: "mint",
  },
  {
    tier: "문서 생성",
    mode: "LLM 사용",
    note: "행동계획·전화 스크립트·방문 체크리스트·보고서 등 문서 작성에만 사용.",
    tone: "lime",
  },
] as const;

// 저전력 원칙 요약 (소개 페이지)
export const LOW_POWER_PRINCIPLES = [
  "위험도 계산은 코드가 담당합니다.",
  "반복되는 판단에는 LLM을 쓰지 않습니다.",
  "같은 조건의 문서는 캐시·템플릿을 먼저 사용합니다.",
  "꼭 필요한 경우에만 AI를 호출합니다.",
];

// 향후 확장 가능한 기후재난 모듈 (MVP는 폭염만)
export const EXPANSION_MODULES = [
  { key: "heat", name: "폭염", status: "운영 중", note: "최고기온·체감온도·냉방 접근성" },
  { key: "cold", name: "한파", status: "향후 확장", note: "최저기온·난방비·동파 위험" },
  { key: "flood", name: "홍수·침수", status: "향후 확장", note: "강수량·반지하·대피소 접근성" },
  { key: "dust", name: "미세먼지·산불연기", status: "향후 확장", note: "농도·호흡기 질환·실내 공기질" },
];
