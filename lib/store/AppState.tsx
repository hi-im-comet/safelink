"use client";

// 클라이언트 공유 상태. /user 와 /admin 이 같은 트리를 공유한다.
// 사용자가 도움 요청을 누르면 관리자 리스트가 즉시 갱신된다.
// 로그인·서버 없이 localStorage에만 저장된다. (SSR 안전)
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Hazard, Household, Status, UserMode, UserProfile } from "@/lib/types";
import { demoHouseholds, USER_HOUSEHOLD_ID } from "@/lib/mock/households";
import { assessRisk, PRIMARY_HAZARD } from "@/lib/hazards";

const STORAGE_KEY = "safelink.demo.v2";

interface Persisted {
  households: Household[];
  mode: UserMode | null;
  profile: UserProfile | null;
  selectedHazard: Hazard;
}

interface AppStateValue extends Persisted {
  hydrated: boolean;
  hasProfile: boolean;
  setHazard: (h: Hazard) => void;
  setMode: (m: UserMode) => void;
  changeMode: () => void; // 모드 재선택 (프로필·요청 초기화)
  saveProfile: (p: UserProfile) => void;
  submitHelpRequest: (reasons: string[]) => void;
  setHouseholdStatus: (id: string, status: Status) => void;
  getHousehold: (id: string) => Household | undefined;
  resetDemo: () => void;
}

const seed = (): Persisted => ({
  households: JSON.parse(JSON.stringify(demoHouseholds)),
  mode: null,
  profile: null,
  selectedHazard: PRIMARY_HAZARD,
});

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(seed);
  const [hydrated, setHydrated] = useState(false);

  // 마운트 후 localStorage 복원 (SSR 불일치 방지)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        // 항상 최신 스키마(demoHouseholds)를 기준으로 하고, 저장된 운영 상태만 덮어쓴다.
        // (가구 데이터 필드가 추가돼도 stale localStorage 때문에 깨지지 않도록)
        const saved = Array.isArray(parsed.households) ? parsed.households : [];
        const households = demoHouseholds.map((base) => {
          const prev = saved.find((p) => p && p.id === base.id);
          if (!prev) return { ...base };
          const merged: Household = {
            ...base,
            status: prev.status ?? base.status,
            needsSupport: prev.needsSupport ?? base.needsSupport,
            helpRequested: prev.helpRequested,
            requestedAt: prev.requestedAt,
            helpReasons: prev.helpReasons,
            helpSource: prev.helpSource,
          };
          // 사용자 연결 가구는 사용자 입력 반영값도 복원
          if (base.isUser && prev.helpRequested) {
            merged.hazard = prev.hazard ?? base.hazard;
            merged.score = typeof prev.score === "number" ? prev.score : base.score;
            merged.region = prev.region ?? base.region;
            merged.ageInfo = prev.ageInfo ?? base.ageInfo;
            merged.factors = Array.isArray(prev.factors) ? prev.factors : base.factors;
          }
          return merged;
        });
        setState((s) => ({
          households,
          mode: parsed.mode ?? null,
          profile: parsed.profile ?? null,
          selectedHazard: parsed.selectedHazard ?? s.selectedHazard,
        }));
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  // 변경 시 저장
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, hydrated]);

  const setHazard = useCallback((h: Hazard) => {
    setState((s) => ({ ...s, selectedHazard: h }));
  }, []);

  const setMode = useCallback((m: UserMode) => {
    setState((s) => ({ ...s, mode: m }));
  }, []);

  // 모드 변경 — 프로필·도움요청 초기화 후 모드 선택 화면으로
  const changeMode = useCallback(() => {
    setState((s) => ({
      ...s,
      mode: null,
      profile: null,
      households: JSON.parse(JSON.stringify(demoHouseholds)),
    }));
  }, []);

  const saveProfile = useCallback((p: UserProfile) => {
    setState((s) => ({ ...s, profile: p }));
  }, []);

  // 도움 요청 — 사용자 가구에 현재 프로필·선택 재난 유형의 분석 결과를 반영한다.
  const submitHelpRequest = useCallback((reasons: string[]) => {
    setState((s) => {
      if (!s.profile) return s;
      const a = assessRisk(s.profile, s.selectedHazard);
      const requestedAt = new Date().toISOString();
      return {
        ...s,
        households: s.households.map((h) =>
          h.id === USER_HOUSEHOLD_ID
            ? {
                ...h,
                hazard: s.selectedHazard,
                score: a.score,
                region: s.profile!.region || h.region,
                ageInfo: `${s.profile!.ageBand}${s.profile!.alone ? " · 독거" : ""}`,
                factors: a.tags.slice(0, 3),
                actions: reasons.length ? reasons : h.actions,
                helpRequested: true,
                requestedAt,
                helpReasons: reasons,
                helpSource: s.mode === "guardian" ? "guardian" : "user",
                status: "대기",
              }
            : h,
        ),
      };
    });
  }, []);

  // 관리자 상세에서 상태 변경 → localStorage에 저장되어 새로고침/리스트에 유지된다.
  const setHouseholdStatus = useCallback((id: string, status: Status) => {
    setState((s) => ({
      ...s,
      households: s.households.map((h) => (h.id === id ? { ...h, status } : h)),
    }));
  }, []);

  const getHousehold = useCallback(
    (id: string) => state.households.find((h) => h.id === id),
    [state.households],
  );

  const resetDemo = useCallback(() => {
    setState(seed());
    try {
      // 사용 모드·프로필·요청 상태 등 SafeLink 관련 localStorage 값을 모두 삭제
      Object.keys(localStorage)
        .filter((k) => k.startsWith("safelink"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* noop */
    }
  }, []);

  const value: AppStateValue = {
    ...state,
    hydrated,
    hasProfile: state.profile !== null,
    setHazard,
    setMode,
    changeMode,
    saveProfile,
    submitHelpRequest,
    setHouseholdStatus,
    getHousehold,
    resetDemo,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
