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

  /**
   * Generate random OHLC data using RandomOHLC class.
   * Creates 90 days of price data with random volatility and drift.
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
   * Update game state with new round data.
   */
  const updateGameState = (
    processedData: { [key: string]: OhlcBar[] },
    choices: string[],
    futurePrice: number
  ) => {
    setHistoricalData(processedData);
    setPriceChoices(choices);
    setCorrectPrice(futurePrice.toFixed(2));
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
   * Converts raw OHLC data from RandomOHLC into a format suitable for the charting library.
   * 
   * @param data Raw data from RandomOHLC
   *    Structure: { [timeframe: string]: OhlcRow[] }
   *    OhlcRow = {
   *      timestamp: number;  // Unix timestamp in seconds
   *      open: number;
   *      high: number;
   *      low: number;
   *      close: number;
   *    }
   * 
   * @returns Processed data for the chart
   *    Structure: { [timeframe: string]: OhlcBar[] }
   *    OhlcBar = {
   *      time: Time;  // lightweight-charts specific time format
   *      open: number;
   *      high: number;
   *      low: number;
   *      close: number;
   *    }
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

    // Log the data structure for verification
    console.log('Processed data lengths:', Object.fromEntries(
      Object.entries(processedData).map(([interval, data]) => [interval, data.length])
    ));

    return processedData;
  }, [formatOhlcBar, sortOhlcBars]);

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

  const getBarsToRemove = useCallback((timeframe: string, days: number): number => {
    // Calculate how many bars to remove for each timeframe based on number of days
    const minutesInDay = 1440;
    switch (timeframe) {
      case '1m': return days * minutesInDay;        // 1440 minutes per day
      case '5m': return days * (minutesInDay / 5);  // 288 5-min bars per day
      case '15m': return days * (minutesInDay / 15); // 96 15-min bars per day
      case '1h': return days * 24;                  // 24 1-hour bars per day
      case '4h': return days * 6;                   // 6 4-hour bars per day
      case 'D': return days;                        // 1 daily bar per day
      case 'W': return Math.ceil(days / 7);         // Convert days to weeks
      case 'M': return Math.ceil(days / 30);        // Approximate months
      default: return days;
    }
  }, []);

  const generateChoices = useCallback((
    processedData: { [key: string]: OhlcBar[] },
    difficulty: string
  ): { choices: string[]; futurePrice: number } => {
    // Log the initial data lengths
    console.log('Initial data lengths:', Object.fromEntries(
      Object.entries(processedData).map(([interval, data]) => [interval, data.length])
    ));

    // Get the 91st day's close price as the answer
    const futurePrice = processedData['D'][processedData['D'].length - 1].close;
    console.log('Future price (91st day):', futurePrice);

    // Calculate days to remove based on difficulty
    const daysToRemove = getFutureIndex(difficulty);
    console.log('Days to remove based on difficulty:', {
      difficulty,
      daysToRemove
    });

    const choices = generatePriceChoices(futurePrice);

    // Remove the appropriate number of bars from each timeframe
    Object.keys(processedData).forEach((tf) => {
      const beforeLength = processedData[tf].length;
      const barsToRemove = getBarsToRemove(tf, daysToRemove);
      processedData[tf] = processedData[tf].slice(0, -barsToRemove);
      console.log(`${tf} data: ${beforeLength} bars -> ${processedData[tf].length} bars (removed ${barsToRemove} bars)`);
    });

    return { choices, futurePrice };
  }, [getFutureIndex, getBarsToRemove]);

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
    }
  }, [difficulty, processOhlcData, getFutureIndex]);

  // Initialize game on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      generateNewRound();
      hasInitialized.current = true;
    }
  }, [generateNewRound]);

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

  const handleBackToMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onGameEnd(score);
  };

  const handleNextClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleNext();
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
            onChange={(e) => {
              // console.log('Radio selection changed:', e.target.value);
              setSelectedChoice(e.target.value);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              // console.log('Submit button clicked - raw event');
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
