"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  TrendingUp,
  Eye,
  Trophy,
  Calendar,
  PlayCircle,
  Target,
} from "lucide-react";
import {
  getTotalPoints,
  getRecentPointHistory,
  getProfileByWallet,
  getDailyEarningsSummary,
  getVideoCompletionStats,
  PointHistory,
} from "@/lib/queries";
import { getUserData, saveUserData, type UserData } from "@/lib/walletStorage";
import { gsap } from "gsap";

// ── Local SVG helpers ────────────────────────────────────────────────────────

function SparklineMini({ data }: { data: number[] }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const W = 160, H = 36;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} className="mt-5 opacity-50">
      <polyline
        points={pts}
        fill="none"
        stroke="#7C3AED"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WeeklyAreaChart({ data }: { data: { day: string; earnings: number }[] }) {
  const gradId = useId();
  const W = 480, H = 140;
  const P = { t: 16, r: 16, b: 32, l: 8 };
  const earnings = data.map((d) => d.earnings);
  const max = Math.max(...earnings, 1) * 1.15;
  const iW = W - P.l - P.r;
  const iH = H - P.t - P.b;

  const pts = earnings.map((v, i) => ({
    x: P.l + (i / (earnings.length - 1)) * iW,
    y: P.t + iH - (v / max) * iH,
  }));

  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
  }, "");

  const last = pts[pts.length - 1];
  const area = `${line} L ${last.x} ${P.t + iH} L ${pts[0].x} ${P.t + iH} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7C3AED" />
      ))}
      {data.map((d, i) => (
        <text
          key={i}
          x={pts[i].x}
          y={H - 6}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
        >
          {d.day}
        </text>
      ))}
    </svg>
  );
}

function CircularRing({
  progress,
  label,
  sub,
  size = 100,
}: {
  progress: number;
  label: string;
  sub: string;
  size?: number;
}) {
  const strokeW = 9;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 1));

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {/* Track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#7C3AED" strokeOpacity="0.12" strokeWidth={strokeW} />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="#7C3AED"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
          }}
        />
        <text x={cx} y={cx + 1} dominantBaseline="middle" textAnchor="middle" fontSize="15" fontWeight="700" fill="#111827">
          {Math.round(progress * 100)}%
        </text>
      </svg>
      <p className="text-sm font-semibold text-brand-ink">{label}</p>
      <p className="text-xs text-brand-ink/50 text-center leading-snug">{sub}</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Build a 7-day earnings series from the daily summary map, zero-filling missing days.
function buildWeeklyData(summary: { [day: string]: number } | null) {
  return WEEK_DAYS.map((day) => ({
    day,
    earnings: summary?.[day] ?? 0,
  }));
}

export function Dashboard(): JSX.Element {
  const { address } = useAccount();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [recentHistory, setRecentHistory] = useState<PointHistory[]>([]);
  const [weeklyData, setWeeklyData] = useState(() => buildWeeklyData(null));
  const [completion, setCompletion] = useState<{
    completed: number;
    total: number;
    completionPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const dashRef = useRef<HTMLDivElement>(null);

  // ── Profile ID resolution ──────────────────────────────────────────────────
  useEffect(() => {
    const getProfileId = async () => {
      const userData = getUserData();
      if (userData && address?.toLowerCase() === userData.walletAddress) {
        setProfileId(userData.profileId);
        return;
      }
      if (!address) { setProfileId(null); setLoading(false); return; }

      setLoading(true);
      try {
        const id = await getProfileByWallet(address);
        if (id) {
          setProfileId(id);
          const newUserData: UserData = { walletAddress: address.toLowerCase(), profileId: id, totalPoints: 0, lastSync: new Date().toISOString() };
          saveUserData(newUserData);
        }
      } catch (error) {
        console.error("Error fetching profile by wallet:", error);
        setProfileId(null);
      } finally {
        setLoading(false);
      }
    };
    getProfileId();
  }, [address]);

  // ── Dashboard data fetch ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!profileId) return;
      setLoading(true);
      try {
        const [total, recent, daily, stats] = await Promise.all([
          getTotalPoints(profileId),
          getRecentPointHistory(profileId, 5),
          getDailyEarningsSummary(profileId),
          getVideoCompletionStats(profileId),
        ]);
        setTotalPoints(total);
        setRecentHistory(recent || []);
        setWeeklyData(buildWeeklyData(daily));
        if (stats) setCompletion(stats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profileId]);

  // ── Entrance animation (fires after data loads) ───────────────────────────
  useEffect(() => {
    if (loading || !dashRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(
        ".primary-stat, .secondary-stat, .chart-card, .goals-card, .timeline-card",
        {
          y: 28,
          opacity: 0,
          duration: 0.55,
          stagger: 0.075,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    }, dashRef);
    return () => ctx.revert();
  }, [loading]);

  // ── Derived secondary stats ────────────────────────────────────────────────
  const videosWatched = completion?.completed ?? recentHistory.filter((h) => h.source === "video_watch").length;
  const stakingTotal = recentHistory.filter((h) => h.source === "staking_reward").reduce((s, h) => s + h.amount, 0);
  const weeklyEarned = weeklyData.reduce((s, d) => s + d.earnings, 0);

  const secondaryStats = [
    { title: "Videos Watched", value: videosWatched, unit: "videos", change: completion ? `${completion.completionPercentage}%` : "—", icon: Eye },
    { title: "Staking Rewards", value: stakingTotal, unit: "OWT", change: "+0", icon: Trophy },
    { title: "This Week", value: weeklyEarned, unit: "OWT", change: "7d", icon: PlayCircle },
  ];

  // Weekly challenge progress from real completed-video count (target: 50).
  const weeklyChallengeProgress = Math.min((completion?.completed ?? 0) / 50, 1);

  return (
    <div ref={dashRef} className="space-y-6 p-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink lg:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-brand-ink/60">Track your earnings and watch progress</p>
        </div>
        <Badge variant="secondary" className="w-fit border-brand-green/20 bg-brand-green/10 text-brand-green">
          <div className="mr-2 h-2 w-2 rounded-full bg-brand-green" />
          Online
        </Badge>
      </div>

      {/* ── Asymmetric stat row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Primary hero stat */}
        <div className="primary-stat relative overflow-hidden rounded-2xl border border-brand-green/12 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 -translate-y-12 translate-x-12 rounded-full bg-brand-green/5" />
          <p className="mb-2 text-sm font-medium text-brand-ink/50">Total OWT Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl font-bold tracking-tight text-brand-ink">
              {loading ? "—" : totalPoints.toLocaleString()}
            </span>
            <span className="font-display text-2xl text-brand-ink/30">OWT</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
              <TrendingUp className="h-3 w-3" />
              +12.5% this week
            </span>
          </div>
          <SparklineMini data={weeklyData.map((d) => d.earnings)} />
        </div>

        {/* Secondary compact cards */}
        <div className="flex flex-col gap-3">
          {secondaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="secondary-stat flex items-center gap-4 rounded-xl border border-brand-green/12 bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                  <Icon className="h-5 w-5 text-brand-green" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-brand-ink/50">{stat.title}</p>
                  <p className="font-display text-xl font-semibold text-brand-ink">
                    {loading ? "—" : stat.value}
                    <span className="ml-1 text-xs font-normal text-brand-ink/40">{stat.unit}</span>
                  </p>
                </div>
                <span className="ml-auto text-xs font-medium text-brand-green">{stat.change}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chart + Goals row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Area Chart */}
        <Card className="chart-card border border-brand-green/12 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-display text-base text-brand-ink">
              <Calendar className="h-4 w-4 text-brand-green" />
              Weekly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <WeeklyAreaChart data={weeklyData} />
          </CardContent>
        </Card>

        {/* Goals with circular rings */}
        <Card className="goals-card border border-brand-green/12 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-display text-base text-brand-ink">
              <Target className="h-4 w-4 text-brand-green" />
              Goals &amp; Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-around py-4">
              <CircularRing progress={0.6} label="Daily Goal" sub="18 / 30 min" />
              <CircularRing
                progress={weeklyChallengeProgress}
                label="Weekly Challenge"
                sub={`${completion?.completed ?? 0} / 50 videos`}
              />
            </div>
            {/* Recent achievement */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Trophy className="h-8 w-8 flex-shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-brand-ink">Achievement Unlocked!</p>
                <p className="text-xs text-brand-ink/60">7-day watch streak completed</p>
                <Badge variant="secondary" className="mt-1 border-amber-200 bg-amber-100 text-amber-700">
                  +100 OWT Bonus
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Transaction Timeline ──────────────────────────────────────── */}
      <Card className="timeline-card border border-brand-green/12 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-display text-base text-brand-ink">
            <Coins className="h-4 w-4 text-brand-green" />
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-brand-ink/50">Loading transaction history…</div>
          ) : recentHistory.length > 0 ? (
            <div className="relative space-y-5 border-l border-brand-green/20 pl-6">
              {recentHistory.map((tx, i) => (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[1.125rem] top-1 h-3 w-3 rounded-full border-2 border-brand-green bg-brand-green/20" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-ink">
                        {tx.source === "video_watch"
                          ? "Video Watched"
                          : tx.source === "staking_reward"
                          ? "Staking Reward"
                          : tx.source}
                      </p>
                      <p className="mt-0.5 text-xs text-brand-ink/40">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tx.amount > 0 ? "text-brand-green" : "text-destructive"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount} OWT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-brand-ink/50">No transaction history yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
