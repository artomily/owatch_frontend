// Utility functions for managing wallet-based user data in localStorage

export interface UserData {
  walletAddress: string;
  profileId: string;
  username?: string;
  totalPoints: number;
  lastSync: string;
}

// Key prefixes for localStorage
const KEYS = {
  WALLET_ADDRESS: "user_wallet_address",
  PROFILE_ID: "user_profile_id",
  USER_DATA: "owatch_user_data",
} as const;

// Save user data to localStorage
export const saveUserData = (userData: UserData): void => {
  try {
    localStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(KEYS.WALLET_ADDRESS, userData.walletAddress);
    localStorage.setItem(KEYS.PROFILE_ID, userData.profileId);
  } catch (error) {
    console.error("Failed to save user data to localStorage:", error);
  }
};

// Get user data from localStorage
export const getUserData = (): UserData | null => {
  try {
    const userDataString = localStorage.getItem(KEYS.USER_DATA);
    if (userDataString) {
      return JSON.parse(userDataString) as UserData;
    }

    // Fallback to individual keys for backward compatibility
    const walletAddress = localStorage.getItem(KEYS.WALLET_ADDRESS);
    const profileId = localStorage.getItem(KEYS.PROFILE_ID);

    if (walletAddress && profileId) {
      return {
        walletAddress,
        profileId,
        totalPoints: 0,
        lastSync: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to get user data from localStorage:", error);
    return null;
  }
};

// Clear all user data from localStorage
export const clearUserData = (): void => {
  try {
    localStorage.removeItem(KEYS.USER_DATA);
    localStorage.removeItem(KEYS.WALLET_ADDRESS);
    localStorage.removeItem(KEYS.PROFILE_ID);
  } catch (error) {
    console.error("Failed to clear user data from localStorage:", error);
  }
};

// Check if user is authenticated (has wallet data)
export const isUserAuthenticated = (currentWalletAddress?: string): boolean => {
  const userData = getUserData();

  if (!userData || !currentWalletAddress) {
    return false;
  }

  // Check if the current wallet matches the saved wallet
  return (
    userData.walletAddress.toLowerCase() === currentWalletAddress.toLowerCase()
  );
};

// Update user points in localStorage
export const updateUserPoints = (newPoints: number): void => {
  const userData = getUserData();
  if (userData) {
    userData.totalPoints = newPoints;
    userData.lastSync = new Date().toISOString();
    saveUserData(userData);
  }
};

// Get current wallet address from localStorage
export const getSavedWalletAddress = (): string | null => {
  try {
    return localStorage.getItem(KEYS.WALLET_ADDRESS);
  } catch (error) {
    console.error("Failed to get wallet address from localStorage:", error);
    return null;
  }
};

// Get current profile ID from localStorage
export const getSavedProfileId = (): string | null => {
  try {
    return localStorage.getItem(KEYS.PROFILE_ID);
  } catch (error) {
    console.error("Failed to get profile ID from localStorage:", error);
    return null;
  }
};
