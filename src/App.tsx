import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { WelcomePage } from './components/WelcomePage';

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

  useEffect(() => {
    console.log('App mounted');
  }, []);

  const handleStart = (selectedDifficulty: string) => {
    console.log('Starting game with difficulty:', selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh', width: '100%' }}>
        {!gameStarted ? (
          <WelcomePage onStart={handleStart} />
        ) : (
          <div>Game Started with difficulty: {difficulty}</div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App; 