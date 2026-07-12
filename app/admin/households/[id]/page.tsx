"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import { HAZARDS, riskBand } from "@/lib/hazards";
import {
  hardToEvacuateAlone,
  hasDisability,
  hasMedications,
  hasRespiratory,
  healthReferenceItems,
  needsCommunication,
  needsMobility,
  needsPower,
} from "@/lib/health";
import { CopyButton } from "@/components/CopyButton";
import { ShelterSheet } from "@/components/user/ShelterSheet";
import type { Hazard, Household, Status } from "@/lib/types";

// 한글 받침에 따라 은/는
function eunNeun(word: string): string {
  const c = word.charCodeAt(word.length - 1);
  if (Number.isNaN(c) || c < 0xac00 || c > 0xd7a3) return "은(는)";
  return (c - 0xac00) % 28 === 0 ? "는" : "은";
}

// 재난 유형별 "위험 판단 이유"
const HAZARD_REASON: Record<Hazard, string> = {
  heat: "냉방 취약 조건과 건강 취약 조건이 겹쳐 전화 확인이 필요합니다.",
  flood: "침수 전 대피 안내와 차량 이동 여부 확인이 필요합니다.",
  cold: "난방 상태와 수도 동파 여부 확인이 필요합니다.",
  dust: "외출 자제 안내와 마스크 지원 검토가 필요합니다.",
  wind: "창문 고정과 낙하물 위험 확인이 필요합니다.",
};

// 관리자 → 보호자/대상자 연락 문구
function contactMessage(h: Household): string {
  const region = h.region;
  const alert = HAZARDS[h.hazard].today.alert;
  const p = eunNeun(region);
  switch (h.hazard) {
    case "heat":
      return `안녕하세요. SafeLink AI 재난안전 확인 안내입니다. 오늘 ${region}${p} ${alert}로 무더위가 이어져 냉방 상태와 수분 섭취 확인이 필요합니다. 가능하면 오전 중 안부 확인을 부탁드립니다.`;
    case "flood":
      return `오늘 ${region}에 집중호우와 침수 위험이 있습니다. 반지하·저층 거주자는 현관 앞 배수구와 창문 주변을 확인하고, 물이 차오르면 가까운 대피소로 이동해주세요.`;
    case "cold":
      return `안녕하세요. SafeLink AI 재난안전 확인 안내입니다. 오늘 ${region}${p} ${alert}가 있어 난방 상태와 수도 동파 여부 확인이 필요합니다. 가능하면 오전 중 안부 확인을 부탁드립니다.`;
    case "dust":
      return `오늘 ${region}${p} 미세먼지 농도가 높습니다. 호흡기 취약 대상자는 외출을 자제하고, 실내 공기 관리와 마스크 착용을 안내해주세요.`;
    case "wind":
      return `오늘 ${region}에 강풍 특보가 있습니다. 창문을 단단히 고정하고 창가 물건을 치우며, 낙하물 위험 구역 접근을 피하도록 안내해주세요.`;
  }
}

// 재난 유형별 우선 대응 행동 (건강·응급 정보 기반 위험 분석 문구용)
const HAZARD_ACTION: Record<Hazard, string> = {
  heat: "전화 확인과 냉방 점검",
  flood: "사전 대피 안내와 방문 점검",
  cold: "전화 확인과 방문 점검",
  dust: "외출 자제 안내와 마스크 지원",
  wind: "대피 안내와 안전 점검",
};

// 건강·응급 정보가 있을 때 위험 분석에 덧붙이는 문구
function healthPriorityNote(h: Household): string {
  if (!healthReferenceItems(h.health).length) return "";
  const bits: string[] = [];
  if (needsMobility(h.health)) bits.push("이동 도움 필요");
  if (hardToEvacuateAlone(h.health)) bits.push("혼자 대피 어려움");
  if (needsCommunication(h.health)) bits.push("의사소통 도움 필요");
  if (hasRespiratory(h.health)) bits.push("호흡기 질환");
  if (hasDisability(h.health)) bits.push("장애·도움 필요");
  if (hasMedications(h.health)) bits.push("복용약 확인 필요");
  if (needsPower(h.health)) bits.push("의료기기 전원 필요");
  const flag = bits.length ? `${bits.slice(0, 2).join("·")} 정보가 있어` : "건강·응급 참고 정보가 있어";
  return `이 가구는 ${h.householdType}이며 ${flag} ${HAZARDS[h.hazard].label} 상황에서 ${HAZARD_ACTION[h.hazard]} 우선순위가 높습니다.`;
}

// 상태별 다음 단계 문구 (대응 기록 마지막 줄)
const NEXT_STEP: Record<Status, string> = {
  대기: "전화 확인 예정",
  전화중: "전화 확인 진행 중",
  방문예정: "방문 확인 예정",
  지원검토: "생활지원 검토 중",
  완료: "대응 완료",
};

