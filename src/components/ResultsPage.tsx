/*********************************************************************
 * ResultsPage.tsx
 *
 * Game results display component that shows the player's performance.
 * Features score summary, accuracy metrics, and performance visualization.
 *********************************************************************/

import React from 'react';
import { Container, Paper, Typography, Button, Box, Divider } from '@mui/material';
import { DifficultyLevel } from '../types';
import { localStorageService } from '../services/localStorageService';

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

  const stats = localStorageService.getUserStats();
  const leaderboard = localStorageService.getLeaderboard();

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

          <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 2,
              color: '#00F5A0',
            }}
          >
            Your Stats
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              mb: 3,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                Total Games
              </Typography>
              <Typography variant="h6" color="#00F5A0">
                {stats.totalGames}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                Average Score
              </Typography>
              <Typography variant="h6" color="#00F5A0">
                {Math.round(stats.averageScore)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                Highest Score
              </Typography>
              <Typography variant="h6" color="#00F5A0">
                {stats.highestScore}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                Success Rate
              </Typography>
              <Typography variant="h6" color="#00F5A0">
                {Math.round(stats.successRate)}%
              </Typography>
            </Box>
          </Box>

          {leaderboard.length > 0 && (
            <>
              <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  mb: 2,
                  color: '#00F5A0',
                }}
              >
                Leaderboard
              </Typography>
              <Box sx={{ mb: 3 }}>
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <Box
                    key={entry.userId}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      backgroundColor: index === 0 ? 'rgba(0, 245, 160, 0.1)' : 'transparent',
                      mb: 1,
                    }}
                  >
                    <Typography color="rgba(255, 255, 255, 0.7)">
                      #{index + 1} Player {entry.userId.slice(-4)}
                    </Typography>
                    <Typography color="#00F5A0">{entry.highestScore}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '2rem',
            }}
          >
            <Button
              variant="contained"
              onClick={onPlayAgain}
              size="large"
              sx={{
                minWidth: 150,
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
              Play Again
            </Button>

            <Button
              variant="outlined"
              onClick={onBackToMenu}
              size="large"
              sx={{
                minWidth: 150,
                height: 48,
                borderColor: '#00F5A0',
                color: '#00F5A0',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: 1,
                '&:hover': {
                  borderColor: '#00D9F5',
                  color: '#00D9F5',
                },
              }}
            >
              Back to Menu
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
