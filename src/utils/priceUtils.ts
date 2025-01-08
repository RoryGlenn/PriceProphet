export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const generatePriceChoices = (actualPrice: number, count: number = 4): string[] => {
  const variance = actualPrice * 0.1; // 10% variance
  const choices: string[] = [formatPrice(actualPrice)];
  
  while (choices.length < count) {
    const randomVariance = (Math.random() - 0.5) * 2 * variance;
    const fakePrice = actualPrice + randomVariance;
    const formattedPrice = formatPrice(fakePrice);
    
    if (!choices.includes(formattedPrice)) {
      choices.push(formattedPrice);
    }
  }
  
  // Shuffle the choices
  return choices.sort(() => Math.random() - 0.5);
}; 