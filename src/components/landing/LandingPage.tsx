"use client";

import { useWalletRedirect } from "@/hooks/useWalletRedirect";
import { useAccount, useConnect } from "wagmi";
import {
  Play,
  DollarSign,
  TrendingUp,
  Zap,
  Wallet,
  ArrowRight,
  CheckCircle,
  Check,
  Star,
} from "lucide-react";
import { LandingNavbar } from "./LandingNavbar";
import { RewardFlow } from "@/components/web3/RewardFlow";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ensureProfileExists } from "@/lib/profileUtils";
import { saveUserData } from "@/lib/walletStorage";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Wallet CTA button ────────────────────────────────────────────────────────

function WalletConnectButton({
  variant = "dark",
  size = "md",
}: {
  variant?: "dark" | "light" | "outline";
  size?: "md" | "lg";
}): JSX.Element {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function setup() {
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
    setup();
    return () => { mounted = false; };
  }, [isConnected, address]);

  const handleConnect = async () => {
    setIsLoading(true);
    try { if (connectors[0]) connect({ connector: connectors[0] }); }
    catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const pad = size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm";
  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-60 ${pad}`;
  const cls =
    variant === "light"   ? `${base} bg-white text-violet-700 hover:bg-violet-50`
    : variant === "outline" ? `${base} border border-gray-300 text-gray-700 hover:bg-gray-50`
    :                         `${base} bg-gray-900 text-white hover:bg-gray-700`;

  if (isConnected && address) {
    return (
      <button onClick={() => router.push("/dashboard/videos")} disabled={isCreatingProfile} className={cls}>
        {isCreatingProfile ? "Setting up…" : "Go to Dashboard"}
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }
  return (
    <button onClick={handleConnect} disabled={isLoading} className={cls}>
      <Wallet className="h-4 w-4" />
      {isLoading ? "Connecting…" : "Connect Wallet & Start"}
    </button>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const stats = [
  { label: "Active viewers", value: "50K+" },
  { label: "OWT distributed", value: "2.5M" },
  { label: "Hours watched", value: "1M+" },
  { label: "Creators onboard", value: "500+" },
];

const techLogos = ["Base", "Ethereum", "wagmi", "RainbowKit", "Supabase", "viem"];

const workflow = [
  { num: "01", icon: Wallet, title: "Connect Wallet", desc: "Link your wallet on Base Sepolia. One click — your wallet is your account." },
  { num: "02", icon: Play, title: "Watch Content", desc: "Stream videos across crypto, tech, gaming and more. Every second counts." },
  { num: "03", icon: DollarSign, title: "Earn & Withdraw", desc: "Claim OWT as you finish watching. Withdraw to your wallet anytime, instantly." },
];

const explorerFeatures = ["0.5 OWT per video", "Basic analytics dashboard", "Up to 10 videos per day", "On-chain reward history"];
const proFeatures = ["1.5 OWT per video", "Advanced earnings analytics", "Unlimited daily videos", "Staking bonus multipliers", "Priority claim processing", "Early access to features"];

// ── Main component ───────────────────────────────────────────────────────────

export function LandingPage(): JSX.Element {
  useWalletRedirect();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance — stagger up on load
      gsap.from(".hero-eyebrow, .hero-h1, .hero-sub, .hero-cta, .hero-mockup", {
        y: 40, opacity: 0, duration: 0.9, stagger: 0.13, ease: "power3.out", clearProps: "opacity,transform",
      });

      // Feature cards — stagger on scroll
      gsap.from(".feature-big-card", {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: "#features", start: "top 78%", once: true },
      });

      // Workflow cards — alternating x
      [".wf-0", ".wf-1", ".wf-2"].forEach((cls, i) => {
        gsap.from(cls, {
          x: i % 2 === 0 ? -50 : 50, opacity: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: cls, start: "top 84%", once: true },
        });
      });

      // Stats count-up
      document.querySelectorAll<HTMLElement>(".stat-num").forEach((el) => {
        const raw = el.getAttribute("data-val") ?? "0";
        const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
        const suffix = raw.replace(/[0-9.]/g, "");
        const obj = { val: 0 };
        gsap.to(obj, {
          val: num, duration: 2.2, ease: "power1.out",
          onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString() + suffix; },
          scrollTrigger: { trigger: ".stats-band", start: "top 76%", once: true },
        });
      });

      // Pricing cards
      gsap.from(".pricing-card", {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.18, ease: "power2.out",
        scrollTrigger: { trigger: "#pricing", start: "top 80%", once: true },
      });

      // CTA scale
      gsap.from(".cta-inner", {
        scale: 0.96, opacity: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: ".cta-inner", start: "top 86%", once: true },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-gray-900 antialiased">
      <LandingNavbar />

      {/* ══════════════════════════════════════════════════════════════════
          HERO  —  Full-section gradient background
          ══════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative overflow-hidden pb-0 pt-28"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% -5%, #dde4ff 0%, #ede8ff 28%, #faf9ff 55%, #ffffff 75%)",
        }}
      >
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          {/* Eyebrow */}
          <div className="hero-eyebrow mb-7 inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/80 px-5 py-2 text-sm font-semibold text-violet-700 shadow-sm backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            Watch-to-Earn · Powered by Base Blockchain
          </div>

          {/* Headline */}
          <h1 className="hero-h1 mb-6 font-display font-bold tracking-tight text-gray-900" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", lineHeight: 1.06 }}>
            Earn crypto rewards
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              while you watch content
            </span>
          </h1>

          {/* Sub */}
          <p className="hero-sub mx-auto mb-10 max-w-lg text-lg leading-relaxed text-gray-500">
            O&apos;Watch rewards every minute you watch. Stream content, earn OWT
            tokens in real time, and own your attention — fully on-chain.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col items-center justify-center gap-3 sm:flex-row">
            <WalletConnectButton size="lg" />
            <a
              href="https://owatch-1.gitbook.io/owatch-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-8 py-4 text-base font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Read the Docs <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Large product mockup */}
        <div className="hero-mockup mx-auto mt-14 max-w-6xl px-4 lg:px-6">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-x-20 bottom-0 h-32 rounded-full bg-violet-400/25 blur-3xl" />
            {/* Frame */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_30px_80px_-10px_rgba(0,0,0,0.18)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="mx-4 h-5 flex-1 rounded-md bg-gray-200" />
              </div>
              <img
                src={img("owatch-app-dashboard", 1440, 780)}
                alt="O'Watch Dashboard"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TECH LOGOS
          ══════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="mb-9 text-center text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
            Powered by leading Web3 infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {techLogos.map((name) => (
              <span key={name} className="text-[15px] font-bold tracking-wide text-gray-300">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FEATURES  —  dark, 2 large cards with screenshots
          ══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-[#0a0a0f] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Section heading */}
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
              Features
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight text-white lg:text-5xl">
              The smarter way to earn
              <br />on-chain
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Every video you finish triggers an on-chain reward — no middlemen,
              no friction, no waiting.
            </p>
          </div>

          {/* 2 large feature cards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Card 1 */}
            <div className="feature-big-card group overflow-hidden rounded-2xl border border-white/8 bg-white/5 p-8 transition hover:bg-white/8 lg:p-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-400">
                Watch &amp; Earn
              </p>
              <h3 className="mb-4 font-display text-2xl font-bold leading-snug text-white">
                Stream content.
                <br />
                Get paid instantly.
              </h3>
              <p className="mb-8 text-gray-400">
                Watch any video to 80% completion and your OWT reward is verified
                and claimable on Base. No delays, no manual steps.
              </p>
              <div className="overflow-hidden rounded-xl border border-white/8">
                <img
                  src={img("owatch-feature-player", 640, 380)}
                  alt=""
                  className="w-full object-cover opacity-80 transition group-hover:opacity-100"
                />
              </div>
            </div>

            {/* Card 2 */}
            <div className="feature-big-card group overflow-hidden rounded-2xl border border-white/8 bg-white/5 p-8 transition hover:bg-white/8 lg:p-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-400">
                Smart Rewards
              </p>
              <h3 className="mb-4 font-display text-2xl font-bold leading-snug text-white">
                Real earnings.
                <br />
                Zero friction.
              </h3>
              <p className="mb-8 text-gray-400">
                Track your OWT balance, claim history and streak multipliers from
                a clean analytics dashboard — all verifiable on-chain.
              </p>
              <div className="overflow-hidden rounded-xl border border-white/8">
                <img
                  src={img("owatch-feature-wallet", 640, 380)}
                  alt=""
                  className="w-full object-cover opacity-80 transition group-hover:opacity-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          WORKFLOW  —  light, 3 cards
          ══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-violet-600">
              How it works
            </p>
            <h2 className="font-display text-4xl font-bold text-gray-900 lg:text-5xl">
              Your complete earn workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {workflow.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className={`wf-${i} rounded-2xl border border-gray-100 bg-gray-50 p-8`}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 font-display text-xl font-bold text-white shadow-lg shadow-violet-500/30">
                    {s.num}
                  </div>
                  <Icon className="mb-4 h-6 w-6 text-violet-600" />
                  <h3 className="mb-3 font-display text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Reward lifecycle — transparent web2 -> web3 money flow */}
          <div className="mx-auto mt-14 max-w-4xl rounded-2xl border border-violet-100 bg-violet-50/40 p-8">
            <div className="mb-6 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-600">
                Transparent by design
              </p>
              <h3 className="font-display text-2xl font-bold text-gray-900">
                From watch time to on-chain rewards
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
                Most platforms capture your attention and give nothing back. O&apos;Watch
                makes every step auditable — you can see exactly how value moves from
                web2 engagement to web3 settlement.
              </p>
            </div>
            <RewardFlow />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          STATS  —  violet band
          ══════════════════════════════════════════════════════════════════ */}
      <section className="stats-band bg-violet-600 py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="stat-num font-display text-5xl font-bold text-white" data-val={s.value}>
                  {s.value}
                </div>
                <div className="mt-2 text-sm font-medium text-violet-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PRICING / EARN TIERS
          ══════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-violet-600">
              Earn Tiers
            </p>
            <h2 className="font-display text-4xl font-bold text-gray-900 lg:text-5xl">
              Full platform. Any scale.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-gray-500">
              Start earning for free. Unlock higher rewards as the platform grows.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
            {/* Explorer — free */}
            <div className="pricing-card rounded-2xl border border-gray-200 p-8">
              <p className="mb-1 text-sm font-semibold text-gray-500">Explorer</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-gray-900">Free</span>
              </div>
              <p className="mb-8 text-gray-500">Perfect for getting started — no commitment required.</p>
              <WalletConnectButton variant="outline" />
              <ul className="mt-8 space-y-3">
                {explorerFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-violet-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro — highlighted */}
            <div className="pricing-card relative overflow-hidden rounded-2xl bg-violet-600 p-8 text-white shadow-xl shadow-violet-500/25">
              {/* Badge */}
              <div className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                <Star className="h-3 w-3 fill-white" />
                Coming Soon
              </div>
              <p className="mb-1 text-sm font-semibold text-violet-200">Pro</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold">3×</span>
                <span className="text-lg font-semibold text-violet-200">OWT Rate</span>
              </div>
              <p className="mb-8 text-violet-100">Triple your earnings with multipliers, staking, and priority processing.</p>
              <button className="w-full rounded-xl bg-white py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50">
                Join Waitlist
              </button>
              <ul className="mt-8 space-y-3">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-violet-100">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="cta-inner overflow-hidden rounded-3xl bg-[#0a0a0f] px-10 py-20 text-center md:px-20">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
              Get started today
            </p>
            <h2 className="mb-5 font-display text-4xl font-bold text-white lg:text-5xl">
              Content that works harder
              <br />
              for your wallet
            </h2>
            <p className="mx-auto mb-10 max-w-md text-lg text-gray-400">
              Join thousands already earning OWT — no subscription, no fees, instant payouts.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <WalletConnectButton variant="light" size="lg" />
              <a
                href="https://owatch-1.gitbook.io/owatch-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-gray-300 transition hover:border-white/40 hover:text-white"
              >
                Read Docs <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
                  <Play className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="font-display text-xl font-bold text-gray-900">O&apos;Watch</span>
              </div>
              <p className="max-w-xs text-sm text-gray-500">
                Watch-to-earn, built on Base. Turn your attention into real on-chain ownership.
              </p>
              {/* Social icons */}
              <div className="mt-6 flex gap-4">
                {["Twitter / X", "Discord", "Telegram"].map((s) => (
                  <a key={s} href="#" className="text-xs font-semibold text-gray-400 transition hover:text-gray-700">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { title: "Product", links: ["Features", "How It Works", "Earn Tiers"] },
              { title: "Resources", links: ["Documentation", "Support", "FAQ"] },
              { title: "Legal", links: ["Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-bold text-gray-800">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href={link === "Documentation" ? "https://owatch-1.gitbook.io/owatch-docs" : "#"}
                        className="text-sm text-gray-500 transition hover:text-gray-800"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-gray-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} O&apos;Watch.ID — Built on Base.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-gray-400 hover:text-gray-700">Privacy</a>
              <a href="#" className="text-xs text-gray-400 hover:text-gray-700">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
