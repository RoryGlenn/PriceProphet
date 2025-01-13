import { v4 } from 'uuid';

export interface SystemInfo {
  hostname: string;
  platform: string;
  userAgent: string;
  language: string;
  timeZone: string;
  screenResolution: string;
  firstVisit: string;
  lastVisit: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  systemInfo: SystemInfo;
}

const STORAGE_KEYS = {
  USER_PROFILE: 'priceProphet_userProfile',
};

/**
 * Generates a unique username based on system information
 */
const generateUsername = (info: SystemInfo): string => {
  const platformPrefix = info.platform.toLowerCase().startsWith('mac')
    ? 'Mac'
    : info.platform.toLowerCase().startsWith('win')
      ? 'Win'
      : 'User';

  // Get timezone abbreviation (e.g., PST, EST)
  const timezone = info.timeZone.split('/').pop() || 'GMT';

  // Create a random suffix
  const suffix = Math.random().toString(36).substring(2, 6);

  return `${platformPrefix}_${timezone}_${suffix}`;
};

/**
 * Collects system information
 */
// const collectSystemInfo = (): SystemInfo => {
//   const now = new Date().toISOString();

//   return {
//     hostname: window.location.hostname,
//     platform: navigator.platform,
//     userAgent: navigator.userAgent,
//     language: navigator.language,
//     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     screenResolution: `${window.screen.width}x${window.screen.height}`,
//     firstVisit: now,
//     lastVisit: now,
//   };
// };

export const userInfoService = {
  /**
   * Initializes or retrieves user profile
   */
  initializeUser: (): UserProfile => {
    const existingProfile = userInfoService.getCurrentUser();
    if (existingProfile) {
      return userInfoService.updateLastVisit(existingProfile);
    }

    // Default userId if generation fails
    const userId = v4() || 'default-user-' + Date.now();

    const systemInfo = {
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      hostname: window.location.hostname,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };

    // Create new profile
    const newProfile: UserProfile = {
      userId,
      username: generateUsername(systemInfo),
      systemInfo,
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
    return newProfile;
  },

  /**
   * Gets the current user's profile
   */
  getCurrentUser: (): UserProfile | null => {
    const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  },

  /**
   * Updates the user's profile
   */
  updateProfile: (updates: Partial<UserProfile>): UserProfile => {
    const currentProfile = userInfoService.getCurrentUser();
    if (!currentProfile) {
      throw new Error('No user profile found');
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      systemInfo: {
        ...currentProfile.systemInfo,
        lastVisit: new Date().toISOString(),
      },
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
    return updatedProfile;
  },

  /**
   * Clears the user's profile
   */
  clearProfile: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  },

  /**
   * Updates the last visit time of the user's profile
   */
  updateLastVisit: (profile: UserProfile): UserProfile => {
    const updatedProfile = {
      ...profile,
      systemInfo: {
        ...profile.systemInfo,
        lastVisit: new Date().toISOString(),
      },
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
    return updatedProfile;
  },
};
