"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { isUserAuthenticated, clearUserData } from "@/lib/walletStorage";

export function useWalletRedirect() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated based on localStorage and current wallet
    const authenticated = isConnected && isUserAuthenticated(address);
    setIsAuthenticated(authenticated);

    // If authenticated and on landing/auth pages, redirect to dashboard
    if (authenticated && (pathname === "/" || pathname.startsWith("/auth"))) {
      router.push("/dashboard/videos");
    }

    // If not authenticated and trying to access dashboard, redirect to home
    if (!authenticated && pathname.startsWith("/dashboard")) {
      // Clear any stale data
      clearUserData();
      router.push("/");
    }

    // If wallet is disconnected but we have saved address, clear localStorage
    if (!isConnected) {
      clearUserData();
      if (pathname.startsWith("/dashboard")) {
        router.push("/");
      }
    }
  }, [isConnected, address, pathname, router]);

  return { isConnected, isAuthenticated };
}
