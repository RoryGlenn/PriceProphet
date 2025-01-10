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
 * Props for the ChartComponent
 *
 * @interface ChartComponentProps
 * @property {Object} data - OHLC data organized by timeframe intervals
 * @property {string} [defaultInterval='D'] - Initial timeframe to display
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
 * @param props - Component props
 * @param props.data - OHLC data organized by timeframe
 * @param props.defaultInterval - Default selected timeframe
 */
export const ChartComponent: React.FC<ChartComponentProps> = ({ data, defaultInterval = 'D' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | undefined>();
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | undefined>();
  const [interval, setInterval] = useState(defaultInterval);
  const previousDataRef = useRef<string>('');

  /**
   * Memoized data processing to prevent unnecessary recalculations.
   * Converts raw data into the format required by the chart library.
   *
   * @returns Array of processed candlestick data ready for display
   */
  const processedData = useMemo(() => {
    if (!data[interval]?.length) return [];
    return data[interval] as CandlestickData[];
  }, [data, interval]);

  /**
   * Calculates appropriate bar spacing based on the current timeframe.
   * Ensures readable chart display for all intervals.
   *
   * @returns Number of pixels between bars
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
   */
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart || !processedData.length) return;

    // Check if data has actually changed to prevent unnecessary updates
    const currentDataString = JSON.stringify(processedData);
    if (currentDataString === previousDataRef.current) return;
    previousDataRef.current = currentDataString;

    // Batch the updates for better performance
    requestAnimationFrame(() => {
      if (series) {
        series.setData(processedData);

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
   * @param _event Mouse event from button click
   * @param newInterval Selected timeframe
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
