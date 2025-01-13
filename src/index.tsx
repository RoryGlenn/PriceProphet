/*********************************************************************
 * index.tsx
 *
 * Application entry point that sets up the React root and renders
 * the main App component. Configures global styles and ensures
 * proper initialization of the application.
 *********************************************************************/

import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

/*
 * Initialize the root element and create a React root.
 * Throws an error if the root element is not found, as it's
 * critical for application mounting.
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}
const root = createRoot(container);

/*
 * Render the application with:
 * 1. CssBaseline for consistent base styles
 * 2. ErrorBoundary for graceful error handling
 * 3. Main App component
 *
 * Using React.StrictMode to:
 * - Highlight potential problems
 * - Detect unsafe lifecycles
 * - Warn about deprecated APIs
 */
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <CssBaseline />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
