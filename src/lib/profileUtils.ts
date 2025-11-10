// Utility to ensure profile exists for wallet
import { supabase } from "./supabaseClient";

export const ensureProfileExists = async (walletAddress: string) => {
  try {
    // 1. First check if profile already exists with this wallet address
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id, username, total_points")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (existingProfile) {
      return existingProfile.id;
    }

    // 2. If no profile exists, create a new one (no Supabase auth needed)
    if (profileCheckError?.code === "PGRST116") {
      // Generate a unique username
      const username = `user_${walletAddress.substring(2, 8).toLowerCase()}`;

      // Create profile directly without Supabase auth
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            wallet_address: walletAddress.toLowerCase(),
            username: username,
            total_points: 0,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        return null;
      }

      // Also create wallet entry for backward compatibility
      await supabase.from("wallets").insert([
        {
          profile_id: newProfile.id,
          wallet_address: walletAddress.toLowerCase(),
          is_primary: true,
        },
      ]);

      return newProfile.id;
    }

    console.error("Error checking profile:", profileCheckError);
    return null;
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
    const { error: historyError } = await supabase
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
