"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store/AppState";
import { CopyButton } from "@/components/CopyButton";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={`shrink-0 text-forest/40 transition ${open ? "rotate-180" : ""}`}>
      <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-xl3 bg-white ring-1 ring-ink/8">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
        <span className="font-display font-bold text-ink">{title}</span>
        <Chevron open={open} />
      </button>
      {open && <div className="flex flex-col gap-3.5 border-t border-ink/5 p-4">{children}</div>}
    </section>
  );
}

// 쉼표로 join된 문자열을 배열처럼 다루는 추가/삭제 입력
function TagList({ value, onChange, placeholder, addLabel }: { value: string; onChange: (v: string) => void; placeholder: string; addLabel: string }) {
  const list = value ? value.split(",").filter(Boolean) : [];
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v) {
      onChange([...list, v].join(","));
      setDraft("");
    }
  };
  return (
    <div>
      {list.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          {list.map((it, i) => (
            <div key={`${it}-${i}`} className="flex items-center justify-between rounded-xl bg-mist px-3.5 py-2">
              <span className="text-sm font-medium text-ink">{it}</span>
              <button onClick={() => onChange(list.filter((_, j) => j !== i).join(","))} className="text-xs font-semibold text-ember">삭제</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-forest/35 focus:border-green/50"
        />
        <button onClick={add} className="shrink-0 rounded-xl bg-forest px-3.5 py-2 text-sm font-bold text-white transition hover:bg-pine">{addLabel}</button>
      </div>
    </div>
  );
}

export default function MyPage() {
  const { userInfo, saveUserInfo, caregiverMode, setCaregiverMode, hydrated } = useAppState();
  const [values, setValues] = useState<Record<string, string>>(userInfo);
  const [saved, setSaved] = useState(false);

  const synced = useRef(false);
  useEffect(() => {
    if (hydrated && !synced.current) {
      synced.current = true;
      setValues(userInfo);
    }
  }, [hydrated, userInfo]);

  const set = (k: string, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setSaved(false);
  };

  // 입력 헬퍼
  const Text = (k: string, label: string, placeholder?: string) => (
    <div key={k}>
      <p className="mb-1.5 text-sm font-medium text-forest/65">{label}</p>
      <input
        value={values[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink/10 bg-paper-warm px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-forest/35 focus:border-green/50"
      />
    </div>
  );
  const Select = (k: string, label: string, options: string[]) => (
    <div key={k}>
      <p className="mb-1.5 text-sm font-medium text-forest/65">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = values[k] === opt;
          return (
            <button
              key={opt}
              onClick={() => set(k, opt)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${on ? "bg-forest text-white" : "bg-mist text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  function save() {
    saveUserInfo(values);
    setSaved(true);
  }

  const emergencyText = `[비상정보]
이름: ${values.name || "-"}
생년월일: ${values.birth || "-"}
혈액형: ${values.blood}${values.rh !== "확실하지 않아요" ? ` ${values.rh}` : ""}
연락처: ${values.phone || "-"}
기저질환: ${values.chronic === "있음" ? values.conditions || "있음" : "없음"}
장애: ${values.disability === "있음" ? values.disabilityType || "있음" : "없음"}
복용약: ${values.medications || (values.meds === "있음" ? "있음" : "없음")}
자주 가는 병원: ${values.hospital || "-"}
보호자 연락처: ${values.guardianPhone || "-"}`;

  const emergencyCard: [string, string][] = [
    ["이름", values.name || "-"],
    ["생년월일", values.birth || "-"],
    ["혈액형", `${values.blood}${values.rh !== "확실하지 않아요" ? ` ${values.rh}` : ""}`],
    ["연락처", values.phone || "-"],
    ["기저질환", values.chronic === "있음" ? values.conditions || "있음" : "없음"],
    ["장애", values.disability === "있음" ? values.disabilityType || "있음" : "없음"],
    ["복용약", values.medications || (values.meds === "있음" ? "있음" : "없음")],
    ["자주 가는 병원", values.hospital || "-"],
    ["보호자 연락처", values.guardianPhone || "-"],
  ];

  return (
    <div className="stagger flex flex-col gap-4">
      <div>
        <p className="text-sm text-forest/55">마이페이지</p>
        <h1 className="font-display text-xl font-extrabold text-ink">내 정보</h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/65">폭염 위험도와 도움 요청 시 필요한 기본 정보를 관리합니다.</p>
      </div>

      {/* 보호자 기능 설정 */}
      <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
        <button onClick={() => setCaregiverMode(!caregiverMode)} className="flex w-full items-center justify-between gap-4 text-left">
          <div>
            <p className="font-semibold text-ink">부모님 또는 가족의 집을 대신 관리할게요</p>
            <p className="mt-1 text-sm text-forest/55">{caregiverMode ? "보호자 모드 사용 중" : "기본 모드 (내 집 기준)"}</p>
          </div>
          <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${caregiverMode ? "bg-forest" : "bg-ink/15"}`}>
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${caregiverMode ? "left-[1.4rem]" : "left-0.5"}`} />
          </span>
        </button>
        {caregiverMode && (
          <div className="mt-4 rounded-xl bg-mint-soft/60 p-3 text-sm text-forest/70">
            부모님·가족 집 정보는 <Link href="/user/profile" className="font-semibold text-pine">부모님 집 정보 설정</Link>에서 등록합니다.
          </div>
        )}
      </section>

      {/* 기본 정보 */}
      <Section title="기본 정보" defaultOpen>
        {Text("name", "이름", "홍길동")}
        {Text("birth", "생년월일", "1955-03-01")}
        {Select("gender", "성별", ["남", "여", "기타"])}
        {Select("blood", "혈액형 (ABO)", ["A", "B", "O", "AB", "확실하지 않아요"])}
        {Select("rh", "RH", ["Rh+", "Rh-", "확실하지 않아요"])}
        {Text("phone", "연락처", "010-0000-0000")}
        <p className="text-xs text-forest/45">혈액형은 위험도 계산이 아니라 비상 전달 정보로만 사용됩니다.</p>
      </Section>

      {/* 위치 정보 */}
      <Section title="위치 정보">
        {Text("regionSi", "날씨 분석 지역 (시군구)", "인천 미추홀구")}
        {Text("regionDong", "읍면동", "○○동")}
        {Text("visitAddress", "방문 지원 주소 (선택)", "동·건물 정도만")}
        <p className="text-xs leading-relaxed text-forest/45">상세주소는 LLM에 전달하지 않습니다. 방문 지원이 필요할 때만 담당자에게 전달됩니다.</p>
      </Section>

      {/* 건강 정보 */}
      <Section title="건강 정보">
        {Select("chronic", "기저질환 여부", ["없음", "있음"])}
        {values.chronic === "있음" && (
          <>
            <div>
              <p className="mb-1.5 text-sm font-medium text-forest/65">기저질환</p>
              <TagList value={values.conditions ?? ""} onChange={(v) => set("conditions", v)} placeholder="예: 고혈압, 당뇨, 심장질환 등" addLabel="질환 추가" />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-forest/65">질환 분류 (복수 선택)</p>
              <div className="flex flex-wrap gap-2">
                {["심혈관", "호흡기", "당뇨·대사", "신장", "정신·인지", "기타"].map((cat) => {
                  const list = (values.conditionCategory ?? "").split(",").filter(Boolean);
                  const on = list.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => set("conditionCategory", (on ? list.filter((x) => x !== cat) : [...list, cat]).join(","))}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${on ? "bg-forest text-white" : "bg-mist text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {Select("disability", "장애 여부", ["없음", "있음"])}
        {values.disability === "있음" && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-forest/65">장애 유형 또는 도움이 필요한 부분</p>
            <TagList value={values.disabilityType ?? ""} onChange={(v) => set("disabilityType", v)} placeholder="예: 지체장애, 시각장애, 이동 보조 필요 등" addLabel="추가" />
          </div>
        )}
        {Select("mobility", "이동 불편 여부", ["가능", "불편"])}
        {Select("meds", "복용 중인 약 여부", ["없음", "있음"])}
        {values.meds === "있음" && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-forest/65">복용 중인 약</p>
            <TagList value={values.medications ?? ""} onChange={(v) => set("medications", v)} placeholder="복용 중인 약 이름을 입력하세요" addLabel="약 추가" />
          </div>
        )}
        {Text("hospital", "자주 가는 병원", "○○의원")}
        {Text("hospitalPhone", "병원 연락처", "02-000-0000")}
        {Text("allergy", "알레르기 · 주의사항", "특이사항")}
      </Section>

      {/* 비상 연락 정보 */}
      <Section title="비상 연락 정보">
        {Text("guardianName", "보호자 이름", "보호자")}
        {Text("guardianRel", "보호자 관계", "자녀 등")}
        {Text("guardianPhone", "보호자 연락처", "010-0000-0000")}
        {Text("guardian2Phone", "추가 보호자 연락처", "(선택)")}
        {Select("guardianReach", "보호자 연락 가능", ["가능", "어려움"])}
        {Text("cohabitName", "동거인 이름", "(있으면)")}
        {Text("cohabitPhone", "동거인 연락처", "(있으면)")}
        {Select("emergencyPriority", "위급 시 연락 우선순위", ["보호자 → 119", "119 → 보호자", "동거인 → 보호자"])}
      </Section>

      {/* 생활·돌봄 정보 */}
      <Section title="생활 · 돌봄 정보">
        {Select("alone", "혼자 거주 여부", ["아니오", "예"])}
        {Select("helperCohabit", "도움을 줄 수 있는 동거인", ["예", "아니오"])}
        {Select("checkCycle", "최근 안부 확인 주기", ["매일", "주 1회", "2주 1회", "거의 없음"])}
        {Select("contactTime", "평소 연락 가능 시간대", ["오전", "오후", "저녁", "밤"])}
        {Select("careService", "돌봄 서비스 이용", ["이용", "미이용"])}
      </Section>

      {/* 119 전달용 비상정보 카드 */}
      <section className="rounded-xl3 bg-ember-soft/60 p-5 ring-1 ring-ember/20">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-ember-ink">119 전달용 비상정보</h2>
          <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-ember-ink">응급 대비</span>
        </div>
        <p className="mt-1 text-sm text-ember-ink/80">응급 상황에서 보호자나 119에 전달할 수 있도록 필요한 정보를 정리합니다.</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {emergencyCard.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-forest/45">{k}</dt>
              <dd className="text-sm font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex justify-end">
          <CopyButton text={emergencyText} label="비상정보 복사" />
        </div>
      </section>

      <button onClick={save} className="rounded-2xl bg-lime py-3.5 text-center font-bold text-forest transition hover:brightness-105">저장하기</button>
      {saved && <p className="text-center text-sm font-semibold text-green animate-fade-up">저장되었습니다.</p>}

      <ul className="flex flex-col gap-1 text-center text-xs leading-relaxed text-forest/45">
        <li>이 정보는 폭염 위험도 계산과 도움 요청 시 필요한 확인 정보로 사용됩니다.</li>
        <li>이름·연락처·상세 건강정보 등 직접 식별정보는 LLM에 전달하지 않습니다.</li>
        <li>응급 상황에서는 앱 접수보다 119에 바로 연락하세요.</li>
      </ul>
    </div>
  );
}
