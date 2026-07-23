import React, { useState, useEffect, useCallback } from 'react';
import { Titlebar } from './components/Titlebar';
import { Sidebar } from './components/Sidebar';
import { StockDetail } from './components/StockDetail';
import { SearchModal } from './components/SearchModal';
import { StockQuote, ChartDataPoint, Timeframe, BadgeDisplayMode } from './types/stock';
import { fetchStockData } from './services/yahooFinanceApi';

const DEFAULT_SYMBOLS = ['^GSPC', '^IXIC', '^DJI', 'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'];
const LOCAL_STORAGE_KEY = 'mac_stock_app_watchlist';

export const App: React.FC = () => {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage', e);
    }
    return DEFAULT_SYMBOLS;
  });

  // Load Watchlist & Settings from Native Application Settings (Desktop) if available
  useEffect(() => {
    if (window.electronAPI?.getSettings) {
      window.electronAPI.getSettings().then((settings) => {
        if (settings) {
          if (Array.isArray(settings.watchlist) && settings.watchlist.length > 0) {
            setWatchlistSymbols(settings.watchlist);
          }
          if (settings.badgeDisplayMode && (settings.badgeDisplayMode === 'percent' || settings.badgeDisplayMode === 'priceChange' || settings.badgeDisplayMode === 'marketCap')) {
            setBadgeDisplayMode(settings.badgeDisplayMode);
          }
        }
      });
    }
  }, []);

  const [selectedSymbol, setSelectedSymbol] = useState<string>(watchlistSymbols[0] || '^GSPC');
  const [watchlistQuotes, setWatchlistQuotes] = useState<StockQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  
  const [badgeDisplayMode, setBadgeDisplayMode] = useState<BadgeDisplayMode>(() => {
    try {
      const saved = localStorage.getItem('mac_stock_app_badge_mode');
      if (saved && (saved === 'percent' || saved === 'priceChange' || saved === 'marketCap')) {
        return saved as BadgeDisplayMode;
      }
    } catch (e) {}
    return 'percent';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // Save Watchlist & Badge Display Mode to Native App Settings & LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchlistSymbols));
    localStorage.setItem('mac_stock_app_badge_mode', badgeDisplayMode);
    if (window.electronAPI?.saveSettings) {
      window.electronAPI.saveSettings({ watchlist: watchlistSymbols, badgeDisplayMode });
    }
  }, [watchlistSymbols, badgeDisplayMode]);

  const handleToggleBadgeDisplayMode = () => {
    setBadgeDisplayMode((prev) => {
      if (prev === 'percent') return 'priceChange';
      if (prev === 'priceChange') return 'marketCap';
      return 'percent';
    });
  };

  // Load Watchlist Quotes for the active timeframe
  const loadWatchlistData = useCallback(async (timeframe: Timeframe = selectedTimeframe) => {
    setIsRefreshing(true);
    try {
      const results = await Promise.all(
        watchlistSymbols.map((sym) => fetchStockData(sym, timeframe).catch(() => null))
      );
      const quotes: StockQuote[] = results.map((res, idx) => {
        if (res) return res.quote;
        const sym = watchlistSymbols[idx];
        return {
          symbol: sym,
          shortName: sym,
          exchangeName: 'US Market',
          currency: 'USD',
          regularMarketPrice: 0,
          regularMarketChange: 0,
          regularMarketChangePercent: 0,
          previousClose: 0,
          regularMarketOpen: 0,
          regularMarketDayHigh: 0,
          regularMarketDayLow: 0,
          regularMarketVolume: 0,
          fiftyTwoWeekHigh: 0,
          fiftyTwoWeekLow: 0,
          sparkline: [],
          marketState: 'OFFLINE',
          isOffline: true,
        };
      });
      setWatchlistQuotes(quotes);
    } catch (err) {
      console.error('Error fetching watchlist quotes:', err);
    }
    setIsRefreshing(false);
  }, [watchlistSymbols, selectedTimeframe]);

  // Load Detail Chart & Selected Stock Data
  const loadDetailData = useCallback(async (symbol: string, timeframe: Timeframe) => {
    setIsLoadingChart(true);
    try {
      const res = await fetchStockData(symbol, timeframe);
      if (res) {
        setSelectedQuote(res.quote);
        setChartData(res.chart);
      } else {
        setSelectedQuote(null);
        setChartData([]);
      }
    } catch (err) {
      console.error(`Error loading detail for ${symbol}:`, err);
      setSelectedQuote(null);
      setChartData([]);
    }
    setIsLoadingChart(false);
  }, []);

  // Sync Watchlist & Detail Data whenever Selected Symbol or Timeframe changes
  useEffect(() => {
    loadWatchlistData(selectedTimeframe);
  }, [selectedTimeframe, watchlistSymbols, loadWatchlistData]);

  useEffect(() => {
    if (selectedSymbol) {
      loadDetailData(selectedSymbol, selectedTimeframe);
    }
  }, [selectedSymbol, selectedTimeframe, loadDetailData]);

  // Add ticker to watchlist
  const handleAddTicker = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase();
    if (!watchlistSymbols.includes(cleanSym)) {
      setWatchlistSymbols((prev) => [...prev, cleanSym]);
    }
    setSelectedSymbol(cleanSym);
  };

  // Remove ticker from watchlist
  const handleRemoveTicker = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase();
    const nextList = watchlistSymbols.filter((s) => s.toUpperCase() !== cleanSym);
    setWatchlistSymbols(nextList);

    if (selectedSymbol.toUpperCase() === cleanSym) {
      setSelectedSymbol(nextList[0] || '');
    }
  };

  // Reorder ticker in watchlist
  const handleReorderWatchlist = (draggedIndex: number, targetIndex: number) => {
    setWatchlistSymbols((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, removed);
      return updated;
    });
  };

  // Global Keyboard Shortcuts (Cmd+K or Ctrl+K opens Sidebar Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSidebarOpen(true);
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', overflow: 'hidden' }}>
      {/* Title Bar */}
      <Titlebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onRefresh={() => {
          loadWatchlistData(selectedTimeframe);
          if (selectedSymbol) loadDetailData(selectedSymbol, selectedTimeframe);
        }}
        isRefreshing={isRefreshing}
      />

      {/* Main App Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Watchlist Sidebar */}
        {isSidebarOpen && (
          <Sidebar
            watchlist={watchlistQuotes}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            onAddTicker={handleAddTicker}
            onRemoveTicker={handleRemoveTicker}
            onReorderWatchlist={handleReorderWatchlist}
            badgeDisplayMode={badgeDisplayMode}
            onToggleBadgeDisplayMode={handleToggleBadgeDisplayMode}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            selectedTimeframe={selectedTimeframe}
          />
        )}

        {/* Stock Detail & Chart View */}
        <StockDetail
          symbol={selectedSymbol}
          quote={selectedQuote}
          chartData={chartData}
          selectedTimeframe={selectedTimeframe}
          onSelectTimeframe={setSelectedTimeframe}
          isLoading={isLoadingChart}
        />
      </div>

      {/* Spotlight Command Palette Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddTicker={handleAddTicker}
        watchlist={watchlistQuotes}
      />
    </div>
  );
};

export default App;
