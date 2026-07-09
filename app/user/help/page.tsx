"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import { assessRisk, buildHelpMessage, riskBand, HAZARDS, DISCLAIMER } from "@/lib/hazards";
import { USER_HOUSEHOLD_ID } from "@/lib/mock/households";
import { CopyButton } from "@/components/CopyButton";
import { ShelterSheet } from "@/components/user/ShelterSheet";

const REQUEST_TYPES = ["전화 확인 요청", "방문 확인 요청", "대피소 안내 요청", "생활지원 요청"];

export default function HelpPage() {
  const { hydrated, mode, hasProfile, profile, selectedHazard, submitHelpRequest, getHousehold } = useAppState();
  const already = !!getHousehold(USER_HOUSEHOLD_ID)?.helpRequested;
  const isGuardian = mode === "guardian";

  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const toggle = (r: string) => setSelected((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]));

  // 복원 전
  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="shimmer h-24 w-full max-w-xs rounded-2xl" />
      </div>
    );
  }

  // 정보 미등록 → 안내
  if ((!mode || !hasProfile || !profile) && !already && !sent) {
    return (
      <div className="stagger flex h-full flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-soft text-2xl">📝</div>
        <p className="mt-4 font-display text-lg font-bold text-ink">정보 등록 후 이용할 수 있습니다</p>
        <p className="mt-1 max-w-xs text-sm text-forest/60">내 정보 또는 가족 정보를 등록하면 도움 요청을 보낼 수 있어요.</p>
        <Link href="/user/profile" className="mt-4 rounded-2xl bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-pine">정보 등록하기</Link>
      </div>
    );
  }

  // 접수 완료 화면
  if (sent || already) {
    const list = sent ? selected : getHousehold(USER_HOUSEHOLD_ID)?.helpReasons ?? [];
    return (
      <div className="stagger flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime/25 animate-fade-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-2xl font-bold text-white">✓</div>
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">
            {isGuardian ? "가족 도움 요청이 접수되었습니다" : "도움 요청이 접수되었습니다"}
          </h1>
          <p className="mt-2 max-w-xs text-forest/70">관리자에게 전달되어 확인 중입니다. 곧 담당자가 확인하고 연락드립니다.</p>
          {list.length > 0 && (
            <div className="mt-5 w-full max-w-xs rounded-2xl bg-white p-4 text-left ring-1 ring-ink/8">
              <p className="text-xs font-bold uppercase tracking-wide text-forest/45">요청 내용</p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {list.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-green" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2.5 pt-4">
          <Link href="/admin" className="rounded-2xl bg-forest py-3.5 text-center font-bold text-white transition hover:bg-pine">관리자 화면에서 확인 (데모)</Link>
          <Link href="/user" className="rounded-2xl bg-white py-3 text-center font-semibold text-forest ring-1 ring-ink/10">홈으로</Link>
        </div>
      </div>
    );
  }

  const risk = assessRisk(profile!, selectedHazard);
  const band = riskBand(risk.score);
  const def = HAZARDS[selectedHazard];
  const helpMsg = buildHelpMessage(profile!, risk, mode!, selected);

  function send() {
    submitHelpRequest(selected);
    setSent(true);
  }

  return (
    <div className="stagger flex min-h-full flex-col">
      <div>
        <p className="text-sm text-forest/55">{isGuardian ? "보호자 확인 모드" : "본인 안전 모드"}</p>
        <h1 className="font-display text-xl font-extrabold text-ink">{isGuardian ? "가족 도움 요청" : "도움 요청"}</h1>
      </div>

      {/* 1. 긴급 안내 */}
      <div className="mt-4 rounded-2xl bg-ember-soft/70 p-3.5 ring-1 ring-ember/25">
        <p className="text-sm font-bold text-ember-ink">긴급 상황이면 119에 먼저 연락하세요.</p>
        <p className="mt-0.5 text-xs text-ember-ink/80">이 기능은 신고를 대신하지 않는 데모입니다.</p>
        <a href="tel:119" className="mt-2 block rounded-xl bg-ember py-2.5 text-center text-sm font-bold text-white transition hover:brightness-105">
          119에 바로 전화하기
        </a>
      </div>

      {/* 2. 현재 위험 요약 */}
      <section className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-ink/8">
        <p className="text-sm font-bold text-ink">현재 위험 요약</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: def.theme.soft, color: def.theme.ink }}>{def.emoji} {def.label}</span>
          <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: band.soft, color: band.ink }}>{risk.score}점 · {band.label}</span>
          <span className="text-xs text-forest/55">{profile!.region || "동네 미입력"}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {risk.tags.map((t) => (
            <span key={t} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-forest/75">{t}</span>
          ))}
        </div>
      </section>

      {/* 3. 요청 유형 선택 */}
      <section className="mt-4">
        <p className="mb-2 text-sm font-bold text-pine">어떤 도움이 필요하세요?</p>
        <div className="flex flex-col gap-2">
          {REQUEST_TYPES.map((r) => {
            const on = selected.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggle(r)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  on ? "bg-forest text-white" : "bg-white text-ink ring-1 ring-ink/8 hover:ring-green/30"
                }`}
              >
                {r}
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold ${on ? "border-lime bg-lime text-forest" : "border-ink/15 text-transparent"}`}>✓</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <ShelterSheet hazard={selectedHazard} label="대피소·쉼터 먼저 보기" className="w-full rounded-2xl bg-white py-3 text-center text-sm font-semibold text-forest ring-1 ring-ink/8 transition hover:ring-green/30" />
        </div>
      </section>

      {/* 4. 요청 문구 자동 생성 */}
      <section className="mt-4 rounded-2xl bg-mint-soft/50 p-4 ring-1 ring-green/12">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-pine">요청 문구 (자동 생성)</p>
          <CopyButton text={helpMsg} label="문구 복사" />
        </div>
        <p className="mt-2 rounded-xl bg-white/70 p-3 text-sm leading-relaxed text-ink">{helpMsg}</p>
      </section>

      {/* 전송 */}
      <div className="sticky bottom-0 -mx-5 mt-5 border-t border-ink/8 bg-paper-warm/95 px-5 py-3 backdrop-blur-md">
        <button
          onClick={send}
          disabled={selected.length === 0}
          className="w-full rounded-2xl bg-ember py-4 text-center font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-forest/40"
        >
          {selected.length > 0 ? `관리자에게 도움 요청 (${selected.length})` : "요청 유형을 선택해주세요"}
        </button>
        <p className="mt-2 text-center text-[0.7rem] leading-relaxed text-forest/45">{DISCLAIMER}</p>
      </div>
    </div>
  );
}
