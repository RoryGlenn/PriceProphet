/*********************************************************************
 * ResultsPage.tsx
 *
 * Game results display component that shows the player's performance.
 * Features score summary, accuracy metrics, and performance visualization.
 *********************************************************************/

import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { DifficultyLevel } from '../types';

interface ResultsPageProps {
  score: {
    right: number;
    wrong: number;
  };
  difficulty: DifficultyLevel;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

/**
 * Displays the final game results and provides option to return to welcome screen.
 * Shows score breakdown and calculates accuracy percentage.
 *
 * @param props Component props
 */
export const ResultsPage: React.FC<ResultsPageProps> = ({
  score,
  difficulty,
  onPlayAgain,
  onBackToMenu,
}) => {
  const calculateAccuracy = () => {
    const total = score.right + score.wrong;
    return total === 0 ? 0 : Math.round((score.right / total) * 100);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(16, 20, 24, 0.8)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          padding: '2rem',
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              marginBottom: '2rem',
              fontWeight: 700,
              letterSpacing: 2,
              textShadow: '0 0 20px rgba(0, 245, 160, 0.5)',
            }}
          >
            Game Results
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '2rem',
            }}
          >
            <Typography variant="h5" sx={{ color: '#00F5A0' }}>
              Correct: {score.right}
            </Typography>
            <Typography variant="h5" sx={{ color: '#ef5350' }}>
              Wrong: {score.wrong}
            </Typography>
            <Typography variant="h5" sx={{ color: '#00D9F5' }}>
              Accuracy: {calculateAccuracy()}%
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={onBackToMenu}
            size="large"
            sx={{
              display: 'block',
              margin: '0 auto',
              minWidth: 200,
              height: 48,
              background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
              boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: 1,
              '&:hover': {
                background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)',
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
