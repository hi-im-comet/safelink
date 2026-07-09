"use client";

import { useState } from "react";
import type { UserMode, UserProfile } from "@/lib/types";
import { FORM_SECTIONS, type FormField } from "@/lib/profile";
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
  const set = <K extends keyof UserProfile>(k: K, val: UserProfile[K]) => setV((s) => ({ ...s, [k]: val }));

  const labelOf = (f: FormField) => f.label ?? (mode === "guardian" ? f.guardianLabel : f.selfLabel) ?? "";
  const hintOf = (f: FormField) => (mode === "guardian" ? f.guardianHint : f.selfHint) ?? f.hint;
  const phOf = (f: FormField) => (mode === "guardian" ? f.guardianPlaceholder : f.selfPlaceholder) ?? f.placeholder;

  return (
    <div className="flex flex-col gap-3.5">
      {FORM_SECTIONS.map((section) => {
        const fields = section.fields.filter((f) => !(f.guardianOnly && mode !== "guardian"));
        if (fields.length === 0) return null;
        return (
          <section key={section.title} className="rounded-xl3 bg-white p-4 ring-1 ring-ink/8">
            <h2 className="mb-3 font-display text-sm font-bold text-pine">{section.title}</h2>
            <div className="flex flex-col gap-3">
              {fields.map((f) => {
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
                if (f.type === "chips") {
                  return (
                    <Field key={f.key} label={labelOf(f)}>
                      <Chips options={f.options ?? []} value={(v[f.key] as string) ?? ""} onChange={(o) => set(f.key, o as never)} />
                    </Field>
                  );
                }
                // toggle
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
              })}
            </div>
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
      <p className="mb-1.5 text-sm font-medium text-forest/65">{label}</p>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (o: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
            value === o ? "bg-forest text-white" : "bg-mist text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
