/*********************************************************************
 * types.ts
 *
 * Core type definitions used throughout the application.
 * These types define the structure of OHLC (Open, High, Low, Close) data
 * and ensure consistent data handling across components.
 *********************************************************************/

import { Time } from 'lightweight-charts';

/** Time intervals supported by the chart */
export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | 'D' | 'W' | 'M';

/** Minutes per interval mapping */
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
 */
export interface RandomOhlcConfig {
  daysNeeded: number; // Number of days of data to generate
  startPrice: number; // Initial price to start the simulation
  volatility: number; // Price volatility factor (0-1)
  drift: number; // Price trend factor (-1 to 1)
}

/**
 * OHLC data structure required by the charting library.
 * This format is compatible with lightweight-charts' requirements:
 * - For intraday data: time is a Unix timestamp
 * - For daily+ data: time is a 'yyyy-MM-dd' string
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
 */
export interface OhlcRow {
  timestamp: number; // Unix timestamp in seconds
  open: number; // Opening price of the period
  high: number; // Highest price during the period
  low: number; // Lowest price during the period
  close: number; // Closing price of the period
}

/**
 * Game difficulty levels.
 * - easy: Predict 1 day into the future
 * - medium: Predict 7 days into the future
 * - hard: Predict 30 days into the future
 */
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

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

export interface UserStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  successRate: number;
  averageTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  highestScore: number;
  totalGames: number;
  averageScore: number;
}
