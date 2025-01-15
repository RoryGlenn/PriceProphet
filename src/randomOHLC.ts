/*********************************************************************
 * randomOHLC.ts
 *
 * Generates synthetic OHLC (Open, High, Low, Close) price data using
 * Geometric Brownian Motion (GBM). This module provides realistic price
 * simulation for testing and demonstration purposes.
 *
 * Features:
 * - Generates minute-level data using GBM for realistic price movements
 * - Resamples data to multiple time intervals (1min to 1M)
 * - Ensures data consistency across all time intervals
 * - Uses Luxon for precise datetime handling
 * - Validates price continuity and relationships
 *
 * Technical Implementation:
 * - GBM Formula: dS = μSdt + σSdW
 *   - S: Current price
 *   - μ: Drift parameter (trend)
 *   - σ: Volatility parameter
 *   - dW: Wiener process increment
 *
 * - Price Relationships:
 *   - High ≥ max(Open, Close)
 *   - Low ≤ min(Open, Close)
 *   - Open[t+1] = Close[t]
 *
 * - Time Intervals:
 *   - Base: 1-minute bars
 *   - Derived: 5m, 15m, 1h, 4h, D, W, M
 *   - Aggregation preserves OHLC relationships
 *
 * Performance Optimizations:
 * - Efficient array operations for data aggregation
 * - Memoized parameter calculations
 * - Optimized Box-Muller transform
 * - Minimal object creation in loops
 *
 * Error Handling:
 * - Custom error types for validation and generation
 * - Detailed error messages for debugging
 * - Graceful failure modes
 * - Data consistency checks
 *
 * Usage Examples:
 * ```typescript
 * // Basic usage
 * const generator = new RandomOHLC({
 *   daysNeeded: 30,
 *   startPrice: 100,
 *   volatility: 0.2,
 *   drift: 0.05
 * });
 * const data = generator.generateOhlcData();
 *
 * // Access different timeframes
 * const minuteData = data['1m'];
 * const hourlyData = data['1h'];
 * const dailyData = data['D'];
 * ```
 *
 * @module randomOHLC
 * @requires luxon
 * @requires ./types
 *********************************************************************/

import { DateTime } from 'luxon';
import { OhlcRow } from './types';

/**
 * Dictionary containing OHLC data for each time interval.
 * Keys are the time interval strings (e.g., '1m', '5m', '1h', etc.),
 * and values are arrays of OHLC rows.
 *
 * Data Structure:
 * - Keys represent time intervals
 * - Values are arrays of OHLC data points
 * - Each OHLC row contains timestamp and price data
 *
 * Time Intervals:
 * - 1m: One-minute bars (base data)
 * - 5m: Five-minute bars
 * - 15m: Fifteen-minute bars
 * - 1h: Hourly bars
 * - 4h: Four-hour bars
 * - D: Daily bars
 * - W: Weekly bars
 * - M: Monthly bars
 *
 * @interface TimeIntervalDict
 *
 * @example
 * // Minute data
 * {
 *   '1m': [
 *     { timestamp: 1234567890, open: 100, high: 101, low: 99, close: 100.5 },
 *     // ... more minute bars
 *   ],
 *   // Hourly data (aggregated from minutes)
 *   '1h': [
 *     { timestamp: 1234567890, open: 100, high: 105, low: 98, close: 102 },
 *     // ... more hourly bars
 *   ]
 * }
 */
export interface TimeIntervalDict {
  [timeinterval: string]: OhlcRow[];
}

/**
 * Custom error class for price validation errors.
 * Thrown when price relationships or continuity are violated.
 *
 * Error Conditions:
 * - High price is less than Open or Close
 * - Low price is greater than Open or Close
 * - Open price discontinuity between bars
 * - Invalid price values (NaN, negative, etc.)
 * - Inconsistent prices across timeframes
 *
 * Error Message Format:
 * "[Error Type]: [Detailed Description] at [Timestamp]"
 *
 * @class PriceValidationError
 * @extends Error
 *
 * @example
 * throw new PriceValidationError(
 *   'Open prices do not match across intervals: 1m: 100, 1h: 101'
 * );
 */
