"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Card, Badge } from "@/components/ui";
import {
  BarChart3,
  Play,
  User,
  Settings,
  Coins,
  Lock,
  ArrowRightLeft,
} from "lucide-react";

export function Sidebar(): JSX.Element {
  const pathname = usePathname();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
    },
    {
      id: "videos",
      label: "Watch & Earn",
      icon: Play,
      href: "/dashboard/videos",
    },
    // Temporarily hidden
    // {
    //   id: "convert",
    //   label: "Convert Points",
    //   icon: ArrowRightLeft,
    //   href: "/dashboard/convert",
    // },
    // {
    //   id: "staking",
    //   label: "Staking",
    //   icon: Lock,
    //   href: "/dashboard/staking",
    // },
    { id: "profile", label: "Profile", icon: User, href: "/dashboard/profile" },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 dark:bg-white/5 dark:backdrop-blur-md dark:border-r dark:border-white/10 bg-white border-r border-gray-200 p-6">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold dark:text-white text-gray-900">
              O'Watch.ID
            </h1>
            <p className="text-xs dark:text-slate-400 text-gray-500">
              Watch to Earn
            </p>
          </div>
        </div>
      </div>

      {/* Token Balance Card */}
      <Card className="p-4 mb-6 dark:bg-gradient-to-r dark:from-purple-500/10 dark:to-pink-500/10 dark:backdrop-blur-sm dark:border dark:border-purple-500/20 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="w-4 h-4 dark:text-purple-400 text-purple-600" />
            <span className="text-sm font-medium dark:text-slate-300 text-gray-600">
              Balance
            </span>
          </div>
          <div className="text-2xl font-bold dark:text-purple-400 text-purple-600">
            0
          </div>
          <div className="text-xs dark:text-slate-400 text-gray-500">
            OWT tokens
          </div>
        </div>
      </Card>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.id} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg"
                    : "dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.id === "videos" && (
                  <Badge
                    variant="secondary"
                    className="ml-auto dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30 bg-green-100 text-green-700 border-green-200"
                  >
                    New
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-6 left-6 right-6">
        <Card className="p-3 dark:bg-white/5 dark:backdrop-blur-sm dark:border dark:border-white/10 bg-gray-50 border border-gray-200">
          <div className="text-xs dark:text-slate-400 text-gray-500 text-center">
            <div className="font-medium dark:text-white text-gray-900">
              Daily Goal
            </div>
            <div className="mt-1">Watch 30 min to earn 50 OWT</div>
            <div className="w-full dark:bg-slate-700 bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/5"></div>
            </div>
            <div className="mt-1">18/30 min completed</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
