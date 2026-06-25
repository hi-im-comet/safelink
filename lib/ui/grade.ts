import type { Grade } from "@/lib/types";

// 등급별 색 클래스. ember(긴급) → amber(전화) → lime(안내) → mint(관찰)로
// "더움 → 시원함" 온도 흐름을 따른다. (literal 클래스라 Tailwind가 스캔 가능)
export const gradeClasses: Record<
  Grade,
  { chip: string; bar: string; text: string; dot: string; soft: string; ring: string }
> = {
  urgent: {
    chip: "bg-ember-soft text-ember-ink",
    bar: "bg-ember",
    text: "text-ember",
    dot: "bg-ember",
    soft: "bg-ember-soft",
    ring: "ring-ember/30",
  },
  call: {
    chip: "bg-amber-soft text-amber-ink",
    bar: "bg-amber",
    text: "text-amber-ink",
    dot: "bg-amber",
    soft: "bg-amber-soft",
    ring: "ring-amber/30",
  },
  guide: {
    chip: "bg-lime/25 text-forest",
    bar: "bg-lime",
    text: "text-pine",
    dot: "bg-lime",
    soft: "bg-lime/15",
    ring: "ring-lime/40",
  },
  monitor: {
    chip: "bg-mint-soft text-pine",
    bar: "bg-green",
    text: "text-pine",
    dot: "bg-green",
    soft: "bg-mint-soft",
    ring: "ring-green/25",
  },
};
