"use client";

import { useEffect, useState } from "react";
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
  PointHistory,
} from "@/lib/queries";
import { getUserData, saveUserData, type UserData } from "@/lib/walletStorage";

export function Dashboard(): JSX.Element {
  const { address } = useAccount();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [recentHistory, setRecentHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Get profile ID from localStorage or fetch from wallet address
  useEffect(() => {
    const getProfileId = async () => {
      // First try to get from localStorage
      const userData = getUserData();

      // If we have saved user data and wallet address matches, use it
      if (userData && address?.toLowerCase() === userData.walletAddress) {
        setProfileId(userData.profileId);
        return;
      }

      // Otherwise, fetch from Supabase using wallet address
      if (!address) {
        setProfileId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const id = await getProfileByWallet(address);
        if (id) {
          setProfileId(id);
          // Save to localStorage for future use
          const newUserData: UserData = {
            walletAddress: address.toLowerCase(),
            profileId: id,
            totalPoints: 0,
            lastSync: new Date().toISOString(),
          };
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

  // Then, fetch dashboard data using the profile ID
  useEffect(() => {
    const fetchData = async () => {
      if (!profileId) return;

      setLoading(true);
      try {
        const [total, recent] = await Promise.all([
          getTotalPoints(profileId),
          getRecentPointHistory(profileId, 5),
        ]);

        setTotalPoints(total);
        setRecentHistory(recent || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

  const stats = [
    {
      title: "Total Earnings",
      value: totalPoints,
      unit: "OWT",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Coins,
    },
    {
      title: "Videos Watched",
      value: recentHistory.filter((h) => h.source === "video_watch").length,
      unit: "videos",
      change: "+5",
      changeType: "positive" as const,
      icon: Eye,
    },
    {
      title: "Staking Rewards",
      value: recentHistory
        .filter((h) => h.source === "staking_reward")
        .reduce((sum, h) => sum + h.amount, 0),
      unit: "OWT",
      change: "+45min",
      changeType: "positive" as const,
      icon: Trophy,
    },
    {
      title: "Recent Transactions",
      value: recentHistory.length,
      unit: "txs",
      change: "Today",
      changeType: "positive" as const,
      icon: PlayCircle,
    },
  ];

  const weeklyData = [
    { day: "Mon", earnings: 120, watchTime: 85 },
    { day: "Tue", earnings: 150, watchTime: 92 },
    { day: "Wed", earnings: 180, watchTime: 110 },
    { day: "Thu", earnings: 90, watchTime: 65 },
    { day: "Fri", earnings: 200, watchTime: 125 },
    { day: "Sat", earnings: 160, watchTime: 95 },
    { day: "Sun", earnings: 140, watchTime: 88 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-brand-ink">
            Dashboard
          </h1>
          <p className="text-brand-ink/60 mt-1">
            Track your earnings and watch progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-brand-green/10 text-brand-green border-brand-green/20 w-fit"
          >
            <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
            Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="bg-white hover:bg-white border border-brand-green/12 transition-colors duration-200 group shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-ink/60">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="font-display text-2xl font-semibold text-brand-ink">
                        {stat.value}
                      </span>
                      {stat.unit && (
                        <span className="text-sm text-brand-ink/50">
                          {stat.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-brand-green" />
                      <span className="text-xs text-brand-green">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-brand-green" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Overview */}
        <Card className="bg-white border border-brand-green/12 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-ink font-display">
              <Calendar className="w-5 h-5 text-brand-green" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-brand-ink/60">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-brand-ink/50 mb-1">
                      <span>Earnings</span>
                      <span>{day.earnings} OWT</span>
                    </div>
                    <div className="w-full bg-brand-green/10 rounded-full h-2">
                      <div
                        className="bg-brand-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(day.earnings / 200) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-brand-ink/50">
                    {day.watchTime}min
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals & Achievements */}
        <Card className="bg-white border border-brand-green/12 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-ink font-display">
              <Target className="w-5 h-5 text-brand-green" />
              Goals & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Daily Goal */}
            <div className="p-4 bg-brand-green/5 border border-brand-green/15 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-brand-ink">
                  Daily Watch Goal
                </h4>
                <Badge
                  variant="secondary"
                  className="bg-brand-green/10 text-brand-green border-brand-green/20"
                >
                  60%
                </Badge>
              </div>
              <p className="text-sm text-brand-ink/70 mb-2">
                Watch 30 minutes to earn 50 OWT
              </p>
              <div className="w-full bg-brand-green/10 rounded-full h-2">
                <div
                  className="bg-brand-green h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="text-xs text-brand-ink/50 mt-1">
                18/30 minutes completed
              </p>
            </div>

            {/* Weekly Challenge */}
            <div className="p-4 bg-brand-green/5 border border-brand-green/15 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-brand-ink">
                  Weekly Challenge
                </h4>
                <Badge
                  variant="secondary"
                  className="bg-brand-green/10 text-brand-green border-brand-green/20"
                >
                  85%
                </Badge>
              </div>
              <p className="text-sm text-brand-ink/70 mb-2">
                Watch 50 videos this week
              </p>
              <div className="w-full bg-brand-green/10 rounded-full h-2">
                <div
                  className="bg-brand-green-500 h-2 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
              <p className="text-xs text-brand-ink/50 mt-1">
                42/50 videos completed
              </p>
            </div>

            {/* Recent Achievement */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Trophy className="w-8 h-8 text-amber-500" />
              <div>
                <h4 className="font-medium text-brand-ink">
                  Achievement Unlocked!
                </h4>
                <p className="text-sm text-brand-ink/70">
                  7-day watch streak completed
                </p>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 border-amber-200 mt-1"
                >
                  +100 OWT Bonus
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings */}
      <Card className="bg-white border border-brand-green/12 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-ink font-display">
            <PlayCircle className="w-5 h-5 text-brand-green" />
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-brand-ink/50">
                Loading transaction history...
              </div>
            ) : recentHistory.length > 0 ? (
              recentHistory.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-brand-cream hover:bg-brand-green/5 border border-brand-green/12 rounded-lg transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle className="w-5 h-5 text-brand-green" />
                    </div>
                    <div>
                      <h4 className="font-medium text-brand-ink">
                        {transaction.source === "video_watch"
                          ? "Video Watched"
                          : transaction.source === "staking_reward"
                          ? "Staking Reward"
                          : transaction.source}
                      </h4>
                      <p className="text-sm text-brand-ink/50">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        transaction.amount > 0
                          ? "text-brand-green"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </div>
                    <div className="text-xs text-brand-ink/50">
                      OWT
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-brand-ink/50">
                No transaction history yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
