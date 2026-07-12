// 건강·응급 지원 정보 헬퍼 — 선택입력 값의 옵션·라벨·판정을 한 곳에 모은다.
// 규칙 기반 위험도 가산(hazards.ts), 폼(profile.ts), 도움요청/공유 문구, 관리자 상세가 함께 사용한다.
import type {
  BloodType,
  ContactPreference,
  Hazard,
  HealthInfo,
  MedStorage,
  MobilityStatus,
  TriState,
} from "@/lib/types";

type Opt<K extends string = string> = { key: K; label: string };

/* ── 선택 옵션(키/라벨) ─────────────────────────────────── */
// 1) 이동·대피 지원
export const MOBILITY_STATUS_OPTIONS: Opt<MobilityStatus>[] = [
  { key: "independent", label: "독립 보행 가능" },
  { key: "cane", label: "지팡이/보행기 사용" },
  { key: "wheelchair", label: "휠체어 이용" },
  { key: "stairs", label: "계단 이동 어려움" },
  { key: "bedridden", label: "침상 생활" },
  { key: "unknown", label: "모름" },
  { key: "", label: "입력 안 함" },
];
// 필요 / 필요 없음 / 모름
export const SUPPORT_OPTIONS: Opt<TriState>[] = [
  { key: "yes", label: "필요" },
  { key: "no", label: "필요 없음" },
  { key: "unknown", label: "모름" },
];
// 예 / 아니오 / 모름
export const YESNO_OPTIONS: Opt<TriState>[] = [
  { key: "yes", label: "예" },
  { key: "no", label: "아니오" },
  { key: "unknown", label: "모름" },
];
// 혼자 대피 가능 여부
export const CAN_EVAC_OPTIONS: Opt[] = [
  { key: "yes", label: "가능" },
  { key: "hard", label: "어려움" },
  { key: "unknown", label: "모름" },
];

// 2) 의사소통·인지 지원
export const CONTACT_PREF_OPTIONS: Opt<ContactPreference>[] = [
  { key: "phone", label: "전화" },
  { key: "sms", label: "문자" },
  { key: "guardian", label: "보호자 통해 연락" },
  { key: "visit", label: "방문 확인" },
  { key: "unknown", label: "모름" },
];
export const SENSORY_OPTIONS: Opt[] = [
  { key: "none", label: "없음" },
  { key: "hearing", label: "청각 지원 필요" },
  { key: "vision", label: "시각 지원 필요" },
  { key: "cognitive", label: "인지 지원 필요" },
  { key: "language", label: "언어 소통 도움 필요" },
  { key: "other", label: "기타" },
  { key: "unknown", label: "모름" },
];

// 3) 주요 질환·건강 상태
export const DISEASE_OPTIONS: Opt[] = [
  { key: "none", label: "없음" },
  { key: "respiratory", label: "호흡기 질환" },
  { key: "cardio", label: "심혈관 질환" },
  { key: "hypertension", label: "고혈압" },
  { key: "diabetes", label: "당뇨" },
  { key: "kidney", label: "신장 질환" },
  { key: "stroke", label: "뇌졸중/마비 후유증" },
  { key: "immune", label: "면역저하" },
  { key: "maternal", label: "임신/영유아 돌봄" },
  { key: "mental", label: "정신건강·인지 취약" },
  { key: "other", label: "기타" },
  { key: "unknown", label: "모름" },
];
export const SYMPTOM_OPTIONS: Opt[] = [
  { key: "none", label: "없음" },
  { key: "dyspnea", label: "호흡곤란" },
  { key: "dizzy", label: "어지러움" },
  { key: "dehydration", label: "탈수 위험" },
  { key: "hypoglycemia", label: "저혈당 주의" },
  { key: "bp", label: "혈압 변동" },
  { key: "other", label: "기타" },
  { key: "unknown", label: "모름" },
];

// 4) 복용약·알레르기
export const HAVING_OPTIONS: Opt<TriState>[] = [
  { key: "yes", label: "있음" },
  { key: "no", label: "없음" },
  { key: "unknown", label: "모름" },
];
export const MED_STORAGE_OPTIONS: Opt<MedStorage>[] = [
  { key: "none", label: "없음" },
  { key: "fridge", label: "냉장 보관 필요" },
  { key: "power", label: "전기/기기 필요" },
  { key: "unknown", label: "모름" },
];
export const MEDICAL_DEVICE_OPTIONS: Opt[] = [
  { key: "none", label: "없음" },
  { key: "oxygen", label: "산소발생기" },
  { key: "inhaler", label: "흡입기" },
  { key: "glucose", label: "혈당측정기" },
  { key: "dialysis", label: "투석 관련" },
  { key: "ewheelchair", label: "전동휠체어" },
  { key: "other", label: "기타" },
  { key: "unknown", label: "모름" },
];

