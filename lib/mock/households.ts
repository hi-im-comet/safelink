import type { Household } from "@/lib/types";

// 사용자 앱과 연결된 가구 ID (도움 요청이 관리자 리스트로 전달되는 데모의 주인공).
export const USER_HOUSEHOLD_ID = "H-104";

// 전체 관리 가구 (상수 헤드라인)
export const TOTAL_HOUSEHOLDS = 240;

/**
 * 시연용 가구 데이터 (실제 DB 없음).
 * 재난 유형(hazard)별로 리스트가 바뀌도록 5개 유형에 걸쳐 구성했다.
 * 점수는 규칙 기반 산정을 가정한 시연 고정값.
 */
export const demoHouseholds: Household[] = [
  // ── 홍수·침수 (오늘 주 위험) ──────────────────────────────
  {
    id: "H-001", region: "햇살동", hazard: "flood", score: 94,
    ageInfo: "70대 · 독거", factors: ["반지하", "하천 인접", "침수주의"],
    actions: ["모래주머니 안내", "대피 문자 발송"],
    assignee: "김복지", status: "대기", dday: 0, needsSupport: true,
  },
  {
    id: "H-140", region: "물빛동", hazard: "flood", score: 90,
    ageInfo: "80대 · 독거", factors: ["반지하 독거", "이동 어려움"],
    actions: ["사전 대피 안내", "방문 확인"],
    assignee: "이생활", status: "방문예정", dday: 0,
  },
  {
    id: "H-076", region: "노을동", hazard: "flood", score: 84,
    ageInfo: "50대", factors: ["1층 거주", "차량 보유", "배수 취약"],
    actions: ["차량 이동 안내", "배수구 점검"],
    assignee: "박돌봄", status: "대기", dday: 0, needsSupport: true,
  },
  {
    id: "H-233", region: "참샘동", hazard: "flood", score: 77,
    ageInfo: "60대 · 노약자 동거", factors: ["하천 인접", "노약자 동거"],
    actions: ["대피소 안내"],
    assignee: "정나눔", status: "전화중", dday: 0,
  },
  {
    id: "H-058", region: "푸른동", hazard: "flood", score: 62,
    ageInfo: "40대", factors: ["저지대", "차량 보유"],
    actions: ["행동요령 안내"],
    assignee: "최안전", status: "대기", dday: 1,
  },

  // ── 폭염 ────────────────────────────────────────────────
  {
    id: "H-072", region: "물빛동", hazard: "heat", score: 88,
    ageInfo: "60대 · 독거", factors: ["고령자", "에어컨 없음"],
    actions: ["전화 확인", "무더위쉼터 안내"],
    assignee: "김복지", status: "대기", dday: 0, needsSupport: true,
  },
  {
    id: "H-191", region: "햇살동", hazard: "heat", score: 82,
    ageInfo: "70대 · 독거", factors: ["독거 고령", "최상층 복사열"],
    actions: ["전화 확인", "차광막 지원 검토"],
    assignee: "이생활", status: "전화중", dday: 0, needsSupport: true,
  },
  {
    id: "H-260", region: "참샘동", hazard: "heat", score: 68,
    ageInfo: "60대", factors: ["노후주택", "냉방비 부담"],
    actions: ["냉방비 상담"],
    assignee: "박돌봄", status: "지원검토", dday: 2, needsSupport: true,
  },
  {
    id: "H-047", region: "노을동", hazard: "heat", score: 55,
    ageInfo: "60대", factors: ["고령", "오후 재택"],
    actions: ["사전 냉방 안내"],
    assignee: "정나눔", status: "대기", dday: 1,
  },
  {
    // 사용자 앱과 연결된 가구 — 도움 요청이 들어오면 상단으로 올라온다.
    id: "H-104", region: "푸른동", hazard: "heat", score: 46,
    ageInfo: "30대", factors: ["원룸", "오후 재택"],
    actions: ["행동요령 안내"],
    assignee: null, status: "대기", dday: 0, isUser: true,
  },

  // ── 한파 ────────────────────────────────────────────────
  {
    id: "H-038", region: "별하동", hazard: "cold", score: 85,
    ageInfo: "80대 · 독거", factors: ["독거 고령자", "난방비 부담"],
    actions: ["한파 안부 확인", "난방비 상담"],
    assignee: "김복지", status: "대기", dday: 0, needsSupport: true,
  },
  {
    id: "H-112", region: "바람골", hazard: "cold", score: 80,
    ageInfo: "70대", factors: ["노후주택", "동파 위험"],
    actions: ["동파 예방 안내", "방문 점검"],
    assignee: "최안전", status: "방문예정", dday: 0,
  },
  {
    id: "H-205", region: "참샘동", hazard: "cold", score: 74,
    ageInfo: "70대 · 독거", factors: ["독거", "건강 취약"],
    actions: ["안부 확인"],
    assignee: "정나눔", status: "전화중", dday: 0,
  },
  {
    id: "H-089", region: "물빛동", hazard: "cold", score: 63,
    ageInfo: "60대", factors: ["난방 취약", "고령"],
    actions: ["난방 점검 안내"],
    assignee: "이생활", status: "대기", dday: 1,
  },
  {
    id: "H-024", region: "햇살동", hazard: "cold", score: 48,
    ageInfo: "50대", factors: ["단독주택"],
    actions: ["행동요령 안내"],
    assignee: "박돌봄", status: "대기", dday: 2,
  },

  // ── 미세먼지 ────────────────────────────────────────────
  {
    id: "H-105", region: "푸른동", hazard: "dust", score: 86,
    ageInfo: "60대 · 호흡기 질환", factors: ["호흡기 질환", "미세먼지 고위험", "고령"],
    actions: ["긴급 외출 자제 안내", "마스크·공기청정기 지원", "전화 확인"],
    assignee: "김복지", status: "대기", dday: 0, needsSupport: true,
  },
  {
    id: "H-166", region: "별하동", hazard: "dust", score: 72,
    ageInfo: "어린이 동거", factors: ["어린이 동거", "환기 주의"],
    actions: ["실내 공기 관리 안내"],
    assignee: "정나눔", status: "전화중", dday: 0,
  },
  {
    id: "H-201", region: "노을동", hazard: "dust", score: 66,
    ageInfo: "60대 · 실외근무", factors: ["고령", "실외근무"],
    actions: ["외출 자제 안내"],
    assignee: "최안전", status: "대기", dday: 1,
  },
  {
    id: "H-093", region: "물빛동", hazard: "dust", score: 58,
    ageInfo: "40대", factors: ["호흡기 주의"],
    actions: ["행동요령 안내"],
    assignee: "이생활", status: "대기", dday: 1,
  },
  {
    id: "H-137", region: "참샘동", hazard: "dust", score: 44,
    ageInfo: "30대", factors: ["일반 가구"],
    actions: ["일반 안내"],
    assignee: "박돌봄", status: "완료", dday: 0,
  },

  // ── 태풍·강풍 ───────────────────────────────────────────
  {
    id: "H-211", region: "바람골", hazard: "wind", score: 83,
    ageInfo: "70대", factors: ["노후주택", "강풍 취약"],
    actions: ["창문 고정 안내", "간판·낙하물 점검"],
    assignee: "김복지", status: "대기", dday: 0, needsSupport: true,
  },
  {
    id: "H-178", region: "노을동", hazard: "wind", score: 76,
    ageInfo: "50대 · 고층", factors: ["고층 거주", "노후 창문"],
    actions: ["창가 물건 정리 안내"],
    assignee: "최안전", status: "방문예정", dday: 0,
  },
  {
    id: "H-042", region: "해안동", hazard: "wind", score: 71,
    ageInfo: "60대 · 반려동물", factors: ["해안 인접", "반려동물"],
    actions: ["대피 안내"],
    assignee: "정나눔", status: "전화중", dday: 0,
  },
  {
    id: "H-119", region: "참샘동", hazard: "wind", score: 60,
    ageInfo: "40대", factors: ["차량 보유", "강풍 주의"],
    actions: ["차량 안전 안내"],
    assignee: "이생활", status: "대기", dday: 1,
  },
  {
    id: "H-085", region: "푸른동", hazard: "wind", score: 45,
    ageInfo: "30대", factors: ["아파트 중층"],
    actions: ["행동요령 안내"],
    assignee: "박돌봄", status: "대기", dday: 2,
  },
];
