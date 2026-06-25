// LLM이 담당하는 영역 = 문서 생성뿐.
// 위험도/우선순위는 규칙 엔진이 끝냈고, 여기서는 복지사가 바로 쓸 텍스트만 만든다.
// (백엔드 연결 전이라 템플릿으로 생성하지만, 실제로는 소형 LLM 호출 자리다.)
import type { Household } from "@/lib/types";

function estimateTokens(text: string): number {
  // 한글 기준 거친 추정 — 데모 지표용
  return Math.round(text.replace(/\s/g, "").length * 1.1);
}

export interface GeneratedDoc {
  title: string;
  body: string;
  tokens: number;
}

// 전화 스크립트 (PDF 예시 문구 그대로)
export function buildPhoneScript(h: Household): GeneratedDoc {
  const body = [
    "안녕하세요. 오늘 폭염 위험이 높아 안부 확인차 연락드렸습니다.",
    "현재 집 안이 많이 덥지는 않으신가요?",
    "에어컨이나 선풍기는 사용하고 계신가요?",
    "냉방비가 부담되어 사용을 못 하고 계신 부분이 있으실까요?",
    "필요하시면 무더위쉼터나 냉방 지원 안내를 도와드리겠습니다.",
  ].join("\n");
  return { title: "전화 스크립트", body, tokens: estimateTokens(body) };
}

// 방문 체크리스트 (PDF 예시)
export function buildVisitChecklist(h: Household): GeneratedDoc {
  const body = [
    "실내 온도와 환기 상태 확인",
    "에어컨/선풍기 작동 여부 확인",
    "냉방비 부담 여부 확인",
    "어지러움, 두통, 메스꺼움 여부 확인",
    "물 섭취 가능 여부 확인",
    "무더위쉼터 이동 가능성 확인",
    "쿨매트/차광막/선풍기 지원 필요성 확인",
  ]
    .map((l) => `□ ${l}`)
    .join("\n");
  return { title: "방문 체크리스트", body, tokens: estimateTokens(body) };
}

// 사용자 맞춤 행동계획 (남서향 시나리오 문구)
export function buildActionPlan(): GeneratedDoc {
  const body = [
    "오늘 오후 1시~4시 사이 직사광으로 실내 온도가 크게 오를 수 있습니다.",
    "1. 오전 11시 이전에 환기를 마치세요.",
    "2. 오후 12시 전부터 커튼이나 블라인드를 닫아 직사광을 막으세요.",
    "3. 피크 시간 전에 짧게 사전 냉방을 하고, 이후 선풍기와 함께 사용하세요.",
    "4. 오후 1시~4시에는 도서관·카페·학교 등 시원한 실내공간을 이용하세요.",
    "5. 냉방 중 문을 자주 열지 말고, 냉방 범위를 생활공간 중심으로 줄이세요.",
  ].join("\n");
  return { title: "오늘의 행동계획", body, tokens: estimateTokens(body) };
}

// 보호자용 안부 확인 문안
export function buildGuardianMessage(): GeneratedDoc {
  const body =
    "오늘 폭염경보가 있어요. 집 안이 너무 덥지 않은지, 에어컨이나 선풍기를 사용하고 있는지 확인해 주세요. 냉방비가 부담되면 가까운 무더위쉼터 이용도 안내해 주세요.";
  return { title: "안부 확인 문안", body, tokens: estimateTokens(body) };
}

// 일일 폭염 대응 보고서
export function buildDailyReport(): GeneratedDoc {
  const body = [
    "[일일 폭염 대응 보고서 · 2026-06-24]",
    "기상: 폭염경보, 낮 최고 37도 / 체감 40도, 열대야 지속.",
    "처리: 전화 14건, 방문 5건, 지원 검토 7건, 무더위쉼터 안내 22건.",
    "도움 요청 2건은 오전 중 접수되어 즉시 우선 배정되었습니다.",
    "AI 효율: 규칙 기반 240건 처리, LLM 호출 19건(미사용률 92.1%).",
  ].join("\n");
  return { title: "일일 보고서", body, tokens: estimateTokens(body) };
}
