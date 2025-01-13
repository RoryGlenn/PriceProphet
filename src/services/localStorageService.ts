export interface GameResult {
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  guesses: Array<{
    timestamp: Date;
    price: number;
    correct: boolean;
  }>;
  finalPrice: number;
  startPrice: number;
  timeInterval: string;
  success: boolean;
  totalTime: number;
  timestamp: Date;
}

export interface UserStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  successRate: number;
  averageTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  highestScore: number;
  totalGames: number;
  averageScore: number;
}

const STORAGE_KEYS = {
  GAMES: 'priceProphet_games',
  USER_ID: 'priceProphet_userId'
};

// Generate a random user ID if none exists
const generateUserId = (): string => {
  const existingId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (existingId) return existingId;
  
  const newId = `user_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(STORAGE_KEYS.USER_ID, newId);
  return newId;
};

// Get all stored games
const getAllGames = (): GameResult[] => {
  const gamesJson = localStorage.getItem(STORAGE_KEYS.GAMES);
  return gamesJson ? JSON.parse(gamesJson) : [];
};

export const localStorageService = {
  // Save game result
  saveGame: (gameData: Omit<GameResult, 'userId' | 'timestamp'>): GameResult => {
    const games = getAllGames();
    const newGame: GameResult = {
      ...gameData,
      userId: generateUserId(),
      timestamp: new Date()
    };
    
    games.push(newGame);
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
    return newGame;
  },

  // Get user's game history
  getUserGames: (): GameResult[] => {
    const userId = generateUserId();
    return getAllGames()
      .filter(game => game.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  },

  // Get user's statistics
  getUserStats: (): UserStats => {
    const userId = generateUserId();
    const userGames = getAllGames().filter(game => game.userId === userId);
    
    if (userGames.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        successRate: 0,
        averageTime: 0
      };
    }

    const totalGames = userGames.length;
    const successfulGames = userGames.filter(game => game.success).length;
    
    return {
      totalGames,
      averageScore: userGames.reduce((sum, game) => sum + game.score, 0) / totalGames,
      highestScore: Math.max(...userGames.map(game => game.score)),
      successRate: (successfulGames / totalGames) * 100,
      averageTime: userGames.reduce((sum, game) => sum + game.totalTime, 0) / totalGames
    };
  },

  // Get global leaderboard
  getLeaderboard: (): LeaderboardEntry[] => {
    const games = getAllGames();
    const userStats = new Map<string, { totalScore: number; totalGames: number; highestScore: number }>();

    // Calculate stats for each user
    games.forEach(game => {
      const stats = userStats.get(game.userId) || { totalScore: 0, totalGames: 0, highestScore: 0 };
      stats.totalScore += game.score;
      stats.totalGames += 1;
      stats.highestScore = Math.max(stats.highestScore, game.score);
      userStats.set(game.userId, stats);
    });

    // Convert to leaderboard entries and sort
    return Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        highestScore: stats.highestScore,
        totalGames: stats.totalGames,
        averageScore: stats.totalScore / stats.totalGames
      }))
      .sort((a, b) => b.highestScore - a.highestScore)
      .slice(0, 10);
  },

  // Clear all stored data (for testing)
  clearData: () => {
    localStorage.removeItem(STORAGE_KEYS.GAMES);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
  }
}; 