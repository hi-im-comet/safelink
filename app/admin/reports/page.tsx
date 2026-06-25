"use client";

import { useAppState } from "@/lib/store/AppState";
import { CountUp } from "@/components/CountUp";
import { DocGenerator } from "@/components/admin/DocGenerator";
import { generateDailyReport } from "@/lib/api";
import { AI_STRUCTURE, DAILY_REPORT, EXPANSION_MODULES, LLM_USAGE } from "@/lib/mock/metrics";

export default function ReportsPage() {
  const { metrics, logLlmCall } = useAppState();
  const llmShare = Math.round((100 - metrics.noLlmRate) * 10) / 10;

  return (
    <div className="stagger">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">보고서 · AI 효율</h1>
      <p className="mt-1 text-forest/65">저전력 전략과 오늘의 폭염 대응 결과</p>

      {/* 핵심 메시지 + 규칙 vs LLM 비중 */}
      <section className="mt-6 overflow-hidden rounded-xl3 bg-forest p-6 text-white shadow-lift sm:p-8">
        <p className="max-w-2xl font-display text-2xl font-bold leading-snug sm:text-[1.7rem]">
          위험도 계산은 <span className="text-lime">코드</span>가 담당하고,
          LLM은 꼭 필요한 <span className="text-mint">문서 생성</span>에만 사용합니다.
        </p>

        <div className="mt-7 flex items-end gap-3">
          <CountUp to={metrics.noLlmRate} decimals={1} className="tnum text-6xl font-extrabold leading-none sm:text-7xl" />
          <span className="mb-2 text-xl text-white/70">% LLM 미사용 처리</span>
        </div>

        {/* 비중 바 */}
        <div className="mt-5 flex h-10 overflow-hidden rounded-full ring-1 ring-white/15">
          <div
            className="flex items-center justify-start px-4 text-sm font-bold text-forest"
            style={{ width: `${metrics.noLlmRate}%`, background: "linear-gradient(90deg,#BFE9D2,#9BD64A)" }}
          >
            규칙 기반 {metrics.ruleBased}건
          </div>
          <div
            className="flex items-center justify-end bg-amber px-3 text-sm font-bold text-white"
            style={{ width: `${llmShare}%` }}
          >
            LLM {metrics.llmCalls}
          </div>
        </div>
        <p className="mt-3 text-sm text-white/60">
          규칙 엔진이 {metrics.analyzed}건을 모두 판단하고, LLM은 문서가 필요한 곳에서만 호출됩니다.
          호출이 늘면 이 수치가 즉시 반영됩니다.
        </p>
      </section>

      {/* 서비스 AI 구조 (3계층) */}
      <section className="mt-5 rounded-xl3 bg-white p-6 ring-1 ring-ink/8">
        <h2 className="font-display text-lg font-bold text-ink">서비스 AI 구조</h2>
        <p className="mt-1 text-sm text-forest/55">계산은 코드, 이미지는 선택적 비전, 문서는 LLM — 역할이 분리되어 있습니다.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {AI_STRUCTURE.map((t) => (
            <div
              key={t.tier}
              className={`rounded-2xl p-5 ${
                t.tone === "green"
                  ? "bg-forest text-white"
                  : t.tone === "mint"
                    ? "bg-mint-soft text-ink ring-1 ring-green/12"
                    : "bg-lime/20 text-ink ring-1 ring-lime/30"
              }`}
            >
              <p className={`text-sm font-bold ${t.tone === "green" ? "text-lime" : "text-pine"}`}>{t.mode}</p>
              <h3 className="mt-1 font-display text-base font-bold">{t.tier}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${t.tone === "green" ? "text-white/75" : "text-forest/65"}`}>
                {t.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 세부 지표 */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="전체 분석 가구" value={metrics.analyzed} unit="건" />
        <Metric label="규칙 기반 처리" value={metrics.ruleBased} unit="건" accent />
        <Metric label="LLM 호출" value={metrics.llmCalls} unit="건" warm />
        <Metric label="캐시 재사용" value={metrics.cacheReuse} unit="건" />
      </section>

      {/* LLM 사용/미사용 영역 + 평균 토큰 */}
      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink">무엇에 LLM을 쓰고, 무엇에 안 쓰나</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <UsageList title="LLM 미사용 — 코드" items={LLM_USAGE.ruleOnly} tone="green" />
            <UsageList title="LLM 사용 — 문서 생성" items={LLM_USAGE.llmOnly} tone="lime" />
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl3 bg-mint-soft p-6 ring-1 ring-green/12">
          <p className="text-sm font-medium text-pine">평균 출력 토큰</p>
          <div className="mt-2 flex items-end gap-1.5">
            <CountUp to={metrics.avgTokens} className="tnum text-5xl font-extrabold text-ink" />
            <span className="mb-1 text-forest/55">토큰/건</span>
          </div>
          <p className="mt-3 text-sm text-forest/65">
            템플릿·캐시를 먼저 쓰고, 짧고 필요한 문서만 생성해 토큰을 낮춥니다.
          </p>
        </div>
      </section>

      {/* 일일 보고서 */}
      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl3 bg-white p-6 ring-1 ring-ink/8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">일일 폭염 대응 보고서</h2>
            <span className="text-sm text-forest/45">{DAILY_REPORT.date}</span>
          </div>
          <p className="mt-1 text-sm text-forest/60">{DAILY_REPORT.weather}</p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <ReportStat label="전화" value={DAILY_REPORT.handled.calls} />
            <ReportStat label="방문" value={DAILY_REPORT.handled.visits} />
            <ReportStat label="지원" value={DAILY_REPORT.handled.support} />
            <ReportStat label="쉼터안내" value={DAILY_REPORT.handled.shelterGuide} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-forest/75">{DAILY_REPORT.highlight}</p>
          <p className="mt-3 rounded-xl bg-mist/70 p-3 text-sm leading-relaxed text-forest/70">
            <b className="text-pine">탄소중립</b> · {DAILY_REPORT.carbon}
          </p>
        </div>

        <DocGenerator
          label="보고서 문안 생성"
          hint="당일 대응 내용을 보고서 형식으로"
          generate={generateDailyReport}
          onGenerated={(d) => logLlmCall({ type: "report", tokens: d.tokens, cached: false })}
        />
      </section>

      {/* 확장 모듈 */}
      <section className="mt-5 rounded-xl3 bg-white/70 p-6 ring-1 ring-green/12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-ink">향후 확장 가능</h2>
          <p className="text-sm text-forest/55">위험도 구조는 그대로, 재난 종류만 교체</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXPANSION_MODULES.map((m) => {
            const live = m.status === "운영 중";
            return (
              <div
                key={m.key}
                className={`rounded-2xl p-4 ${live ? "bg-forest text-white" : "bg-mist text-forest/55 ring-1 ring-green/10"}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-lime" : "bg-forest/30"}`} />
                  <span className="font-bold">{m.name}</span>
                </div>
                <p className={`mt-0.5 text-xs ${live ? "text-mint" : "text-forest/40"}`}>{m.status}</p>
                <p className={`mt-2 text-xs ${live ? "text-white/70" : "text-forest/50"}`}>{m.note}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  accent,
  warm,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
  warm?: boolean;
}) {
  return (
    <div className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
      <p className="text-sm text-forest/55">{label}</p>
      <div className="mt-1.5 flex items-end gap-1">
        <CountUp
          to={value}
          className={`tnum text-4xl font-extrabold ${warm ? "text-amber" : accent ? "text-green" : "text-ink"}`}
        />
        <span className="mb-1 text-sm text-forest/45">{unit}</span>
      </div>
    </div>
  );
}

function UsageList({ title, items, tone }: { title: string; items: string[]; tone: "green" | "lime" }) {
  return (
    <div>
      <p className="text-sm font-bold text-ink">{title}</p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-sm text-forest/70">
            <span className={`h-1.5 w-1.5 rounded-full ${tone === "green" ? "bg-green" : "bg-lime"}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-mist/70 px-2 py-3 text-center">
      <div className="tnum text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-forest/50">{label}</div>
    </div>
  );
}
