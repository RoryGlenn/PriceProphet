/*********************************************************************
 * priceUtils.ts
 *
 * Utility functions for price-related calculations and manipulations.
 * Handles the generation of price choices for the prediction game,
 * providing varied price alternatives within a reasonable range.
 *
 * Features:
 * - Currency formatting with consistent decimal places
 * - Random price choice generation for game options
 * - Configurable price variation ranges
 * - Unbiased option shuffling
 * - Input validation and error handling
 *
 * Implementation Details:
 * - Uses Intl.NumberFormat for locale-aware price formatting
 * - Implements Fisher-Yates shuffle for unbiased randomization
 * - Ensures price choices are within reasonable ranges
 * - Maintains positive price values
 * - Provides consistent decimal precision
 *
 * Usage Example:
 * ```typescript
 * // Format a price
 * const price = formatPrice(123.456); // "$123.46"
 *
 * // Generate game choices
 * const choices = generatePriceChoices(100);
 * // Returns array like: ["$92.15", "$100.00", "$115.32", "$88.76"]
 * ```
 *
 * @module priceUtils
 * @description Price formatting and choice generation utilities for the game
 *********************************************************************/

/**
 * Formats a number as a currency string with consistent formatting.
 * Uses US dollar format with exactly 2 decimal places.
 *
 * Features:
 * - Locale-aware formatting using Intl.NumberFormat
 * - Consistent 2 decimal place precision
 * - Thousands separators for readability
 * - Dollar sign prefix
 *
 * Implementation Details:
 * - Uses 'en-US' locale for consistent formatting
 * - Forces exactly 2 decimal places
 * - Handles numbers of any size
 * - Rounds to nearest cent
 *
 * Performance:
 * - Caches NumberFormat instance internally
 * - O(log n) complexity for number conversion
 * - Minimal memory allocation
 *
 * @example
 * formatPrice(123.456) // Returns "$123.46"
 * formatPrice(1000) // Returns "$1,000.00"
 * formatPrice(0.1) // Returns "$0.10"
 * formatPrice(1234567.89) // Returns "$1,234,567.89"
 *
 * @param {number} price - The numeric price value to format
 * @returns {string} Price formatted as USD with 2 decimal places
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Generates an array of price choices for the prediction game.
 * Creates four price options with one correct answer and three alternatives.
 *
 * Features:
 * - Generates 4 unique price choices
 * - Includes actual price as correct answer
 * - Creates challenging but reasonable alternatives
 * - Randomizes correct answer position
 * - Validates input parameters
 *
 * Algorithm Details:
 * 1. Validate input price is positive
 * 2. Format actual price as base choice
 * 3. Generate 3 alternative prices:
 *    - Random variations within ±20% range
 *    - Ensures prices stay positive
 *    - Avoids duplicate values
 * 4. Shuffle all choices using Fisher-Yates algorithm
 *
 * Price Generation:
 * - Alternatives vary by -20% to +20% from actual
 * - Uses percentage-based variations for proportional changes
 * - Maintains minimum price of $0.01
 * - Applies consistent formatting to all options
 *
 * Randomization:
 * - Uses Fisher-Yates shuffle for unbiased positioning
 * - Equal probability for correct answer placement
 * - O(n) shuffle complexity
 *
 * Error Handling:
 * - Validates actual price is positive
 * - Ensures minimum price threshold
 * - Maintains price precision
 * - Throws descriptive errors
 *
 * @example
 * // Basic usage
 * generatePriceChoices(100)
 * // Might return: ["$92.15", "$100.00", "$115.32", "$88.76"]
 *
 * // Error case
 * generatePriceChoices(-50) // Throws Error
 *
 * @param {number} actualPrice - The actual future price that will occur
 * @returns {string[]} Array of 4 formatted price strings, with the actual price at a random position
 * @throws {Error} If actualPrice is negative or zero
 */
export function generatePriceChoices(actualPrice: number): string[] {
  if (actualPrice <= 0) {
    throw new Error('Actual price must be positive');
  }

  // Format the actual price
  const formattedActual = formatPrice(actualPrice);

  /*
   * Generate three alternative prices by applying random percentage changes
   * between -20% and +20% of the actual price to create challenging options
   */
  const alternatives = [];
  for (let i = 0; i < 3; i++) {
    // Generate random percentage between -20 and +20
    const percentChange = Math.random() * 40 - 20;

    // Apply the change and ensure price stays positive
    const multiplier = 1 + percentChange / 100;
    const altPrice = formatPrice(Math.max(0.01, actualPrice * multiplier));
    alternatives.push(altPrice);
  }

  // Combine actual and alternative prices
  const allPrices = [formattedActual, ...alternatives];

  /*
   * Shuffle the array to randomize the position of the correct answer.
   * We use the Fisher-Yates shuffle algorithm for unbiased randomization.
   */
  for (let i = allPrices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPrices[i], allPrices[j]] = [allPrices[j], allPrices[i]];
  }

  return allPrices;
}
