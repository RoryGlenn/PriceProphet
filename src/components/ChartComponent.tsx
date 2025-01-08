import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { OhlcBar } from '../types';

interface ChartComponentProps {
  data: {
    [key: string]: OhlcBar[];
  };
  defaultInterval?: string;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ 
  data, 
  defaultInterval = '1D' 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [interval, setInterval] = useState(defaultInterval);

  const handleIntervalChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: string,
  ) => {
    if (newInterval !== null) {
      setInterval(newInterval);
    }
  };

  useEffect(() => {
    if (chartContainerRef.current && data[interval]?.length > 0) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#1E222D' },
          textColor: '#DDD',
        },
        grid: {
          vertLines: { color: '#2B2B43' },
          horzLines: { color: '#2B2B43' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        timeScale: {
          timeVisible: true,
          borderColor: '#2B2B43',
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      candlestickSeries.setData(data[interval]);
      chartRef.current = chart;

      // Fit the chart to the data
      chart.timeScale().fitContent();

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [data, interval]);

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={interval}
          exclusive
          onChange={handleIntervalChange}
          aria-label="timeframe"
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="1H" aria-label="1 hour">1H</ToggleButton>
          <ToggleButton value="4H" aria-label="4 hours">4H</ToggleButton>
          <ToggleButton value="1D" aria-label="1 day">1D</ToggleButton>
          <ToggleButton value="1W" aria-label="1 week">1W</ToggleButton>
          <ToggleButton value="1M" aria-label="1 month">1M</ToggleButton>
          
        </ToggleButtonGroup>
      </Box>
      <Box ref={chartContainerRef} sx={{ width: '100%', height: '400px' }} />
    </Box>
  );
}; 