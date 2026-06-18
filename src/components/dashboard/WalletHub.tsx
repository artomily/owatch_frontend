"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { gsap } from "gsap";
import {
  Wallet,
  Coins,
  ExternalLink,
  Play,
  ArrowRightLeft,
  Trophy,
  Copy,
  CheckCircle2,
} from "lucide-react";
import {
  getProfileByWallet,
  getTotalPoints,
  getPointHistory,
  getWalletsByProfile,
  type PointHistory,
  type Wallet as WalletRow,
} from "@/lib/queries";
import { WATCH_TOKEN_ADDRESS, WATCH_TOKEN_ABI } from "@/lib/contracts";
import {
  NETWORK_LABEL,
  EXPLORER_NAME,
  getExplorerAddressUrl,
  shortenHex,
} from "@/lib/explorer";
import { RewardFlow } from "@/components/web3/RewardFlow";

const sourceLabel = (s: string) =>
  s === "video_watch"
    ? "Video reward"
    : s === "staking_reward"
    ? "Staking reward"
    : s === "referral"
    ? "Referral bonus"
    : s.replace(/_/g, " ");

const sourceIcon = (s: string) =>
  s === "video_watch" ? Play : s === "staking_reward" ? Coins : s === "referral" ? Trophy : ArrowRightLeft;

export function WalletHub(): JSX.Element {
  const { address, isConnected } = useAccount();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // On-chain OWT balance
  const { data: onchainBalance } = useReadContract({
    address: WATCH_TOKEN_ADDRESS,
    abi: WATCH_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!address) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const id = await getProfileByWallet(address);
      if (!id) {
        if (active) {
          setProfileId(null);
          setLoading(false);
        }
        return;
      }
      const [total, hist, w] = await Promise.all([
        getTotalPoints(id),
        getPointHistory(id),
        getWalletsByProfile(id),
      ]);
      if (!active) return;
      setProfileId(id);
      setTotalPoints(total);
      setHistory(hist || []);
      setWallets(w || []);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [address]);

  useEffect(() => {
    if (loading || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".wallet-anim", {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "all",
      });
    }, rootRef);
    return () => ctx.revert();
  }, [loading]);

  const onchainOwt =
    onchainBalance !== undefined
      ? Number(formatUnits(onchainBalance as bigint, 18))
      : null;

  const copyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="rounded-2xl border border-brand-green/12 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10">
            <Wallet className="h-8 w-8 text-brand-green" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold text-brand-ink">
            Connect Your Wallet
          </h2>
          <p className="text-brand-ink/60">
            Connect to view your balance, rewards, and claim history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink lg:text-4xl">
          Wallet
        </h1>
        <p className="mt-1 text-brand-ink/60">
          Your balance, reward flow, and on‑chain claim history.
        </p>
      </div>

      {/* Balance row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="wallet-anim relative overflow-hidden rounded-2xl border border-brand-green/12 bg-white p-7 shadow-sm lg:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 -translate-y-10 translate-x-10 rounded-full bg-brand-green/5" />
          <p className="mb-2 text-sm font-medium text-brand-ink/50">
            Total OWT Balance
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold tracking-tight text-brand-ink">
              {loading ? "—" : totalPoints.toLocaleString()}
            </span>
            <span className="font-display text-xl text-brand-ink/30">OWT</span>
          </div>
          <p className="mt-3 text-xs text-brand-ink/45">
            On‑chain wallet balance:{" "}
            <span className="font-medium text-brand-green">
              {onchainOwt === null
                ? "…"
                : onchainOwt.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
              OWT
            </span>{" "}
            · {NETWORK_LABEL}
          </p>
        </div>

        <div className="wallet-anim flex flex-col justify-center gap-3 rounded-2xl border border-brand-green/12 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10">
              <Trophy className="h-5 w-5 text-brand-green" />
            </span>
            <div>
              <p className="text-xs text-brand-ink/50">Lifetime rewards</p>
              <p className="font-display text-xl font-semibold text-brand-ink">
                {history.length} claims
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10">
              <Play className="h-5 w-5 text-brand-green" />
            </span>
            <div>
              <p className="text-xs text-brand-ink/50">Video rewards</p>
              <p className="font-display text-xl font-semibold text-brand-ink">
                {history.filter((h) => h.source === "video_watch").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency — how rewards flow web2 -> web3 */}
      <div className="wallet-anim rounded-2xl border border-brand-green/12 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          How your rewards flow
        </h2>
        <RewardFlow />
      </div>

      {/* Connected wallets */}
      <div className="wallet-anim rounded-2xl border border-brand-green/12 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Connected wallets
        </h2>
        {wallets.length === 0 ? (
          <p className="text-sm text-brand-ink/50">
            {address ? shortenHex(address) : "No wallets linked yet."}
          </p>
        ) : (
          <ul className="space-y-2">
            {wallets.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-lg border border-brand-green/12 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-brand-green" />
                  <span className="font-mono text-sm text-brand-ink">
                    {shortenHex(w.wallet_address)}
                  </span>
                  {w.is_primary && (
                    <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-medium text-brand-green">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyAddress(w.wallet_address)}
                    className="text-brand-ink/40 transition-colors hover:text-brand-ink"
                    aria-label="Copy address"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-brand-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={getExplorerAddressUrl(w.wallet_address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-ink/40 transition-colors hover:text-brand-green"
                    aria-label={`View on ${EXPLORER_NAME}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Claim history */}
      <div className="wallet-anim rounded-2xl border border-brand-green/12 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Reward history
        </h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-brand-ink/50">
            Loading history…
          </p>
        ) : history.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-ink/50">
            No rewards yet — watch a video to earn your first OWT.
          </p>
        ) : (
          <ul className="divide-y divide-brand-green/10">
            {history.map((tx) => {
              const Icon = sourceIcon(tx.source);
              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10">
                      <Icon className="h-4 w-4 text-brand-green" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-brand-ink">
                        {sourceLabel(tx.source)}
                      </p>
                      <p className="text-xs text-brand-ink/40">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.amount >= 0 ? "text-brand-green" : "text-destructive"
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount} OWT
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