// 5) 응급 참고 정보
export const BLOOD_TYPES: Opt<BloodType>[] = [
  { key: "A", label: "A형" },
  { key: "B", label: "B형" },
  { key: "O", label: "O형" },
  { key: "AB", label: "AB형" },
  { key: "A-", label: "Rh- A형" },
  { key: "B-", label: "Rh- B형" },
  { key: "O-", label: "Rh- O형" },
  { key: "AB-", label: "Rh- AB형" },
  { key: "unknown", label: "모름" },
  { key: "", label: "입력 안 함" },
];

/* ── 라벨 조회 ──────────────────────────────────────────── */
const labelMap = (opts: Opt[]) => Object.fromEntries(opts.map((o) => [o.key, o.label]));
const DISEASE_LABEL = labelMap(DISEASE_OPTIONS);
const SYMPTOM_LABEL = labelMap(SYMPTOM_OPTIONS);
const SENSORY_LABEL = labelMap(SENSORY_OPTIONS);
const DEVICE_LABEL = labelMap(MEDICAL_DEVICE_OPTIONS);
export const diseaseLabel = (key: string): string => DISEASE_LABEL[key] ?? key;
export const bloodLabel = (b?: BloodType): string => BLOOD_TYPES.find((x) => x.key === b)?.label ?? "";
export const mobilityLabel = (m?: MobilityStatus): string =>
  MOBILITY_STATUS_OPTIONS.find((x) => x.key === m)?.label ?? "";
export const contactPrefLabel = (c?: ContactPreference): string =>
  CONTACT_PREF_OPTIONS.find((x) => x.key === c)?.label ?? "";

// 실제 값(없음/모름/기타 성격 제외)만 남기는 유틸
const REAL_DISEASES = ["respiratory", "cardio", "hypertension", "diabetes", "kidney", "stroke", "immune", "maternal", "mental", "other"];
const CARDIO_METABOLIC = ["cardio", "hypertension", "diabetes", "kidney"];
const IGNORE_KEYS = ["none", "unknown", ""];

const s = (v?: string) => (v ?? "").trim();
const arr = (v?: string[]) => v ?? [];
const real = (v?: string[]) => arr(v).filter((k) => !IGNORE_KEYS.includes(k));

/* ── 판정 헬퍼 ──────────────────────────────────────────── */
// 질환
export const realDiseases = (h?: HealthInfo): string[] => arr(h?.chronicDiseases).filter((k) => REAL_DISEASES.includes(k));
export const hasDisease = (h: HealthInfo | undefined, key: string): boolean => arr(h?.chronicDiseases).includes(key);
export const hasDiseases = (h?: HealthInfo): boolean => realDiseases(h).length > 0;
export const hasRespiratory = (h?: HealthInfo): boolean => hasDisease(h, "respiratory");
export const hasCardioMetabolic = (h?: HealthInfo): boolean => CARDIO_METABOLIC.some((k) => hasDisease(h, k));
export const hasDiabetes = (h?: HealthInfo): boolean => hasDisease(h, "diabetes");
export const hasStroke = (h?: HealthInfo): boolean => hasDisease(h, "stroke");
export const hasMaternal = (h?: HealthInfo): boolean => hasDisease(h, "maternal");

// 증상
const hasSymptom = (h: HealthInfo | undefined, key: string) => arr(h?.recentSymptoms).includes(key);
export const hasDehydrationRisk = (h?: HealthInfo): boolean => hasSymptom(h, "dehydration");
export const hasHypoglycemia = (h?: HealthInfo): boolean => hasSymptom(h, "hypoglycemia");

// 이동·대피
export const usesWheelchair = (h?: HealthInfo): boolean => h?.mobilityStatus === "wheelchair" || h?.mobilityStatus === "bedridden";
export const stairsDifficulty = (h?: HealthInfo): boolean => h?.mobilityStatus === "stairs" || h?.elevatorDependency === "yes";
export const hardToEvacuateAlone = (h?: HealthInfo): boolean => h?.canEvacuateAlone === "hard";
export const evacuationHelp = (h?: HealthInfo): boolean => h?.evacuationHelpNeeded === "yes";
export const hasDisability = (h?: HealthInfo): boolean => h?.disabilityStatus === "yes";
// 통합 "이동 도움 필요" — 신규/레거시 신호를 모두 본다
export const needsMobility = (h?: HealthInfo): boolean =>
  evacuationHelp(h) || hardToEvacuateAlone(h) || usesWheelchair(h) || stairsDifficulty(h) ||
  h?.mobilityStatus === "cane" || h?.mobilitySupportNeeded === "yes" || hasStroke(h);

// 의사소통
export const realSensory = (h?: HealthInfo): string[] => real(h?.sensorySupport);
export const needsCommunication = (h?: HealthInfo): boolean =>
  h?.communicationSupportNeeded === "yes" || realSensory(h).length > 0;
