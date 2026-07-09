"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/user", label: "홈", icon: <path d="M3 9l7-6 7 6v8a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V9z" /> },
  { href: "/user/profile", label: "정보", icon: <><circle cx="10" cy="7" r="3" /><path d="M4 17a6 6 0 0 1 12 0" /></> },
  { href: "/user/help", label: "도움요청", icon: <><circle cx="10" cy="10" r="7" /><path d="M10 6v8M6 10h8" /></> },
];

export function UserBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="shrink-0 border-t border-ink/8 bg-white/90 px-2 pb-3 pt-2 backdrop-blur-md">
      <div className="flex items-stretch justify-around">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-xs font-semibold transition ${
                active ? "text-forest" : "text-forest/40"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {t.icon}
              </svg>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
