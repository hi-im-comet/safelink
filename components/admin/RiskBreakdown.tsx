import type { RiskResult } from "@/lib/types";

const ROWS = [
  { key: "weather", label: "날씨 위험도", note: "최고기온·체감·특보·열대야", color: "#C9881F" },
  { key: "personal", label: "개인 취약도", note: "고령·독거·기저질환·연락 가능", color: "#1C6B4F" },
  { key: "housing", label: "주거·냉방 위험도", note: "방향·층·노후·냉방 보유·비용", color: "#2E8B6B" },
  { key: "care", label: "돌봄 공백·도움요청", note: "경과일·연락 실패·도움 요청", color: "#9BD64A" },
] as const;

export function RiskBreakdown({ risk }: { risk: RiskResult }) {
  return (
    <div>
      {/* 구성 비중 (35/25/25/15) — 한눈에 */}
      <div className="flex overflow-hidden rounded-full ring-1 ring-ink/8">
        {ROWS.map((r) => {
          const w = risk.breakdown[r.key].weight * 100;
          return (
            <div
              key={r.key}
              className="flex h-7 items-center justify-center text-[0.7rem] font-bold text-white"
              style={{ width: `${w}%`, background: r.color }}
            >
              {w}%
            </div>
          );
        })}
      </div>

      {/* 구성요소별 값과 기여 점수 */}
      <div className="mt-5 flex flex-col gap-4">
        {ROWS.map((r) => {
          const part = risk.breakdown[r.key];
          return (
            <div key={r.key}>
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} />
                  <span className="text-sm font-semibold text-ink">{r.label}</span>
                  <span className="rounded-full bg-mist px-1.5 text-[0.7rem] font-semibold text-forest/55">
                    {part.weight * 100}%
                  </span>
                </div>
                <span className="tnum text-sm font-bold text-forest">
                  +{part.weighted.toFixed(1)}
                  <span className="ml-0.5 font-normal text-forest/45">점</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full" style={{ width: `${part.value}%`, background: r.color }} />
              </div>
              <p className="mt-1 text-xs text-forest/45">{r.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-forest px-4 py-3 text-white">
        <span className="text-sm font-medium text-mint">최종 위험도 (코드 계산)</span>
        <span className="tnum text-2xl font-extrabold">{risk.score}점</span>
      </div>
    </div>
  );
}
