"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAccount, useConnect } from "wagmi";
import { ensureProfileExists } from "@/lib/profileUtils";
import {
  saveUserData,
  isUserAuthenticated,
  UserData,
} from "@/lib/walletStorage";
import { Wallet2, Loader2, AlertCircle } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function LoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle wallet connection and login
  useEffect(() => {
    if (isConnected && address) {
      handleWalletAuth();
    }
  }, [isConnected, address]);

  const handleWalletAuth = async () => {
    if (!isConnected || !address) return;

    setError(null);
    setIsLoading(true);

    try {
      // Ensure profile exists in Supabase
      const profileId = await ensureProfileExists(address);

      if (profileId) {
        // Save user data to localStorage
        const userData: UserData = {
          walletAddress: address.toLowerCase(),
          profileId,
          totalPoints: 0,
          lastSync: new Date().toISOString(),
        };
        saveUserData(userData);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError("Failed to create or access profile. Please try again.");
      }
    } catch (err) {
      setError("Wallet authentication failed. Please try again.");
      console.error("Wallet auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user already has wallet data in localStorage
  useEffect(() => {
    if (isConnected && address && isUserAuthenticated(address)) {
      router.push("/dashboard");
    }
  }, [isConnected, address, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            O'Watch
          </h1>
          <p className="text-gray-400">Watch and Earn Rewards</p>
        </div>

        {/* Wallet Connect Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              <p className="text-blue-200 text-sm">Authenticating wallet...</p>
            </div>
          )}

          {/* Wallet Connection Section */}
          <div className="space-y-6">
            <div className="text-center">
              <Wallet2 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400 text-sm">
                Connect your Web3 wallet to access O'Watch and start earning
                rewards
              </p>
            </div>

            {/* Connect Button */}
            <div className="flex justify-center">
              <ConnectButton label="Connect Wallet" showBalance={false} />
            </div>

            {/* Connected Status */}
            {isConnected && address && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 font-medium">
                    Wallet Connected
                  </span>
                </div>
                <p className="text-center text-gray-400 text-sm font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
            )}

            {/* Info Section */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-white font-medium mb-2">How it works:</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>
                  • Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
                </li>
                <li>• Your wallet address is saved securely</li>
                <li>• Watch videos and earn OWATCH tokens</li>
                <li>• No passwords or emails required</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By connecting your wallet, you agree to our{" "}
          <a href="/terms" className="text-purple-400 hover:text-purple-300">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
