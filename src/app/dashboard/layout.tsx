"use client";

import { useWalletRedirect } from "@/hooks/useWalletRedirect";
import { SidebarProvider } from "@/context/SidebarContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardErrorBoundary } from "@/components/DashboardErrorBoundary";

export default function Layout({ children }: { children: React.ReactNode }) {
  // This hook handles auto-redirect when wallet disconnects
  useWalletRedirect();

  return (
    <DashboardErrorBoundary>
      <SidebarProvider>
        {/* Dark mode background */}
        <div className="hidden dark:block min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          {/* Modern Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.3)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/10 to-transparent"></div>
          </div>

          <div className="relative z-10">
            <DashboardLayout>{children}</DashboardLayout>
          </div>
        </div>

        {/* Light mode background */}
        <div className="dark:hidden min-h-screen bg-gray-50">
          <DashboardLayout>{children}</DashboardLayout>
        </div>
      </SidebarProvider>
    </DashboardErrorBoundary>
  );
}
