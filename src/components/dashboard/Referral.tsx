"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { gsap } from "gsap";
import {
  Gift,
  Copy,
  CheckCircle2,
  Users,
  Coins,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { getProfileByWallet, getProfile } from "@/lib/queries";

// Samono referral mechanic: referrers earn a 10% bonus on referee earnings.
const REFERRAL_BONUS_PCT = 10;

export function Referral(): JSX.Element {
  const { address, isConnected } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!address) return;
      const id = await getProfileByWallet(address);
      if (!id) return;
      const profile = await getProfile(id);
      if (active && profile) setUsername(profile.username);
    };
    load();
    return () => {
      active = false;
    };
  }, [address]);

  // Referral code derived from the wallet — stable and shareable.
  // TODO: backend referral attribution (persist code + track referees server-side).
  const code = useMemo(() => {
    if (username) return username.toUpperCase();
    if (address) return `OW${address.slice(2, 8).toUpperCase()}`;
    return "";
  }, [username, address]);

  const link = useMemo(() => {
    if (!code) return "";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://owatch.id";
    return `${origin}/?ref=${code}`;
  }, [code]);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".ref-anim", {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "all",
      });
    }, rootRef);
    return () => ctx.revert();
  }, [code]);

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // Basic/mock attribution stats until backend tracking exists.
  const stats = [
    { label: "Referrals", value: 0, icon: Users },
    { label: "Bonus earned", value: "0 OWT", icon: Coins },
    { label: "Bonus rate", value: `${REFERRAL_BONUS_PCT}%`, icon: Gift },
  ];

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="rounded-2xl border border-brand-green/12 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10">
            <Gift className="h-8 w-8 text-brand-green" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold text-brand-ink">
            Connect Your Wallet
          </h2>
          <p className="text-brand-ink/60">
            Connect to get your referral link and start earning bonuses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10">
          <Gift className="h-6 w-6 text-brand-green" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink lg:text-4xl">
            Referral
          </h1>
          <p className="text-brand-ink/60">
            Invite friends — earn {REFERRAL_BONUS_PCT}% of what they earn.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="ref-anim grid grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-brand-green/12 bg-white p-4 text-center shadow-sm"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-brand-green" />
              <p className="font-display text-xl font-bold text-brand-ink">
                {s.value}
              </p>
              <p className="text-xs text-brand-ink/50">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Referral link */}
      <div className="ref-anim rounded-2xl border border-brand-green/12 bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-display text-base font-semibold text-brand-ink">
          Your referral link
        </h2>
        <p className="mb-4 text-sm text-brand-ink/55">
          Share this link. When someone joins and earns, you get a bonus.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center rounded-full border border-brand-green/15 bg-brand-cream px-4 py-3">
            <Share2 className="mr-2 h-4 w-4 flex-shrink-0 text-brand-ink/40" />
            <span className="truncate font-mono text-sm text-brand-ink">
              {link || "…"}
            </span>
          </div>
          <button
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 font-semibold text-brand-cream transition-colors hover:bg-brand-green-700"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy link
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-green/[0.06] px-4 py-2.5">
          <span className="text-xs text-brand-ink/55">Referral code</span>
          <span className="font-mono text-sm font-semibold text-brand-green">
            {code || "…"}
          </span>
        </div>
      </div>

      {/* How it works */}
      <div className="ref-anim rounded-2xl border border-brand-green/12 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          How referrals work
        </h2>
        <ol className="space-y-3">
          {[
            "Share your link with friends.",
            "They connect a wallet and start watching to earn.",
            `You automatically earn a ${REFERRAL_BONUS_PCT}% bonus on their rewards.`,
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-xs font-semibold text-brand-green">
                {i + 1}
              </span>
              <span className="text-sm text-brand-ink/70">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-start gap-2 border-t border-brand-green/12 pt-4 text-xs text-brand-ink/45">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green/70" />
          <p className="leading-snug">
            Referral rewards are anti‑abuse validated — only genuine, validated
            watch sessions count toward bonuses.
          </p>
        </div>
      </div>
    </div>
  );
}
