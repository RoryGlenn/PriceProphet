export const CrosshairMode = {
  Normal: 1,
};

const mockCandlestickSeries = {
  setData: jest.fn().mockReturnThis(),
  applyOptions: jest.fn().mockReturnThis(),
};

const mockTimeScale = {
  fitContent: jest.fn().mockReturnThis(),
  applyOptions: jest.fn().mockReturnThis(),
};

const mockChart = {
  addCandlestickSeries: jest.fn(() => mockCandlestickSeries),
  timeScale: jest.fn(() => mockTimeScale),
  applyOptions: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
};

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
