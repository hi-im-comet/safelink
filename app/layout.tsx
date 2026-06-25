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
  title: "CoolLink AI — 저전력 기후안전 에이전트",
  description: "폭염 대응을 개인 행동과 공공 돌봄 운영으로 연결합니다.",
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
