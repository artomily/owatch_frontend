"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { gsap } from "gsap";
import { Trophy, Crown, Medal, Coins } from "lucide-react";
import {
  getLeaderboard,
  getProfileByWallet,
  type LeaderboardEntry,
} from "@/lib/queries";

const initials = (name: string) => name.slice(0, 2).toUpperCase();

function PodiumCard({
  entry,
  place,
  isMe,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  isMe: boolean;
}) {
  const styles = {
    1: { ring: "ring-amber-300", bg: "bg-amber-50", icon: Crown, color: "text-amber-500", h: "sm:mt-0" },
    2: { ring: "ring-brand-green/30", bg: "bg-brand-green/5", icon: Medal, color: "text-brand-ink/40", h: "sm:mt-6" },
    3: { ring: "ring-orange-200", bg: "bg-orange-50", icon: Medal, color: "text-orange-400", h: "sm:mt-8" },
  }[place];
  const Icon = styles.icon;
  return (
    <div
      className={`podium-anim flex flex-col items-center rounded-2xl border border-brand-green/12 ${styles.bg} p-5 text-center shadow-sm ${styles.h} ${
        isMe ? "ring-2 ring-brand-green" : ""
      }`}
    >
      <div className={`relative mb-3 h-16 w-16 rounded-full bg-white ring-2 ${styles.ring}`}>
        <div className="flex h-full w-full items-center justify-center font-display text-lg font-semibold text-brand-ink">
          {initials(entry.username)}
        </div>
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
          <Icon className={`h-4 w-4 ${styles.color}`} />
        </span>
      </div>
      <p className="line-clamp-1 max-w-full font-medium text-brand-ink">
        {entry.username}
        {isMe && <span className="ml-1 text-xs text-brand-green">(you)</span>}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-brand-green">
        {entry.total_points.toLocaleString()}
      </p>
      <p className="text-xs text-brand-ink/40">OWT</p>
    </div>
  );
}

export function Leaderboard(): JSX.Element {
  const { address } = useAccount();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const [list, id] = await Promise.all([
        getLeaderboard(50),
        address ? getProfileByWallet(address) : Promise.resolve(null),
      ]);
      if (!active) return;
      setEntries(list);
      setMyId(id);
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
      gsap.from(".podium-anim, .row-anim", {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });
    }, rootRef);
    return () => ctx.revert();
  }, [loading]);

  const [first, second, third, ...rest] = entries;
  const myRank = entries.find((e) => e.id === myId);

  return (
    <div ref={rootRef} className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10">
          <Trophy className="h-6 w-6 text-brand-green" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink lg:text-4xl">
            Leaderboard
          </h1>
          <p className="text-brand-ink/60">Top earners across O&apos;Watch.</p>
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-brand-ink/50">
          Loading rankings…
        </p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-brand-green/12 bg-white p-12 text-center shadow-sm">
          <Coins className="mx-auto mb-3 h-10 w-10 text-brand-ink/25" />
          <p className="text-brand-ink/60">No ranked users yet. Be the first to earn!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {second && <PodiumCard entry={second} place={2} isMe={second.id === myId} />}
            {first && <PodiumCard entry={first} place={1} isMe={first.id === myId} />}
            {third && <PodiumCard entry={third} place={3} isMe={third.id === myId} />}
          </div>

          {/* Your rank callout */}
          {myRank && myRank.rank > 3 && (
            <div className="row-anim flex items-center justify-between rounded-xl border border-brand-green/30 bg-brand-green/[0.06] px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold text-brand-green">
                  #{myRank.rank}
                </span>
                <span className="font-medium text-brand-ink">
                  {myRank.username}{" "}
                  <span className="text-xs text-brand-green">(you)</span>
                </span>
              </div>
              <span className="font-display font-bold text-brand-ink">
                {myRank.total_points.toLocaleString()} OWT
              </span>
            </div>
          )}

          {/* Rest of the table */}
          {rest.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-brand-green/12 bg-white shadow-sm">
              <ul className="divide-y divide-brand-green/10">
                {rest.map((entry) => {
                  const isMe = entry.id === myId;
                  return (
                    <li
                      key={entry.id}
                      className={`row-anim flex items-center justify-between px-5 py-3.5 ${
                        isMe ? "bg-brand-green/[0.05]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-7 text-center font-display text-sm font-semibold text-brand-ink/45">
                          {entry.rank}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 text-xs font-semibold text-brand-green">
                          {initials(entry.username)}
                        </span>
                        <span className="font-medium text-brand-ink">
                          {entry.username}
                          {isMe && (
                            <span className="ml-1 text-xs text-brand-green">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="font-display font-semibold text-brand-ink">
                        {entry.total_points.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-brand-ink/40">
                          OWT
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
