// Utility to ensure profile exists for wallet
import { supabase } from "./supabaseClient";

export const ensureProfileExists = async (walletAddress: string) => {
  try {
    // 1. Check if wallet exists
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("profile_id")
      .eq("wallet_address", walletAddress.toLowerCase())
      .maybeSingle(); // Use maybeSingle - wallet may not exist (return null, not error)

    if (walletData?.profile_id) {
      return walletData.profile_id;
    }

    // 2. If wallet doesn't exist, create profile and wallet
    if (walletError?.code === "PGRST116" || !walletData) {
      // Create a new profile with UUID
      const profileId = crypto.randomUUID(); // Generate UUID for profile ID

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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: profileId, // Add the generated ID
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
      const { error: walletInsertError } = await supabase
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

// Generate a valid temporary email for wallet users
// Note: Wallet address comes from user's connected wallet (MetaMask, etc)
// This function generates a TEMPORARY EMAIL for Supabase auth purposes only
// The wallet address is stored separately in the wallets table
export const generateWalletEmail = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `wallet${timestamp}${random}@owatch.local`;
};

// Create wallet-based auth user
// Takes WALLET ADDRESS (from connected wallet) and USERNAME (from user input)
// Generates temporary email and password for Supabase auth
export const createWalletAuthUser = async (
  walletAddress: string, // 0xabc... from MetaMask/connected wallet
  username: string // from user form input
) => {
  try {
    // Generate temporary email for Supabase auth
    const tempEmail = generateWalletEmail();
    const tempPassword = Math.random().toString(36).slice(-15);

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password: tempPassword,
    });

    if (authError || !authData.user) {
      console.error("Auth signup error:", authError);
      return null;
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: tempEmail,
        wallet_address: walletAddress.toLowerCase(),
        username: username.toLowerCase(),
        total_points: 0,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return null;
    }

    // Link wallet to profile
    const { error: walletError } = await supabase.from("wallets").insert({
      profile_id: profileData.id,
      wallet_address: walletAddress.toLowerCase(),
      is_primary: true,
    });

    if (walletError) {
      console.error("Wallet link error:", walletError);
      return null;
    }

    return profileData;
  } catch (error) {
    console.error("Error in createWalletAuthUser:", error);
    return null;
  }
};