export const prefersGuardianContact = (h?: HealthInfo): boolean => h?.contactPreference === "guardian";
export const prefersVisit = (h?: HealthInfo): boolean => h?.contactPreference === "visit";

// 복용약·알레르기·기기
const hasDevice = (h: HealthInfo | undefined, key: string) => arr(h?.medicalDevices).includes(key);
export const hasMedications = (h?: HealthInfo): boolean => h?.medicationStatus === "yes" || s(h?.medications) !== "";
export const hasAllergies = (h?: HealthInfo): boolean => h?.allergyStatus === "yes" || s(h?.allergies) !== "";
export const realDevices = (h?: HealthInfo): string[] => real(h?.medicalDevices);
export const hasMedicalDevices = (h?: HealthInfo): boolean => realDevices(h).length > 0;
export const needsColdStorage = (h?: HealthInfo): boolean => h?.medStorage === "fridge";
export const needsPower = (h?: HealthInfo): boolean =>
  h?.medStorage === "power" || ["oxygen", "dialysis", "ewheelchair"].some((k) => hasDevice(h, k));
export const usesRespiratorySupport = (h?: HealthInfo): boolean => hasDevice(h, "oxygen") || hasDevice(h, "inhaler");

// 기타
export const hasEmergencyMemo = (h?: HealthInfo): boolean => s(h?.emergencyMemo) !== "";
export const hasHospital = (h?: HealthInfo): boolean => s(h?.hospitalName) !== "";
export const hasEvacKit = (h?: HealthInfo): boolean => s(h?.evacuationKit) !== "";
export const hasBloodType = (h?: HealthInfo): boolean => !!h?.bloodType && h.bloodType !== "unknown";

/* ── 위험 태그 (재난 유형별로 관련 태그만) ─────────────────── */
export function healthTags(h: HealthInfo | undefined, hazard: Hazard): string[] {
  if (!h) return [];
  const t: string[] = [];
  // 재난 유형별 질환·증상 (해당 재난에 가장 관련) — 우선 노출
  if (hazard === "dust") {
    if (hasRespiratory(h)) t.push("호흡기 질환");
    if (usesRespiratorySupport(h)) t.push("호흡기 지원 필요");
  }
  if (hazard === "heat") {
    if (hasCardioMetabolic(h)) t.push("심혈관 주의");
    if (hasDiabetes(h)) t.push("당뇨 관리 필요");
    if (hasDehydrationRisk(h)) t.push("탈수 주의");
  }
  if (hazard === "cold") {
    if (hasCardioMetabolic(h)) t.push("심혈관 주의");
    if (hasHypoglycemia(h)) t.push("저혈당 주의");
  }
  if (hasMaternal(h)) t.push("영유아/임산부 주의");
  // 이동·대피 (홍수·태풍·한파에서 특히 중요)
  if (needsMobility(h)) t.push("이동 도움 필요");
  if (hardToEvacuateAlone(h)) t.push("혼자 대피 어려움");
  if (stairsDifficulty(h)) t.push("계단 이동 어려움");
  // 의사소통
  if (needsCommunication(h)) t.push("의사소통 도움 필요");
  if (prefersGuardianContact(h)) t.push("보호자 연락 우선");
  if (prefersVisit(h)) t.push("방문 확인 선호");
  // 복용약·기기
  if (hasMedications(h)) t.push("복용약 확인 필요");
  if (needsColdStorage(h)) t.push("약 보관 주의");
  if (needsPower(h)) t.push("의료기기 전원 필요");
  if (hasEmergencyMemo(h) || hasBloodType(h) || hasEvacKit(h)) t.push("응급정보 있음");
  return Array.from(new Set(t));
}

/* ── 도움요청/공유 문구용 요약 플래그 (민감정보 노출 최소화) ── */
export function healthSummaryFlags(h?: HealthInfo): string[] {
  if (!h) return [];
  const f: string[] = [];
  if (needsMobility(h)) f.push("이동 도움 필요");
  if (hardToEvacuateAlone(h)) f.push("혼자 대피 어려움");
  if (needsCommunication(h)) f.push("의사소통 도움 필요");
  if (prefersGuardianContact(h)) f.push("보호자 연락 우선");
  else if (prefersVisit(h)) f.push("방문 확인 선호");
  if (hasRespiratory(h)) f.push("호흡기 질환 정보 있음");
  else if (hasDiseases(h)) f.push("주요 질환 정보 있음");
  if (hasMedications(h)) f.push("복용약 정보 있음");
  if (needsColdStorage(h)) f.push("냉장 보관 약 주의");
  if (hasMedicalDevices(h)) f.push("의료기기 사용 정보 있음");
  if (needsPower(h)) f.push("의료기기 전원 필요");
  if (hasAllergies(h)) f.push("알레르기 정보 있음");
  if (hasBloodType(h)) f.push("혈액형 정보 있음");
  return f;
}

