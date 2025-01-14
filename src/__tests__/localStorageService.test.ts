import { GameResult, DifficultyLevel } from '../types';
import { localStorageService } from '../services/localStorageService';
import { userInfoService } from '../services/userInfoService';

// Mock userInfoService
jest.mock('../services/userInfoService', () => ({
  userInfoService: {
    getCurrentUser: jest.fn(),
    initializeUser: jest.fn(),
    clearProfile: jest.fn(),
  },
}));

describe('localStorageService', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  };

  // Setup mock data
  const mockUser = {
    userId: 'test-user-1',
    username: 'TestUser',
  };

  const mockGameData: Omit<GameResult, 'userId' | 'username' | 'timestamp'> = {
    difficulty: 'Medium' as DifficultyLevel,
    score: 100,
    guesses: [
      {
        timestamp: new Date('2024-01-01'),
        price: 50000,
        correct: true,
      },
    ],
    finalPrice: 50000,
    startPrice: 45000,
    timeInterval: '1h',
    success: true,
    totalTime: 120,
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup localStorage mock implementation
    let store: { [key: string]: string } = {};
    localStorageMock.getItem.mockImplementation((key: string) => store[key] || null);
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      store[key] = value;
    });
    localStorageMock.removeItem.mockImplementation((key: string) => {
      delete store[key];
    });
    localStorageMock.clear.mockImplementation(() => {
      store = {};
    });

    // Replace global localStorage
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Setup default user
    (userInfoService.getCurrentUser as jest.Mock).mockReturnValue(mockUser);

    // Initialize empty games array
    localStorageMock.setItem('priceProphet_games', '[]');
  });

  describe('saveGame', () => {
    it('should save a new game with user info', () => {
      // Mock the current date
      const mockDate = new Date('2024-01-01T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const savedGame = localStorageService.saveGame(mockGameData);

      // Verify the returned game object
      expect(savedGame).toMatchObject({
        ...mockGameData,
        userId: mockUser.userId,
        username: mockUser.username,
      });
      expect(savedGame.timestamp).toEqual(mockDate);

      // Verify localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'priceProphet_games',
        expect.any(String)
      );

      // Parse and verify the saved data
      const savedGamesStr = localStorageMock.getItem('priceProphet_games');
      expect(savedGamesStr).toBeDefined();

      const savedGames = JSON.parse(savedGamesStr || '[]');
      expect(savedGames).toHaveLength(1);

      const savedGameData = savedGames[0];
      expect(savedGameData).toMatchObject({
        difficulty: mockGameData.difficulty,
        score: mockGameData.score,
        finalPrice: mockGameData.finalPrice,
        startPrice: mockGameData.startPrice,
        timeInterval: mockGameData.timeInterval,
        success: mockGameData.success,
        totalTime: mockGameData.totalTime,
        userId: mockUser.userId,
        username: mockUser.username,
      });

      // Verify the guesses array
      expect(savedGameData.guesses).toHaveLength(1);
      expect(savedGameData.guesses[0]).toMatchObject({
        price: mockGameData.guesses[0].price,
        correct: mockGameData.guesses[0].correct,
      });

      // Clean up
      jest.useRealTimers();
    });

    it('should initialize user if no current user exists', () => {
      // Mock the current date
      const mockDate = new Date('2024-01-01T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      // Setup mocks for this test case
      (userInfoService.getCurrentUser as jest.Mock).mockReturnValue(null);
      (userInfoService.initializeUser as jest.Mock).mockReturnValue(mockUser);

      const savedGame = localStorageService.saveGame(mockGameData);

      // Verify user was initialized
      expect(userInfoService.initializeUser).toHaveBeenCalled();

      // Verify the game was saved with initialized user info
      expect(savedGame).toMatchObject({
        ...mockGameData,
        userId: mockUser.userId,
        username: mockUser.username,
      });

      // Clean up
      jest.useRealTimers();
    });
  });

  describe('getUserGames', () => {
    it('should return user games sorted by timestamp', () => {
      // Create test games with different timestamps
      const games = [
        {
          ...mockGameData,
          userId: mockUser.userId,
          username: mockUser.username,
          score: 100,
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
        {
          ...mockGameData,
          userId: mockUser.userId,
          username: mockUser.username,
          score: 200,
          timestamp: new Date('2024-01-02T12:00:00Z'),
        },
      ];

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const userGames = localStorageService.getUserGames();

      expect(userGames).toHaveLength(2);
      expect(userGames[0].score).toBe(200); // Most recent game first
      expect(userGames[1].score).toBe(100);
      expect(new Date(userGames[0].timestamp).getTime()).toBeGreaterThan(
        new Date(userGames[1].timestamp).getTime()
      );
    });

    it('should return only current user games', () => {
      // Create test games for different users
      const games = [
        {
          ...mockGameData,
          userId: mockUser.userId,
          username: mockUser.username,
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
        {
          ...mockGameData,
          userId: 'other-user',
          username: 'OtherUser',
          timestamp: new Date('2024-01-02T12:00:00Z'),
        },
      ];

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const userGames = localStorageService.getUserGames();

      expect(userGames).toHaveLength(1);
      expect(userGames[0].userId).toBe(mockUser.userId);
      expect(userGames[0].username).toBe(mockUser.username);
    });

    it('should return at most 10 most recent games', () => {
      // Create 15 test games for the current user
      const games = Array.from({ length: 15 }, (_, i) => ({
        ...mockGameData,
        userId: mockUser.userId,
        username: mockUser.username,
        score: (i + 1) * 100,
        timestamp: new Date(`2024-01-${(i + 1).toString().padStart(2, '0')}T12:00:00Z`),
      }));

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const userGames = localStorageService.getUserGames();

      expect(userGames).toHaveLength(10); // Only returns last 10 games
      expect(userGames[0].score).toBe(1500); // Most recent game first
      expect(userGames[9].score).toBe(600); // Oldest game in the returned set
    });
  });

  describe('getUserStats', () => {
    it('should return default stats for new user', () => {
      // No games in localStorage (using empty array from beforeEach)
      const stats = localStorageService.getUserStats();

      expect(stats).toEqual({
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        successRate: 0,
        averageTime: 0,
      });
    });

    it('should calculate correct stats for user games', () => {
      // Create test games with various scores and success states
      const games = [
        {
          ...mockGameData,
          userId: mockUser.userId,
          username: mockUser.username,
          score: 100,
          success: true,
          totalTime: 120,
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
        {
          ...mockGameData,
          userId: mockUser.userId,
          username: mockUser.username,
          score: 50,
          success: false,
          totalTime: 180,
          timestamp: new Date('2024-01-02T12:00:00Z'),
        },
        {
          ...mockGameData,
          userId: mockUser.userId,
          username: mockUser.username,
          score: 150,
          success: true,
          totalTime: 90,
          timestamp: new Date('2024-01-03T12:00:00Z'),
        },
      ];

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const stats = localStorageService.getUserStats();

      expect(stats).toEqual({
        totalGames: 3,
        averageScore: 100, // (100 + 50 + 150) / 3
        highestScore: 150,
        successRate: (2 / 3) * 100, // 2 successful games out of 3
        averageTime: 130, // (120 + 180 + 90) / 3
      });
    });

    it('should only include current user games in stats', () => {
      // Create test games for multiple users
      const games = [
        {
          ...mockGameData,
          userId: mockUser.userId,
          username: mockUser.username,
          score: 100,
          success: true,
          totalTime: 120,
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
        {
          ...mockGameData,
          userId: 'other-user',
          username: 'OtherUser',
          score: 200, // This score should not affect stats
          success: true,
          totalTime: 60,
          timestamp: new Date('2024-01-02T12:00:00Z'),
        },
      ];

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const stats = localStorageService.getUserStats();

      expect(stats).toEqual({
        totalGames: 1,
        averageScore: 100,
        highestScore: 100,
        successRate: 100,
        averageTime: 120,
      });
    });
  });

  describe('getLeaderboard', () => {
    it('should return empty array when no games exist', () => {
      const leaderboard = localStorageService.getLeaderboard();
      expect(leaderboard).toEqual([]);
    });

    it('should return top 10 users sorted by highest score', () => {
      // Create games for multiple users with different scores
      const games = Array.from({ length: 15 }, (_, i) => ({
        ...mockGameData,
        userId: `user-${i}`,
        username: `User ${i}`,
        score: (i + 1) * 100,
        timestamp: new Date(`2024-01-${(i + 1).toString().padStart(2, '0')}T12:00:00Z`),
      }));

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const leaderboard = localStorageService.getLeaderboard();

      expect(leaderboard).toHaveLength(10); // Only top 10 users
      expect(leaderboard[0].highestScore).toBe(1500); // Highest score first
      expect(leaderboard[9].highestScore).toBe(600); // 10th highest score
      expect(leaderboard[0].userId).toBe('user-14'); // User with highest score
      expect(leaderboard[9].userId).toBe('user-5'); // User with 10th highest score
    });

    it('should aggregate multiple games per user', () => {
      // Create multiple games for the same users with different scores
      const games = [
        // User 1's games
        {
          ...mockGameData,
          userId: 'user-1',
          username: 'User 1',
          score: 100,
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
        {
          ...mockGameData,
          userId: 'user-1',
          username: 'User 1',
          score: 150,
          timestamp: new Date('2024-01-02T12:00:00Z'),
        },
        // User 2's games
        {
          ...mockGameData,
          userId: 'user-2',
          username: 'User 2',
          score: 80,
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
        {
          ...mockGameData,
          userId: 'user-2',
          username: 'User 2',
          score: 120,
          timestamp: new Date('2024-01-02T12:00:00Z'),
        },
      ];

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const leaderboard = localStorageService.getLeaderboard();

      expect(leaderboard).toHaveLength(2);

      // Check User 1's aggregated stats
      expect(leaderboard[0]).toEqual({
        userId: 'user-1',
        username: 'User 1',
        highestScore: 150,
        totalGames: 2,
        averageScore: 125, // (100 + 150) / 2
      });

      // Check User 2's aggregated stats
      expect(leaderboard[1]).toEqual({
        userId: 'user-2',
        username: 'User 2',
        highestScore: 120,
        totalGames: 2,
        averageScore: 100, // (80 + 120) / 2
      });
    });

    it('should handle users with same highest score', () => {
      const games = [
        // User 1's games
        {
          ...mockGameData,
          userId: 'user-1',
          username: 'User 1',
          score: 100,
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
        // User 2's games
        {
          ...mockGameData,
          userId: 'user-2',
          username: 'User 2',
          score: 100,
          timestamp: new Date('2024-01-02T12:00:00Z'),
        },
      ];

      // Store games in localStorage
      localStorageMock.setItem('priceProphet_games', JSON.stringify(games));

      const leaderboard = localStorageService.getLeaderboard();

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].highestScore).toBe(100);
      expect(leaderboard[1].highestScore).toBe(100);
      expect(leaderboard[0].averageScore).toBe(100);
      expect(leaderboard[1].averageScore).toBe(100);
    });
  });
});
