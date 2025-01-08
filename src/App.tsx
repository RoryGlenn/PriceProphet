import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { WelcomePage } from './components/WelcomePage';
import { GameScreen } from './components/GameScreen';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('');

  const handleStart = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
  };

  const handleGameEnd = () => {
    setGameStarted(false);
    setDifficulty('');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh', width: '100%' }}>
        {!gameStarted ? (
          <WelcomePage onStart={handleStart} />
        ) : (
          <GameScreen difficulty={difficulty} onGameEnd={handleGameEnd} />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App; 