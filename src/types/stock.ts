export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL';
export type BadgeDisplayMode = 'percent' | 'priceChange' | 'marketCap';

export interface ChartDataPoint {
  timestamp: number;
  dateStr: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface StockQuote {
  symbol: string;
  shortName: string;
  longName?: string;
  exchangeName?: string;
  currency?: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  previousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap?: number;
  peRatio?: number;
  avgVolume?: number;
  sparkline: number[];
  marketState?: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST';
}

export interface SearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
  typeDisp?: string;
}

export interface ColorShade {
  bgColor: string;
  textColor: string;
  borderColor: string;
  strokeColor: string;
  fillGradientStart: string;
  fillGradientEnd: string;
  glowColor: string;
  intensity: number;
  isPositive: boolean;
}

declare global {
  interface Window {
    electronAPI?: {
      getSettings: () => Promise<{ watchlist?: string[] }>;
      saveSettings: (settings: { watchlist: string[] }) => Promise<boolean>;
      closeWindow: () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
    };
  }
}