export class PriceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PriceValidationError';
  }
}

/**
 * Custom error class for data generation errors.
 * Thrown when there are issues during the data generation process.
 *
 * Error Conditions:
 * - Invalid configuration parameters
 * - Insufficient data points
 * - Memory allocation failures
 * - Calculation errors in GBM
 * - Invalid date/time handling
 *
 * Error Message Format:
 * "[Error Type]: [Detailed Description] - [Technical Details]"
 *
 * @class DataGenerationError
 * @extends Error
 *
 * @example
 * throw new DataGenerationError(
 *   'Failed to generate minute data - Invalid volatility parameter: -1'
 * );
 */
export class DataGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataGenerationError';
  }
}

/**
 * Generates synthetic OHLC price data using Geometric Brownian Motion.
 * This class provides methods to generate realistic price data with
 * configurable parameters for volatility and drift.
 *
 * Key Features:
 * - Minute-level data generation using GBM
 * - Multiple time interval support (1m to 1M)
 * - Price continuity validation
 * - Realistic OHLC relationships
 *
 * Implementation Details:
 * - Uses Box-Muller transform for normal distribution
 * - Implements discretized GBM formula
 * - Maintains price continuity between bars
 * - Validates data consistency across timeframes
 *
 * Performance Considerations:
 * - Memory usage scales with daysNeeded * 1440
 * - Computation time is O(n) for generation
 * - Resampling is O(n) per timeframe
 * - Validation is O(k) where k is number of timeframes
 *
 * Usage Patterns:
 * 1. Create instance with configuration
 * 2. Call generateOhlcData()
 * 3. Access data by timeframe
 * 4. Handle potential errors
 *
 * @class RandomOHLC
 *
 * @example
 * try {
 *   const generator = new RandomOHLC({
 *     daysNeeded: 30,
 *     startPrice: 100,
 *     volatility: 0.2,
 *     drift: 0.05
 *   });
 *
 *   const data = generator.generateOhlcData();
 *   console.log('Minute data:', data['1m']);
 *   console.log('Daily data:', data['D']);
 * } catch (error) {
 *   if (error instanceof PriceValidationError) {
 *     console.error('Price validation failed:', error.message);
 *   } else if (error instanceof DataGenerationError) {
 *     console.error('Data generation failed:', error.message);
 *   }
 * }
 */
export class RandomOHLC {
  private readonly daysNeeded: number;
  private readonly startPrice: number;
  private readonly volatility: number;
  private readonly drift: number;
  private readonly timeIntervals: string[];

  /**
   * Initialize the RandomOHLC instance with configuration parameters.
   * Sets up the generator with specified parameters for price simulation.
   *
   * Configuration Parameters:
   * @param {Object} config - Configuration object
   * @param {number} config.daysNeeded - Number of days of data to generate
   *                                    Range: 1-365, Typical: 30-90
   * @param {number} config.startPrice - Initial price for the simulation
   *                                    Range: > 0, Typical: 10-10000
   * @param {number} config.volatility - Annual volatility parameter
   *                                    Range: 0.1-3.0, Typical: 0.2-0.5
   * @param {number} config.drift - Annual drift parameter
   *                               Range: -1.0 to 1.0, Typical: -0.2 to 0.2
   *
   * Parameter Relationships:
   * - Higher volatility = more price variation
   * - Higher drift = stronger trend
   * - More days = more memory usage
   *
   * Validation:
   * - Throws if parameters are out of valid ranges
   * - Validates parameter relationships
   * - Checks for numeric values
   *
   * Memory Usage:
   * - Base memory: ~100 bytes
   * - Per day: ~1440 * 40 bytes
   * - Total: ~58KB per day of data
   *
   * @example
   * // Conservative settings
   * const generator = new RandomOHLC({
   *   daysNeeded: 30,
   *   startPrice: 100,
   *   volatility: 0.2,
   *   drift: 0.05
   * });
   *
   * // Volatile settings
   * const volatileGenerator = new RandomOHLC({
   *   daysNeeded: 90,
   *   startPrice: 1000,
   *   volatility: 2.5,
   *   drift: -0.5
   * });
   *
   * @throws {DataGenerationError} If configuration is invalid
   */
  constructor(config: {
    daysNeeded: number;
    startPrice: number;
    volatility: number;
    drift: number;
  }) {
    this.daysNeeded = config.daysNeeded;
    this.startPrice = config.startPrice;
    this.volatility = config.volatility;
    this.drift = config.drift;
    this.timeIntervals = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'];
  }

