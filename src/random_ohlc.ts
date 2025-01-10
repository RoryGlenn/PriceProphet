/*********************************************************************
 *  random_ohlc.ts
 *
 *  Generate synthetic OHLC price data using Geometric Brownian Motion (GBM).
 *  Features:
 *  - Generates minute-level data using GBM
 *  - Resamples data to multiple time intervals (1min to 1M)
 *  - Ensures data consistency across all time intervals
 *  - Uses Luxon for precise datetime handling
 *********************************************************************/

import { DateTime } from 'luxon';
import { OhlcRow } from './types';

/**
 * Dictionary containing OHLC data for each time interval.
 * Keys are the time interval strings (e.g., '1min', '1H', '1D', etc.),
 * and values are arrays of OHLC rows.
 */
interface TimeIntervalDict {
  [timeinterval: string]: OhlcRow[];
}

/**
 * Generates synthetic OHLC price data using Geometric Brownian Motion.
 * Supports multiple time intervals and ensures data consistency.
 */
export class RandomOHLC {
  private readonly daysNeeded: number;
  private readonly startPrice: number;
  private readonly volatility: number;
  private readonly drift: number;
  private readonly timeIntervals: string[];

  /**
   * Initialize the RandomOHLC instance.
   *
   * @param config Configuration object containing:
   *   daysNeeded - Number of days of data to generate
   *   startPrice - Initial price for the simulation
   *   volatility - Annual volatility parameter for GBM (typically 1-3)
   *   drift - Annual drift parameter for GBM (typically 1-3)
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

    console.info('Initializing RandomOHLC with config:', config);
  }

  /**
   * Generate OHLC price data and resample to multiple time intervals.
   * Ensures all time intervals have consistent start and end times.
   *
   * @returns TimeIntervalDict containing OHLC data for each time interval
   */
  public generateOhlcData(): TimeIntervalDict {
    const minuteData = this.generateMinuteData();
    const timeIntervalData = this.createTimeIntervalData(minuteData);
    this.validateOpenPrice(timeIntervalData);
    return timeIntervalData;
  }

  /**
   * Generate minute-level OHLC data using GBM.
   * This is the base data from which all other intervals are derived.
   *
   * @returns Array of minute-level OHLC rows
   */
  private generateMinuteData(): OhlcRow[] {
    const minutesInDay = 1440;
    const numMinutes = this.daysNeeded * minutesInDay;
    console.info(`Generating ${this.daysNeeded} days of data (${numMinutes} minutes).`);

    const randPrices = this.generateRandomPrices(numMinutes);
    const dates = this.generateDateRange(numMinutes);
    const minuteData = this.createMinuteOhlcData(dates, randPrices);
    this.adjustOpenPrices(minuteData);

    return minuteData;
  }

  /**
   * Generate a range of dates at minute intervals.
   * Starts from a fixed date (2030-01-01) for consistency.
   *
   * @param numMinutes Number of minutes to generate
   * @returns Array of DateTime objects
   */
  private generateDateRange(numMinutes: number): DateTime[] {
    // Start at the beginning of the day
    const startDate = DateTime.fromISO('2030-01-01T00:00:00').startOf('day');
    const dates: DateTime[] = [];

    // Generate complete days of data
    for (let i = 0; i < numMinutes; i++) {
      const date = startDate.plus({ minutes: i });
      // Only include if it's within a complete day
      if (date < startDate.plus({ days: this.daysNeeded })) {
        dates.push(date);
      }
    }

    // console.info(`Date range: ${dates[0].toISO()} to ${dates[dates.length - 1].toISO()}`);
    return dates;
  }

  /**
   * Create minute-level OHLC data by combining dates and prices.
   * At the minute level, all OHLC values are initially the same.
   *
   * @param dates Array of DateTime objects
   * @param prices Array of price values
   * @returns Array of OHLC rows
   */
  private createMinuteOhlcData(dates: DateTime[], prices: number[]): OhlcRow[] {
    return dates.map((date, idx) => ({
      timestamp: Math.trunc(date.toSeconds()),
      open: prices[idx],
      high: prices[idx],
      low: prices[idx],
      close: prices[idx],
    }));
  }

