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
  onGameEnd: () => void;
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

  // Initialize game on mount
  useEffect(() => {
    let mounted = true;

    const initializeGame = async () => {
      if (mounted) {
        generateNewRound();
      }
    };

    initializeGame();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Generate a new round of the game.
   * Creates new price data and updates game state.
   */
  const generateNewRound = () => {
    setLoading(true);
    const data = generateRandomData();
    const processedData = processOhlcData(data);
    const { choices, futurePrice } = generateChoices(processedData, difficulty);
    updateGameState(processedData, choices, futurePrice);
  };

  /**
   * Generate random OHLC data using RandomOHLC class.
   * Creates 90 days of price data with random volatility and drift.
   */
  const generateRandomData = () => {
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
    setHistoricalData(processedData);
    setPriceChoices(choices);
    setCorrectPrice(choices[0]);
    setSelectedChoice('');
    setShowResult(false);
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!selectedChoice) return;

    if (selectedChoice === correctPrice) {
      setScore((prev) => ({ ...prev, right: prev.right + 1 }));
    } else {
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (attempt >= 5) {
      // Game over
      onGameEnd();
    } else {
      setAttempt((prev) => prev + 1);
      generateNewRound();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4, backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Predict the Future Price</Typography>
          <Button variant="outlined" color="primary" onClick={onGameEnd}>
            Back to Menu
          </Button>
        </Box>

        <Typography variant="body1" paragraph>
          Difficulty: {difficulty} | Attempt: {attempt}/5
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Score: Correct: {score.right} | Wrong: {score.wrong}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <ChartComponent data={historicalData} defaultInterval="1D" />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            What do you think the future closing price will be?
          </Typography>
          <RadioGroup value={selectedChoice} onChange={(e) => setSelectedChoice(e.target.value)}>
            {priceChoices.map((choice) => (
              <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
            ))}
          </RadioGroup>
        </Box>

        {showResult ? (
          <>
            <Typography
              variant="h6"
              color={selectedChoice === correctPrice ? 'success.main' : 'error.main'}
            >
              {selectedChoice === correctPrice
                ? 'Correct! Well done!'
                : `Wrong! The correct price was ${correctPrice}`}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              size="large"
              sx={{ mt: 2 }}
            >
              {attempt >= 5 ? 'See Results' : 'Next Round'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            size="large"
            disabled={!selectedChoice}
          >
            Submit Prediction
          </Button>
        )}
      </Paper>
    </Container>
  );
};
