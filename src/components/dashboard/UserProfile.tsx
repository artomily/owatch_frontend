import {
  Camera,
  Mail,
  Phone,
  MapPin,
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
import { useTheme } from "../../context/ThemeContext";
import {
  getProfile,
  getProfileByWallet,
  updateProfile,
  getTotalPoints,
  getVideoCompletionStats,
} from "@/lib/queries";
import { ensureProfileExists } from "@/lib/profileUtils";

export function UserProfile() {
  const { theme } = useTheme();
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
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
          <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
            User Profile
          </h1>
          <p className="dark:text-gray-300 text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 dark:border-gray-600 dark:hover:bg-gray-700/50 dark:text-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300"
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
          <div className="dark:bg-white/5 dark:backdrop-blur-md bg-white rounded-xl p-6 shadow-sm border dark:border-white/20 border-gray-200">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 dark:bg-gradient-to-br bg-gray-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.username ? (
                    profile.username.substring(0, 2).toUpperCase()
                  ) : (
                    <User2Icon className="w-10 h-10" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-1">
                {profile.username || "Owatchers"}
              </h2>
              <p className="dark:text-gray-300 text-gray-600 mb-2 text-sm font-mono">
                {address
                  ? `${address.substring(0, 6)}...${address.substring(
                      address.length - 4
                    )}`
                  : ""}
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  {profile.total_points.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-center text-sm dark:text-gray-400 text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dark:bg-white/5 dark:backdrop-blur-md bg-white rounded-xl p-6 shadow-sm border dark:border-white/20 border-gray-200 mt-6">
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="dark:text-gray-300 text-gray-600">
                  Videos Completed
                </span>
                <span className="font-semibold dark:text-white text-gray-900">
                  {stats.videosCompleted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-300 text-gray-600">
                  Total Points
                </span>
                <span className="font-semibold dark:text-white text-gray-900">
                  {stats.totalPoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="dark:bg-white/5 dark:backdrop-blur-md bg-white rounded-xl p-6 shadow-sm border dark:border-white/20 border-gray-200">
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    className="w-full px-3 py-2 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  />
                ) : (
                  <p className="dark:text-white text-gray-900">
                    {profile.username || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 dark:text-gray-400 text-gray-400" />
                  <p className="dark:text-white text-gray-900 text-sm font-mono">
                    {address || "Not connected"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Total Points
                </label>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <p className="dark:text-white text-gray-900 font-semibold">
                    {profile.total_points.toLocaleString()} OWATCH Points
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 dark:text-gray-400 text-gray-400" />
                  <p className="dark:text-white text-gray-900">
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
          <div className="dark:bg-white/5 dark:backdrop-blur-md bg-white rounded-xl p-6 shadow-sm border dark:border-white/20 border-gray-200 mt-6">
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-6">
              Account Settings
            </h3>
            <div className="space-y-4">
              {/* <div className="flex items-center justify-between p-4 border dark:border-gray-600 border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium dark:text-white text-gray-900">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm dark:text-gray-300 text-gray-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 text-sm">
                  Enable
                </button>
              </div> */}

              <div className="flex items-center justify-between p-4 border dark:border-gray-600 border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium dark:text-white text-gray-900">
                    Change Password
                  </h4>
                  <p className="text-sm dark:text-gray-300 text-gray-600">
                    Update your password regularly for security
                  </p>
                </div>
                <button className="px-4 py-2 border dark:border-gray-600 dark:hover:bg-gray-700/50 dark:text-white border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-300 text-sm">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border dark:border-gray-600 border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium dark:text-white text-gray-900">
                    Disconnect Wallet
                  </h4>
                  <p className="text-sm dark:text-gray-300 text-gray-600">
                    Safely disconnect your wallet from your account
                  </p>
                </div>
                <button className="px-4 py-2 border bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 text-sm">
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
