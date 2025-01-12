/*********************************************************************
 * ChartPredictionView.tsx
 *
 * Main chart prediction interface component that handles price prediction gameplay.
 * Manages chart state, data generation, user interactions, and scoring.
 *********************************************************************/

import React, { useState, useEffect, useCallback } from 'react';
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
import { OhlcBar, OhlcRow, DifficultyLevel } from '../types';
import { Time } from 'lightweight-charts';
import { generatePriceChoices, formatPrice } from '../utils/priceUtils';
import { buttonStyles, layoutStyles } from '../styles/theme'; 

/**
 * Props for the ChartPredictionView component
 *
 * @interface ChartPredictionViewProps
 * @property {DifficultyLevel} difficulty - Selected difficulty level
 * @property {Function} onGameEnd - Callback when game ends with final score
 */
interface ChartPredictionViewProps {
  /** Selected difficulty level */
  difficulty: DifficultyLevel;
  /** Callback function when game ends with final score */
  onGameEnd: (score: { right: number; wrong: number }) => void;
}

/**
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
  // Game state variables
  /** Historical price data organized by timeframe */
  const [historicalData, setHistoricalData] = useState<{ [key: string]: OhlcBar[] }>({});
  /** Available price choices for prediction */
  const [priceChoices, setPriceChoices] = useState<string[]>([]);
  /** Currently selected price choice */
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  /** Loading state for data generation */
  const [loading, setLoading] = useState(true);
  /** Game score tracking */
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  /** Current attempt number (max 5) */
  const [attempt, setAttempt] = useState(1);
  /** Whether to show the result of the current guess */
  const [showResult, setShowResult] = useState(false);
  /** The correct price for the current round */
  const [correctPrice, setCorrectPrice] = useState<string>('');
  /** Error message for the component */
  const [error, setError] = useState<string | null>(null);

  /** Ref to track component initialization */
  const hasInitialized = React.useRef(false);

  /**
   * Generates random OHLC (Open, High, Low, Close) price data.
   * Creates 91 days of price data with random volatility and drift parameters.
   * Uses the RandomOHLC class to generate realistic-looking price movements.
   *
   * @returns {Object} An object containing OHLC data organized by timeframe
   * @property {OhlcRow[]} 1m - One-minute interval data
   * @property {OhlcRow[]} D - Daily interval data
   *
   * @remarks
   * - Volatility is randomly set between 1-3
   * - Drift is randomly set between 1-3
   * - Start price is fixed at 10000
   * - Generates 91 days to include the future price day
   */
  const generateRandomData = useCallback((): TimeIntervalDict => {
    try {
      // Validate and constrain volatility and drift parameters
      const volatilityValue = Math.max(1, Math.min(3, Math.random() * 2 + 1));
      const driftValue = Math.max(1, Math.min(3, Math.random() * 2 + 1));

      if (process.env.NODE_ENV === 'development') {
        console.debug('[ChartPredictionView] Generating data with:', {
          volatility: volatilityValue,
          drift: driftValue,
          daysNeeded: 91,
          startPrice: 10000,
        });
      }

      const randOHLC = new RandomOHLC({
        daysNeeded: 91,
        startPrice: 10000,
        volatility: volatilityValue,
        drift: driftValue,
      });

      const data = randOHLC.generateOhlcData();

      // Validate the generated data
      if (!data || typeof data !== 'object') {
        throw new Error('Generated data is invalid');
      }

      if (!data['1m'] || !Array.isArray(data['1m']) || data['1m'].length === 0) {
        throw new Error('Missing or invalid minute data');
      }

      if (!data['D'] || !Array.isArray(data['D']) || data['D'].length === 0) {
        throw new Error('Missing or invalid daily data');
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[ChartPredictionView] Error in generateRandomData:', error);
      }
      throw error; // Re-throw to be handled by the caller
    }
  }, []);

  /**
   * Updates the game state with new data and choices
   */
  const updateGameState = useCallback(
    (
      processedData: { [key: string]: OhlcBar[] },
      choices: string[],
      futurePrice: number
    ) => {
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
   * Processes raw OHLC data into timeframe groups.
   * Takes the 1-minute data and aggregates it into larger timeframes (5m, 15m, 1h, etc.).
   * Handles partial periods appropriately, especially for weekly and monthly intervals.
   *
   * @param data Raw OHLC data organized by timeframe
   * @returns Processed data ready for chart display
   */
  const processOhlcData = useCallback(
    (data: { [key: string]: OhlcRow[] }) => {
      // Get the trimmed 1-minute data
      const minuteData = data['1m'];

      // Define all timeframes we want to display
      const displayIntervals = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'] as const;

      // Initialize the processed data object that will be used by the chart
      const processedData: { [key: string]: OhlcBar[] } = {};

      // Process 1-minute data first
      processedData['1m'] = minuteData
        .map((bar: OhlcRow): OhlcBar => formatOhlcBar(bar, '1m'))
        .sort((a: OhlcBar, b: OhlcBar) => sortOhlcBars(a, b));

      // Group minute data into larger timeframes
      displayIntervals.slice(1).forEach((tf) => {
        const barsPerInterval = (() => {
          switch (tf) {
            case '5m':
              return 5;
            case '15m':
              return 15;
            case '1h':
              return 60;
            case '4h':
              return 240;
            case 'D':
              return 1440;
            case 'W':
              return 1440 * 7;
            case 'M':
              return 1440 * 30;
            default:
              return 1;
          }
        })();

        // Group minute data into chunks
        const chunks: OhlcRow[][] = [];
        for (let i = 0; i < minuteData.length; i += barsPerInterval) {
          const chunk = minuteData.slice(i, i + barsPerInterval);
          // Always include the chunk, even if it's partial
          // This is especially important for weekly and monthly intervals
          if (chunk.length > 0) {
            chunks.push(chunk);
          }
        }

        // Convert chunks to OHLC bars
        processedData[tf] = chunks.map((chunk) => ({
          time: chunk[0].timestamp as Time,
          open: chunk[0].open,
          high: Math.max(...chunk.map((bar) => bar.high)),
          low: Math.min(...chunk.map((bar) => bar.low)),
          close: chunk[chunk.length - 1].close,
        }));
      });

      return processedData;
    },
    [formatOhlcBar, sortOhlcBars]
  );

  /**
   * Determines how many days into the future to predict based on difficulty.
   * - Easy: 1 day
   * - Medium: 7 days
   * - Hard: 30 days
   *
   * @param difficulty Selected game difficulty
   * @returns Number of days to look ahead
   */
  const getFutureIndex = useCallback((difficulty: DifficultyLevel): number => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 1;
      case 'medium':
        return 7;
      case 'hard':
        return 30;
      default:
        console.error(`Invalid difficulty level: ${difficulty}`);
        return 1;
    }
  }, []);

  /**
   * Clears any displayed error messages
   */
  const handleErrorClose = () => {
    setError(null);
  };

  /**
   * Generates a new round of the game.
   * Creates new random price data, processes it into timeframes,
   * and sets up the choices for the player.
   *
   * Handles error cases and updates loading state appropriately.
   */
  const generateNewRound = useCallback(() => {
    setLoading(true);
    setError(null);

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
    } catch (error) {
      setLoading(false);
      
      if (error instanceof Error) {
        const errorMessage = error.message.includes('Open prices do not match')
          ? 'Data generation failed due to price mismatch. Please try again.'
          : 'An unexpected error occurred. Please try again.';
        
        setError(errorMessage);
        if (process.env.NODE_ENV === 'development') {
          console.error('[ChartPredictionView] Error generating round:', error);
        }
      }
    }
  }, [difficulty, processOhlcData, getFutureIndex, updateGameState, generateRandomData]);

  // Initialize game on mount or when difficulty changes
  useEffect(() => {
    generateNewRound();
    hasInitialized.current = true;
  }, [generateNewRound, difficulty]);

  /**
   * Handles the "Next" button click.
   * Either starts a new round or ends the game after 5 attempts.
   */
  const handleNext = () => {
    if (attempt >= 5) {
      onGameEnd(score);
    } else {
      setAttempt((prev) => prev + 1);
      setShowResult(false);
      setSelectedChoice('');
      generateNewRound();
    }
  };

  /**
   * Handles returning to the main menu.
   * Cleans up game state and navigates back to welcome screen.
   * Prevents default event behavior and event bubbling.
   *
   * @param event - Click event from the button
   * @see onGameEnd
   */
  const handleBackToMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onGameEnd(score);
  };

  /**
   * Handles the user's price prediction submission.
   * Validates the choice and updates the game state accordingly.
   */
  const handleSubmit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (process.env.NODE_ENV === 'development') {
        console.debug('[ChartPredictionView] Submitting prediction:', {
          selectedChoice,
          correctPrice,
        });
      }

      if (selectedChoice === correctPrice) {
        setScore((prev) => ({ ...prev, right: prev.right + 1 }));
      } else {
        setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
      }
      setShowResult(true);
    },
    [selectedChoice, correctPrice]
  );

  /**
   * Handles the next round button click.
   * Prevents event bubbling and initiates the next round.
   *
   * @param event - Click event from the button
   */
  const handleNextClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleNext();
  };

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
          <ChartComponent data={historicalData} defaultInterval="D" />
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
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            size="large"
            disabled={!selectedChoice}
            sx={{
              display: 'block',
              margin: '0 auto',
              minWidth: 200,
              height: 48,
              ...buttonStyles.primary,
            }}
          >
            Submit Prediction
          </Button>
        )}
      </Paper>
    </Container>
  );
};
