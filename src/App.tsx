/*********************************************************************
 * App.tsx
 *
 * Main application component that handles game state and navigation.
 * Manages the flow between welcome screen and game screen, including
 * difficulty selection and game session management.
 *********************************************************************/

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { theme } from './styles/theme';
import { WelcomePage } from './components/WelcomePage';
import { ChartPredictionView } from './components/ChartPredictionView';
import { ResultsPage } from './components/ResultsPage';
import { localStorageService } from './services/localStorageService';
import { Score } from './components/ChartPredictionView';
import { DifficultyLevel } from './types';
import { userInfoService } from './services/userInfoService';

// Game configuration types
interface GameConfig {
  isStarted: boolean;
  isEnded: boolean;
  difficulty: DifficultyLevel;
  score: Score;
}

// Initial game configuration
const INITIAL_GAME_CONFIG: GameConfig = {
  isStarted: false,
  isEnded: false,
  difficulty: 'Easy',
  score: { right: 0, wrong: 0 },
};

function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig>(INITIAL_GAME_CONFIG);
  const [score, setScore] = useState<Score>(INITIAL_GAME_CONFIG.score);

  const handleGameStart = (difficulty: DifficultyLevel) => {
    setGameConfig({
      ...INITIAL_GAME_CONFIG,
      isStarted: true,
      difficulty,
    });
    setScore(INITIAL_GAME_CONFIG.score);
  };

  const handleGameEnd = (finalScore: Score) => {
    setGameConfig((prev) => ({ ...prev, isEnded: true }));
    setScore(finalScore);

    // Save game result to localStorage
    const totalTime = 300; // Example time in seconds, adjust based on actual game duration
    const gameResult = {
      difficulty: gameConfig.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      score: finalScore.right * 100, // Convert to point system
      guesses: [], // Add actual guesses if you're tracking them
      finalPrice: 0, // Add actual final price
      startPrice: 0, // Add actual start price
      timeInterval: '1h',
      success: finalScore.right > finalScore.wrong,
      totalTime,
    };

    localStorageService.saveGame(gameResult);
  };

  const handlePlayAgain = () => {
    setGameConfig((prev) => ({ ...prev, isEnded: false }));
    setScore(INITIAL_GAME_CONFIG.score);
  };

  const handleBackToMenu = () => {
    setGameConfig(INITIAL_GAME_CONFIG);
    setScore(INITIAL_GAME_CONFIG.score);
  };

  // Initialize user profile
  useEffect(() => {
    userInfoService.initializeUser();
  }, []);

  // Debug keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for Ctrl/Cmd + D
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault(); // Prevent browser's default save dialog
        localStorageService.debugPrintStorage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!gameConfig.isStarted && <WelcomePage onStartGame={handleGameStart} />}
        {gameConfig.isStarted && !gameConfig.isEnded && (
          <ChartPredictionView difficulty={gameConfig.difficulty} onGameEnd={handleGameEnd} />
        )}
        {gameConfig.isEnded && (
          <ResultsPage
            score={score}
            difficulty={gameConfig.difficulty}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
