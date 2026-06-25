import Link from "next/link";
import type { Household, TodayWeather } from "@/lib/types";
import { GRADE_META, computeRisk, isEmergency } from "@/lib/risk/score";
import { gradeClasses } from "@/lib/ui/grade";

export function PriorityRow({
  h,
  weather,
  rank,
}: {
  h: Household;
  weather: TodayWeather;
  rank: number;
}) {
  const { score, grade } = computeRisk(h, weather);
  const g = gradeClasses[grade];
  const help = h.helpRequested;
  const sourceLabel =
    h.helpSource === "guardian" ? "보호자 요청" : h.helpSource === "system" ? "시스템 감지" : "사용자 직접 요청";
  const chips = help && h.helpTags?.length ? h.helpTags : help && h.helpReasons?.length ? h.helpReasons : h.factors;

  const emergency = isEmergency(h);
  const gradeLabel = grade === "urgent" ? "고위험" : GRADE_META[grade].short;

  // 운영 우선순위 사유 한 줄
  const reason: string[] = [];
  if (emergency) reason.push("응급 확인 필요");
  else if (grade === "urgent") reason.push("고위험");
  else if (help && h.helpTags?.length) reason.push(`${h.helpTags[0]} 요청`);
  reason.push(`위험도 ${score}`);
  if (help) reason.push(sourceLabel);
  const showReason = emergency || grade === "urgent" || help;

  return (
    <Link
      href={`/admin/households/${h.id}`}
      className={`group relative grid grid-cols-[3.6rem_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl bg-white px-4 py-3.5 ring-1 transition hover:-translate-y-px hover:shadow-soft sm:px-5 ${
        help ? "ring-2 ring-ember/40" : "ring-ink/8"
      }`}
    >
      {/* 등급 색 바 */}
      <span className={`absolute inset-y-3 left-0 w-1 rounded-full ${help ? "bg-ember" : g.bar}`} />

      {/* 점수 */}
      <div className="text-center">
        <div className={`tnum text-3xl font-extrabold leading-none ${help ? "text-ember" : g.text}`}>
          {score}
        </div>
        <div className="mt-1 text-[0.68rem] font-semibold text-forest/45">운영 {rank}위</div>
      </div>

      {/* 본문 */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-base font-bold tracking-tight text-ink">{h.id}</span>
          <span className="text-sm text-forest/55">{h.region}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${g.chip}`}>
            {gradeLabel}
          </span>
          {help && (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-ember px-2 py-0.5 text-xs font-bold text-white animate-pulse-ring">
                도움요청
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ember-ink ring-1 ring-ember/30">
                {sourceLabel}
              </span>
              {h.helpContactTag && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    h.helpContactTag === "응급 확인 필요" ? "bg-ember text-white" : "bg-mint-soft text-pine"
                  }`}
                >
                  {h.helpContactTag}
                </span>
              )}
            </>
          )}
          {h.needsSupport && !help && (
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-semibold text-pine">
              지원검토
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-forest/65">
          {chips.slice(0, 3).map((f, i) => (
            <span key={i}>
              {i > 0 && <span className="mr-1.5 text-forest/25">·</span>}
              {f}
            </span>
          ))}
        </div>
        {showReason && (
          <p
            className={`mt-1 text-xs font-semibold ${
              emergency ? "text-ember" : grade === "urgent" ? "text-ember-ink" : "text-forest/55"
            }`}
          >
            {reason.join(" · ")}
          </p>
        )}
      </div>

      {/* 메타 */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold text-forest">{h.assignee ?? "미배정"}</div>
          <div className="text-xs text-forest/45">담당</div>
        </div>
        <StatusPill status={h.status} />
        <div className="hidden w-12 text-right md:block">
          <div className={`text-sm font-semibold ${h.lastContactDays >= 10 ? "text-ember" : "text-forest"}`}>
            D-{h.lastContactDays}
          </div>
          <div className="text-xs text-forest/45">연락</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-forest/30 transition group-hover:translate-x-0.5 group-hover:text-forest">
          <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
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
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}>{status}</span>
  );
}
