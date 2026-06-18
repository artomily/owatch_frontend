"use client";

// RewardFlow — the single, reusable explanation of how value moves from web2 → web3
// in O'Watch. Rendered in the claim preview modal, the Wallet hub, and the landing page
// so users always see the same transparent "money flow" story.
import { Eye, ShieldCheck, PenLine, Coins } from "lucide-react";
import { NETWORK_LABEL } from "@/lib/explorer";

type StepState = "done" | "active" | "pending";

interface FlowStep {
  icon: typeof Eye;
  title: string;
  side: "web2" | "web3";
  desc: string;
}

const STEPS: FlowStep[] = [
  {
    icon: Eye,
    title: "Watch",
    side: "web2",
    desc: "You watch curated videos. Progress is tracked off‑chain.",
  },
  {
    icon: ShieldCheck,
    title: "Validate",
    side: "web2",
    desc: "Session integrity is checked (watch %, speed, daily caps) before points lock in.",
  },
  {
    icon: PenLine,
    title: "Claim",
    side: "web3",
    desc: "You approve the claim in your wallet — you sign, nobody else.",
  },
  {
    icon: Coins,
    title: "Settle",
    side: "web3",
    desc: `OWT is delivered to your wallet on ${NETWORK_LABEL}, verifiable on‑chain.`,
  },
];

interface RewardFlowProps {
  // Index of the currently active step (0-based). Steps before it render as done.
  // Defaults to -1 → purely explanatory (nothing highlighted).
  activeStep?: number;
  className?: string;
  compact?: boolean;
}

function stateFor(i: number, active: number): StepState {
  if (active < 0) return "pending";
  if (i < active) return "done";
  if (i === active) return "active";
  return "pending";
}

export function RewardFlow({
  activeStep = -1,
  className = "",
  compact = false,
}: RewardFlowProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="rounded-full bg-brand-ink/8 px-2.5 py-0.5 text-brand-ink/60">
          web2 · off‑chain
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-brand-ink/15 to-brand-green/30" />
        <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-brand-green">
          web3 · on‑chain
        </span>
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEPS.map((step, i) => {
          const state = stateFor(i, activeStep);
          const Icon = step.icon;
          const isWeb3 = step.side === "web3";
          return (
            <li
              key={step.title}
              className={`relative rounded-xl border p-3 transition-colors ${
                state === "active"
                  ? "border-brand-green/40 bg-brand-green/[0.06] shadow-sm"
                  : state === "done"
                  ? "border-brand-green/20 bg-white"
                  : "border-brand-green/12 bg-white"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isWeb3
                      ? "bg-brand-green/12 text-brand-green"
                      : "bg-brand-ink/8 text-brand-ink/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-display text-sm font-semibold text-brand-ink">
                  {step.title}
                </span>
                {state === "done" && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-brand-green" />
                )}
                {state === "active" && (
                  <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-brand-green" />
                )}
              </div>
              {!compact && (
                <p className="text-xs leading-snug text-brand-ink/55">{step.desc}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
