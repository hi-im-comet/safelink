// 건강·응급 지원 정보 헬퍼 — 선택입력 값의 옵션·라벨·판정을 한 곳에 모은다.
// 규칙 기반 위험도 가산(hazards.ts), 폼(profile.ts), 도움요청/공유 문구, 관리자 상세가 함께 사용한다.
import type { BloodType, DisabilityStatus, HealthInfo, TriState } from "@/lib/types";

/* ── 선택 옵션(키/라벨) ─────────────────────────────────── */
export const DISABILITY_OPTIONS: { key: DisabilityStatus; label: string }[] = [
  { key: "none", label: "없음" },
  { key: "yes", label: "있음" },
  { key: "unknown", label: "모름" },
  { key: "", label: "입력 안 함" },
];

// 이동 도움 / 의사소통 도움 필요 여부
export const SUPPORT_OPTIONS: { key: TriState; label: string }[] = [
  { key: "yes", label: "필요" },
  { key: "no", label: "필요 없음" },
  { key: "unknown", label: "모름" },
];

export const DISEASE_OPTIONS: { key: string; label: string }[] = [
  { key: "none", label: "없음" },
  { key: "respiratory", label: "호흡기 질환" },
  { key: "cardio", label: "심혈관 질환" },
  { key: "diabetes", label: "당뇨" },
  { key: "kidney", label: "신장 질환" },
  { key: "hypertension", label: "고혈압" },
  { key: "other", label: "기타" },
  { key: "unknown", label: "모름" },
];

export const BLOOD_TYPES: { key: BloodType; label: string }[] = [
  { key: "A", label: "A형" },
  { key: "B", label: "B형" },
  { key: "O", label: "O형" },
  { key: "AB", label: "AB형" },
  { key: "unknown", label: "모름" },
  { key: "", label: "입력 안 함" },
];

// 실제 질환(없음/모름 제외) — 위험도 가산·요약에 쓰는 키
const REAL_DISEASES = ["respiratory", "cardio", "diabetes", "kidney", "hypertension", "other"];
// 폭염·한파에서 추가 가산하는 심혈관계·대사질환
const CARDIO_METABOLIC = ["cardio", "hypertension", "diabetes", "kidney"];

const DISEASE_LABEL: Record<string, string> = Object.fromEntries(DISEASE_OPTIONS.map((d) => [d.key, d.label]));
export const diseaseLabel = (key: string): string => DISEASE_LABEL[key] ?? key;
export const bloodLabel = (b?: BloodType): string => BLOOD_TYPES.find((x) => x.key === b)?.label ?? "";

const s = (v?: string) => (v ?? "").trim();
const list = (h?: HealthInfo) => h?.chronicDiseases ?? [];

/* ── 판정 헬퍼 ──────────────────────────────────────────── */
export const realDiseases = (h?: HealthInfo): string[] => list(h).filter((k) => REAL_DISEASES.includes(k));
export const hasDisease = (h: HealthInfo | undefined, key: string): boolean => list(h).includes(key);
export const hasDiseases = (h?: HealthInfo): boolean => realDiseases(h).length > 0;
export const hasRespiratory = (h?: HealthInfo): boolean => hasDisease(h, "respiratory");
export const hasCardioMetabolic = (h?: HealthInfo): boolean => CARDIO_METABOLIC.some((k) => hasDisease(h, k));

export const hasDisability = (h?: HealthInfo): boolean => h?.disabilityStatus === "yes";
export const needsMobility = (h?: HealthInfo): boolean => h?.mobilitySupportNeeded === "yes";
export const needsCommunication = (h?: HealthInfo): boolean => h?.communicationSupportNeeded === "yes";
export const hasMedications = (h?: HealthInfo): boolean => s(h?.medications) !== "";
export const hasAllergies = (h?: HealthInfo): boolean => s(h?.allergies) !== "";
export const hasEmergencyMemo = (h?: HealthInfo): boolean => s(h?.emergencyMemo) !== "";
export const hasHospital = (h?: HealthInfo): boolean => s(h?.hospitalName) !== "";
export const hasBloodType = (h?: HealthInfo): boolean => ["A", "B", "O", "AB"].includes(h?.bloodType ?? "");

