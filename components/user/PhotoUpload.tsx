"use client";

import { useState } from "react";

const SLOTS = [
  { key: "window", label: "창문·창밖" },
  { key: "entry", label: "출입구·바닥 주변" },
  { key: "hvac", label: "냉난방 설비" },
];

const RESULT: [string, string][] = [
  ["차광", "일반"],
  ["환기", "보통"],
  ["창호 밀폐", "보통"],
  ["출입구 높이", "지면과 비슷"],
  ["침수 취약 징후", "없음"],
  ["냉난방 설비 상태", "양호"],
];

function Slot({ label }: { label: string }) {
  const [url, setUrl] = useState<string | null>(null);
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setUrl(URL.createObjectURL(f));
  }
  return (
    <div className="relative">
      <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink/15 bg-white transition hover:border-green/40">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-forest/45">
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs font-medium">{label}</span>
          </span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>
      {url && (
        <button onClick={() => setUrl(null)} className="absolute right-2 top-2 rounded-full bg-ink/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          삭제
        </button>
      )}
      <p className="mt-1 text-center text-xs text-forest/45">{label}</p>
    </div>
  );
}

export function PhotoUpload({ caregiver = false }: { caregiver?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const target = caregiver ? "부모님 집" : "내 집";

  function analyze() {
    setStatus("loading");
    setTimeout(() => setStatus("done"), 900);
  }

  return (
    <section className="rounded-xl3 bg-mint-soft/60 p-5 ring-1 ring-green/12">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">{target} 환경 사진 분석 <span className="text-forest/45">(선택)</span></h2>
        <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-pine">비전 보조</span>
      </div>
      <p className="mt-1 text-sm text-forest/60">사진 분석은 선택입니다.</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {SLOTS.map((s) => (
          <Slot key={s.key} label={s.label} />
        ))}
      </div>

      <p className="mt-4 text-xs text-forest/55">
        창문, 창밖, 출입구 주변 사진을 바탕으로 차광·환기·침수 취약 요소를 보조적으로 확인합니다.
      </p>
      <button
        onClick={analyze}
        disabled={status === "loading"}
        className="mt-2 w-full rounded-2xl bg-forest py-3 text-sm font-bold text-white transition hover:bg-pine disabled:opacity-60"
      >
        {status === "loading" ? "분석 중…" : "분석하기"}
      </button>

      {status === "loading" && (
        <div className="mt-3 flex flex-col gap-2">
          {[80, 70, 60].map((w, i) => (
            <div key={i} className="shimmer h-3 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {status === "done" && (
        <div className="mt-3 animate-fade-up rounded-2xl bg-white p-4 ring-1 ring-green/12">
          <p className="text-sm font-bold text-ink">분석 결과</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {RESULT.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-ink/5 pb-1">
                <dt className="text-xs text-forest/50">{k}</dt>
                <dd className="text-sm font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-xl bg-lime/15 px-3 py-2 text-sm text-forest/75">
            <b className="text-pine">행동계획 반영</b> · 폭염 시 점심 전 차광, 오후 피크 사전 냉방
          </p>
          <p className="mt-2 text-xs text-forest/45">사진 분석 결과는 점수를 확정하지 않고, 입력값을 보조하는 참고 정보로만 사용됩니다.</p>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-1.5 text-xs text-forest/55">
        <li className="flex gap-1.5"><span className="text-green">·</span> 창 크기, 앞 건물 가림 여부, 차광 상태를 보조적으로 파악합니다.</li>
        <li className="flex gap-1.5"><span className="text-green">·</span> 개인정보(이름·연락처)는 LLM에 전달하지 않습니다.</li>
      </ul>
    </section>
  );
}