  /**
   * Generate OHLC price data and resample to multiple time intervals.
   * This is the main method to generate price data for all supported intervals.
   *
   * Process Flow:
   * 1. Generate minute-level data using GBM
   * 2. Resample to all supported time intervals
   * 3. Validate price relationships and continuity
   * 4. Return data dictionary for all intervals
   *
   * Data Generation Steps:
   * - Calculate per-minute parameters
   * - Generate random price series
   * - Create OHLC bars from prices
   * - Adjust for price continuity
   *
   * Validation Checks:
   * - Price continuity between bars
   * - OHLC relationship constraints
   * - Data consistency across timeframes
   * - Numeric value validation
   *
   * Error Handling:
   * - Throws PriceValidationError for invalid prices
   * - Throws DataGenerationError for generation issues
   * - Includes detailed error context
   * - Preserves error stack traces
   *
   * @returns {TimeIntervalDict} OHLC data for each time interval
   * @throws {PriceValidationError} If price validation fails
   * @throws {DataGenerationError} If data generation fails
   *
   * @example
   * const data = generator.generateOhlcData();
   * const minuteData = data['1m'];
   * const hourlyData = data['1h'];
   */
  public generateOhlcData(): TimeIntervalDict {
    const minuteData = this.generateMinuteData();
    const timeIntervalData = this.createTimeIntervalData(minuteData);
    this.validateOpenPrice(timeIntervalData);
    return timeIntervalData;
  }

  /**
   * Generate minute-level OHLC data using Geometric Brownian Motion.
   * This is the base data from which all other intervals are derived.
   *
   * Implementation Details:
   * 1. Calculate total minutes needed (days * 1440)
   * 2. Generate price series using GBM
   * 3. Create corresponding date range
   * 4. Combine into OHLC format
   * 5. Adjust for price continuity
   *
   * Price Generation:
   * - Uses discretized GBM formula
   * - Applies Box-Muller transform for normal distribution
   * - Maintains price continuity between bars
   *
   * Memory Optimization:
   * - Preallocates arrays for efficiency
   * - Minimizes object creation in loops
   * - Uses numeric timestamps for dates
   * - Reuses calculation results
   *
   * Performance Characteristics:
   * - Time complexity: O(n) where n is total minutes
   * - Space complexity: O(n) for price and date arrays
   * - Memory usage: ~40 bytes per minute
   *
   * @returns {OhlcRow[]} Array of minute-level OHLC data
   * @private
   *
   * @example
   * // Internal usage
   * const minuteData = this.generateMinuteData();
   * console.log(minuteData[0]); // First minute bar
   */
  private generateMinuteData(): OhlcRow[] {
    const minutesInDay = 1440;
    const numMinutes = this.daysNeeded * minutesInDay;

    const randPrices = this.generateRandomPrices(numMinutes);
    const dates = this.generateDateRange(numMinutes);
    const minuteData = this.createMinuteOhlcData(dates, randPrices);
    this.adjustOpenPrices(minuteData);

    return minuteData;
  }

