// Utility to ensure profile exists for wallet
import { supabase } from "./supabaseClient";

export const ensureProfileExists = async (walletAddress: string) => {
  try {
    // 1. First check if profile already exists with this wallet address
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, username, total_points")
      .eq("wallet_address", walletAddress.toLowerCase())
      .maybeSingle(); // Use maybeSingle - wallet may not exist (return null, not error)

    if (existingProfile) {
      return existingProfile.id;
    }

    // 2. If profile doesn't exist, create new profile
    // Generate unique username with retry logic
    let username = `user_${walletAddress.substring(2, 8).toLowerCase()}`;
    let attempt = 0;
    let usernameExists = true;

    while (usernameExists && attempt < 5) {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle(); // Use maybeSingle instead of single for optional results

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking username:", checkError);
        return null;
      }

      if (!existingUser) {
        usernameExists = false;
        break;
      }

      // If exists, add random number to make unique
      attempt++;
      const randomNum = Math.floor(Math.random() * 10000);
      username = `user_${walletAddress
        .substring(2, 8)
        .toLowerCase()}_${randomNum}`;
    }

    if (usernameExists) {
      console.error("Could not generate unique username");
      return null;
    }

    // Generate UUID for profile ID
    const profileId = crypto.randomUUID();

    // Create profile directly without Supabase auth
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        {
          id: profileId, // Add the UUID as id
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
    console.log(
      `[addPointsToProfile] Adding ${points} points to profile ${profileId}`
    );

    // 1. Add point history
    console.log("[addPointsToProfile] Step 1: Inserting point history...");
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
      console.error(
        "[addPointsToProfile] Error adding point history:",
        historyError
      );
      throw new Error(
        `Failed to insert point history: ${historyError.message}`
      );
    }

    console.log("[addPointsToProfile] Point history inserted successfully");

    // 2. Get current profile points
    console.log("[addPointsToProfile] Step 2: Fetching current profile...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", profileId)
      .single();

    if (profileError) {
      console.error(
        "[addPointsToProfile] Error fetching profile:",
        profileError
      );
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    const currentPoints = profileData?.total_points || 0;
    const newTotalPoints = currentPoints + points;

    console.log(
      `[addPointsToProfile] Current points: ${currentPoints}, New total: ${newTotalPoints}`
    );

    // 3. Update profile's total points
    console.log(
      "[addPointsToProfile] Step 3: Updating profile total points..."
    );
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ total_points: newTotalPoints })
      .eq("id", profileId)
      .select()
      .single();

    if (updateError) {
      console.error(
        "[addPointsToProfile] Error updating profile points:",
        updateError
      );
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log(
      "[addPointsToProfile] Profile updated successfully:",
      updatedProfile
    );

    return updatedProfile;
  } catch (error) {
    console.error("[addPointsToProfile] Caught error:", error);
    throw error;
  }
};
