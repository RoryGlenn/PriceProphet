import { DataFrame } from 'data-forge';
import { DateTime } from "luxon";

/**
 * Interface for mapping timeframes to their DataFrame representations
 */
interface TimeFrameData {
    [key: string]: DataFrame;
}

/**
 * Structure for OHLC (Open, High, Low, Close) bar data
 */
interface OhlcBar {
    time: Date;
    open: number;
    high: number;
    low: number;
    close: number;
}

/**
 * Structure for DataFrame row containing price data
 */
interface DataFrameRow {
    price: number;
}

/**
 * Generates random OHLC (Open, High, Low, Close) price data using Geometric Brownian Motion
 */
class RandomOHLC {
    private daysNeeded: number;
    private startPrice: number;
    private volatility: number;
    private drift: number;
    private timeframes: string[];

    /**
     * Creates a new RandomOHLC instance
     * @param config Configuration object containing simulation parameters
     * @throws Error if any parameters are invalid
     */
    constructor({
        daysNeeded,
        startPrice,
        volatility,
        drift
    }: {
        /** Number of days to simulate */
        daysNeeded: number;
        /** Initial price */
        startPrice: number;
        /** Annual volatility */
        volatility: number;
        /** Annual drift (trend) */
        drift: number;
    }) {
        if (daysNeeded <= 0) throw new Error('daysNeeded must be positive');
        if (startPrice <= 0) throw new Error('startPrice must be positive');
        if (volatility < 0) throw new Error('volatility cannot be negative');
        
        this.daysNeeded = daysNeeded;
        this.startPrice = startPrice;
        this.volatility = volatility;
        this.drift = drift;
        this.timeframes = ["1min", "5min", "15min", "1H", "4H", "1D"];
    }

    /**
     * Generates a random number from a standard normal distribution using Box-Muller transform
     * @returns Random number from N(0,1)
     */
    private normalRandom(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    /**
     * Generates a series of prices using Geometric Brownian Motion
     * @param numBars Number of price points to generate
     * @returns Array of simulated prices
     * @throws Error if numBars is not positive
     */
    public generateRandomPrices(numBars: number): number[] {
        if (numBars <= 0) {
            throw new Error('Number of bars must be positive');
        }

        const minuteVol = this.volatility / Math.sqrt(525600);
        const minuteDrift = this.drift / 525600;
        const dt = 1;
        const prices = [this.startPrice];

        for (let i = 0; i < numBars - 1; i++) {
            const shock = this.normalRandom();
            const nextPrice = prices[i] * Math.exp(
                (minuteDrift - 0.5 * minuteVol ** 2) * dt + minuteVol * shock
            );
            prices.push(Number(nextPrice.toFixed(2)));
        }

        return prices;
    }

    /**
     * Creates an array of dates starting from 2030-01-01
     * @param length Number of dates to generate
     * @returns Array of dates with 1-minute intervals
     */
    private createTimeIndex(length: number): Date[] {
        const startDate = DateTime.fromISO('2030-01-01T00:00:00Z');
        return Array.from({ length }, (_, i) => 
            startDate.plus({ minutes: i }).toJSDate()
        );
    }

    /**
     * Converts a timeframe string to minutes
     * @param interval Timeframe string (e.g., "1min", "1H", "1D")
     * @returns Number of minutes in the interval
     * @throws Error if interval format is invalid
     */
    private intervalToMinutes(interval: string): number {
        const match = interval.match(/(\d+)(\w+)/);
        if (!match) {
            throw new Error(`Invalid interval format: ${interval}`);
        }

        const [_, num, unit] = match;
        const value = parseInt(num);

        switch (unit) {
            case 'min': return value;
            case 'H': return value * 60;
            case 'D': return value * 1440;
            default: return 1;
        }
    }

    /**
     * Generates OHLC data for multiple timeframes
     * @returns Object mapping timeframes to their OHLC DataFrames
     * @throws Error if data generation fails
     */
    public generateOhlcData(): TimeFrameData {
        const numBars = this.daysNeeded * 1440;
        const prices = this.generateRandomPrices(numBars);
        const timeIndex = this.createTimeIndex(numBars);
        
        // Create base DataFrame with proper structure
        const df = new DataFrame({
            values: timeIndex.map((time, i) => ({
                time,
                price: prices[i]
            }))
        });

        try {
            const result: TimeFrameData = {};

            for (const tf of this.timeframes) {
                const minutes = this.intervalToMinutes(tf);
                
                // Resample to desired timeframe
                const resampled = df
                    .groupBy(row => {
                        const date = row.time as Date;
                        const roundedDate = new Date(
                            Math.floor(date.getTime() / (minutes * 60000)) * minutes * 60000
                        );
                        return roundedDate;
                    })
                    .select(group => {
                        const prices = group.select(row => row.price).toArray();
                        return {
                            time: group.first().time,
                            open: prices[0],
                            high: Math.max(...prices),
                            low: Math.min(...prices),
                            close: prices[prices.length - 1]
                        } as OhlcBar;
                    })
                    .toArray();

                result[tf] = new DataFrame(resampled);
            }

            return result;
        } catch (error) {
            console.error('Error in generateOhlcData:', error);
            throw error;
        }
    }
}

// Only export the classes that are needed by other files
export { RandomOHLC };
export type { TimeFrameData, OhlcBar, DataFrameRow }; 