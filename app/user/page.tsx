"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import {
  assessRisk,
  buildShareMessage,
  riskBand,
  HAZARDS,
  TODAY_LABEL,
  UPDATED_LABEL,
  DISCLAIMER,
} from "@/lib/hazards";
import type { UserMode } from "@/lib/types";
import { HazardChips } from "@/components/HazardChips";
import { RiskDial } from "@/components/user/RiskDial";
import { RiskDetails } from "@/components/user/RiskDetails";
import { ShelterSheet } from "@/components/user/ShelterSheet";
import { CopyButton } from "@/components/CopyButton";
import { defaultProfile } from "@/lib/profile";
import { USER_HOUSEHOLD_ID } from "@/lib/mock/households";

// 한글 받침에 따라 은/는 선택
function topicParticle(word: string): string {
  const c = word.charCodeAt(word.length - 1);
  if (Number.isNaN(c) || c < 0xac00 || c > 0xd7a3) return "은(는)";
  return (c - 0xac00) % 28 === 0 ? "는" : "은";
}

export default function UserHome() {
  const { hydrated, mode, hasProfile, profile, selectedHazard, setHazard, setMode, saveProfile, getHousehold } = useAppState();

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [showShare, setShowShare] = useState(false);
  const [called, setCalled] = useState(false);
  const [visitFlagged, setVisitFlagged] = useState(false);

  // 복원 전 — 깜빡임 방지
  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="shimmer h-24 w-full max-w-xs rounded-2xl" />
      </div>
    );
  }

  // 1) 모드 미선택 → 모드 선택 화면
  if (!mode) return <ModeSelect onPick={setMode} />;

  // 2) 모드 있으나 프로필 없음 → "정보 등록 필요" 안내 (입력폼은 /user/profile 에서만)
  if (!hasProfile || !profile) {
    const isGuardian = mode === "guardian";
    return (
      <div className="stagger flex min-h-full flex-col justify-center gap-5">
        <div className="rounded-xl3 bg-white p-6 ring-1 ring-green/10 shadow-soft">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-pine">
            {isGuardian ? "보호자 확인 모드" : "본인 안전 모드"}
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold leading-snug text-ink">
            {isGuardian
              ? "확인할 가족 정보를 등록하면 위험도를 확인할 수 있어요"
              : "내 안전 정보를 등록하면 위험도를 확인할 수 있어요"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-forest/65">
            주거 형태와 건강·생활 조건을 입력하면 오늘의 생활재난 위험도와 행동요령을 안내합니다.
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <Link href="/user/profile" className="rounded-2xl bg-forest py-3.5 text-center font-bold text-white transition hover:bg-pine">
              직접 입력하기
            </Link>
            <button
              onClick={() => saveProfile(defaultProfile(mode))}
              className="rounded-2xl bg-lime py-3.5 text-center font-bold text-forest transition hover:brightness-105"
            >
              샘플 정보로 체험하기
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-forest/45">🔒 입력 정보는 이 브라우저에만 저장됩니다.</p>
        </div>
        <p className="text-center text-xs leading-relaxed text-forest/45">{DISCLAIMER}</p>
      </div>
    );
  }

  // 3) 홈
  const isGuardian = mode === "guardian";
  const risk = assessRisk(profile, selectedHazard);
  const band = riskBand(risk.score);
  const def = HAZARDS[selectedHazard];
  const requested = !!getHousehold(USER_HOUSEHOLD_ID)?.helpRequested;
  const shareMsg = buildShareMessage(profile, risk, mode);
  const careNeeded = band.key === "alert" || band.key === "danger";
  const toggle = (i: number) => setChecked((s) => ({ ...s, [i]: !s[i] }));

  const copy = isGuardian
    ? { todo: "오늘 보호자가 확인할 일", basis: "등록한 가족 정보 기준으로 계산한 위험도입니다.", share: "보호자 공유 문구", shareTitle: "보호자가 가족에게 보낼 문구", editInfo: "가족 정보 수정" }
    : { todo: "오늘 내가 할 일", basis: "현재 입력한 내 정보 기준으로 계산한 위험도입니다.", share: "가족에게 공유 문구", shareTitle: "가족에게 보낼 문구", editInfo: "내 정보 수정" };

  return (
    <div className="stagger flex flex-col gap-5">
      {/* 상단 카드 */}
      <section className="rounded-xl3 bg-gradient-to-br from-forest to-pine p-5 text-white shadow-soft">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">{TODAY_LABEL}</p>
            <p className="mt-0.5 text-sm text-mint">
              {isGuardian ? `등록 가족 · ${profile.name || "가족"}` : `${profile.region || "우리 동네"} · ${profile.name || "나"}`}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-mint">{UPDATED_LABEL}</span>
        </div>
        <div className="mt-3 rounded-2xl bg-white/10 px-3.5 py-3">
          <p className="text-xs font-semibold text-lime">현재 주요 위험 · {def.label}</p>
          <p className="mt-0.5 text-sm text-white/85">{def.today.alert} · {def.today.headline}</p>
        </div>
        {isGuardian && (
          <div className="mt-2 flex gap-2">
            <span className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white/85">등록 가족 <b className="text-lime">1</b>명</span>
            <span className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold ${careNeeded ? "bg-lime text-forest" : "bg-white/10 text-white/85"}`}>
              안부 확인 {careNeeded ? "필요" : "양호"}
            </span>
          </div>
        )}
      </section>

      {/* 재난 유형 선택 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-forest/45">재난 유형을 선택하면 위험도와 행동요령이 바뀝니다</p>
        <HazardChips value={selectedHazard} onChange={setHazard} size="sm" />
      </div>

      {/* 메인 상태 문구 */}
      <section
        className="rounded-xl3 p-4 ring-1"
        style={{ background: def.theme.soft, borderColor: def.theme.fg, boxShadow: `inset 0 0 0 1px ${def.theme.fg}22` }}
      >
        <p className="font-display text-base font-extrabold" style={{ color: def.theme.ink }}>
          {isGuardian
            ? `${profile.name || "가족"}${topicParticle(profile.name || "가족")} 오늘 ${def.label} ${band.label}입니다.`
            : `오늘은 ${def.label} 위험이 ${band.label} 단계입니다.`}
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: def.theme.ink }}>{risk.description}</p>
      </section>

      {/* 누가 위험 — 카드 */}
      <section className="rounded-xl3 bg-white p-5 ring-1 ring-green/10 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg font-extrabold text-ink">{profile.name || (isGuardian ? "등록 가족" : "우리 집")}</p>
              {isGuardian && profile.relation && (
                <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-bold text-pine">{profile.relation}</span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-forest/60">
              {profile.ageBand}{profile.alone ? " · 독거" : ""} · {profile.housing}{profile.region ? ` · ${profile.region}` : ""}
            </p>
          </div>
          <span className="shrink-0 rounded-full px-3 py-1 text-xs font-bold" style={{ background: band.soft, color: band.ink }}>
            주의 단계 · {band.label}
          </span>
        </div>

        <div className="mt-4">
          <RiskDial score={risk.score} label={band.label} color={band.fg} />
        </div>
        <p className="mt-2 text-center text-xs text-forest/50">{copy.basis}</p>

        <div className="mt-4">
          <RiskDetails chips={risk.tags} reason={risk.description} breakdown={risk.breakdown} />
        </div>
      </section>

      {/* 도움 요청 상태 / CTA */}
      {requested ? (
        <div className="rounded-xl3 bg-ember-soft p-4 ring-1 ring-ember/25">
          <p className="flex items-center gap-2 font-bold text-ember-ink">
            <span className="h-2 w-2 rounded-full bg-ember animate-pulse" />
            {isGuardian ? "가족 도움 요청이 접수되었습니다" : "도움 요청이 접수되었습니다"}
          </p>
          <p className="mt-1 text-sm text-ember-ink/80">관리자에게 전달되어 확인 중입니다.</p>
        </div>
      ) : (
        <Link href="/user/help" className="flex items-center justify-between rounded-xl3 bg-forest p-5 text-white shadow-soft transition hover:-translate-y-0.5">
          <div>
            <p className="font-display text-lg font-bold">{isGuardian ? "가족 대신 도움 요청" : "도움이 필요해요"}</p>
            <p className="text-sm text-mint">{isGuardian ? "가족 상태를 관리자에게 알릴 수 있어요" : "지금 상황을 관리자에게 알릴 수 있어요"}</p>
          </div>
          <span className="text-lime">→</span>
        </Link>
      )}

      {/* 오늘 할 일 */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-ink">{copy.todo}</h2>
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3.5 ring-1 ring-ink/8">
          {risk.checklist.map((it, i) => {
            const on = !!checked[i];
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-start gap-2.5 rounded-xl p-2 text-left transition ${on ? "bg-mint-soft/70" : "hover:bg-mist/60"}`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${on ? "border-green bg-green text-white" : "border-ink/20 text-transparent"}`}>✓</span>
                <span className={`text-sm ${on ? "text-forest/55 line-through" : "text-ink"}`}>{it}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 보호자 전용 — 확인 액션 */}
      {isGuardian && (
        <section className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setCalled((c) => !c)}
            className={`rounded-2xl py-3.5 text-center text-sm font-semibold transition ${called ? "bg-forest text-white" : "bg-white text-forest ring-1 ring-ink/8 hover:ring-green/30"}`}
          >
            {called ? "전화 확인 완료 ✓" : "전화 확인하기"}
          </button>
          <button
            onClick={() => setVisitFlagged((v) => !v)}
            className={`rounded-2xl py-3.5 text-center text-sm font-semibold transition ${visitFlagged ? "bg-amber text-white" : "bg-white text-forest ring-1 ring-ink/8 hover:ring-green/30"}`}
          >
            {visitFlagged ? "방문 필요 표시됨" : "방문 필요 표시"}
          </button>
        </section>
      )}

      {/* 액션 버튼 그룹 */}
      <section className="grid grid-cols-2 gap-2.5">
        <ShelterSheet hazard={selectedHazard} label={isGuardian ? "대피소·쉼터 안내" : "대피소·쉼터 보기"} />
        <button
          onClick={() => setShowShare((s) => !s)}
          className="rounded-2xl bg-white py-3.5 text-center text-sm font-semibold text-forest ring-1 ring-ink/8 transition hover:ring-green/30"
        >
          {copy.share} 만들기
        </button>
        <Link href="/user/profile" className="col-span-2 rounded-2xl bg-white py-3.5 text-center text-sm font-semibold text-forest ring-1 ring-ink/8 transition hover:ring-green/30">
          {copy.editInfo}
        </Link>
      </section>

      {/* 공유 문구 패널 */}
      {showShare && (
        <section className="animate-fade-up rounded-2xl bg-white p-4 ring-1 ring-ink/8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">{copy.shareTitle}</p>
            <CopyButton text={shareMsg} label="문구 복사" />
          </div>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-mist/60 p-3 text-xs leading-relaxed text-forest/80">{shareMsg}</pre>
          <p className="mt-2 text-xs text-forest/45">문구를 복사해 문자·메신저로 전달하세요. (실제 전송은 하지 않습니다.)</p>
        </section>
      )}

      {/* 안내 문구 (필수) */}
      <p className="pt-1 text-center text-xs leading-relaxed text-forest/45">{DISCLAIMER}</p>
    </div>
  );
}

/* ── 모드 선택 화면 ─────────────────────────────────────── */
function ModeSelect({ onPick }: { onPick: (m: UserMode) => void }) {
  return (
    <div className="stagger flex min-h-full flex-col">
      <div className="pt-2">
        <p className="text-sm text-forest/55">생활재난 안전 앱</p>
        <h1 className="font-display text-2xl font-extrabold leading-tight text-ink">어떤 방식으로 사용할까요?</h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/65">선택한 방식은 이 브라우저에 저장되며, 나중에 바꿀 수 있어요.</p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <ModeCard
          onClick={() => onPick("self")}
          variant="dark"
          tag="본인 안전 모드"
          title="나의 재난 위험 확인"
          desc="내가 사는 집 기준으로 오늘의 위험과 해야 할 일을 확인합니다."
          cta="본인 모드로 시작"
        />
        <ModeCard
          onClick={() => onPick("guardian")}
          variant="white"
          tag="보호자 확인 모드"
          title="가족·부모님 안전 확인"
          desc="떨어져 사는 가족의 재난 위험과 안부 확인 필요 여부를 확인합니다."
          cta="보호자 모드로 시작"
        />
      </div>

      <p className="mt-auto pt-8 text-center text-xs leading-relaxed text-forest/45">{DISCLAIMER}</p>
    </div>
  );
}

function ModeCard({
  onClick,
  variant,
  tag,
  title,
  desc,
  cta,
}: {
  onClick: () => void;
  variant: "dark" | "white";
  tag: string;
  title: string;
  desc: string;
  cta: string;
}) {
  const v = {
    dark: { card: "bg-forest text-white shadow-lift", tag: "text-mint", title: "text-white", desc: "text-white/75", btn: "bg-lime text-forest" },
    white: { card: "bg-white ring-1 ring-green/15 shadow-soft", tag: "text-green", title: "text-ink", desc: "text-forest/65", btn: "bg-forest text-white" },
  }[variant];
  return (
    <button onClick={onClick} className={`group flex flex-col rounded-xl3 p-6 text-left transition hover:-translate-y-0.5 ${v.card}`}>
      <span className={`text-sm font-semibold ${v.tag}`}>{tag}</span>
      <span className={`mt-1.5 font-display text-xl font-extrabold ${v.title}`}>{title}</span>
      <span className={`mt-2 text-sm leading-relaxed ${v.desc}`}>{desc}</span>
      <span className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition group-hover:gap-3 ${v.btn}`}>
        {cta} <span aria-hidden>→</span>
      </span>
    </button>
  );
}
