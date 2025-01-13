import { formatPrice, generatePriceChoices } from '../utils/priceUtils';

describe('formatPrice', () => {
  it('formats price with 2 decimal places', () => {
    expect(formatPrice(1234.5678)).toBe('$1,234.57');
    expect(formatPrice(1000)).toBe('$1,000.00');
    expect(formatPrice(0.1)).toBe('$0.10');
  });

  it('handles zero and negative numbers', () => {
    expect(formatPrice(0)).toBe('$0.00');
    expect(formatPrice(-1234.56)).toBe('-$1,234.56');
  });
});

describe('generatePriceChoices', () => {
  it('generates 4 unique price choices', () => {
    const actualPrice = 1000;
    const choices = generatePriceChoices(actualPrice);

    expect(choices.length).toBe(4);
    // Check all choices are unique
    const uniqueChoices = new Set(choices);
    expect(uniqueChoices.size).toBe(4);
  });

  it('includes the actual price in the choices', () => {
    const actualPrice = 1000;
    const choices = generatePriceChoices(actualPrice);
    const formattedActual = formatPrice(actualPrice);

    expect(choices).toContain(formattedActual);
  });

  it('generates reasonable price variations', () => {
    const actualPrice = 1000;
    const choices = generatePriceChoices(actualPrice);

    choices.forEach((choice) => {
      const price = parseFloat(choice.replace(/[$,]/g, ''));
      // Check that variations are within expected range (±5%)
      expect(Math.abs((price - actualPrice) / actualPrice)).toBeLessThanOrEqual(0.05);
    });
  });
});
