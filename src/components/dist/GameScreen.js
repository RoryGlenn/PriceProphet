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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
    // Initialize game on mount
    react_1.useEffect(function () {
        var mounted = true;
        var initializeGame = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (mounted) {
                    generateNewRound();
                }
                return [2 /*return*/];
            });
        }); };
        initializeGame();
        return function () {
            mounted = false;
        };
    }, []);
    /**
     * Generate a new round of the game.
     * Creates new price data and updates game state.
     */
    var generateNewRound = function () {
        setLoading(true);
        var data = generateRandomData();
        var processedData = processOhlcData(data);
        var _a = generateChoices(processedData, difficulty), choices = _a.choices, futurePrice = _a.futurePrice;
        updateGameState(processedData, choices, futurePrice);
    };
    /**
     * Generate random OHLC data using RandomOHLC class.
     * Creates 90 days of price data with random volatility and drift.
     */
    var generateRandomData = function () {
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
        setHistoricalData(processedData);
        setPriceChoices(choices);
        setCorrectPrice(choices[0]);
        setSelectedChoice('');
        setShowResult(false);
        setLoading(false);
    };
    var handleSubmit = function () {
        if (!selectedChoice)
            return;
        if (selectedChoice === correctPrice) {
            setScore(function (prev) { return (__assign(__assign({}, prev), { right: prev.right + 1 })); });
        }
        else {
            setScore(function (prev) { return (__assign(__assign({}, prev), { wrong: prev.wrong + 1 })); });
        }
        setShowResult(true);
    };
    var handleNext = function () {
        if (attempt >= 5) {
            // Game over
            onGameEnd();
        }
        else {
            setAttempt(function (prev) { return prev + 1; });
            generateNewRound();
        }
    };
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
                react_1["default"].createElement(material_1.Button, { variant: "outlined", onClick: onGameEnd, sx: {
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
                react_1["default"].createElement(material_1.RadioGroup, { value: selectedChoice, onChange: function (e) { return setSelectedChoice(e.target.value); }, sx: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 2
                    } }, priceChoices.map(function (choice) { return (react_1["default"].createElement(material_1.FormControlLabel, { key: choice, value: choice, control: react_1["default"].createElement(material_1.Radio, { sx: {
                            color: 'rgba(255, 255, 255, 0.3)',
                            '&.Mui-checked': {
                                color: '#00F5A0'
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
                            backgroundColor: 'rgba(0, 245, 160, 0.05)'
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
                react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: handleNext, size: "large", sx: {
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
                        '&:hover': {
                            background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                            boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)'
                        }
                    } }, attempt >= 5 ? 'See Results' : 'Next Round'))) : (react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: handleSubmit, size: "large", disabled: !selectedChoice, sx: {
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
