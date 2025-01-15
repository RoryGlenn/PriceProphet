import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WelcomePage } from '../components/WelcomePage';
import { DifficultyLevel } from '../types';

describe('WelcomePage', () => {
  const mockOnStartGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<WelcomePage onStartGame={mockOnStartGame} />);
    expect(screen.getByText('Price Prophet')).toBeInTheDocument();
  });

  it('displays welcome message and subtitle', () => {
    render(<WelcomePage onStartGame={mockOnStartGame} />);
    expect(screen.getByText('Unlock Your Powers of Market Prophecy! ✨')).toBeInTheDocument();
    expect(screen.getByText(/Greetings, market seer!/)).toBeInTheDocument();
  });

  it('displays all difficulty options with descriptions', () => {
    render(<WelcomePage onStartGame={mockOnStartGame} />);

    // Check difficulty levels
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('Predict the price 1 day into the future')).toBeInTheDocument();
    expect(screen.getByText('Predict the price 1 week into the future')).toBeInTheDocument();
    expect(screen.getByText('Predict the price 1 month into the future')).toBeInTheDocument();
  });

  it('starts with Easy difficulty selected by default', () => {
    render(<WelcomePage onStartGame={mockOnStartGame} />);
    const easyRadio = screen.getByRole('radio', { name: /easy/i }) as HTMLInputElement;
    expect(easyRadio.checked).toBe(true);
  });

  it('allows changing difficulty selection', () => {
    render(<WelcomePage onStartGame={mockOnStartGame} />);

    // Initial state check
    const easyRadio = screen.getByRole('radio', { name: /easy/i }) as HTMLInputElement;
    expect(easyRadio.checked).toBe(true);

    // Change to Medium
    const mediumRadio = screen.getByRole('radio', { name: /medium/i });
    fireEvent.click(mediumRadio);
    expect((mediumRadio as HTMLInputElement).checked).toBe(true);
    expect(easyRadio.checked).toBe(false);

    // Change to Hard
    const hardRadio = screen.getByRole('radio', { name: /hard/i });
    fireEvent.click(hardRadio);
    expect((hardRadio as HTMLInputElement).checked).toBe(true);
    expect(easyRadio.checked).toBe(false);
  });

  it('calls onStartGame with selected difficulty when Start Game is clicked', () => {
    render(<WelcomePage onStartGame={mockOnStartGame} />);

    // Click Medium difficulty
    const mediumRadio = screen.getByRole('radio', { name: /medium/i });
    fireEvent.click(mediumRadio);

    // Click start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    // Verify callback
    expect(mockOnStartGame).toHaveBeenCalledTimes(1);
    expect(mockOnStartGame).toHaveBeenCalledWith('Medium' as DifficultyLevel);
  });

  it('starts game with default Easy difficulty if no selection is made', () => {
    render(<WelcomePage onStartGame={mockOnStartGame} />);

    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    expect(mockOnStartGame).toHaveBeenCalledTimes(1);
    expect(mockOnStartGame).toHaveBeenCalledWith('Easy' as DifficultyLevel);
  });

  it('maintains selected difficulty when component re-renders', () => {
    const { rerender } = render(<WelcomePage onStartGame={mockOnStartGame} />);

    // Select Hard difficulty
    const hardRadio = screen.getByRole('radio', { name: /hard/i });
    fireEvent.click(hardRadio);

    // Re-render component
    rerender(<WelcomePage onStartGame={mockOnStartGame} />);

    // Verify Hard is still selected
    expect((hardRadio as HTMLInputElement).checked).toBe(true);
  });
});
