import { userInfoService, UserProfile, SystemInfo } from '../services/userInfoService';
import * as uuid from 'uuid';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

describe('userInfoService', () => {
  // Mock localStorage
  const mockLocalStorage = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  // Mock system info
  const mockSystemInfo: SystemInfo = {
    hostname: 'test-host',
    platform: 'MacIntel',
    userAgent: 'test-agent',
    language: 'en-US',
    timeZone: 'America/Los_Angeles',
    screenResolution: '1920x1080',
    firstVisit: '2024-01-01T00:00:00.000Z',
    lastVisit: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });

    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T00:00:00.000Z');

    // Mock window properties
    Object.defineProperty(window, 'location', {
      value: { hostname: 'test-host' },
    });
    Object.defineProperty(window, 'navigator', {
      value: {
        platform: 'MacIntel',
        userAgent: 'test-agent',
        language: 'en-US',
      },
    });
    Object.defineProperty(window, 'screen', {
      value: {
        width: 1920,
        height: 1080,
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initializeUser', () => {
    it('should create a new user profile if none exists', () => {
      const profile = userInfoService.initializeUser();

      // Verify the profile has all required keys
      expect(profile).toMatchObject({
        userId: expect.any(String),
        username: expect.any(String),
        systemInfo: {
          hostname: expect.any(String),
          platform: expect.any(String),
          userAgent: expect.any(String),
          language: expect.any(String),
          timeZone: expect.any(String),
          screenResolution: expect.any(String),
          firstVisit: expect.any(String),
          lastVisit: expect.any(String),
        },
      });

      // Verify localStorage was called
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'priceProphet_userProfile',
        expect.any(String)
      );
    });

    it('should return existing profile and update lastVisit if profile exists', () => {
      const existingProfile: UserProfile = {
        userId: 'existing-uuid',
        username: 'existing-user',
        systemInfo: {
          ...mockSystemInfo,
          lastVisit: '2023-12-31T00:00:00.000Z',
        },
      };

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(existingProfile));

      const profile = userInfoService.initializeUser();

      expect(profile).toEqual({
        ...existingProfile,
        systemInfo: {
          ...existingProfile.systemInfo,
          lastVisit: '2024-01-01T00:00:00.000Z',
        },
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'priceProphet_userProfile',
        expect.any(String)
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return null if no profile exists', () => {
      const profile = userInfoService.getCurrentUser();
      expect(profile).toBeNull();
    });

    it('should return existing profile', () => {
      const existingProfile: UserProfile = {
        userId: 'existing-uuid',
        username: 'existing-user',
        systemInfo: mockSystemInfo,
      };

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(existingProfile));

      const profile = userInfoService.getCurrentUser();
      expect(profile).toEqual(existingProfile);
    });
  });

  describe('updateProfile', () => {
    it('should throw error if no profile exists', () => {
      expect(() => userInfoService.updateProfile({ username: 'new-username' })).toThrow(
        'No user profile found'
      );
    });

    it('should update existing profile and maintain other fields', () => {
      const existingProfile: UserProfile = {
        userId: 'existing-uuid',
        username: 'old-username',
        systemInfo: mockSystemInfo,
      };

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(existingProfile));

      const updatedProfile = userInfoService.updateProfile({ username: 'new-username' });

      expect(updatedProfile).toEqual({
        ...existingProfile,
        username: 'new-username',
        systemInfo: {
          ...mockSystemInfo,
          lastVisit: '2024-01-01T00:00:00.000Z',
        },
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'priceProphet_userProfile',
        expect.any(String)
      );
    });
  });

  describe('clearProfile', () => {
    it('should remove the profile from localStorage', () => {
      userInfoService.clearProfile();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('priceProphet_userProfile');
    });
  });
});
