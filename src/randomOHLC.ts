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
 * @module randomOHLC
 * @description Price data generation using Geometric Brownian Motion
 *********************************************************************/

import { DateTime } from 'luxon';
import { OhlcRow } from './types';

/**
 * Dictionary containing OHLC data for each time interval.
 * Keys are the time interval strings (e.g., '1m', '5m', '1h', etc.),
 * and values are arrays of OHLC rows.
 *
 * @interface TimeIntervalDict
 * @example
 * {
 *   '1m': [{ timestamp: 1234567890, open: 100, high: 101, low: 99, close: 100.5 }, ...],
 *   '1h': [{ timestamp: 1234567890, open: 100, high: 105, low: 98, close: 102 }, ...]
 * }
 */
export interface TimeIntervalDict {
  [timeinterval: string]: OhlcRow[];
}

/**
 * Custom error class for price validation errors.
 * Thrown when price relationships or continuity are violated.
 *
 * @class PriceValidationError
 * @extends Error
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
 * @class DataGenerationError
 * @extends Error
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
 * Features:
 * - Minute-level data generation using GBM
 * - Multiple time interval support (1m to 1M)
 * - Price continuity validation
 * - Realistic OHLC relationships
 *
 * @class RandomOHLC
 */
export class RandomOHLC {
  private readonly daysNeeded: number;
  private readonly startPrice: number;
  private readonly volatility: number;
  private readonly drift: number;
  private readonly timeIntervals: string[];

  /**
   * Initialize the RandomOHLC instance with configuration parameters.
   *
   * @param {Object} config - Configuration object
   * @param {number} config.daysNeeded - Number of days of data to generate
   * @param {number} config.startPrice - Initial price for the simulation
   * @param {number} config.volatility - Annual volatility parameter (typically 0.1-3.0)
   * @param {number} config.drift - Annual drift parameter (-1.0 to 1.0)
   *
   * @example
   * const generator = new RandomOHLC({
   *   daysNeeded: 30,
   *   startPrice: 100,
   *   volatility: 0.2,
   *   drift: 0.05
   * });
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
   * The process:
   * 1. Generate minute-level data using GBM
   * 2. Resample to all supported time intervals
   * 3. Validate price relationships and continuity
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
   * The process:
   * 1. Generate random prices using GBM
   * 2. Create corresponding dates
   * 3. Combine into OHLC format
   * 4. Adjust prices for continuity
   *
   * @returns {OhlcRow[]} Array of minute-level OHLC data
   * @private
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
   * @param {number} numMinutes - Number of minutes to generate
   * @returns {DateTime[]} Array of Luxon DateTime objects
   * @private
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
   * @returns {{ minuteVol: number, minuteDrift: number }} Minute-level parameters
   * @private
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
   * @param {number} numBars - Number of price points to generate
   * @returns {number[]} Array of simulated prices
   * @private
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
   * @param {number} prevPrice - Previous price
   * @param {number} minuteVol - Per-minute volatility
   * @param {number} minuteDrift - Per-minute drift
   * @param {number} shock - Random normal shock
   * @returns {number} Next price, rounded to 2 decimals
   * @private
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
   * @param {number} mean - Mean of the normal distribution
   * @param {number} stdDev - Standard deviation of the normal distribution
   * @returns {number} Random number from normal distribution
   * @private
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
