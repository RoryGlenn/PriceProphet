"use strict";
/*********************************************************************
 * ResultsPage.tsx
 *
 * Game results display component that shows the player's performance.
 * Features score summary, accuracy metrics, and performance visualization.
 *********************************************************************/
exports.__esModule = true;
exports.ResultsPage = void 0;
var react_1 = require("react");
var material_1 = require("@mui/material");
/**
 * Displays the final game results and provides option to return to welcome screen.
 * Shows score breakdown and calculates accuracy percentage.
 *
 * @param props Component props
 */
exports.ResultsPage = function (_a) {
    var score = _a.score, difficulty = _a.difficulty, onPlayAgain = _a.onPlayAgain, onBackToMenu = _a.onBackToMenu;
    var calculateAccuracy = function () {
        var total = score.right + score.wrong;
        if (total === 0)
            return 0;
        return Math.round((score.right / total) * 100);
    };
    return (react_1["default"].createElement(material_1.Container, { maxWidth: false, sx: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center'
        } },
        react_1["default"].createElement(material_1.Paper, { sx: {
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                background: 'rgba(16, 20, 24, 0.8)',
                backdropFilter: 'blur(20px)',
                color: 'white',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                padding: '2rem',
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
            react_1["default"].createElement(material_1.Box, { sx: { position: 'relative', zIndex: 1 } },
                react_1["default"].createElement(material_1.Typography, { variant: "h4", sx: {
                        textAlign: 'center',
                        marginBottom: '2rem',
                        fontWeight: 700,
                        letterSpacing: 2,
                        textShadow: '0 0 20px rgba(0, 245, 160, 0.5)'
                    } }, "Game Results"),
                react_1["default"].createElement(material_1.Box, { sx: {
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        marginBottom: '2rem'
                    } },
                    react_1["default"].createElement(material_1.Typography, { variant: "h5", sx: { color: '#00F5A0' } },
                        "Correct: ",
                        score.right),
                    react_1["default"].createElement(material_1.Typography, { variant: "h5", sx: { color: '#ef5350' } },
                        "Wrong: ",
                        score.wrong),
                    react_1["default"].createElement(material_1.Typography, { variant: "h5", sx: { color: '#00D9F5' } },
                        "Accuracy: ",
                        calculateAccuracy(),
                        "%")),
                react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: onBackToMenu, size: "large", sx: {
                        display: 'block',
                        margin: '0 auto',
                        minWidth: 200,
                        height: 48,
                        background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                        boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: 1,
                        '&:hover': {
                            background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                            boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)'
                        }
                    } }, "Back to Menu")))));
};
