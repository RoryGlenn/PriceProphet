export interface OhlcData {
  time: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
}

export interface RandomOhlcConfig {
  daysNeeded: number;
  startPrice: number;
  volatility: number;
  drift: number;
}
