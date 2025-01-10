"use strict";
/*********************************************************************
 * WelcomePage.tsx
 *
 * Welcome screen component that introduces the game and allows
 * players to select their difficulty level before starting.
 * Features a modern glass morphism design with neon accents.
 *********************************************************************/
exports.__esModule = true;
exports.WelcomePage = void 0;
var react_1 = require("react");
var material_1 = require("@mui/material");
var difficultyDescriptions = {
    Easy: 'Predict the price 1 day into the future',
    Medium: 'Predict the price 1 week into the future',
    Hard: 'Predict the price 1 month into the future'
};
exports.WelcomePage = function (_a) {
    var onStartGame = _a.onStartGame;
    var _b = react_1.useState('Easy'), selectedDifficulty = _b[0], setSelectedDifficulty = _b[1];
    // Track component mounting
    react_1.useEffect(function () {
        // Component initialization
    }, []);
    var handleDifficultyChange = function (_event) {
        var newDifficulty = _event.target.value;
        setSelectedDifficulty(newDifficulty);
    };
    var handleStartGame = function (event) {
        event.preventDefault();
        onStartGame(selectedDifficulty);
    };
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
                    mb: 2
                } }, "Price Prophet"),
            react_1["default"].createElement(material_1.Typography, { variant: "h6", sx: {
                    color: '#00F5A0',
                    fontWeight: 500,
                    letterSpacing: 1,
                    mb: 1
                } }, "Test your price prediction skills!"),
            react_1["default"].createElement(material_1.Typography, { variant: "body1", sx: {
                    mb: 5,
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1rem',
                    maxWidth: '80%',
                    margin: '0 auto 40px'
                } }, "Analyze historical price charts and predict future price movements. Choose your difficulty level to begin."),
            react_1["default"].createElement(material_1.RadioGroup, { value: selectedDifficulty, onChange: handleDifficultyChange, sx: { mb: 5 } }, Object.entries(difficultyDescriptions).map(function (_a) {
                var difficulty = _a[0], description = _a[1];
                return (react_1["default"].createElement(material_1.Box, { key: difficulty, sx: {
                        mb: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    } },
                    react_1["default"].createElement(material_1.FormControlLabel, { value: difficulty, control: react_1["default"].createElement(material_1.Radio, { sx: {
                                color: 'rgba(255, 255, 255, 0.3)',
                                '&.Mui-checked': {
                                    color: '#00F5A0'
                                },
                                '& .MuiSvgIcon-root': {
                                    fontSize: 28
                                }
                            } }), label: react_1["default"].createElement(material_1.Box, { sx: {
                                textAlign: 'center',
                                padding: '12px 24px',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                background: selectedDifficulty === difficulty ?
                                    'rgba(0, 245, 160, 0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: selectedDifficulty === difficulty ?
                                    'rgba(0, 245, 160, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                width: '100%'
                            } },
                            react_1["default"].createElement(material_1.Typography, { variant: "h6", sx: {
                                    color: selectedDifficulty === difficulty ?
                                        '#00F5A0' : '#FFFFFF',
                                    fontWeight: 500,
                                    transition: 'color 0.3s ease'
                                } }, difficulty),
                            react_1["default"].createElement(material_1.Typography, { variant: "body2", sx: {
                                    color: 'rgba(255, 255, 255, 0.6)'
                                } }, description)), sx: {
                            margin: 0,
                            width: '100%'
                        } })));
            })),
            react_1["default"].createElement(material_1.Button, { component: "button", variant: "contained", onClick: handleStartGame, sx: {
                    minWidth: 200,
                    height: 48,
                    background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                    boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: 1,
                    border: 0,
                    cursor: 'pointer',
                    zIndex: 10,
                    position: 'relative',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                        boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)'
                    },
                    '&.Mui-disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: 'none',
                        cursor: 'not-allowed'
                    }
                } }, "START GAME"))));
};
