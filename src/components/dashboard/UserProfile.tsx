import {
  Camera,
  Calendar,
  Edit,
  Save,
  X,
  Loader2,
  Wallet,
  Trophy,
  User2Icon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  getProfile,
  getProfileByWallet,
  updateProfile,
  getTotalPoints,
  getVideoCompletionStats,
} from "@/lib/queries";
import { ensureProfileExists } from "@/lib/profileUtils";

export function UserProfile() {
  const { address, isConnected } = useAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    total_points: 0,
    avatar_url: "" as string | undefined,
    created_at: "",
  });
  const [stats, setStats] = useState({
    videosCompleted: 0,
    totalVideos: 0,
    totalPoints: 0,
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) return;

      setLoading(true);
      try {
        // Get or create profile
        let id = await getProfileByWallet(address);
        if (!id) {
          id = await ensureProfileExists(address);
        }

        if (id) {
          setProfileId(id);

          // Get profile details
          const profileData = await getProfile(id);
          if (profileData) {
            setProfile({
              id: profileData.id,
              username: profileData.username,
              total_points: profileData.total_points,
              avatar_url: profileData.avatar_url,
              created_at: profileData.created_at,
            });
          }

          // Get stats
          const points = await getTotalPoints(id);
          const completionStats = await getVideoCompletionStats(id);

          setStats({
            videosCompleted: completionStats?.completed || 0,
            totalVideos: completionStats?.total || 0,
            totalPoints: points || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isConnected && address) {
      fetchProfile();
    }
  }, [address, isConnected]);

  const handleSave = async () => {
    if (!profileId) return;

    try {
      await updateProfile(profileId, {
        username: profile.username,
        avatar_url: profile.avatar_url,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white border border-brand-green/12 rounded-2xl shadow-sm">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-brand-green" />
          <h2 className="font-display text-2xl font-semibold mb-2 text-brand-ink">
            Connect Your Wallet
          </h2>
          <p className="text-brand-ink/60">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink mb-2">
            User Profile
          </h1>
          <p className="text-brand-ink/70">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-brand-green/20 rounded-full hover:bg-brand-green/5 text-brand-ink transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-green hover:bg-brand-green-700 text-brand-cream rounded-full transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-green hover:bg-brand-green-700 text-brand-cream rounded-full transition-colors duration-200"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center text-brand-cream font-display text-2xl font-semibold">
                  {profile.username ? (
                    profile.username.substring(0, 2).toUpperCase()
                  ) : (
                    <User2Icon className="w-10 h-10" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-brand-cream hover:bg-brand-green-700 transition-colors duration-200">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-brand-ink mb-1">
                {profile.username || "Owatchers"}
              </h2>
              <p className="text-brand-ink/70 mb-2 text-sm font-mono">
                {address
                  ? `${address.substring(0, 6)}...${address.substring(
                      address.length - 4
                    )}`
                  : ""}
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-display text-lg font-semibold text-brand-green">
                  {profile.total_points.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-center text-sm text-brand-ink/50">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12 mt-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-brand-ink/70">
                  Videos Completed
                </span>
                <span className="font-semibold text-brand-ink">
                  {stats.videosCompleted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-ink/70">
                  Total Points
                </span>
                <span className="font-semibold text-brand-ink">
                  {stats.totalPoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12">
            <h3 className="text-lg font-semibold text-brand-ink mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-ink/70 mb-2">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white text-brand-ink border border-brand-green/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all duration-200"
                  />
                ) : (
                  <p className="text-brand-ink">
                    {profile.username || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/70 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-brand-ink/40" />
                  <p className="text-brand-ink text-sm font-mono">
                    {address || "Not connected"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/70 mb-2">
                  Total Points
                </label>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <p className="text-brand-ink font-semibold">
                    {profile.total_points.toLocaleString()} OWATCH Points
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/70 mb-2">
                  Member Since
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-brand-ink/40" />
                  <p className="text-brand-ink">
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12 mt-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-6">
              Account Settings
            </h3>
            <div className="space-y-4">
              {/* <div className="flex items-center justify-between p-4 border border-brand-green/15 rounded-lg">
                <div>
                  <h4 className="font-medium text-brand-ink">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-brand-ink/70">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 text-sm">
                  Enable
                </button>
              </div> */}

              <div className="flex items-center justify-between p-4 border border-brand-green/15 rounded-lg">
                <div>
                  <h4 className="font-medium text-brand-ink">
                    Change Password
                  </h4>
                  <p className="text-sm text-brand-ink/70">
                    Update your password regularly for security
                  </p>
                </div>
                <button className="px-4 py-2 border border-brand-green/20 rounded-full hover:bg-brand-green/5 text-brand-ink transition-colors duration-200 text-sm">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-brand-green/15 rounded-lg">
                <div>
                  <h4 className="font-medium text-brand-ink">
                    Disconnect Wallet
                  </h4>
                  <p className="text-sm text-brand-ink/70">
                    Safely disconnect your wallet from your account
                  </p>
                </div>
                <button className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full transition-colors duration-200 text-sm">
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
