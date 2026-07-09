import { UserBottomNav } from "@/components/user/BottomNav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center sm:py-5">
      <div className="relative flex h-screen w-full max-w-[440px] flex-col overflow-hidden bg-paper-warm ring-1 ring-green/10 sm:h-[calc(100vh-2.5rem)] sm:rounded-[2.2rem] sm:shadow-lift">
        <main className="scroll-soft flex-1 overflow-y-auto px-5 pb-8 pt-6">{children}</main>
        <UserBottomNav />
      </div>
    </div>
  );
}
