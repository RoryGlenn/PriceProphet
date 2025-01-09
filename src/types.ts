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
  time: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
}

export interface RandomOhlcConfig {
  daysNeeded: number;
  startPrice: number;
  volatility: number;
  drift: number;
}

/**
 * OHLC data structure required by the charting library.
 * This format is compatible with lightweight-charts' requirements:
 * - For intraday data: time is a Unix timestamp
 * - For daily+ data: time is a 'yyyy-MM-dd' string
 */
export interface OhlcBar {
  time: Time;        // Either Unix timestamp or date string
  open: number;      // Opening price
  high: number;      // Highest price
  low: number;       // Lowest price
  close: number;     // Closing price
}

/**
 * Raw OHLC data structure used internally.
 * This format is used by the RandomOHLC class for data generation
 * and manipulation before being converted to OhlcBar format for display.
 */
export interface OhlcRow {
  timestamp: number;  // Unix timestamp in seconds
  open: number;      // Opening price of the period
  high: number;      // Highest price during the period
  low: number;       // Lowest price during the period
  close: number;     // Closing price of the period
}
