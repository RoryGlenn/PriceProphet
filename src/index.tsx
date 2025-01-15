/*********************************************************************
 * index.tsx
 *
 * Application entry point that sets up the React root and renders
 * the main App component. This module is responsible for:
 * - Initializing the React application
 * - Setting up global styles and CSS baseline
 * - Configuring error boundaries
 * - Enabling React strict mode
 *
 * Features:
 * - Global error handling with ErrorBoundary
 * - Material-UI CSS baseline integration
 * - React 18 createRoot API usage
 * - Development mode strict checks
 *
 * @module index
 * @requires react
 * @requires react-dom/client
 * @requires @mui/material
 *********************************************************************/

import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Initialize the root element and create a React root.
 * Uses the new React 18 createRoot API for concurrent features.
 *
 * @throws {Error} If the root element with id 'root' is not found in the DOM
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}
const root = createRoot(container);

/**
 * Render the application with its core providers and components.
 *
 * Component hierarchy:
 * - StrictMode: Enables additional development checks
 *   - ErrorBoundary: Catches and handles React component errors
 *     - CssBaseline: Normalizes browser styles
 *       - App: Main application component
 *
 * StrictMode features:
 * - Double-invokes effects and reducers to find bugs
 * - Verifies components can handle multiple renders
 * - Warns about deprecated APIs
 * - Detects unexpected side effects
 *
 * ErrorBoundary features:
 * - Catches JavaScript errors in component tree
 * - Displays fallback UI on error
 * - Prevents app crashes
 *
 * CssBaseline features:
 * - Removes browser inconsistencies
 * - Provides consistent base styles
 * - Improves Material-UI integration
 */
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <CssBaseline />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
