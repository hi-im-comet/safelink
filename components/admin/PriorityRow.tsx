import type { Household } from "@/lib/types";
import { gradeOfHousehold } from "@/lib/risk/score";
import { GRADE_META, HAZARDS } from "@/lib/hazards";
import { gradeClasses } from "@/lib/ui/grade";

export function PriorityRow({ h, rank }: { h: Household; rank: number }) {
  const grade = gradeOfHousehold(h);
  const g = gradeClasses[grade];
  const help = h.helpRequested;
  const def = HAZARDS[h.hazard];
  const gradeLabel = grade === "urgent" ? "고위험" : GRADE_META[grade].short;
  const todayNeeded = h.dday <= 0;

  return (
    <div
      className={`group relative grid grid-cols-[3.6rem_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl bg-white px-4 py-3.5 ring-1 transition hover:-translate-y-px hover:shadow-soft sm:px-5 ${
        help ? "ring-2 ring-ember/40" : "ring-ink/8"
      }`}
    >
      {/* 등급 색 바 */}
      <span className={`absolute inset-y-3 left-0 w-1 rounded-full ${help ? "bg-ember" : g.bar}`} />

      {/* 위험 점수 */}
      <div className="text-center">
        <div className={`tnum text-3xl font-extrabold leading-none ${help ? "text-ember" : g.text}`}>{h.score}</div>
        <div className="mt-1 text-[0.68rem] font-semibold text-forest/45">운영 {rank}위</div>
      </div>

      {/* 본문 */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-base font-bold tracking-tight text-ink">{h.id}</span>
          <span className="text-sm text-forest/55">{h.region}</span>
          <span className="text-xs text-forest/45">{h.ageInfo}</span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{ background: def.theme.soft, color: def.theme.ink }}
          >
            {def.emoji} {def.label}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${g.chip}`}>{gradeLabel}</span>
          {help && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ember px-2 py-0.5 text-xs font-bold text-white animate-pulse-ring">
              도움요청
            </span>
          )}
          {h.needsSupport && !help && (
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-semibold text-pine">지원검토</span>
          )}
        </div>

        {/* 주요 취약 조건 */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-forest/65">
          {h.factors.slice(0, 3).map((f, i) => (
            <span key={i}>
              {i > 0 && <span className="mr-1.5 text-forest/25">·</span>}
              {f}
            </span>
          ))}
        </div>

        {/* 필요한 조치 */}
        <p className="mt-1 text-xs font-medium text-pine">
          <span className="text-forest/40">필요한 조치 · </span>
          {h.actions.join(", ")}
        </p>
      </div>

      {/* 메타 */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold text-forest">{h.assignee ?? "미배정"}</div>
          <div className="text-xs text-forest/45">담당</div>
        </div>
        <StatusPill status={h.status} />
        <div className="hidden w-16 text-right md:block">
          {todayNeeded ? (
            <div className="text-sm font-bold text-ember">오늘 처리</div>
          ) : (
            <div className="text-sm font-semibold text-forest">D-{h.dday}</div>
          )}
          <div className="text-xs text-forest/45">처리 기한</div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Household["status"] }) {
  const map: Record<Household["status"], string> = {
    대기: "bg-ink/5 text-forest/70",
    전화중: "bg-amber-soft text-amber-ink",
    방문예정: "bg-mint-soft text-pine",
    지원검토: "bg-lime/20 text-forest",
    완료: "bg-green/15 text-green",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}>{status}</span>;
}
