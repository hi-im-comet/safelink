import type { Config } from "tailwindcss";

/**
 * CoolLink AI — 디자인 토큰
 * 연두/초록/민트가 dominant. 위험 신호만 흙빛 warm(네온 금지).
 * 등급 색은 ember(긴급) → amber(전화) → lime(안내) → mint(모니터링)로
 * "더움 → 시원함" 온도 레이어를 그대로 따라간다.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 초록 계열 (브랜드 / 안전)
        ink: "#0E3B2E", // 딥 포레스트 — 기본 텍스트
        forest: "#13503D",
        pine: "#1C6B4F",
        green: "#2E8B6B",
        grass: "#4FAE83",
        lime: "#9BD64A", // 연두 accent
        mint: "#BFE9D2",
        "mint-soft": "#D8F2E4",
        mist: "#ECF6EF",
        paper: "#F6FAF4", // 배경
        "paper-warm": "#FBFAF3",
        // 위험 신호 (흙빛 warm)
        ember: "#BD4A2C",
        "ember-soft": "#F4E1D9",
        "ember-ink": "#7E2D17",
        amber: "#C9881F",
        "amber-soft": "#F6EBD0",
        "amber-ink": "#7C5410",
        clay: "#A8763C",
      },
      fontFamily: {
        body: ["var(--font-body)", "Pretendard Variable", "Pretendard", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.375rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,59,46,0.04), 0 8px 24px -12px rgba(14,59,46,0.12)",
        lift: "0 2px 4px rgba(14,59,46,0.05), 0 24px 48px -20px rgba(14,59,46,0.22)",
        glow: "0 0 0 1px rgba(155,214,74,0.35), 0 12px 32px -16px rgba(46,139,107,0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -2%, 0) scale(1.05)" },
        },
        "drift-slow": {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "50%": { transform: "translate3d(-3%, 2%, 0) rotate(2deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(189,74,44,0.35)" },
          "70%": { boxShadow: "0 0 0 12px rgba(189,74,44,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(189,74,44,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease both",
        drift: "drift 18s ease-in-out infinite",
        "drift-slow": "drift-slow 26s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.66,0,0,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
