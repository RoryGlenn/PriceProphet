"use strict";
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
exports.__esModule = true;
exports.RandomOHLC = void 0;
var luxon_1 = require("luxon");
/**
 * Generates synthetic OHLC price data using Geometric Brownian Motion.
 * Supports multiple time intervals and ensures data consistency.
 */
var RandomOHLC = /** @class */ (function () {
    /**
     * Initialize the RandomOHLC instance.
     *
     * @param config Configuration object containing:
     *   daysNeeded - Number of days of data to generate
     *   startPrice - Initial price for the simulation
     *   volatility - Annual volatility parameter for GBM (typically 1-3)
     *   drift - Annual drift parameter for GBM (typically 1-3)
     */
    function RandomOHLC(config) {
        var _this = this;
        /**
         * Create OHLC data for multiple time intervals.
         * Maps minute data to each supported time interval.
         *
         * @param minuteData Base minute-level OHLC data
         * @returns TimeIntervalDict containing data for all intervals
         */
        this.createTimeIntervalData = function (minuteData) {
            return Object.fromEntries(_this.timeIntervals.map(function (interval) { return [
                interval,
                _this.resampleToTimeInterval(minuteData, interval),
            ]; }));
        };
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
    RandomOHLC.prototype.generateOhlcData = function () {
        var minuteData = this.generateMinuteData();
        var timeIntervalData = this.createTimeIntervalData(minuteData);
        this.validateOpenPrice(timeIntervalData);
        return timeIntervalData;
    };
    /**
     * Generate minute-level OHLC data using GBM.
     * This is the base data from which all other intervals are derived.
     *
     * @returns Array of minute-level OHLC rows
     */
    RandomOHLC.prototype.generateMinuteData = function () {
        var minutesInDay = 1440;
        var numMinutes = this.daysNeeded * minutesInDay;
        console.info("Generating " + this.daysNeeded + " days of data (" + numMinutes + " minutes).");
        var randPrices = this.generateRandomPrices(numMinutes);
        var dates = this.generateDateRange(numMinutes);
        var minuteData = this.createMinuteOhlcData(dates, randPrices);
        this.adjustOpenPrices(minuteData);
        return minuteData;
    };
    /**
     * Generate a range of dates at minute intervals.
     * Starts from a fixed date (2030-01-01) for consistency.
     *
     * @param numMinutes Number of minutes to generate
     * @returns Array of DateTime objects
     */
    RandomOHLC.prototype.generateDateRange = function (numMinutes) {
        // Start at the beginning of the day
        var startDate = luxon_1.DateTime.fromISO('2030-01-01T00:00:00').startOf('day');
        var dates = [];
        // Generate complete days of data
        for (var i = 0; i < numMinutes; i++) {
            var date = startDate.plus({ minutes: i });
            // Only include if it's within a complete day
            if (date < startDate.plus({ days: this.daysNeeded })) {
                dates.push(date);
            }
        }
        console.info("Date range: " + dates[0].toISO() + " to " + dates[dates.length - 1].toISO());
        return dates;
    };
    /**
     * Create minute-level OHLC data by combining dates and prices.
     * At the minute level, all OHLC values are initially the same.
     *
     * @param dates Array of DateTime objects
     * @param prices Array of price values
     * @returns Array of OHLC rows
     */
    RandomOHLC.prototype.createMinuteOhlcData = function (dates, prices) {
        return dates.map(function (date, idx) { return ({
            timestamp: Math.trunc(date.toSeconds()),
            open: prices[idx],
            high: prices[idx],
            low: prices[idx],
            close: prices[idx]
        }); });
    };
    /**
     * Calculate per-minute volatility and drift from annual values.
     * Converts annual parameters to per-minute values for GBM simulation.
     *
     * @returns Object containing minute-level volatility and drift
     */
    RandomOHLC.prototype.calculateMinuteParameters = function () {
        var minutesInYear = 525600;
        var minuteVol = this.volatility / Math.sqrt(minutesInYear);
        var minuteDrift = this.drift / minutesInYear;
        console.info('Generating GBM prices...');
        console.info("  Start price: $" + this.startPrice);
        console.info("  Per-minute volatility: " + minuteVol.toPrecision(6) + " (annual: " + this.volatility + ")");
        console.info("  Per-minute drift: " + minuteDrift.toPrecision(6) + " (annual: " + this.drift + ")");
        return { minuteVol: minuteVol, minuteDrift: minuteDrift };
    };
    /**
     * Generate simulated prices using Geometric Brownian Motion.
     * Uses Box-Muller transform for normal distribution sampling.
     *
     * @param numBars Number of price points to generate
     * @returns Array of simulated prices
     */
    RandomOHLC.prototype.generateRandomPrices = function (numBars) {
        var _a = this.calculateMinuteParameters(), minuteVol = _a.minuteVol, minuteDrift = _a.minuteDrift;
        var prices = [this.startPrice];
        for (var i = 1; i < numBars; i++) {
            var shock = this.randomNormal(0, 1);
            var price = this.calculateNextPrice(prices[i - 1], minuteVol, minuteDrift, shock);
            prices.push(price);
        }
        this.logPriceStats(prices);
        return prices;
    };
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
    RandomOHLC.prototype.calculateNextPrice = function (prevPrice, minuteVol, minuteDrift, shock) {
        var price = prevPrice * Math.exp((minuteDrift - 0.5 * Math.pow(minuteVol, 2)) * 1 + minuteVol * shock);
        return Math.round(price * 100) / 100;
    };
    /**
     * Log statistics about the generated prices.
     * Includes final price and total return percentage.
     *
     * @param prices Array of generated prices
     */
    RandomOHLC.prototype.logPriceStats = function (prices) {
        var finalPrice = prices[prices.length - 1];
        var totalReturn = ((finalPrice - this.startPrice) / this.startPrice) * 100.0;
        console.info("  Final price: $" + finalPrice.toFixed(2));
        console.info("  Total return: " + totalReturn.toFixed(2) + "%");
    };
    /**
     * Generate normally distributed random numbers using Box-Muller transform.
     *
     * @param mean Mean of the normal distribution
     * @param stdDev Standard deviation of the normal distribution
     * @returns Random number from normal distribution
     */
    RandomOHLC.prototype.randomNormal = function (mean, stdDev) {
        var u1 = Math.random();
        var u2 = Math.random();
        var z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + z0 * stdDev;
    };
    /**
     * Adjust open prices to ensure price continuity.
     * Makes each candle's open equal to the previous candle's close.
     *
     * @param data Array of OHLC rows to adjust
     */
    RandomOHLC.prototype.adjustOpenPrices = function (data) {
        if (data.length === 0)
            return;
        data[0].open = this.startPrice;
        for (var i = 1; i < data.length; i++) {
            data[i].open = data[i - 1].close;
        }
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
    RandomOHLC.prototype.resampleToTimeInterval = function (data, timeInterval) {
        // If it's 1-minute data, return as is
        if (timeInterval === '1m') {
            return data;
        }
        // Define the chunk size for each interval
        var minutesPerChunk = {
            '5m': 5,
            '15m': 15,
            '1h': 60,
            '4h': 240,
            'D': 1440,
            'W': 1440 * 7,
            'M': 1440 * 30
        }[timeInterval] || 1;
        // Group data into chunks
        var chunks = [];
        for (var i = 0; i < data.length; i += minutesPerChunk) {
            chunks.push(data.slice(i, i + minutesPerChunk));
        }
        // Convert chunks to OHLC bars
        return chunks.map(function (chunk) { return ({
            timestamp: chunk[0].timestamp,
            open: chunk[0].open,
            high: Math.max.apply(Math, chunk.map(function (bar) { return bar.high; })),
            low: Math.min.apply(Math, chunk.map(function (bar) { return bar.low; })),
            close: chunk[chunk.length - 1].close
        }); });
    };
    /**
     * Validate that all intervals have the same final open price
     * @param result TimeIntervalDict to validate
     * @returns void, throws error if validation fails
     */
    RandomOHLC.prototype.validateOpenPrice = function (result) {
        var _a;
        var openValues = Object.entries(result).map(function (_a) {
            var interval = _a[0], data = _a[1];
            return ({
                interval: interval,
                open: data[0].open,
                timestamp: data[0].timestamp
            });
        });
        console.log('First open prices:', openValues);
        var firstOpen = (_a = openValues[0]) === null || _a === void 0 ? void 0 : _a.open;
        var mismatchedIntervals = openValues.filter(function (item) { return Math.abs((item.open - firstOpen) / firstOpen) > 0.0001; });
        if (mismatchedIntervals.length > 0) {
            console.error('Open price mismatch:', mismatchedIntervals);
            throw new Error('Open prices do not match across intervals');
        }
    };
    return RandomOHLC;
}());
exports.RandomOHLC = RandomOHLC;
