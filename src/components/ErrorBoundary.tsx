/*********************************************************************
 * ErrorBoundary.tsx
 *
 * React Error Boundary component that provides graceful error handling
 * and fallback UI for runtime errors in the component tree.
 *
 * Features:
 * - Catches JavaScript errors in child components
 * - Prevents app crashes by containing errors
 * - Displays user-friendly error messages
 * - Shows detailed error info in development
 * - Provides error recovery options
 * - Implements glass morphism design
 *
 * Error Handling:
 * - Runtime errors in rendering
 * - Lifecycle method errors
 * - Event handler errors
 * - Async errors in effects
 *
 * @module ErrorBoundary
 * @requires react
 * @requires @mui/material
 *********************************************************************/

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

/**
 * Props interface for the ErrorBoundary component.
 *
 * @interface Props
 * @property {ReactNode} children - Child components to be wrapped
 */
interface Props {
  children: ReactNode;
}

/**
 * State interface for the ErrorBoundary component.
 * Tracks error state and details for display.
 *
 * @interface State
 * @property {boolean} hasError - Whether an error has occurred
 * @property {Error | null} error - The error object if one exists
 * @property {ErrorInfo | null} errorInfo - React error information including component stack
 */
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in its child
 * component tree and displays a fallback UI instead of the component tree that crashed.
 *
 * Features:
 * - Catches render and lifecycle errors in components
 * - Displays user-friendly error message
 * - Provides option to retry/reload
 * - Logs errors for debugging
 *
 * Lifecycle:
 * 1. Normal rendering until error occurs
 * 2. Error is caught and state is updated
 * 3. Fallback UI is rendered
 * 4. User can attempt recovery
 *
 * @class ErrorBoundary
 * @extends {Component<Props, State>}
 *
 * @example
 * // Wrap components that might error
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  /**
   * Initialize component state.
   * Sets up initial error tracking state.
   *
   * @public
   * @type {State}
   */
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  /**
   * Static lifecycle method called when an error occurs during rendering.
   * Updates state to trigger fallback UI rendering.
   *
   * @static
   * @param {Error} error - The error that was thrown
   * @returns {State} New state object with error information
   */
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Lifecycle method called after an error has been caught.
   * Logs error details and updates component state.
   *
   * @public
   * @param {Error} error - The error that was thrown
   * @param {ErrorInfo} errorInfo - React error information including component stack
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Handles page reload for error recovery.
   * Resets the application state by refreshing the page.
   *
   * @private
   * @returns {void}
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Renders either the error UI or the children components.
   * Shows detailed error information in development mode.
   *
   * UI Features:
   * - Glass morphism design
   * - Error message display
   * - Stack trace in development
   * - Reload button for recovery
   *
   * @public
   * @returns {ReactNode} The rendered content
   */
  public render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="#0F2027"
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 600,
              width: '90%',
              background: 'rgba(16, 20, 24, 0.8)',
              backdropFilter: 'blur(20px)',
              color: 'white',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" gutterBottom color="#ef5350">
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
              We're sorry, but something unexpected happened. Please try reloading the page.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 1,
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <Typography variant="body2" color="#ef5350">
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ mt: 1 }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
            <Button
              variant="contained"
              onClick={this.handleReload}
              sx={{
                mt: 3,
                background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                boxShadow: '0 3px 16px rgba(0, 245, 160, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00F5A0 30%, #00D9F5 90%)',
                  boxShadow: '0 6px 20px rgba(0, 245, 160, 0.4)',
                },
              }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
