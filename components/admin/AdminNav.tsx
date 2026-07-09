"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAppState } from "@/lib/store/AppState";
import { HAZARDS } from "@/lib/hazards";

export function AdminNav() {
  const pathname = usePathname();
  const { selectedHazard, resetDemo } = useAppState();
  const def = HAZARDS[selectedHazard];

  const links = [{ href: "/admin", label: "대시보드" }];

  return (
    <header className="sticky top-0 z-30 border-b border-ink/8 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-5 py-3.5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active ? "bg-forest text-white" : "text-forest/70 hover:bg-mint-soft"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold sm:inline-flex"
            style={{ background: def.theme.soft, color: def.theme.ink }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: def.theme.fg }} />
            오늘 {def.label} · {def.today.alert}
          </span>
          <button
            onClick={resetDemo}
            className="rounded-full border border-ink/12 px-3 py-1.5 text-sm font-medium text-forest/70 transition hover:border-green/40 hover:text-forest"
          >
            데모 초기화
          </button>
          <Link
            href="/user"
            className="rounded-full bg-mint-soft px-3.5 py-1.5 text-sm font-semibold text-forest transition hover:bg-mint"
          >
            사용자 앱
          </Link>
        </div>
      </div>
    </header>
  );
}
