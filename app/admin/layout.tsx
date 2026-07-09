import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
