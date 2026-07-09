"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store/AppState";
import { ProfileForm } from "@/components/user/ProfileForm";
import { defaultProfile } from "@/lib/profile";
import type { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const { hydrated, mode, profile, saveProfile, changeMode, resetDemo } = useAppState();
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="shimmer h-24 w-full max-w-xs rounded-2xl" />
      </div>
    );
  }

  // 모드 미선택 시 — 모드 선택으로 유도
  if (!mode) {
    return (
      <div className="stagger flex h-full flex-col items-center justify-center text-center">
        <p className="text-forest/70">먼저 사용 방식을 선택해주세요.</p>
        <Link href="/user" className="mt-3 rounded-2xl bg-forest px-5 py-3 text-sm font-bold text-white">사용 방식 선택하기</Link>
      </div>
    );
  }

  const isGuardian = mode === "guardian";

  function handleSave(p: UserProfile) {
    saveProfile(p);
    router.push("/user");
  }
  function handleChangeMode() {
    if (confirm("사용 모드를 변경하면 저장된 정보가 삭제됩니다. 계속할까요?")) {
      changeMode();
      router.push("/user");
    }
  }
  function handleReset() {
    if (confirm("데모를 초기화하고 처음 상태로 돌아갈까요? 저장된 모드·정보가 모두 삭제됩니다.")) {
      resetDemo();
      router.push("/user");
    }
  }

  return (
    <div className="stagger flex flex-col gap-4">
      <div>
        <p className="text-sm text-forest/55">{isGuardian ? "보호자 확인 모드" : "본인 안전 모드"}</p>
        <h1 className="font-display text-xl font-extrabold text-ink">
          {isGuardian ? "가족 정보 수정" : "내 안전 정보 수정"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/65">
          {isGuardian
            ? "부모님 또는 가족의 주거·건강 상태를 바탕으로 안부 확인 필요 여부를 안내합니다."
            : "입력한 정보를 바탕으로 오늘의 생활재난 위험과 행동요령을 맞춰 안내합니다."}
        </p>
      </div>

      <ProfileForm
        mode={mode}
        initial={profile ?? defaultProfile(mode)}
        submitLabel={isGuardian ? "가족 정보 저장하기" : "내 안전 정보 저장하기"}
        onSave={handleSave}
      />

      {/* 모드/데모 관리 */}
      <div className="mt-2 rounded-xl3 bg-white p-4 ring-1 ring-ink/8">
        <p className="text-sm font-bold text-ink">사용 방식 · 데모</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleChangeMode}
            className="rounded-2xl bg-mist py-3 text-center text-sm font-semibold text-forest ring-1 ring-ink/8 transition hover:ring-green/30"
          >
            사용 모드 변경
          </button>
          <button
            onClick={handleReset}
            className="rounded-2xl bg-white py-3 text-center text-sm font-semibold text-ember-ink ring-1 ring-ember/20 transition hover:ring-ember/40"
          >
            데모 초기화
          </button>
        </div>
        <p className="mt-2 text-xs text-forest/45">모드 변경·초기화 시 저장된 정보가 삭제됩니다.</p>
      </div>
    </div>
  );
}
