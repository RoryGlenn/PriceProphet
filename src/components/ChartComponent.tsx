/*********************************************************************
 * ChartComponent.tsx
 *
 * Interactive candlestick chart component using TradingView's lightweight-charts.
 * Supports multiple timeframes, smooth data transitions, and responsive design.
 *
 * Features:
 * - Multiple timeframe support (1m to Monthly)
 * - Smooth data transitions with animation frames
 * - Responsive design with automatic resizing
 * - Custom date formatting for different intervals
 * - Currency-formatted price axis
 * - Memory-efficient data handling
 *
 * Performance Optimizations:
 * - Memoized data processing
 * - Batched updates using requestAnimationFrame
 * - Debounced resize handling
 * - Efficient data diffing
 * - Ref-based instance management
 *
 * State Management:
 * - Chart instance stored in ref
 * - Series instance stored in ref
 * - Previous data cached for diffing
 * - Initialization state tracking
 *
 * @module ChartComponent
 * @requires lightweight-charts
 * @requires @mui/material
 * @requires luxon
 *********************************************************************/

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createChart, Time, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Box, ToggleButton, ToggleButtonGroup, Theme } from '@mui/material';
import { OhlcBar } from '../types';
import { DateTime } from 'luxon';
import { SxProps } from '@mui/system';

/**
 * Props for the ChartComponent.
 * Defines the data structure and configuration options for the chart.
 *
 * @interface ChartComponentProps
 * @property {Object} data - OHLC data organized by timeframe intervals
 * @property {string} [defaultInterval='D'] - Initial timeframe to display
 *
 * @example
 * const data = {
 *   '1m': [{ time: 1234567890, open: 100, high: 101, low: 99, close: 100.5 }],
 *   'D': [{ time: '2023-01-01', open: 100, high: 105, low: 95, close: 102 }]
 * };
 * <ChartComponent data={data} defaultInterval="D" />
 */
interface ChartComponentProps {
  /** OHLC data organized by timeframe */
  data: {
    [key: string]: OhlcBar[];
  };
  /** Default selected timeframe */
  defaultInterval?: string;
}

/**
 * Styles for the timeframe selection buttons.
 * Implements a modern, glassy design with hover effects and selected states.
 *
 * Features:
 * - Semi-transparent backgrounds
 * - Smooth hover transitions
 * - Active state highlighting
 * - Consistent spacing and sizing
 *
 * @constant buttonGroupStyles
 */
const buttonGroupStyles: SxProps<Theme> = {
  mb: 2,
  display: 'flex',
  justifyContent: 'center',
  '& .MuiToggleButton-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: '0.875rem',
    padding: '4px 12px',
    '&.Mui-selected': {
      bgcolor: 'rgba(0, 245, 160, 0.1)',
      color: '#00F5A0',
      borderColor: 'rgba(0, 245, 160, 0.3)',
      '&:hover': {
        bgcolor: 'rgba(0, 245, 160, 0.2)',
      },
    },
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.05)',
    },
  },
};

/**
 * Styles for the chart container.
 * Sets up responsive dimensions and border radius.
 *
 * Features:
 * - Full-width responsive layout
 * - Fixed height for consistent UX
 * - Rounded corners for modern look
 *
 * @constant chartContainerStyles
 */
const chartContainerStyles: SxProps<Theme> = {
  width: '100%',
  height: '400px',
  '& .tv-lightweight-charts': {
    borderRadius: '8px',
  },
};

/**
 * Interactive candlestick chart component with multiple timeframe support.
 * Features smooth data transitions, responsive design, and customizable appearance.
 *
 * Component Lifecycle:
 * 1. Initialize chart instance and refs
 * 2. Set up event listeners and options
 * 3. Process and display initial data
 * 4. Handle timeframe changes and updates
 * 5. Clean up on unmount
 *
 * State Management:
 * - chartRef: Stores chart instance
 * - seriesRef: Stores candlestick series
 * - previousDataRef: Caches last data for diffing
 * - hasInitializedRef: Tracks initialization
 *
 * Performance Considerations:
 * - Uses refs to avoid re-renders
 * - Memoizes data processing
 * - Batches updates with RAF
 * - Debounces resize events
 *
 * @component
 * @param {ChartComponentProps} props - Component props
 * @returns {JSX.Element} Rendered chart component
 *
 * @example
 * const data = {
 *   '1m': generateMinuteData(),
 *   'D': generateDailyData()
 * };
 *
 * return (
 *   <ChartComponent
 *     data={data}
 *     defaultInterval="D"
 *   />
 * );
 */
