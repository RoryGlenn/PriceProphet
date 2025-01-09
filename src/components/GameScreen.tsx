import React, { useState, useEffect } from 'react';
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
import { generatePriceChoices } from '../utils/priceUtils';
import { DateTime } from 'luxon';

interface GameScreenProps {
  difficulty: string;
  onGameEnd: (score: { right: number; wrong: number }) => void;
}

/**
 * GameScreen component handles the main game logic and UI.
 * Manages game state, data generation, and user interactions.
 */
export const GameScreen: React.FC<GameScreenProps> = ({ difficulty, onGameEnd }) => {
  // Game state
  const [historicalData, setHistoricalData] = useState<{ [key: string]: OhlcBar[] }>({});
  const [priceChoices, setPriceChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [attempt, setAttempt] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [correctPrice, setCorrectPrice] = useState<string>('');
  
  // Ref to track initialization
  const hasInitialized = React.useRef(false);

  // Initialize game on mount
  useEffect(() => {
    console.log('GameScreen initialization started');
    
    if (!hasInitialized.current) {
      console.log('Generating initial game data');
      generateNewRound();
      hasInitialized.current = true;
    } else {
      console.log('Skipping duplicate initialization');
    }

    return () => {
      console.log('GameScreen cleanup');
    };
  }, []);

  /**
   * Generate a new round of the game.
   * Creates new price data and updates game state.
   */
  const generateNewRound = () => {
    console.log('Generating new round');
    setLoading(true);
    
    try {
      const data = generateRandomData();
      const processedData = processOhlcData(data);
      const { choices, futurePrice } = generateChoices(processedData, difficulty);
      updateGameState(processedData, choices, futurePrice);
    } catch (error) {
      console.error('Error generating new round:', error);
      setLoading(false);
    }
  };

  /**
   * Generate random OHLC data using RandomOHLC class.
   * Creates 90 days of price data with random volatility and drift.
   */
  const generateRandomData = () => {
    console.log('Generating random OHLC data');
    const volatility = Math.random() * 2 + 1;
    const drift = Math.random() * 2 + 1;

    const randOHLC = new RandomOHLC({
      daysNeeded: 90,
      startPrice: 10000,
      volatility: volatility,
      drift: drift,
    });

    return randOHLC.generateOhlcData();
  };

  /**
   * Process raw OHLC data into format required by chart component.
   * Handles different time intervals and timestamp formats.
   *
   * @param data Raw OHLC data from RandomOHLC
   * @returns Processed data suitable for charting
   */
  const processOhlcData = (data: { [key: string]: OhlcRow[] }) => {
    /*
     * We support multiple time intervals from 1min to 1M.
     * Each interval needs its own array of properly formatted OHLC bars.
     * The chart component expects specific time formats:
     * - For intraday (1min to 4H): Unix timestamps
     * - For daily and above: 'yyyy-MM-dd' strings
     */
    const timeIntervals = ['1min', '5min', '15min', '1H', '4H', '1D', '1W', '1M'];
    const processedData: { [key: string]: OhlcBar[] } = {};

    timeIntervals.forEach((tf) => {
      processedData[tf] = data[tf]
        .map((bar: OhlcRow): OhlcBar => formatOhlcBar(bar, tf))
        .sort((a: OhlcBar, b: OhlcBar) => sortOhlcBars(a, b));
    });

    logDataStructure(processedData);
    return processedData;
  };

  /**
   * Format an OHLC bar for the chart component.
   * Handles different timestamp formats based on time interval.
   *
   * @param bar Raw OHLC bar
   * @param timeInterval Time interval of the data
   * @returns Formatted OHLC bar
   */
  const formatOhlcBar = (bar: OhlcRow, timeInterval: string): OhlcBar => {
    /*
     * The chart library (lightweight-charts) requires different time formats:
     * 1. For intraday data (1min to 4H): Use Unix timestamps
     *    - Allows precise time display including hours and minutes
     *    - Maintains exact time spacing between bars
     * 
     * 2. For daily and above (1D, 1W, 1M): Use 'yyyy-MM-dd' strings
     *    - Automatically handles business days
     *    - Properly spaces bars for weekends and holidays
     */
    const date = DateTime.fromSeconds(bar.timestamp);
    
    if (timeInterval.includes('min') || timeInterval.includes('H')) {
      return {
        time: bar.timestamp as Time,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      };
    }
    
    return {
      time: date.toFormat('yyyy-MM-dd') as Time,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    };
  };

  /**
   * Sort OHLC bars by time.
   * Handles both timestamp and date string formats.
   */
  const sortOhlcBars = (a: OhlcBar, b: OhlcBar): number =>
    typeof a.time === 'number' ? a.time - (b.time as number) : a.time < b.time ? -1 : 1;

  /**
   * Log data structure for debugging.
   * Shows available time intervals and number of bars.
   */
  const logDataStructure = (processedData: { [key: string]: OhlcBar[] }) => {
    console.log('Available time intervals:', Object.keys(processedData));
    console.log('Data structure:', {
      timeIntervals: Object.keys(processedData),
      sampleSizes: Object.entries(processedData).map(([tf, data]) => `${tf}: ${data.length} bars`),
    });
  };

  /**
   * Generate price choices for the game round.
   * Removes future data based on difficulty level.
   *
   * @param processedData Processed OHLC data
   * @param difficulty Game difficulty level
   * @returns Price choices and correct future price
   */
  const generateChoices = (
    processedData: { [key: string]: OhlcBar[] },
    difficulty: string
  ): { choices: string[]; futurePrice: number } => {
    /*
     * Game mechanics for price prediction:
     * 1. Get the prediction timeframe based on difficulty:
     *    - Easy: 1 day into the future
     *    - Medium: 1 week into the future
     *    - Hard: 1 month into the future
     * 
     * 2. Take the last price from the daily data as the "future" price
     * 
     * 3. Remove the corresponding amount of data from all timeframes
     *    to hide the future prices from the player
     */
    const futureIndex = getFutureIndex(difficulty);
    const futurePrice = processedData['1D'][processedData['1D'].length - 1].close;
    const choices = generatePriceChoices(futurePrice);

    // Remove future data from all time intervals to maintain consistency
    Object.keys(processedData).forEach((tf) => {
      processedData[tf] = processedData[tf].slice(0, -futureIndex);
    });

    return { choices, futurePrice };
  };

  /**
   * Get future index based on difficulty level.
   * Easy: 1 day, Medium: 7 days, Hard: 30 days
   */
  const getFutureIndex = (difficulty: string): number => {
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
  };

  /**
   * Update game state with new round data.
   * Resets selection and result states.
   */
  const updateGameState = (
    processedData: { [key: string]: OhlcBar[] },
    choices: string[],
    futurePrice: number
  ) => {
    console.log('Updating game state with:', { choices, futurePrice });
    setHistoricalData(processedData);
    setPriceChoices(choices);
    setCorrectPrice(futurePrice.toFixed(2));
    setSelectedChoice('');
    setShowResult(false);
    setLoading(false);
  };

  const debugWrapper = (fn: Function, name: string) => {
    return (...args: any[]) => {
      console.log(`Entering ${name}`);
      try {
        const result = fn(...args);
        console.log(`Exiting ${name}`);
        return result;
      } catch (error) {
        console.error(`Error in ${name}:`, error);
        throw error;
      }
    };
  };

  const handleSubmit = debugWrapper(() => {
    console.log('Submit button clicked');
    console.log('Current game state:', {
      selectedChoice,
      correctPrice,
      priceChoices,
      showResult,
      score,
      attempt
    });
    
    if (!selectedChoice) {
      console.warn('No choice selected, returning early');
      return;
    }

    try {
      console.log('Processing submission...');
      if (selectedChoice === correctPrice) {
        console.log('Correct answer! Selected:', selectedChoice, 'Correct:', correctPrice);
        setScore((prev) => {
          const newScore = { ...prev, right: prev.right + 1 };
          console.log('Updated score:', newScore);
          return newScore;
        });
      } else {
        console.log('Wrong answer. Selected:', selectedChoice, 'Correct:', correctPrice);
        setScore((prev) => {
          const newScore = { ...prev, wrong: prev.wrong + 1 };
          console.log('Updated score:', newScore);
          return newScore;
        });
      }
      console.log('Setting showResult to true');
      setShowResult(true);
      console.log('Submission processing complete');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  }, 'handleSubmit');

  const handleSubmitClick = debugWrapper((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log('Submit button clicked - direct handler');
    handleSubmit();
  }, 'handleSubmitClick');

  // Add logging to track state changes
  useEffect(() => {
    console.log('Score changed:', score);
  }, [score]);

  useEffect(() => {
    console.log('ShowResult changed:', showResult);
  }, [showResult]);

  const handleNext = () => {
    console.log('Next round button clicked');
    console.log('Current attempt:', attempt);
    
    if (attempt >= 5) {
      console.log('Game over, returning to menu with score:', score);
      onGameEnd(score);
    } else {
      console.log('Starting next round');
      setAttempt((prev) => {
        console.log('Incrementing attempt from', prev, 'to', prev + 1);
        return prev + 1;
      });
      setShowResult(false);
      setSelectedChoice('');
      generateNewRound();
    }
  };

  const handleBackToMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onGameEnd(score);
  };

  const handleNextClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleNext();
  };

  // Add test logging on mount
  useEffect(() => {
    console.log('GameScreen mounted');
    console.log('Initial state:', {
      difficulty,
      priceChoices,
      selectedChoice,
      correctPrice,
      showResult,
      score,
      attempt
    });
  }, []);

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
          <ChartComponent data={historicalData} defaultInterval="1D" />
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
            onChange={(e) => {
              console.log('Radio selection changed:', e.target.value);
              setSelectedChoice(e.target.value);
            }}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 2
            }}
          >
            {priceChoices.map((choice) => (
              <FormControlLabel
                key={choice}
                value={choice}
                control={
                  <Radio 
                    sx={{
                      color: 'rgba(255, 255, 255, 0.3)',
                      '&.Mui-checked': {
                        color: '#00F5A0',
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
                    backgroundColor: 'rgba(0, 245, 160, 0.05)',
                  }
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
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Submit button clicked - raw event');
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
            }}
            onMouseDown={(e) => {
              console.log('Button mousedown event');
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              console.log('Button mouseup event');
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
