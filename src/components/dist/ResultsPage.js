"use strict";
/*********************************************************************
 * ResultsPage.tsx
 *
 * Results screen component that shows the final score and statistics
 * after completing the game. Features a modern glass morphism design
 * with neon accents matching the game's aesthetic.
 *********************************************************************/
exports.__esModule = true;
exports.ResultsPage = void 0;
var react_1 = require("react");
var material_1 = require("@mui/material");
exports.ResultsPage = function (_a) {
    var score = _a.score, difficulty = _a.difficulty, onPlayAgain = _a.onPlayAgain, onBackToMenu = _a.onBackToMenu;
    var totalAttempts = score.right + score.wrong;
    var accuracy = totalAttempts > 0 ? (score.right / totalAttempts) * 100 : 0;
    // Calculate grade based on accuracy
    var getGrade = function (accuracy) {
        if (accuracy >= 90)
            return 'S';
        if (accuracy >= 80)
            return 'A';
        if (accuracy >= 70)
            return 'B';
        if (accuracy >= 60)
            return 'C';
        if (accuracy >= 50)
            return 'D';
        return 'F';
    };
    var grade = getGrade(accuracy);
    return (react_1["default"].createElement(material_1.Container, { maxWidth: false, sx: {
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            padding: 0
        } },
        react_1["default"].createElement(material_1.Paper, { elevation: 24, sx: {
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
                    maskComposite: 'exclude'
                }
            } },
            react_1["default"].createElement(material_1.Typography, { variant: "h3", component: "h1", sx: {
                    fontWeight: 700,
                    letterSpacing: 2,
                    textShadow: '0 0 20px rgba(0, 245, 160, 0.5)',
                    mb: 4
                } }, "Game Results"),
            react_1["default"].createElement(material_1.Box, { sx: { mb: 5 } },
                react_1["default"].createElement(material_1.Typography, { variant: "h1", sx: {
                        fontSize: '8rem',
                        fontWeight: 700,
                        color: grade === 'F' ? '#ef5350' : '#00F5A0',
                        textShadow: "0 0 30px " + (grade === 'F' ? 'rgba(239, 83, 80, 0.5)' : 'rgba(0, 245, 160, 0.5)'),
                        mb: 2
                    } }, grade),
                react_1["default"].createElement(material_1.Typography, { variant: "h5", sx: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        mb: 1
                    } },
                    "Difficulty: ",
                    react_1["default"].createElement("span", { style: { color: '#00F5A0' } }, difficulty)),
                react_1["default"].createElement(material_1.Typography, { variant: "h5", sx: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        mb: 3
                    } },
                    "Accuracy: ",
                    react_1["default"].createElement("span", { style: { color: '#00F5A0' } },
                        accuracy.toFixed(1),
                        "%")),
                react_1["default"].createElement(material_1.Box, { sx: {
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 4,
                        mb: 2
                    } },
                    react_1["default"].createElement(material_1.Typography, { variant: "h6", sx: { color: '#00F5A0' } },
                        "Correct: ",
                        score.right),
                    react_1["default"].createElement(material_1.Typography, { variant: "h6", sx: { color: '#ef5350' } },
                        "Wrong: ",
                        score.wrong))),
            react_1["default"].createElement(material_1.Box, { sx: {
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center'
                } },
                react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: onPlayAgain, sx: {
                        minWidth: 140,
                        height: 48,
                        background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                        boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: 1,
                        border: 0,
                        '&:hover': {
                            background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                            boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)'
                        }
                    } }, "Play Again"),
                react_1["default"].createElement(material_1.Button, { variant: "outlined", onClick: onBackToMenu, sx: {
                        minWidth: 140,
                        height: 48,
                        borderColor: 'rgba(0, 245, 160, 0.5)',
                        color: '#00F5A0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: 1,
                        '&:hover': {
                            borderColor: '#00F5A0',
                            backgroundColor: 'rgba(0, 245, 160, 0.1)'
                        }
                    } }, "Back to Menu")))));
};
