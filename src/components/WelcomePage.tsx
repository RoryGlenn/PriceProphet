/*********************************************************************
 * WelcomePage.tsx
 *
 * Landing page component that introduces the game and provides difficulty
 * selection. Features an immersive UI with mystical theme and interactive
 * elements.
 *
 * Features:
 * - Interactive difficulty selection
 * - Engaging welcome message
 * - Glass morphism design
 * - Neon accent effects
 * - Responsive layout
 * - Animated hover states
 *
 * UI Sections:
 * 1. Game Title
 * 2. Welcome Message
 * 3. Difficulty Selection
 * 4. Start Game Button
 *
 * Design Elements:
 * - Gradient backgrounds
 * - Glass panels
 * - Neon text effects
 * - Interactive radio buttons
 * - Custom button styles
 *
 * @module WelcomePage
 * @requires react
 * @requires @mui/material
 * @requires ../types
 *********************************************************************/

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { DifficultyLevel } from '../types';

/**
 * Props interface for the WelcomePage component.
 * Defines the callback for game initiation.
 *
 * @interface WelcomePageProps
 * @property {(difficulty: DifficultyLevel) => void} onStartGame - Callback function to initiate game with selected difficulty
 */
interface WelcomePageProps {
  onStartGame: (difficulty: DifficultyLevel) => void;
}

/**
 * Mapping of difficulty levels to their descriptions.
 * Provides clear explanation of each difficulty's prediction timeframe.
 *
 * @constant
 * @type {Record<DifficultyLevel, string>}
 */
const difficultyDescriptions: Record<DifficultyLevel, string> = {
  Easy: 'Predict the price 1 day into the future',
  Medium: 'Predict the price 1 week into the future',
  Hard: 'Predict the price 1 month into the future',
};

/**
 * Welcome page component that serves as the entry point to the game.
 * Provides an immersive introduction and difficulty selection interface.
 *
 * Component Sections:
 * 1. Title Section
 *    - Game title with neon effect
 *    - Subtitle with theme message
 *
 * 2. Introduction
 *    - Welcome message
 *    - Game description
 *    - Mystical theme elements
 *
 * 3. Difficulty Selection
 *    - Interactive radio buttons
 *    - Difficulty descriptions
 *    - Visual feedback on selection
 *
 * 4. Game Start
 *    - Prominent start button
 *    - Gradient effect
 *    - Hover animations
 *
 * @component
 * @param {WelcomePageProps} props - Component props
 * @returns {JSX.Element} Rendered welcome page
 *
 * @example
 * <WelcomePage
 *   onStartGame={(difficulty) => handleGameStart(difficulty)}
 * />
 */
export const WelcomePage: React.FC<WelcomePageProps> = ({ onStartGame }) => {
  /**
   * State to track the currently selected difficulty level.
   * Defaults to 'Easy' for new players.
   */
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Easy');

  /**
   * Effect hook for component initialization.
   * Can be used for future analytics or user preference loading.
   */
  useEffect(() => {
    // Component initialization logic
  }, []);

  /**
   * Handles difficulty selection changes.
   * Updates state and provides visual feedback.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event from radio input
   */
  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDifficulty(event.target.value as DifficultyLevel);
  };

  /**
   * Initiates game start with selected difficulty.
   * Triggers the onStartGame callback with current difficulty.
   */
  const handleStartClick = () => {
    onStartGame(selectedDifficulty);
  };

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
      {/* Main Content Panel */}
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
        {/* Game Title */}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: 2,
            textShadow: '0 0 20px rgba(0, 245, 160, 0.5)',
            mb: 2,
          }}
        >
          Price Prophet
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            color: '#00F5A0',
            fontWeight: 500,
            letterSpacing: 1,
            mb: 1,
          }}
        >
          Unlock Your Powers of Market Prophecy! ✨
        </Typography>

        {/* Welcome Message */}
        <Typography
          variant="body1"
          sx={{
            mb: 5,
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            maxWidth: '80%',
            margin: '0 auto 40px',
          }}
        >
          🔮 Greetings, market seer! Divine the sacred candlesticks and forge your path from novice
          fortune teller to grand oracle. The prophecy begins... ✨📈
        </Typography>

        {/* Difficulty Selection */}
        <RadioGroup value={selectedDifficulty} onChange={handleDifficultyChange} sx={{ mb: 5 }}>
          {Object.entries(difficultyDescriptions).map(([difficulty, description]) => (
            <Box
              key={difficulty}
              sx={{
                mb: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <FormControlLabel
                value={difficulty}
                control={
                  <Radio
                    sx={{
                      color: 'rgba(255, 255, 255, 0.3)',
                      '&.Mui-checked': {
                        color: '#00F5A0',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 28,
                      },
                    }}
                  />
                }
                label={
                  <Box
                    sx={{
                      textAlign: 'center',
                      padding: '12px 24px',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      background:
                        selectedDifficulty === difficulty
                          ? 'rgba(0, 245, 160, 0.1)'
                          : 'transparent',
                      border: '1px solid',
                      borderColor:
                        selectedDifficulty === difficulty
                          ? 'rgba(0, 245, 160, 0.3)'
                          : 'rgba(255, 255, 255, 0.1)',
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: selectedDifficulty === difficulty ? '#00F5A0' : '#FFFFFF',
                        fontWeight: 500,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {difficulty}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      {description}
                    </Typography>
                  </Box>
                }
                sx={{
                  margin: 0,
                  width: '100%',
                }}
              />
            </Box>
          ))}
        </RadioGroup>

        {/* Start Game Button */}
        <Button
          component="button"
          variant="contained"
          onClick={handleStartClick}
          sx={{
            minWidth: 200,
            height: 48,
            background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
            boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: 1,
            border: 0,
            cursor: 'pointer',
            zIndex: 10,
            position: 'relative',
            '&:hover': {
              background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
              boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)',
            },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              boxShadow: 'none',
              cursor: 'not-allowed',
            },
          }}
        >
          START GAME
        </Button>
      </Paper>
    </Container>
  );
};
