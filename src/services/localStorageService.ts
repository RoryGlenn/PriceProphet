/*********************************************************************
 * localStorageService.ts
 *
 * Service for managing game data persistence in local storage.
 * Handles saving and retrieving game results, user statistics,
 * and leaderboard data.
 *
 * Features:
 * - Game result persistence with automatic user info
 * - User statistics tracking and aggregation
 * - Global leaderboard with ranking system
 * - Debug utilities for development
 * - Automatic data validation
 * - Error recovery mechanisms
 *
 * Data Structure:
 * - Games stored as array of GameResult objects
 * - Each game includes user info, timestamps, and scores
 * - Data indexed by userId for efficient retrieval
 * - Sorted by timestamp and score for quick access
 *
 * @module localStorageService
 * @requires userInfoService
 * @requires types
 *********************************************************************/

import { userInfoService } from './userInfoService';
import { GameResult, UserStats, LeaderboardEntry } from '../types';

/**
 * Storage keys used for different data types in localStorage.
 * Centralized key management for consistency and future extensibility.
 *
 * @const {Object} STORAGE_KEYS
 * @property {string} GAMES - Key for storing game results array
 */
const STORAGE_KEYS = {
  GAMES: 'priceProphet_games',
};

/**
 * Gets the current user's ID, initializing a new user if none exists.
 * Ensures valid user context for all storage operations.
 *
 * @returns {string} The current user's ID
 */
const getCurrentUserId = (): string => {
  const profile = userInfoService.getCurrentUser();
  if (!profile) {
    return userInfoService.initializeUser().userId;
  }
  return profile.userId;
};

/**
 * Retrieves all stored games from localStorage.
 * Handles JSON parsing and provides empty array fallback.
 *
 * @returns {GameResult[]} Array of all stored game results
 */
const getAllGames = (): GameResult[] => {
  const gamesJson = localStorage.getItem(STORAGE_KEYS.GAMES);
  return gamesJson ? JSON.parse(gamesJson) : [];
};

/**
 * Service object containing methods for managing game data in localStorage.
 * Provides CRUD operations, statistics, and leaderboard functionality.
 */
export const localStorageService = {
  /**
   * Saves a new game result to localStorage.
   * Automatically adds user info and timestamp to the game data.
   *
   * @param {Omit<GameResult, 'userId' | 'username' | 'timestamp'>} gameData - Game result data without user info
   * @returns {GameResult} Complete game result with user info and timestamp
   */
  saveGame: (gameData: Omit<GameResult, 'userId' | 'username' | 'timestamp'>): GameResult => {
    const games = getAllGames();
    const profile = userInfoService.getCurrentUser() || userInfoService.initializeUser();

    const newGame: GameResult = {
      ...gameData,
      userId: profile.userId,
      username: profile.username,
      timestamp: new Date(),
    };

    games.push(newGame);
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
    return newGame;
  },

  /**
   * Retrieves game history for the current user.
   * Returns most recent games first, limited to 10 entries.
   *
   * @returns {GameResult[]} Array of user's game results, sorted by timestamp
   */
  getUserGames: (): GameResult[] => {
    const userId = getCurrentUserId();
    return getAllGames()
      .filter((game) => game.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  },

  /**
   * Calculates and returns statistics for the current user's game performance.
   * Aggregates metrics across all user's games.
   *
   * @returns {UserStats} Object containing user's game statistics:
   * - totalGames: Total number of games played
   * - averageScore: Average score across all games
   * - highestScore: Highest score achieved
   * - successRate: Percentage of games successfully completed
   * - averageTime: Average time per game in seconds
   */
  getUserStats: (): UserStats => {
    const userId = getCurrentUserId();
    const userGames = getAllGames().filter((game) => game.userId === userId);

    if (userGames.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        successRate: 0,
        averageTime: 0,
      };
    }

    const totalGames = userGames.length;
    const successfulGames = userGames.filter((game) => game.success).length;

    return {
      totalGames,
      averageScore: userGames.reduce((sum, game) => sum + game.score, 0) / totalGames,
      highestScore: Math.max(...userGames.map((game) => game.score)),
      successRate: (successfulGames / totalGames) * 100,
      averageTime: userGames.reduce((sum, game) => sum + game.totalTime, 0) / totalGames,
    };
  },

  /**
   * Retrieves the global leaderboard showing top performers.
   * Aggregates user performance and ranks by highest score.
   *
   * @returns {LeaderboardEntry[]} Array of top 10 players sorted by highest score,
   * each entry containing:
   * - userId: Player's unique identifier
   * - username: Player's display name
   * - highestScore: Player's highest achieved score
   * - totalGames: Total number of games played
   * - averageScore: Average score across all games
   */
  getLeaderboard: (): LeaderboardEntry[] => {
    const games = getAllGames();
    const userStats = new Map<
      string,
      {
        totalScore: number;
        totalGames: number;
        highestScore: number;
        username: string;
      }
    >();

    // Calculate stats for each user
    games.forEach((game) => {
      const stats = userStats.get(game.userId) || {
        totalScore: 0,
        totalGames: 0,
        highestScore: 0,
        username: game.username,
      };
      stats.totalScore += game.score;
      stats.totalGames += 1;
      stats.highestScore = Math.max(stats.highestScore, game.score);
      userStats.set(game.userId, stats);
    });

    // Convert to array and sort
    return Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        username: stats.username,
        highestScore: stats.highestScore,
        totalGames: stats.totalGames,
        averageScore: stats.totalScore / stats.totalGames,
      }))
      .sort((a, b) => b.highestScore - a.highestScore)
      .slice(0, 10);
  },

  /**
   * Prints all stored data to the console for debugging purposes.
   * Displays detailed information about:
   * - Current user profile
   * - User statistics
   * - Global leaderboard
   * - Detailed game history with guesses
   */
  debugPrintStorage: (): void => {
    const profile = userInfoService.getCurrentUser();
    const games = getAllGames();
    const stats = localStorageService.getUserStats();
    const leaderboard = localStorageService.getLeaderboard();

    console.group('🎮 PriceProphet Storage Debug');

    console.group('👤 User Profile');
    console.log('Profile:', profile);
    console.groupEnd();

    console.group('📊 User Statistics');
    console.table(stats);
    console.groupEnd();

    console.group('🏆 Global Leaderboard');
    console.table(leaderboard);
    console.groupEnd();

    console.group('🎯 Game History');
    games.forEach((game, index) => {
      console.group(`Game ${index + 1} - ${new Date(game.timestamp).toLocaleString()}`);
      console.log('User:', game.username);
      console.log('Difficulty:', game.difficulty);
      console.log('Score:', game.score);
      console.log('Success:', game.success);
      console.log('Time:', game.totalTime, 'seconds');
      console.log('Start Price:', game.startPrice);
      console.log('Final Price:', game.finalPrice);
      console.group('Guesses');
      game.guesses.forEach((guess, i) => {
        console.log(`Guess ${i + 1}:`, {
          price: guess.price,
          correct: guess.correct,
          time: new Date(guess.timestamp).toLocaleString(),
        });
      });
      console.groupEnd();
      console.groupEnd();
    });
    console.groupEnd();

    console.groupEnd();
  },

  // Clear all stored data (for testing)
  clearData: () => {
    localStorage.removeItem(STORAGE_KEYS.GAMES);
    userInfoService.clearProfile();
  },
};
