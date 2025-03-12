
import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="grid grid-cols-[220px_1fr] h-screen">
      <Sidebar className="border-l border-border h-screen" />
      <main className="overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
