"use client";

import { ResponsiveSidebar } from "@/components/layout/ResponsiveSidebar";
import { useSidebar } from "@/context/SidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="flex h-screen bg-brand-cream">
      <ResponsiveSidebar />

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isMobile ? "ml-0" : isOpen ? "lg:ml-0" : "lg:ml-0"
        }`}
      >
        {/* Content Wrapper */}
        <div className="flex-1 overflow-auto">
          <div className={`p-6 ${isMobile ? "pt-20" : "pt-6"}`}>{children}</div>
        </div>
      </main>
    </div>
  );
}
