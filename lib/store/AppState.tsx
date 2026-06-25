"use client";

// 클라이언트 공유 상태. /user 와 /admin 이 같은 트리를 공유하므로
// 사용자가 도움 요청을 누르면 관리자 리스트가 즉시 갱신된다.
// localStorage로 새로고침/탭 이동에도 유지된다. (백엔드 붙으면 이 자리만 교체)
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ActionLog, HelpSource, Household, LlmCall, Metrics } from "@/lib/types";
import { HOUSEHOLDS } from "@/lib/mock/households";
import { BASE_METRICS } from "@/lib/mock/metrics";
import { TODAY_WEATHER } from "@/lib/mock/weather";
import { CAREGIVER_PROFILE_DEFAULT, PROFILE_DEFAULT, USER_INFO_DEFAULT } from "@/lib/mock/user";

const STORAGE_KEY = "coollink.demo.v5";

interface Persisted {
  households: Household[];
  actionLogs: ActionLog[];
  llmCalls: LlmCall[];
  userProfile: Record<string, string>;
  caregiverProfile: Record<string, string>;
  userInfo: Record<string, string>;
  caregiverMode: boolean;
}

interface AppStateValue extends Persisted {
  hydrated: boolean;
  weather: typeof TODAY_WEATHER;
  metrics: Metrics;
  getHousehold: (id: string) => Household | undefined;
  submitHelpRequest: (
    id: string,
    payload: { reasons: string[]; tags?: string[]; recommendedActions?: string[]; contactTag?: string },
    source?: HelpSource,
  ) => void;
  saveProfile: (profile: Record<string, string>) => void;
  saveUserInfo: (info: Record<string, string>) => void;
  setCaregiverMode: (on: boolean) => void;
  recordAction: (
    id: string,
    payload: { result: string; note: string; nextVisit?: string; status?: Household["status"]; by?: string },
  ) => void;
  logLlmCall: (call: Omit<LlmCall, "id" | "at">) => void;
  resetDemo: () => void;
}

const seed = (): Persisted => ({
  households: JSON.parse(JSON.stringify(HOUSEHOLDS)),
  actionLogs: [],
  llmCalls: [],
  userProfile: { ...PROFILE_DEFAULT },
  caregiverProfile: { ...CAREGIVER_PROFILE_DEFAULT },
  userInfo: { ...USER_INFO_DEFAULT },
  caregiverMode: false,
});

const AppStateContext = createContext<AppStateValue | null>(null);

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(seed);
  const [hydrated, setHydrated] = useState(false);

  // 마운트 후 localStorage에서 복원 (SSR 불일치 방지)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        // 누락된 키(구버전 호환)는 기본값으로 채운다.
        setState((s) => ({
          ...s,
          ...parsed,
          userProfile: { ...PROFILE_DEFAULT, ...(parsed.userProfile ?? {}) },
          caregiverProfile: { ...CAREGIVER_PROFILE_DEFAULT, ...(parsed.caregiverProfile ?? {}) },
          userInfo: { ...USER_INFO_DEFAULT, ...(parsed.userInfo ?? {}) },
          caregiverMode: parsed.caregiverMode ?? false,
        }));
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, hydrated]);

  const submitHelpRequest = useCallback(
    (
      id: string,
      payload: { reasons: string[]; tags?: string[]; recommendedActions?: string[]; contactTag?: string },
      source: HelpSource = "user",
    ) => {
      setState((s) => ({
        ...s,
        households: s.households.map((h) =>
          h.id === id
            ? {
                ...h,
                helpRequested: true,
                requestedAt: new Date().toISOString(),
                helpReasons: payload.reasons,
                helpTags: payload.tags,
                helpContactTag: payload.contactTag,
                helpSource: source,
                recommendedActions:
                  payload.recommendedActions && payload.recommendedActions.length
                    ? payload.recommendedActions
                    : h.recommendedActions,
                status: h.status === "완료" ? "대기" : h.status,
              }
            : h,
        ),
      }));
    },
    [],
  );

  const saveProfile = useCallback((profile: Record<string, string>) => {
    setState((s) => (s.caregiverMode ? { ...s, caregiverProfile: profile } : { ...s, userProfile: profile }));
  }, []);

  const saveUserInfo = useCallback((info: Record<string, string>) => {
    setState((s) => ({ ...s, userInfo: info }));
  }, []);

  const setCaregiverMode = useCallback((on: boolean) => {
    setState((s) => ({ ...s, caregiverMode: on }));
  }, []);

  const recordAction = useCallback<AppStateValue["recordAction"]>(
    (id, payload) => {
      const log: ActionLog = {
        id: uid("log"),
        householdId: id,
        at: new Date().toISOString(),
        result: payload.result,
        note: payload.note,
        nextVisit: payload.nextVisit,
        by: payload.by ?? "담당자",
      };
      setState((s) => ({
        ...s,
        actionLogs: [log, ...s.actionLogs],
        households: s.households.map((h) =>
          h.id === id && payload.status ? { ...h, status: payload.status } : h,
        ),
      }));
    },
    [],
  );

  const logLlmCall = useCallback<AppStateValue["logLlmCall"]>((call) => {
    setState((s) => ({
      ...s,
      llmCalls: [{ ...call, id: uid("llm"), at: new Date().toISOString() }, ...s.llmCalls],
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(seed());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const getHousehold = useCallback(
    (id: string) => state.households.find((h) => h.id === id),
    [state.households],
  );

  const metrics = useMemo<Metrics>(() => {
    const live = state.llmCalls.length;
    const llmCalls = BASE_METRICS.llmCalls + live;
    const noLlmRate =
      Math.round(((BASE_METRICS.analyzed - llmCalls) / BASE_METRICS.analyzed) * 1000) / 10;
    const docRequests = llmCalls + BASE_METRICS.cacheReuse; // 호출 + 캐시 재사용
    return { ...BASE_METRICS, llmCalls, noLlmRate, docRequests };
  }, [state.llmCalls.length]);

  const value: AppStateValue = {
    ...state,
    hydrated,
    weather: TODAY_WEATHER,
    metrics,
    getHousehold,
    submitHelpRequest,
    saveProfile,
    saveUserInfo,
    setCaregiverMode,
    recordAction,
    logLlmCall,
    resetDemo,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
