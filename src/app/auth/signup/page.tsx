"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "wagmi";
import { createWalletAuthUser } from "@/lib/profileUtils";
import {
  Mail,
  Lock,
  User,
  Wallet2,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletFromUrl = searchParams.get("wallet");
  const { address: connectedWalletAddress } = useAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signupMethod, setSignupMethod] = useState<"email" | "wallet">("email");

  // Detect wallet signup
  useEffect(() => {
    if (walletFromUrl || connectedWalletAddress) {
      setSignupMethod("wallet");
    }
  }, [walletFromUrl, connectedWalletAddress]);

  // Validate password strength
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number";
    return null;
  };

  // Email Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);

    try {
      // Check if username exists
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();

      if (existingUsername) {
        setError("Username already taken");
        setIsLoading(false);
        return;
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Signup failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        total_points: 0,
      });

      if (profileError) {
        setError("Failed to create profile");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setError(null);

      // Redirect after success
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Wallet Signup Handler
  // User connects wallet via MetaMask/RainbowKit, we get their wallet address
  // We generate a temporary email for Supabase auth (wallet is the real auth method)
  const handleWalletSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Get wallet address from connected wallet (NOT generated)
    const walletAddress = walletFromUrl || connectedWalletAddress;
    if (!walletAddress) {
      setError("Please connect a wallet first");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);

    try {
      // Check if username exists
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();

      if (existingUsername) {
        setError("Username already taken");
        setIsLoading(false);
        return;
      }

      // Check if wallet already registered
      const { data: existingWallet } = await supabase
        .from("wallets")
        .select("id")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single();

      if (existingWallet) {
        setError("This wallet is already registered");
        setIsLoading(false);
        return;
      }

      // For wallet signup, we create a guest profile (no email/password)
      // The user will be able to login later with the same wallet

      // Create auth user with wallet
      const profileData = await createWalletAuthUser(walletAddress, username);

      if (!profileData) {
        setError("Failed to create wallet account. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setError(null);

      // Redirect after success
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error("Wallet signup error:", err);
    } finally {
      setIsLoading(false);
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
          <p className="text-gray-400">Create Account & Start Earning</p>
        </div>

        {/* Success State */}
        {success && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 shadow-2xl text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Account Created!
            </h2>
            <p className="text-gray-400 mb-6">
              {signupMethod === "wallet"
                ? "Your wallet account is ready. Redirecting to login..."
                : "Check your email to verify your account."}
            </p>
            <p className="text-sm text-gray-500">Redirecting in a moment...</p>
          </div>
        )}

        {/* Signup Card */}
        {!success && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setSignupMethod("email");
                  setError(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  signupMethod === "email"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                }`}
              >
                <Mail className="inline mr-2 h-4 w-4" />
                Email
              </button>
              <button
                onClick={() => {
                  setSignupMethod("wallet");
                  setError(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  signupMethod === "wallet"
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
            {signupMethod === "email" && (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
                  <p className="text-xs text-gray-500 mt-1">
                    Min 8 chars, uppercase, lowercase & number
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-500/50 disabled:to-pink-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Login Link */}
                <p className="text-center text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            )}

            {/* Wallet Tab */}
            {signupMethod === "wallet" && (
              <form onSubmit={handleWalletSignup} className="space-y-4">
                {/* Wallet Info */}
                <div className="p-4 bg-slate-800/50 border border-orange-500/30 rounded-lg">
                  {walletFromUrl || connectedWalletAddress ? (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Connected Wallet:
                      </p>
                      <p className="text-white font-mono text-sm break-all">
                        {(walletFromUrl || connectedWalletAddress)?.slice(0, 6)}
                        ...
                        {(walletFromUrl || connectedWalletAddress)?.slice(-4)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Please connect your wallet first
                    </p>
                  )}
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-xs">
                    Your wallet will be your primary authentication method. You
                    can add email/password later.
                  </p>
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  disabled={
                    isLoading || (!walletFromUrl && !connectedWalletAddress)
                  }
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-orange-500/50 disabled:to-yellow-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Wallet2 className="h-5 w-5" />
                      Create with Wallet
                    </>
                  )}
                </button>

                {/* Login Link */}
                <p className="text-center text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-gray-500 text-xs">OR</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Alternative Method */}
            {signupMethod === "email" && (
              <button
                type="button"
                onClick={() => setSignupMethod("wallet")}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Wallet2 className="h-5 w-5" />
                Sign up with Wallet
              </button>
            )}
            {signupMethod === "wallet" && (
              <button
                type="button"
                onClick={() => setSignupMethod("email")}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Sign up with Email
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
