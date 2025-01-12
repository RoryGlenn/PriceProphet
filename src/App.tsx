/*********************************************************************
 * App.tsx
 *
 * Main application component that handles game state and navigation.
 * Manages the flow between welcome screen and game screen, including
 * difficulty selection and game session management.
 *********************************************************************/

import React, { useState } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { ChartPredictionView } from './components/ChartPredictionView';
import { ResultsPage } from './components/ResultsPage';
import { DifficultyLevel } from './types';

type GameState = 'welcome' | 'playing' | 'results';

interface GameScore {
  right: number;
  wrong: number;
}

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [score, setScore] = useState<GameScore>({ right: 0, wrong: 0 });

  const handleStartGame = (selectedDifficulty: DifficultyLevel) => {
    setDifficulty(selectedDifficulty);
    setScore({ right: 0, wrong: 0 });
    setGameState('playing');
  };

  const handleGameEnd = (finalScore: GameScore) => {
    setScore(finalScore);
    setGameState('results');
  };

  const handlePlayAgain = () => {
    setScore({ right: 0, wrong: 0 });
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('welcome');
    setDifficulty('easy');
    setScore({ right: 0, wrong: 0 });
  };

  // Development-only state transition logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[App] State transition:', { gameState, difficulty, score });
    }
  }, [gameState, difficulty, score]);

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
};
