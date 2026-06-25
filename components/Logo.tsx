import Link from "next/link";

// 유일하게 허용한 "아이콘" — 겹친 온도/그늘 레이어를 추상화한 마크.
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M5 20c4-7 18-7 22 0" stroke="var(--lime)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 15c3.5-6 16.5-6 20 0" stroke="var(--green)" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
      <path d="M8 25c3-4 13-4 16 0" stroke="var(--mint)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="9" r="2.3" fill="var(--ink)" />
    </svg>
  );
}

export function Logo({
  href = "/",
  tone = "ink",
}: {
  href?: string;
  tone?: "ink" | "light";
}) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <LogoMark />
      <span
        className={`font-display text-[1.2rem] font-extrabold tracking-tight ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        CoolLink
        <span className="ml-1 rounded-md bg-lime/30 px-1.5 py-0.5 text-[0.7em] font-bold text-forest align-middle">
          AI
        </span>
      </span>
    </Link>
  );
}
