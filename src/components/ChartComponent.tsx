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

export const ChartComponent: React.FC<ChartComponentProps> = ({ data, defaultInterval = '1D' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [interval, setInterval] = useState(defaultInterval);

  const handleIntervalChange = (_event: React.MouseEvent<HTMLElement>, newInterval: string) => {
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
          secondsVisible: interval.includes('min'),
          borderColor: '#2B2B43',
          fixLeftEdge: true,
          fixRightEdge: true,
          rightOffset: 12,
          barSpacing: interval.includes('min') ? 3 : 6,
          minBarSpacing: 2,
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // For minute data, we'll process in chunks to avoid stack overflow
      const setDataInChunks = (chartData: (typeof data)[typeof interval]) => {
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

      // Use chunked processing for minute data, regular processing for others
      if (interval.includes('min') && data[interval].length > 5000) {
        setDataInChunks(data[interval]);
      } else {
        candlestickSeries.setData(data[interval]);
        chart.timeScale().fitContent();
      }

      chartRef.current = chart;

      // Ensure proper scaling of price axis
      const prices = data[interval].map((bar) => [bar.high, bar.low]).flat();
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const padding = (maxPrice - minPrice) * 0.1; // 10% padding

      candlestickSeries.applyOptions({
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });

      chart.priceScale('right').applyOptions({
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
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
    }
  }, [data, interval]);

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={interval}
          exclusive
          onChange={handleIntervalChange}
          aria-label="time-interval"
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
          <ToggleButton value="1min" aria-label="1 minute">
            1m
          </ToggleButton>
          <ToggleButton value="5min" aria-label="5 minutes">
            5m
          </ToggleButton>
          <ToggleButton value="15min" aria-label="15 minutes">
            15m
          </ToggleButton>
          <ToggleButton value="1H" aria-label="1 hour">
            1H
          </ToggleButton>
          <ToggleButton value="4H" aria-label="4 hours">
            4H
          </ToggleButton>
          <ToggleButton value="1D" aria-label="1 day">
            1D
          </ToggleButton>
          <ToggleButton value="1W" aria-label="1 week">
            1W
          </ToggleButton>
          <ToggleButton value="1M" aria-label="1 month">
            1M
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box ref={chartContainerRef} sx={{ width: '100%', height: '400px' }} />
    </Box>
  );
};
