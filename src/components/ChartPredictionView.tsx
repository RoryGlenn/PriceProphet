/*********************************************************************
 * ChartPredictionView.tsx
 *
 * Main chart prediction interface component that handles price prediction gameplay.
 * Manages chart state, data generation, user interactions, and scoring.
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
import { RandomOHLC, TimeIntervalDict } from '../random_ohlc';
import { OhlcBar, OhlcRow, DifficultyLevel, TimeInterval, MINUTES_PER_INTERVAL } from '../types';
import { Time } from 'lightweight-charts';
import { generatePriceChoices, formatPrice } from '../utils/priceUtils';
import { buttonStyles, layoutStyles } from '../styles/theme';

/** Score object type used throughout the application */
export interface Score {
  right: number;
  wrong: number;
}

/** Props for the ChartPredictionView component */
interface ChartPredictionViewProps {
  difficulty: DifficultyLevel;
  onGameEnd: (score: Score) => void;
}

/** Type for the historical price data organized by timeframe */
type HistoricalData = Record<TimeInterval, OhlcBar[]>;

/** Configuration for random data generation */
interface RandomDataConfig {
  daysNeeded: number;
  startPrice: number;
  volatility: number;
  drift: number;
}

/** Default configuration for random data generation */
const DEFAULT_RANDOM_CONFIG: RandomDataConfig = {
  daysNeeded: 91,
  startPrice: 10000,
  volatility: 0,  // Will be set dynamically
  drift: 0,       // Will be set dynamically
} as const;

/** Initial historical data state */
const INITIAL_HISTORICAL_DATA: HistoricalData = {
  '1m': [],
  '5m': [],
  '15m': [],
  '1h': [],
  '4h': [],
  'D': [],
  'W': [],
  'M': [],
};

/**
 * Gets the number of days into the future to predict based on difficulty.
 * - Easy: 1 day
 * - Medium: 7 days
 * - Hard: 30 days
 */
const getFutureIndex = (difficulty: DifficultyLevel): any => {
  return difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 7 : 30;
};

/**
 * Main chart prediction interface component.
 * Main chart prediction interface component.
 * Handles the core prediction logic including:
 * - Data generation using RandomOHLC
 * - Chart state management
 * - Score tracking
 * - User interaction processing
 *
 * @component
 * @param {ChartPredictionViewProps} props - Component props
 * @param {DifficultyLevel} props.difficulty - Selected difficulty level
 * @param {Function} props.onGameEnd - Callback when game ends with final score
 */
