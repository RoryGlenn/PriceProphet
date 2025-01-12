import { render, screen, fireEvent } from '@testing-library/react';
import { ChartComponent } from '../components/ChartComponent';
import { createChart } from 'lightweight-charts';

// Mock data for testing
const mockData = {
  '1m': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
  '5m': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
  '15m': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
  '1h': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
  '4h': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
  'D': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
  'W': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
  'M': [{ time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }],
};

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock lightweight-charts
jest.mock('lightweight-charts', () => {
  const mockCandlestickSeries = {
    setData: jest.fn().mockReturnThis(),
    applyOptions: jest.fn().mockReturnThis(),
  };

  const mockTimeScale = {
    fitContent: jest.fn().mockReturnThis(),
    applyOptions: jest.fn().mockReturnThis(),
  };

  const mockChart = {
    addCandlestickSeries: jest.fn().mockReturnValue(mockCandlestickSeries),
    timeScale: jest.fn().mockReturnValue(mockTimeScale),
    applyOptions: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  };

  return {
    createChart: jest.fn().mockReturnValue(mockChart),
    CrosshairMode: { Normal: 1 },
  };
});

describe('ChartComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 800,
      height: 400,
    });
  });

  it('initializes chart with correct options', () => {
    render(<ChartComponent data={mockData} defaultInterval="1m" />);
    
    expect(createChart).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        width: 800,
        height: 400,
        layout: expect.objectContaining({
          background: { color: 'transparent' },
          textColor: 'rgba(255, 255, 255, 0.7)',
        }),
      })
    );
  });

  it('sets up candlestick series with correct styling', () => {
    render(<ChartComponent data={mockData} defaultInterval="1m" />);
    
    const mockChart = (createChart as jest.Mock).mock.results[0].value;
    expect(mockChart.addCandlestickSeries).toHaveBeenCalledWith(
      expect.objectContaining({
        upColor: '#00F5A0',
        downColor: '#ef5350',
        borderVisible: false,
      })
    );
  });

  it('displays all timeframe buttons with correct initial state', () => {
    render(<ChartComponent data={mockData} defaultInterval="1m" />);
    
    const buttons = [
      { label: '1 minute', value: '1m' },
      { label: '5 minutes', value: '5m' },
      { label: '15 minutes', value: '15m' },
      { label: '1 hour', value: '1h' },
      { label: '4 hours', value: '4h' },
      { label: '1 day', value: 'D' },
      { label: '1 week', value: 'W' },
      { label: '1 month', value: 'M' },
    ];

    buttons.forEach(({ label, value }) => {
      const button = screen.getByLabelText(label);
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-pressed', value === '1m' ? 'true' : 'false');
    });
  });

  it('updates chart options when timeframe changes', () => {
    render(<ChartComponent data={mockData} defaultInterval="1m" />);
    
    const mockChart = (createChart as jest.Mock).mock.results[0].value;
    const dayButton = screen.getByLabelText('1 day');
    
    fireEvent.click(dayButton);
    
    expect(mockChart.applyOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        timeScale: expect.objectContaining({
          timeVisible: false,
        }),
      })
    );
  });

  it('cleans up chart on unmount', () => {
    const { unmount } = render(<ChartComponent data={mockData} defaultInterval="1m" />);
    const mockChart = (createChart as jest.Mock).mock.results[0].value;
    
    unmount();
    
    expect(mockChart.remove).toHaveBeenCalled();
  });
});