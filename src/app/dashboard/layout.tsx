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
        <div className="min-h-screen bg-brand-cream">
          <DashboardLayout>{children}</DashboardLayout>
        </div>
      </SidebarProvider>
    </DashboardErrorBoundary>
  );
}
