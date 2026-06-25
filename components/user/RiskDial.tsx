import type { Grade } from "@/lib/types";

const COLOR: Record<Grade, string> = {
  urgent: "#BD4A2C",
  call: "#C9881F",
  guide: "#5FA12B",
  monitor: "#2E8B6B",
};

export function RiskDial({
  score,
  grade,
  label,
}: {
  score: number;
  grade: Grade;
  label: string;
}) {
  const r = 66;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  const color = COLOR[grade];

  return (
    <div className="relative mx-auto h-[168px] w-[168px]">
      <svg viewBox="0 0 168 168" className="h-full w-full -rotate-90">
        <circle cx="84" cy="84" r={r} fill="none" stroke="#E3EFE6" strokeWidth="13" />
        <circle
          cx="84"
          cy="84"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum text-5xl font-extrabold leading-none text-ink">{score}</span>
        <span className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: `${color}22`, color }}>
          {label}
        </span>
      </div>
    </div>
  );
}
