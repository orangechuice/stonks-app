import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockDetail } from './StockDetail';
import { StockQuote } from '../types/stock';

const createMockQuote = (marketState: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST'): StockQuote => ({
  symbol: '^GSPC',
  shortName: 'S&P 500',
  longName: 'S&P 500 Index',
  exchangeName: 'SNP',
  currency: 'USD',
  regularMarketPrice: 7384.66,
  regularMarketChange: 68.74,
  regularMarketChangePercent: 0.94,
  previousClose: 7315.92,
  regularMarketOpen: 7320.00,
  regularMarketDayHigh: 7400.00,
  regularMarketDayLow: 7310.00,
  regularMarketVolume: 2000000,
  fiftyTwoWeekHigh: 7600.00,
  fiftyTwoWeekLow: 6000.00,
  sparkline: [7315.92, 7384.66],
  marketState,
});

describe('StockDetail UI Market State Attributes', () => {
  const defaultProps = {
    symbol: '^GSPC',
    chartData: [],
    selectedTimeframe: '1D' as const,
    onSelectTimeframe: vi.fn(),
    isLoading: false,
  };

  it('renders "Live" status badge and "Open" state when market is REGULAR', () => {
    const quote = createMockQuote('REGULAR');
    render(<StockDetail {...defaultProps} quote={quote} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0);
  });

  it('renders "At Close" status badge and "closed" state when market is CLOSED', () => {
    const quote = createMockQuote('CLOSED');
    render(<StockDetail {...defaultProps} quote={quote} />);
    expect(screen.getByText('At Close')).toBeInTheDocument();
    expect(screen.getByText('closed')).toBeInTheDocument();
  });
});
