/*********************************************************************
 * GameScreen.tsx
 * 
 * Main game interface component that handles the price prediction gameplay.
 * Manages game state, data generation, user interactions, and scoring.
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
} from '@mui/material';
import { ChartComponent } from './ChartComponent';
import { RandomOHLC } from '../random_ohlc';
import { OhlcBar, OhlcRow } from '../types';
import { Time } from 'lightweight-charts';
import { generatePriceChoices, formatPrice } from '../utils/priceUtils';

/**
 * Props for the GameScreen component
 * 
 * @interface GameScreenProps
 * @property {string} difficulty - Selected difficulty level (Easy, Medium, Hard)
 * @property {Function} onReturnToWelcome - Callback to navigate back to welcome screen
 */
interface GameScreenProps {
  /** Selected difficulty level */
  difficulty: string;
  /** Callback function to return to welcome screen */
  onReturnToWelcome: () => void;
}

/**
 * Main game interface component.
 * Handles the core game logic including:
 * - Data generation using RandomOHLC
 * - Game state management
 * - Score tracking
 * - User interaction processing
 * 
 * @component
 * @param {GameScreenProps} props - Component props
 * @param {string} props.difficulty - Selected difficulty level
 * @param {Function} props.onReturnToWelcome - Callback to return to welcome screen
 */
