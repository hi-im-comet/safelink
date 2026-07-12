import Link from "next/link";
import { Logo } from "@/components/Logo";
import { HAZARDS, HAZARD_ORDER, DISCLAIMER } from "@/lib/hazards";

const FLOW = [
  { step: "1", title: "날씨·특보 데이터 수집", note: "기온·강수·미세먼지·풍속과 기상특보를 매일 반영합니다." },
  { step: "2", title: "사용자·가구 정보 반영", note: "거주 형태·연령·건강·냉난방 등 우리 집 조건을 함께 봅니다." },
  { step: "3", title: "재난 유형별 위험도 계산", note: "폭염·홍수·한파·미세먼지·태풍을 규칙 기반으로 점수화합니다." },
  { step: "4", title: "우선순위 분류", note: "누구를 먼저 확인해야 하는지 운영 우선순위로 정렬합니다." },
  { step: "5", title: "맞춤 행동요령 생성", note: "지금 해야 할 일을 쉬운 말로 안내합니다." },
];

const AI_USAGE = [
  { tier: "위험도 계산", mode: "규칙 기반", tone: "green", note: "긴급 판단은 규칙 기반 점수 계산을 우선 사용합니다. 반복 판단에 LLM을 쓰지 않습니다." },
  { tier: "문장 생성", mode: "선택적 LLM", tone: "mint", note: "보호자 공유 문구·전화 스크립트·체크리스트 문장 생성 등 표현에만 LLM을 활용할 수 있습니다." },
  { tier: "개인정보 보호", mode: "분리 구조", tone: "lime", note: "이름·연락처 같은 개인정보는 LLM에 직접 전달하지 않는 구조로 설계합니다." },
];

const TONE: Record<string, string> = {
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
          SafeLink AI가 하는 일
        </h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-forest/75">
          SafeLink AI는 단순 날씨 앱이 아니라, 날씨·특보·주거 환경·가족 상태를 함께 보고
          <b className="text-forest"> 오늘의 생활재난 위험</b>을 판단합니다.
        </p>
      </section>

      {/* 2. 작동 흐름 */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">작동 흐름</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FLOW.map((f) => (
            <div key={f.step} className="rounded-2xl bg-white p-5 ring-1 ring-ink/8">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-forest text-sm font-bold text-lime">{f.step}</span>
              <h3 className="mt-3 font-display text-base font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-forest/65">{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AI 사용 방식 */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">AI는 꼭 필요한 곳에만</h2>
        <p className="mt-2 text-sm text-forest/55">위험 판단은 규칙 기반, 표현은 선택적 LLM. 개인정보는 분리합니다.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {AI_USAGE.map((t) => (
            <div key={t.tier} className={`rounded-xl3 p-6 ${TONE[t.tone]}`}>
              <p className={`text-sm font-bold ${t.tone === "green" ? "text-lime" : "text-pine"}`}>{t.mode}</p>
              <h3 className="mt-1.5 font-display text-lg font-bold">{t.tier}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${t.tone === "green" ? "text-white/75" : "text-forest/65"}`}>{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MVP 운영 방식 */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">MVP 운영 방식</h2>
        <p className="mt-2 text-sm text-forest/55">별도 로그인 없이 누구나 바로 체험할 수 있는 대회 제출용 구조입니다.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { title: "바로 체험", note: "별도 회원가입 없이 관리자 화면과 사용자 앱을 바로 확인할 수 있습니다." },
            { title: "시연용 관리자 데이터", note: "관리자 화면은 서비스 흐름을 보여주기 위한 시연용 취약가구 데이터를 사용합니다." },
            { title: "브라우저 저장", note: "사용자 앱에서 입력한 정보는 현재 브라우저 localStorage에 저장되며 서버로 전송되지 않습니다." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl bg-mint-soft/60 p-5 ring-1 ring-green/12">
              <h3 className="font-display text-base font-bold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-forest/70">{c.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-forest/70 ring-1 ring-ink/8">
          🔒 건강·장애·복용약 등 민감정보는 선택입력으로 설계했으며, 현재 MVP에서는 서버에 저장하지 않습니다.
        </p>
      </section>

      {/* 4. 대응하는 생활재난 */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">대응하는 생활재난</h2>
        <p className="mt-2 text-sm text-forest/55">같은 위험도 구조로 재난 유형만 확장합니다.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {HAZARD_ORDER.map((h) => {
            const d = HAZARDS[h];
            return (
              <div key={h} className="rounded-2xl bg-white p-5 ring-1 ring-ink/8">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden>{d.emoji}</span>
                  <span className="rounded-full px-2 py-0.5 text-sm font-bold" style={{ background: d.theme.soft, color: d.theme.ink }}>{d.label}</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-forest/60">{d.metrics.join(" · ")}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. 실제 서비스 확장 */}
      <section className="mt-8 rounded-xl3 bg-forest p-6 text-white sm:p-8">
        <h2 className="font-display text-lg font-bold text-lime sm:text-xl">실제 서비스 확장</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-white/85">
          실제 서비스에서는 지자체 관리자 계정, 보호자 계정, 취약가구 DB, 공공데이터 API, 기상특보 API, 대피소 데이터 연동으로 확장할 수 있습니다.
        </p>
      </section>

      {/* 진입 */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/admin" className="group flex items-center justify-between rounded-2xl bg-forest p-5 text-white shadow-soft transition hover:-translate-y-0.5">
          <span className="font-display font-bold">관리자 대시보드</span>
          <span className="text-lime transition group-hover:translate-x-0.5">→</span>
        </Link>
        <Link href="/user" className="group flex items-center justify-between rounded-2xl bg-white p-5 ring-1 ring-green/15 shadow-soft transition hover:-translate-y-0.5">
          <span className="font-display font-bold text-ink">사용자 앱</span>
          <span className="text-pine transition group-hover:translate-x-0.5">→</span>
        </Link>
      </section>

      {/* 안내 문구 (필수) */}
      <p className="mt-10 text-center text-xs leading-relaxed text-forest/50">{DISCLAIMER}</p>
    </main>
  );
}