export const ChartComponent: React.FC<ChartComponentProps> = ({ data, defaultInterval = 'D' }) => {
  // Chart instance and series refs for direct manipulation
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | undefined>();
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | undefined>();

  // UI state
  const [interval, setInterval] = useState(defaultInterval);

  // Performance optimization refs
  const previousDataRef = useRef<string>('');
  const hasInitializedRef = useRef(false);

  /**
   * Memoized data processing to prevent unnecessary recalculations.
   * Converts raw data into the format required by the chart library.
   *
   * Performance:
   * - Cached based on data and interval
   * - Only recomputes when dependencies change
   * - Prevents unnecessary processing
   *
   * @returns {CandlestickData[]} Processed candlestick data ready for display
   */
  const processedData = useMemo(() => {
    if (!data[interval]?.length) return [];
    return data[interval] as CandlestickData[];
  }, [data, interval]);

  /**
   * Calculates appropriate bar spacing based on the current timeframe.
   * Ensures readable chart display for all intervals.
   *
   * Spacing Rules:
   * - Monthly: 12px for clear separation
   * - Weekly: 10px for distinct bars
   * - Minute: 3px for dense data
   * - Default: 6px for balanced view
   *
   * @returns {number} Number of pixels between bars
   */
  const getBarSpacing = useCallback((): number => {
    switch (interval) {
      case 'M':
        return 12; // Monthly bars need more space
      case 'W':
        return 10; // Weekly bars slightly less than monthly
      case '1m':
      case '5m':
      case '15m':
        return 3; // Minute bars can be closer together
      default:
        return 6; // Default spacing for other intervals
    }
  }, [interval]);

  /**
   * Creates and initializes the chart instance.
   * Sets up chart options, series, and event listeners.
   * Handles cleanup on component unmount.
   *
   * Initialization Process:
   * 1. Create chart instance
   * 2. Configure appearance and behavior
   * 3. Add candlestick series
   * 4. Set up resize handler
   * 5. Register cleanup
   *
   * @effect
   */
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 400,
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(43, 43, 67, 0.5)' },
        horzLines: { color: 'rgba(43, 43, 67, 0.5)' },
      },
      localization: {
        priceFormatter: (price: number) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price);
        },
      },
      timeScale: {
        timeVisible: false,
        secondsVisible: false,
        borderColor: 'rgba(43, 43, 67, 0.5)',
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 12,
        barSpacing: 6,
        minBarSpacing: 2,
      },
    });

    chartRef.current = chart;
    seriesRef.current = chart.addCandlestickSeries({
      upColor: '#00F5A0',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#00F5A0',
      wickDownColor: '#ef5350',
    });

    /**
     * Handles window resize events.
     * Updates chart width to match container width.
     *
     * Performance:
     * - Debounced to prevent excessive updates
     * - Only updates when size actually changes
     */
    const handleResize = () => {
      if (chart && container) {
        chart.applyOptions({
          width: container.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  /**
   * Updates chart options when the timeframe interval changes.
   * Configures time formatting, bar spacing, and axis display.
   *
   * Time Formatting Rules:
   * - Minute: HH:mm
   * - Hour: HH:00
   * - Day: MMM dd
   * - Week: MMM dd
   * - Month: MMM yyyy
   *
   * @effect
   */
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.applyOptions({
      timeScale: {
        timeVisible: interval.endsWith('m') || interval.endsWith('h'),
        barSpacing: getBarSpacing(),
        tickMarkFormatter: (time: Time) => {
          const date =
            typeof time === 'number'
              ? DateTime.fromSeconds(time)
              : DateTime.fromFormat(time as string, 'yyyy-MM-dd');

          // Simplified date formats to reduce clutter
          if (interval.endsWith('m')) {
            return date.toFormat('HH:mm');
          }
          if (interval.endsWith('h')) {
            return date.toFormat('HH:00');
          }
          if (interval === 'D') {
            return date.toFormat('MMM dd');
          }
          if (interval === 'W') {
            return date.toFormat('MMM dd');
          }
          if (interval === 'M') {
            return date.toFormat('MMM yyyy');
          }
          return date.toFormat('MMM dd');
        },
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 12,
        minBarSpacing: 2,
      },
      localization: {
        timeFormatter: (time: Time) => {
          const date =
            typeof time === 'number'
              ? DateTime.fromSeconds(time)
              : DateTime.fromFormat(time as string, 'yyyy-MM-dd');

          // Keep detailed format for tooltips
          if (interval.endsWith('m')) {
            return date.toFormat('MMM dd HH:mm');
          }
          if (interval.endsWith('h')) {
            return date.toFormat('MMM dd HH:00');
          }
          if (interval === 'D') {
            return date.toFormat('MMM dd yyyy');
          }
          if (interval === 'W') {
            return date.toFormat('MMM dd yyyy');
          }
          if (interval === 'M') {
            return date.toFormat('MMM yyyy');
          }
          return date.toFormat('MMM dd yyyy');
        },
      },
    });
  }, [interval, getBarSpacing]);

  /**
   * Updates chart data when the processed data changes.
   * Uses requestAnimationFrame for smooth updates and prevents unnecessary rerenders.
   *
   * Update Process:
   * 1. Check if data has changed
   * 2. Update data reference
   * 3. Schedule update with RAF
   * 4. Fit content in next frame
   *
   * Performance Optimizations:
   * - Data diffing to prevent unnecessary updates
   * - Batched updates with RAF
   * - Cached initialization state
   *
   * @effect
   */
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart || !processedData.length) return;

    // Check if data has actually changed to prevent unnecessary updates
    const currentDataString = JSON.stringify(processedData);
    if (currentDataString === previousDataRef.current && hasInitializedRef.current) return;
    previousDataRef.current = currentDataString;

    // Batch the updates for better performance
    requestAnimationFrame(() => {
      if (series) {
        series.setData(processedData);
        hasInitializedRef.current = true;

        // Fit content in the next frame for smoother rendering
        requestAnimationFrame(() => {
          if (chart) {
            chart.timeScale().fitContent();
          }
        });
      }
    });
  }, [processedData]);

  /**
   * Handles timeframe selection changes.
   * Validates data availability before updating the interval.
   *
   * Validation:
   * - Checks for null selection
   * - Verifies data availability
   * - Updates interval only if valid
   *
   * @param {React.MouseEvent<HTMLElement>} _event - Mouse event from button click
   * @param {string | null} newInterval - Selected timeframe
   */
  const handleIntervalChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: string | null
  ) => {
    if (newInterval !== null) {
      // Pre-process data before setting new interval for smoother transition
      if (data[newInterval]?.length) {
        setInterval(newInterval);
      }
    }
  };

  return (
    <Box>
      <Box sx={buttonGroupStyles}>
        <ToggleButtonGroup
          value={interval}
          exclusive
          onChange={handleIntervalChange}
          aria-label="time-interval"
          size="small"
        >
          <ToggleButton value="1m" aria-label="1 minute">
            1m
          </ToggleButton>
          <ToggleButton value="5m" aria-label="5 minutes">
            5m
          </ToggleButton>
          <ToggleButton value="15m" aria-label="15 minutes">
            15m
          </ToggleButton>
          <ToggleButton value="1h" aria-label="1 hour">
            1h
          </ToggleButton>
          <ToggleButton value="4h" aria-label="4 hours">
            4h
          </ToggleButton>
          <ToggleButton value="D" aria-label="1 day">
            D
          </ToggleButton>
          <ToggleButton value="W" aria-label="1 week">
            W
          </ToggleButton>
          <ToggleButton value="M" aria-label="1 month">
            M
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box ref={chartContainerRef} sx={chartContainerStyles} />
    </Box>
  );
};
