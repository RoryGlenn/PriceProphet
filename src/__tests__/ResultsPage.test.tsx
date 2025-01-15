import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResultsPage } from '../components/ResultsPage';
import { localStorageService } from '../services/localStorageService';

// Mock the localStorageService
jest.mock('../services/localStorageService');

const mockStats = {
  totalGames: 10,
  averageScore: 75,
  highestScore: 100,
  successRate: 80,
  averageTime: 30,
};

const mockLeaderboard = [
  {
    userId: '1',
    username: 'TestUser',
    highestScore: 100,
    totalGames: 10,
    averageScore: 75,
  },
];

describe('ResultsPage', () => {
  const mockProps = {
    score: { right: 3, wrong: 2 },
    difficulty: 'Medium' as const,
    onPlayAgain: jest.fn(),
    onBackToMenu: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock implementations
    (localStorageService.getUserStats as jest.Mock).mockReturnValue(mockStats);
    (localStorageService.getLeaderboard as jest.Mock).mockReturnValue(mockLeaderboard);
  });

  it('renders without crashing', () => {
    render(<ResultsPage {...mockProps} />);
    expect(screen.getByText('Game Results')).toBeInTheDocument();
  });

  it('displays correct score information', () => {
    render(<ResultsPage {...mockProps} />);
    expect(screen.getByText('Correct: 3')).toBeInTheDocument();
    expect(screen.getByText('Wrong: 2')).toBeInTheDocument();
    expect(screen.getByText('Accuracy: 60%')).toBeInTheDocument();
  });

  it('displays user statistics', () => {
    render(<ResultsPage {...mockProps} />);

    // Find the stats section by its heading
    expect(screen.getByRole('heading', { name: 'Your Stats' })).toBeInTheDocument();

    // Test stat labels (paragraphs)
    expect(screen.getByText('Total Games')).toBeInTheDocument();
    expect(screen.getByText('Average Score')).toBeInTheDocument();
    expect(screen.getByText('Highest Score')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();

    // Test stat values (h6 headings)
    expect(screen.getByRole('heading', { name: '10', level: 6 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '75', level: 6 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '100', level: 6 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '80%', level: 6 })).toBeInTheDocument();
  });

  it('calls onPlayAgain when Play Again button is clicked', () => {
    render(<ResultsPage {...mockProps} />);
    const playAgainButton = screen.getByRole('button', { name: /play again/i });
    fireEvent.click(playAgainButton);
    expect(mockProps.onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('calls onBackToMenu when Back to Menu button is clicked', () => {
    render(<ResultsPage {...mockProps} />);
    const backToMenuButton = screen.getByRole('button', { name: /back to menu/i });
    fireEvent.click(backToMenuButton);
    expect(mockProps.onBackToMenu).toHaveBeenCalledTimes(1);
  });

  it('calculates accuracy correctly with zero attempts', () => {
    const zeroScoreProps = {
      ...mockProps,
      score: { right: 0, wrong: 0 },
    };
    render(<ResultsPage {...zeroScoreProps} />);
    expect(screen.getByText('Accuracy: 0%')).toBeInTheDocument();
  });

  it('fetches and uses data from localStorageService', () => {
    render(<ResultsPage {...mockProps} />);
    expect(localStorageService.getUserStats).toHaveBeenCalledTimes(1);
    expect(localStorageService.getLeaderboard).toHaveBeenCalledTimes(1);
  });
});
