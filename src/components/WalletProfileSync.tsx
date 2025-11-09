"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ensureProfileExists } from "@/lib/profileUtils";
import { supabase } from "@/lib/supabaseClient";

/**
 * Component to sync wallet address with Supabase profile
 * Automatically creates profile when wallet is connected (AUTO-REGISTER)
 * Or retrieves existing profile (AUTO-LOGIN)
 */
export function WalletProfileSync() {
  const { address, isConnected } = useAccount();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const syncProfile = async () => {
      if (isConnected && address && !hasChecked) {
        try {
          // Check if wallet already exists (to determine register vs login)
          const { data: existingWallet } = await supabase
            .from("wallets")
            .select("profile_id")
            .eq("wallet_address", address.toLowerCase())
            .single();

          const isNewUser = !existingWallet;

          // Auto-create or get existing profile
          const profileId = await ensureProfileExists(address);

          if (profileId) {
            // Store profile ID in localStorage for quick access
            localStorage.setItem(`owatch_profile_id_${address}`, profileId);

            if (isNewUser) {
              console.log("🎉 NEW USER REGISTERED!");
              console.log("   Wallet:", address);
              console.log("   Profile ID:", profileId);
              console.log(
                "   Welcome to O'Watch! Your profile has been created."
              );
            } else {
              console.log("👋 WELCOME BACK!");
              console.log("   Wallet:", address);
              console.log("   Profile ID:", profileId);
              console.log("   Logged in successfully.");
            }

            setHasChecked(true);
          } else {
            console.error("❌ Failed to sync profile for wallet:", address);
          }
        } catch (error) {
          console.error("Error syncing wallet profile:", error);
        }
      }
    };

    syncProfile();
  }, [address, isConnected, hasChecked]);

  // Reset check when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setHasChecked(false);
    }
  }, [isConnected]);

  // This component doesn't render anything
  return null;
}
