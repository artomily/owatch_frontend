import { supabase } from "./supabaseClient";

// ==================== TYPES ====================

export interface PointHistory {
  id: number;
  profile_id: string;
  amount: number;
  source: string;
  source_id: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  total_points: number;
  avatar_url?: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  profile_id: string;
  wallet_address: string;
  is_primary: boolean;
  created_at: string;
}

export interface RewardVideo {
  id: number;
  youtube_id: string;
  title: string;
  thumbnail_url?: string;
  published_at?: string;
  reward_points_amount: number;
  required_duration_seconds: number;
  category?: string;
}

export interface UserVideoProgress {
  profile_id: string;
  video_id: number;
  last_watched_second: number;
  is_completed: boolean;
  completion_time?: string;
}

export interface ConversionTransaction {
  id: number;
  profile_id: string;
  points_deducted: number;
  token_minted: string; // NUMERIC stored as string for precision
  conversion_rate: string;
  tx_hash?: string;
  status: "pending" | "success" | "failed";
  created_at: string;
}

export interface StakingPool {
  id: number;
  name: string;
  token_contract_address: string;
  apy: string; // NUMERIC stored as string
  lock_period_days?: number;
  status: "active" | "inactive";
}

export interface StakingTransaction {
  id: number;
  profile_id: string;
  pool_id: number;
  amount_staked: string; // NUMERIC stored as string
  reward_earned: string;
  start_date: string;
  estimated_end_date?: string;
  status: "staked" | "claimed" | "unlocked";
}

// Get point history for current user
export const getPointHistory = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("point_history")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching point history:", error);
      return null;
    }

    return data as PointHistory[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get total points for user
export const getTotalPoints = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("point_history")
      .select("amount")
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error fetching total points:", error);
      return 0;
    }

    const total = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
    return total;
  } catch (error) {
    console.error("Error:", error);
    return 0;
  }
};

