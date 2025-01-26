import React, { useRef, useState } from 'react';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import { ChartCanvas, Chart } from '@react-financial-charts/core';
import { XAxis, YAxis } from '@react-financial-charts/axes';
import { discontinuousTimeScaleProviderBuilder } from '@react-financial-charts/scales';
import { CandlestickSeries, LineSeries } from '@react-financial-charts/series';
import { OHLCTooltip } from '@react-financial-charts/tooltip';
import {
  CrossHairCursor,
  MouseCoordinateY,
  EdgeIndicator,
} from '@react-financial-charts/coordinates';
import { rsi } from '@react-financial-charts/indicators';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Theme,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  Popover,
  Typography,
  IconButton,
  Stack,
  Icon,
} from '@mui/material';
import { OhlcBar } from '../types';
import { SxProps } from '@mui/system';

interface CandlestickChartProps {
  data: {
    [key: string]: OhlcBar[];
  };
  defaultInterval?: string;
}

interface IndicatorConfig {
  enabled: boolean;
  period: number;
  color: string;
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
  '& canvas': {
    borderRadius: '8px',
  },
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  defaultInterval = 'D',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState(defaultInterval);
  const [rsiConfig, setRsiConfig] = useState<IndicatorConfig>({
    enabled: false,
    period: 14,
    color: '#E91E63',
  });

  // Settings popover state
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodChange = (value: string) => {
    const period = parseInt(value);
    if (!isNaN(period) && period > 0) {
      setRsiConfig((prev) => ({
        ...prev,
        period,
      }));
    }
  };

  const handleRsiToggle = () => {
    setRsiConfig((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  const handleIntervalChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: string | null
  ) => {
    if (newInterval !== null && data[newInterval]?.length) {
      setInterval(newInterval);
    }
  };

  // Format helpers
  const timeFormatter = timeFormat('%Y-%m-%d %H:%M');
  const candlesAppearance = {
    wickStroke: (d: OhlcBar) => (d.close > d.open ? '#00F5A0' : '#ef5350'),
    fill: (d: OhlcBar) => (d.close > d.open ? '#00F5A0' : '#ef5350'),
    stroke: (d: OhlcBar) => (d.close > d.open ? '#00F5A0' : '#ef5350'),
    candleStrokeWidth: 1,
    widthRatio: 0.8,
  };

  // Process data for the chart
  const chartData = data[interval] || [];
  const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor((d: OhlcBar) => {
    const timestamp = typeof d.time === 'string' ? Date.parse(d.time) : Number(d.time) * 1000;
    return new Date(timestamp);
  });
  const { data: scaledData, xScale, xAccessor, displayXAccessor } = xScaleProvider(chartData);

  // Calculate the default display window based on interval
  const getDefaultDisplayWindow = () => {
    switch (interval) {
      case '1m':
        return 120; // Show 2 hours of 1-minute data
      case '5m':
        return 144; // Show 12 hours of 5-minute data
      case '15m':
        return 96; // Show 24 hours of 15-minute data
      case '1h':
        return 168; // Show 7 days of hourly data
      default:
        return scaledData.length; // Show all data for larger intervals
    }
  };

  const displayWindow = getDefaultDisplayWindow();
  const max = xAccessor(scaledData[scaledData.length - 1]);
  const min = xAccessor(scaledData[Math.max(0, scaledData.length - displayWindow)]);
  const xExtents = [min, max];

  const gridHeight = 400;
  const chartHeight = rsiConfig.enabled ? gridHeight * 0.7 : gridHeight;
  const rsiHeight = gridHeight * 0.3;

  // Calculate RSI
  const rsiCalculator = rsi()
    .options({ windowSize: rsiConfig.period })
    .merge((d: any, c: any) => {
      d.rsi = c;
    })
    .accessor((d: any) => d.rsi);

  const calculatedData = rsiCalculator(scaledData);

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

      {/* Technical Indicators Controls */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <FormGroup row>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControlLabel
              control={
                <Switch checked={rsiConfig.enabled} onChange={handleRsiToggle} color="primary" />
              }
              label={`RSI(${rsiConfig.period})`}
            />
            <IconButton size="small" onClick={handleSettingsClick} sx={{ color: rsiConfig.color }}>
              <Icon>settings</Icon>
            </IconButton>
          </Stack>
        </FormGroup>
      </Box>

      {/* Settings Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, width: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            RSI Settings
          </Typography>
          <TextField
            label="Period"
            type="number"
            size="small"
            fullWidth
            value={rsiConfig.period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            inputProps={{ min: 1, max: 200 }}
            sx={{ mt: 1 }}
          />
        </Box>
      </Popover>

      {/* Chart */}
      <Box ref={containerRef} sx={chartContainerStyles}>
        {containerRef.current && (
          <ChartCanvas
            height={gridHeight}
            ratio={3}
            width={containerRef.current.clientWidth}
            margin={{ left: 50, right: 50, top: 10, bottom: 50 }}
            data={calculatedData}
            xScale={xScale}
            xAccessor={xAccessor}
            displayXAccessor={displayXAccessor}
            xExtents={xExtents}
            seriesName="PriceChart"
          >
            <Chart id={1} height={chartHeight} yExtents={(d: OhlcBar) => [d.high, d.low]}>
              <XAxis showTicks={true} showTickLabel={true} tickFormat={timeFormatter} />
              <YAxis showGridLines tickFormat={format('.2f')} />
              <CandlestickSeries {...candlesAppearance} />
              <MouseCoordinateY rectWidth={60} displayFormat={format('.2f')} />
              <EdgeIndicator
                itemType="last"
                rectWidth={80}
                fill={(d: OhlcBar) => (d.close > d.open ? '#00F5A0' : '#ef5350')}
                lineStroke={(d: OhlcBar) => (d.close > d.open ? '#00F5A0' : '#ef5350')}
                displayFormat={format('.2f')}
                yAccessor={(d: OhlcBar) => d.close}
              />
              <OHLCTooltip origin={[8, 16]} />
            </Chart>

            {rsiConfig.enabled && (
              <Chart
                id={2}
                height={rsiHeight}
                yExtents={[0, 100]}
                origin={(w: number, h: number) => [0, h - rsiHeight]}
              >
                <XAxis showGridLines />
                <YAxis tickValues={[30, 50, 70]} showGridLines />
                <LineSeries
                  yAccessor={rsiCalculator.accessor()}
                  strokeStyle={rsiConfig.color}
                  strokeWidth={2}
                />
                <MouseCoordinateY rectWidth={60} displayFormat={format('.2f')} />
              </Chart>
            )}
            <CrossHairCursor />
          </ChartCanvas>
        )}
      </Box>
    </Box>
  );
};