/* ── 응급 참고 정보 카드/관리자 상세 항목 (의미 있는 값만) ──── */
export function healthReferenceItems(h?: HealthInfo): { label: string; value: string }[] {
  if (!h) return [];
  const items: { label: string; value: string }[] = [];
  const push = (label: string, value: string) => value && items.push({ label, value });

  // 1) 이동·대피 지원
  const moveBits: string[] = [];
  if (h.mobilityStatus && !IGNORE_KEYS.includes(h.mobilityStatus) && h.mobilityStatus !== "independent")
    moveBits.push(mobilityLabel(h.mobilityStatus));
  if (evacuationHelp(h)) moveBits.push("대피 도움 필요");
  if (hardToEvacuateAlone(h)) moveBits.push("혼자 대피 어려움");
  if (h.elevatorDependency === "yes") moveBits.push("엘리베이터 없으면 이동 어려움");
  if (hasDisability(h) && !moveBits.length) moveBits.push("장애·도움 필요"); // 레거시
  if (s(h.mobilityMemo)) moveBits.push(s(h.mobilityMemo));
  else if (s(h.disabilityDetail)) moveBits.push(s(h.disabilityDetail)); // 레거시
  push("이동·대피 지원", moveBits.join(" · "));

  // 2) 의사소통 지원
  const comBits: string[] = [];
  if (h.communicationSupportNeeded === "yes") comBits.push("의사소통 도움 필요");
  if (h.contactPreference && !IGNORE_KEYS.includes(h.contactPreference)) comBits.push(`연락 선호 ${contactPrefLabel(h.contactPreference)}`);
  const sensory = realSensory(h).map((k) => SENSORY_LABEL[k]);
  if (sensory.length) comBits.push(sensory.join(", "));
  if (s(h.communicationMemo)) comBits.push(s(h.communicationMemo));
  push("의사소통 지원", comBits.join(" · "));

  // 3) 주요 질환·건강 상태
  const dz = realDiseases(h).map(diseaseLabel);
  push("주요 질환", [dz.join(", "), s(h.diseaseDetail)].filter(Boolean).join(" · "));
  const sym = real(h.recentSymptoms).map((k) => SYMPTOM_LABEL[k]);
  push("최근 주의 증상", sym.join(", "));

  // 4) 복용약·알레르기·기기
  if (hasMedications(h)) push("복용약 정보", s(h.medications) || "있음");
  if (h.medStorage && ["fridge", "power"].includes(h.medStorage))
    push("약 보관 주의", h.medStorage === "fridge" ? "냉장 보관 필요" : "전기/기기 필요");
  if (hasAllergies(h)) push("알레르기 정보", s(h.allergies) || "있음");
  const dev = realDevices(h).map((k) => DEVICE_LABEL[k]);
  push("의료기기 정보", dev.join(", "));

  // 5) 응급 참고 정보
  if (hasBloodType(h)) push("혈액형", bloodLabel(h.bloodType));
  push("주 이용 병원", s(h.hospitalName));
  push("대피 시 챙길 것", s(h.evacuationKit));
  push("응급 메모", s(h.emergencyMemo));
  return items;
}

export const hasAnyHealthInfo = (h?: HealthInfo): boolean => healthReferenceItems(h).length > 0;

/** 프로필에서 건강·응급 정보만 추출 (이름·연락처 등 개인정보는 분리) */
export function healthFromProfile(p: HealthInfo): HealthInfo {
  return {
    disabilityStatus: p.disabilityStatus,
    disabilityDetail: p.disabilityDetail,
    mobilitySupportNeeded: p.mobilitySupportNeeded,
    mobilityStatus: p.mobilityStatus,
    evacuationHelpNeeded: p.evacuationHelpNeeded,
    elevatorDependency: p.elevatorDependency,
    canEvacuateAlone: p.canEvacuateAlone,
    mobilityMemo: p.mobilityMemo,
    communicationSupportNeeded: p.communicationSupportNeeded,
    contactPreference: p.contactPreference,
    sensorySupport: p.sensorySupport,
    communicationMemo: p.communicationMemo,
    chronicDiseases: p.chronicDiseases,
    diseaseDetail: p.diseaseDetail,
    recentSymptoms: p.recentSymptoms,
    medicationStatus: p.medicationStatus,
    medications: p.medications,
    medStorage: p.medStorage,
    allergyStatus: p.allergyStatus,
    allergies: p.allergies,
    medicalDevices: p.medicalDevices,
    bloodType: p.bloodType,
    hospitalName: p.hospitalName,
    emergencyMemo: p.emergencyMemo,
    evacuationKit: p.evacuationKit,
  };
}