  /**
   * Calculate per-minute volatility and drift from annual values.
   * Converts annual parameters to per-minute values for GBM simulation.
   *
   * @returns Object containing minute-level volatility and drift
   */
  private calculateMinuteParameters(): { minuteVol: number; minuteDrift: number } {
    const minutesInYear = 525600;
    const minuteVol = this.volatility / Math.sqrt(minutesInYear);
    const minuteDrift = this.drift / minutesInYear;

    console.info('Generating GBM prices...');
    console.info(`  Start price: $${this.startPrice}`);
    console.info(
      `  Per-minute volatility: ${minuteVol.toPrecision(6)} (annual: ${this.volatility})`
    );
    console.info(`  Per-minute drift: ${minuteDrift.toPrecision(6)} (annual: ${this.drift})`);

    return { minuteVol, minuteDrift };
  }

  /**
   * Generate simulated prices using Geometric Brownian Motion.
   * Uses Box-Muller transform for normal distribution sampling.
   *
   * @param numBars Number of price points to generate
   * @returns Array of simulated prices
   */
  private generateRandomPrices(numBars: number): number[] {
    const { minuteVol, minuteDrift } = this.calculateMinuteParameters();
    const prices = [this.startPrice];

    for (let i = 1; i < numBars; i++) {
      const shock = this.randomNormal(0, 1);
      const price = this.calculateNextPrice(prices[i - 1], minuteVol, minuteDrift, shock);
      prices.push(price);
    }

    this.logPriceStats(prices);
    return prices;
  }

  /**
   * Calculate the next price using the GBM formula.
   * Includes rounding to 2 decimal places for realism.
   *
   * @param prevPrice Previous price
   * @param minuteVol Per-minute volatility
   * @param minuteDrift Per-minute drift
   * @param shock Random normal shock
   * @returns Next price
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
   * Log statistics about the generated prices.
   * Includes final price and total return percentage.
   *
   * @param prices Array of generated prices
   */
  private logPriceStats(prices: number[]): void {
    const finalPrice = prices[prices.length - 1];
    const totalReturn = ((finalPrice - this.startPrice) / this.startPrice) * 100.0;

    console.info(`  Final price: $${finalPrice.toFixed(2)}`);
    console.info(`  Total return: ${totalReturn.toFixed(2)}%`);
  }

  /**
   * Generate normally distributed random numbers using Box-Muller transform.
   *
   * @param mean Mean of the normal distribution
   * @param stdDev Standard deviation of the normal distribution
   * @returns Random number from normal distribution
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
   * @param data Array of OHLC rows to adjust
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
   * @param minuteData Base minute-level OHLC data
   * @returns TimeIntervalDict containing data for all intervals
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
   * Resample minute-level data to a larger time interval using data-forge.
   * Handles all supported intervals from 1min to 1M.
   * Ensures proper timestamp alignment for each interval.
   *
   * @param data Array of minute-level OHLC rows
   * @param timeInterval Target time interval
   * @returns Array of resampled OHLC rows
   */
  private resampleToTimeInterval(data: OhlcRow[], timeInterval: string): OhlcRow[] {
    // If it's 1-minute data, return as is
    if (timeInterval === '1m') {
      return data;
    }

    // Define the chunk size for each interval
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

    // Group data into chunks
    const chunks: OhlcRow[][] = [];
    for (let i = 0; i < data.length; i += minutesPerChunk) {
      chunks.push(data.slice(i, i + minutesPerChunk));
    }

    // Convert chunks to OHLC bars
    return chunks.map((chunk) => ({
      timestamp: chunk[0].timestamp,
      open: chunk[0].open,
      high: Math.max(...chunk.map((bar) => bar.high)),
      low: Math.min(...chunk.map((bar) => bar.low)),
      close: chunk[chunk.length - 1].close,
    }));
  }

  /**
   * Validate that all intervals have the same final open price
   * @param result TimeIntervalDict to validate
   * @returns void, throws error if validation fails
   */
  private validateOpenPrice(result: TimeIntervalDict): void {
    const openValues = Object.entries(result).map(([interval, data]) => ({
      interval,
      open: data[0].open,
      timestamp: data[0].timestamp,
    }));

    // console.log('First open prices:', openValues);

    const firstOpen = openValues[0]?.open;
    const mismatchedIntervals = openValues.filter(
      (item) => Math.abs((item.open - firstOpen) / firstOpen) > 0.0001
    );

    if (mismatchedIntervals.length > 0) {
      console.error('Open price mismatch:', mismatchedIntervals);
      throw new Error('Open prices do not match across intervals');
    }
  }
}
