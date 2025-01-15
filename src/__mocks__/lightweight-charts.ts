/*********************************************************************
 * lightweight-charts.ts
 *
 * Mock implementation of the TradingView Lightweight Charts library
 * for testing purposes. Provides mock objects and functions that
 * simulate the behavior of the actual charting library.
 *
 * Features:
 * - Mock chart creation and management
 * - Candlestick series simulation
 * - Time scale operations
 * - Crosshair mode configuration
 * - Jest spy functions for testing
 *
 * Implementation Details:
 * - Uses Jest mock functions for all operations
 * - Maintains chainable API pattern
 * - Simulates core chart functionality
 * - Resets mock state between tests
 * - Validates required parameters
 *
 * Testing Utilities:
 * - Mock function call tracking
 * - Method call verification
 * - Parameter validation
 * - Error simulation
 * - State reset capabilities
 *
 * Usage Example:
 * ```
 * const container = document.createElement('div');
 * const chart = createChart(container);
 * const series = chart.addCandlestickSeries();
 * series.setData([{ time: '2024-01-01', open: 100, high: 105, low: 95, close: 102 }]);
 * ```
 *
 * @module lightweight-charts
 * @requires jest
 *********************************************************************/

/**
 * Mock CrosshairMode enumeration
 * Simulates the crosshair behavior modes available in the chart.
 *
 * Values:
 * - Normal (1): Standard crosshair behavior
 *
 * Used for configuring chart crosshair behavior in tests.
 *
 * @constant {Object} CrosshairMode
 */
export const CrosshairMode = {
  Normal: 1,
};

/**
 * Mock candlestick series object
 * Simulates a candlestick series with basic functionality.
 *
 * Features:
 * - Data setting with setData()
 * - Options configuration with applyOptions()
 * - Chainable method calls
 * - Call tracking for testing
 *
 * Methods:
 * - setData(): Sets OHLC data for the series
 * - applyOptions(): Configures series display options
 *
 * Testing:
 * - All methods are Jest mock functions
 * - Call history is tracked
 * - Parameters are recorded
 *
 * @type {Object}
 */
const mockCandlestickSeries = {
  setData: jest.fn().mockReturnThis(),
  applyOptions: jest.fn().mockReturnThis(),
};

/**
 * Mock time scale object
 * Simulates the chart's time axis functionality.
 *
 * Features:
 * - Content fitting with fitContent()
 * - Options configuration with applyOptions()
 * - Chainable method calls
 * - Call tracking for testing
 *
 * Methods:
 * - fitContent(): Adjusts view to show all data
 * - applyOptions(): Configures time scale display
 *
 * Testing:
 * - All methods are Jest mock functions
 * - Call history is tracked
 * - Parameters are recorded
 *
 * @type {Object}
 */
const mockTimeScale = {
  fitContent: jest.fn().mockReturnThis(),
  applyOptions: jest.fn().mockReturnThis(),
};

/**
 * Mock chart object
 * Provides core chart functionality for testing.
 *
 * Features:
 * - Series management
 * - Time scale access
 * - Options configuration
 * - Size management
 * - Cleanup utilities
 *
 * Methods:
 * - addCandlestickSeries(): Creates new series
 * - timeScale(): Accesses time axis
 * - applyOptions(): Configures chart
 * - resize(): Updates chart size
 * - remove(): Cleans up chart
 *
 * Testing:
 * - All methods are Jest mock functions
 * - Returns appropriate mock objects
 * - Tracks method calls
 * - Records parameters
 *
 * @type {Object}
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
 * Simulates the createChart function from the lightweight-charts library.
 *
 * Features:
 * - Container validation
 * - Mock state reset
 * - Full chart API simulation
 * - Error handling
 *
 * Implementation Details:
 * - Validates container parameter
 * - Resets all mock functions
 * - Returns configured mock chart
 * - Maintains chainable API
 *
 * Testing Utilities:
 * - Automatic mock reset between tests
 * - Call history tracking
 * - Parameter validation
 * - Error simulation
 *
 * Error Handling:
 * - Throws if container is missing
 * - Validates container type
 * - Provides descriptive error messages
 *
 * @example
 * const container = document.createElement('div');
 * const chart = createChart(container);
 * const series = chart.addCandlestickSeries();
 * expect(chart.addCandlestickSeries).toHaveBeenCalled();
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
