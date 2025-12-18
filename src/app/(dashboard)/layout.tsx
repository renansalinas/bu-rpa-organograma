import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#f5f6fa]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col ml-[260px]">
        <Topbar />
        <section className="flex-1 p-6 mt-16 overflow-hidden">
          {children}
        </section>
      </main>
    </div>
  );
}

