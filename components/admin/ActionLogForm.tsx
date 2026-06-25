"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/lib/store/AppState";
import type { Household, Status } from "@/lib/types";

const RESULTS: { label: string; status: Status }[] = [
  { label: "전화 완료", status: "완료" },
  { label: "방문 완료", status: "완료" },
  { label: "지원 안내 완료", status: "완료" },
  { label: "방문 예정 등록", status: "방문예정" },
  { label: "추가 조치 필요", status: "지원검토" },
];

export function ActionLogForm({ household }: { household: Household }) {
  const { recordAction, actionLogs } = useAppState();
  const [result, setResult] = useState(RESULTS[0].label);
  const [note, setNote] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [saved, setSaved] = useState(false);

  const logs = useMemo(
    () => actionLogs.filter((l) => l.householdId === household.id),
    [actionLogs, household.id],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const chosen = RESULTS.find((r) => r.label === result)!;
    recordAction(household.id, {
      result,
      note,
      nextVisit: nextVisit || undefined,
      status: chosen.status,
      by: household.assignee ?? "담당자",
    });
    setNote("");
    setNextVisit("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-forest/60">조치 결과</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {RESULTS.map((r) => (
              <button
                type="button"
                key={r.label}
                onClick={() => setResult(r.label)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  result === r.label
                    ? "bg-forest text-white"
                    : "bg-mist text-forest/70 hover:bg-mint-soft"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-forest/60">메모</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="냉방 상태·건강 상태·추가 지원 필요 여부를 적어주세요."
            className="mt-1.5 w-full resize-none rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-forest/35 focus:border-green/50"
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-semibold text-forest/60">후속 방문일</label>
            <input
              type="date"
              value={nextVisit}
              onChange={(e) => setNextVisit(e.target.value)}
              className="mt-1.5 block rounded-xl border border-ink/10 bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-green/50"
            />
          </div>
          <button
            type="submit"
            className="ml-auto rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-forest transition hover:brightness-105"
          >
            조치 기록 저장
          </button>
        </div>
      </form>

      {saved && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-green/12 px-3 py-1.5 text-sm font-semibold text-green animate-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          기록이 저장되었습니다.
        </p>
      )}

      {logs.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest/45">조치 기록</p>
          <ul className="mt-2 flex flex-col gap-2">
            {logs.map((l) => (
              <li key={l.id} className="rounded-xl bg-mist/60 px-3.5 py-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{l.result}</span>
                  <span className="text-xs text-forest/45">
                    {new Date(l.at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {l.note && <p className="mt-0.5 text-forest/65">{l.note}</p>}
                {l.nextVisit && <p className="mt-0.5 text-xs text-pine">후속 방문 {l.nextVisit}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
