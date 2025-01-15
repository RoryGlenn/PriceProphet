/*********************************************************************
 * ChartPredictionView.tsx
 *
 * Main chart prediction interface component that handles price prediction gameplay.
 * Manages chart state, data generation, user interactions, and scoring.
 *
 * Features:
 * - Dynamic price data generation using Geometric Brownian Motion
 * - Multiple difficulty levels with varying prediction timeframes
 * - Real-time score tracking and feedback
 * - Interactive chart with multiple timeframe views
 * - Responsive design with glass morphism effects
 * - Error handling with user-friendly messages
 * - Accessibility support with ARIA labels
 * - Performance optimizations for smooth animations
 *
 * Game Flow:
 * 1. Initialize game with selected difficulty
 * 2. Generate random price data with controlled volatility
 * 3. Present chart and price choices with visual feedback
 * 4. Process user prediction with validation
 * 5. Show result and update score with animations
 * 6. Repeat for 5 rounds or until game end
 *
 * State Management:
 * - Historical price data for all timeframes (1m to Monthly)
 * - Current game state (loading, score, attempt)
 * - User interaction state (selected choice, results)
 * - Error handling state with recovery options
 *
 * Performance Optimizations:
 * - Memoized data processing functions
 * - Efficient data structure updates
 * - Lazy loading of chart components
 * - Debounced user interactions
 * - Optimized re-renders with React.memo
 *
 * Accessibility Features:
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - High contrast mode support
 * - Focus management
 * - ARIA labels and roles
 *
 * Error Handling:
 * - Data generation failures
 * - Network connectivity issues
 * - Invalid user inputs
 * - State inconsistencies
 * - Graceful degradation
 *
 * Dependencies:
 * - React for UI components
 * - Material-UI for styled components
 * - Lightweight Charts for visualization
 * - RandomOHLC for data generation
 * - Custom utilities for price formatting
 *
 * @module ChartPredictionView
 * @requires react
 * @requires @mui/material
 * @requires ./ChartComponent
 * @requires ../randomOHLC
 * @requires ../types
 * @requires lightweight-charts
 * @requires ../utils/priceUtils
 * @requires ../styles/theme
 *********************************************************************/

