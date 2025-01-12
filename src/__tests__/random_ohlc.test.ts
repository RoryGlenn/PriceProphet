import { RandomOHLC } from '../random_ohlc';

describe('RandomOHLC', () => {
  const config = {
    daysNeeded: 1,
    startPrice: 100,
    volatility: 1,
    drift: 1
  };

  let randomOHLC: RandomOHLC;

  beforeEach(() => {
    randomOHLC = new RandomOHLC(config);
  });

  it('generates data for all timeframes', () => {
    const data = randomOHLC.generateOhlcData();
    const expectedTimeframes = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'];
    
    expectedTimeframes.forEach(timeframe => {
      expect(data[timeframe]).toBeDefined();
      expect(data[timeframe].length).toBeGreaterThan(0);
    });
  });

  it('generates valid OHLC relationships', () => {
    const data = randomOHLC.generateOhlcData();
    
    Object.values(data).forEach(timeframeData => {
      timeframeData.forEach(candle => {
        expect(candle.high).toBeGreaterThanOrEqual(candle.open);
        expect(candle.high).toBeGreaterThanOrEqual(candle.close);
        expect(candle.low).toBeLessThanOrEqual(candle.open);
        expect(candle.low).toBeLessThanOrEqual(candle.close);
        expect(candle.high).toBeGreaterThanOrEqual(candle.low);
      });
    });
  });

  it('maintains price continuity', () => {
    const data = randomOHLC.generateOhlcData();
    
    Object.values(data).forEach(timeframeData => {
      for (let i = 1; i < timeframeData.length; i++) {
        expect(timeframeData[i].open).toBeCloseTo(timeframeData[i - 1].close, 2);
      }
    });
  });

  it('starts at the specified price', () => {
    const data = randomOHLC.generateOhlcData();
    
    Object.values(data).forEach(timeframeData => {
      if (timeframeData.length > 0) {
        expect(timeframeData[0].open).toBe(config.startPrice);
      }
    });
  });
}); 