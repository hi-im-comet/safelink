"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import { CopyButton } from "@/components/CopyButton";
import {
  CAREGIVER_HELP_CATEGORIES,
  HELP_CATEGORIES,
  HELP_CONTACTS,
  actionsFromTags,
  tagsFromItems,
} from "@/lib/mock/help";
import { GUARDIAN_TARGET } from "@/lib/mock/guardian";
import { USER_HOUSEHOLD_ID, GUARDIAN_TARGET_ID } from "@/lib/mock/households";

// 연락 대상별로 보여줄 사유 카테고리 (관계없는 아코디언은 숨김)
const CONTACT_CATEGORIES: Record<string, string[]> = {
  "119": ["emergency"],
  gov: ["cooling", "visit", "shelter"],
  guardian: ["call", "shelter"],
  worker: ["call", "visit"],
};

export default function HelpPage() {
  const { caregiverMode, submitHelpRequest, getHousehold, userInfo } = useAppState();
  const targetId = caregiverMode ? GUARDIAN_TARGET_ID : USER_HOUSEHOLD_ID;
  const target = getHousehold(targetId);
  const categories = caregiverMode ? CAREGIVER_HELP_CATEGORIES : HELP_CATEGORIES;

  const [contactKey, setContactKey] = useState("gov");
  const visibleCategories = categories.filter((c) => CONTACT_CATEGORIES[contactKey]?.includes(c.key));
  const [openKey, setOpenKey] = useState<string | null>(
    () => categories.find((c) => CONTACT_CATEGORIES.gov.includes(c.key))?.key ?? null,
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [alone, setAlone] = useState("");
  const [helper, setHelper] = useState("");
  const [notifyGuardian, setNotifyGuardian] = useState(false);
  const [sent, setSent] = useState(false);
  const already = !!target?.helpRequested;
  const contact = HELP_CONTACTS.find((c) => c.key === contactKey)!;

  function selectContact(key: string) {
    setContactKey(key);
    setSelected([]);
    setOpenKey(categories.find((c) => CONTACT_CATEGORIES[key]?.includes(c.key))?.key ?? null);
  }

  const emergencyText = `[비상정보] 이름 ${userInfo.name || "-"} · 생년월일 ${userInfo.birth || "-"} · 혈액형 ${userInfo.blood || "-"}${userInfo.rh && userInfo.rh !== "확실하지 않아요" ? " " + userInfo.rh : ""} · 기저질환 ${userInfo.chronic === "있음" ? userInfo.conditions || "있음" : "없음"} · 복용약 ${userInfo.medications || (userInfo.meds === "있음" ? "있음" : "없음")} · 알레르기 ${userInfo.allergy || "-"} · 보호자 ${userInfo.guardianPhone || "-"}`;

  function toggleItem(label: string) {
    setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
  }
  function send() {
    const tags = tagsFromItems(selected, categories);
    submitHelpRequest(
      targetId,
      { reasons: selected, tags, recommendedActions: actionsFromTags(tags), contactTag: contact.tag },
      caregiverMode ? "guardian" : "user",
    );
    setSent(true);
  }

  if (sent || already) {
    const reasons = sent ? selected : target?.helpReasons ?? [];
    const dest = sent ? contact.label : "";
    const nearbyText = [
      alone ? (alone === "예" ? "혼자 있음" : "동거인 있음") : "",
      helper ? (helper === "예" ? "현장 도움 가능" : "현장 도움 어려움") : "",
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <div className="stagger flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime/25 animate-fade-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-2xl font-bold text-white">✓</div>
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">
            {caregiverMode ? "보호자 요청이 접수되었습니다" : "도움 요청이 접수되었습니다"}
          </h1>
          <p className="mt-2 max-w-xs text-forest/70">
            {caregiverMode ? "담당자가 확인 후 필요한 조치를 검토합니다." : "곧 담당 복지사가 확인하고 연락드립니다."}
          </p>
          <div className="mt-5 w-full max-w-xs rounded-2xl bg-white p-4 text-left ring-1 ring-ink/8">
            {dest && (
              <p className="text-sm">
                <span className="font-semibold text-forest/60">요청 대상: </span>
                <span className="font-bold text-pine">{dest}</span>
              </p>
            )}
            {sent && nearbyText && (
              <p className="mt-1 text-sm">
                <span className="font-semibold text-forest/60">주변 상황: </span>
                <span className="text-ink">{nearbyText}</span>
              </p>
            )}
            {sent && contact.key === "119" && notifyGuardian && (
              <p className="mt-1 text-sm text-ember-ink">보호자에게 함께 알림 요청</p>
            )}
            {reasons.length > 0 && (
              <>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-forest/45">요청 내용</p>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {reasons.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm text-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-green" /> {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-forest/45">다음 조치</p>
            <p className="mt-1 text-sm text-forest/70">담당자가 요청 내용을 확인한 뒤 전화 또는 방문 여부를 검토합니다.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 pt-4">
          <Link href="/admin" className="rounded-2xl bg-forest py-3.5 text-center font-bold text-white transition hover:bg-pine">
            관리자 화면에서 확인 (데모)
          </Link>
          <Link href="/user" className="rounded-2xl bg-white py-3 text-center font-semibold text-forest ring-1 ring-ink/10">홈으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stagger flex min-h-full flex-col">
      <div>
        <p className="text-sm text-forest/55">도움 요청</p>
        <h1 className="font-display text-xl font-extrabold text-ink">
          {caregiverMode ? `${GUARDIAN_TARGET.relation}께 어떤 도움이 필요할까요?` : "어떤 도움이 필요하세요?"}
        </h1>
        <p className="mt-1 text-sm text-forest/60">
          {caregiverMode
            ? "부모님 상태를 대신 확인 요청할 항목을 골라주세요."
            : "필요한 조치를 선택해주세요. 선택한 내용에 따라 담당자가 확인합니다."}
        </p>
      </div>

      {/* 연락 대상 선택 */}
      <section className="mt-5">
        <h2 className="text-sm font-bold text-pine">어디로 도움을 요청할까요?</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {HELP_CONTACTS.map((c) => {
            const on = contactKey === c.key;
            return (
              <button
                key={c.key}
                onClick={() => selectContact(c.key)}
                className={`rounded-2xl p-3 text-left ring-1 transition ${
                  on
                    ? c.urgent
                      ? "bg-ember text-white ring-transparent"
                      : "bg-forest text-white ring-transparent"
                    : "bg-white ring-ink/8 hover:ring-green/30"
                }`}
              >
                <span className={`block text-sm font-bold ${on ? "text-white" : "text-ink"}`}>{c.label}</span>
                <span className={`mt-0.5 block text-xs leading-snug ${on ? "text-white/80" : "text-forest/55"}`}>
                  {caregiverMode ? c.descCaregiver ?? c.desc : c.desc}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 rounded-xl bg-ember-soft px-3 py-2 text-xs font-semibold text-ember-ink">
          응급 증상이 있으면 앱 접수보다 119에 바로 연락하세요.
        </p>

        {contact.key === "119" ? (
          <div className="mt-2 rounded-2xl bg-ember-soft/70 p-3 ring-1 ring-ember/25">
            <p className="text-xs font-semibold text-ember-ink">응급 증상을 선택하고, 아래로 바로 연결하세요.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href="tel:119" className="rounded-xl bg-ember py-2.5 text-center text-sm font-bold text-white transition hover:brightness-105">
                119에 바로 전화하기
              </a>
              <div className="flex items-center justify-center rounded-xl bg-white py-1.5 ring-1 ring-ember/20">
                <CopyButton text={emergencyText} label="비상정보 복사" />
              </div>
            </div>
            <button onClick={() => setNotifyGuardian((v) => !v)} className="mt-2 flex w-full items-center gap-2 text-sm font-semibold text-ember-ink">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold ${notifyGuardian ? "border-ember bg-ember text-white" : "border-ember/40 text-transparent"}`}>✓</span>
              보호자에게 함께 알림
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-forest/55">
            {contact.key === "gov"
              ? "냉방비·냉방용품·무더위쉼터·방문 지원 중심으로 전달됩니다."
              : contact.key === "guardian"
                ? "보호자에게 현재 상태 요약과 함께 알림이 전달됩니다."
                : "전화 확인·방문 확인·등록 가구 확인 요청으로 전달됩니다."}
          </p>
        )}
      </section>

      {/* 사유 카테고리 */}
      <div className="mt-5 flex flex-col gap-2.5">
        {visibleCategories.map((cat) => {
          const open = openKey === cat.key;
          const count = cat.items.filter((it) => selected.includes(it)).length;
          return (
            <div key={cat.key} className={`overflow-hidden rounded-2xl ring-1 transition ${count > 0 ? "ring-green/30" : "ring-ink/8"}`}>
              <button onClick={() => setOpenKey(open ? null : cat.key)} className="flex w-full items-center justify-between gap-2 bg-white px-4 py-3.5 text-left">
                <span className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-ink">{cat.label}</span>
                  {count > 0 && <span className="tnum rounded-full bg-forest px-2 py-0.5 text-xs font-bold text-lime">{count}</span>}
                </span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={`shrink-0 text-forest/40 transition ${open ? "rotate-180" : ""}`}>
                  <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {open && (
                <div className="flex flex-col gap-2 border-t border-ink/5 bg-mist/40 p-3">
                  {cat.items.map((it) => {
                    const on = selected.includes(it);
                    return (
                      <button
                        key={it}
                        onClick={() => toggleItem(it)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                          on ? "bg-forest text-white" : "bg-white text-ink ring-1 ring-ink/8 hover:ring-green/30"
                        }`}
                      >
                        {it}
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold ${on ? "border-lime bg-lime text-forest" : "border-ink/15 text-transparent"}`}>
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 주변 도움 상황 — 두 가지 질문 */}
      <section className="mt-5 flex flex-col gap-3">
        <YesNo label="지금 혼자 있나요?" value={alone} onChange={setAlone} />
        <YesNo label="현장에서 바로 도와줄 사람이 있나요?" value={helper} onChange={setHelper} />
      </section>

      <div className="sticky bottom-0 -mx-5 mt-5 border-t border-ink/8 bg-paper-warm/95 px-5 py-3 backdrop-blur-md">
        <button
          onClick={send}
          disabled={selected.length === 0}
          className="w-full rounded-2xl bg-ember py-4 text-center font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-forest/40"
        >
          {selected.length > 0 ? `${contact.label}에 도움 요청 (${selected.length})` : "항목을 선택해주세요"}
        </button>
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-ink/8">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="flex gap-1.5">
        {["예", "아니오"].map((o) => (
          <button
            key={o}
            onClick={() => onChange(value === o ? "" : o)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              value === o ? "bg-forest text-white" : "bg-mist text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
