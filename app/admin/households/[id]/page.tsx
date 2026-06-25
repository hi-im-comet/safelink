"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/store/AppState";
import { computeRisk, GRADE_META } from "@/lib/risk/score";
import { gradeClasses } from "@/lib/ui/grade";
import { RiskBreakdown } from "@/components/admin/RiskBreakdown";
import { DocGenerator } from "@/components/admin/DocGenerator";
import { ActionLogForm } from "@/components/admin/ActionLogForm";
import { generatePhoneScript, generateVisitChecklist } from "@/lib/api";

export default function HouseholdDetail() {
  const { id } = useParams<{ id: string }>();
  const { getHousehold, weather, hydrated, logLlmCall } = useAppState();
  const h = getHousehold(id);

  if (!h) {
    return (
      <div className="rounded-xl3 bg-white p-10 text-center ring-1 ring-ink/8">
        <p className="text-forest/60">{hydrated ? "가구를 찾을 수 없습니다." : "불러오는 중…"}</p>
        <Link href="/admin" className="mt-3 inline-block font-semibold text-pine">← 우선순위 리스트</Link>
      </div>
    );
  }

  const risk = computeRisk(h, weather);
  const g = gradeClasses[risk.grade];
  const help = h.helpRequested;

  // "왜 지금 우선 대응 대상인가" — 가구 데이터에서 사유를 만든다.
  const whyNow: string[] = [];
  if (help) whyNow.push("오늘 도움 요청 접수", ...(h.helpTags ?? []));
  if (/남서향|남향|서향/.test(h.housing.direction)) whyNow.push(`${h.housing.direction} ${h.housing.type} · 직사광`);
  if (h.housing.floor === "반지하") whyNow.push("반지하 · 열기·환기 취약");
  if (h.housing.floor === "최상층") whyNow.push("최상층 · 복사열 취약");
  if (/재택|오후/.test(h.housing.pattern)) whyNow.push(`${h.housing.pattern} · 피크 시간 실내 체류`);
  if (h.resident.alone && /[6-9]0대/.test(h.resident.ageBand)) whyNow.push("독거 고령자");
  if (!h.housing.ac) whyNow.push("냉방기 없음");
  if (h.housing.costBurden === "높음") whyNow.push("냉방비 부담 높음");
  if (h.lastContactDays >= 7) whyNow.push(`최근 연락 ${h.lastContactDays}일 경과`);
  if (h.needsSupport) whyNow.push("냉방용품 지원 검토 대상");
  const whyTop = whyNow.slice(0, 6);
  const whyUrgent = help || risk.grade === "urgent";

  // 취약도 판단 근거 (사용자 선택값이 아니라 등록 정보·요청 기반으로 산정)
  const basis: [string, string][] = [
    ["고령 여부", /[6-9]0대/.test(h.resident.ageBand) ? `고령 (${h.resident.ageBand})` : "해당 없음"],
    ["기저질환", h.resident.condition ?? "없음"],
    ["혼자 거주", h.resident.alone ? "예" : "아니오"],
    ["최근 안부 확인", `${h.lastContactDays}일 전`],
  ];

  const housingFacts: [string, string][] = [
    ["거주 형태", h.housing.type],
    ["방향", h.housing.direction],
    ["층수", h.housing.floor],
    ["에어컨", h.housing.ac ? "있음" : "없음"],
    ["냉방비 부담", h.housing.costBurden],
    ["생활패턴", h.housing.pattern],
  ];

  return (
    <div className="stagger">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest/60 transition hover:text-forest">
        <span aria-hidden>←</span> 우선순위 리스트
      </Link>

      {/* 헤더 */}
      <div
        className={`mt-4 grid gap-5 rounded-xl3 bg-white p-6 ring-1 sm:grid-cols-[auto_1fr] sm:p-7 ${
          help ? "ring-2 ring-ember/40" : "ring-ink/8"
        }`}
      >
        {/* 점수 블록 */}
        <div className={`flex flex-col items-center justify-center rounded-2xl px-7 py-5 ${help ? "bg-ember-soft" : g.soft}`}>
          <span className={`tnum text-6xl font-extrabold leading-none ${help ? "text-ember" : g.text}`}>
            {risk.score}
          </span>
          <span className="mt-1 text-sm font-semibold text-forest/55">위험도</span>
        </div>

        {/* 식별 + 요약 */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{h.id}</h1>
            <span className="text-forest/55">{h.region}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${g.chip}`}>
              {GRADE_META[risk.grade].label}
            </span>
            {help && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ember px-2.5 py-0.5 text-sm font-bold text-white">
                오늘 도움 요청
              </span>
            )}
          </div>
          <p className="mt-2 text-forest/70">
            {h.resident.ageBand} · {h.resident.alone ? "독거" : "동거"}
            {h.resident.condition ? ` · ${h.resident.condition}` : ""} ·{" "}
            {h.housing.type}({h.housing.direction}) · 마지막 연락 {h.lastContactDays}일 전
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-forest/55">담당 <b className="text-forest">{h.assignee ?? "미배정"}</b></span>
            <span className="text-forest/55">상태 <b className="text-forest">{h.status}</b></span>
          </div>
        </div>
      </div>

      {/* 왜 지금 우선 대응 대상인가 */}
      {whyTop.length > 0 && (
        <section
          className={`mt-4 rounded-xl3 p-5 ring-1 ${
            whyUrgent ? "bg-ember-soft/70 ring-ember/20" : "bg-mint-soft/60 ring-green/12"
          }`}
        >
          <h2 className={`flex items-center gap-2 text-sm font-bold ${whyUrgent ? "text-ember-ink" : "text-pine"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${whyUrgent ? "bg-ember" : "bg-green"}`} />
            왜 지금 우선 대응 대상인가
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {whyTop.map((r) => (
              <span key={r} className="rounded-full bg-white/75 px-3 py-1.5 text-sm font-medium text-forest">
                {r}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 본문 2단 */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        {/* 좌측 메인 */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* 위험 요인 + 추천 조치 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ember-ink">위험 요인</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {h.factors.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl3 bg-forest p-5 text-white">
              <h2 className="text-sm font-bold uppercase tracking-wide text-mint">추천 조치</h2>
              <ol className="mt-3 flex flex-col gap-2">
                {h.recommendedActions.map((a, i) => (
                  <li key={a} className="flex gap-2.5 text-sm">
                    <span className="tnum font-bold text-lime">{i + 1}</span>
                    <span className="text-white/90">{a}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* 문서 생성 (LLM) */}
          <section className="rounded-xl3 bg-mist/50 p-5 ring-1 ring-green/12">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">문서 생성</h2>
              <span className="text-xs text-forest/50">LLM은 여기에만 사용됩니다</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DocGenerator
                label="전화 스크립트 생성"
                hint="복지사가 바로 읽을 안부 확인 문안"
                generate={() => generatePhoneScript(h)}
                onGenerated={(d) => logLlmCall({ type: "phone_script", householdId: h.id, tokens: d.tokens, cached: false })}
              />
              <DocGenerator
                label="방문 체크리스트 생성"
                hint="현장 점검 항목"
                generate={() => generateVisitChecklist(h)}
                onGenerated={(d) => logLlmCall({ type: "visit_checklist", householdId: h.id, tokens: d.tokens, cached: false })}
              />
            </div>
          </section>

          {/* 조치 기록 */}
          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold text-ink">조치 결과 기록</h2>
            <p className="text-sm text-forest/55">전화·방문 결과를 남기면 상태가 갱신됩니다.</p>
            <div className="mt-4">
              <ActionLogForm household={h} />
            </div>
          </section>
        </div>

        {/* 우측 사이드 */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold text-ink">위험도 구성</h2>
            <p className="mb-4 text-sm text-forest/55">규칙 엔진이 계산 · LLM 미사용</p>
            <RiskBreakdown risk={risk} />
          </section>

          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold text-ink">가구 정보</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {housingFacts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-forest/45">{k}</dt>
                  <dd className="text-sm font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl3 bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold text-ink">취약도 판단 근거</h2>
            <p className="mb-3 text-sm text-forest/55">사용자가 직접 고른 값이 아니라 등록 정보·도움 요청을 바탕으로 산정합니다.</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {basis.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-forest/45">{k}</dt>
                  <dd className="text-sm font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
