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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.RandomOHLC = void 0;
var luxon_1 = require("luxon");
var data_forge_1 = require("data-forge");
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
        this.timeIntervals = ['1min', '5min', '15min', '1H', '4H', '1D', '1W', '1M'];
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
        var result = this.createTimeIntervalData(minuteData);
        return this.normalizeTimeIntervals(result, minuteData);
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
        var startDate = luxon_1.DateTime.fromISO('2030-01-01T00:00:00');
        var dates = [];
        for (var i = 0; i < numMinutes; i++) {
            dates.push(startDate.plus({ minutes: i }));
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
     * Ensure all time intervals have the same start and end times.
     * Filters out any data points outside the main data range.
     *
     * @param result TimeIntervalDict to normalize
     * @param minuteData Original minute data for reference
     * @returns Normalized TimeIntervalDict
     */
    RandomOHLC.prototype.normalizeTimeIntervals = function (result, minuteData) {
        var startTimestamp = minuteData[0].timestamp;
        var endTimestamp = minuteData[minuteData.length - 1].timestamp;
        Object.keys(result).forEach(function (interval) {
            result[interval] = result[interval].filter(function (bar) { return bar.timestamp >= startTimestamp && bar.timestamp <= endTimestamp; });
        });
        return result;
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
        var _this = this;
        // Convert data to DataFrame
        var df = new data_forge_1.DataFrame(data);
        /*
         * Define the grouping period based on the time interval.
         * data-forge will automatically handle the grouping and aggregation.
         * This is similar to pandas resample() function.
         */
        var getPeriod = function (interval) {
            switch (interval) {
                case '1min': return '1m';
                case '5min': return '5m';
                case '15min': return '15m';
                case '1H': return '1h';
                case '4H': return '4h';
                case '1D': return '1d';
                case '1W': return '1w';
                case '1M': return '1M';
                default: throw new Error("Unsupported time interval: " + interval);
            }
        };
        /*
         * Group the data by time interval and aggregate:
         * - First value in group becomes open
         * - Max value in group becomes high
         * - Min value in group becomes low
         * - Last value in group becomes close
         * - First timestamp in group becomes the interval timestamp
         */
        var aggregated = df
            .groupBy(function (row) {
            var date = luxon_1.DateTime.fromSeconds(row.timestamp);
            return _this.getTimeKey(date, timeInterval);
        })
            .select(function (group) {
            var rows = group.toArray();
            return {
                timestamp: rows[0].timestamp,
                open: rows[0].open,
                high: Math.max.apply(Math, rows.map(function (r) { return r.high; })),
                low: Math.min.apply(Math, rows.map(function (r) { return r.low; })),
                close: rows[rows.length - 1].close // Last price
            };
        })
            .toArray();
        // Ensure timestamps are properly aligned to interval boundaries
        return aggregated.map(function (bar) {
            var date = luxon_1.DateTime.fromSeconds(bar.timestamp);
            var alignedTimestamp;
            switch (timeInterval) {
                case '1min':
                    alignedTimestamp = date.set({ second: 0 }).toSeconds();
                    break;
                case '5min':
                    alignedTimestamp = date.set({
                        minute: Math.floor(date.minute / 5) * 5,
                        second: 0
                    }).toSeconds();
                    break;
                case '15min':
                    alignedTimestamp = date.set({
                        minute: Math.floor(date.minute / 15) * 15,
                        second: 0
                    }).toSeconds();
                    break;
                case '1H':
                    alignedTimestamp = date.set({ minute: 0, second: 0 }).toSeconds();
                    break;
                case '4H':
                    alignedTimestamp = date.set({
                        hour: Math.floor(date.hour / 4) * 4,
                        minute: 0,
                        second: 0
                    }).toSeconds();
                    break;
                case '1D':
                    alignedTimestamp = date.startOf('day').toSeconds();
                    break;
                case '1W':
                    alignedTimestamp = date.startOf('week').toSeconds();
                    break;
                case '1M':
                    alignedTimestamp = date.startOf('month').toSeconds();
                    break;
                default:
                    alignedTimestamp = bar.timestamp;
            }
            return __assign(__assign({}, bar), { timestamp: alignedTimestamp });
        }).sort(function (a, b) { return a.timestamp - b.timestamp; });
    };
    /**
     * Get a string key for grouping data points by time interval.
     * Creates consistent keys for aggregating data into larger intervals.
     *
     * @param date DateTime object to format
     * @param timeInterval Target time interval
     * @returns Formatted string key
     * @throws Error if timeInterval is not supported
     */
    RandomOHLC.prototype.getTimeKey = function (date, timeInterval) {
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
            case '1min':
                return date.toFormat('yyyy-MM-dd-HH-mm');
            case '5min':
                return (date.toFormat('yyyy-MM-dd-HH-') +
                    (Math.floor(date.minute / 5) * 5).toString().padStart(2, '0'));
            case '15min':
                return (date.toFormat('yyyy-MM-dd-HH-') +
                    (Math.floor(date.minute / 15) * 15).toString().padStart(2, '0'));
            case '1H':
                return date.toFormat('yyyy-MM-dd-HH');
            case '4H':
                return (date.toFormat('yyyy-MM-dd-') + (Math.floor(date.hour / 4) * 4).toString().padStart(2, '0'));
            case '1D':
                return date.toFormat('yyyy-MM-dd');
            case '1W':
                return date.startOf('week').toFormat('yyyy-MM-dd');
            case '1M':
                return date.startOf('month').toFormat('yyyy-MM-dd');
            default:
                throw new Error("Unsupported time interval: " + timeInterval);
        }
    };
    return RandomOHLC;
}());
exports.RandomOHLC = RandomOHLC;
