import React from 'react';
import { StockQuote, ChartDataPoint, Timeframe } from '../types/stock';
import { getColorShade, formatCurrency, formatCompactNumber } from '../utils/colorUtils';
import { StockChart } from './StockChart';

interface StockDetailProps {
  symbol: string;
  quote: StockQuote | null;
  chartData: ChartDataPoint[];
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  isLoading: boolean;
}

export const StockDetail: React.FC<StockDetailProps> = ({
  symbol,
  quote,
  chartData,
  selectedTimeframe,
  onSelectTimeframe,
  isLoading,
}) => {
  const shade = quote ? getColorShade(quote.regularMarketChangePercent) : {
    bgColor: 'rgba(255, 255, 255, 0.08)',
    textColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    glowColor: 'transparent',
  };
  const isPositive = quote ? quote.regularMarketChangePercent >= 0 : false;

  const displaySymbol = quote?.symbol || symbol.toUpperCase();
  const displayShortName = quote?.shortName || quote?.longName || '';

  return (
    <main style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#121214',
      padding: '24px 32px',
      color: '#FFF',
      userSelect: 'none',
      zIndex: 10,
    }} className="custom-scrollbar">
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>{displaySymbol}</h1>
            {displayShortName && (
              <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)' }}>{displayShortName}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{quote?.exchangeName || 'US Market'}</span>
            <span>·</span>
            <span>{quote?.currency || 'USD'}</span>
            <span>·</span>
            <span style={{ textTransform: 'capitalize' }}>{quote?.marketState || 'Offline'}</span>
          </div>
        </div>

        {/* Big Price & Dynamic Change Badge */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: '#FFF' }}>
            {quote ? formatCurrency(quote.regularMarketPrice, quote.currency) : '--'}
          </div>

          {/* DYNAMIC SHADED CHANGE BADGE */}
          <div
            style={{
              marginTop: 6,
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              backgroundColor: shade.bgColor,
              color: shade.textColor,
              borderColor: shade.borderColor,
              borderWidth: 1,
              borderStyle: 'solid',
              boxShadow: shade.glowColor !== 'transparent' ? `0 0 16px ${shade.glowColor}` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {quote ? (
              <>
                {isPositive ? '+' : ''}
                {quote.regularMarketChange.toFixed(2)} ({isPositive ? '+' : ''}
                {quote.regularMarketChangePercent.toFixed(2)}%)
              </>
            ) : (
              '--'
            )}
          </div>
        </div>
      </div>

      {/* Main Stock Chart Section */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}>
        <StockChart
          quote={quote}
          chartData={chartData}
          selectedTimeframe={selectedTimeframe}
          onSelectTimeframe={onSelectTimeframe}
          isLoading={isLoading}
        />
      </div>

      {/* Key Statistics Grid */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24,
      }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Key Statistics
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px 24px',
        }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>Open</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote ? formatCurrency(quote.regularMarketOpen) : '--'}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>High</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote ? formatCurrency(quote.regularMarketDayHigh) : '--'}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>Low</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote ? formatCurrency(quote.regularMarketDayLow) : '--'}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>Volume</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote ? formatCompactNumber(quote.regularMarketVolume) : '--'}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>52W High</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote ? formatCurrency(quote.fiftyTwoWeekHigh) : '--'}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>52W Low</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote ? formatCurrency(quote.fiftyTwoWeekLow) : '--'}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>Market Cap</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote ? formatCompactNumber(quote.marketCap) : '--'}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>P/E Ratio</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#FFF' }}>
              {quote?.peRatio ? quote.peRatio.toFixed(2) : '--'}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
