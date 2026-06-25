"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store/AppState";
import { PhotoUpload } from "@/components/user/PhotoUpload";

interface Field {
  key: string;
  label: string;
  options: string[];
  multi?: boolean;
}
interface Section {
  title: string;
  fields: Field[];
}

const SECTIONS: Section[] = [
  {
    title: "공통 집 정보",
    fields: [
      { key: "household", label: "주택 형태", options: ["원룸", "오피스텔", "아파트", "단독주택", "다세대"] },
      { key: "direction", label: "방향", options: ["북향", "북동향", "동향", "남동향", "남향", "남서향", "서향", "북서향"] },
      { key: "floor", label: "층·위치", options: ["반지하", "1층", "저층", "중층", "고층", "최상층"] },
      { key: "buildingAge", label: "건물 노후도", options: ["신축", "보통", "노후"] },
      { key: "insulation", label: "단열", options: ["좋음", "보통", "약함"] },
      { key: "windowSize", label: "창문 크기", options: ["작음", "보통", "큼"] },
      { key: "vent", label: "환기 가능성", options: ["잘 됨", "보통", "잘 안 됨"] },
      { key: "sealing", label: "창호 밀폐성", options: ["잘 막힘", "보통", "틈새 있음"] },
    ],
  },
  {
    title: "생활패턴",
    fields: [
      { key: "lifeRhythm", label: "주 생활 시간대", options: ["아침형", "낮 활동", "야간 활동", "불규칙"] },
      { key: "dayStay", label: "낮 시간 집 체류", options: ["거의 없음", "오후 잠깐", "오후 오래", "종일 재택"] },
      { key: "sleepTime", label: "취침 시간대", options: ["밤", "새벽", "오전", "불규칙"] },
      { key: "outdoor", label: "야외활동 빈도", options: ["적음", "보통", "많음"] },
      { key: "hotHome", label: "더운 시간대 집에 있는 편", options: ["아니요", "가끔", "자주", "거의 항상"] },
    ],
  },
  {
    title: "폭염",
    fields: [
      { key: "ac", label: "에어컨", options: ["없음", "벽걸이", "스탠드", "둘 다"] },
      { key: "fan", label: "선풍기", options: ["없음", "있음"] },
      { key: "curtain", label: "커튼·블라인드(차광)", options: ["없음", "일반", "암막"] },
      { key: "cost", label: "냉방비 부담", options: ["낮음", "보통", "높음"] },
      { key: "heatSensitivity", label: "더위 민감도", options: ["덜 타는 편", "보통", "많이 타는 편", "매우 힘든 편"] },
    ],
  },
  {
    title: "한파",
    fields: [
      { key: "heating", label: "난방 방식", options: ["개별난방", "중앙난방", "전기장판 중심", "난방 어려움"] },
      { key: "heatingCost", label: "난방비 부담", options: ["낮음", "보통", "높음"] },
      { key: "coldSensitivity", label: "추위 민감도", options: ["덜 타는 편", "보통", "많이 타는 편", "매우 힘든 편"] },
    ],
  },
  {
    title: "침수",
    fields: [
      { key: "lowland", label: "저지대 여부", options: ["아니오", "예"] },
      { key: "drainage", label: "배수 상태", options: ["좋음", "보통", "자주 막힘"] },
      { key: "entryHeight", label: "출입구 높이", options: ["지면보다 높음", "비슷함", "낮음"] },
      { key: "floodExp", label: "주변 침수 경험", options: ["없음", "가끔", "자주"] },
    ],
  },
  {
    title: "공기질",
    fields: [
      { key: "airPurifier", label: "공기청정기", options: ["있음", "없음"] },
      { key: "filterStatus", label: "필터 관리 상태", options: ["좋음", "보통", "약함"] },
    ],
  },
];

const MEMO_ANALYSIS: [string, string][] = [
  ["생활 리듬", "야간 활동 / 낮 시간 재택"],
  ["더위 민감도", "높음"],
  ["냉방 성향", "절약 우선"],
  ["주요 위험 요인", "오후 피크 시간 실내 과열, 냉방 사용 제한"],
  ["행동계획 반영", "오전 취침 전 짧은 냉방, 점심 전 차광, 오후 피크 공공 실내공간 이용 안내"],
];

