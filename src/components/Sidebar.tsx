import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, X } from 'lucide-react';
import { StockQuote, SearchResult } from '../types/stock';
import { getColorShade, formatCurrency } from '../utils/colorUtils';
import { searchTickers } from '../services/yahooFinanceApi';

interface SidebarProps {
  watchlist: StockQuote[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onAddTicker: (symbol: string) => void;
  onRemoveTicker: (symbol: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  watchlist,
  selectedSymbol,
  onSelectSymbol,
  onAddTicker,
  onRemoveTicker,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchTickers(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (symbol: string) => {
    onAddTicker(symbol);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const topSymbol = searchResults[0]?.symbol || searchQuery.trim().toUpperCase();
      handleSelectSearchResult(topSymbol);
    }
  };

  return (
    <aside className="mac-sidebar">
      {/* Search Header */}
      <div className="sidebar-search-header">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search style={{ width: 14, height: 14, position: 'absolute', left: 10, top: 10, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search Tickers (e.g. NVDA, AAPL)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isSearchOpen) setIsSearchOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsSearchOpen(true)}
            className="sidebar-search-input"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={{ position: 'absolute', right: 10, top: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          ) : null}
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchOpen && (searchQuery.trim() || isSearching) && (
          <div style={{
            position: 'absolute',
            left: 12,
            right: 12,
            top: 54,
            backgroundColor: '#1C1C20',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            zIndex: 100,
            maxHeight: 280,
            overflowY: 'auto',
          }}>
            {isSearching ? (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                Searching market symbols...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => {
                const isAlreadyAdded = watchlist.some((w) => w.symbol.toUpperCase() === result.symbol.toUpperCase());
                return (
                  <button
                    key={result.symbol}
                    onClick={() => handleSelectSearchResult(result.symbol)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: '#FFF',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{result.symbol}</span>
                        {result.exchange && (
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>· {result.exchange}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        {result.shortname || result.longname}
                      </div>
                    </div>
                    {isAlreadyAdded ? (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        Added
                      </span>
                    ) : (
                      <Plus style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)' }} />
                    )}
                  </button>
                );
              })
            ) : (
              <div
                onClick={() => handleSelectSearchResult(searchQuery.trim().toUpperCase())}
                style={{ padding: 14, textAlign: 'center', fontSize: 12, color: '#30D158', cursor: 'pointer', fontWeight: 600 }}
              >
                Press Enter to add "{searchQuery.trim().toUpperCase()}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Header */}
      <div style={{
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <span>Watchlist ({watchlist.length})</span>
        <span>Market Closed</span>
      </div>

      {/* Watchlist Item Cards */}
      <div className="sidebar-item-list custom-scrollbar">
        {watchlist.map((stock) => {
          const isSelected = stock.symbol.toUpperCase() === selectedSymbol.toUpperCase();
          const shade = getColorShade(stock.regularMarketChangePercent);
          const isPositive = stock.regularMarketChangePercent >= 0;

          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectSymbol(stock.symbol)}
              className={`watchlist-card ${isSelected ? 'selected' : ''}`}
            >
              {/* Left Column: Symbol & Short Name */}
              <div className="symbol-info">
                <div className="symbol-ticker">{stock.symbol}</div>
                <div className="symbol-name">{stock.shortName || stock.longName || stock.symbol}</div>
              </div>

              {/* Middle Mini Sparkline SVG */}
              <div className="symbol-sparkline">
                {stock.sparkline && stock.sparkline.length > 1 ? (
                  <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 100 40">
                    {(() => {
                      const pts = stock.sparkline;
                      const min = Math.min(...pts);
                      const max = Math.max(...pts);
                      const range = max - min || 1;
                      const coords = pts.map((val, idx) => {
                        const x = (idx / (pts.length - 1)) * 100;
                        const y = 35 - ((val - min) / range) * 30;
                        return `${x},${y}`;
                      });
                      return (
                        <polyline
                          fill="none"
                          stroke={shade.strokeColor}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={coords.join(' ')}
                        />
                      );
                    })()}
                  </svg>
                ) : null}
              </div>

              {/* Right Column: Price & Dynamic Color Change Badge */}
              <div className="symbol-price-col">
                <div className="symbol-price">{formatCurrency(stock.regularMarketPrice, stock.currency)}</div>

                {/* DYNAMIC SHADED BADGE */}
                <div
                  style={{
                    backgroundColor: shade.bgColor,
                    color: shade.textColor,
                    borderColor: shade.borderColor,
                    boxShadow: shade.glowColor !== 'transparent' ? `0 0 12px ${shade.glowColor}` : 'none',
                  }}
                  className="change-badge"
                  title={`Change: ${stock.regularMarketChange > 0 ? '+' : ''}${stock.regularMarketChange} (${stock.regularMarketChangePercent}%)`}
                >
                  {isPositive ? '+' : ''}
                  {stock.regularMarketChangePercent.toFixed(2)}%
                </div>
              </div>

              {/* Delete Button */}
              {watchlist.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTicker(stock.symbol);
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    padding: '3px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  title="Remove Ticker"
                >
                  <Trash2 style={{ width: 11, height: 11 }} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