/* ── 도움요청/공유 문구용 요약 플래그 (민감정보 노출 최소화) ── */
export function healthSummaryFlags(h?: HealthInfo): string[] {
  if (!h) return [];
  const f: string[] = [];
  if (needsMobility(h)) f.push("이동 도움 필요");
  if (needsCommunication(h)) f.push("의사소통 도움 필요");
  if (hasDisability(h)) f.push("장애·도움 필요 정보 있음");
  if (hasRespiratory(h)) f.push("호흡기 질환 정보 있음");
  else if (hasDiseases(h)) f.push("주요 질환 정보 있음");
  if (hasMedications(h)) f.push("복용약 정보 있음");
  if (hasAllergies(h)) f.push("알레르기 정보 있음");
  if (hasBloodType(h)) f.push("혈액형 정보 있음");
  return f;
}

/* ── 위험 태그용 ─────────────────────────────────────────── */
export function healthTags(h?: HealthInfo): string[] {
  if (!h) return [];
  const t: string[] = [];
  if (needsMobility(h)) t.push("이동 도움 필요");
  if (needsCommunication(h)) t.push("의사소통 도움 필요");
  if (hasRespiratory(h)) t.push("호흡기 질환");
  if (hasDisability(h)) t.push("장애 지원 필요");
  if (hasMedications(h)) t.push("복용약 확인 필요");
  if (hasEmergencyMemo(h)) t.push("응급정보 있음");
  return t;
}

/* ── 응급 참고 정보 카드/관리자 상세 항목 (입력된 것만) ────── */
export function healthReferenceItems(h?: HealthInfo): { label: string; value: string }[] {
  if (!h) return [];
  const items: { label: string; value: string }[] = [];

  const disBits: string[] = [];
  if (h.disabilityStatus === "yes") disBits.push("장애 있음");
  else if (h.disabilityStatus === "unknown") disBits.push("장애 여부 모름");
  if (needsMobility(h)) disBits.push("이동 도움 필요");
  if (needsCommunication(h)) disBits.push("의사소통 도움 필요");
  if (s(h.disabilityDetail)) disBits.push(s(h.disabilityDetail));
  if (disBits.length) items.push({ label: "장애·도움 필요 사항", value: disBits.join(" · ") });

  const dz = realDiseases(h).map(diseaseLabel);
  if (dz.length || s(h.diseaseDetail)) {
    items.push({ label: "주요 질환", value: [dz.join(", "), s(h.diseaseDetail)].filter(Boolean).join(" · ") });
  }
  if (hasMedications(h)) items.push({ label: "복용약", value: s(h.medications) });
  if (hasAllergies(h)) items.push({ label: "알레르기", value: s(h.allergies) });
  if (hasBloodType(h)) items.push({ label: "혈액형", value: bloodLabel(h.bloodType) });
  if (hasHospital(h)) items.push({ label: "주 이용 병원", value: s(h.hospitalName) });
  if (hasEmergencyMemo(h)) items.push({ label: "응급 메모", value: s(h.emergencyMemo) });
  return items;
}

export const hasAnyHealthInfo = (h?: HealthInfo): boolean => healthReferenceItems(h).length > 0;

/** 프로필에서 건강·응급 정보만 추출 (이름·연락처 등 개인정보는 분리) */
export function healthFromProfile(p: HealthInfo): HealthInfo {
  return {
    disabilityStatus: p.disabilityStatus,
    disabilityDetail: p.disabilityDetail,
    mobilitySupportNeeded: p.mobilitySupportNeeded,
    communicationSupportNeeded: p.communicationSupportNeeded,
    chronicDiseases: p.chronicDiseases,
    diseaseDetail: p.diseaseDetail,
    medications: p.medications,
    allergies: p.allergies,
    bloodType: p.bloodType,
    hospitalName: p.hospitalName,
    emergencyMemo: p.emergencyMemo,
  };
}