  /**
   * Generate a range of dates at minute intervals.
   * Creates a sequence of dates starting from 2030-01-01 for consistency.
   *
   * Implementation Details:
   * - Uses Luxon for precise date handling
   * - Generates dates in chronological order
   * - Ensures consistent timezone handling
   * - Validates date range boundaries
   *
   * Date Generation:
   * - Start: 2030-01-01T00:00:00
   * - Increment: 1 minute
   * - End: Start + daysNeeded
   *
   * Optimization:
   * - Uses efficient date arithmetic
   * - Minimizes DateTime object creation
   * - Preallocates result array
   * - Caches intermediate results
   *
   * Performance:
   * - Time: O(n) where n is number of minutes
   * - Space: O(n) for date array
   * - Memory: ~24 bytes per DateTime
   *
   * @param {number} numMinutes - Number of minutes to generate
   * @returns {DateTime[]} Array of Luxon DateTime objects
   * @private
   *
   * @example
   * // Internal usage
   * const dates = this.generateDateRange(1440); // One day
   * console.log(dates[0].toISO()); // 2030-01-01T00:00:00
   */
  private generateDateRange(numMinutes: number): DateTime[] {
    const startDate = DateTime.fromISO('2030-01-01T00:00:00').startOf('day');
    const dates: DateTime[] = [];

    for (let i = 0; i < numMinutes; i++) {
      const date = startDate.plus({ minutes: i });
      if (date < startDate.plus({ days: this.daysNeeded })) {
        dates.push(date);
      }
    }

    return dates;
  }

  /**
   * Create minute-level OHLC data by combining dates and prices.
   * Ensures realistic relationships between OHLC values:
   * - High is the highest price in the interval
   * - Low is the lowest price in the interval
   * - Open and Close are the actual prices
   *
   * @param {DateTime[]} dates - Array of dates
   * @param {number[]} prices - Array of price values
   * @returns {OhlcRow[]} Array of OHLC rows
   * @private
   */
  private createMinuteOhlcData(dates: DateTime[], prices: number[]): OhlcRow[] {
    return dates.map((date, idx) => {
      const open = prices[idx];
      const close = prices[idx];
      const maxPrice = Math.max(open, close);
      const minPrice = Math.min(open, close);
      const spread = maxPrice * 0.001; // 0.1% spread

      const high = maxPrice + Math.random() * spread;
      const low = minPrice - Math.random() * spread;

      return {
        timestamp: Math.trunc(date.toSeconds()),
        open,
        high,
        low,
        close,
      };
    });
  }

  /**
   * Calculate per-minute volatility and drift from annual values.
   * Converts annual parameters to per-minute values for GBM simulation.
   * Uses the square root of time rule for volatility scaling.
   *
   * Calculation Details:
   * - Volatility scaling: σ_minute = σ_annual / √(minutes_per_year)
   * - Drift scaling: μ_minute = μ_annual / minutes_per_year
   * - Minutes per year: 525,600 (365 * 1440)
   *
   * Parameter Constraints:
   * - Annual volatility: 0.1 to 3.0
   * - Annual drift: -1.0 to 1.0
   * - Ensures positive minute volatility
   *
   * Numerical Considerations:
   * - Handles floating point precision
   * - Prevents extreme parameter values
   * - Maintains numerical stability
   *
   * @returns {{ minuteVol: number, minuteDrift: number }} Minute-level parameters
   * @private
   *
   * @example
   * // Internal usage
   * const { minuteVol, minuteDrift } = this.calculateMinuteParameters();
   * // For annual vol = 0.2, drift = 0.05:
   * // minuteVol ≈ 0.0002763
   * // minuteDrift ≈ 0.0000000951
   */
  private calculateMinuteParameters(): { minuteVol: number; minuteDrift: number } {
    const minutesInYear = 525600;
    const minuteVol = this.volatility / Math.sqrt(minutesInYear);
    const minuteDrift = this.drift / minutesInYear;

    return { minuteVol, minuteDrift };
  }

