"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "wagmi";
import {
  Mail,
  Lock,
  Wallet2,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"email" | "wallet">("email");

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // First, get user by email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (userError || !userData) {
        setError("Email or password incorrect");
        setIsLoading(false);
        return;
      }

      // Then sign in with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (signInError) {
        setError("Email or password incorrect");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Wallet Login
  const handleWalletLogin = async () => {
    if (!isConnected || !address) {
      setError("Please connect a wallet first");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Find or create user by wallet address
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("wallet_address", address.toLowerCase())
        .single();

      if (existingProfile) {
        // User exists with wallet, sign in with their email
        if (!existingProfile.email) {
          setError(
            "Wallet user found but email is missing. Please contact support."
          );
          setIsLoading(false);
          return;
        }

        // For wallet users, we need to handle auth differently
        // For now, just redirect to dashboard since wallet is verified
        router.push("/dashboard");
      } else {
        // New wallet user - redirect to signup with wallet
        router.push(`/auth/signup?wallet=${address}`);
      }
    } catch (err) {
      setError("Wallet login failed. Please try again.");
      console.error("Wallet login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check and auto-redirect if already logged in - call on mount
  useEffect(() => {
    handleCheckSession();
  }, []);

  const handleCheckSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      router.push("/dashboard");
    }
  };

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

        {/* Auth Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTab("email");
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "email"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-slate-800 text-gray-400 hover:bg-slate-700"
              }`}
            >
              <Mail className="inline mr-2 h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => {
                setActiveTab("wallet");
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "wallet"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-slate-800 text-gray-400 hover:bg-slate-700"
              }`}
            >
              <Wallet2 className="inline mr-2 h-4 w-4" />
              Wallet
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-500/50 disabled:to-pink-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              {/* Signup Link */}
              <p className="text-center text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </form>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                {isConnected
                  ? "Connected wallet will be used to access your account."
                  : "Connect your Web3 wallet to login."}
              </p>

              <button
                onClick={handleWalletLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-orange-500/50 disabled:to-yellow-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isConnected ? "Logging in..." : "Connecting..."}
                  </>
                ) : (
                  <>
                    <Wallet2 className="h-5 w-5" />
                    {isConnected
                      ? `Login with ${address?.slice(0, 6)}...${address?.slice(
                          -4
                        )}`
                      : "Connect Wallet"}
                  </>
                )}
              </button>

              {isConnected && (
                <p className="text-center text-gray-400 text-xs">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-700"></div>
                <span className="text-gray-500 text-xs">OR</span>
                <div className="flex-1 h-px bg-slate-700"></div>
              </div>

              {/* Back to Email */}
              <button
                onClick={() => setActiveTab("email")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold py-3 rounded-lg transition-all"
              >
                Use Email Instead
              </button>

              {/* New Wallet User */}
              <p className="text-center text-gray-400 text-sm">
                New to O'Watch?{" "}
                {isConnected && (
                  <Link
                    href={`/auth/signup?wallet=${address}`}
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Sign up with wallet
                  </Link>
                )}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-gray-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Alternative Auth Method */}
          {activeTab === "email" && (
            <button
              onClick={() => setActiveTab("wallet")}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Wallet2 className="h-5 w-5" />
              Continue with Wallet
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By logging in, you agree to our{" "}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
