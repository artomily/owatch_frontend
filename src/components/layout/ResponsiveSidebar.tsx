"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Play,
  User,
  Settings,
  Coins,
  Menu,
  X,
  LogOut,
  Lock,
  ArrowRightLeft,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { SidebarWalletInfo } from "@/components/SidebarWalletInfo";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Videos",
    href: "/dashboard/videos",
    icon: Play,
  },
  // Temporarily hidden
  // {
  //   name: "Convert Points",
  //   href: "/dashboard/convert",
  //   icon: ArrowRightLeft,
  // },
  // {
  //   name: "Staking",
  //   href: "/dashboard/staking",
  //   icon: Lock,
  // },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function ResponsiveSidebar() {
  const { isOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white border border-brand-green/15 shadow-sm"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-brand-ink" />
          ) : (
            <Menu className="w-5 h-5 text-brand-ink" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-all duration-300 ease-out lg:translate-x-0 lg:relative lg:z-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } bg-brand-cream border-r border-brand-green/12`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-brand-green/12">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-green rounded-md flex items-center justify-center">
                <Coins className="w-5 h-5 text-brand-cream" />
              </div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-brand-ink">
                O&apos;Watch
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && closeSidebar()}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 group ${
                        isActive
                          ? "bg-brand-green text-brand-cream"
                          : "text-brand-ink/60 hover:bg-brand-green/8 hover:text-brand-ink"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-brand-green/12 p-4 space-y-4">
            {/* Wallet Connection */}
            <SidebarWalletInfo />

            {/* Balance Display */}
            <div className="px-4 py-3 bg-white border border-brand-green/15 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-brand-green" />
                  <span className="font-semibold text-brand-ink">0 OWT</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-brand-ink/40">≈ $0.00 USD</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