// Get point history by source (e.g., 'video_watch', 'staking_reward')
export const getPointHistoryBySource = async (
  profileId: string,
  source: string
) => {
  try {
    const { data, error } = await supabase
      .from("point_history")
      .select("*")
      .eq("profile_id", profileId)
      .eq("source", source)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${source} history:`, error);
      return null;
    }

    return data as PointHistory[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get recent point history (last n transactions)
export const getRecentPointHistory = async (profileId: string, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from("point_history")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent point history:", error);
      return null;
    }

    return data as PointHistory[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get daily earnings summary
export const getDailyEarningsSummary = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("point_history")
      .select("amount, created_at")
      .eq("profile_id", profileId)
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching daily earnings:", error);
      return null;
    }

    // Group by day
    const dailySummary: { [key: string]: number } = {};

    data?.forEach((item) => {
      const date = new Date(item.created_at).toLocaleDateString("en-US", {
        weekday: "short",
      });
      dailySummary[date] = (dailySummary[date] || 0) + item.amount;
    });

    return dailySummary;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// ==================== PROFILE QUERIES ====================

// Get profile by ID
export const getProfile = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get profile by username
export const getProfileByUsername = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error fetching profile by username:", error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Create new profile
export const createProfile = async (
  profileId: string,
  username: string,
  avatarUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          id: profileId,
          username,
          avatar_url: avatarUrl,
          total_points: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Update profile
export const updateProfile = async (
  profileId: string,
  updates: Partial<Profile>
) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profileId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// ==================== WALLET QUERIES ====================

// Get wallets for a profile
export const getWalletsByProfile = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wallets:", error);
      return null;
    }

    return data as Wallet[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get primary wallet for a profile
export const getPrimaryWallet = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_primary", true)
      .single();

    if (error) {
      console.error("Error fetching primary wallet:", error);
      return null;
    }

    return data as Wallet;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get profile by wallet address
export const getProfileByWallet = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("profile_id")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (error) {
      console.error("Error fetching profile by wallet:", error);
      return null;
    }

    return data?.profile_id as string;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Add wallet to profile
export const addWallet = async (
  profileId: string,
  walletAddress: string,
  isPrimary = false
) => {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .insert([
        {
          profile_id: profileId,
          wallet_address: walletAddress.toLowerCase(),
          is_primary: isPrimary,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding wallet:", error);
      return null;
    }

    return data as Wallet;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Set primary wallet
export const setPrimaryWallet = async (profileId: string, walletId: number) => {
  try {
    // First, unset all other primary wallets
    await supabase
      .from("wallets")
      .update({ is_primary: false })
      .eq("profile_id", profileId);

    // Then set the new primary wallet
    const { data, error } = await supabase
      .from("wallets")
      .update({ is_primary: true })
      .eq("id", walletId)
      .select()
      .single();

    if (error) {
      console.error("Error setting primary wallet:", error);
      return null;
    }

    return data as Wallet;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Remove wallet
export const removeWallet = async (walletId: number) => {
  try {
    const { error } = await supabase
      .from("wallets")
      .delete()
      .eq("id", walletId);

    if (error) {
      console.error("Error removing wallet:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

// ==================== REWARD VIDEO QUERIES ====================

// Get all reward videos
export const getAllRewardVideos = async () => {
  try {
    const { data, error } = await supabase
      .from("reward_videos")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching reward videos:", error);
      return null;
    }

    return data as RewardVideo[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get reward video by ID
export const getRewardVideoById = async (videoId: number) => {
  try {
    const { data, error } = await supabase
      .from("reward_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (error) {
      console.error("Error fetching reward video:", error);
      return null;
    }

    return data as RewardVideo;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get reward video by YouTube ID
export const getRewardVideoByYoutubeId = async (youtubeId: string) => {
  try {
    const { data, error } = await supabase
      .from("reward_videos")
      .select("*")
      .eq("youtube_id", youtubeId)
      .single();

    if (error) {
      console.error("Error fetching reward video by YouTube ID:", error);
      return null;
    }

    return data as RewardVideo;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get reward videos by category
export const getRewardVideosByCategory = async (category: string) => {
  try {
    const { data, error } = await supabase
      .from("reward_videos")
      .select("*")
      .eq("category", category)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos by category:", error);
      return null;
    }

    return data as RewardVideo[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Create new reward video
export const createRewardVideo = async (video: Omit<RewardVideo, "id">) => {
  try {
    const { data, error } = await supabase
      .from("reward_videos")
      .insert([video])
      .select()
      .single();

    if (error) {
      console.error("Error creating reward video:", error);
      return null;
    }

    return data as RewardVideo;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Update reward video
export const updateRewardVideo = async (
  videoId: number,
  updates: Partial<RewardVideo>
) => {
  try {
    const { data, error } = await supabase
      .from("reward_videos")
      .update(updates)
      .eq("id", videoId)
      .select()
      .single();

    if (error) {
      console.error("Error updating reward video:", error);
      return null;
    }

    return data as RewardVideo;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// ==================== USER VIDEO PROGRESS QUERIES ====================

// Get user's video progress
export const getUserVideoProgress = async (
  profileId: string,
  videoId: number
) => {
  try {
    const { data, error } = await supabase
      .from("user_video_progress")
      .select("*")
      .eq("profile_id", profileId)
      .eq("video_id", videoId)
      .single();

    if (error) {
      // Not found is okay for this query
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching user video progress:", error);
      return null;
    }

    return data as UserVideoProgress;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get all user's video progress
export const getAllUserVideoProgress = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_video_progress")
      .select("*")
      .eq("profile_id", profileId)
      .order("completion_time", { ascending: false });

    if (error) {
      console.error("Error fetching user video progress:", error);
      return null;
    }

    return data as UserVideoProgress[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get completed videos for user
export const getCompletedVideos = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_video_progress")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_completed", true)
      .order("completion_time", { ascending: false });

    if (error) {
      console.error("Error fetching completed videos:", error);
      return null;
    }

    return data as UserVideoProgress[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get in-progress videos for user
export const getInProgressVideos = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_video_progress")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_completed", false)
      .gt("last_watched_second", 0)
      .order("last_watched_second", { ascending: false });

    if (error) {
      console.error("Error fetching in-progress videos:", error);
      return null;
    }

    return data as UserVideoProgress[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Update video progress
export const updateVideoProgress = async (
  profileId: string,
  videoId: number,
  lastWatchedSecond: number
) => {
  try {
    const { data, error } = await supabase
      .from("user_video_progress")
      .upsert([
        {
          profile_id: profileId,
          video_id: videoId,
          last_watched_second: lastWatchedSecond,
          is_completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error updating video progress:", error);
      return null;
    }

    return data as UserVideoProgress;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Mark video as completed
export const completeVideo = async (profileId: string, videoId: number) => {
  try {
    console.log(
      `[completeVideo] Marking video ${videoId} as completed for profile ${profileId}`
    );

    const { data, error } = await supabase
      .from("user_video_progress")
      .upsert([
        {
          profile_id: profileId,
          video_id: videoId,
          is_completed: true,
          completion_time: new Date().toISOString(),
          last_watched_second: 0, // Reset progress after completion
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[completeVideo] Error completing video:", error);
      throw new Error(`Failed to complete video: ${error.message}`);
    }

    console.log("[completeVideo] Video marked as completed successfully");
    return data as UserVideoProgress;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[completeVideo] Caught error:", errorMsg);
    throw error;
  }
};

// Get user's video completion stats
export const getVideoCompletionStats = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_video_progress")
      .select("is_completed")
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error fetching completion stats:", error);
      return null;
    }

    const total = data?.length || 0;
    const completed = data?.filter((p) => p.is_completed).length || 0;
    const inProgress = total - completed;

    return {
      total,
      completed,
      inProgress,
      completionPercentage:
        total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Get videos with user progress
export const getVideosWithProgress = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("reward_videos")
      .select(
        `
        *,
        user_video_progress (
          last_watched_second,
          is_completed,
          completion_time
        )
      `
      )
      .eq("user_video_progress.profile_id", profileId);

    if (error) {
      console.error("Error fetching videos with progress:", error);
      return null;
    }

    return data as any[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// ==================== CONVERSION TRANSACTIONS ====================

/**
 * Get all conversion transactions for a profile
 */
export const getConversionHistory = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("conversion_transactions")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversion history:", error);
      return null;
    }

    return data as ConversionTransaction[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get total tokens minted by a profile
 */
export const getTotalTokensMinted = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("conversion_transactions")
      .select("token_minted")
      .eq("profile_id", profileId)
      .eq("status", "success");

    if (error) {
      console.error("Error fetching total tokens:", error);
      return null;
    }

    // Sum all successful token conversions
    const total = data.reduce(
      (sum, tx) => sum + parseFloat(tx.token_minted),
      0
    );
    return total;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Create a new conversion transaction
 */
export const createConversionTransaction = async (
  profileId: string,
  pointsToConvert: number,
  conversionRate: number
) => {
  try {
    const tokenAmount = pointsToConvert * conversionRate;

    const { data, error } = await supabase
      .from("conversion_transactions")
      .insert({
        profile_id: profileId,
        points_deducted: pointsToConvert,
        token_minted: tokenAmount.toString(),
        conversion_rate: conversionRate.toString(),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversion:", error);
      return null;
    }

    return data as ConversionTransaction;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Update conversion transaction status and tx_hash
 */
export const updateConversionStatus = async (
  transactionId: number,
  status: "pending" | "success" | "failed",
  txHash?: string
) => {
  try {
    const updateData: any = { status };
    if (txHash) {
      updateData.tx_hash = txHash;
    }

    const { data, error } = await supabase
      .from("conversion_transactions")
      .update(updateData)
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating conversion status:", error);
      return null;
    }

    return data as ConversionTransaction;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get conversion transaction by tx_hash
 */
export const getConversionByTxHash = async (txHash: string) => {
  try {
    const { data, error } = await supabase
      .from("conversion_transactions")
      .select("*")
      .eq("tx_hash", txHash)
      .single();

    if (error) {
      console.error("Error fetching conversion by tx hash:", error);
      return null;
    }

    return data as ConversionTransaction;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get pending conversions for a profile
 */
export const getPendingConversions = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("conversion_transactions")
      .select("*")
      .eq("profile_id", profileId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending conversions:", error);
      return null;
    }

    return data as ConversionTransaction[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// ==================== STAKING POOLS ====================

/**
 * Get all active staking pools
 */
export const getActiveStakingPools = async () => {
  try {
    const { data, error } = await supabase
      .from("staking_pools")
      .select("*")
      .eq("status", "active")
      .order("apy", { ascending: false });

    if (error) {
      console.error("Error fetching staking pools:", error);
      return null;
    }

    return data as StakingPool[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get all staking pools (including inactive)
 */
export const getAllStakingPools = async () => {
  try {
    const { data, error } = await supabase
      .from("staking_pools")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching all pools:", error);
      return null;
    }

    return data as StakingPool[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get staking pool by ID
 */
export const getStakingPoolById = async (poolId: number) => {
  try {
    const { data, error } = await supabase
      .from("staking_pools")
      .select("*")
      .eq("id", poolId)
      .single();

    if (error) {
      console.error("Error fetching pool:", error);
      return null;
    }

    return data as StakingPool;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Create a new staking pool (admin function)
 */
export const createStakingPool = async (
  name: string,
  tokenContractAddress: string,
  apy: number,
  lockPeriodDays?: number
) => {
  try {
    const { data, error } = await supabase
      .from("staking_pools")
      .insert({
        name,
        token_contract_address: tokenContractAddress,
        apy: apy.toString(),
        lock_period_days: lockPeriodDays,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating pool:", error);
      return null;
    }

    return data as StakingPool;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Update staking pool status (admin function)
 */
export const updateStakingPoolStatus = async (
  poolId: number,
  status: "active" | "inactive"
) => {
  try {
    const { data, error } = await supabase
      .from("staking_pools")
      .update({ status })
      .eq("id", poolId)
      .select()
      .single();

    if (error) {
      console.error("Error updating pool status:", error);
      return null;
    }

    return data as StakingPool;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// ==================== STAKING TRANSACTIONS ====================

/**
 * Get all staking transactions for a profile
 */
export const getStakingHistory = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .select(
        `
        *,
        staking_pools (
          name,
          token_contract_address,
          apy
        )
      `
      )
      .eq("profile_id", profileId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching staking history:", error);
      return null;
    }

    return data as any[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get active staking positions for a profile
 */
export const getActiveStakingPositions = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .select(
        `
        *,
        staking_pools (
          name,
          token_contract_address,
          apy,
          lock_period_days
        )
      `
      )
      .eq("profile_id", profileId)
      .eq("status", "staked")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching active positions:", error);
      return null;
    }

    return data as any[];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get total staked amount for a profile
 */
export const getTotalStakedAmount = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .select("amount_staked")
      .eq("profile_id", profileId)
      .eq("status", "staked");

    if (error) {
      console.error("Error fetching total staked:", error);
      return null;
    }

    // Sum all active staking amounts
    const total = data.reduce(
      (sum, tx) => sum + parseFloat(tx.amount_staked),
      0
    );
    return total;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get total rewards earned by a profile
 */
export const getTotalRewardsEarned = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .select("reward_earned")
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error fetching total rewards:", error);
      return null;
    }

    // Sum all rewards
    const total = data.reduce(
      (sum, tx) => sum + parseFloat(tx.reward_earned),
      0
    );
    return total;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Create a new staking transaction
 */
export const createStakingTransaction = async (
  profileId: string,
  poolId: number,
  amountToStake: number,
  lockPeriodDays?: number
) => {
  try {
    const estimatedEndDate = lockPeriodDays
      ? new Date(
          Date.now() + lockPeriodDays * 24 * 60 * 60 * 1000
        ).toISOString()
      : undefined;

    const { data, error } = await supabase
      .from("staking_transactions")
      .insert({
        profile_id: profileId,
        pool_id: poolId,
        amount_staked: amountToStake.toString(),
        reward_earned: "0",
        estimated_end_date: estimatedEndDate,
        status: "staked",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating staking transaction:", error);
      return null;
    }

    return data as StakingTransaction;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Update staking transaction rewards
 */
export const updateStakingRewards = async (
  transactionId: number,
  rewardAmount: number
) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .update({ reward_earned: rewardAmount.toString() })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating rewards:", error);
      return null;
    }

    return data as StakingTransaction;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Claim staking rewards (change status to claimed)
 */
export const claimStakingRewards = async (transactionId: number) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .update({ status: "claimed" })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("Error claiming rewards:", error);
      return null;
    }

    return data as StakingTransaction;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Unlock staked tokens (change status to unlocked)
 */
export const unlockStakedTokens = async (transactionId: number) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .update({ status: "unlocked" })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("Error unlocking tokens:", error);
      return null;
    }

    return data as StakingTransaction;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Get staking statistics for a profile
 */
export const getStakingStats = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from("staking_transactions")
      .select("*")
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error fetching staking stats:", error);
      return null;
    }

    const totalStaked = data
      .filter((tx) => tx.status === "staked")
      .reduce((sum, tx) => sum + parseFloat(tx.amount_staked), 0);

    const totalRewards = data.reduce(
      (sum, tx) => sum + parseFloat(tx.reward_earned),
      0
    );

    const activePositions = data.filter((tx) => tx.status === "staked").length;
    const totalPositions = data.length;

    return {
      totalStaked,
      totalRewards,
      activePositions,
      totalPositions,
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
