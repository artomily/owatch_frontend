"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  // Redirect to login page since we only use wallet connection now
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            O'Watch
          </h1>
          <p className="text-gray-400">Welcome to O'Watch</p>
        </div>

        {/* Redirect Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl text-center">
          <Wallet2 className="h-16 w-16 text-purple-400 mx-auto mb-6" />

          <h2 className="text-2xl font-bold text-white mb-4">
            Wallet-Only Authentication
          </h2>

          <p className="text-gray-400 mb-6">
            We've simplified the authentication process. Now you only need to
            connect your wallet to get started.
          </p>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
            <p className="text-blue-200 text-sm">
              Redirecting you to the wallet connection page...
            </p>
          </div>

          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-purple-500/25"
          >
            Connect Wallet Now
          </button>
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
