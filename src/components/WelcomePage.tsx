import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Box,
  Paper
} from '@mui/material';

interface WelcomePageProps {
  onStart: (difficulty: string) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const [difficulty, setDifficulty] = useState('easy');

  useEffect(() => {
    console.log('WelcomePage mounted');
  }, []);

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to the Ultimate Stock Prediction Challenge!
        </Typography>

        <Typography variant="body1" paragraph>
          You've just joined the analytics team at a top trading firm. To prove your skills, 
          you'll be shown the last 90 days of a stock's prices. Your mission? 
          <Box component="span" sx={{ fontWeight: 'bold' }}> Predict the future closing price!</Box>
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Difficulty Levels:
        </Typography>

        <Box component="ul" sx={{ mb: 4, pl: 3 }}>
          <Typography component="li">
            <Box component="span" sx={{ fontWeight: 'bold' }}>Easy:</Box> Predict the next day's closing price
          </Typography>
          <Typography component="li">
            <Box component="span" sx={{ fontWeight: 'bold' }}>Medium:</Box> Predict the closing price 7 days from now
          </Typography>
          <Typography component="li">
            <Box component="span" sx={{ fontWeight: 'bold' }}>Hard:</Box> Predict the closing price 30 days from now
          </Typography>
        </Box>

        <Typography paragraph>
          Can you outsmart the market and achieve the highest accuracy possible? Select a difficulty 
          and press Start Game to find out!
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Choose your difficulty:
          </Typography>
          <RadioGroup
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <FormControlLabel value="easy" control={<Radio />} label="Easy" />
            <FormControlLabel value="medium" control={<Radio />} label="Medium" />
            <FormControlLabel value="hard" control={<Radio />} label="Hard" />
          </RadioGroup>
        </Box>

        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => onStart(difficulty)}
          sx={{ mt: 4 }}
        >
          Start Game
        </Button>
      </Paper>
    </Container>
  );
}; 