export const GameScreen: React.FC<GameScreenProps> = ({ difficulty, onReturnToWelcome }) => {
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
  const generateRandomData = () => {
    const volatility = Math.random() * 2 + 1;
    const drift = Math.random() * 2 + 1;

    const randOHLC = new RandomOHLC({
      daysNeeded: 91,
      startPrice: 10000,
      volatility: volatility,
      drift: drift,
    });

    return randOHLC.generateOhlcData();
  };

  /**
   * Updates the game state with new round data.
   * Resets the game state for a new round by:
   * - Setting the historical data for the chart
   * - Setting up the price choices for the player
   * - Setting the correct price
   * - Resetting selection and result states
   * - Turning off loading state
   * 
   * @param processedData - Processed OHLC data organized by timeframe
   * @param choices - Array of price choices to display to the player
   * @param futurePrice - The correct future price for this round
   */
  const updateGameState = (
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
  };

  /**
   * Converts a single OhlcRow to an OhlcBar format required by the charting library.
   * The main transformation is converting the Unix timestamp to the chart's Time format.
   * 
   * @param bar Raw OHLC bar with Unix timestamp
   * @param timeInterval Current timeframe being processed
   * @returns Formatted OHLC bar ready for the chart
   */
  const formatOhlcBar = useCallback((bar: OhlcRow, timeInterval: string): OhlcBar => {
    return {
      time: bar.timestamp as Time,  // Cast Unix timestamp to chart's Time type
      open: bar.open,               // Price values remain the same
      high: bar.high,               // Just copying them from
      low: bar.low,                 // the raw data to the
      close: bar.close,             // processed format
    };
  }, []);

  const sortOhlcBars = useCallback((a: OhlcBar, b: OhlcBar): number =>
    typeof a.time === 'number' ? a.time - (b.time as number) : a.time < b.time ? -1 : 1
  , []);

  // const logDataStructure = useCallback((processedData: { [key: string]: OhlcBar[] }) => {
  //   // Keep this empty but maintain the function for future debugging if needed
  // }, []);

  /**
   * Processes raw OHLC data into timeframe groups.
   * Takes the 1-minute data and aggregates it into larger timeframes (5m, 15m, 1h, etc.).
   * Handles partial periods appropriately, especially for weekly and monthly intervals.
   * 
   * @param data Raw OHLC data organized by timeframe
   * @returns Processed data ready for chart display
   */
  const processOhlcData = useCallback((data: { [key: string]: OhlcRow[] }) => {
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
          case '5m': return 5;
          case '15m': return 15;
          case '1h': return 60;
          case '4h': return 240;
          case 'D': return 1440;
          case 'W': return 1440 * 7;
          case 'M': return 1440 * 30;
          default: return 1;
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
      processedData[tf] = chunks.map(chunk => ({
        time: chunk[0].timestamp as Time,
        open: chunk[0].open,
        high: Math.max(...chunk.map(bar => bar.high)),
        low: Math.min(...chunk.map(bar => bar.low)),
        close: chunk[chunk.length - 1].close
      }));
    });

    // // Log the data structure for verification
    // console.log('Processed data lengths:', Object.fromEntries(
    //   Object.entries(processedData).map(([interval, data]) => [interval, data.length])
    // ));

    return processedData;
  }, [formatOhlcBar, sortOhlcBars]);

  /**
   * Determines how many days into the future to predict based on difficulty.
   * - Easy: 1 day
   * - Medium: 7 days
   * - Hard: 30 days
   * 
   * @param difficulty Selected game difficulty
   * @returns Number of days to look ahead
   */
  const getFutureIndex = useCallback((difficulty: string): number => {
    switch (difficulty) {
      case 'Easy':
        return 1;
      case 'Medium':
        return 7;
      case 'Hard':
        return 30;
      default:
        return 1;
    }
  }, []);

  /**
   * Calculates how many bars to remove from each timeframe based on the number of days.
   * Ensures consistent data removal across all timeframes to hide future data.
   * 
   * @param timeframe Current timeframe (1m, 5m, 15m, etc.)
   * @param days Number of days to remove
   * @returns Number of bars to remove for the given timeframe
   */
  // const getBarsToRemove = useCallback((timeframe: string, days: number): number => {
  //   // Calculate how many bars to remove for each timeframe based on number of days
  //   const minutesInDay = 1440;
  //   switch (timeframe) {
  //     case '1m': return days * minutesInDay;        // 1440 minutes per day
  //     case '5m': return days * (minutesInDay / 5);  // 288 5-min bars per day
  //     case '15m': return days * (minutesInDay / 15); // 96 15-min bars per day
  //     case '1h': return days * 24;                  // 24 1-hour bars per day
  //     case '4h': return days * 6;                   // 6 4-hour bars per day
  //     case 'D': return days;                        // 1 daily bar per day
  //     case 'W': return Math.ceil(days / 7);         // Convert days to weeks
  //     case 'M': return Math.ceil(days / 30);        // Approximate months
  //     default: return days;
  //   }
  // }, []);

  /**
   * Generates price choices for the prediction game.
   * Takes the future price and creates a set of plausible options around it.
   * Also handles data trimming to hide future data from the player.
   * 
   * @param processedData OHLC data organized by timeframe
   * @param difficulty Current game difficulty
   * @returns Object containing price choices and the correct future price
   */
  // const generateChoices = useCallback((
  //   processedData: { [key: string]: OhlcBar[] },
  //   difficulty: string
  // ): { choices: string[]; futurePrice: number } => {
  //   // Log the initial data lengths
  //   console.log('Initial data lengths:', Object.fromEntries(
  //     Object.entries(processedData).map(([interval, data]) => [interval, data.length])
  //   ));

  //   // Get the 91st day's close price as the answer
  //   const futurePrice = processedData['D'][processedData['D'].length - 1].close;
  //   console.log('Future price (91st day):', futurePrice);

  //   // Calculate days to remove based on difficulty
  //   const daysToRemove = getFutureIndex(difficulty);
  //   console.log('Days to remove based on difficulty:', {
  //     difficulty,
  //     daysToRemove
  //   });

  //   const choices = generatePriceChoices(futurePrice);

  //   // Remove the appropriate number of bars from each timeframe
  //   Object.keys(processedData).forEach((tf) => {
  //     const beforeLength = processedData[tf].length;
  //     const barsToRemove = getBarsToRemove(tf, daysToRemove);
  //     processedData[tf] = processedData[tf].slice(0, -barsToRemove);
  //     console.log(`${tf} data: ${beforeLength} bars -> ${processedData[tf].length} bars (removed ${barsToRemove} bars)`);
  //   });

  //   return { choices, futurePrice };
  // }, [getFutureIndex, getBarsToRemove]);

  /**
   * Generates a new round of the game.
   * Creates new random price data, processes it into timeframes,
   * and sets up the choices for the player.
   * 
   * Handles error cases and updates loading state appropriately.
   * 
   * @throws Error if data generation or processing fails
   */
  const generateNewRound = useCallback(() => {
    setLoading(true);
    
    try {
      // Get raw data
      const rawData = generateRandomData();

      // Calculate how many minute bars to remove based on difficulty
      const daysToRemove = getFutureIndex(difficulty);
      const minutesToRemove = daysToRemove * 1440; // 1440 minutes per day

      // Store the future price before trimming
      const futurePrice = rawData['D'][rawData['D'].length - 1].close;

      // Remove future data from 1-minute data first
      rawData['1m'] = rawData['1m'].slice(0, -minutesToRemove);

      // Now process the trimmed data into all timeframes
      const processedData = processOhlcData(rawData);
      
      // Generate choices using the stored future price
      const choices = generatePriceChoices(futurePrice);

      // Update game state
      updateGameState(processedData, choices, futurePrice);
    } catch (error) {
      console.error('Error generating new round:', error);
      setLoading(false);
      // Show error message to user
      alert('An error occurred while generating the game data. Please try again.');
    }
  }, [difficulty, processOhlcData, getFutureIndex]);

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
      onReturnToWelcome();
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
   * @see onReturnToWelcome
   */
  const handleBackToMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onReturnToWelcome();
  };

  /**
   * Handles the user's price prediction submission.
   * Validates the choice and updates the game state accordingly.
   */
  const handleSubmit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Current state:', {
      selectedChoice,
      correctPrice,
      showResult,
      score
    });
    
    if (selectedChoice === correctPrice) {
      setScore(prev => ({ ...prev, right: prev.right + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
    setShowResult(true);
  }, [selectedChoice, correctPrice, showResult, score]);

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container 
      maxWidth={false}
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Paper 
        sx={{ 
          width: '100%',
          background: 'rgba(16, 20, 24, 0.8)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          position: 'relative',
          overflow: 'hidden',
          p: 4,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 4,
            padding: '2px',
            background: 'linear-gradient(60deg, #00F5A0, #00D9F5)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          position: 'relative',
          zIndex: 1
        }}>
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
            sx={{
              borderColor: 'rgba(0, 245, 160, 0.5)',
              color: '#00F5A0',
              '&:hover': {
                borderColor: '#00F5A0',
                backgroundColor: 'rgba(0, 245, 160, 0.1)',
              }
            }}
          >
            Back to Menu
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 4,
          position: 'relative',
          zIndex: 1
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500 
            }}
          >
            Difficulty: <span style={{ color: '#00F5A0' }}>{difficulty}</span> | 
            Attempt: <span style={{ color: '#00F5A0' }}>{attempt}/5</span>
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500 
            }}
          >
            Score: <span style={{ color: '#00F5A0' }}>Correct: {score.right}</span> | 
            <span style={{ color: '#ef5350' }}> Wrong: {score.wrong}</span>
          </Typography>
        </Box>

        <Box sx={{ 
          mb: 4,
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 2,
          p: 2,
          position: 'relative',
          zIndex: 1
        }}>
          <ChartComponent data={historicalData} defaultInterval="D" />
        </Box>

        <Box sx={{ 
          mb: 4,
          position: 'relative',
          zIndex: 1
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: '#00F5A0',
              fontWeight: 500,
              letterSpacing: 1,
              mb: 3
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
                  borderColor: selectedChoice === choice ? 
                    'rgba(0, 245, 160, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: selectedChoice === choice ? 
                    'rgba(0, 245, 160, 0.1)' : 'transparent',
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
                mb: 3
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
                background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: 1,
                border: 0,
                zIndex: 10,
                position: 'relative',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                  boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)',
                },
              }}
            >
              {attempt >= 5 ? 'See Results' : 'Next Round'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
            }}
            size="large"
            disabled={!selectedChoice}
            sx={{
              display: 'block',
              margin: '0 auto',
              minWidth: 200,
              height: 48,
              background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
              boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: 1,
              border: 0,
              zIndex: 10,
              position: 'relative',
              '&:hover': {
                background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)',
              },
              '&.Mui-disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                boxShadow: 'none',
              }
            }}
          >
            Submit Prediction
          </Button>
        )}
      </Paper>
    </Container>
  );
};
