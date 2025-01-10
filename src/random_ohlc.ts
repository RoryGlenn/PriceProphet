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
import { IDataFrame, DataFrame } from 'data-forge';

/**
 * Dictionary containing OHLC data for each time interval.
 * Keys are the time interval strings (e.g., '1min', '1H', '1D', etc.),
 * and values are arrays of OHLC rows.
 */
interface TimeIntervalDict {
  [timeinterval: string]: OhlcRow[];
}

/**
 * Interface representing a single OHLC (Open, High, Low, Close) data row.
 */
interface OhlcRow {
  timestamp: number; // Unix timestamp in seconds
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
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
    const result = this.createTimeIntervalData(minuteData);
    const normalized = this.normalizeTimeIntervals(result, minuteData);
    this.validateOpenPrice(normalized);
    return normalized;
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

    console.info(`Date range: ${dates[0].toISO()} to ${dates[dates.length - 1].toISO()}`);
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
   * Ensure all time intervals have the same start and end times.
   * Filters out any data points outside the main data range.
   *
   * @param result TimeIntervalDict to normalize
   * @param minuteData Original minute data for reference
   * @returns Normalized TimeIntervalDict
   */
  private normalizeTimeIntervals(
    result: TimeIntervalDict,
    minuteData: OhlcRow[]
  ): TimeIntervalDict {
    // Get the start and end timestamps from the minute data
    const startDate = DateTime.fromSeconds(minuteData[0].timestamp).startOf('day');
    const endDate = DateTime.fromSeconds(minuteData[minuteData.length - 1].timestamp);
    
    // Ensure endDate is at the end of its last complete interval
    const lastCompleteDate = endDate.startOf('day');

    console.log('Normalizing time intervals:', {
      start: startDate.toISO(),
      end: lastCompleteDate.toISO()
    });

    // Filter data for each interval to ensure they all have the same date range
    Object.keys(result).forEach((interval) => {
      result[interval] = result[interval].filter((bar) => {
        const barDate = DateTime.fromSeconds(bar.timestamp);
        // Only include bars that are within complete intervals
        switch (interval) {
          case '4h':
            // For 4h, ensure we're not including a partial 4-hour block
            return barDate >= startDate && 
                   barDate.hour % 4 === 0 && 
                   barDate <= lastCompleteDate.endOf('day');
          case 'D':
            // For daily, only include complete days
            return barDate >= startDate && 
                   barDate.startOf('day') <= lastCompleteDate;
          case 'W':
            // For weekly, only include complete weeks
            return barDate >= startDate && 
                   barDate.startOf('week') <= lastCompleteDate;
          case 'M':
            // For monthly, only include complete months
            return barDate >= startDate && 
                   barDate.startOf('month') <= lastCompleteDate;
          default:
            // For minute-based intervals, include all points within the day range
            return barDate >= startDate && barDate <= lastCompleteDate.endOf('day');
        }
      });
    });

    // Get the final close price from the minute data
    const finalClose = minuteData[minuteData.length - 1].close;

    // Ensure all intervals have the same final close price
    Object.keys(result).forEach((interval) => {
      if (result[interval].length > 0) {
        result[interval][result[interval].length - 1].close = finalClose;
      }
    });

    return result;
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
    // Convert data to DataFrame
    const df = new DataFrame(data);
    const firstOpenPrice = data[0].open;

    // Create a grouping key based on the time interval
    const grouped = df.groupBy((row: OhlcRow) => {
      const date = DateTime.fromSeconds(row.timestamp);
      switch (timeInterval) {
        case '1m':
          return date.set({ second: 0 }).toSeconds();
        case '5m':
          return date.set({
            minute: Math.floor(date.minute / 5) * 5,
            second: 0
          }).toSeconds();
        case '15m':
          return date.set({
            minute: Math.floor(date.minute / 15) * 15,
            second: 0
          }).toSeconds();
        case '1h':
          return date.startOf('hour').toSeconds();
        case '4h':
          return date.set({
            hour: Math.floor(date.hour / 4) * 4,
            minute: 0,
            second: 0
          }).toSeconds();
        case 'D':
          return date.startOf('day').toSeconds();
        case 'W':
          return date.startOf('week').toSeconds();
        case 'M':
          return date.startOf('month').toSeconds();
        default:
          return row.timestamp;
      }
    });

    // Aggregate the data
    const aggregated = grouped.select((group: IDataFrame) => {
      const rows = group.toArray();
      const groupTimestamp = rows[0].timestamp;
      return {
        timestamp: groupTimestamp,
        open: groupTimestamp === data[0].timestamp ? firstOpenPrice : rows[0].open,
        high: Math.max(...rows.map(r => r.high)),
        low: Math.min(...rows.map(r => r.low)),
        close: rows[rows.length - 1].close
      };
    }).toArray();

    return aggregated.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get a string key for grouping data points by time interval.
   * Creates consistent keys for aggregating data into larger intervals.
   *
   * @param date DateTime object to format
   * @param timeInterval Target time interval
   * @returns Formatted string key
   * @throws Error if timeInterval is not supported
   */
  private getTimeKey(date: DateTime, timeInterval: string): string {
    /*
     * This function creates standardized string keys for grouping time periods.
     * For example:
     * - 1min: '2030-01-01-09-30' (year-month-day-hour-minute)
     * - 1H:   '2030-01-01-09'    (year-month-day-hour)
     * - 1D:   '2030-01-01'       (year-month-day)
     * 
     * For intervals like 5min and 15min, we need to round down the minutes
     * to ensure consistent grouping (e.g., 09:05, 09:10, 09:15 for 5min intervals)
     */
    switch (timeInterval) {
      case '1m':
        return date.toFormat('yyyy-MM-dd-HH-mm');
      case '5m':
        return (
          date.toFormat('yyyy-MM-dd-HH-') +
          (Math.floor(date.minute / 5) * 5).toString().padStart(2, '0')
        );
      case '15m':
        return (
          date.toFormat('yyyy-MM-dd-HH-') +
          (Math.floor(date.minute / 15) * 15).toString().padStart(2, '0')
        );
      case '1h':
        return date.toFormat('yyyy-MM-dd-HH');
      case '4h':
        return (
          date.toFormat('yyyy-MM-dd-') + (Math.floor(date.hour / 4) * 4).toString().padStart(2, '0')
        );
      case 'D':
        return date.toFormat('yyyy-MM-dd');
      case 'W':
        return date.startOf('week').toFormat('yyyy-MM-dd');
      case 'M':
        return date.startOf('month').toFormat('yyyy-MM-dd');
      default:
        throw new Error(`Unsupported time interval: ${timeInterval}`);
    }
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
      timestamp: data[0].timestamp
    }));

    console.log('First open prices:', openValues);

    const firstOpen = openValues[0]?.open;
    const mismatchedIntervals = openValues.filter(
      item => Math.abs((item.open - firstOpen) / firstOpen) > 0.0001
    );

    if (mismatchedIntervals.length > 0) {
      console.error('Open price mismatch:', mismatchedIntervals);
      throw new Error('Open prices do not match across intervals');
    }
  }
}
