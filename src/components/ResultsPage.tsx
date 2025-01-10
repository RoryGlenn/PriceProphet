/*********************************************************************
 * ResultsPage.tsx
 * 
 * Results screen component that shows the final score and statistics
 * after completing the game. Features a modern glass morphism design
 * with neon accents matching the game's aesthetic.
 *********************************************************************/

import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';

interface ResultsPageProps {
  score: {
    right: number;
    wrong: number;
  };
  difficulty: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  score,
  difficulty,
  onPlayAgain,
  onBackToMenu,
}) => {
  // Add logging on mount
  useEffect(() => {
    // Component initialization
  }, []);

  const handlePlayAgain = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      onPlayAgain();
    } catch (error) {
      console.error('Error in Play Again handler:', error);
    }
  };

  const handleBackToMenu = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      onBackToMenu();
    } catch (error) {
      console.error('Error in Back to Menu handler:', error);
    }
  };

  const getGrade = (accuracy: number): string => {
    if (accuracy >= 90) return 'A';
    if (accuracy >= 80) return 'B';
    if (accuracy >= 70) return 'C';
    if (accuracy >= 60) return 'D';
    return 'F';
  };

  const accuracy = (score.right / (score.right + score.wrong)) * 100 || 0;
  const grade = getGrade(accuracy);

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        padding: 0,
      }}
    >
      <Paper 
        elevation={24}
        sx={{ 
          width: '100%',
          maxWidth: 500,
          p: 5, 
          background: 'rgba(16, 20, 24, 0.8)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 4,
            padding: '2px',
            background: 'linear-gradient(60deg, #00F5A0, #00D9F5)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          },
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            letterSpacing: 2,
            textShadow: '0 0 20px rgba(0, 245, 160, 0.5)',
            mb: 4,
          }}
        >
          Game Results
        </Typography>

        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '8rem',
              fontWeight: 700,
              color: grade === 'F' ? '#ef5350' : '#00F5A0',
              textShadow: `0 0 30px ${grade === 'F' ? 'rgba(239, 83, 80, 0.5)' : 'rgba(0, 245, 160, 0.5)'}`,
              mb: 2,
            }}
          >
            {grade}
          </Typography>
          
          <Typography 
            variant="h5"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 1,
            }}
          >
            Difficulty: <span style={{ color: '#00F5A0' }}>{difficulty}</span>
          </Typography>

          <Typography 
            variant="h5"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 3,
            }}
          >
            Accuracy: <span style={{ color: '#00F5A0' }}>{accuracy.toFixed(1)}%</span>
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 4,
            mb: 2,
          }}>
            <Typography variant="h6" sx={{ color: '#00F5A0' }}>
              Correct: {score.right}
            </Typography>
            <Typography variant="h6" sx={{ color: '#ef5350' }}>
              Wrong: {score.wrong}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <Button
            variant="contained"
            onClick={handlePlayAgain}
            sx={{
              minWidth: 140,
              height: 48,
              background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
              boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: 1,
              border: 0,
              position: 'relative',
              zIndex: 20,
              '&:hover': {
                background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)',
              },
            }}
          >
            Play Again
          </Button>

          <Button
            variant="outlined"
            onClick={handleBackToMenu}
            sx={{
              minWidth: 140,
              height: 48,
              borderColor: 'rgba(0, 245, 160, 0.5)',
              color: '#00F5A0',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: 1,
              position: 'relative',
              zIndex: 20,
              '&:hover': {
                borderColor: '#00F5A0',
                backgroundColor: 'rgba(0, 245, 160, 0.1)',
              },
            }}
          >
            Back to Menu
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}; 