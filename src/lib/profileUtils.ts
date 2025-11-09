// Utility to ensure profile exists for wallet
import { supabase } from "./supabaseClient";

export const ensureProfileExists = async (walletAddress: string) => {
  try {
    // 1. Check if wallet exists
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("profile_id")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (walletData?.profile_id) {
      return walletData.profile_id;
    }

    // 2. If wallet doesn't exist, create profile and wallet
    if (walletError?.code === "PGRST116") {
      // Create a new profile
      const username = `user_${walletAddress.substring(2, 8).toLowerCase()}`;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            username: username,
            total_points: 0,
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Error creating profile:", profileError);
        return null;
      }

      // Create wallet entry
      const { data: walletInsertData, error: walletInsertError } =
        await supabase
          .from("wallets")
          .insert([
            {
              profile_id: profileData.id,
              wallet_address: walletAddress.toLowerCase(),
              is_primary: true,
            },
          ])
          .select()
          .single();

      if (walletInsertError) {
        console.error("Error creating wallet:", walletInsertError);
        return null;
      }

      return profileData.id;
    }

    if (walletError) {
      console.error("Error checking wallet:", walletError);
      return null;
    }
  } catch (error) {
    console.error("Error in ensureProfileExists:", error);
    return null;
  }
};

// Add points to profile after video completion
export const addPointsToProfile = async (
  profileId: string,
  points: number,
  sourceId: number,
  source = "video_watch"
) => {
  try {
    // 1. Add point history
    const { data: historyData, error: historyError } = await supabase
      .from("point_history")
      .insert([
        {
          profile_id: profileId,
          amount: points,
          source: source,
          source_id: sourceId,
        },
      ])
      .select()
      .single();

    if (historyError) {
      console.error("Error adding point history:", historyError);
      return null;
    }

    // 2. Update profile's total points
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", profileId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return null;
    }

    const newTotalPoints = (profileData?.total_points || 0) + points;

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ total_points: newTotalPoints })
      .eq("id", profileId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile points:", updateError);
      return null;
    }

    return updatedProfile;
  } catch (error) {
    console.error("Error in addPointsToProfile:", error);
    return null;
  }
};