export const ChartPredictionView: React.FC<ChartPredictionViewProps> = ({ difficulty, onGameEnd }) => {
  const [historicalData, setHistoricalData] = useState<HistoricalData>(INITIAL_HISTORICAL_DATA);
  const [priceChoices, setPriceChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<Score>({ right: 0, wrong: 0 });
  const [attempt, setAttempt] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [correctPrice, setCorrectPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const hasInitialized = React.useRef(false);

  /**
   * Logs error messages in development mode
   */
  const logError = React.useCallback((message: string, error: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ChartPredictionView] ${message}`, error);
    }
  }, []);

  /**
   * Clears any displayed error messages
   */
  const handleErrorClose = () => {
    setError(null);
  };

  /**
   * Gets the number of minutes for a given time interval
   */
  const getMinutesForInterval = useCallback((interval: TimeInterval): number => {
    return MINUTES_PER_INTERVAL[interval];
  }, []);

  /**
   * Formats a raw OHLC row into a bar format suitable for the chart
   */
  const formatOhlcBar = useCallback((bar: OhlcRow, timeframe: string): OhlcBar => {
    const timeValue = timeframe === 'D' || timeframe === 'W' || timeframe === 'M'
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
   * Sorts OHLC bars by time, handling both number and string timestamps
   */
  const sortOhlcBars = useCallback(
    (a: OhlcBar, b: OhlcBar): number => {
      if (typeof a.time === 'number' && typeof b.time === 'number') {
        return a.time - b.time;
      }
      if (typeof a.time === 'string' && typeof b.time === 'string') {
        return a.time.localeCompare(b.time);
      }
      // Handle mixed types (shouldn't occur in practice)
      return String(a.time).localeCompare(String(b.time));
    },
    []
  );

  /**
   * Processes data for a specific interval
   */
  const processIntervalData = useCallback((minuteData: OhlcRow[], barsPerInterval: number): OhlcBar[] => {
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
  }, []);

  /**
   * Processes raw OHLC data into timeframe groups
   */
  const processOhlcData = useCallback(
    (data: TimeIntervalDict): HistoricalData => {
      const minuteData = data['1m'];
      const displayIntervals: TimeInterval[] = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'];
      const processedData = { ...INITIAL_HISTORICAL_DATA };

      // Process 1-minute data first
      processedData['1m'] = minuteData
        .map((bar: OhlcRow): OhlcBar => formatOhlcBar(bar, '1m'))
        .sort(sortOhlcBars);

      // Process other intervals
      displayIntervals.slice(1).forEach((interval) => {
        const barsPerInterval = getMinutesForInterval(interval);
        processedData[interval] = processIntervalData(minuteData, barsPerInterval);
      });

      return processedData;
    },
    [formatOhlcBar, sortOhlcBars, getMinutesForInterval, processIntervalData]
  );

  /**
   * Validates the generated OHLC data
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
   * Generates random OHLC data with constrained parameters
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

      // Create a new object with the same data but explicitly typed
      const sortedData: Record<string, OhlcRow[]> = {};

      // Sort the keys and copy the data
      Object.keys(data).sort().forEach(key => {
        sortedData[key] = data[key];
      });

      return sortedData as TimeIntervalDict;

    } catch (error) {
      logError('Error in generateRandomData:', error);
      throw error;
    }
  }, [validateGeneratedData, logError]);

  /**
   * Updates the game state with new data and choices
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
   */
  const generateNewRound = React.useCallback((): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ChartPredictionView] Generating new round');
    }

    setLoading(true);
    setError(null);

    return new Promise<void>((resolve, reject) => {
      try {
        // Get raw data
        const rawData = generateRandomData();

        if (!rawData || !rawData['D'] || !rawData['1m']) {
          throw new Error('Invalid data generated');
        }

        // Calculate how many minute bars to remove based on difficulty
        const daysToRemove = getFutureIndex(difficulty);
        const minutesToRemove = daysToRemove * 1440; // 1440 minutes per day

        // Store the future price before trimming
        const futurePrice = rawData['D'][rawData['D'].length - 1]?.close;
        if (typeof futurePrice !== 'number') {
          throw new Error('Invalid future price');
        }

        // Remove future data from 1-minute data first
        rawData['1m'] = rawData['1m'].slice(0, -minutesToRemove);

        // Now process the trimmed data into all timeframes
        const processedData = processOhlcData(rawData);

        const choices = generatePriceChoices(futurePrice);

        // Update game state
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

  // Initialize game on mount or when difficulty changes
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ChartPredictionView] useEffect running, hasInitialized:', hasInitialized.current);
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
   * Handles the "Next" button click.
   * Either starts a new round or ends the game after 5 attempts.
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
   * Handles returning to the main menu.
   * Cleans up game state and navigates back to welcome screen.
   * Prevents default event behavior and event bubbling.
   *
   * @param event - Click event from the button
   */
  const handleBackToMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Pass a score with both right and wrong set to 0 to avoid showing results page
    onGameEnd({ right: 0, wrong: 0 });
  };

  /**
   * Handles the user's price prediction submission.
   * Validates the choice and updates the game state accordingly.
   */
  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();



    if (!selectedChoice) {
      // console.log('No choice selected');
      setError('Please select a price prediction first.');
      return;
    }


    if (selectedChoice === correctPrice) {
      setScore(prev => ({ ...prev, right: prev.right + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    setShowResult(true);
  };

  /**
   * Handles the next round button click.
   * Prevents event bubbling and initiates the next round.
   *
   * @param event - Click event from the button
   */
  const handleNextClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    handleNext();
  }, [handleNext]);

  /**
   * Handles radio button selection change for price choices.
   * Updates the selected choice in the component state.
   *
   * @param e - Change event from the radio button group
   */
  const handleChoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedChoice(e.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ ...layoutStyles.flexCenter, minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          <Button
            variant="outlined"
            onClick={handleBackToMenu}
            sx={buttonStyles.outline}
          >
            Back to Menu
          </Button>
        </Box>

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
