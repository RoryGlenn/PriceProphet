import {
  MINUTES_PER_INTERVAL,
  TimeInterval,
  OhlcBar,
  OhlcData,
  OhlcRow,
  GameResult,
  UserStats,
  LeaderboardEntry,
} from '../types';

describe('types', () => {
  describe('MINUTES_PER_INTERVAL', () => {
    it('should have correct minute values for each interval', () => {
      expect(MINUTES_PER_INTERVAL['1m']).toBe(1);
      expect(MINUTES_PER_INTERVAL['5m']).toBe(5);
      expect(MINUTES_PER_INTERVAL['15m']).toBe(15);
      expect(MINUTES_PER_INTERVAL['1h']).toBe(60);
      expect(MINUTES_PER_INTERVAL['4h']).toBe(240);
      expect(MINUTES_PER_INTERVAL.D).toBe(1440);
      expect(MINUTES_PER_INTERVAL.W).toBe(1440 * 7);
      expect(MINUTES_PER_INTERVAL.M).toBe(1440 * 30);
    });

    it('should have all required interval mappings', () => {
      const expectedIntervals: TimeInterval[] = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'];
      expectedIntervals.forEach((interval) => {
        expect(MINUTES_PER_INTERVAL[interval]).toBeDefined();
        expect(typeof MINUTES_PER_INTERVAL[interval]).toBe('number');
      });
    });
  });

  describe('Type Definitions', () => {
    it('should correctly type OhlcData', () => {
      const validOhlcData: OhlcData = {
        time: [1234567890],
        open: [100],
        high: [110],
        low: [90],
        close: [105],
      };
      expect(validOhlcData).toBeDefined();
      expect(Array.isArray(validOhlcData.time)).toBe(true);
      expect(Array.isArray(validOhlcData.open)).toBe(true);
      expect(Array.isArray(validOhlcData.high)).toBe(true);
      expect(Array.isArray(validOhlcData.low)).toBe(true);
      expect(Array.isArray(validOhlcData.close)).toBe(true);
    });

    it('should correctly type OhlcBar', () => {
      const validOhlcBar: OhlcBar = {
        time: 1234567890,
        open: 100,
        high: 110,
        low: 90,
        close: 105,
      };
      expect(validOhlcBar).toBeDefined();
      expect(typeof validOhlcBar.open).toBe('number');
      expect(typeof validOhlcBar.high).toBe('number');
      expect(typeof validOhlcBar.low).toBe('number');
      expect(typeof validOhlcBar.close).toBe('number');

      const validOhlcBarWithDateString: OhlcBar = {
        time: '2024-01-01',
        open: 100,
        high: 110,
        low: 90,
        close: 105,
      };
      expect(validOhlcBarWithDateString).toBeDefined();
      expect(typeof validOhlcBarWithDateString.time).toBe('string');
    });

    it('should correctly type OhlcRow', () => {
      const validOhlcRow: OhlcRow = {
        timestamp: 1234567890,
        open: 100,
        high: 110,
        low: 90,
        close: 105,
      };
      expect(validOhlcRow).toBeDefined();
      expect(typeof validOhlcRow.timestamp).toBe('number');
      expect(typeof validOhlcRow.open).toBe('number');
      expect(typeof validOhlcRow.high).toBe('number');
      expect(typeof validOhlcRow.low).toBe('number');
      expect(typeof validOhlcRow.close).toBe('number');
    });

    it('should correctly type GameResult', () => {
      const validGameResult: GameResult = {
        userId: 'test-user',
        username: 'TestUser',
        difficulty: 'Medium',
        score: 100,
        guesses: [
          {
            timestamp: new Date(),
            price: 100,
            correct: true,
          },
        ],
        finalPrice: 105,
        startPrice: 100,
        timeInterval: '1h',
        success: true,
        totalTime: 120,
        timestamp: new Date(),
      };
      expect(validGameResult).toBeDefined();
      expect(Array.isArray(validGameResult.guesses)).toBe(true);
      expect(validGameResult.guesses[0].timestamp instanceof Date).toBe(true);
      expect(validGameResult.timestamp instanceof Date).toBe(true);
    });

    it('should correctly type UserStats', () => {
      const validUserStats: UserStats = {
        totalGames: 10,
        averageScore: 85.5,
        highestScore: 100,
        successRate: 80,
        averageTime: 120,
      };
      expect(validUserStats).toBeDefined();
      expect(typeof validUserStats.totalGames).toBe('number');
      expect(typeof validUserStats.averageScore).toBe('number');
      expect(typeof validUserStats.highestScore).toBe('number');
      expect(typeof validUserStats.successRate).toBe('number');
      expect(typeof validUserStats.averageTime).toBe('number');
    });

    it('should correctly type LeaderboardEntry', () => {
      const validLeaderboardEntry: LeaderboardEntry = {
        userId: 'test-user',
        username: 'TestUser',
        highestScore: 100,
        totalGames: 10,
        averageScore: 85.5,
      };
      expect(validLeaderboardEntry).toBeDefined();
      expect(typeof validLeaderboardEntry.userId).toBe('string');
      expect(typeof validLeaderboardEntry.username).toBe('string');
      expect(typeof validLeaderboardEntry.highestScore).toBe('number');
      expect(typeof validLeaderboardEntry.totalGames).toBe('number');
      expect(typeof validLeaderboardEntry.averageScore).toBe('number');
    });
  });
});