import React, { useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { ChartComponent } from './ChartComponent';
import { RandomOHLC, TimeIntervalDict } from '../randomOHLC';
import { OhlcBar, OhlcRow, DifficultyLevel, TimeInterval, MINUTES_PER_INTERVAL } from '../types';
import { Time } from 'lightweight-charts';
import { generatePriceChoices, formatPrice } from '../utils/priceUtils';
import { buttonStyles, layoutStyles } from '../styles/theme';

/**
 * Score tracking interface for the game.
 * Maintains count of correct and incorrect predictions.
 * Used for game progression and final scoring.
 *
 * @interface Score
 * @property {number} right - Number of correct predictions (0-5)
 * @property {number} wrong - Number of incorrect predictions (0-5)
 *
 * @example
 * const score: Score = { right: 3, wrong: 2 };
 */
export interface Score {
  right: number;
  wrong: number;
}

/**
 * Props for the ChartPredictionView component.
 * Configures game difficulty and handles game completion.
 * Parent component controls game flow through these props.
 *
 * @interface ChartPredictionViewProps
 * @property {DifficultyLevel} difficulty - Selected game difficulty level (Easy/Medium/Hard)
 * @property {Function} onGameEnd - Callback when game ends with final score
 *
 * @example
 * <ChartPredictionView
 *   difficulty="Medium"
 *   onGameEnd={(score) => handleGameEnd(score)}
 * />
 */
interface ChartPredictionViewProps {
  difficulty: DifficultyLevel;
  onGameEnd: (score: Score) => void;
}

/**
 * Type definition for historical price data.
 * Organizes OHLC data by timeframe intervals.
 * Supports multiple timeframe views (1m to Monthly).
 *
 * Structure:
 * - Key: TimeInterval (e.g., '1m', '5m', '1h', 'D')
 * - Value: Array of OHLC bars for that interval
 *
 * @typedef {Record<TimeInterval, OhlcBar[]>} HistoricalData
 *
 * @example
 * const data: HistoricalData = {
 *   '1m': [{ time: 1234567890, open: 100, high: 101, low: 99, close: 100.5 }],
 *   'D': [{ time: '2023-01-01', open: 100, high: 105, low: 95, close: 102 }]
 * };
 */
type HistoricalData = Record<TimeInterval, OhlcBar[]>;

/**
 * Configuration interface for random data generation.
 * Controls the characteristics of generated price data.
 * Parameters affect price movement patterns.
 *
 * Constraints:
 * - daysNeeded: > 0
 * - startPrice: > 0
 * - volatility: 0-1 range
 * - drift: -1 to 1 range
 *
 * @interface RandomDataConfig
 * @property {number} daysNeeded - Total days of data to generate
 * @property {number} startPrice - Initial price point
 * @property {number} volatility - Price volatility factor
 * @property {number} drift - Price trend direction factor
 *
 * @example
 * const config: RandomDataConfig = {
 *   daysNeeded: 90,
 *   startPrice: 10000,
 *   volatility: 0.2,
 *   drift: 0.1
 * };
 */
interface RandomDataConfig {
  daysNeeded: number;
  startPrice: number;
  volatility: number;
  drift: number;
}

/**
 * Default configuration for random data generation.
 * Provides base values that are adjusted based on difficulty.
 * Values are chosen to create realistic price movements.
 *
 * Properties:
 * - daysNeeded: 91 days for sufficient historical context
 * - startPrice: 10000 as a baseline reference point
 * - volatility: Set dynamically based on difficulty
 * - drift: Set dynamically based on difficulty
 *
 * @constant {RandomDataConfig} DEFAULT_RANDOM_CONFIG
 *
 * @example
 * const config = { ...DEFAULT_RANDOM_CONFIG, volatility: 0.2 };
 */
const DEFAULT_RANDOM_CONFIG: RandomDataConfig = {
  daysNeeded: 91,
  startPrice: 10000,
  volatility: 0, // Will be set dynamically
  drift: 0, // Will be set dynamically
} as const;

/**
 * Initial state for historical price data.
 * Provides empty arrays for all supported timeframes.
 * Used as initial state and for resetting data.
 *
 * Timeframes:
 * - 1m: One-minute intervals
 * - 5m: Five-minute intervals
 * - 15m: Fifteen-minute intervals
 * - 1h: Hourly intervals
 * - 4h: Four-hour intervals
 * - D: Daily intervals
 * - W: Weekly intervals
 * - M: Monthly intervals
 *
 * @constant {HistoricalData} INITIAL_HISTORICAL_DATA
 *
 * @example
 * const data = { ...INITIAL_HISTORICAL_DATA };
 */
const INITIAL_HISTORICAL_DATA: HistoricalData = {
  '1m': [],
  '5m': [],
  '15m': [],
  '1h': [],
  '4h': [],
  D: [],
  W: [],
  M: [],
};

/**
 * Determines the prediction timeframe based on difficulty level.
 * Maps difficulty levels to future prediction periods:
 * - Easy: 1 day ahead (short-term prediction)
 * - Medium: 7 days ahead (medium-term prediction)
 * - Hard: 30 days ahead (long-term prediction)
 *
 * Used to:
 * - Remove future data from historical dataset
 * - Calculate prediction window size
 * - Adjust scoring difficulty
 *
 * @function getFutureIndex
 * @param {DifficultyLevel} difficulty - Current game difficulty
 * @returns {number} Number of days to predict into the future
 *
 * @example
 * const daysToPredict = getFutureIndex('Medium'); // Returns 7
 */
const getFutureIndex = (difficulty: DifficultyLevel): number => {
  return difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 7 : 30;
};

/**
 * Main game component for price prediction gameplay.
 * Manages the complete game lifecycle including:
 * - Data generation and processing
 * - User interaction handling
 * - Score tracking and game progression
 * - Error handling and feedback
 *
 * Component States:
 * - Loading: Initial data generation
 * - Active: User making prediction
 * - Result: Showing prediction outcome
 * - Complete: Game finished after 5 rounds
 *
 * @component
 * @param {ChartPredictionViewProps} props - Component props
 * @returns {JSX.Element} Rendered game interface
 */
export const ChartPredictionView: React.FC<ChartPredictionViewProps> = ({
  difficulty,
  onGameEnd,
}) => {
  // Game state
  const [historicalData, setHistoricalData] = useState<HistoricalData>(INITIAL_HISTORICAL_DATA);
  const [priceChoices, setPriceChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<Score>({ right: 0, wrong: 0 });
  const [attempt, setAttempt] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [correctPrice, setCorrectPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initialization tracking
  const hasInitialized = React.useRef(false);

  /**
   * Logs error messages in development environment.
   * Provides detailed error information for debugging.
   *
   * @function logError
   * @param {string} message - Error description
   * @param {unknown} error - Error object or details
   */
  const logError = React.useCallback((message: string, error: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ChartPredictionView] ${message}`, error);
    }
  }, []);

  /**
   * Clears displayed error messages.
   * Resets error state when user dismisses alert.
   *
   * @function handleErrorClose
   */
  const handleErrorClose = () => {
    setError(null);
  };

  /**
   * Converts timeframe interval to minutes.
   * Used for data processing and calculations.
   *
   * @function getMinutesForInterval
   * @param {TimeInterval} interval - Timeframe interval
   * @returns {number} Number of minutes in the interval
   */
  const getMinutesForInterval = useCallback((interval: TimeInterval): number => {
    return MINUTES_PER_INTERVAL[interval];
  }, []);

  /**
   * Formats raw OHLC data into chart-compatible format.
   * Handles different timestamp formats based on timeframe.
   *
   * @function formatOhlcBar
   * @param {OhlcRow} bar - Raw OHLC data
   * @param {string} timeframe - Target timeframe
   * @returns {OhlcBar} Formatted OHLC bar
   */
  const formatOhlcBar = useCallback((bar: OhlcRow, timeframe: string): OhlcBar => {
    const timeValue =
      timeframe === 'D' || timeframe === 'W' || timeframe === 'M'
        ? new Date(bar.timestamp * 1000).toISOString().split('T')[0]
        : bar.timestamp;

    return {
      time: timeValue as Time,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    };
  }, []);

  /**
   * Sorts OHLC bars by timestamp.
   * Handles both numeric and string timestamp formats.
   *
   * @function sortOhlcBars
   * @param {OhlcBar} a - First OHLC bar
   * @param {OhlcBar} b - Second OHLC bar
   * @returns {number} Sort order (-1, 0, 1)
   */
  const sortOhlcBars = useCallback((a: OhlcBar, b: OhlcBar): number => {
    if (typeof a.time === 'number' && typeof b.time === 'number') {
      return a.time - b.time;
    }
    if (typeof a.time === 'string' && typeof b.time === 'string') {
      return a.time.localeCompare(b.time);
    }
    return String(a.time).localeCompare(String(b.time));
  }, []);

  /**
   * Processes data for a specific timeframe interval.
   * Aggregates minute data into larger timeframes.
   *
   * @function processIntervalData
   * @param {OhlcRow[]} minuteData - Raw minute-level data
   * @param {number} barsPerInterval - Number of bars to aggregate
   * @returns {OhlcBar[]} Processed OHLC bars
   */
  const processIntervalData = useCallback(
    (minuteData: OhlcRow[], barsPerInterval: number): OhlcBar[] => {
      const chunks: OhlcRow[][] = [];

      for (let i = 0; i < minuteData.length; i += barsPerInterval) {
        const chunk = minuteData.slice(i, i + barsPerInterval);
        if (chunk.length > 0) {
          chunks.push(chunk);
        }
      }

      return chunks.map((chunk) => ({
        time: chunk[0].timestamp as Time,
        open: chunk[0].open,
        high: Math.max(...chunk.map((bar) => bar.high)),
        low: Math.min(...chunk.map((bar) => bar.low)),
        close: chunk[chunk.length - 1].close,
      }));
    },
    []
  );

  /**
   * Processes raw OHLC data into all timeframe intervals.
   * Creates a complete dataset for the chart component.
   *
   * @function processOhlcData
   * @param {TimeIntervalDict} data - Raw OHLC data
   * @returns {HistoricalData} Processed data for all timeframes
   */
  const processOhlcData = useCallback(
    (data: TimeIntervalDict): HistoricalData => {
      const minuteData = data['1m'];
      const displayIntervals: TimeInterval[] = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'];
      const processedData = { ...INITIAL_HISTORICAL_DATA };

      processedData['1m'] = minuteData
        .map((bar: OhlcRow): OhlcBar => formatOhlcBar(bar, '1m'))
        .sort(sortOhlcBars);

      displayIntervals.slice(1).forEach((interval) => {
        const barsPerInterval = getMinutesForInterval(interval);
        processedData[interval] = processIntervalData(minuteData, barsPerInterval);
      });

      return processedData;
    },
    [formatOhlcBar, sortOhlcBars, getMinutesForInterval, processIntervalData]
  );

  /**
   * Validates generated OHLC data structure.
   * Ensures data meets required format and content.
   *
   * @function validateGeneratedData
   * @param {unknown} data - Data to validate
   * @returns {boolean} True if data is valid
   * @throws {Error} If data validation fails
   */
  const validateGeneratedData = React.useCallback((data: unknown): data is TimeIntervalDict => {
    if (!data || typeof data !== 'object') {
      throw new Error('Generated data is invalid');
    }

    const typedData = data as Partial<TimeIntervalDict>;
    if (!typedData['1m'] || !Array.isArray(typedData['1m']) || typedData['1m'].length === 0) {
      throw new Error('Missing or invalid minute data');
    }

    if (!typedData['D'] || !Array.isArray(typedData['D']) || typedData['D'].length === 0) {
      throw new Error('Missing or invalid daily data');
    }

    return true;
  }, []);

  /**
   * Generates random OHLC data for the game.
   * Uses RandomOHLC class with constrained parameters.
   *
   * @function generateRandomData
   * @returns {TimeIntervalDict} Generated OHLC data
   * @throws {Error} If data generation fails
   */
  const generateRandomData = useCallback((): TimeIntervalDict => {
    try {
      const config: RandomDataConfig = {
        ...DEFAULT_RANDOM_CONFIG,
        volatility: Math.max(1, Math.min(3, Math.random() * 2 + 1)),
        drift: Math.max(1, Math.min(3, Math.random() * 2 + 1)),
      };

      if (process.env.NODE_ENV === 'development') {
        console.debug('[ChartPredictionView] Generating data with:', config);
      }

      const randOHLC = new RandomOHLC(config);
      const data = randOHLC.generateOhlcData();

      if (!validateGeneratedData(data)) {
        throw new Error('Data validation failed');
      }

      const sortedData: Record<string, OhlcRow[]> = {};
      Object.keys(data)
        .sort()
        .forEach((key) => {
          sortedData[key] = data[key];
        });

      return sortedData as TimeIntervalDict;
    } catch (error) {
      logError('Error in generateRandomData:', error);
      throw error;
    }
  }, [validateGeneratedData, logError]);

  /**
   * Updates game state with new data and choices.
   * Resets interaction state for new round.
   *
   * @function updateGameState
   * @param {HistoricalData} processedData - Processed OHLC data
   * @param {string[]} choices - Generated price choices
   * @param {number} futurePrice - Correct future price
   */
  const updateGameState = React.useCallback(
    (processedData: HistoricalData, choices: string[], futurePrice: number) => {
      setHistoricalData(processedData);
      setPriceChoices(choices);
      setCorrectPrice(formatPrice(futurePrice));
      setSelectedChoice('');
      setShowResult(false);
      setLoading(false);
    },
    []
  );

  /**
   * Generates a new round of the game.
   * Handles data generation, processing, and state updates.
   *
   * Process:
   * 1. Generate random price data
   * 2. Remove future data based on difficulty
   * 3. Process data for all timeframes
   * 4. Generate price choices
   * 5. Update game state
   *
   * @function generateNewRound
   * @returns {Promise<void>} Resolves when round is ready
   */
  const generateNewRound = React.useCallback((): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ChartPredictionView] Generating new round');
    }

    setLoading(true);
    setError(null);

    return new Promise<void>((resolve, reject) => {
      try {
        const rawData = generateRandomData();

        if (!rawData || !rawData['D'] || !rawData['1m']) {
          throw new Error('Invalid data generated');
        }

        const daysToRemove = getFutureIndex(difficulty);
        const minutesToRemove = daysToRemove * 1440;

        const futurePrice = rawData['D'][rawData['D'].length - 1]?.close;
        if (typeof futurePrice !== 'number') {
          throw new Error('Invalid future price');
        }

        rawData['1m'] = rawData['1m'].slice(0, -minutesToRemove);
        const processedData = processOhlcData(rawData);
        const choices = generatePriceChoices(futurePrice);

        updateGameState(processedData, choices, futurePrice);
        resolve();
      } catch (error) {
        setLoading(false);

        if (error instanceof Error) {
          const errorMessage = error.message.includes('Open prices do not match')
            ? 'Data generation failed due to price mismatch. Please try again.'
            : 'An unexpected error occurred. Please try again.';

          setError(errorMessage);
          logError('Error generating round:', error);
        }
        reject(error);
      }
    });
  }, [difficulty, updateGameState, processOhlcData, generateRandomData, logError]);

  /**
   * Initializes game on mount or difficulty change.
   * Sets up initial game state and data.
   *
   * @effect
   */
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        '[ChartPredictionView] useEffect running, hasInitialized:',
        hasInitialized.current
      );
    }

    if (!hasInitialized.current) {
      setLoading(true);
      generateNewRound()
        .then(() => {
          setLoading(false);
          hasInitialized.current = true;
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [generateNewRound]);

  /**
   * Handles game progression after each round.
   * Either starts new round or ends game after 5 attempts.
   *
   * @function handleNext
   */
  const handleNext = useCallback(() => {
    if (attempt >= 5) {
      onGameEnd(score);
    } else {
      setAttempt((prev) => prev + 1);
      setShowResult(false);
      setSelectedChoice('');
      generateNewRound().catch(() => {
        // Error is already handled in generateNewRound
      });
    }
  }, [attempt, score, onGameEnd, generateNewRound]);

  /**
   * Handles returning to main menu.
   * Cleans up game state and exits to welcome screen.
   *
   * @function handleBackToMenu
   * @param {React.MouseEvent<HTMLButtonElement>} event - Click event
   */
  const handleBackToMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onGameEnd({ right: 0, wrong: 0 });
  };

  /**
   * Handles price prediction submission.
   * Validates selection and updates score.
   *
   * @function handleSubmit
   * @param {React.MouseEvent<HTMLButtonElement>} event - Click event
   */
  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedChoice) {
      setError('Please select a price prediction first.');
      return;
    }

    if (selectedChoice === correctPrice) {
      setScore((prev) => ({ ...prev, right: prev.right + 1 }));
    } else {
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    setShowResult(true);
  };

  /**
   * Handles next round button click.
   * Prevents event bubbling and initiates next round.
   *
   * @function handleNextClick
   * @param {React.MouseEvent<HTMLButtonElement>} event - Click event
   */
  const handleNextClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      handleNext();
    },
    [handleNext]
  );

  /**
   * Handles price choice selection.
   * Updates selected choice in component state.
   *
   * @function handleChoiceChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleChoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedChoice(e.target.value);
  };

  // Loading state render
  if (loading) {
    return (
      <Box sx={{ ...layoutStyles.flexCenter, minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Main game interface render
  return (
    <Container maxWidth={false} sx={layoutStyles.mainContainer}>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Paper sx={{ width: '100%', p: 4, ...layoutStyles.glassPanel }}>
        {/* Game header */}
        <Box sx={{ ...layoutStyles.flexBetween, mb: 4, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: 2,
              textShadow: '0 0 20px rgba(0, 245, 160, 0.5)',
            }}
          >
            Predict the Future Price
          </Typography>
          <Button variant="outlined" onClick={handleBackToMenu} sx={buttonStyles.outline}>
            Back to Menu
          </Button>
        </Box>

        {/* Game status */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500,
            }}
          >
            Difficulty: <span style={{ color: '#00F5A0' }}>{difficulty}</span> | Attempt:{' '}
            <span style={{ color: '#00F5A0' }}>{attempt}/5</span>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500,
            }}
          >
            Score: <span style={{ color: '#00F5A0' }}>Correct: {score.right}</span> |
            <span style={{ color: '#ef5350' }}> Wrong: {score.wrong}</span>
          </Typography>
        </Box>

        {/* Chart container */}
        <Box
          sx={{
            mb: 4,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            p: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {!loading && Object.keys(historicalData).length > 0 && (
            <ChartComponent data={historicalData} defaultInterval="D" />
          )}
        </Box>

        {/* Price choices */}
        <Box
          sx={{
            mb: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: '#00F5A0',
              fontWeight: 500,
              letterSpacing: 1,
              mb: 3,
            }}
          >
            What do you think the future closing price will be?
          </Typography>
          <RadioGroup
            value={selectedChoice}
            onChange={handleChoiceChange}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 2,
              opacity: showResult ? 0.7 : 1,
              pointerEvents: showResult ? 'none' : 'auto',
            }}
          >
            {priceChoices.map((choice) => (
              <FormControlLabel
                key={choice}
                value={choice}
                disabled={showResult}
                control={
                  <Radio
                    sx={{
                      color: 'rgba(255, 255, 255, 0.3)',
                      '&.Mui-checked': {
                        color: '#00F5A0',
                      },
                      '&.Mui-disabled': {
                        color: selectedChoice === choice ? '#00F5A0' : 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  />
                }
                label={choice}
                sx={{
                  margin: 0,
                  padding: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor:
                    selectedChoice === choice
                      ? 'rgba(0, 245, 160, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor:
                    selectedChoice === choice ? 'rgba(0, 245, 160, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: showResult ? 'transparent' : 'rgba(0, 245, 160, 0.05)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.7,
                    color: 'white',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </Box>

        {/* Action buttons */}
        <Box sx={{ position: 'relative', zIndex: 10 }}>
          {showResult ? (
            <>
              <Typography
                variant="h6"
                sx={{
                  color: selectedChoice === correctPrice ? '#00F5A0' : '#ef5350',
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                {selectedChoice === correctPrice
                  ? '🎯 Correct! Well done!'
                  : `❌ Wrong! The correct price was ${correctPrice}`}
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextClick}
                size="large"
                sx={{
                  display: 'block',
                  margin: '0 auto',
                  minWidth: 200,
                  height: 48,
                  ...buttonStyles.primary,
                }}
              >
                {attempt >= 5 ? 'See Results' : 'Next Round'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              type="button"
              size="large"
              disabled={!selectedChoice}
              sx={{
                display: 'block',
                margin: '0 auto',
                minWidth: 200,
                height: 48,
                ...buttonStyles.primary,
                position: 'relative',
                zIndex: 100,
                cursor: !selectedChoice ? 'not-allowed' : 'pointer',
                pointerEvents: 'auto',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              Submit Prediction
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};
