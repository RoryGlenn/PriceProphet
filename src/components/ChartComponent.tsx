import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';
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

export const ChartComponent: React.FC<ChartComponentProps> = ({ data, defaultInterval = '1D' }) => {
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
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: interval.includes('min'),
        borderColor: 'rgba(43, 43, 67, 0.5)',
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 12,
        barSpacing: interval.includes('min') ? 3 : 6,
        minBarSpacing: 2,
        tickMarkFormatter: (time: Time) => {
          const date = typeof time === 'number' 
            ? DateTime.fromSeconds(time) 
            : DateTime.fromFormat(time as string, 'yyyy-MM-dd');
          return interval.includes('min') 
            ? date.toFormat('HH:mm')
            : date.toFormat('MMM dd');
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

    const setDataInChunks = (chartData: OhlcBar[]) => {
      const CHUNK_SIZE = 5000;
      let currentIndex = 0;

      const processNextChunk = () => {
        const chunk = chartData.slice(currentIndex, currentIndex + CHUNK_SIZE);
        if (chunk.length > 0) {
          if (currentIndex === 0) {
            candlestickSeries.setData(chunk);
          } else {
            chunk.forEach((bar) => candlestickSeries.update(bar));
          }
          currentIndex += CHUNK_SIZE;
          if (currentIndex < chartData.length) {
            setTimeout(processNextChunk, 0);
          } else {
            chart.timeScale().fitContent();
          }
        }
      };

      processNextChunk();
    };

    if (interval.includes('min') && data[interval].length > 5000) {
      setDataInChunks(data[interval]);
    } else {
      candlestickSeries.setData(data[interval]);
      chart.timeScale().fitContent();
    }

    candlestickSeries.applyOptions({
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    chart.priceScale('right').applyOptions({
      autoScale: true,
      borderColor: 'rgba(43, 43, 67, 0.5)',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
      ticksVisible: false,
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
        chart.timeScale().fitContent();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
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
          <ToggleButton value="1min" aria-label="1 minute">1m</ToggleButton>
          <ToggleButton value="5min" aria-label="5 minutes">5m</ToggleButton>
          <ToggleButton value="15min" aria-label="15 minutes">15m</ToggleButton>
          <ToggleButton value="1H" aria-label="1 hour">1H</ToggleButton>
          <ToggleButton value="4H" aria-label="4 hours">4H</ToggleButton>
          <ToggleButton value="1D" aria-label="1 day">1D</ToggleButton>
          <ToggleButton value="1W" aria-label="1 week">1W</ToggleButton>
          <ToggleButton value="1M" aria-label="1 month">1M</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box ref={chartContainerRef} sx={chartContainerStyles} />
    </Box>
  );
};
