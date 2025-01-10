"use strict";
/*********************************************************************
 * GameScreen.tsx
 *
 * Main game interface component that handles the price prediction gameplay.
 * Manages game state, data generation, user interactions, and scoring.
 *********************************************************************/
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
/**
 * Main game interface component.
 * Handles the core game logic including:
 * - Data generation using RandomOHLC
 * - Game state management
 * - Score tracking
 * - User interaction processing
 *
 * @component
 * @param {GameScreenProps} props - Component props
 * @param {string} props.difficulty - Selected difficulty level
 * @param {Function} props.onGameEnd - Callback when game ends with final score
 */
exports.GameScreen = function (_a) {
    var difficulty = _a.difficulty, onGameEnd = _a.onGameEnd;
    // Game state variables
    /** Historical price data organized by timeframe */
    var _b = react_1.useState({}), historicalData = _b[0], setHistoricalData = _b[1];
    /** Available price choices for prediction */
    var _c = react_1.useState([]), priceChoices = _c[0], setPriceChoices = _c[1];
    /** Currently selected price choice */
    var _d = react_1.useState(''), selectedChoice = _d[0], setSelectedChoice = _d[1];
    /** Loading state for data generation */
    var _e = react_1.useState(true), loading = _e[0], setLoading = _e[1];
    /** Game score tracking */
    var _f = react_1.useState({ right: 0, wrong: 0 }), score = _f[0], setScore = _f[1];
    /** Current attempt number (max 5) */
    var _g = react_1.useState(1), attempt = _g[0], setAttempt = _g[1];
    /** Whether to show the result of the current guess */
    var _h = react_1.useState(false), showResult = _h[0], setShowResult = _h[1];
    /** The correct price for the current round */
    var _j = react_1.useState(''), correctPrice = _j[0], setCorrectPrice = _j[1];
    /** Ref to track component initialization */
    var hasInitialized = react_1["default"].useRef(false);
    /**
     * Generates random OHLC (Open, High, Low, Close) price data.
     * Creates 91 days of price data with random volatility and drift parameters.
     * Uses the RandomOHLC class to generate realistic-looking price movements.
     *
     * @returns {Object} An object containing OHLC data organized by timeframe
     * @property {OhlcRow[]} 1m - One-minute interval data
     * @property {OhlcRow[]} D - Daily interval data
     *
     * @remarks
     * - Volatility is randomly set between 1-3
     * - Drift is randomly set between 1-3
     * - Start price is fixed at 10000
     * - Generates 91 days to include the future price day
     */
    var generateRandomData = function () {
        var volatility = Math.random() * 2 + 1;
        var drift = Math.random() * 2 + 1;
        var randOHLC = new random_ohlc_1.RandomOHLC({
            daysNeeded: 91,
            startPrice: 10000,
            volatility: volatility,
            drift: drift
        });
        return randOHLC.generateOhlcData();
    };
    /**
     * Updates the game state with new round data.
     * Resets the game state for a new round by:
     * - Setting the historical data for the chart
     * - Setting up the price choices for the player
     * - Setting the correct price
     * - Resetting selection and result states
     * - Turning off loading state
     *
     * @param processedData - Processed OHLC data organized by timeframe
     * @param choices - Array of price choices to display to the player
     * @param futurePrice - The correct future price for this round
     */
    var updateGameState = function (processedData, choices, futurePrice) {
        setHistoricalData(processedData);
        setPriceChoices(choices);
        setCorrectPrice(priceUtils_1.formatPrice(futurePrice));
        setSelectedChoice('');
        setShowResult(false);
        setLoading(false);
    };
    /**
     * Converts a single OhlcRow to an OhlcBar format required by the charting library.
     * The main transformation is converting the Unix timestamp to the chart's Time format.
     *
     * @param bar Raw OHLC bar with Unix timestamp
     * @param timeInterval Current timeframe being processed
     * @returns Formatted OHLC bar ready for the chart
     */
    var formatOhlcBar = react_1.useCallback(function (bar, timeInterval) {
        return {
            time: bar.timestamp,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close
        };
    }, []);
    var sortOhlcBars = react_1.useCallback(function (a, b) {
        return typeof a.time === 'number' ? a.time - b.time : a.time < b.time ? -1 : 1;
    }, []);
    // const logDataStructure = useCallback((processedData: { [key: string]: OhlcBar[] }) => {
    //   // Keep this empty but maintain the function for future debugging if needed
    // }, []);
    /**
     * Processes raw OHLC data into timeframe groups.
     * Takes the 1-minute data and aggregates it into larger timeframes (5m, 15m, 1h, etc.).
     * Handles partial periods appropriately, especially for weekly and monthly intervals.
     *
     * @param data Raw OHLC data organized by timeframe
     * @returns Processed data ready for chart display
     */
    var processOhlcData = react_1.useCallback(function (data) {
        // Get the trimmed 1-minute data
        var minuteData = data['1m'];
        // Define all timeframes we want to display
        var displayIntervals = ['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'];
        // Initialize the processed data object that will be used by the chart
        var processedData = {};
        // Process 1-minute data first
        processedData['1m'] = minuteData
            .map(function (bar) { return formatOhlcBar(bar, '1m'); })
            .sort(function (a, b) { return sortOhlcBars(a, b); });
        // Group minute data into larger timeframes
        displayIntervals.slice(1).forEach(function (tf) {
            var barsPerInterval = (function () {
                switch (tf) {
                    case '5m':
                        return 5;
                    case '15m':
                        return 15;
                    case '1h':
                        return 60;
                    case '4h':
                        return 240;
                    case 'D':
                        return 1440;
                    case 'W':
                        return 1440 * 7;
                    case 'M':
                        return 1440 * 30;
                    default:
                        return 1;
                }
            })();
            // Group minute data into chunks
            var chunks = [];
            for (var i = 0; i < minuteData.length; i += barsPerInterval) {
                var chunk = minuteData.slice(i, i + barsPerInterval);
                // Always include the chunk, even if it's partial
                // This is especially important for weekly and monthly intervals
                if (chunk.length > 0) {
                    chunks.push(chunk);
                }
            }
            // Convert chunks to OHLC bars
            processedData[tf] = chunks.map(function (chunk) { return ({
                time: chunk[0].timestamp,
                open: chunk[0].open,
                high: Math.max.apply(Math, chunk.map(function (bar) { return bar.high; })),
                low: Math.min.apply(Math, chunk.map(function (bar) { return bar.low; })),
                close: chunk[chunk.length - 1].close
            }); });
        });
        // // Log the data structure for verification
        // console.log('Processed data lengths:', Object.fromEntries(
        //   Object.entries(processedData).map(([interval, data]) => [interval, data.length])
        // ));
        return processedData;
    }, [formatOhlcBar, sortOhlcBars]);
    /**
     * Determines how many days into the future to predict based on difficulty.
     * - Easy: 1 day
     * - Medium: 7 days
     * - Hard: 30 days
     *
     * @param difficulty Selected game difficulty
     * @returns Number of days to look ahead
     */
    var getFutureIndex = react_1.useCallback(function (difficulty) {
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
    }, []);
    /**
     * Calculates how many bars to remove from each timeframe based on the number of days.
     * Ensures consistent data removal across all timeframes to hide future data.
     *
     * @param timeframe Current timeframe (1m, 5m, 15m, etc.)
     * @param days Number of days to remove
     * @returns Number of bars to remove for the given timeframe
     */
    // const getBarsToRemove = useCallback((timeframe: string, days: number): number => {
    //   // Calculate how many bars to remove for each timeframe based on number of days
    //   const minutesInDay = 1440;
    //   switch (timeframe) {
    //     case '1m': return days * minutesInDay;        // 1440 minutes per day
    //     case '5m': return days * (minutesInDay / 5);  // 288 5-min bars per day
    //     case '15m': return days * (minutesInDay / 15); // 96 15-min bars per day
    //     case '1h': return days * 24;                  // 24 1-hour bars per day
    //     case '4h': return days * 6;                   // 6 4-hour bars per day
    //     case 'D': return days;                        // 1 daily bar per day
    //     case 'W': return Math.ceil(days / 7);         // Convert days to weeks
    //     case 'M': return Math.ceil(days / 30);        // Approximate months
    //     default: return days;
    //   }
    // }, []);
    /**
     * Generates price choices for the prediction game.
     * Takes the future price and creates a set of plausible options around it.
     * Also handles data trimming to hide future data from the player.
     *
     * @param processedData OHLC data organized by timeframe
     * @param difficulty Current game difficulty
     * @returns Object containing price choices and the correct future price
     */
    // const generateChoices = useCallback((
    //   processedData: { [key: string]: OhlcBar[] },
    //   difficulty: string
    // ): { choices: string[]; futurePrice: number } => {
    //   // Log the initial data lengths
    //   console.log('Initial data lengths:', Object.fromEntries(
    //     Object.entries(processedData).map(([interval, data]) => [interval, data.length])
    //   ));
    //   // Get the 91st day's close price as the answer
    //   const futurePrice = processedData['D'][processedData['D'].length - 1].close;
    //   console.log('Future price (91st day):', futurePrice);
    //   // Calculate days to remove based on difficulty
    //   const daysToRemove = getFutureIndex(difficulty);
    //   console.log('Days to remove based on difficulty:', {
    //     difficulty,
    //     daysToRemove
    //   });
    //   const choices = generatePriceChoices(futurePrice);
    //   // Remove the appropriate number of bars from each timeframe
    //   Object.keys(processedData).forEach((tf) => {
    //     const beforeLength = processedData[tf].length;
    //     const barsToRemove = getBarsToRemove(tf, daysToRemove);
    //     processedData[tf] = processedData[tf].slice(0, -barsToRemove);
    //     console.log(`${tf} data: ${beforeLength} bars -> ${processedData[tf].length} bars (removed ${barsToRemove} bars)`);
    //   });
    //   return { choices, futurePrice };
    // }, [getFutureIndex, getBarsToRemove]);
    /**
     * Generates a new round of the game.
     * Creates new random price data, processes it into timeframes,
     * and sets up the choices for the player.
     *
     * Handles error cases and updates loading state appropriately.
     *
     * @throws Error if data generation or processing fails
     */
    var generateNewRound = react_1.useCallback(function () {
        setLoading(true);
        try {
            // Get raw data
            var rawData = generateRandomData();
            // Calculate how many minute bars to remove based on difficulty
            var daysToRemove = getFutureIndex(difficulty);
            var minutesToRemove = daysToRemove * 1440; // 1440 minutes per day
            // Store the future price before trimming
            var futurePrice = rawData['D'][rawData['D'].length - 1].close;
            // Remove future data from 1-minute data first
            rawData['1m'] = rawData['1m'].slice(0, -minutesToRemove);
            // Now process the trimmed data into all timeframes
            var processedData = processOhlcData(rawData);
            // Generate choices using the stored future price
            var choices = priceUtils_1.generatePriceChoices(futurePrice);
            // Update game state
            updateGameState(processedData, choices, futurePrice);
        }
        catch (error) {
            console.error('Error generating new round:', error);
            setLoading(false);
            // Show error message to user
            alert('An error occurred while generating the game data. Please try again.');
        }
    }, [difficulty, processOhlcData, getFutureIndex]);
    // Initialize game on mount or when difficulty changes
    react_1.useEffect(function () {
        generateNewRound();
        hasInitialized.current = true;
    }, [generateNewRound, difficulty]);
    /**
     * Handles the "Next" button click.
     * Either starts a new round or ends the game after 5 attempts.
     */
    var handleNext = function () {
        if (attempt >= 5) {
            onGameEnd(score);
        }
        else {
            setAttempt(function (prev) { return prev + 1; });
            setShowResult(false);
            setSelectedChoice('');
            generateNewRound();
        }
    };
    /**
     * Handles returning to the main menu.
     * Cleans up game state and navigates back to welcome screen.
     * Prevents default event behavior and event bubbling.
     *
     * @param event - Click event from the button
     * @see onGameEnd
     */
    var handleBackToMenu = function (event) {
        event.preventDefault();
        onGameEnd(score);
    };
    /**
     * Handles the user's price prediction submission.
     * Validates the choice and updates the game state accordingly.
     */
    var handleSubmit = react_1.useCallback(function (e) {
        e.stopPropagation();
        e.preventDefault();
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
    }, [selectedChoice, correctPrice, showResult, score]);
    /**
     * Handles the next round button click.
     * Prevents event bubbling and initiates the next round.
     *
     * @param event - Click event from the button
     */
    var handleNextClick = function (event) {
        event.preventDefault();
        handleNext();
    };
    /**
     * Handles radio button selection change for price choices.
     * Updates the selected choice in the component state.
     *
     * @param e - Change event from the radio button group
     */
    var handleChoiceChange = function (e) {
        setSelectedChoice(e.target.value);
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
                    " | Attempt:",
                    ' ',
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
                react_1["default"].createElement(ChartComponent_1.ChartComponent, { data: historicalData, defaultInterval: "D" })),
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
                react_1["default"].createElement(material_1.RadioGroup, { value: selectedChoice, onChange: handleChoiceChange, sx: {
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
                        borderColor: selectedChoice === choice
                            ? 'rgba(0, 245, 160, 0.3)'
                            : 'rgba(255, 255, 255, 0.1)',
                        backgroundColor: selectedChoice === choice ? 'rgba(0, 245, 160, 0.1)' : 'transparent',
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
                    } }, attempt >= 5 ? 'See Results' : 'Next Round'))) : (react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: handleSubmit, onMouseDown: function (e) {
                    e.stopPropagation();
                }, onMouseUp: function (e) {
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