const CHECK_ITEMS = ["전화 안부 확인", "보호자 연락", "대피소·쉼터 안내", "방문 확인", "생활지원 검토", "완료 처리"];
const STATUS_BUTTONS: { label: string; status: Status }[] = [
  { label: "전화 확인", status: "전화중" },
  { label: "방문 예정", status: "방문예정" },
  { label: "지원 검토", status: "지원검토" },
  { label: "완료", status: "완료" },
];
const STATUS_PILL: Record<Status, string> = {
  대기: "bg-ink/5 text-forest/70",
  전화중: "bg-amber-soft text-amber-ink",
  방문예정: "bg-mint-soft text-pine",
  지원검토: "bg-lime/20 text-forest",
  완료: "bg-green/15 text-green",
};

export default function HouseholdDetail() {
  const { id } = useParams<{ id: string }>();
  const { getHousehold, setHouseholdStatus, hydrated } = useAppState();
  const h = getHousehold(id);

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setChecks((s) => ({ ...s, [k]: !s[k] }));

  // 존재하지 않는 가구
  if (!h) {
    if (!hydrated) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="shimmer h-24 w-full max-w-sm rounded-2xl" />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-md rounded-xl3 bg-white p-10 text-center ring-1 ring-ink/8">
        <p className="text-lg font-bold text-ink">가구 정보를 찾을 수 없습니다.</p>
        <p className="mt-1 text-sm text-forest/55">요청하신 가구 ID({id})가 존재하지 않습니다.</p>
        <Link href="/admin" className="mt-4 inline-block rounded-2xl bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-pine">
          관리자 대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const def = HAZARDS[h.hazard];
  const band = riskBand(h.score);
  const todayNeeded = h.dday <= 0;
  const msg = contactMessage(h);
  const healthItems = healthReferenceItems(h.health);
  const healthNote = healthPriorityNote(h);

  const info: [string, string][] = [
    ["가구 ID", h.id],
    ["동네", h.region],
    ["연령대", h.ageBand],
    ["거주 형태", h.housingType],
    ["가구 유형", h.householdType],
    ["혼자 거주", h.alone ? "예" : "아니오"],
    ["건강 취약", h.healthRisk ? "예" : "아니오"],
    ["차량 보유", h.hasCar ? "예" : "아니오"],
    ["반려동물", h.hasPet ? "예" : "아니오"],
    ["보호자 연락 필요", h.guardianNeeded ? "예" : "아니오"],
  ];

  const priorityReasons = [
    `위험도 ${h.score}점 · ${band.label}`,
    ...(todayNeeded ? ["오늘 처리 필요"] : [`처리 기한 D-${h.dday}`]),
    ...(h.needsSupport ? ["지원 검토 대상"] : []),
    ...(h.helpRequested ? ["도움 요청 접수"] : []),
  ];

  const timeline: [string, string][] = [
    ["09:10", "위험도 AI 자동분류 완료"],
    ["09:20", `${band.label} 대상으로 분류`],
    ["10:05", h.assignee ? `담당자 ${h.assignee} 배정` : "담당자 배정 대기"],
    ["10:30", "보호자 연락 문구 생성"],
    ["11:00", NEXT_STEP[h.status]],
  ];

  return (
    <div className="stagger">
      {/* 헤더 */}
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest/60 transition hover:text-forest">
        <span aria-hidden>←</span> 관리자 대시보드
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">가구 상세</h1>
        <span className="font-display text-xl font-bold text-forest/50">{h.id}</span>
        <span className="text-forest/55">{h.region}</span>
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold" style={{ background: def.theme.soft, color: def.theme.ink }}>
          {def.emoji} {def.label}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${STATUS_PILL[h.status]}`}>{h.status}</span>
        {h.helpRequested && (
          <span className="rounded-full bg-ember px-2.5 py-0.5 text-sm font-bold text-white animate-pulse-ring">도움요청</span>
        )}
      </div>

      {/* 핵심 요약 카드 5개 */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="위험 점수" value={`${h.score}`} tone={{ bg: band.soft, fg: band.ink }} big />
        <SummaryCard label="위험 단계" value={band.label} tone={{ bg: band.soft, fg: band.ink }} />
        <SummaryCard label="처리 기한" value={todayNeeded ? "오늘 처리" : `D-${h.dday}`} tone={todayNeeded ? { bg: "#F5E3DB", fg: "#7E2D17" } : undefined} />
        <SummaryCard label="담당자" value={h.assignee ?? "미배정"} />
        <SummaryCard label="상태" value={h.status} />
      </div>

      {/* 2단 레이아웃 */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        {/* 좌측: 가구 정보 + 위험 분석 */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold text-ink">가구 정보</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {info.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-forest/45">{k}</dt>
                  <dd className="text-sm font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: def.theme.fg }} />
              왜 위험한가
            </h2>
            <div className="mt-3 rounded-2xl p-3.5" style={{ background: def.theme.soft }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: def.theme.ink }}>현재 재난 상황</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: def.theme.ink }}>{def.today.alert} · {def.today.headline}</p>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-forest/45">주요 취약 태그</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {h.factors.map((f) => (
                <span key={f} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-forest/75">{f}</span>
              ))}
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-forest/45">위험 판단 이유</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{HAZARD_REASON[h.hazard]}</p>
            {healthNote && (
              <p className="mt-2 rounded-2xl bg-mint-soft/60 p-3 text-sm leading-relaxed text-pine ring-1 ring-green/12">{healthNote}</p>
            )}
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-forest/45">우선 확인 사유</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {priorityReasons.map((r) => (
                <span key={r} className="rounded-full bg-forest/8 px-2.5 py-1 text-xs font-semibold text-pine">{r}</span>
              ))}
            </div>
          </section>

          {/* 건강·응급 참고 정보 (입력된 경우에만) */}
          {healthItems.length > 0 && (
            <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <span aria-hidden>🩺</span> 건강·응급 참고 정보
              </h2>
              <p className="mt-1 text-sm text-forest/55">방문·전화 확인 시 참고할 선택입력 정보입니다.</p>
              <dl className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">
                {healthItems.map((it) => (
                  <div key={it.label}>
                    <dt className="text-xs text-forest/45">{it.label}</dt>
                    <dd className="text-sm font-semibold leading-relaxed text-ink">{it.value}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs text-forest/45">보호자 연락 필요</dt>
                  <dd className="text-sm font-semibold text-ink">{h.guardianNeeded ? "예" : "아니오"}</dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        {/* 우측: 필요한 조치 + 상태 변경 + 대피소 */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold text-ink">필요한 조치</h2>
            <div className="mt-3 flex flex-col gap-2">
              {CHECK_ITEMS.map((it) => {
                const on = !!checks[it];
                return (
                  <button
                    key={it}
                    onClick={() => toggle(it)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${on ? "bg-mint-soft/70" : "bg-mist/40 hover:bg-mist"}`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition ${on ? "border-green bg-green text-white" : "border-ink/20 text-transparent"}`}>✓</span>
                    <span className={on ? "text-forest/55 line-through" : "text-ink"}>{it}</span>
                  </button>
                );
              })}
            </div>

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-forest/45">상태 변경</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STATUS_BUTTONS.map((b) => {
                const active = h.status === b.status;
                return (
                  <button
                    key={b.status}
                    onClick={() => setHouseholdStatus(h.id, b.status)}
                    className={`rounded-2xl py-2.5 text-center text-sm font-semibold transition ${active ? "bg-forest text-white" : "bg-white text-forest ring-1 ring-ink/10 hover:ring-green/40"}`}
                  >
                    {b.label}{active ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-forest/45">현재 상태: <b className="text-forest">{h.status}</b> · 변경 시 리스트에 즉시 반영됩니다.</p>
          </section>

          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold text-ink">대피소·쉼터 안내</h2>
            <p className="mt-1 text-sm text-forest/55">오늘 {def.label} 상황에 맞는 장소를 안내합니다.</p>
            <div className="mt-3">
              <ShelterSheet hazard={h.hazard} label="대피소·쉼터 보기" className="w-full rounded-2xl bg-forest py-3 text-center text-sm font-bold text-white transition hover:bg-pine" />
            </div>
          </section>
        </div>
      </div>

      {/* 대응 기록 + 연락 문구 */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8 lg:col-span-6">
          <h2 className="font-display text-lg font-bold text-ink">대응 기록</h2>
          <ol className="mt-4 flex flex-col">
            {timeline.map(([time, text], i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-green" />
                  {i < timeline.length - 1 && <span className="w-px flex-1 bg-ink/10" />}
                </div>
                <div className={i < timeline.length - 1 ? "pb-4" : ""}>
                  <p className="tnum text-xs font-bold text-forest/45">{time}</p>
                  <p className="text-sm text-ink">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl3 bg-mint-soft/50 p-5 ring-1 ring-green/12 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">연락 문구</h2>
            <CopyButton text={msg} label="문구 복사" />
          </div>
          <p className="mt-1 text-sm text-forest/55">보호자·대상자에게 보낼 안내 문구 (AI 자동 생성)</p>
          <p className="mt-3 rounded-2xl bg-white/70 p-3.5 text-sm leading-relaxed text-ink">{msg}</p>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone?: { bg: string; fg: string };
  big?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/8" style={tone ? { background: tone.bg } : undefined}>
      <p className="text-xs font-medium" style={tone ? { color: tone.fg } : undefined}>{label}</p>
      <p
        className={`mt-1 font-extrabold leading-tight ${big ? "tnum text-3xl" : "text-lg"}`}
        style={tone ? { color: tone.fg } : { color: "#0E3B2E" }}
      >
        {value}
      </p>
    </div>
  );
}
