import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";
import { AppStateProvider } from "@/lib/store/AppState";

// 디스플레이/숫자 — 특색 있는 그로테스크 (Inter/Roboto 같은 제네릭 회피)
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafeLink AI — 생활재난 안전 에이전트",
  description:
    "폭염·홍수·한파·미세먼지·태풍까지, 우리 집 기준으로 오늘의 생활재난 위험과 행동요령을 안내합니다.",
};

export const viewport: Viewport = {
  themeColor: "#13503d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={display.variable}>
      <body>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
