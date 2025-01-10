/*********************************************************************
 * App.tsx
 * 
 * Main application component that handles game state and navigation.
 * Manages the flow between welcome screen and game screen, including
 * difficulty selection and game session management.
 *********************************************************************/

import React, { useState, useEffect } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { GameScreen } from './components/GameScreen';
import { ResultsPage } from './components/ResultsPage';

type GameState = 'welcome' | 'playing' | 'results';

interface GameScore {
  right: number;
  wrong: number;
}

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [difficulty, setDifficulty] = useState<string>('');
  const [score, setScore] = useState<GameScore>({ right: 0, wrong: 0 });

  // Log state changes
  useEffect(() => {
    console.log('App state changed:', {
      gameState,
      difficulty,
      score
    });
  }, [gameState, difficulty, score]);

  const handleStartGame = (selectedDifficulty: string) => {
    console.log('handleStartGame called with difficulty:', selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setScore({ right: 0, wrong: 0 });
    setGameState('playing');
  };

  const handleGameEnd = (finalScore: GameScore) => {
    console.log('handleGameEnd called with score:', finalScore);
    setScore(finalScore);
    setGameState('results');
  };

  const handlePlayAgain = () => {
    console.log('handlePlayAgain called with current difficulty:', difficulty);
    setScore({ right: 0, wrong: 0 });
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    console.log('handleBackToMenu called');
    setGameState('welcome');
    setDifficulty('');
    setScore({ right: 0, wrong: 0 });
  };

  console.log('App rendering with gameState:', gameState);

  switch (gameState) {
    case 'playing':
      return (
        <GameScreen 
          difficulty={difficulty} 
          onGameEnd={handleGameEnd}
        />
      );
    case 'results':
      console.log('Rendering ResultsPage with props:', {
        score,
        difficulty,
        hasPlayAgainHandler: !!handlePlayAgain,
        hasBackToMenuHandler: !!handleBackToMenu
      });
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
