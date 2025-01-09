/*********************************************************************
 * App.tsx
 * 
 * Main application component that handles game state and navigation.
 * Manages the flow between welcome screen and game screen, including
 * difficulty selection and game session management.
 *********************************************************************/

import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { WelcomePage } from './components/WelcomePage';
import { GameScreen } from './components/GameScreen';

/*
 * Custom dark theme configuration for Material-UI.
 * Uses a dark color scheme with blue accents for better visibility
 * of financial charts and data.
 */
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

/**
 * Main App component that controls the application flow.
 * Handles:
 * 1. Game state management (welcome screen vs game screen)
 * 2. Difficulty level selection
 * 3. Theme application
 */
export const App: React.FC = () => {
  // Track if a game is in progress
  const [isPlaying, setIsPlaying] = useState(false);
  // Store the selected difficulty level
  const [difficulty, setDifficulty] = useState<string>('');

  /*
   * Handle game start with selected difficulty.
   * Transitions from welcome screen to game screen.
   */
  const handleStartGame = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
    setIsPlaying(true);
  };

  /*
   * Handle game end.
   * Returns to welcome screen and resets difficulty.
   */
  const handleGameEnd = () => {
    setIsPlaying(false);
    setDifficulty('');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      {isPlaying ? (
        <GameScreen difficulty={difficulty} onGameEnd={handleGameEnd} />
      ) : (
        <WelcomePage onStartGame={handleStartGame} />
      )}
    </ThemeProvider>
  );
};
