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

export const GameScreen: React.FC<GameScreenProps> = ({ difficulty, onGameEnd }) => {
  const [historicalData, setHistoricalData] = useState<{ [key: string]: OhlcBar[] }>({});
  const [priceChoices, setPriceChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [attempt, setAttempt] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [correctPrice, setCorrectPrice] = useState<string>('');

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    setLoading(true);


    // generate a random float from 1-3 and set it equal to the volatility
    const volatility = Math.random() * 2 + 1;
    const drift = Math.random() * 2 + 1;

    // generate random OHLC data
    const randOHLC = new RandomOHLC({
      daysNeeded: 91,
      startPrice: 100,
      volatility: volatility,
      drift: drift,
    });

    const data = randOHLC.generateOhlcData();
    const timeframes = ['1H', '4H', '1D', '1W', '1M'];
    const processedData: { [key: string]: OhlcBar[] } = {};

    timeframes.forEach((tf) => {
      processedData[tf] = data[tf]
        .map((bar: OhlcRow): OhlcBar => ({
          time: DateTime.fromSeconds(bar.timestamp).toFormat('yyyy-MM-dd') as Time,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }))
        .sort((a: OhlcBar, b: OhlcBar) => (a.time < b.time ? -1 : 1));
    });

    // Get the future price based on difficulty
    const futureIndex = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 7 : 30;
    const futurePrice = processedData['1D'][processedData['1D'].length - 1].close;
    const choices = generatePriceChoices(futurePrice);

    // Remove future data from all timeframes
    Object.keys(processedData).forEach((tf) => {
      processedData[tf] = processedData[tf].slice(0, -futureIndex);
    });

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
            <Typography variant="h6" color={selectedChoice === correctPrice ? 'success.main' : 'error.main'}>
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