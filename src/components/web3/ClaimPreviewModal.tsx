"use client";

// ClaimPreviewModal — shown BEFORE the user signs the claim, so the web2 → web3 money
// flow is fully transparent. Every value here is real: the OWT amount, the token
// symbol/decimals, the user's current on-chain balance, and whether they've already
// claimed are all read live from the contracts. Nothing is mocked.
import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import {
  X,
  ArrowRight,
  ExternalLink,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Coins,
} from "lucide-react";
import {
  WATCH_REWARD_ADDRESS,
  WATCH_REWARD_ABI,
  WATCH_TOKEN_ADDRESS,
  WATCH_TOKEN_ABI,
  pointsToTokenAmount,
} from "@/lib/contracts";
import {
  NETWORK_LABEL,
  EXPLORER_NAME,
  getExplorerAddressUrl,
  getExplorerTokenUrl,
  shortenHex,
} from "@/lib/explorer";
import { RewardFlow } from "./RewardFlow";

interface ClaimPreviewModalProps {
  reward: number; // OWT (points) to be claimed
  videoTitle: string;
  userAddress: `0x${string}`;
  onConfirm: () => void;
  onClose: () => void;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-brand-ink/55">{label}</span>
      <span className="text-right text-sm font-medium text-brand-ink">
        {children}
      </span>
    </div>
  );
}

function AddressLink({
  address,
  kind = "address",
}: {
  address: string;
  kind?: "address" | "token";
}) {
  const href =
    kind === "token"
      ? getExplorerTokenUrl(address)
      : getExplorerAddressUrl(address);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-brand-green hover:text-brand-green-700"
    >
      {shortenHex(address)}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export function ClaimPreviewModal({
  reward,
  videoTitle,
  userAddress,
  onConfirm,
  onClose,
}: ClaimPreviewModalProps) {
  const rawAmount = useMemo(() => pointsToTokenAmount(reward), [reward]);

  // Live on-chain reads — this is what makes the preview trustworthy.
  // Cast the config to sidestep wagmi's deep type instantiation on mixed-ABI
  // tuples (same pragmatic pattern as writeContract(... as any) elsewhere).
  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: WATCH_TOKEN_ADDRESS,
        abi: WATCH_TOKEN_ABI,
        functionName: "symbol",
      },
      {
        address: WATCH_TOKEN_ADDRESS,
        abi: WATCH_TOKEN_ABI,
        functionName: "decimals",
      },
      {
        address: WATCH_TOKEN_ADDRESS,
        abi: WATCH_TOKEN_ABI,
        functionName: "balanceOf",
        args: [userAddress],
      },
      {
        address: WATCH_REWARD_ADDRESS,
        abi: WATCH_REWARD_ABI,
        functionName: "claimed",
        args: [userAddress],
      },
    ],
  } as any);

  const symbol = (data?.[0]?.result as string) ?? "OWT";
  const decimals = (data?.[1]?.result as number) ?? 18;
  const balanceWei = (data?.[2]?.result as bigint) ?? BigInt(0);
  const alreadyClaimed = (data?.[3]?.result as boolean) ?? false;

  const balanceBefore = Number(formatUnits(balanceWei, decimals));
  const balanceAfter = balanceBefore + reward;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/70 p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-brand-green/15 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-green/12 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10">
              <Coins className="h-5 w-5 text-brand-green" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-brand-ink">
                Review your claim
              </h2>
              <p className="text-xs text-brand-ink/50">
                Confirm what moves on‑chain before you sign
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-brand-ink/40 transition-colors hover:bg-brand-ink/5 hover:text-brand-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {/* Money-flow rail */}
          <RewardFlow activeStep={2} compact className="mb-5" />

          {/* Amount hero */}
          <div className="mb-5 rounded-xl border border-brand-green/15 bg-brand-green/[0.05] p-5 text-center">
            <p className="text-xs font-medium text-brand-ink/50">You will receive</p>
            <p className="font-display text-4xl font-bold tracking-tight text-brand-ink">
              +{reward.toLocaleString()}{" "}
              <span className="text-2xl text-brand-green">{symbol}</span>
            </p>
            <p className="mt-1 font-mono text-[11px] text-brand-ink/40">
              {rawAmount.toString()} base units ({decimals} decimals)
            </p>
          </div>

          {alreadyClaimed && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-xs leading-snug">
                This wallet is already marked as <strong>claimed</strong> in the
                reward contract. The transaction may revert.
              </p>
            </div>
          )}

          {/* Transaction details */}
          <div className="rounded-xl border border-brand-green/12 bg-white px-4 divide-y divide-brand-green/10">
            <Row label="Source video">
              <span className="line-clamp-1 max-w-[14rem] text-brand-ink/80">
                {videoTitle}
              </span>
            </Row>
            <Row label="From (reward contract)">
              <AddressLink address={WATCH_REWARD_ADDRESS} />
            </Row>
            <Row label="To (your wallet)">
              <AddressLink address={userAddress} />
            </Row>
            <Row label="Token">
              <span className="inline-flex items-center gap-1.5">
                {symbol}
                <AddressLink address={WATCH_TOKEN_ADDRESS} kind="token" />
              </span>
            </Row>
            <Row label="Network">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-green" />
                {NETWORK_LABEL}
              </span>
            </Row>
            <Row label="Wallet balance">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-brand-ink/40" />
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-brand-ink/50">
                    {balanceBefore.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-ink/40" />
                  <span className="text-brand-green">
                    {balanceAfter.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {symbol}
                  </span>
                </span>
              )}
            </Row>
            <Row label="Network fee">
              <span className="text-brand-ink/60">
                Paid in ETH · shown in your wallet
              </span>
            </Row>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs text-brand-ink/45">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green/70" />
            <p className="leading-snug">
              You sign this transaction yourself — O'Watch never moves funds without
              your approval. Verify every detail on {EXPLORER_NAME}.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 border-t border-brand-green/12 p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-brand-green/20 px-4 py-3 font-medium text-brand-ink/70 transition-colors hover:bg-brand-ink/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-[1.5] rounded-full bg-brand-green px-4 py-3 font-semibold text-brand-cream transition-colors hover:bg-brand-green-700"
          >
            Confirm &amp; Claim
          </button>
        </div>
      </div>
    </div>
  );
}
