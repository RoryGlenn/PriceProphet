"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.GameScreen = void 0;
var react_1 = require("react");
var material_1 = require("@mui/material");
var ChartComponent_1 = require("./ChartComponent");
var random_ohlc_1 = require("../random_ohlc");
var priceUtils_1 = require("../utils/priceUtils");
var luxon_1 = require("luxon");
/**
 * GameScreen component handles the main game logic and UI.
 * Manages game state, data generation, and user interactions.
 */
exports.GameScreen = function (_a) {
    var difficulty = _a.difficulty, onGameEnd = _a.onGameEnd;
    // Game state
    var _b = react_1.useState({}), historicalData = _b[0], setHistoricalData = _b[1];
    var _c = react_1.useState([]), priceChoices = _c[0], setPriceChoices = _c[1];
    var _d = react_1.useState(''), selectedChoice = _d[0], setSelectedChoice = _d[1];
    var _e = react_1.useState(true), loading = _e[0], setLoading = _e[1];
    var _f = react_1.useState({ right: 0, wrong: 0 }), score = _f[0], setScore = _f[1];
    var _g = react_1.useState(1), attempt = _g[0], setAttempt = _g[1];
    var _h = react_1.useState(false), showResult = _h[0], setShowResult = _h[1];
    var _j = react_1.useState(''), correctPrice = _j[0], setCorrectPrice = _j[1];
    // Ref to track initialization
    var hasInitialized = react_1["default"].useRef(false);
    // Initialize game on mount
    react_1.useEffect(function () {
        console.log('GameScreen initialization started');
        if (!hasInitialized.current) {
            console.log('Generating initial game data');
            generateNewRound();
            hasInitialized.current = true;
        }
        else {
            console.log('Skipping duplicate initialization');
        }
        return function () {
            console.log('GameScreen cleanup');
        };
    }, []);
    /**
     * Generate a new round of the game.
     * Creates new price data and updates game state.
     */
    var generateNewRound = function () {
        console.log('Generating new round');
        setLoading(true);
        try {
            var data = generateRandomData();
            var processedData = processOhlcData(data);
            var _a = generateChoices(processedData, difficulty), choices = _a.choices, futurePrice = _a.futurePrice;
            updateGameState(processedData, choices, futurePrice);
        }
        catch (error) {
            console.error('Error generating new round:', error);
            setLoading(false);
        }
    };
    /**
     * Generate random OHLC data using RandomOHLC class.
     * Creates 90 days of price data with random volatility and drift.
     */
    var generateRandomData = function () {
        console.log('Generating random OHLC data');
        var volatility = Math.random() * 2 + 1;
        var drift = Math.random() * 2 + 1;
        var randOHLC = new random_ohlc_1.RandomOHLC({
            daysNeeded: 90,
            startPrice: 10000,
            volatility: volatility,
            drift: drift
        });
        return randOHLC.generateOhlcData();
    };
    /**
     * Process raw OHLC data into format required by chart component.
     * Handles different time intervals and timestamp formats.
     *
     * @param data Raw OHLC data from RandomOHLC
     * @returns Processed data suitable for charting
     */
    var processOhlcData = function (data) {
        /*
         * We support multiple time intervals from 1min to 1M.
         * Each interval needs its own array of properly formatted OHLC bars.
         * The chart component expects specific time formats:
         * - For intraday (1min to 4H): Unix timestamps
         * - For daily and above: 'yyyy-MM-dd' strings
         */
        var timeIntervals = ['1min', '5min', '15min', '1H', '4H', '1D', '1W', '1M'];
        var processedData = {};
        timeIntervals.forEach(function (tf) {
            processedData[tf] = data[tf]
                .map(function (bar) { return formatOhlcBar(bar, tf); })
                .sort(function (a, b) { return sortOhlcBars(a, b); });
        });
        logDataStructure(processedData);
        return processedData;
    };
    /**
     * Format an OHLC bar for the chart component.
     * Handles different timestamp formats based on time interval.
     *
     * @param bar Raw OHLC bar
     * @param timeInterval Time interval of the data
     * @returns Formatted OHLC bar
     */
    var formatOhlcBar = function (bar, timeInterval) {
        /*
         * The chart library (lightweight-charts) requires different time formats:
         * 1. For intraday data (1min to 4H): Use Unix timestamps
         *    - Allows precise time display including hours and minutes
         *    - Maintains exact time spacing between bars
         *
         * 2. For daily and above (1D, 1W, 1M): Use 'yyyy-MM-dd' strings
         *    - Automatically handles business days
         *    - Properly spaces bars for weekends and holidays
         */
        var date = luxon_1.DateTime.fromSeconds(bar.timestamp);
        if (timeInterval.includes('min') || timeInterval.includes('H')) {
            return {
                time: bar.timestamp,
                open: bar.open,
                high: bar.high,
                low: bar.low,
                close: bar.close
            };
        }
        return {
            time: date.toFormat('yyyy-MM-dd'),
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close
        };
    };
    /**
     * Sort OHLC bars by time.
     * Handles both timestamp and date string formats.
     */
    var sortOhlcBars = function (a, b) {
        return typeof a.time === 'number' ? a.time - b.time : a.time < b.time ? -1 : 1;
    };
    /**
     * Log data structure for debugging.
     * Shows available time intervals and number of bars.
     */
    var logDataStructure = function (processedData) {
        console.log('Available time intervals:', Object.keys(processedData));
        console.log('Data structure:', {
            timeIntervals: Object.keys(processedData),
            sampleSizes: Object.entries(processedData).map(function (_a) {
                var tf = _a[0], data = _a[1];
                return tf + ": " + data.length + " bars";
            })
        });
    };
    /**
     * Generate price choices for the game round.
     * Removes future data based on difficulty level.
     *
     * @param processedData Processed OHLC data
     * @param difficulty Game difficulty level
     * @returns Price choices and correct future price
     */
    var generateChoices = function (processedData, difficulty) {
        /*
         * Game mechanics for price prediction:
         * 1. Get the prediction timeframe based on difficulty:
         *    - Easy: 1 day into the future
         *    - Medium: 1 week into the future
         *    - Hard: 1 month into the future
         *
         * 2. Take the last price from the daily data as the "future" price
         *
         * 3. Remove the corresponding amount of data from all timeframes
         *    to hide the future prices from the player
         */
        var futureIndex = getFutureIndex(difficulty);
        var futurePrice = processedData['1D'][processedData['1D'].length - 1].close;
        var choices = priceUtils_1.generatePriceChoices(futurePrice);
        // Remove future data from all time intervals to maintain consistency
        Object.keys(processedData).forEach(function (tf) {
            processedData[tf] = processedData[tf].slice(0, -futureIndex);
        });
        return { choices: choices, futurePrice: futurePrice };
    };
    /**
     * Get future index based on difficulty level.
     * Easy: 1 day, Medium: 7 days, Hard: 30 days
     */
    var getFutureIndex = function (difficulty) {
        switch (difficulty) {
            case 'Easy':
                return 1;
            case 'Medium':
                return 7;
            case 'Hard':
                return 30;
            default:
                return 1;
        }
    };
    /**
     * Update game state with new round data.
     * Resets selection and result states.
     */
    var updateGameState = function (processedData, choices, futurePrice) {
        console.log('Updating game state with:', { choices: choices, futurePrice: futurePrice });
        setHistoricalData(processedData);
        setPriceChoices(choices);
        setCorrectPrice(futurePrice.toFixed(2));
        setSelectedChoice('');
        setShowResult(false);
        setLoading(false);
    };
    var debugWrapper = function (fn, name) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log("Entering " + name);
            try {
                var result = fn.apply(void 0, args);
                console.log("Exiting " + name);
                return result;
            }
            catch (error) {
                console.error("Error in " + name + ":", error);
                throw error;
            }
        };
    };
    var handleSubmit = debugWrapper(function () {
        console.log('Submit button clicked');
        console.log('Current game state:', {
            selectedChoice: selectedChoice,
            correctPrice: correctPrice,
            priceChoices: priceChoices,
            showResult: showResult,
            score: score,
            attempt: attempt
        });
        if (!selectedChoice) {
            console.warn('No choice selected, returning early');
            return;
        }
        try {
            console.log('Processing submission...');
            if (selectedChoice === correctPrice) {
                console.log('Correct answer! Selected:', selectedChoice, 'Correct:', correctPrice);
                setScore(function (prev) {
                    var newScore = __assign(__assign({}, prev), { right: prev.right + 1 });
                    console.log('Updated score:', newScore);
                    return newScore;
                });
            }
            else {
                console.log('Wrong answer. Selected:', selectedChoice, 'Correct:', correctPrice);
                setScore(function (prev) {
                    var newScore = __assign(__assign({}, prev), { wrong: prev.wrong + 1 });
                    console.log('Updated score:', newScore);
                    return newScore;
                });
            }
            console.log('Setting showResult to true');
            setShowResult(true);
            console.log('Submission processing complete');
        }
        catch (error) {
            console.error('Error in handleSubmit:', error);
        }
    }, 'handleSubmit');
    var handleSubmitClick = debugWrapper(function (event) {
        event.preventDefault();
        console.log('Submit button clicked - direct handler');
        handleSubmit();
    }, 'handleSubmitClick');
    // Add logging to track state changes
    react_1.useEffect(function () {
        console.log('Score changed:', score);
    }, [score]);
    react_1.useEffect(function () {
        console.log('ShowResult changed:', showResult);
    }, [showResult]);
    var handleNext = function () {
        console.log('Next round button clicked');
        console.log('Current attempt:', attempt);
        if (attempt >= 5) {
            console.log('Game over, returning to menu with score:', score);
            onGameEnd(score);
        }
        else {
            console.log('Starting next round');
            setAttempt(function (prev) {
                console.log('Incrementing attempt from', prev, 'to', prev + 1);
                return prev + 1;
            });
            setShowResult(false);
            setSelectedChoice('');
            generateNewRound();
        }
    };
    var handleBackToMenu = function (event) {
        event.preventDefault();
        onGameEnd(score);
    };
    var handleNextClick = function (event) {
        event.preventDefault();
        handleNext();
    };
    // Add test logging on mount
    react_1.useEffect(function () {
        console.log('GameScreen mounted');
        console.log('Initial state:', {
            difficulty: difficulty,
            priceChoices: priceChoices,
            selectedChoice: selectedChoice,
            correctPrice: correctPrice,
            showResult: showResult,
            score: score,
            attempt: attempt
        });
    }, []);
    if (loading) {
        return (react_1["default"].createElement(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
            react_1["default"].createElement(material_1.CircularProgress, null)));
    }
    return (react_1["default"].createElement(material_1.Container, { maxWidth: false, sx: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center'
        } },
        react_1["default"].createElement(material_1.Paper, { sx: {
                width: '100%',
                background: 'rgba(16, 20, 24, 0.8)',
                backdropFilter: 'blur(20px)',
                color: 'white',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                position: 'relative',
                overflow: 'hidden',
                p: 4,
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
            react_1["default"].createElement(material_1.Box, { sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    position: 'relative',
                    zIndex: 1
                } },
                react_1["default"].createElement(material_1.Typography, { variant: "h4", sx: {
                        fontWeight: 700,
                        letterSpacing: 2,
                        textShadow: '0 0 20px rgba(0, 245, 160, 0.5)'
                    } }, "Predict the Future Price"),
                react_1["default"].createElement(material_1.Button, { variant: "outlined", onClick: handleBackToMenu, sx: {
                        borderColor: 'rgba(0, 245, 160, 0.5)',
                        color: '#00F5A0',
                        '&:hover': {
                            borderColor: '#00F5A0',
                            backgroundColor: 'rgba(0, 245, 160, 0.1)'
                        }
                    } }, "Back to Menu")),
            react_1["default"].createElement(material_1.Box, { sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 4,
                    position: 'relative',
                    zIndex: 1
                } },
                react_1["default"].createElement(material_1.Typography, { variant: "h6", sx: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500
                    } },
                    "Difficulty: ",
                    react_1["default"].createElement("span", { style: { color: '#00F5A0' } }, difficulty),
                    " | Attempt: ",
                    react_1["default"].createElement("span", { style: { color: '#00F5A0' } },
                        attempt,
                        "/5")),
                react_1["default"].createElement(material_1.Typography, { variant: "h6", sx: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500
                    } },
                    "Score: ",
                    react_1["default"].createElement("span", { style: { color: '#00F5A0' } },
                        "Correct: ",
                        score.right),
                    " |",
                    react_1["default"].createElement("span", { style: { color: '#ef5350' } },
                        " Wrong: ",
                        score.wrong))),
            react_1["default"].createElement(material_1.Box, { sx: {
                    mb: 4,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    p: 2,
                    position: 'relative',
                    zIndex: 1
                } },
                react_1["default"].createElement(ChartComponent_1.ChartComponent, { data: historicalData, defaultInterval: "1D" })),
            react_1["default"].createElement(material_1.Box, { sx: {
                    mb: 4,
                    position: 'relative',
                    zIndex: 1
                } },
                react_1["default"].createElement(material_1.Typography, { variant: "h6", gutterBottom: true, sx: {
                        color: '#00F5A0',
                        fontWeight: 500,
                        letterSpacing: 1,
                        mb: 3
                    } }, "What do you think the future closing price will be?"),
                react_1["default"].createElement(material_1.RadioGroup, { value: selectedChoice, onChange: function (e) {
                        console.log('Radio selection changed:', e.target.value);
                        setSelectedChoice(e.target.value);
                    }, sx: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 2,
                        opacity: showResult ? 0.7 : 1,
                        pointerEvents: showResult ? 'none' : 'auto'
                    } }, priceChoices.map(function (choice) { return (react_1["default"].createElement(material_1.FormControlLabel, { key: choice, value: choice, disabled: showResult, control: react_1["default"].createElement(material_1.Radio, { sx: {
                            color: 'rgba(255, 255, 255, 0.3)',
                            '&.Mui-checked': {
                                color: '#00F5A0'
                            },
                            '&.Mui-disabled': {
                                color: selectedChoice === choice ? '#00F5A0' : 'rgba(255, 255, 255, 0.3)'
                            }
                        } }), label: choice, sx: {
                        margin: 0,
                        padding: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: selectedChoice === choice ?
                            'rgba(0, 245, 160, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        backgroundColor: selectedChoice === choice ?
                            'rgba(0, 245, 160, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: showResult ? 'transparent' : 'rgba(0, 245, 160, 0.05)'
                        },
                        '&.Mui-disabled': {
                            opacity: 0.7,
                            color: 'white'
                        }
                    } })); }))),
            showResult ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(material_1.Typography, { variant: "h6", sx: {
                        color: selectedChoice === correctPrice ? '#00F5A0' : '#ef5350',
                        textAlign: 'center',
                        mb: 3
                    } }, selectedChoice === correctPrice
                    ? '🎯 Correct! Well done!'
                    : "\u274C Wrong! The correct price was " + correctPrice),
                react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: handleNextClick, size: "large", sx: {
                        display: 'block',
                        margin: '0 auto',
                        minWidth: 200,
                        height: 48,
                        background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                        boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: 1,
                        border: 0,
                        zIndex: 10,
                        position: 'relative',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                            boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)'
                        }
                    } }, attempt >= 5 ? 'See Results' : 'Next Round'))) : (react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Submit button clicked - raw event');
                    console.log('Current state:', {
                        selectedChoice: selectedChoice,
                        correctPrice: correctPrice,
                        showResult: showResult,
                        score: score
                    });
                    if (selectedChoice === correctPrice) {
                        setScore(function (prev) { return (__assign(__assign({}, prev), { right: prev.right + 1 })); });
                    }
                    else {
                        setScore(function (prev) { return (__assign(__assign({}, prev), { wrong: prev.wrong + 1 })); });
                    }
                    setShowResult(true);
                }, onMouseDown: function (e) {
                    console.log('Button mousedown event');
                    e.stopPropagation();
                }, onMouseUp: function (e) {
                    console.log('Button mouseup event');
                    e.stopPropagation();
                }, size: "large", disabled: !selectedChoice, sx: {
                    display: 'block',
                    margin: '0 auto',
                    minWidth: 200,
                    height: 48,
                    background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                    boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: 1,
                    border: 0,
                    zIndex: 10,
                    position: 'relative',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                        boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)'
                    },
                    '&.Mui-disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: 'none'
                    }
                } }, "Submit Prediction")))));
};
