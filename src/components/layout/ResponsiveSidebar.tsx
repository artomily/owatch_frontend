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
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg dark:bg-white/10 dark:backdrop-blur-md bg-white border dark:border-white/20 border-gray-200 shadow-lg"
        >
          {isOpen ? (
            <X className="w-5 h-5 dark:text-white text-gray-900" />
          ) : (
            <Menu className="w-5 h-5 dark:text-white text-gray-900" />
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
        } dark:bg-gray-900/95 dark:backdrop-blur-xl bg-white border-r dark:border-gray-800 border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-800 border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold dark:text-white text-gray-900">
                O'Watch
              </h1>
            </div>
            {/* Theme Toggle */}
            <ThemeToggle variant="ghost" size="sm" />
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
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group transform hover:scale-105 ${
                        isActive
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                          : "dark:text-gray-300 text-gray-600 hover:dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900"
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
          <div className="border-t dark:border-gray-800 border-gray-200 p-4 space-y-4">
            {/* Wallet Connection */}
            <SidebarWalletInfo />

            {/* Balance Display */}
            <div className="px-4 py-3 dark:bg-white/5 dark:backdrop-blur-md bg-white border dark:border-white/20 border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                {/* <span className="text-sm dark:text-gray-400 text-gray-600">
                  Your Balance
                </span> */}
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold dark:text-white text-gray-900">
                    0 OWT
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs dark:text-gray-500 text-gray-400">
                ≈ $0.00 USD
              </div>
            </div>

            {/* Theme Toggle */}
            {/* <div className="flex justify-center">
              <ThemeToggle />
            </div> */}
          </div>
        </div>
      </aside>
    </>
  );
}
