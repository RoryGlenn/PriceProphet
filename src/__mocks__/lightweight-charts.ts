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

export const createChart = jest.fn((container: HTMLElement) => {
  if (!container) {
    throw new Error('Container element is required');
  }
  
  // Reset all mock implementations for each test
  mockChart.addCandlestickSeries.mockImplementation(() => mockCandlestickSeries);
  mockChart.timeScale.mockImplementation(() => mockTimeScale);
  mockChart.applyOptions.mockReturnThis();
  mockChart.resize.mockReturnThis();
  mockChart.remove.mockReturnThis();
  
  mockCandlestickSeries.setData.mockReturnThis();
  mockCandlestickSeries.applyOptions.mockReturnThis();
  
  mockTimeScale.fitContent.mockReturnThis();
  mockTimeScale.applyOptions.mockReturnThis();
  
  return mockChart;
}); 