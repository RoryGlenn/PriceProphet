# Price Prophet 🎯

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A modern stock price prediction game built with React and TypeScript. Test your market intuition by analyzing historical price data and predicting future movements.

[Getting Started](#getting-started) •
[Features](#features) •
[How It Works](#how-it-works) •
[Development](#development) •
[Testing](#testing) •
[Contributing](#contributing)

---

</div>

## 🎮 Overview

Price Prophet is an interactive financial game that challenges users to predict future stock prices using simulated market data. The application generates realistic price movements using Geometric Brownian Motion (GBM) and provides a professional-grade trading interface for analysis and prediction.

### Core Features

- Real-time price simulation using GBM
- Multiple timeframe analysis (1m to Monthly)
- Three difficulty levels with increasing prediction horizons
- Interactive candlestick charts with technical analysis tools
- Performance tracking and statistics
- Global leaderboard system
- Cross-device progress persistence

## ✨ Features

### 📊 Advanced Data Generation

- **Geometric Brownian Motion (GBM)** implementation for realistic price movements
- Minute-level data generation with configurable parameters:
  - Volatility (0.1 to 3.0)
  - Drift (-1.0 to 1.0)
  - Time horizon (1-365 days)
- Automatic aggregation to multiple timeframes
- Realistic OHLC (Open-High-Low-Close) relationships

### 📈 Professional Trading Interface

- **TradingView Integration**
  - Lightweight Charts library for optimal performance
  - Multiple timeframe support (1m, 5m, 15m, 1h, 4h, D, W, M)
  - Smooth data transitions and animations
  - Responsive design with touch support

- **Chart Features**
  - Candlestick visualization
  - Price axis formatting
  - Time axis with dynamic formatting
  - Interactive crosshair
  - Custom tooltips
  - Zoom and pan controls

### 🎯 Game Mechanics

- **Difficulty Levels**
  - Easy: 1-day prediction (24 hours)
  - Medium: 7-day prediction (1 week)
  - Hard: 30-day prediction (1 month)

- **Scoring System**
  - Points based on prediction accuracy
  - Streak bonuses for consecutive correct predictions
  - Difficulty multipliers
  - Global ranking system

### 🔄 Game Flow

1. **Start Phase**
   - Difficulty selection
   - Initial data loading
   - Game state initialization

2. **Prediction Phase**
   - Historical data analysis
   - Multiple timeframe review
   - Price selection from options

3. **Feedback Phase**
   - Immediate result display
   - Score update
   - Progress tracking

4. **Results Phase**
   - Final score calculation
   - Performance statistics
   - Historical comparison
   - Global ranking update

## 🔍 Technical Implementation

### Data Generation

The `RandomOHLC` class implements GBM for price simulation:
```typescript
interface RandomOhlcConfig {
  daysNeeded: number;    // Simulation duration
  startPrice: number;    // Initial price
  volatility: number;    // Price volatility (0.1-3.0)
  drift: number;         // Price trend (-1.0 to 1.0)
}
```

### State Management

- **Game State**
  - React Context for global state
  - Local state for component-specific data
  - LocalStorage for persistence

- **User Data**
  - Profile management
  - Score history
  - Performance statistics
  - Device fingerprinting

### Performance Optimizations

- Memoized calculations with useMemo
- Callback optimization with useCallback
- Virtual scrolling for large datasets
- Debounced event handlers
- Efficient data structures
- Lazy loading of components

## 🚀 Getting Started

### Prerequisites

- **Node.js 16+**
- **npm** or **yarn** for package management
- **Git** for version control

### Installation

```bash
git clone https://github.com/RoryGlenn/PriceProphet.git
cd PriceProphet
npm install  # or yarn install
```

### Development Setup

```bash
# Start development server
npm start

# Run tests in watch mode
npm test

# Build for production
npm run build
```

## 💻 Development

### Code Quality Tools

- **TypeScript**: Static type checking
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **lint-staged**: Staged files linting

### Available Scripts

```bash
npm start          # Start development server
npm test          # Run tests in watch mode
npm run build     # Build for production
npm run lint      # Run ESLint
npm run lint:fix  # Fix ESLint issues
npm run format    # Format code with Prettier
npm run validate  # Run all checks
```

### Development Workflow

1. Create feature branch
2. Implement changes
3. Run validation checks
4. Submit pull request
5. Address review feedback

## 🧪 Testing

### Test Coverage Requirements

- **Unit Tests**: 80% coverage
- **Integration Tests**: Key user flows
- **Component Tests**: UI interactions
- **Service Tests**: Data management

### Running Tests

```bash
npm test              # Watch mode
npm run test:coverage # Coverage report
npm run test:ci      # CI mode
```

## 📁 Project Structure

```
src/
  ├── components/           # React components
  │   ├── ChartComponent.tsx       # Interactive candlestick chart
  │   ├── ChartPredictionView.tsx  # Main game prediction interface
  │   ├── WelcomePage.tsx         # Landing/difficulty selection
  │   ├── ResultsPage.tsx         # Game results and statistics
  │   └── ErrorBoundary.tsx       # Error handling component
  │
  ├── services/            # Application services
  │   ├── localStorageService.ts  # Game data persistence
  │   └── userInfoService.ts      # User profile management
  │
  ├── styles/             # Styling and theming
  │   └── theme.ts              # Material-UI theme configuration
  │
  ├── utils/              # Utility functions
  │   └── priceUtils.ts         # Price formatting and calculations
  │
  ├── __mocks__/          # Test mock implementations
  │   └── lightweight-charts.ts # Chart library mocks
  │
  ├── __tests__/          # Test files
  │   ├── components/           # Component tests
  │   ├── services/            # Service tests
  │   └── utils/               # Utility tests
  │
  ├── types.ts            # TypeScript type definitions
  ├── App.tsx             # Main application component
  ├── index.tsx           # Application entry point
  ├── setupTests.ts       # Test configuration
  └── index.css           # Global styles
```

## 📦 Dependencies

### Core Dependencies

- **React 18+**: UI framework
- **TypeScript 4+**: Type safety
- **Material-UI 5+**: Component library
- **Lightweight Charts**: Chart rendering
- **Luxon**: Date handling
- **UUID**: Unique ID generation

### Development Dependencies

- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeDoc**: Documentation generation

## 🚀 Deployment

### Build Process

1. Run validation: `npm run validate`
2. Build app: `npm run build`
3. Deploy to hosting platform

### Hosting Options

- GitHub Pages (current)
- Vercel
- Netlify
- AWS S3/CloudFront

## 🤝 Contributing

### Getting Started

1. Fork repository
2. Create feature branch
3. Implement changes
4. Run tests and checks
5. Submit pull request

### Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow commit conventions

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TradingView for Lightweight Charts
- Material-UI team
- React community
- All contributors
