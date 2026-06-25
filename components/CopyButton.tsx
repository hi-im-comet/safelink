"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "복사",
  doneLabel = "복사됨",
  className = "",
  onCopied,
}: {
  text: string;
  label?: string;
  doneLabel?: string;
  className?: string;
  onCopied?: () => void;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard 미지원 환경 폴백
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    onCopied?.();
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-forest transition hover:border-green/40 hover:bg-white ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition ${done ? "bg-green" : "bg-ink/30"}`}
      />
      {done ? doneLabel : label}
    </button>
  );
}
