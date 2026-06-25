import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ClimateLayers } from "@/components/ClimateLayers";
import { TODAY_WEATHER, HAZARD_LABELS, PRIMARY_HAZARD } from "@/lib/mock/weather";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1040px] flex-col px-5 py-6 sm:px-8">
      {/* 헤더 — 로고만 */}
      <header className="flex items-center justify-between">
        <Logo />
        <span className="hidden text-sm font-medium text-forest/45 sm:block">
          저전력 기후안전 에이전트
        </span>
      </header>

      {/* 메인 큰 비주얼 */}
      <section className="stagger mt-6 flex flex-1 flex-col">
        <div className="relative h-[clamp(300px,48vh,500px)] w-full overflow-hidden rounded-xl3 shadow-lift ring-1 ring-green/12">
          <ClimateLayers className="absolute inset-0 h-full w-full" />

          {/* 워드마크 (비주얼 위 은은하게) */}
          <span className="absolute left-6 top-6 font-display text-lg font-extrabold text-white/90">
            CoolLink<span className="ml-1 text-lime">AI</span>
          </span>

          {/* 온도 정보 카드 (유지) */}
          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/85 px-5 py-3.5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-green">오늘의 기후위험 · {HAZARD_LABELS[PRIMARY_HAZARD]}</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="tnum text-4xl font-extrabold text-ink">{TODAY_WEATHER.highTemp}°</span>
              <span className="text-sm text-forest/70">체감 {TODAY_WEATHER.feelsLike}° · {TODAY_WEATHER.alert}</span>
            </div>
          </div>
        </div>

        {/* 1행 — 진입 카드 2개 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <EntryCard
            href="/admin"
            variant="dark"
            tag="지자체 · 복지관 · 생활지원사 운영 화면"
            title="관리자 대시보드"
            cta="관리자 화면 열기"
          />
          <EntryCard
            href="/user"
            variant="white"
            tag="내 집 또는 등록한 가족의 집 기준으로 오늘의 기후위험과 안전 행동을 확인합니다"
            title="사용자 앱"
            cta="사용자 앱 열기"
          />
        </div>

        {/* 2행 — 서비스 소개 (넓은 하단 박스, 우선순위 낮게) */}
        <Link
          href="/about"
          className="group mt-4 flex flex-col gap-3 rounded-xl3 bg-mint-soft/60 p-6 ring-1 ring-green/12 transition hover:bg-mint-soft sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <span>
            <span className="font-display text-lg font-bold text-ink">서비스 소개</span>
            <span className="mt-0.5 block text-sm text-forest/60">작동 방식 · 저전력 AI 전략 · 기후재난 확장성</span>
          </span>
          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-pine ring-1 ring-green/15 transition group-hover:gap-2.5">
            서비스 소개 보기 <Arrow />
          </span>
        </Link>
      </section>

      {/* 짧은 보조 설명 1줄 */}
      <footer className="mt-8 text-center text-sm text-forest/45">
        기후취약가구와 일반 시민을 위한 저전력 기후안전 에이전트
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
  variant: "dark" | "white" | "mint";
  tag: string;
  title: string;
  cta: string;
}) {
  const v = {
    dark: { card: "bg-forest text-white shadow-lift", blob: "bg-lime/15", tag: "text-mint", title: "text-white", btn: "bg-lime text-forest" },
    white: { card: "bg-white ring-1 ring-green/15 shadow-soft", blob: "bg-mint/40", tag: "text-green", title: "text-ink", btn: "bg-forest text-white" },
    mint: { card: "bg-mint-soft ring-1 ring-green/12 shadow-soft", blob: "bg-lime/25", tag: "text-pine", title: "text-ink", btn: "bg-forest text-white" },
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