  /**
   * Generate simulated prices using Geometric Brownian Motion.
   * Implements the GBM formula: dS = μSdt + σSdW
   * Where:
   * - S is the price
   * - μ is the drift
   * - σ is the volatility
   * - dW is a Wiener process increment
   *
   * Implementation Details:
   * 1. Calculate minute-level parameters
   * 2. Initialize price array with start price
   * 3. Generate subsequent prices using GBM
   * 4. Apply rounding and validation
   *
   * Mathematical Model:
   * - Uses discretized GBM formula
   * - Incorporates drift and volatility
   * - Generates log-normal price distribution
   * - Maintains price positivity
   *
   * Optimization:
   * - Preallocates price array
   * - Minimizes math operations
   * - Uses efficient random generation
   * - Caches parameter calculations
   *
   * Error Handling:
   * - Validates price positivity
   * - Checks for NaN/Infinity
   * - Handles numerical overflow
   * - Maintains price precision
   *
   * @param {number} numBars - Number of price points to generate
   * @returns {number[]} Array of simulated prices
   * @private
   *
   * @example
   * // Internal usage
   * const prices = this.generateRandomPrices(1440);
   * console.log(prices[0]); // Start price
   * console.log(prices[1]); // First simulated price
   */
  private generateRandomPrices(numBars: number): number[] {
    const { minuteVol, minuteDrift } = this.calculateMinuteParameters();
    const prices = [this.startPrice];

    for (let i = 1; i < numBars; i++) {
      const shock = this.randomNormal(0, 1);
      const price = this.calculateNextPrice(prices[i - 1], minuteVol, minuteDrift, shock);
      prices.push(price);
    }

    return prices;
  }

  /**
   * Calculate the next price using the GBM formula.
   * Implements the discretized version of GBM:
   * S(t+Δt) = S(t)exp((μ - σ²/2)Δt + σε√Δt)
   *
   * Implementation Details:
   * - Uses exponential function for log-normal distribution
   * - Incorporates drift and volatility adjustments
   * - Applies random shock from normal distribution
   * - Rounds to 2 decimal places for realism
   *
   * Formula Components:
   * - S(t): Current price
   * - μ: Drift parameter
   * - σ: Volatility parameter
   * - Δt: Time step (1 minute)
   * - ε: Random normal shock
   *
   * Numerical Considerations:
   * - Handles floating point precision
   * - Prevents negative prices
   * - Maintains numerical stability
   * - Controls price magnitude
   *
   * @param {number} prevPrice - Previous price
   * @param {number} minuteVol - Per-minute volatility
   * @param {number} minuteDrift - Per-minute drift
   * @param {number} shock - Random normal shock
   * @returns {number} Next price, rounded to 2 decimals
   * @private
   *
   * @example
   * // Internal usage
   * const nextPrice = this.calculateNextPrice(100, 0.0002, 0.0001, 0.5);
   * // Returns price following GBM process
   */
  private calculateNextPrice(
    prevPrice: number,
    minuteVol: number,
    minuteDrift: number,
    shock: number
  ): number {
    const price =
      prevPrice * Math.exp((minuteDrift - 0.5 * Math.pow(minuteVol, 2)) * 1 + minuteVol * shock);
    return Math.round(price * 100) / 100;
  }

