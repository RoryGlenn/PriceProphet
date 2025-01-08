import { Time } from 'lightweight-charts';

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

export interface OhlcBar {
  time: Time;  // Use the Time type from lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OhlcRow {
  timestamp: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
}
