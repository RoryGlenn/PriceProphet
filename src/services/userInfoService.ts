/*********************************************************************
 * userInfoService.ts
 *
 * Service for managing user profiles and system information.
 * Handles user identification, profile management, and system info collection.
 *
 * @module userInfoService
 *********************************************************************/

import { v4 } from 'uuid';

/**
 * System information collected for user identification
 * @interface SystemInfo
 */
export interface SystemInfo {
  /** Host domain name */
  hostname: string;
  /** Operating system platform */
  platform: string;
  /** Browser user agent string */
  userAgent: string;
  /** User's preferred language */
  language: string;
  /** User's timezone */
  timeZone: string;
  /** Screen resolution in format "widthxheight" */
  screenResolution: string;
  /** Timestamp of first visit */
  firstVisit: string;
  /** Timestamp of most recent visit */
  lastVisit: string;
}

/**
 * User profile information
 * @interface UserProfile
 */
export interface UserProfile {
  /** Unique identifier for the user */
  userId: string;
  /** Generated or custom username */
  username: string;
  /** System information associated with the user */
  systemInfo: SystemInfo;
}

/**
 * Storage keys used for user data in localStorage
 * @const {Object} STORAGE_KEYS
 */
const STORAGE_KEYS = {
  USER_PROFILE: 'priceProphet_userProfile',
};

/**
 * Generates a unique username based on system information
 * Format: [Platform]_[Timezone]_[RandomSuffix]
 * Example: Mac_PST_x7k9
 *
 * @param {SystemInfo} info - System information to base the username on
 * @returns {string} Generated username
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
 * Collects current system information for user identification
 * @returns {SystemInfo} Object containing system information
 */
const collectSystemInfo = (): SystemInfo => {
  const now = new Date().toISOString();

  return {
    hostname: window.location.hostname,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    firstVisit: now,
    lastVisit: now,
  };
};

export const userInfoService = {
  /**
   * Initializes a new user profile or retrieves an existing one
   * If a profile exists, updates the last visit timestamp
   * If no profile exists, creates a new one with system information
   *
   * @returns {UserProfile} The user's profile, either new or existing
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
   * Retrieves the current user's profile from localStorage
   * @returns {UserProfile | null} The user's profile or null if not found
   */
  getCurrentUser: (): UserProfile | null => {
    const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  },

  /**
   * Updates the user's profile with new information
   * @param {Partial<UserProfile>} updates - Partial profile updates to apply
   * @returns {UserProfile} Updated user profile
   * @throws {Error} If no user profile exists
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
   * Removes the user's profile from localStorage
   * Use this for logging out or clearing user data
   */
  clearProfile: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  },

  /**
   * Updates the last visit timestamp in the user's profile
   * Called automatically when retrieving or updating the profile
   *
   * @param {UserProfile} profile - The profile to update
   * @returns {UserProfile} Updated profile with new last visit timestamp
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
