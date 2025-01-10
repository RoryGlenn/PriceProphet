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
var WelcomePage_1 = require("./components/WelcomePage");
var GameScreen_1 = require("./components/GameScreen");
var ResultsPage_1 = require("./components/ResultsPage");
exports.App = function () {
    var _a = react_1.useState('welcome'), gameState = _a[0], setGameState = _a[1];
    var _b = react_1.useState(''), difficulty = _b[0], setDifficulty = _b[1];
    var _c = react_1.useState({ right: 0, wrong: 0 }), score = _c[0], setScore = _c[1];
    // Log state changes
    react_1.useEffect(function () {
        console.log('App state changed:', {
            gameState: gameState,
            difficulty: difficulty,
            score: score
        });
    }, [gameState, difficulty, score]);
    var handleStartGame = function (selectedDifficulty) {
        console.log('handleStartGame called with difficulty:', selectedDifficulty);
        setDifficulty(selectedDifficulty);
        setScore({ right: 0, wrong: 0 });
        setGameState('playing');
    };
    var handleGameEnd = function (finalScore) {
        console.log('handleGameEnd called with score:', finalScore);
        setScore(finalScore);
        setGameState('results');
    };
    var handlePlayAgain = function () {
        console.log('handlePlayAgain called with current difficulty:', difficulty);
        setScore({ right: 0, wrong: 0 });
        setGameState('playing');
    };
    var handleBackToMenu = function () {
        console.log('handleBackToMenu called');
        setGameState('welcome');
        setDifficulty('');
        setScore({ right: 0, wrong: 0 });
    };
    console.log('App rendering with gameState:', gameState);
    switch (gameState) {
        case 'playing':
            return (react_1["default"].createElement(GameScreen_1.GameScreen, { difficulty: difficulty, onGameEnd: handleGameEnd }));
        case 'results':
            console.log('Rendering ResultsPage with props:', {
                score: score,
                difficulty: difficulty,
                hasPlayAgainHandler: !!handlePlayAgain,
                hasBackToMenuHandler: !!handleBackToMenu
            });
            return (react_1["default"].createElement(ResultsPage_1.ResultsPage, { score: score, difficulty: difficulty, onPlayAgain: handlePlayAgain, onBackToMenu: handleBackToMenu }));
        default:
            return react_1["default"].createElement(WelcomePage_1.WelcomePage, { onStartGame: handleStartGame });
    }
};
