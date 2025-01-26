/*********************************************************************
 * App.tsx
 *
 * Main application component that manages the game's core functionality.
 * Handles routing between different game states, user progression,
 * and data persistence.
 *
 * Features:
 * - Game state management (welcome, active game, results)
 * - Score tracking and persistence
 * - Difficulty level selection
 * - Theme provider integration
 * - Debug mode support
 * - User profile initialization and management
 *
 * Game Flow:
 * 1. Welcome Screen (difficulty selection)
 * 2. Active Game (price prediction)
 * 3. Results Screen (score display)
 *
 * @module App
 * @requires react
 * @requires @mui/material
 * @requires ./services/localStorageService
 * @requires ./services/userInfoService
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

/**
 * Game configuration interface defining the current state of the game.
 * Tracks game progression and settings.
 *
 * @interface GameConfig
 * @property {boolean} isStarted - Whether a game session has been initiated
 * @property {boolean} isEnded - Whether the current game session has finished
 * @property {DifficultyLevel} difficulty - Selected game difficulty level
 * @property {Score} score - Current game score tracking correct/incorrect predictions
 */
interface GameConfig {
  isStarted: boolean;
  isEnded: boolean;
  difficulty: DifficultyLevel;
  score: Score;
}

/**
 * Initial game configuration with default values.
 * Used when starting a new game or resetting the current game.
 *
 * @constant {GameConfig} INITIAL_GAME_CONFIG
 */
const INITIAL_GAME_CONFIG: GameConfig = {
  isStarted: false,
  isEnded: false,
  difficulty: 'Easy',
  score: { right: 0, wrong: 0 },
};

/**
 * Main application component managing game state and user progression.
 * Handles the complete game lifecycle including:
 * - Game initialization and user profile setup
 * - State transitions between game phases
 * - Score tracking and persistence
 * - Debug mode functionality
 *
 * @component
 * @returns {JSX.Element} The rendered application
 */
function App() {
  // Game state management
  const [gameConfig, setGameConfig] = useState<GameConfig>(INITIAL_GAME_CONFIG);
  const [score, setScore] = useState<Score>(INITIAL_GAME_CONFIG.score);

  /**
   * Initializes a new game session with the selected difficulty.
   * Resets scores and updates game state to active.
   *
   * @param {DifficultyLevel} difficulty - Selected game difficulty level
   */
  const handleGameStart = (difficulty: DifficultyLevel) => {
    setGameConfig({
      ...INITIAL_GAME_CONFIG,
      isStarted: true,
      difficulty,
    });
    setScore(INITIAL_GAME_CONFIG.score);
  };

  /**
   * Handles game completion, saves results, and updates state.
   * Persists game results to localStorage for history tracking.
   *
   * @param {Score} finalScore - Final game score
   */
  const handleGameEnd = (finalScore: Score) => {
    setGameConfig((prev) => ({ ...prev, isEnded: true }));
    setScore(finalScore);

    // Save game result to localStorage
    const totalTime = 300; // Example time in seconds
    const gameResult = {
      difficulty: (gameConfig.difficulty.charAt(0).toUpperCase() +
        gameConfig.difficulty.slice(1)) as DifficultyLevel,
      score: score.right * 100,
      guesses: [], // Add actual guesses if you're tracking them
      finalPrice: 0, // Add actual final price
      startPrice: 0, // Add actual start price
      timeInterval: '1h',
      success: finalScore.right > finalScore.wrong,
      totalTime,
    };

    localStorageService.saveGame(gameResult);
  };

  /**
   * Resets the game state for a new game session while maintaining
   * the current difficulty level.
   */
  const handlePlayAgain = () => {
    setGameConfig((prev) => ({ ...prev, isEnded: false }));
    setScore(INITIAL_GAME_CONFIG.score);
  };

  /**
   * Returns to the welcome screen and resets all game state
   * to initial values.
   */
  const handleBackToMenu = () => {
    setGameConfig(INITIAL_GAME_CONFIG);
    setScore(INITIAL_GAME_CONFIG.score);
  };

  /**
   * Initialize user profile on component mount.
   * Creates or retrieves existing user profile from localStorage.
   */
  useEffect(() => {
    userInfoService.initializeUser();
  }, []);

  /**
   * Set up debug mode keyboard shortcut (Ctrl/Cmd + D).
   * Prints current game state and storage information to console.
   */
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
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
