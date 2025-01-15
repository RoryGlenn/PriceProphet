/*********************************************************************
 * userInfoService.ts
 *
 * Service for managing user profiles and system information.
 * Handles user identification, profile management, and system info collection.
 *
 * Features:
 * - Anonymous user identification
 * - Automatic profile generation
 * - System fingerprinting
 * - Visit tracking
 * - Profile persistence
 * - Cross-session user recognition
 *
 * User Identification Strategy:
 * 1. Generate unique UUID for new users
 * 2. Collect system information for fingerprinting
 * 3. Create human-readable username from system info
 * 4. Store profile in localStorage
 * 5. Track visit timestamps
 *
 * Privacy Considerations:
 * - No personal data collection
 * - System info used only for identification
 * - Local storage only, no server transmission
 * - Clearable user data
 *
 * @module userInfoService
 * @requires uuid
 *********************************************************************/

import { v4 } from 'uuid';

/**
 * System information collected for user identification.
 * Used to create a unique fingerprint and readable username.
 * All fields are non-sensitive system properties.
 *
 * @interface SystemInfo
 */
export interface SystemInfo {
  /** Host domain name of the application */
  hostname: string;
  /** Operating system platform identifier */
  platform: string;
  /** Browser user agent string for system identification */
  userAgent: string;
  /** User's system language setting */
  language: string;
  /** User's system timezone */
  timeZone: string;
  /** Display resolution for system fingerprinting */
  screenResolution: string;
  /** ISO timestamp of first system access */
  firstVisit: string;
  /** ISO timestamp of most recent access */
  lastVisit: string;
}

/**
 * User profile information structure.
 * Contains user identifiers and system details.
 * Used for game history tracking and leaderboard display.
 *
 * @interface UserProfile
 */
export interface UserProfile {
  /** UUID v4 unique identifier */
  userId: string;
  /** Human-readable auto-generated username */
  username: string;
  /** Collected system information for identification */
  systemInfo: SystemInfo;
}

/**
 * Storage keys used for user data in localStorage.
 * Centralized key management for consistency.
 *
 * @const {Object} STORAGE_KEYS
 * @property {string} USER_PROFILE - Key for storing user profile data
 */
const STORAGE_KEYS = {
  USER_PROFILE: 'priceProphet_userProfile',
};

/**
 * Generates a unique username based on system information.
 * Creates human-readable identifier from platform and timezone.
 * Format: [Platform]_[Timezone]_[RandomSuffix]
 * Example: Mac_PST_x7k9
 *
 * Process:
 * 1. Extract platform prefix (Mac/Win/User)
 * 2. Get timezone abbreviation
 * 3. Add random suffix for uniqueness
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
 * Collects current system information for user identification.
 * Gathers non-sensitive system properties for fingerprinting.
 * All data is stored locally and used only for identification.
 *
 * Collected Properties:
 * - Hostname: Current domain
 * - Platform: OS identifier
 * - User Agent: Browser information
 * - Language: System language
 * - Timezone: System timezone
 * - Screen Resolution: Display dimensions
 * - Visit Timestamps: First and last visit
 *
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

/**
 * Service object for managing user profiles and system information.
 * Provides methods for profile creation, retrieval, and updates.
 */
export const userInfoService = {
  /**
   * Initializes a new user profile or retrieves an existing one.
   * Creates new profile if none exists, updates last visit if found.
   *
   * Profile Creation Process:
   * 1. Check for existing profile
   * 2. Generate UUID for new users
   * 3. Collect system information
   * 4. Generate username
   * 5. Store in localStorage
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
   * Retrieves the current user's profile from localStorage.
   * Returns null if no profile exists.
   * Used for checking user existence and profile access.
   *
   * @returns {UserProfile | null} The user's profile or null if not found
   */
  getCurrentUser: (): UserProfile | null => {
    const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  },

  /**
   * Updates the user's profile with new information.
   * Merges provided updates with existing profile data.
   * Automatically updates last visit timestamp.
   *
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
   * Removes the user's profile from localStorage.
   * Complete data cleanup for privacy and testing.
   * Use for user logout or data reset.
   */
  clearProfile: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  },

  /**
   * Updates the last visit timestamp in the user's profile.
   * Called automatically during profile access and updates.
   * Tracks user activity timestamps.
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
