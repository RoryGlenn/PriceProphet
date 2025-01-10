"use strict";
/*********************************************************************
 * ResultsPage.tsx
 *
 * Results screen component that shows the final score and statistics
 * after completing the game. Features a modern glass morphism design
 * with neon accents matching the game's aesthetic.
 *********************************************************************/
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
exports.ResultsPage = void 0;
var react_1 = require("react");
var material_1 = require("@mui/material");
exports.ResultsPage = function (_a) {
    var score = _a.score, difficulty = _a.difficulty, onPlayAgain = _a.onPlayAgain, onBackToMenu = _a.onBackToMenu;
    // Add logging on mount
    react_1.useEffect(function () {
        // Component initialization
    }, []);
    var handlePlayAgain = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            event.preventDefault();
            try {
                onPlayAgain();
            }
            catch (error) {
                console.error('Error in Play Again handler:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleBackToMenu = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            event.preventDefault();
            try {
                onBackToMenu();
            }
            catch (error) {
                console.error('Error in Back to Menu handler:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var getGrade = function (accuracy) {
        if (accuracy >= 90)
            return 'A';
        if (accuracy >= 80)
            return 'B';
        if (accuracy >= 70)
            return 'C';
        if (accuracy >= 60)
            return 'D';
        return 'F';
    };
    var accuracy = (score.right / (score.right + score.wrong)) * 100 || 0;
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
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 10
                } },
                react_1["default"].createElement(material_1.Button, { variant: "contained", onClick: handlePlayAgain, sx: {
                        minWidth: 140,
                        height: 48,
                        background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                        boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: 1,
                        border: 0,
                        position: 'relative',
                        zIndex: 20,
                        '&:hover': {
                            background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                            boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)'
                        }
                    } }, "Play Again"),
                react_1["default"].createElement(material_1.Button, { variant: "outlined", onClick: handleBackToMenu, sx: {
                        minWidth: 140,
                        height: 48,
                        borderColor: 'rgba(0, 245, 160, 0.5)',
                        color: '#00F5A0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: 1,
                        position: 'relative',
                        zIndex: 20,
                        '&:hover': {
                            borderColor: '#00F5A0',
                            backgroundColor: 'rgba(0, 245, 160, 0.1)'
                        }
                    } }, "Back to Menu")))));
};
