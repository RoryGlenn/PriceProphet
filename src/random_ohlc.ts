/*********************************************************************
 *  random-ohlc.ts
 *
 *  Generate synthetic OHLC price data using Geometric Brownian Motion.
 *  Manage timestamps with Luxon.
 *********************************************************************/

import { DateTime } from "luxon";

/**
 * Interface for the collection of OHLC data returned.
 * Keys are the timeframe strings (e.g., '1M', '1W', etc.),
 * and values are arrays of OHLC bars.
 */
interface TimeframeDict {
    [timeframe: string]: OhlcRow[];
}

/**
 * Interface representing a single row in the OHLC data.
 */
interface OhlcRow {
    timestamp: number; // Unix timestamp (seconds)
    open: number;
    high: number;
    low: number;
    close: number;
}

/**
 * A class to generate synthetic OHLC price data using Geometric Brownian Motion.
 */
export class RandomOHLC {
    private readonly daysNeeded: number;
    private readonly startPrice: number;
    private readonly volatility: number;
    private readonly drift: number;

    /**
     * Initialize the RandomOHLC instance.
     *
     * @param config - Configuration object containing:
     *   - daysNeeded: Number of days of data to generate
     *   - startPrice: Initial price for the simulation
     *   - volatility: Annual volatility parameter for GBM (1-3 typical)
     *   - drift: Annual drift parameter for GBM (1-3 typical)
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

        // log the config
        console.log(config);
    }


    /**
     * Generate OHLC price data and resample to multiple timeframes.
     * Returns an object whose keys are the timeframe intervals (e.g., '1M'),
     * and values are arrays of OHLC bars.
     */
    public generateOhlcData(): TimeframeDict {
        const minutesInDay = 1440;
        const numMinutes = this.daysNeeded * minutesInDay;

        console.info(
            `Generating ${this.daysNeeded} days of data (${numMinutes} minutes).`
        );

        // Generate random prices at minute-level
        const randPrices = this.generateRandomPrices(numMinutes);

        // Create a Luxon DateTime range, from a fixed start date
        const startDate = DateTime.fromISO("2030-01-01T00:00:00");
        const dates: DateTime[] = [];
        for (let i = 0; i < numMinutes; i++) {
            dates.push(startDate.plus({ minutes: i }));
        }
        console.info(
            `Date range: ${dates[0].toISO()} to ${dates[dates.length - 1].toISO()}`
        );

        // Create minute-level OHLC data
        const minuteData: OhlcRow[] = dates.map((date, idx) => ({
            timestamp: Math.trunc(date.toSeconds()),
            open: randPrices[idx],
            high: randPrices[idx],
            low: randPrices[idx],
            close: randPrices[idx]
        }));

        // Adjust open prices to ensure continuity
        this.adjustOpenPrices(minuteData);

        // Create data for different timeframes
        return this.createTimeframeData(minuteData);
    }

    /**
     * Generate simulated prices using Geometric Brownian Motion.
     * @param numBars Number of price points (minutes) to generate.
     */
    private generateRandomPrices(numBars: number): number[] {
        // Convert annual volatility & drift into per-minute values

        const minutesInYear = 525600;
        const minuteVol = this.volatility / Math.sqrt(minutesInYear);
        const minuteDrift = this.drift / minutesInYear;

        console.info("Generating GBM prices...");
        console.info(`  Start price: $${this.startPrice.toFixed(2)}`);
        console.info(`  Per-minute volatility: ${minuteVol.toPrecision(6)} (annual: ${this.volatility})`);
        console.info(`  Per-minute drift: ${minuteDrift.toPrecision(6)} (annual: ${this.drift})`);

        const prices = [this.startPrice];
        for (let i = 1; i < numBars; i++) {
            const shock = this.randomNormal(0, 1);
            const price =
                prices[i - 1] *
                Math.exp(
                    (minuteDrift - 0.5 * Math.pow(minuteVol, 2)) * 1 +
                        minuteVol * shock
                );

            // round to 2 decimal places
            prices.push(Math.round(price * 100) / 100);
        }

        const finalPrice = prices[prices.length - 1];
        const totalReturn =
            ((finalPrice - this.startPrice) / this.startPrice) * 100.0;

        console.info(`  Final price: $${finalPrice.toFixed(2)}`);
        console.info(`  Total return: ${totalReturn.toFixed(2)}%`);
        return prices;
    }

    /**
     * Box-Muller transform to generate normally distributed random numbers.
     */
    private randomNormal(mean: number, stdDev: number): number {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + z0 * stdDev;
    }

    /**
     * Adjust open prices so that each candle's open = previous candle's close,
     * ensuring continuity.
     */
    private adjustOpenPrices(data: OhlcRow[]): void {
        if (data.length === 0) return;

        // First candle's open is the startPrice
        data[0].open = this.startPrice;

        // Each subsequent candle's open is the previous candle's close
        for (let i = 1; i < data.length; i++) {
            data[i].open = data[i - 1].close;
        }
    }

    /**
     * Create OHLC data for multiple timeframes by grouping and aggregating
     * the minute-level data.
     */
    private createTimeframeData(minuteData: OhlcRow[]): TimeframeDict {
        const timeIntervals = ["1H", "4H", "1D", "1W", "1M"];
        const result: TimeframeDict = {};

        for (const interval of timeIntervals) {
            result[interval] = this.resampleToTimeframe(minuteData, interval);
        }

        return result;
    }

    /**
     * Resample minute-level data to a larger timeframe.
     */
    private resampleToTimeframe(data: OhlcRow[], timeInterval: string): OhlcRow[] {
        const groups = new Map<string, OhlcRow[]>();

        // Group data by time interval
        data.forEach(bar => {
            const date = DateTime.fromSeconds(bar.timestamp);
            const key = this.getTimeKey(date, timeInterval);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(bar);
        });

        // Aggregate each group into a single OHLC bar
        return Array.from(groups.entries())
            .map(([_, bars]) => ({
                timestamp: bars[0].timestamp,
                open: bars[0].open,
                high: Math.max(...bars.map(b => b.high)),
                low: Math.min(...bars.map(b => b.low)),
                close: bars[bars.length - 1].close
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get a string key for grouping based on the timeframe.
     */
    private getTimeKey(date: DateTime, timeInterval: string): string {
        switch (timeInterval) {
            case "1H":
                return date.toFormat("yyyy-MM-dd-HH");
            case "4H":
                return date.toFormat("yyyy-MM-dd-") + (Math.floor(date.hour / 4) * 4).toString().padStart(2, "0");
            case "1D":
                return date.toFormat("yyyy-MM-dd");
            case "1W":
                return date.toFormat("yyyy-WW");
            case "1M":
                return date.toFormat("yyyy-MM");
            default:
                throw new Error(`Unsupported timeframe: ${timeInterval}`);
        }
    }
}
