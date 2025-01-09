"use strict";
/*********************************************************************
 * App.tsx
 *
 * Main application component that handles game state and navigation.
 * Manages the flow between welcome screen and game screen, including
 * difficulty selection and game session management.
 *********************************************************************/
exports.__esModule = true;
exports.App = void 0;
var react_1 = require("react");
var material_1 = require("@mui/material");
var WelcomePage_1 = require("./components/WelcomePage");
var GameScreen_1 = require("./components/GameScreen");
/*
 * Custom dark theme configuration for Material-UI.
 * Uses a dark color scheme with blue accents for better visibility
 * of financial charts and data.
 */
var darkTheme = material_1.createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2196f3'
        },
        background: {
            "default": '#121212',
            paper: '#1e1e1e'
        }
    }
});
/**
 * Main App component that controls the application flow.
 * Handles:
 * 1. Game state management (welcome screen vs game screen)
 * 2. Difficulty level selection
 * 3. Theme application
 */
exports.App = function () {
    // Track if a game is in progress
    var _a = react_1.useState(false), isPlaying = _a[0], setIsPlaying = _a[1];
    // Store the selected difficulty level
    var _b = react_1.useState(''), difficulty = _b[0], setDifficulty = _b[1];
    /*
     * Handle game start with selected difficulty.
     * Transitions from welcome screen to game screen.
     */
    var handleStartGame = function (selectedDifficulty) {
        setDifficulty(selectedDifficulty);
        setIsPlaying(true);
    };
    /*
     * Handle game end.
     * Returns to welcome screen and resets difficulty.
     */
    var handleGameEnd = function () {
        setIsPlaying(false);
        setDifficulty('');
    };
    return (react_1["default"].createElement(material_1.ThemeProvider, { theme: darkTheme }, isPlaying ? (react_1["default"].createElement(GameScreen_1.GameScreen, { difficulty: difficulty, onGameEnd: handleGameEnd })) : (react_1["default"].createElement(WelcomePage_1.WelcomePage, { onStartGame: handleStartGame }))));
};
