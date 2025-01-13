import { RandomOHLC, PriceValidationError, DataGenerationError } from '../randomOHLC';

describe('RandomOHLC', () => {
  // Default test configuration
  const defaultConfig = {
    daysNeeded: 5,
    startPrice: 1000,
    volatility: 2,
    drift: 1.5,
  };

  describe('constructor', () => {
    it('should initialize with valid configuration', () => {
      const randOHLC = new RandomOHLC(defaultConfig);
      expect(randOHLC).toBeInstanceOf(RandomOHLC);
    });

    it('should initialize with minimum valid values', () => {
      const minConfig = {
        daysNeeded: 1,
        startPrice: 1,
        volatility: 1,
        drift: 1,
      };
      const randOHLC = new RandomOHLC(minConfig);
      expect(randOHLC).toBeInstanceOf(RandomOHLC);
    });
  });

  describe('generateOhlcData', () => {
    let randOHLC: RandomOHLC;

    beforeEach(() => {
      randOHLC = new RandomOHLC(defaultConfig);
    });

    it('should generate data for all time intervals', () => {
      const data = randOHLC.generateOhlcData();
      const expectedIntervals = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'];
      expectedIntervals.forEach((interval) => {
        expect(data[interval]).toBeDefined();
        expect(Array.isArray(data[interval])).toBe(true);
        expect(data[interval].length).toBeGreaterThan(0);
      });
    });

    it('should generate correct number of daily bars', () => {
      const data = randOHLC.generateOhlcData();
      // For 5 days, we expect 5 daily bars
      expect(data['D'].length).toBe(defaultConfig.daysNeeded);
    });

    it('should generate correct number of minute bars', () => {
      const data = randOHLC.generateOhlcData();
      // For 5 days, we expect 5 * 1440 minute bars
      const expectedMinuteBars = defaultConfig.daysNeeded * 1440;
      expect(data['1m'].length).toBe(expectedMinuteBars);
    });

    describe('OHLC price relationships', () => {
      const randomOHLC = new RandomOHLC(defaultConfig);
      const data = randomOHLC.generateOhlcData();
      const allBars = Object.values(data).flatMap((timeframeData) => timeframeData);

      test.each(allBars)('bar should maintain valid OHLC relationships', (bar) => {
        expect(bar.high).toBeGreaterThanOrEqual(Math.min(bar.open, bar.close));
        expect(bar.low).toBeLessThanOrEqual(Math.max(bar.open, bar.close));
        expect(bar.high).toBeGreaterThanOrEqual(bar.low);
      });
    });

    it('should generate timestamps in correct order', () => {
      const data = randOHLC.generateOhlcData();
      Object.values(data).forEach((timeframeData) => {
        for (let i = 1; i < timeframeData.length; i++) {
          expect(timeframeData[i].timestamp).toBeGreaterThan(timeframeData[i - 1].timestamp);
        }
      });
    });

    it('should start from the configured start price', () => {
      const data = randOHLC.generateOhlcData();
      expect(data['1m'][0].open).toBe(defaultConfig.startPrice);
    });

    it('should maintain price continuity between bars', () => {
      const data = randOHLC.generateOhlcData();
      Object.values(data).forEach((timeframeData) => {
        for (let i = 1; i < timeframeData.length; i++) {
          expect(timeframeData[i].open).toBe(timeframeData[i - 1].close);
        }
      });
    });
  });

  describe('error handling', () => {
    describe('validateOpenPrice', () => {
      test('should throw DataGenerationError for empty data', () => {
        const randomOHLC = new RandomOHLC(defaultConfig);
        const emptyData = {};

        expect(() => {
          // @ts-ignore - accessing private method for testing
          randomOHLC.validateOpenPrice(emptyData);
        }).toThrow('No data available for validation');
      });

      test('should throw DataGenerationError for invalid opening price', () => {
        const randomOHLC = new RandomOHLC(defaultConfig);
        const invalidData = {
          '1m': [{ open: NaN, high: 100, low: 90, close: 95, timestamp: 1000 }],
          '5m': [{ open: NaN, high: 100, low: 90, close: 95, timestamp: 1000 }],
        };

        expect(() => {
          // @ts-ignore - accessing private method for testing
          randomOHLC.validateOpenPrice(invalidData);
        }).toThrow('Invalid opening price detected');
      });

      test('should throw PriceValidationError for mismatched open prices', () => {
        const randomOHLC = new RandomOHLC(defaultConfig);
        const mismatchedData = {
          '1m': [{ open: 100, high: 110, low: 90, close: 105, timestamp: 1000 }],
          '5m': [{ open: 200, high: 210, low: 190, close: 205, timestamp: 1000 }],
        };

        expect(() => {
          // @ts-ignore - accessing private method for testing
          randomOHLC.validateOpenPrice(mismatchedData);
        }).toThrow('Open prices do not match across intervals');
      });

      test('should throw DataGenerationError for unexpected errors', () => {
        const randomOHLC = new RandomOHLC(defaultConfig);
        const invalidData = null;

        expect(() => {
          // @ts-ignore - accessing private method for testing
          randomOHLC.validateOpenPrice(invalidData);
        }).toThrow('Unexpected error during price validation');
      });
    });

    test('should throw error for invalid data', () => {
      const config = {
        ...defaultConfig,
        daysNeeded: 0,
      };
      const randomOHLC = new RandomOHLC(config);
      expect(randomOHLC.generateOhlcData).toThrow();
    });
  });

  describe('PriceValidationError', () => {
    it('should create error with correct name and message', () => {
      const error = new PriceValidationError('Test error');
      expect(error.name).toBe('PriceValidationError');
      expect(error.message).toBe('Test error');
    });
  });

  describe('DataGenerationError', () => {
    it('should create error with correct name and message', () => {
      const error = new DataGenerationError('Test error');
      expect(error.name).toBe('DataGenerationError');
      expect(error.message).toBe('Test error');
    });
  });

  describe('time interval consistency', () => {
    it('should generate consistent data across time intervals', () => {
      const randOHLC = new RandomOHLC(defaultConfig);
      const data = randOHLC.generateOhlcData();

      // Check if daily high/low encompasses minute data
      const validDailyBars = data['D'].filter((dailyBar) => {
        const minuteBarsForDay = data['1m'].filter(
          (minuteBar) =>
            minuteBar.timestamp >= dailyBar.timestamp &&
            minuteBar.timestamp < dailyBar.timestamp + 86400
        );
        return minuteBarsForDay.length > 0;
      });

      validDailyBars.forEach((dailyBar) => {
        const minuteBarsForDay = data['1m'].filter(
          (minuteBar) =>
            minuteBar.timestamp >= dailyBar.timestamp &&
            minuteBar.timestamp < dailyBar.timestamp + 86400
        );
        const minuteHigh = Math.max(...minuteBarsForDay.map((bar) => bar.high));
        const minuteLow = Math.min(...minuteBarsForDay.map((bar) => bar.low));

        expect(dailyBar.high).toBeGreaterThanOrEqual(minuteHigh);
        expect(dailyBar.low).toBeLessThanOrEqual(minuteLow);
      });
    });

    it('should generate correct number of bars for each interval', () => {
      const randOHLC = new RandomOHLC(defaultConfig);
      const data = randOHLC.generateOhlcData();

      const minutesInDay = 1440;
      const totalMinutes = defaultConfig.daysNeeded * minutesInDay;

      expect(data['1m'].length).toBe(totalMinutes);
      expect(data['5m'].length).toBe(Math.floor(totalMinutes / 5));
      expect(data['15m'].length).toBe(Math.floor(totalMinutes / 15));
      expect(data['1h'].length).toBe(Math.floor(totalMinutes / 60));
      expect(data['4h'].length).toBe(Math.floor(totalMinutes / 240));
      expect(data['D'].length).toBe(defaultConfig.daysNeeded);
      // Weekly and monthly bars will depend on the date range
    });
  });
});
