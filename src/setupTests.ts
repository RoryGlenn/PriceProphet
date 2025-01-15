/*********************************************************************
 * setupTests.ts
 *
 * Test setup configuration file that provides mock implementations
 * for browser APIs not available in the Jest test environment.
 * This ensures tests can run without browser-specific features.
 *
 * @module setupTests
 *********************************************************************/

import '@testing-library/jest-dom';

/**
 * Mock implementation of the window.matchMedia API
 * Required for components that use media queries
 * Returns a mock MediaQueryList object with default values
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Mock implementation of ResizeObserver
 * Required for components that observe element size changes
 * Provides empty mock methods that can be spied on in tests
 */
class ResizeObserverMock {
  /** Mock observe method */
  observe = jest.fn();
  /** Mock unobserve method */
  unobserve = jest.fn();
  /** Mock disconnect method */
  disconnect = jest.fn();
}

// Assign mock implementation to window
window.ResizeObserver = ResizeObserverMock;

/**
 * Mock implementations of animation frame methods
 * Replaces requestAnimationFrame and cancelAnimationFrame with
 * setTimeout/clearTimeout for predictable timing in tests
 */
window.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 0));
window.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));
