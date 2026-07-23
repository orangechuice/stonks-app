import React, { useState, useEffect, useCallback } from 'react';
import { Titlebar } from './components/Titlebar';
import { Sidebar } from './components/Sidebar';
import { StockDetail } from './components/StockDetail';
import { SearchModal } from './components/SearchModal';
import { StockQuote, ChartDataPoint, Timeframe } from './types/stock';
import { fetchStockData } from './services/yahooFinanceApi';

declare global {
  interface Window {
    electronAPI?: {
      getSettings: () => Promise<{ watchlist?: string[] }>;
      saveSettings: (settings: { watchlist: string[] }) => Promise<boolean>;
    };
  }
}

const DEFAULT_SYMBOLS = ['^GSPC', 'AAPL', 'NVDA', 'GOOGL', 'MSFT', 'COIN', 'TSLA'];
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

  // Load Watchlist from Native Application Settings (Desktop) if available
  useEffect(() => {
    if (window.electronAPI?.getSettings) {
      window.electronAPI.getSettings().then((settings) => {
        if (settings && Array.isArray(settings.watchlist) && settings.watchlist.length > 0) {
          setWatchlistSymbols(settings.watchlist);
        }
      });
    }
  }, []);

  const [selectedSymbol, setSelectedSymbol] = useState<string>(watchlistSymbols[0] || '^GSPC');
  const [watchlistQuotes, setWatchlistQuotes] = useState<StockQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // Save Watchlist to Native App Settings & LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchlistSymbols));
    if (window.electronAPI?.saveSettings) {
      window.electronAPI.saveSettings({ watchlist: watchlistSymbols });
    }
  }, [watchlistSymbols]);

  // Load Watchlist Quotes
  const loadWatchlistData = useCallback(async () => {
    setIsRefreshing(true);
    const quotes: StockQuote[] = [];

    for (const sym of watchlistSymbols) {
      try {
        const { quote } = await fetchStockData(sym, '1D');
        quotes.push(quote);
      } catch (err) {
        console.error(`Error fetching quote for ${sym}:`, err);
      }
    }

    setWatchlistQuotes(quotes);
    setIsRefreshing(false);
  }, [watchlistSymbols]);

  // Load Detail Chart & Selected Stock Data
  const loadDetailData = useCallback(async (symbol: string, timeframe: Timeframe) => {
    setIsLoadingChart(true);
    try {
      const { quote, chart } = await fetchStockData(symbol, timeframe);
      setSelectedQuote(quote);
      setChartData(chart);
    } catch (err) {
      console.error(`Error loading detail for ${symbol}:`, err);
    }
    setIsLoadingChart(false);
  }, []);

  // Initial Load & Selected Symbol Changes
  useEffect(() => {
    loadWatchlistData();
  }, [loadWatchlistData]);

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

    if (selectedSymbol.toUpperCase() === cleanSym && nextList.length > 0) {
      setSelectedSymbol(nextList[0]);
    }
  };

  // Global Keyboard Shortcuts (Cmd+K or Ctrl+K opens Search Spotlight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0E0E10] text-white overflow-hidden font-sans">
      {/* Titlebar Header */}
      <Titlebar
        onRefresh={loadWatchlistData}
        isRefreshing={isRefreshing}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onOpenSearch={() => setIsSearchModalOpen(true)}
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
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
          />
        )}

        {/* Stock Detail & Chart View */}
        {selectedQuote ? (
          <StockDetail
            quote={selectedQuote}
            chartData={chartData}
            selectedTimeframe={selectedTimeframe}
            onSelectTimeframe={setSelectedTimeframe}
            isLoading={isLoadingChart}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
            Loading stock details...
          </div>
        )}
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
