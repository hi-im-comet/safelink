import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LlmFloatingBadge } from "@/components/LlmFloatingBadge";
import {
  AI_STRUCTURE,
  BASE_METRICS,
  EXPANSION_MODULES,
  LOW_POWER_PRINCIPLES,
} from "@/lib/mock/metrics";

const DAILY = [
  { who: "사용자", text: "주거환경을 한 번 등록합니다." },
  { who: "시스템", text: "매일 오전 6시 날씨·폭염특보를 반영해 오늘의 행동계획을 갱신합니다." },
  { who: "보호자", text: "부모님·가족의 안부 확인이 필요한지 봅니다." },
  { who: "관리자", text: "긴급 요청과 고위험 가구를 우선순위로 봅니다." },
];

const TIER_STYLE: Record<string, string> = {
  green: "bg-forest text-white",
  mint: "bg-mint-soft text-ink ring-1 ring-green/12",
  lime: "bg-lime/20 text-ink ring-1 ring-lime/30",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 sm:px-8">
      <header className="flex items-center justify-between py-6">
        <Logo />
        <Link href="/" className="text-sm font-semibold text-forest/60 transition hover:text-forest">← 홈</Link>
      </header>

      {/* 1. 하는 일 */}
      <section className="stagger pt-2">
        <h1 className="max-w-3xl font-display text-[1.9rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
          CoolLink AI가 하는 일
        </h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-forest/75">
          집의 방향, 창문, 냉방 환경, 생활패턴, 돌봄 공백을 함께 보고
          <b className="text-forest"> 오늘 필요한 행동</b>과 <b className="text-forest">우선 지원 대상</b>을 정리합니다.
        </p>
      </section>

      {/* 2. 매일 아침 갱신 */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">매일 아침, 오늘의 폭염 대응을 다시 계산합니다</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {DAILY.map((d) => (
            <div key={d.who} className="flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink/8">
              <span className="shrink-0 rounded-full bg-forest px-3 py-1 text-sm font-bold text-lime">{d.who}</span>
              <p className="text-forest/75">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AI는 꼭 필요한 곳에만 */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">계산은 가볍게, 필요한 문장만 AI로</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {AI_STRUCTURE.map((t) => (
            <div key={t.tier} className={`rounded-xl3 p-6 ${TIER_STYLE[t.tone]}`}>
              <p className={`text-sm font-bold ${t.tone === "green" ? "text-lime" : "text-pine"}`}>{t.mode}</p>
              <h3 className="mt-1.5 font-display text-lg font-bold">{t.tier}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${t.tone === "green" ? "text-white/75" : "text-forest/65"}`}>{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 가볍게 운영 */}
      <section className="mt-14 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl3 bg-white p-6 ring-1 ring-ink/8">
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">가볍게 운영합니다</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {LOW_POWER_PRINCIPLES.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-forest/75">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between rounded-xl3 bg-forest p-6 text-white">
          <div>
            <p className="text-sm font-medium text-mint">오늘 LLM 사용</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="tnum text-5xl font-extrabold">{BASE_METRICS.noLlmRate}</span>
              <span className="mb-1 text-white/70">% 미사용</span>
            </div>
            <p className="mt-2 text-sm text-white/65">규칙 {BASE_METRICS.ruleBased}건 · LLM {BASE_METRICS.llmCalls}건</p>
          </div>
          <p className="mt-5 rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-mint">
            관리자 화면 우측 하단 ‘AI 절감’ 버튼에서 실시간 확인
          </p>
        </div>
      </section>

      {/* 5. 확장 */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">폭염에서 시작해 다른 기후재난으로 확장합니다</h2>
        <p className="mt-2 text-sm text-forest/55">위험도 구조는 그대로 두고 재난 종류만 바꿉니다. 지금 MVP는 폭염에 집중합니다.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {EXPANSION_MODULES.map((m, i) => {
            const live = m.status === "운영 중";
            return (
              <div key={m.key} className="flex items-center gap-3">
                {i > 0 && <span className="text-forest/25">→</span>}
                <div className={`rounded-2xl px-4 py-3 ${live ? "bg-forest text-white shadow-soft" : "bg-mist text-forest/60 ring-1 ring-green/10"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-lime" : "bg-forest/30"}`} />
                    <span className="font-bold">{m.name}</span>
                    <span className={`text-xs ${live ? "text-mint" : "text-forest/40"}`}>{m.status}</span>
                  </div>
                  <p className={`mt-1 text-xs ${live ? "text-white/70" : "text-forest/45"}`}>{m.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 진입 */}
      <section className="mt-14 grid gap-3 sm:grid-cols-2">
        <Link href="/admin" className="group flex items-center justify-between rounded-2xl bg-forest p-5 text-white shadow-soft transition hover:-translate-y-0.5">
          <span className="font-display font-bold">관리자 대시보드</span>
          <span className="text-lime transition group-hover:translate-x-0.5">→</span>
        </Link>
        <Link href="/user" className="group flex items-center justify-between rounded-2xl bg-white p-5 ring-1 ring-green/15 shadow-soft transition hover:-translate-y-0.5">
          <span className="font-display font-bold text-ink">사용자 앱</span>
          <span className="text-pine transition group-hover:translate-x-0.5">→</span>
        </Link>
      </section>
      <LlmFloatingBadge />
    </main>
  );
}
