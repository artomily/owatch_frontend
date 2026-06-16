"use client";

import { useWalletRedirect } from "@/hooks/useWalletRedirect";
import { useAccount, useConnect } from "wagmi";
import {
  Play,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LandingNavbar } from "./LandingNavbar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ensureProfileExists } from "@/lib/profileUtils";
import { saveUserData } from "@/lib/walletStorage";

function WalletConnectButton({ light = false }: { light?: boolean }): JSX.Element {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function setupProfile() {
      if (isConnected && address) {
        setIsCreatingProfile(true);
        try {
          const profileId = await ensureProfileExists(address);
          if (mounted) {
            saveUserData({ walletAddress: address, profileId, totalPoints: 0, lastSync: new Date().toISOString() });
            setIsCreatingProfile(false);
          }
        } catch {
          if (mounted) setIsCreatingProfile(false);
        }
      } else {
        setIsCreatingProfile(false);
      }
    }
    setupProfile();
    return () => { mounted = false; };
  }, [isConnected, address]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const connector = connectors[0];
      if (connector) connect({ connector });
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const base = light
    ? "inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-70"
    : "inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-gray-700 disabled:opacity-70";

  if (isConnected && address) {
    return (
      <button onClick={() => router.push("/dashboard/videos")} disabled={isCreatingProfile} className={base}>
        {isCreatingProfile ? "Setting up..." : "Go to Dashboard"}
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button onClick={handleConnect} disabled={isLoading} className={base}>
      <Wallet className="h-4 w-4" />
      {isLoading ? "Connecting..." : "Connect Wallet & Start"}
    </button>
  );
}

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const features = [
  {
    icon: Eye,
    title: "Watch to Earn",
    description: "Earn OWT tokens by watching engaging video content across every category.",
  },
  {
    icon: DollarSign,
    title: "Real Rewards",
    description: "Convert viewing time into real on-chain rewards you can withdraw anytime.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor earnings, watch time and streaks through a clean analytics dashboard.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Join thousands of viewers earning together while discovering new content.",
  },
  {
    icon: Shield,
    title: "Secure on Base",
    description: "Built on Base with transparent, verifiable reward settlement on-chain.",
  },
  {
    icon: Zap,
    title: "Instant Rewards",
    description: "Claim tokens the moment you finish a video — straight to your wallet.",
  },
];

const stats = [
  { label: "Active viewers", value: "50K+" },
  { label: "OWT distributed", value: "2.5M" },
  { label: "Hours watched", value: "1M+" },
  { label: "Creators onboard", value: "500+" },
];

