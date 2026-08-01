import React from 'react';
import { StockQuote, ChartDataPoint, Timeframe, CustomDateRange } from '../types/stock';
import { getColorShade, formatCurrency, formatCompactNumber, formatNumber, formatPercent } from '../utils/colorUtils';
import { StockChart } from './StockChart';
import { AlertTriangle } from 'lucide-react';

interface StockDetailProps {
  symbol: string;
  quote: StockQuote | null;
  chartData: ChartDataPoint[];
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  isLoading: boolean;
  customRange?: CustomDateRange;
  onApplyCustomRange?: (range: CustomDateRange) => void;
  isRateLimited?: boolean;
}

export const StockDetail: React.FC<StockDetailProps> = ({
  symbol,
  quote,
  chartData,
  selectedTimeframe,
  onSelectTimeframe,
  isLoading,
  customRange,
  onApplyCustomRange,
  isRateLimited = false,
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

  // Determine Extended Hours (After Hours / Pre-Market) values
  let extPrice: number | undefined;
  let extChangePercent: number | undefined;
  let extIsPositive = false;
  let extLabel = '';

  if (quote?.postMarketPrice && (quote.marketState === 'POST' || quote.marketState === 'CLOSED' || quote.marketState === 'POSTPOST' || !quote.marketState)) {
    extPrice = quote.postMarketPrice;
    extChangePercent = quote.postMarketChangePercent ?? 0;
    extIsPositive = extChangePercent >= 0;
    extLabel = 'After Hours';
  } else if (quote?.preMarketPrice && quote.marketState === 'PRE') {
    extPrice = quote.preMarketPrice;
    extChangePercent = quote.preMarketChangePercent ?? 0;
    extIsPositive = extChangePercent >= 0;
    extLabel = 'Pre-Market';
  }

  const extShade = extChangePercent != null ? getColorShade(extChangePercent) : null;

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
            <span style={{ textTransform: 'capitalize' }}>
              {quote?.marketState ? (quote.marketState === 'REGULAR' ? 'Open' : quote.marketState.toLowerCase()) : 'Offline'}
            </span>
          </div>
        </div>

        {/* Dual Price Display: Regular Market & Extended Hours */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Regular Market Price & Badge */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: '#FFF' }}>
                {quote ? formatCurrency(quote.regularMarketPrice, quote.currency) : '--'}
              </span>
              {quote && (
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    backgroundColor: shade.bgColor,
                    color: shade.textColor,
                    border: `1px solid ${shade.borderColor}`,
                    boxShadow: shade.glowColor !== 'transparent' ? `0 0 12px ${shade.glowColor}` : 'none',
                  }}
                >
                  {formatPercent(quote.regularMarketChangePercent)}
                </div>
              )}
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: quote?.marketState === 'REGULAR' ? '#30D158' : 'rgba(255, 255, 255, 0.4)',
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              justifyContent: 'flex-end',
            }}>
              {quote?.marketState === 'REGULAR' && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#30D158', display: 'inline-block' }} />
              )}
              {quote?.marketState === 'REGULAR' ? 'Live' : 'At Close'}
            </div>
          </div>

          {/* After Hours / Pre-Market Price & Badge */}
          {extPrice != null && extShade && extChangePercent != null && (
            <div style={{
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              paddingLeft: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: '#FFF' }}>
                  {formatCurrency(extPrice, quote?.currency)}
                </span>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    backgroundColor: extShade.bgColor,
                    color: extShade.textColor,
                    border: `1px solid ${extShade.borderColor}`,
                    boxShadow: extShade.glowColor !== 'transparent' ? `0 0 12px ${extShade.glowColor}` : 'none',
                  }}
                >
                  {formatPercent(extChangePercent)}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)', marginTop: 3 }}>
                {extLabel}
              </div>
            </div>
          )}
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
          customRange={customRange}
          onApplyCustomRange={onApplyCustomRange}
          isRateLimited={isRateLimited}
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
              {quote?.peRatio ? formatNumber(quote.peRatio, 2) : '--'}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
