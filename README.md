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
[Contributing](#contributing)

---

</div>

## 🎮 Overview

This React-based application challenges users to predict future stock closing prices after reviewing the last 90 days of generated OHLC (Open-High-Low-Close) data. By simulating realistic price movements and volatility via Geometric Brownian Motion (GBM), the app provides a fun and educational environment to test your market intuition.

## ✨ Features

### 📊 Realistic Data Generation

Utilizes a custom `RandomOHLC` class to generate minute-level price data and then aggregates it into daily OHLC bars for display.

### 📈 Interactive Candlestick Chart

- Professional-grade charting using TradingView's lightweight charts library
- Multiple timeframe analysis (1m, 5m, 15m, 1h, 4h, D, W, M)
- Optimized performance with smooth transitions between timeframes
- Clean, readable date formats with detailed tooltips
- Currency-formatted price axis for better readability
- Responsive design that adapts to screen size

### 🎯 Difficulty Levels

- **Easy:** Predict the closing price 1 day in the future
- **Medium:** Predict the closing price 7 days in the future
- **Hard:** Predict the closing price 30 days in the future

### 🎲 Game States

- **START:** Prompting the user to select difficulty and begin
- **INITIAL:** Displaying past 90 days of data, waiting for the user's first guess
- **SHOW_RESULT:** After a guess, showing correctness and allowing progression
- **FINISHED:** Displaying final results after 5 attempts

### 📊 Dynamic Scoring and Feedback

Shows correct/wrong counts, calculates accuracy, uses a progress bar, provides encouraging messages, and compares performance to a hypothetical average. Also plots guess correctness over attempts.

## 🔍 How It Works

### 1️⃣ Data Simulation

The application uses minute-level simulations (via GBM) to produce realistic intraday volatility. This minute data is then resampled into daily OHLC bars to provide more authentic daily patterns.

### 2️⃣ User Prediction

Based on difficulty, the user selects a future closing price from several options. The chosen difficulty determines how far into the future the guess projects.

### 3️⃣ Scoring & Final Results

Each guess updates the user's score. After 5 attempts, the results page shows accuracy, average error, and a chart comparing guesses to actual prices.

## 🚀 Getting Started

### Prerequisites

- **Node.js 16+**
- **npm** or **yarn** for package management

### Installation

```bash
git clone https://github.com/RoryGlenn/PriceProphet.git
cd PriceProphet
npm install  # or yarn install
```

### Running the App

```bash
npm start  # or yarn start
```

Then open `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build  # or yarn build
```

## 🎮 Gameplay Instructions

### 1️⃣ Start Page

Choose a difficulty (Easy, Medium, Hard) and press **Start Game**.

### 2️⃣ Make a Guess

- Review the candlestick chart of the past 90 days
- Use the timeframe buttons to analyze different time periods
- Hover over candlesticks to see detailed price information
- Select a predicted future closing price and submit

### 3️⃣ View Feedback

After submitting, see if you were correct. Continue until all attempts are completed.

### 4️⃣ Final Results

Review your performance metrics (accuracy, average error) and a chart showing your guesses vs. actual prices. Use this feedback to improve in future rounds.

## 📁 Project Structure

```
src/
  ├── components/     # React components
  │   ├── ChartComponent.tsx    # Interactive candlestick chart
  │   ├── GameScreen.tsx        # Main game interface
  │   └── ...                   # Other components
  ├── types/         # TypeScript interfaces and types
  ├── utils/         # Helper functions and RandomOHLC class
  ├── hooks/         # Custom React hooks
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## ⚙️ Customization

### 📅 Adjust Days

Modify `NUM_BARS` constant to simulate more or fewer days.

### 📊 Volatility and Drift

Adjust the random ranges for volatility and drift in `RandomOHLC` class to produce different price dynamics.

### 🎨 Chart Appearance

- Modify colors in `ChartComponent` for different candlestick styles
- Adjust bar spacing and time formats for different viewing preferences
- Customize tooltip formats for different information display

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request with improvements or new features.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