export function LandingPage(): JSX.Element {
  useWalletRedirect();

  return (
    <div className="min-h-screen bg-white text-brand-ink antialiased">
      <LandingNavbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative overflow-hidden pt-28 pb-0">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-100 via-purple-50 to-transparent opacity-70 blur-3xl" />
          <div className="absolute top-60 right-0 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          {/* Eyebrow */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
            <Zap className="h-3.5 w-3.5" />
            Watch-to-Earn on Base Blockchain
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-5xl font-bold leading-[1.08] tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Earn crypto while
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
              you watch content
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-gray-500">
            O&apos;Watch rewards you for every video you watch. Stream content,
            earn OWT tokens in real time, and own your attention — secured on Base.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <WalletConnectButton />
            <a
              href="https://owatch-1.gitbook.io/owatch-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-7 py-3.5 text-base font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Read the Docs
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mx-auto mt-16 max-w-5xl px-6 lg:px-8">
          <div className="relative">
            {/* Glow under frame */}
            <div className="absolute inset-x-10 -bottom-6 h-24 rounded-full bg-violet-400/20 blur-2xl" />
            {/* Browser frame */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-2xl">
              <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="ml-4 h-4 flex-1 rounded-md bg-gray-200" />
              </div>
              <div className="overflow-hidden rounded-lg">
                <img
                  src={img("owatch-dashboard-mockup", 1200, 650)}
                  alt="O'Watch Dashboard"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNER / TECH STRIP ────────────────────────────────────────── */}
      <section className="border-y border-gray-100 py-14">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Powered by leading Web3 infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {["Base", "Ethereum", "wagmi", "RainbowKit", "Supabase", "viem"].map((name) => (
              <span key={name} className="text-base font-bold tracking-wide text-gray-300">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — dark section ──────────────────────────────────────── */}
      <section id="features" className="bg-gray-950 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-14">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
              Features
            </p>
            <h2 className="mb-4 font-display text-3xl font-bold leading-tight text-white lg:text-4xl">
              The smarter way to earn
              <br />
              while watching
            </h2>
            <p className="max-w-lg text-gray-400">
              Built for viewers who want more from their screen time. Every video
              watched is a reward earned — transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-7 transition hover:border-violet-800/60 hover:bg-gray-900/80"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/20">
                    <Icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — light section ────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              How it works
            </p>
            <h2 className="font-display text-3xl font-bold text-gray-900 lg:text-4xl">
              Your complete earn workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                icon: Wallet,
                title: "Connect Wallet",
                desc: "Link your wallet on Base Sepolia to securely receive OWT rewards on-chain.",
              },
              {
                num: "02",
                icon: Play,
                title: "Watch Content",
                desc: "Browse and stream videos across crypto, tech, gaming and more.",
              },
              {
                num: "03",
                icon: DollarSign,
                title: "Earn Rewards",
                desc: "Claim OWT automatically as you finish watching, then withdraw anytime.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-8"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-lg font-bold text-white">
                    {s.num}
                  </div>
                  <Icon className="mb-4 h-6 w-6 text-violet-600" />
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS — violet band ──────────────────────────────────────────── */}
      <section className="bg-violet-600 py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-violet-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ─────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gray-950">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr]">
              <div className="hidden lg:block">
                <img
                  src={img("owatch-testimonial", 600, 500)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-10 lg:p-14">
                <div className="mb-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-5 rounded-full bg-violet-500" />
                  ))}
                </div>
                <p className="font-display text-2xl font-medium leading-snug text-white lg:text-3xl">
                  &ldquo;O&apos;Watch turned hours I&apos;d spend scrolling
                  anyway into real, withdrawable rewards. The cleanest
                  watch-to-earn experience I&apos;ve used.&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-700">
                    <img src={img("avatar-james", 80, 80)} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">James W.</p>
                    <p className="text-sm text-gray-400">Early Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP AVAILABILITY ─────────────────────────────────────────────── */}
      <section className="py-10 pb-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-gray-100 bg-gray-50 px-8 py-16 text-center">
            <span className="rounded-full bg-violet-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-violet-700">
              Mobile coming soon
            </span>
            <h2 className="font-display text-3xl font-bold text-gray-900">
              Earn on the go
            </h2>
            <p className="max-w-md text-gray-500">
              Get O&apos;Watch on your phone and keep earning OWT wherever you watch.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-gray-900 px-6 py-3 text-left text-white transition hover:bg-gray-700"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span>
                  <span className="block text-[10px] opacity-60">GET IT ON</span>
                  <span className="block text-sm font-semibold">Google Play</span>
                </span>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-gray-900 px-6 py-3 text-left text-white transition hover:bg-gray-700"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <span>
                  <span className="block text-[10px] opacity-60">Download on the</span>
                  <span className="block text-sm font-semibold">App Store</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-16 text-center">
          <div className="mb-6 flex justify-center gap-6 text-sm text-violet-200">
            {["No subscription", "Instant payouts", "Open source"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {t}
              </div>
            ))}
          </div>
          <h2 className="mb-4 font-display text-4xl font-bold text-white">
            Ready to start earning?
          </h2>
          <p className="mx-auto mb-10 max-w-md text-violet-100">
            Join thousands already earning OWT by watching the content they love.
          </p>
          <WalletConnectButton light />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <Play className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="font-display text-lg font-bold text-white">
                  O&apos;Watch
                </span>
              </div>
              <p className="max-w-xs text-sm text-gray-500">
                Watch-to-earn, built on Base. Turn attention into ownership.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "How It Works", "Dashboard"] },
              { title: "Resources", links: ["Documentation", "Support", "FAQ"] },
              { title: "Legal", links: ["Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold text-gray-300">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href={
                          link === "Documentation"
                            ? "https://owatch-1.gitbook.io/owatch-docs"
                            : "#"
                        }
                        className="text-sm text-gray-500 transition hover:text-gray-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 border-t border-gray-800 pt-8 text-sm text-gray-600">
            &copy; {new Date().getFullYear()} O&apos;Watch.ID. All rights reserved.
            Built on Base for the future of entertainment.
          </div>
        </div>
      </footer>
    </div>
  );
}
