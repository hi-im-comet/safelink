"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import type { GeneratedDoc } from "@/lib/llm/templates";

export function DocGenerator({
  label,
  hint,
  generate,
  onGenerated,
}: {
  label: string;
  hint: string;
  generate: () => Promise<GeneratedDoc>;
  onGenerated?: (doc: GeneratedDoc) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);

  async function run() {
    setStatus("loading");
    const d = await generate();
    setDoc(d);
    setStatus("done");
    onGenerated?.(d);
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{label}</p>
          <p className="text-xs text-forest/50">{hint}</p>
        </div>
        {status !== "done" ? (
          <button
            onClick={run}
            disabled={status === "loading"}
            className="shrink-0 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine disabled:opacity-60"
          >
            {status === "loading" ? "생성 중…" : "생성"}
          </button>
        ) : (
          <button
            onClick={run}
            className="shrink-0 rounded-full border border-ink/12 px-3 py-2 text-sm font-medium text-forest/70 transition hover:border-green/40"
          >
            다시 생성
          </button>
        )}
      </div>

      {status === "loading" && (
        <div className="mt-4 flex flex-col gap-2">
          {[90, 75, 84, 60].map((w, i) => (
            <div key={i} className="shimmer h-3.5 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {status === "done" && doc && (
        <div className="mt-4 animate-fade-up">
          <div className="rounded-xl bg-mist/70 p-4 ring-1 ring-green/10">
            <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-ink">{doc.body}</pre>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs text-forest/50">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              LLM 호출 1회 · 출력 {doc.tokens} 토큰
            </span>
            <CopyButton text={doc.body} />
          </div>
        </div>
      )}
    </div>
  );
}