export default function ProfilePage() {
  const { userProfile, caregiverProfile, caregiverMode, saveProfile, hydrated } = useAppState();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(caregiverMode ? caregiverProfile : userProfile);
  const [open, setOpen] = useState<Record<string, boolean>>({ [SECTIONS[0].title]: true });
  const [memoAnalyzed, setMemoAnalyzed] = useState(false);

  // localStorage 복원이 늦게 끝나는 경우(직접 새로고침) 저장된 값으로 한 번 맞춘다.
  const synced = useRef(false);
  useEffect(() => {
    if (hydrated && !synced.current) {
      synced.current = true;
      setValues(caregiverMode ? caregiverProfile : userProfile);
    }
  }, [hydrated, caregiverMode, caregiverProfile, userProfile]);

  const copy = caregiverMode
    ? { kicker: "보호자 모드 · 고정 프로필", title: "부모님 집 환경 분석", button: "저장하기", desc: "부모님 집의 방향, 창문, 단열, 층수, 냉난방 환경을 저장합니다." }
    : { kicker: "고정 프로필", title: "내 집 환경 분석", button: "저장하기", desc: "집의 방향, 창문, 단열, 층수, 냉난방 환경을 저장합니다." };

  const setField = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const toggleSection = (t: string) => setOpen((o) => ({ ...o, [t]: !o[t] }));

  const discomfort = (values.discomfort ?? "").split(",").filter(Boolean);
  function toggleDiscomfort(opt: string) {
    if (opt === "없음") return setField("discomfort", "");
    const set = new Set(discomfort);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    setField("discomfort", Array.from(set).join(","));
  }
  const discomfortOn = (opt: string) => (opt === "없음" ? discomfort.length === 0 : discomfort.includes(opt));

  const summary = (s: Section) =>
    s.fields.map((f) => (f.key === "discomfort" ? values.discomfort || "없음" : values[f.key])).filter(Boolean).join(" · ");

  function save() {
    saveProfile(values);
    router.push("/user");
  }

  return (
    <div className="stagger flex flex-col gap-4">
      <div>
        <p className="text-sm text-forest/55">{copy.kicker}</p>
        <h1 className="font-display text-xl font-extrabold text-ink">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/65">
          {copy.desc} 이 정보는 매일 날씨와 함께 반영되어 폭염·한파·침수 등 오늘의 기후위험을 판단하는 데 사용됩니다.
        </p>
      </div>

      {/* 입력 섹션 (접기/펼치기 카드) */}
      {SECTIONS.map((section) => {
        const isOpen = !!open[section.title];
        return (
          <section key={section.title} className="overflow-hidden rounded-xl3 bg-white ring-1 ring-ink/8">
            <button onClick={() => toggleSection(section.title)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
              <span className="min-w-0">
                <span className="font-display font-bold text-ink">{section.title}</span>
                {!isOpen && <span className="ml-2 truncate text-xs text-forest/45">{summary(section)}</span>}
              </span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={`shrink-0 text-forest/40 transition ${isOpen ? "rotate-180" : ""}`}>
                <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div className="flex flex-col gap-3.5 border-t border-ink/5 p-4">
                {section.fields.map((f) => (
                  <div key={f.key}>
                    <p className="mb-1.5 text-sm font-medium text-forest/65">{f.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.options.map((opt) => {
                        const on = f.multi ? discomfortOn(opt) : values[f.key] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => (f.multi ? toggleDiscomfort(opt) : setField(f.key, opt))}
                            className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                              on ? "bg-forest text-white" : "bg-mist text-forest/70 ring-1 ring-ink/8 hover:ring-green/30"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* 자연어 생활 메모 */}
      <section className="rounded-xl3 bg-white p-4 ring-1 ring-ink/8">
        <h2 className="font-display font-bold text-ink">생활 메모</h2>
        <p className="mt-1 text-sm text-forest/60">집이 더워지는 시간, 냉방 습관, 생활 리듬, 걱정되는 점을 자유롭게 적어주세요.</p>
        <textarea
          value={values.lifeMemo ?? ""}
          onChange={(e) => {
            setField("lifeMemo", e.target.value);
            setMemoAnalyzed(false);
          }}
          rows={4}
          placeholder="저는 밤에 일하고 오전에 자요. 낮에는 집에 있는 시간이 많고, 전기요금 때문에 에어컨을 오래 틀기 부담돼요. 창문이 커서 오후에 방이 많이 더워져요."
          className="mt-3 w-full resize-none rounded-xl border border-ink/10 bg-paper-warm px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-forest/35 focus:border-green/50"
        />
        <button onClick={() => setMemoAnalyzed(true)} className="mt-2 w-full rounded-2xl bg-forest py-3 text-sm font-bold text-white transition hover:bg-pine">
          분석하기
        </button>

        {memoAnalyzed && (
          <div className="mt-3 animate-fade-up rounded-2xl bg-mint-soft/60 p-4 ring-1 ring-green/12">
            <p className="text-sm font-bold text-pine">AI 보조 분석</p>
            <dl className="mt-2 flex flex-col gap-1.5">
              {MEMO_ANALYSIS.map(([k, v]) => (
                <div key={k} className="text-sm">
                  <dt className="inline font-semibold text-forest/60">{k}: </dt>
                  <dd className="inline text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <ul className="mt-3 flex flex-col gap-1 text-xs text-forest/50">
          <li>· 자연어 입력은 행동계획을 더 맞춤화하는 보조 정보입니다.</li>
          <li>· 이름·전화번호·상세주소 같은 직접 식별정보는 입력하지 마세요.</li>
          <li>· 위험도 계산은 코드 기반이며, 자연어 분석은 설명·행동계획 보조에만 사용합니다.</li>
        </ul>
      </section>

      {/* 사진 분석 */}
      <PhotoUpload caregiver={caregiverMode} />

      {/* 저장 */}
      <button onClick={save} className="rounded-2xl bg-lime py-3.5 text-center font-bold text-forest transition hover:brightness-105">
        {copy.button}
      </button>
      <p className="text-center text-xs leading-relaxed text-forest/45">
        매일 오전 6시 오늘의 날씨와 함께 반영되어 행동계획을 갱신합니다.
        <br />
        이름·연락처 같은 직접 식별정보는 LLM에 전달하지 않습니다.
      </p>
    </div>
  );
}
