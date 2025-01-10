import React, { useEffect, useRef, useState } from 'react';
import { createChart, Time } from 'lightweight-charts';
import { Box, ToggleButton, ToggleButtonGroup, Theme } from '@mui/material';
import { OhlcBar } from '../types';
import { DateTime } from 'luxon';
import { SxProps } from '@mui/system';

interface ChartComponentProps {
  data: {
    [key: string]: OhlcBar[];
  };
  defaultInterval?: string;
}

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

const chartContainerStyles: SxProps<Theme> = {
  width: '100%', 
  height: '400px',
  '& .tv-lightweight-charts': {
    borderRadius: '8px',
  },
};

export const ChartComponent: React.FC<ChartComponentProps> = ({ data, defaultInterval = 'D' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState(defaultInterval);

  const handleIntervalChange = (_event: React.MouseEvent<HTMLElement>, newInterval: string) => {
    if (newInterval !== null) {
      setInterval(newInterval);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current || !data[interval]?.length) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
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
        timeVisible: interval.endsWith('m') || interval.endsWith('h'),
        secondsVisible: false,
        borderColor: 'rgba(43, 43, 67, 0.5)',
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 12,
        barSpacing: interval.endsWith('m') ? 3 : 6,
        minBarSpacing: 2,
        tickMarkFormatter: (time: Time) => {
          const date = typeof time === 'number' 
            ? DateTime.fromSeconds(time) 
            : DateTime.fromFormat(time as string, 'yyyy-MM-dd');
          
          // For minute intervals, show date and time
          if (interval.endsWith('m')) {
            return date.toFormat('MMM dd HH:mm');
          }
          // For hour intervals, show date and hour
          if (interval.endsWith('h')) {
            return date.toFormat('MMM dd HH:00');
          }
          // For daily intervals
          if (interval === 'D') {
            return date.toFormat('MMM dd');
          }
          // For weekly intervals
          if (interval === 'W') {
            return date.toFormat('MMM dd');
          }
          // For monthly intervals
          if (interval === 'M') {
            return date.toFormat('MMM yyyy');
          }
          return date.toFormat('MMM dd');
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00F5A0',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#00F5A0',
      wickDownColor: '#ef5350',
    });

    // Add tooltip formatter for consistent date display
    chart.applyOptions({
      localization: {
        timeFormatter: (time: Time) => {
          const date = typeof time === 'number' 
            ? DateTime.fromSeconds(time) 
            : DateTime.fromFormat(time as string, 'yyyy-MM-dd');
          
          // Use same format as x-axis labels
          if (interval.endsWith('m')) {
            return date.toFormat('MMM dd HH:mm');
          }
          if (interval.endsWith('h')) {
            return date.toFormat('MMM dd HH:00');
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
      },
    });

    let timeoutId: NodeJS.Timeout | null = null;

    const setDataInChunks = (chartData: OhlcBar[]) => {
      const CHUNK_SIZE = 5000;
      let currentIndex = 0;

      const processNextChunk = () => {
        const chunk = chartData.slice(currentIndex, currentIndex + CHUNK_SIZE);
        if (chunk.length > 0) {
          if (currentIndex === 0) {
            candlestickSeries.setData(chunk);
          } else {
            chunk.forEach(bar => candlestickSeries.update(bar));
          }
          currentIndex += CHUNK_SIZE;
          if (currentIndex < chartData.length) {
            timeoutId = setTimeout(processNextChunk, 0);
          } else {
            chart.timeScale().fitContent();
          }
        }
      };

      processNextChunk();
    };

    if (interval.endsWith('m') && data[interval].length > 5000) {
      setDataInChunks(data[interval]);
    } else {
      candlestickSeries.setData(data[interval]);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current!.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, interval]);

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
          <ToggleButton value="1m" aria-label="1 minute">1m</ToggleButton>
          <ToggleButton value="5m" aria-label="5 minutes">5m</ToggleButton>
          <ToggleButton value="15m" aria-label="15 minutes">15m</ToggleButton>
          <ToggleButton value="1h" aria-label="1 hour">1h</ToggleButton>
          <ToggleButton value="4h" aria-label="4 hours">4h</ToggleButton>
          <ToggleButton value="D" aria-label="1 day">D</ToggleButton>
          <ToggleButton value="W" aria-label="1 week">W</ToggleButton>
          <ToggleButton value="M" aria-label="1 month">M</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box ref={chartContainerRef} sx={chartContainerStyles} />
    </Box>
  );
};
