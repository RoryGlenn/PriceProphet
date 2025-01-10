/*********************************************************************
 * types.ts
 *
 * Core type definitions used throughout the application.
 * These types define the structure of OHLC (Open, High, Low, Close) data
 * and ensure consistent data handling across components.
 *********************************************************************/

import { Time } from 'lightweight-charts';

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
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
