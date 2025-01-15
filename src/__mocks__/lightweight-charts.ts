/*********************************************************************
 * lightweight-charts.ts
 *
 * Mock implementation of the TradingView Lightweight Charts library
 * for testing purposes. Provides mock objects and functions that
 * simulate the behavior of the actual charting library.
 *
 * @module lightweight-charts
 *********************************************************************/

/**
 * Mock CrosshairMode enumeration
 * Simulates the crosshair behavior modes available in the chart
 */
export const CrosshairMode = {
  Normal: 1,
};

/**
 * Mock candlestick series object
 * Simulates a candlestick series with basic functionality
 */
const mockCandlestickSeries = {
  setData: jest.fn().mockReturnThis(),
  applyOptions: jest.fn().mockReturnThis(),
};

/**
 * Mock time scale object
 * Simulates the chart's time axis functionality
 */
const mockTimeScale = {
  fitContent: jest.fn().mockReturnThis(),
  applyOptions: jest.fn().mockReturnThis(),
};

/**
 * Mock chart object
 * Provides core chart functionality for testing
 */
const mockChart = {
  addCandlestickSeries: jest.fn(() => mockCandlestickSeries),
  timeScale: jest.fn(() => mockTimeScale),
  applyOptions: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
};

/**
 * Creates a mock chart instance
 * Simulates the createChart function from the lightweight-charts library
 *
 * @param {HTMLElement} container - DOM element to render the chart in
 * @throws {Error} If container element is not provided
 * @returns {Object} Mock chart instance with testing utilities
 */
export const createChart = jest.fn().mockImplementation((container: HTMLElement) => {
  if (!container) {
    throw new Error('Container element is required');
  }

  // Reset all mock implementations for each test
  mockChart.addCandlestickSeries.mockClear();
  mockChart.timeScale.mockClear();
  mockChart.applyOptions.mockClear();
  mockChart.resize.mockClear();
  mockChart.remove.mockClear();

  mockCandlestickSeries.setData.mockClear();
  mockCandlestickSeries.applyOptions.mockClear();

  mockTimeScale.fitContent.mockClear();
  mockTimeScale.applyOptions.mockClear();

  // Return the mockChart object directly
  return mockChart;
});
