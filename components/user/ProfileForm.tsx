"use client";

import { useState } from "react";
import type { UserMode, UserProfile } from "@/lib/types";
import { FORM_SECTIONS, type FormField, type FormSection } from "@/lib/profile";
import { STORAGE_PRIVACY } from "@/lib/hazards";

export function ProfileForm({
  mode,
  initial,
  submitLabel,
  onSave,
}: {
  mode: UserMode;
  initial: UserProfile;
  submitLabel: string;
  onSave: (p: UserProfile) => void;
}) {
  const [v, setV] = useState<UserProfile>(initial);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const set = <K extends keyof UserProfile>(k: K, val: UserProfile[K]) => setV((s) => ({ ...s, [k]: val }));
  const isGuardian = mode === "guardian";

  const labelOf = (f: FormField) => f.label ?? (isGuardian ? f.guardianLabel : f.selfLabel) ?? "";
  const hintOf = (f: FormField) => (isGuardian ? f.guardianHint : f.selfHint) ?? f.hint;
  const phOf = (f: FormField) => (isGuardian ? f.guardianPlaceholder : f.selfPlaceholder) ?? f.placeholder;
  const titleOf = (s: FormSection) => s.title ?? (isGuardian ? s.guardianTitle : s.selfTitle) ?? "";
  const noteOf = (s: FormSection) => (isGuardian ? s.guardianNote : s.selfNote) ?? s.note;

  // 다중 선택 칩 — 없음/모름은 단독 선택으로 처리
  const toggleMulti = (key: keyof UserProfile, optKey: string) => {
    const cur = ((v[key] as string[]) ?? []).slice();
    if (optKey === "none" || optKey === "unknown") {
      set(key, (cur.includes(optKey) ? [] : [optKey]) as never);
      return;
    }
    const base = cur.filter((k) => k !== "none" && k !== "unknown");
    const next = base.includes(optKey) ? base.filter((k) => k !== optKey) : [...base, optKey];
    set(key, next as never);
  };

  const renderField = (f: FormField) => {
    if (f.type === "text") {
      return (
        <Field key={f.key} label={labelOf(f)}>
          <input
            value={(v[f.key] as string) ?? ""}
            onChange={(e) => set(f.key, e.target.value as never)}
            placeholder={phOf(f)}
            className="w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-forest/35 focus:border-green/50"
          />
        </Field>
      );
    }
    if (f.type === "textarea") {
      return (
        <Field key={f.key} label={labelOf(f)}>
          <textarea
            value={(v[f.key] as string) ?? ""}
            onChange={(e) => set(f.key, e.target.value as never)}
            placeholder={phOf(f)}
            rows={f.rows ?? 2}
            className="w-full resize-none rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-forest/35 focus:border-green/50"
          />
        </Field>
      );
    }
    if (f.type === "chips") {
      return (
        <Field key={f.key} label={labelOf(f)}>
          <Chips options={f.options ?? []} value={(v[f.key] as string) ?? ""} onChange={(o) => set(f.key, o as never)} />
        </Field>
      );
    }
    if (f.type === "keychips") {
      const cur = (v[f.key] as string) ?? "";
      return (
        <Field key={f.key} label={labelOf(f)}>
          <div className="flex flex-wrap gap-2">
            {(f.keyOptions ?? []).map((o) => (
              <ChipButton key={o.label} active={cur === o.key} onClick={() => set(f.key, (cur === o.key ? "" : o.key) as never)}>
                {o.label}
              </ChipButton>
            ))}
          </div>
        </Field>
      );
    }
    if (f.type === "multichips") {
      const cur = (v[f.key] as string[]) ?? [];
      return (
        <Field key={f.key} label={labelOf(f)}>
          <div className="flex flex-wrap gap-2">
            {(f.keyOptions ?? []).map((o) => (
              <ChipButton key={o.label} active={cur.includes(o.key)} onClick={() => toggleMulti(f.key, o.key)}>
                {o.label}
              </ChipButton>
            ))}
          </div>
        </Field>
      );
    }
    // toggle (예/아니오)
    return (
      <div key={f.key} className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{labelOf(f)}</p>
          {hintOf(f) && <p className="text-xs text-forest/50">{hintOf(f)}</p>}
        </div>
        <div className="flex shrink-0 gap-1.5">
          {[true, false].map((b) => (
            <button
              key={String(b)}
              type="button"
              onClick={() => set(f.key, b as never)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                v[f.key] === b ? "bg-forest text-white" : "bg-mist text-forest/60 ring-1 ring-ink/8 hover:ring-green/30"
              }`}
            >
              {b ? "예" : "아니오"}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3.5 pb-6">
      {FORM_SECTIONS.map((section, si) => {
        const flat = (section.fields ?? []).filter((f) => !(f.guardianOnly && !isGuardian));
        const groups = section.groups ?? [];
        if (flat.length === 0 && groups.length === 0) return null;
        const note = noteOf(section);
        const isOpen = section.collapsible ? !!open[si] : true;

        return (
          <section key={si} className="rounded-xl3 bg-white p-4 ring-1 ring-ink/8">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="font-display text-sm font-bold text-pine">{titleOf(section)}</h2>
              {section.badge && (
                <span className="rounded-full bg-lime/25 px-2 py-0.5 text-[0.68rem] font-bold text-forest">{section.badge}</span>
              )}
            </div>
            {note && <p className="mb-2 text-xs leading-relaxed text-forest/55">{note}</p>}

            {/* 민감정보 안내 (선택입력 섹션) — 접힘 상태에서도 항상 노출 */}
            {section.notice && (
              <p className="mb-3 rounded-xl bg-mint-soft/50 px-3 py-2 text-[0.72rem] leading-relaxed text-pine ring-1 ring-green/12">
                🔒 {section.notice}
              </p>
            )}

            {/* 평면 필드 */}
            {flat.length > 0 && <div className="flex flex-col gap-3">{flat.map(renderField)}</div>}

            {/* 접기/펼치기 토글 */}
            {section.collapsible && groups.length > 0 && (
              <button
                type="button"
                onClick={() => setOpen((s) => ({ ...s, [si]: !s[si] }))}
                className="flex w-full items-center justify-between rounded-xl bg-mist/50 px-3.5 py-2.5 text-sm font-semibold text-forest ring-1 ring-ink/8 transition hover:ring-green/30"
              >
                <span>{isOpen ? "상세 응급 정보 접기" : "상세 응급 정보 입력 펼치기"}</span>
                <span className="text-xs text-forest/50">{isOpen ? "▲" : `이동·질환·복용약·응급 등 ▾`}</span>
              </button>
            )}

            {/* 소제목 묶음 */}
            {groups.length > 0 && isOpen && (
              <div className="mt-3 flex flex-col gap-4">
                {groups.map((g) => {
                  const gf = g.fields.filter((f) => !(f.guardianOnly && !isGuardian));
                  if (gf.length === 0) return null;
                  return (
                    <div key={g.title} className="rounded-xl bg-mist/30 p-3.5 ring-1 ring-ink/5">
                      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-forest/50">{g.title}</h3>
                      <div className="flex flex-col gap-3">{gf.map(renderField)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* 개인정보 안내 (필수) */}
      <p className="rounded-xl bg-mint-soft/60 px-3.5 py-2.5 text-xs leading-relaxed text-pine ring-1 ring-green/12">
        🔒 {STORAGE_PRIVACY}
      </p>

      <button
        type="button"
        onClick={() => onSave(v)}
        className="rounded-2xl bg-lime py-3.5 text-center font-bold text-forest transition hover:brightness-105"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-forest/65">{label}</p>}
      {children}
    </div>
  );
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
        active ? "bg-forest text-white" : "bg-mist text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"
      }`}
    >
      {children}
    </button>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (o: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <ChipButton key={o} active={value === o} onClick={() => onChange(o)}>
          {o}
        </ChipButton>
      ))}
    </div>
  );
}
