"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import { computeProfileRisk, buildPlan } from "@/lib/risk/profileRisk";
import { RiskDial } from "@/components/user/RiskDial";
import { RiskDetails } from "@/components/user/RiskDetails";
import { USER_HOUSEHOLD_ID, GUARDIAN_TARGET_ID } from "@/lib/mock/households";
import { LOCATION, TODAY_LABEL, UPDATED_LABEL } from "@/lib/mock/weather";
import { CAREGIVER_INFO, EXPECTED_EFFECTS } from "@/lib/mock/user";
import { GUARDIAN_TARGET, SHELTERS } from "@/lib/mock/guardian";
import type { Grade } from "@/lib/types";

const USER_LABEL: Record<Grade, string> = { urgent: "위험 높음", call: "주의", guide: "행동요령", monitor: "안정" };

export default function UserHome() {
  const { caregiverMode, userProfile, caregiverProfile, userInfo, getHousehold, weather } = useAppState();
  const profile = caregiverMode ? caregiverProfile : userProfile;
  const info = caregiverMode ? CAREGIVER_INFO : userInfo;
  const risk = computeProfileRisk(profile, info, weather, caregiverMode);
  const plan = buildPlan(profile, weather, caregiverMode);

  const targetId = caregiverMode ? GUARDIAN_TARGET_ID : USER_HOUSEHOLD_ID;
  const requested = !!getHousehold(targetId)?.helpRequested;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showShelters, setShowShelters] = useState(false);
  const toggle = (key: string) => setChecked((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="stagger flex flex-col gap-5">
      {/* 오늘 — 날짜 · 지역 · 갱신 · 날씨 */}
      <section className="rounded-xl3 bg-gradient-to-br from-forest to-pine p-5 text-white shadow-soft">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">{TODAY_LABEL}</p>
            <p className="mt-0.5 text-sm text-mint">{caregiverMode ? `부모님 거주지 · ${LOCATION}` : LOCATION}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-mint">{UPDATED_LABEL}</span>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <span className="tnum text-4xl font-extrabold leading-none">{weather.highTemp}°</span>
          <div className="mb-0.5 text-sm leading-snug text-white/80">
            <p>체감 {weather.feelsLike}° · 습도 {weather.humidity}% · 열대야</p>
            <p className="font-bold text-lime">{weather.alert}</p>
          </div>
        </div>
      </section>

      <h1 className="font-display text-xl font-extrabold text-ink">{caregiverMode ? "부모님 폭염 안전" : "내 폭염 안전"}</h1>

      {/* 위험도 카드 */}
      {caregiverMode ? (
        <section className="rounded-xl3 bg-white p-5 ring-1 ring-ember/30 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-xl font-extrabold text-ink">{GUARDIAN_TARGET.relation}</p>
              <p className="mt-0.5 text-sm text-forest/60">{GUARDIAN_TARGET.ageBand} · {GUARDIAN_TARGET.living}</p>
            </div>
            <div className="text-right">
              <div className="tnum text-3xl font-extrabold leading-none text-ember">{risk.score}</div>
              <div className="text-xs font-semibold text-ember-ink">오늘 {USER_LABEL[risk.grade]}</div>
            </div>
          </div>
          <div className="mt-4">
            <RiskDetails chips={risk.chips} reason={risk.reason} breakdown={risk.breakdown} />
          </div>
        </section>
      ) : (
        <div className="rounded-xl3 bg-white p-6 ring-1 ring-green/10 shadow-soft">
          <p className="text-center text-sm font-medium text-forest/55">오늘의 위험도</p>
          <div className="mt-3">
            <RiskDial score={risk.score} grade={risk.grade} label={USER_LABEL[risk.grade]} />
          </div>
          <div className="mt-4">
            <RiskDetails chips={risk.chips} reason={risk.reason} breakdown={risk.breakdown} />
          </div>
        </div>
      )}

      {/* 도움 요청 상태 / CTA */}
      {requested ? (
        <div className="rounded-xl3 bg-ember-soft p-4 ring-1 ring-ember/25">
          <p className="flex items-center gap-2 font-bold text-ember-ink">
            <span className="h-2 w-2 rounded-full bg-ember animate-pulse" />
            {caregiverMode ? "보호자 요청이 접수되었습니다" : "도움 요청이 접수되었습니다"}
          </p>
          <p className="mt-1 text-sm text-ember-ink/80">관리자에게 전달되어 확인 중입니다.</p>
        </div>
      ) : caregiverMode ? (
        <div className="grid grid-cols-2 gap-3">
          <Link href="/user/help" className="rounded-2xl bg-forest py-3.5 text-center font-bold text-white transition hover:bg-pine">도움 요청</Link>
          <button onClick={() => setShowShelters((s) => !s)} className="rounded-2xl bg-white py-3.5 text-center font-semibold text-forest ring-1 ring-ink/8 transition hover:ring-green/30">
            무더위쉼터 안내
          </button>
        </div>
      ) : (
        <Link href="/user/help" className="flex items-center justify-between rounded-xl3 bg-forest p-5 text-white shadow-soft transition hover:-translate-y-0.5">
          <div>
            <p className="font-display text-lg font-bold">도움이 필요해요</p>
            <p className="text-sm text-mint">너무 덥거나, 냉방비가 부담되면 눌러주세요</p>
          </div>
          <span className="text-lime">→</span>
        </Link>
      )}

      {showShelters && caregiverMode && (
        <section className="animate-fade-up rounded-2xl bg-white p-4 ring-1 ring-ink/8">
          <p className="text-sm font-bold text-ink">가까운 무더위쉼터</p>
          <ul className="mt-2 flex flex-col gap-2">
            {SHELTERS.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-forest/80">{s.name}</span>
                <span className="text-xs text-pine">{s.walk}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 오늘의 행동계획 — 위험 요인과 연결, 시간 블록별 */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-ink">{caregiverMode ? "오늘 부모님께 할 일" : "오늘의 행동계획"}</h2>
        <div className="flex flex-col gap-3">
          {plan.map((blk, bi) => (
            <div key={bi} className="rounded-2xl bg-white p-3.5 ring-1 ring-ink/8">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="rounded-lg bg-forest px-2.5 py-1 font-display text-sm font-bold text-lime">{blk.block}</span>
                <span className="text-xs font-semibold text-forest/45">{blk.time}</span>
                <span className="ml-auto h-px flex-1 bg-ink/5" />
              </div>
              <div className="flex flex-col gap-1">
                {blk.items.map((it, ii) => {
                  const key = `${bi}-${ii}`;
                  const on = !!checked[key];
                  return (
                    <button
                      key={ii}
                      onClick={() => toggle(key)}
                      className={`flex items-start gap-2.5 rounded-xl p-2 text-left transition ${on ? "bg-mint-soft/70" : "hover:bg-mist/60"}`}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${on ? "border-green bg-green text-white" : "border-ink/20 text-transparent"}`}>
                        ✓
                      </span>
                      <span className={`text-sm ${on ? "text-forest/55 line-through" : "text-ink"}`}>{it}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 예상 효과 + 내 주거 요약 (기본 모드) */}
      {!caregiverMode && (
        <>
          <section className="rounded-xl3 bg-lime/15 p-4 ring-1 ring-lime/25">
            <p className="text-sm font-bold text-forest">이렇게 하면</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXPECTED_EFFECTS.map((e) => (
                <span key={e} className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-pine">{e}</span>
              ))}
            </div>
          </section>

          <section className="rounded-xl3 bg-white p-4 ring-1 ring-ink/8">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">나의 주거환경</h2>
              <Link href="/user/profile" className="text-sm font-semibold text-pine">수정</Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[profile.household, profile.direction, profile.floor, `에어컨 ${profile.ac}`, `냉방비 ${profile.cost}`, profile.dayStay].map((t) => (
                <span key={t} className="rounded-full bg-mist px-3 py-1 text-sm text-forest/75">{t}</span>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
