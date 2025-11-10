"use client";

import { useWalletRedirect } from "@/hooks/useWalletRedirect";
import { LandingPage } from "@/components/landing/LandingPage";

export default function HomePage() {
  // Handle wallet redirect logic (authenticated users will be redirected to dashboard)
  useWalletRedirect();

  return <LandingPage />;
}
