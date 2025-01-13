/*********************************************************************
 * App.tsx
 *
 * Main application component that handles game state and navigation.
 * Manages the flow between welcome screen and game screen, including
 * difficulty selection and game session management.
 *********************************************************************/

import React, { useState, useCallback, useMemo } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { ChartPredictionView } from './components/ChartPredictionView';
import { ResultsPage } from './components/ResultsPage';
import { DifficultyLevel } from './types';
import { Score } from './components/ChartPredictionView';

/** Possible game states */
type GameState = 'welcome' | 'playing' | 'results';

/** Initial game state configuration */
interface GameConfig {
  gameState: GameState;
  difficulty: DifficultyLevel;
  score: Score;
}

/** Initial game configuration */
const INITIAL_GAME_CONFIG: GameConfig = {
  gameState: 'welcome',
  difficulty: 'Easy',
  score: { right: 0, wrong: 0 },
} as const;

/**
 * Main application component that manages game state and navigation.
 */
export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_CONFIG.gameState);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(INITIAL_GAME_CONFIG.difficulty);
  const [score, setScore] = useState<Score>(INITIAL_GAME_CONFIG.score);

  /** Resets the game state to initial configuration */
  const resetGameState = useCallback((): void => {
    setGameState(INITIAL_GAME_CONFIG.gameState);
    setDifficulty(INITIAL_GAME_CONFIG.difficulty);
    setScore(INITIAL_GAME_CONFIG.score);
  }, []);

  /** Handles game start with selected difficulty */
  const handleStartGame = useCallback((selectedDifficulty: DifficultyLevel): void => {
    setDifficulty(selectedDifficulty);
    setScore(INITIAL_GAME_CONFIG.score);
    setGameState('playing');
  }, []);

  /** Handles game end with final score */
  const handleGameEnd = useCallback((finalScore: Score): void => {
    // If both scores are 0, it means we're going back to menu without showing results
    if (finalScore.right === 0 && finalScore.wrong === 0) {
      resetGameState();
    } else {
      setScore(finalScore);
      setGameState('results');
    }
  }, [resetGameState]);

  /** Handles play again request */
  const handlePlayAgain = useCallback((): void => {
    setScore(INITIAL_GAME_CONFIG.score);
    setGameState('playing');
  }, []);

  /** Handles return to menu request */
  const handleBackToMenu = useCallback((): void => {
    resetGameState();
  }, [resetGameState]);

  // Development-only state transition logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[App] State transition:', { gameState, difficulty, score });
    }
  }, [gameState, difficulty, score]);

  // Memoize the current component based on game state
  const currentComponent = useMemo(() => {
    switch (gameState) {
      case 'playing':
        return <ChartPredictionView difficulty={difficulty} onGameEnd={handleGameEnd} />;
      case 'results':
        return (
          <ResultsPage
            score={score}
            difficulty={difficulty}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        );
      default:
        return <WelcomePage onStartGame={handleStartGame} />;
    }
  }, [gameState, difficulty, score, handleGameEnd, handlePlayAgain, handleBackToMenu, handleStartGame]);

  return currentComponent;
};
