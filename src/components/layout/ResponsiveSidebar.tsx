"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  LayoutDashboard,
  Play,
  User,
  Settings,
  Coins,
  Menu,
  X,
  Wallet,
  Trophy,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { SidebarWalletInfo } from "@/components/SidebarWalletInfo";
import { getProfileByWallet, getTotalPoints } from "@/lib/queries";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Earn",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Watch & Earn", href: "/dashboard/videos", icon: Play },
    ],
  },
  {
    label: "Rewards",
    items: [
      { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
      { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
      { name: "Referral", href: "/dashboard/referral", icon: Gift },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Profile", href: "/dashboard/profile", icon: User },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function ResponsiveSidebar() {
  const { isOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const { address } = useAccount();
  const [balance, setBalance] = useState<number | null>(null);

  // Live OWT balance (off-chain points total) for the sidebar footer.
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!address) {
        setBalance(null);
        return;
      }
      const profileId = await getProfileByWallet(address);
      if (!profileId) {
        if (active) setBalance(0);
        return;
      }
      const total = await getTotalPoints(profileId);
      if (active) setBalance(total);
    };
    load();
    return () => {
      active = false;
    };
  }, [address]);

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
          <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-ink/35">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => isMobile && closeSidebar()}
                          className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 group ${
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
              </div>
            ))}
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
                  <span className="font-semibold text-brand-ink">
                    {balance === null
                      ? "— OWT"
                      : `${balance.toLocaleString()} OWT`}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-brand-ink/40">
                {balance === null
                  ? "Connect wallet to view balance"
                  : "Earned watch-to-earn rewards"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
