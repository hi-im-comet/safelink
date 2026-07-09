// 대피소·쉼터 시연용 데이터. 실제 위치 안내는 추후 공공데이터 API 연동으로 확장 가능.
import type { Hazard } from "@/lib/types";

export interface Shelter {
  name: string;
  walk: string;
  hazards: Hazard[]; // 이 장소가 커버하는 재난 유형
}

// 재난 유형별 시설 명칭
export const SHELTER_TYPE: Record<Hazard, string> = {
  heat: "무더위쉼터",
  flood: "임시대피소",
  cold: "한파쉼터",
  dust: "실내 대기 가능 시설",
  wind: "임시대피소",
};

export const demoShelters: Shelter[] = [
  { name: "햇살동 주민센터", walk: "도보 8분", hazards: ["heat", "flood", "wind"] },
  { name: "햇살초등학교 강당", walk: "도보 12분", hazards: ["flood", "wind"] },
  { name: "푸른복지관", walk: "도보 10분", hazards: ["cold", "dust"] },
  { name: "물빛동 보건지소", walk: "도보 6분", hazards: ["dust", "heat"] },
  { name: "바람골 경로당", walk: "도보 5분", hazards: ["heat", "cold"] },
];

/** 특정 재난 유형에서 이용 가능한 쉼터 목록 */
export function sheltersFor(hazard: Hazard): Shelter[] {
  return demoShelters.filter((s) => s.hazards.includes(hazard));
}

export const SHELTER_API_NOTE = "현재 위치 기반 실제 안내는 추후 공공데이터 API 연동으로 확장 가능합니다.";
