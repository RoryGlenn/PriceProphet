"use strict";
exports.__esModule = true;
exports.ChartComponent = void 0;
var react_1 = require("react");
var lightweight_charts_1 = require("lightweight-charts");
var material_1 = require("@mui/material");
var luxon_1 = require("luxon");
var buttonGroupStyles = {
    mb: 2,
    display: 'flex',
    justifyContent: 'center',
    '& .MuiToggleButton-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        fontSize: '0.875rem',
        padding: '4px 12px',
        '&.Mui-selected': {
            bgcolor: 'rgba(0, 245, 160, 0.1)',
            color: '#00F5A0',
            borderColor: 'rgba(0, 245, 160, 0.3)',
            '&:hover': {
                bgcolor: 'rgba(0, 245, 160, 0.2)'
            }
        },
        '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.05)'
        }
    }
};
var chartContainerStyles = {
    width: '100%',
    height: '400px',
    '& .tv-lightweight-charts': {
        borderRadius: '8px'
    }
};
exports.ChartComponent = function (_a) {
    var data = _a.data, _b = _a.defaultInterval, defaultInterval = _b === void 0 ? 'D' : _b;
    var chartContainerRef = react_1.useRef(null);
    var _c = react_1.useState(defaultInterval), interval = _c[0], setInterval = _c[1];
    var handleIntervalChange = function (_event, newInterval) {
        if (newInterval !== null) {
            setInterval(newInterval);
        }
    };
    react_1.useEffect(function () {
        var _a;
        if (!chartContainerRef.current || !((_a = data[interval]) === null || _a === void 0 ? void 0 : _a.length))
            return;
        var chart = lightweight_charts_1.createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { color: 'transparent' },
                textColor: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
            },
            grid: {
                vertLines: { color: 'rgba(43, 43, 67, 0.5)' },
                horzLines: { color: 'rgba(43, 43, 67, 0.5)' }
            },
            timeScale: {
                timeVisible: interval.endsWith('m') || interval.endsWith('h'),
                secondsVisible: false,
                borderColor: 'rgba(43, 43, 67, 0.5)',
                fixLeftEdge: true,
                fixRightEdge: true,
                rightOffset: 12,
                barSpacing: interval.endsWith('m') ? 3 : 6,
                minBarSpacing: 2,
                tickMarkFormatter: function (time) {
                    var date = typeof time === 'number'
                        ? luxon_1.DateTime.fromSeconds(time)
                        : luxon_1.DateTime.fromFormat(time, 'yyyy-MM-dd');
                    return interval.endsWith('m') || interval.endsWith('h')
                        ? date.toFormat('HH:mm')
                        : date.toFormat('MMM dd');
                }
            }
        });
        var candlestickSeries = chart.addCandlestickSeries({
            upColor: '#00F5A0',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#00F5A0',
            wickDownColor: '#ef5350'
        });
        var setDataInChunks = function (chartData) {
            var CHUNK_SIZE = 5000;
            var currentIndex = 0;
            var processNextChunk = function () {
                var chunk = chartData.slice(currentIndex, currentIndex + CHUNK_SIZE);
                if (chunk.length > 0) {
                    if (currentIndex === 0) {
                        candlestickSeries.setData(chunk);
                    }
                    else {
                        chunk.forEach(function (bar) { return candlestickSeries.update(bar); });
                    }
                    currentIndex += CHUNK_SIZE;
                    if (currentIndex < chartData.length) {
                        setTimeout(processNextChunk, 0);
                    }
                    else {
                        chart.timeScale().fitContent();
                    }
                }
            };
            processNextChunk();
        };
        if (interval.endsWith('m') && data[interval].length > 5000) {
            setDataInChunks(data[interval]);
        }
        else {
            candlestickSeries.setData(data[interval]);
            chart.timeScale().fitContent();
        }
        var handleResize = function () {
            chart.applyOptions({
                width: chartContainerRef.current.clientWidth
            });
        };
        window.addEventListener('resize', handleResize);
        return function () {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, interval]);
    return (react_1["default"].createElement(material_1.Box, null,
        react_1["default"].createElement(material_1.Box, { sx: buttonGroupStyles },
            react_1["default"].createElement(material_1.ToggleButtonGroup, { value: interval, exclusive: true, onChange: handleIntervalChange, "aria-label": "time-interval", size: "small" },
                react_1["default"].createElement(material_1.ToggleButton, { value: "1m", "aria-label": "1 minute" }, "1m"),
                react_1["default"].createElement(material_1.ToggleButton, { value: "5m", "aria-label": "5 minutes" }, "5m"),
                react_1["default"].createElement(material_1.ToggleButton, { value: "15m", "aria-label": "15 minutes" }, "15m"),
                react_1["default"].createElement(material_1.ToggleButton, { value: "1h", "aria-label": "1 hour" }, "1h"),
                react_1["default"].createElement(material_1.ToggleButton, { value: "4h", "aria-label": "4 hours" }, "4h"),
                react_1["default"].createElement(material_1.ToggleButton, { value: "D", "aria-label": "1 day" }, "D"),
                react_1["default"].createElement(material_1.ToggleButton, { value: "W", "aria-label": "1 week" }, "W"),
                react_1["default"].createElement(material_1.ToggleButton, { value: "M", "aria-label": "1 month" }, "M"))),
        react_1["default"].createElement(material_1.Box, { ref: chartContainerRef, sx: chartContainerStyles })));
};
