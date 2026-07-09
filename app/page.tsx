import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ClimateLayers } from "@/components/ClimateLayers";
import { HAZARDS, HAZARD_ORDER, PRIMARY_HAZARD, DISCLAIMER, MVP_BADGE, MVP_INTRO } from "@/lib/hazards";

export default function LandingPage() {
  const primary = HAZARDS[PRIMARY_HAZARD];

  return (
    <main className="mx-auto flex min-h-screen max-w-[1040px] flex-col px-5 py-6 sm:px-8">
      {/* 헤더 */}
      <header className="flex items-center justify-between">
        <Logo />
        <span className="hidden text-sm font-medium text-forest/45 sm:block">생활재난 안전 에이전트</span>
      </header>

      {/* 히어로 */}
      <section className="stagger mt-6 flex flex-1 flex-col">
        <div className="relative h-[clamp(300px,46vh,470px)] w-full overflow-hidden rounded-xl3 shadow-lift ring-1 ring-green/12">
          <ClimateLayers className="absolute inset-0 h-full w-full" />

          <span className="absolute left-6 top-6 font-display text-lg font-extrabold text-white/90">
            SafeLink<span className="ml-1 text-lime">AI</span>
          </span>

          {/* 오늘 주 위험 카드 */}
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/85 px-5 py-3.5 backdrop-blur-md sm:right-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-green">
              오늘의 주 위험 · {primary.label}
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-lg font-extrabold text-ink">{primary.today.alert}</span>
              <span className="text-sm text-forest/70">{primary.today.headline}</span>
            </div>
          </div>
        </div>

        {/* 히어로 문구 */}
        <div className="mt-6">
          <h1 className="max-w-2xl font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.2rem]">
            오늘의 생활재난을 AI가 먼저 연결합니다
          </h1>
          <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-forest/75">
            날씨·특보·주거 환경·가족 상태를 함께 보고, 지금 필요한 행동을 쉬운 말로 안내합니다.
          </p>
          {/* 로그인 없는 체험 안내 배지 */}
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-lime/20 px-3.5 py-1.5 text-sm font-semibold text-pine ring-1 ring-lime/30">
            <span aria-hidden>✓</span> {MVP_BADGE}
          </span>
          {/* 오늘 활성 위험 */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-forest/45">오늘 활성 위험</span>
            {HAZARD_ORDER.map((h) => {
              const d = HAZARDS[h];
              return (
                <span
                  key={h}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: d.theme.soft, color: d.theme.ink }}
                >
                  {d.emoji} {d.short}
                </span>
              );
            })}
          </div>
        </div>

        {/* 진입 카드 2개 */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <EntryCard
            href="/admin"
            variant="dark"
            tag="지자체·복지관·생활지원사가 우선 확인 대상과 대응 현황을 관리합니다"
            title="관리자 대시보드"
            cta="관리자 화면 열기"
          />
          <EntryCard
            href="/user"
            variant="white"
            tag="본인 안전 확인 또는 가족·부모님 보호자 확인 모드로 사용할 수 있습니다"
            title="사용자 앱"
            cta="사용자 앱 열기"
          />
        </div>

        {/* 체험 방식 안내 */}
        <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm leading-relaxed text-forest/70 ring-1 ring-green/12">
          {MVP_INTRO}
        </p>

        {/* 서비스 소개 */}
        <Link
          href="/about"
          className="group mt-4 flex flex-col gap-3 rounded-xl3 bg-mint-soft/60 p-6 ring-1 ring-green/12 transition hover:bg-mint-soft sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <span>
            <span className="font-display text-lg font-bold text-ink">서비스 소개</span>
            <span className="mt-0.5 block text-sm text-forest/60">SafeLink AI가 하는 일 · 작동 흐름 · 확장성</span>
          </span>
          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-pine ring-1 ring-green/15 transition group-hover:gap-2.5">
            서비스 소개 보기 <Arrow />
          </span>
        </Link>
      </section>

      {/* 안내 문구 (필수) */}
      <footer className="mt-8 text-center text-xs leading-relaxed text-forest/50">
        {DISCLAIMER}
      </footer>
    </main>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EntryCard({
  href,
  variant,
  tag,
  title,
  cta,
}: {
  href: string;
  variant: "dark" | "white";
  tag: string;
  title: string;
  cta: string;
}) {
  const v = {
    dark: { card: "bg-forest text-white shadow-lift", blob: "bg-lime/15", tag: "text-mint", title: "text-white", btn: "bg-lime text-forest" },
    white: { card: "bg-white ring-1 ring-green/15 shadow-soft", blob: "bg-mint/40", tag: "text-green", title: "text-ink", btn: "bg-forest text-white" },
  }[variant];

  return (
    <Link href={href} className={`group relative flex flex-col overflow-hidden rounded-xl3 p-7 transition hover:-translate-y-0.5 sm:p-8 ${v.card}`}>
      <div className={`absolute -right-10 -top-12 h-36 w-36 rounded-full blur-2xl ${v.blob}`} />
      <p className={`text-sm font-medium leading-snug ${v.tag}`}>{tag}</p>
      <h2 className={`mt-2 font-display text-2xl font-extrabold tracking-tight ${v.title}`}>{title}</h2>
      <span className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition group-hover:gap-3 ${v.btn}`}>
        {cta} <Arrow />
      </span>
    </Link>
  );
}
