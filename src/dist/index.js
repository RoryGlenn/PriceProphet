"use strict";
/*********************************************************************
 * index.tsx
 *
 * Application entry point that sets up the React root and renders
 * the main App component. Configures global styles and ensures
 * proper initialization of the application.
 *********************************************************************/
exports.__esModule = true;
var react_1 = require("react");
var client_1 = require("react-dom/client");
var material_1 = require("@mui/material");
var App_1 = require("./App");
/*
 * Initialize the root element and create a React root.
 * Throws an error if the root element is not found, as it's
 * critical for application mounting.
 */
var rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Failed to find the root element');
}
var root = client_1.createRoot(rootElement);
/*
 * Render the application with:
 * 1. CssBaseline for consistent base styles
 * 2. Main App component
 *
 * Using React.StrictMode to:
 * - Highlight potential problems
 * - Detect unsafe lifecycles
 * - Warn about deprecated APIs
 */
root.render(react_1["default"].createElement(react_1["default"].StrictMode, null,
    react_1["default"].createElement(material_1.CssBaseline, null),
    react_1["default"].createElement(App_1.App, null)));
