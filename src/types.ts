/*********************************************************************
 * types.ts
 *
 * Core type definitions used throughout the application.
 * These types define the structure of OHLC (Open, High, Low, Close) data
 * and ensure consistent data handling across components.
 *
 * @module types
 * @description Core type definitions for the PriceProphet application
 *********************************************************************/

import { Time } from 'lightweight-charts';

/**
 * Time intervals supported by the chart.
 * - 1m: 1 minute
 * - 5m: 5 minutes
 * - 15m: 15 minutes
 * - 1h: 1 hour
 * - 4h: 4 hours
 * - D: Daily
 * - W: Weekly
 * - M: Monthly
 */
export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | 'D' | 'W' | 'M';

/**
 * Minutes per interval mapping.
 * Maps each time interval to its equivalent in minutes for easy conversion.
 * Monthly intervals are approximated using 30 days.
 */
export const MINUTES_PER_INTERVAL: Record<TimeInterval, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  D: 1440,
  W: 1440 * 7,
  M: 1440 * 30,
} as const;

/**
 * Raw OHLC data structure used internally.
 * This format is used by the RandomOHLC class for data generation
 * and manipulation before being converted to OhlcBar format for display.
 *
 * @interface OhlcData
 * @property {number[]} time - Array of Unix timestamps in seconds
 * @property {number[]} open - Array of opening prices for each period
 * @property {number[]} high - Array of highest prices reached in each period
 * @property {number[]} low - Array of lowest prices reached in each period
 * @property {number[]} close - Array of closing prices for each period
 */
export interface OhlcData {
  time: number[]; // Array of Unix timestamps in seconds
  open: number[]; // Array of opening prices
  high: number[]; // Array of highest prices
  low: number[]; // Array of lowest prices
  close: number[]; // Array of closing prices
}

/**
 * Configuration options for the RandomOHLC class.
 * These parameters control the behavior of the price simulation.
 *
 * @interface RandomOhlcConfig
 * @property {number} daysNeeded - Number of days of data to generate
 * @property {number} startPrice - Initial price to start the simulation
 * @property {number} volatility - Price volatility factor (0-1), higher values create more price movement
 * @property {number} drift - Price trend factor (-1 to 1), negative for downtrend, positive for uptrend
 */
export interface RandomOhlcConfig {
  daysNeeded: number; // Number of days of data to generate
  startPrice: number; // Initial price to start the simulation
  volatility: number; // Price volatility factor (0-1)
  drift: number; // Price trend factor (-1 to 1)
}

/**
 * OHLC data structure required by the charting library.
 * This format is compatible with lightweight-charts' requirements.
 *
 * @interface OhlcBar
 * @property {Time} time - Either Unix timestamp (for intraday) or 'yyyy-MM-dd' string (for daily+)
 * @property {number} open - Opening price of the period
 * @property {number} high - Highest price during the period
 * @property {number} low - Lowest price during the period
 * @property {number} close - Closing price of the period
 */
export interface OhlcBar {
  time: Time; // Either Unix timestamp or date string
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
}

/**
 * Single row of OHLC data used internally.
 * This format represents a single time period's price data
 * and is used for data manipulation before display.
 *
 * @interface OhlcRow
 * @property {number} timestamp - Unix timestamp in seconds
 * @property {number} open - Opening price of the period
 * @property {number} high - Highest price during the period
 * @property {number} low - Lowest price during the period
 * @property {number} close - Closing price of the period
 */
export interface OhlcRow {
  timestamp: number; // Unix timestamp in seconds
  open: number; // Opening price of the period
  high: number; // Highest price during the period
  low: number; // Lowest price during the period
  close: number; // Closing price of the period
}

/**
 * Game difficulty levels and their corresponding prediction timeframes.
 * Each level requires predicting price movement over a different time period:
 * - Easy: Predict 1 day into the future
 * - Medium: Predict 7 days into the future
 * - Hard: Predict 30 days into the future
 */
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

/**
 * Represents the result of a completed game session.
 * Stores all relevant information about the game including user performance,
 * game settings, and prediction accuracy.
 *
 * @interface GameResult
 * @property {string} userId - Unique identifier for the player
 * @property {string} username - Display name of the player
 * @property {DifficultyLevel} difficulty - Selected game difficulty
 * @property {number} score - Final score achieved in the game
 * @property {Array<Object>} guesses - Array of player predictions and their outcomes
 * @property {number} finalPrice - Actual final price at the end of prediction period
 * @property {number} startPrice - Initial price at the start of the game
 * @property {string} timeInterval - Time interval used for the chart
 * @property {boolean} success - Whether the player successfully completed the game
 * @property {number} totalTime - Total time spent playing in seconds
 * @property {Date} timestamp - When the game was played
 */
export interface GameResult {
  userId: string;
  username: string;
  difficulty: DifficultyLevel;
  score: number;
  guesses: Array<{
    timestamp: Date;
    price: number;
    correct: boolean;
  }>;
  finalPrice: number;
  startPrice: number;
  timeInterval: string;
  success: boolean;
  totalTime: number;
  timestamp: Date;
}

/**
 * User statistics aggregated from their game history.
 * Provides an overview of the player's performance across all games.
 *
 * @interface UserStats
 * @property {number} totalGames - Total number of games played
 * @property {number} averageScore - Average score across all games
 * @property {number} highestScore - Highest score achieved
 * @property {number} successRate - Percentage of games successfully completed
 * @property {number} averageTime - Average time per game in seconds
 */
export interface UserStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  successRate: number;
  averageTime: number;
}

/**
 * Entry in the game's leaderboard.
 * Contains summarized player performance metrics for ranking.
 *
 * @interface LeaderboardEntry
 * @property {string} userId - Unique identifier for the player
 * @property {string} username - Display name of the player
 * @property {number} highestScore - Player's highest achieved score
 * @property {number} totalGames - Total number of games played
 * @property {number} averageScore - Average score across all games
 */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  highestScore: number;
  totalGames: number;
  averageScore: number;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}
