// 히어로 추상 비주얼 — 온도 레이어 · 바람길 · 그늘 · 집 · 연결망이 은은히 겹친 느낌.
// 전부 SVG/gradient. 사진 없이 "기후 레이어드" 정체성을 만든다.
export function ClimateLayers({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="cl-heat" cx="78%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#F3C969" stopOpacity="0.9" />
          <stop offset="38%" stopColor="#E7A24B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#E7A24B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cl-cool" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1C6B4F" />
          <stop offset="55%" stopColor="#2E8B6B" />
          <stop offset="100%" stopColor="#7FC79E" />
        </linearGradient>
        <linearGradient id="cl-mint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D8F2E4" />
          <stop offset="100%" stopColor="#9BD64A" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* 바탕: 시원한 그라데이션 면 */}
      <rect x="0" y="0" width="600" height="600" fill="url(#cl-cool)" />

      {/* 온도 레이어 — 위에서 내려오는 더운 띠 */}
      <g className="animate-drift-slow" style={{ transformOrigin: "center" }}>
        <ellipse cx="470" cy="90" rx="320" ry="240" fill="url(#cl-heat)" />
      </g>

      {/* 온도 등고선 (strata) */}
      <g stroke="#ffffff" strokeOpacity="0.16" fill="none" strokeWidth="1.5">
        <path d="M-20 200 C 150 150, 320 250, 620 180" />
        <path d="M-20 250 C 150 200, 340 300, 620 230" />
        <path d="M-20 300 C 160 250, 340 350, 620 285" />
        <path d="M-20 352 C 170 305, 350 400, 620 340" />
      </g>

      {/* 그늘 — 둥근 차광 면 */}
      <g className="animate-drift" style={{ transformOrigin: "20% 80%" }}>
        <path
          d="M-40 620 Q 120 430 320 500 T 640 470 L 640 640 L -40 640 Z"
          fill="#0E3B2E"
          fillOpacity="0.22"
        />
        <path
          d="M-40 640 Q 160 500 360 560 T 640 540 L 640 660 L -40 660 Z"
          fill="#0E3B2E"
          fillOpacity="0.3"
        />
      </g>

      {/* 바람길 — 흐르는 선 */}
      <g stroke="#D8F2E4" fill="none" strokeLinecap="round">
        <path d="M40 430 C 180 400, 230 470, 380 430 S 560 410, 600 440" strokeWidth="2.5" strokeOpacity="0.7" />
        <path d="M20 470 C 160 450, 250 510, 400 470 S 560 455, 600 480" strokeWidth="1.8" strokeOpacity="0.5" />
      </g>

      {/* 집 — 단순한 지붕 실루엣 */}
      <g fill="none" stroke="#0E3B2E" strokeOpacity="0.55" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M210 360 l60 -46 l60 46" />
        <path d="M232 352 v44 h76 v-44" />
        <path d="M360 380 l44 -34 l44 34" />
        <path d="M376 374 v34 h56 v-34" />
      </g>

      {/* 연결망 — 노드와 링크 */}
      <g>
        <g stroke="#9BD64A" strokeWidth="1.6" strokeOpacity="0.75">
          <line x1="130" y1="150" x2="250" y2="120" />
          <line x1="250" y1="120" x2="360" y2="175" />
          <line x1="360" y1="175" x2="300" y2="270" />
          <line x1="300" y1="270" x2="170" y2="240" />
          <line x1="170" y1="240" x2="130" y2="150" />
          <line x1="360" y1="175" x2="470" y2="240" />
        </g>
        {[
          [130, 150],
          [250, 120],
          [360, 175],
          [300, 270],
          [170, 240],
          [470, 240],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i === 2 ? 7 : 4.5} fill="#F6FAF4" stroke="#9BD64A" strokeWidth="2" />
        ))}
      </g>
    </svg>
  );
}
