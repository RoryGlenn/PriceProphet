import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { userInfoService } from '../services/userInfoService';
// import { localStorageService } from '../services/localStorageService';

// Mock the services
jest.mock('../services/userInfoService');
jest.mock('../services/localStorageService');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome page by default', () => {
    render(<App />);
    expect(screen.getByText('Price Prophet')).toBeInTheDocument();
    expect(screen.getByText(/Unlock Your Powers of Market Prophecy!/)).toBeInTheDocument();
  });

  it('initializes user profile on mount', () => {
    render(<App />);
    expect(userInfoService.initializeUser).toHaveBeenCalledTimes(1);
  });

  // it('transitions from welcome to game when starting', () => {
  //     render(<App />);

  //     // Start game with Medium difficulty
  //     const mediumRadio = screen.getByRole('radio', { name: /medium/i });
  //     fireEvent.click(mediumRadio);

  //     const startButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(startButton);

  //     // Welcome page should be gone
  //     expect(screen.queryByText('Price Prophet')).not.toBeInTheDocument();
  // });

  // it('transitions to results page when game ends', () => {
  //     render(<App />);

  //     // Start game
  //     const startButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(startButton);

  //     // Simulate game end by finding ChartPredictionView and triggering onGameEnd
  //     const mockScore = { right: 3, wrong: 2 };
  //     const gameComponent = screen.getByTestId('chart-prediction-view');
  //     fireEvent(gameComponent, new CustomEvent('gameEnd', { detail: mockScore }));

  //     // Should show results page
  //     expect(screen.getByText('Game Results')).toBeInTheDocument();
  //     expect(screen.getByText('Correct: 3')).toBeInTheDocument();
  //     expect(screen.getByText('Wrong: 2')).toBeInTheDocument();
  // });

  // it('allows playing again from results page', () => {
  //     render(<App />);

  //     // Start and end game
  //     const startButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(startButton);

  //     const mockScore = { right: 3, wrong: 2 };
  //     const gameComponent = screen.getByTestId('chart-prediction-view');
  //     fireEvent(gameComponent, new CustomEvent('gameEnd', { detail: mockScore }));

  //     // Click play again
  //     const playAgainButton = screen.getByRole('button', { name: /play again/i });
  //     fireEvent.click(playAgainButton);

  //     // Should be back in game view
  //     expect(screen.queryByText('Game Results')).not.toBeInTheDocument();
  // });

  // it('allows returning to menu from results page', () => {
  //     render(<App />);

  //     // Start and end game
  //     const startButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(startButton);

  //     const mockScore = { right: 3, wrong: 2 };
  //     const gameComponent = screen.getByTestId('chart-prediction-view');
  //     fireEvent(gameComponent, new CustomEvent('gameEnd', { detail: mockScore }));

  //     // Click back to menu
  //     const menuButton = screen.getByRole('button', { name: /back to menu/i });
  //     fireEvent.click(menuButton);

  //     // Should be back at welcome page
  //     expect(screen.getByText('Price Prophet')).toBeInTheDocument();
  // });

  // it('saves game results when game ends', () => {
  //     render(<App />);

  //     // Start game
  //     const startButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(startButton);

  //     // End game
  //     const mockScore = { right: 3, wrong: 2 };
  //     const gameComponent = screen.getByTestId('chart-prediction-view');
  //     fireEvent(gameComponent, new CustomEvent('gameEnd', { detail: mockScore }));

  //     // Should have called saveGame
  //     expect(localStorageService.saveGame).toHaveBeenCalledTimes(1);
  //     expect(localStorageService.saveGame).toHaveBeenCalledWith(
  //         expect.objectContaining({
  //             difficulty: 'Easy',
  //             score: 300, // 3 correct * 100
  //             success: true,
  //         })
  //     );
  // });

  // it('maintains difficulty level when playing again', () => {
  //     render(<App />);

  //     // Start game with Hard difficulty
  //     const hardRadio = screen.getByRole('radio', { name: /hard/i });
  //     fireEvent.click(hardRadio);
  //     const startButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(startButton);

  //     // End game
  //     const mockScore = { right: 3, wrong: 2 };
  //     const gameComponent = screen.getByTestId('chart-prediction-view');
  //     fireEvent(gameComponent, new CustomEvent('gameEnd', { detail: mockScore }));

  //     // Play again
  //     const playAgainButton = screen.getByRole('button', { name: /play again/i });
  //     fireEvent.click(playAgainButton);

  //     // Should still be in Hard mode
  //     expect(screen.getByTestId('chart-prediction-view')).toHaveAttribute('difficulty', 'Hard');
  // });

  // it('resets game state when returning to menu', () => {
  //     render(<App />);

  //     // Start game with Hard difficulty
  //     const hardRadio = screen.getByRole('radio', { name: /hard/i });
  //     fireEvent.click(hardRadio);
  //     const startButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(startButton);

  //     // End game
  //     const mockScore = { right: 3, wrong: 2 };
  //     const gameComponent = screen.getByTestId('chart-prediction-view');
  //     fireEvent(gameComponent, new CustomEvent('gameEnd', { detail: mockScore }));

  //     // Return to menu
  //     const menuButton = screen.getByRole('button', { name: /back to menu/i });
  //     fireEvent.click(menuButton);

  //     // Start new game - should be back to Easy default
  //     const newStartButton = screen.getByRole('button', { name: /start game/i });
  //     fireEvent.click(newStartButton);
  //     expect(screen.getByTestId('chart-prediction-view')).toHaveAttribute('difficulty', 'Easy');
  // });
});
