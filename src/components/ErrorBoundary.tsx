import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
    children: ReactNode;
}

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
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    private handleReload = () => {
        window.location.reload();
    };

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