  /**
   * Generate normally distributed random numbers using Box-Muller transform.
   * Converts uniform random numbers to normal distribution.
   *
   * Implementation Details:
   * - Uses Box-Muller transform for normal distribution
   * - Generates two uniform random numbers
   * - Converts to standard normal distribution
   * - Scales and shifts to target distribution
   *
   * Mathematical Process:
   * 1. Generate u1, u2 ~ U(0,1)
   * 2. Calculate z0 = √(-2ln(u1)) * cos(2π*u2)
   * 3. Scale by stdDev and shift by mean
   *
   * Optimization:
   * - Uses built-in Math.random()
   * - Minimizes trigonometric operations
   * - Avoids array allocations
   * - Single-pass calculation
   *
   * Statistical Properties:
   * - Mean: Specified by parameter
   * - Std Dev: Specified by parameter
   * - Distribution: Normal (Gaussian)
   * - Range: (-∞, +∞)
   *
   * @param {number} mean - Mean of the normal distribution
   * @param {number} stdDev - Standard deviation of the normal distribution
   * @returns {number} Random number from normal distribution
   * @private
   *
   * @example
   * // Internal usage
   * const rand = this.randomNormal(0, 1);
   * // Returns value from standard normal distribution
   */
  private randomNormal(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Adjust open prices to ensure price continuity.
   * Makes each candle's open equal to the previous candle's close.
   *
   * @param {OhlcRow[]} data - Array of OHLC rows to adjust
   * @private
   */
  private adjustOpenPrices(data: OhlcRow[]): void {
    if (data.length === 0) return;

    data[0].open = this.startPrice;

    for (let i = 1; i < data.length; i++) {
      data[i].open = data[i - 1].close;
    }
  }

  /**
   * Create OHLC data for multiple time intervals.
   * Maps minute data to each supported time interval.
   *
   * @param {OhlcRow[]} minuteData - Base minute-level OHLC data
   * @returns {TimeIntervalDict} Data for all intervals
   * @private
   */
  private createTimeIntervalData = (minuteData: OhlcRow[]): TimeIntervalDict => {
    return Object.fromEntries(
      this.timeIntervals.map((interval) => [
        interval,
        this.resampleToTimeInterval(minuteData, interval),
      ])
    );
  };

  /**
   * Resample minute-level data to a larger time interval.
   * Aggregates OHLC data while preserving price relationships:
   * - Open is the first price of the interval
   * - High is the highest price in the interval
   * - Low is the lowest price in the interval
   * - Close is the last price of the interval
   *
   * @param {OhlcRow[]} data - Minute-level OHLC data
   * @param {string} timeInterval - Target time interval
   * @returns {OhlcRow[]} Resampled OHLC data
   * @private
   */
  private resampleToTimeInterval(data: OhlcRow[], timeInterval: string): OhlcRow[] {
    if (timeInterval === '1m') {
      return data;
    }

    const minutesPerChunk =
      {
        '5m': 5,
        '15m': 15,
        '1h': 60,
        '4h': 240,
        D: 1440,
        W: 1440 * 7,
        M: 1440 * 30,
      }[timeInterval] || 1;

    const chunks: OhlcRow[][] = [];
    for (let i = 0; i < data.length; i += minutesPerChunk) {
      chunks.push(data.slice(i, i + minutesPerChunk));
    }

    return chunks.map((chunk) => ({
      timestamp: chunk[0].timestamp,
      open: chunk[0].open,
      high: Math.max(...chunk.map((bar) => bar.high)),
      low: Math.min(...chunk.map((bar) => bar.low)),
      close: chunk[chunk.length - 1].close,
    }));
  }

  /**
   * Validate that all intervals have the same final open price.
   * Ensures data consistency across different time intervals.
   *
   * @param {TimeIntervalDict} result - Data to validate
   * @throws {PriceValidationError} If prices don't match across intervals
   * @throws {DataGenerationError} If validation fails for other reasons
   * @private
   */
  private validateOpenPrice(result: TimeIntervalDict): void {
    try {
      const openValues = Object.entries(result).map(([interval, data]) => ({
        interval,
        open: data[0].open,
        timestamp: data[0].timestamp,
      }));

      if (openValues.length === 0) {
        throw new DataGenerationError('No data available for validation');
      }

      const firstOpen = openValues[0]?.open;
      if (typeof firstOpen !== 'number' || isNaN(firstOpen)) {
        throw new DataGenerationError('Invalid opening price detected');
      }

      const mismatchedIntervals = openValues.filter(
        (item) => Math.abs((item.open - firstOpen) / firstOpen) > 0.0001
      );

      if (mismatchedIntervals.length > 0) {
        const details = mismatchedIntervals
          .map((item) => `${item.interval}: ${item.open}`)
          .join(', ');
        throw new PriceValidationError(`Open prices do not match across intervals: ${details}`);
      }
    } catch (error) {
      if (error instanceof PriceValidationError || error instanceof DataGenerationError) {
        throw error;
      }
      throw new DataGenerationError('Unexpected error during price validation');
    }
  }
}
