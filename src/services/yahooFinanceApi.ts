import { StockQuote, ChartDataPoint, Timeframe, SearchResult, CustomDateRange } from '../types/stock';

// Preset mock data generator for offline/resilient fallback
const POPULAR_SYMBOLS_DB: SearchResult[] = [
  { symbol: '^GSPC', shortname: 'S&P 500 Index', exchange: 'SNP', quoteType: 'INDEX' },
  { symbol: '^IXIC', shortname: 'NASDAQ Composite', exchange: 'NASDAQ', quoteType: 'INDEX' },
  { symbol: '^DJI', shortname: 'Dow Jones Industrial Average', exchange: 'INDEX', quoteType: 'INDEX' },
  { symbol: 'AAPL', shortname: 'Apple Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'NVDA', shortname: 'NVIDIA Corporation', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'GOOGL', shortname: 'Alphabet Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'MSFT', shortname: 'Microsoft Corporation', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'AMZN', shortname: 'Amazon.com, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'TSLA', shortname: 'Tesla, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'META', shortname: 'Meta Platforms, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'COIN', shortname: 'Coinbase Global, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'AMD', shortname: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'INTC', shortname: 'Intel Corporation', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'NFLX', shortname: 'Netflix, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'PLTR', shortname: 'Palantir Technologies Inc.', exchange: 'NYSE', quoteType: 'EQUITY' },
  { symbol: 'SPY', shortname: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', quoteType: 'ETF' },
  { symbol: 'QQQ', shortname: 'Invesco QQQ Trust', exchange: 'NASDAQ', quoteType: 'ETF' },
  { symbol: 'DIS', shortname: 'The Walt Disney Company', exchange: 'NYSE', quoteType: 'EQUITY' },
  { symbol: 'PYPL', shortname: 'PayPal Holdings, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'CRM', shortname: 'Salesforce, Inc.', exchange: 'NYSE', quoteType: 'EQUITY' },
  { symbol: 'UBER', shortname: 'Uber Technologies, Inc.', exchange: 'NYSE', quoteType: 'EQUITY' },
  { symbol: 'BABA', shortname: 'Alibaba Group Holding Limited', exchange: 'NYSE', quoteType: 'EQUITY' },
  { symbol: 'ARM', shortname: 'Arm Holdings plc', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'SMCI', shortname: 'Super Micro Computer, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'BTC-USD', shortname: 'Bitcoin USD', exchange: 'CCC', quoteType: 'CRYPTOCURRENCY' },
  { symbol: 'ETH-USD', shortname: 'Ethereum USD', exchange: 'CCC', quoteType: 'CRYPTOCURRENCY' },
];

function resolveMarketCap(symbol: string, metaCap?: number): number | undefined {
  const symUpper = symbol.toUpperCase();
  // Index funds & main index ETFs do not display market cap
  if (symUpper.startsWith('^') || symUpper === 'SPY' || symUpper === 'QQQ' || symUpper === 'IWM' || symUpper === 'DIA') {
    return undefined;
  }
  if (metaCap && metaCap > 0) return metaCap;
  return undefined;
}

function downsamplePrices(prices: number[], targetPoints: number = 30): number[] {
  if (!prices || prices.length === 0) return [];
  if (prices.length <= targetPoints) return [...prices];

  const result: number[] = [];
  const step = (prices.length - 1) / (targetPoints - 1);
  for (let i = 0; i < targetPoints; i++) {
    const index = Math.round(i * step);
    result.push(prices[index]);
  }
  result[0] = prices[0];
  result[result.length - 1] = prices[prices.length - 1];
  return result;
}

const TIMEFRAME_CONFIG: Record<Timeframe, { range: string; interval: string }> = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  'YTD': { range: 'ytd', interval: '1d' },
  '1Y': { range: '1y', interval: '1wk' },
  '5Y': { range: '5y', interval: '1mo' },
  'ALL': { range: 'max', interval: '1mo' },
  'CUSTOM': { range: '1d', interval: '5m' },
};

async function fetchYahooApi(url: string) {
  // 1. Desktop app: fetch natively via Electron main process IPC handler (secure, bypasses browser CORS)
  if (window.electronAPI?.fetchStockApi) {
    const data = await window.electronAPI.fetchStockApi(url);
    if (data) return data;
  }

  // 2. Browser web mode fallback (direct fetch)
  try {
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    // Direct fetch failed (CORS error in browser)
  }

  // 3. Try primary CORS proxy (corsproxy.io)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) return await proxyRes.json();
  } catch (proxyError) {
    // Primary proxy failed
  }

  // 4. Try secondary CORS proxy (api.allorigins.win)
  try {
    const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const proxyRes2 = await fetch(proxyUrl2);
    if (proxyRes2.ok) return await proxyRes2.json();
  } catch (proxyError2) {
    console.warn('All CORS proxies failed for URL:', url, proxyError2);
  }

  return null;
}

const EQUITY_FUNDAMENTALS: Record<string, { shares?: number; eps?: number }> = {
  AAPL: { shares: 15.116e9, eps: 6.85 },
  NVDA: { shares: 24.20e9, eps: 3.25 },
  MSFT: { shares: 7.43e9, eps: 12.80 },
  GOOGL: { shares: 12.12e9, eps: 7.50 },
  AMZN: { shares: 10.52e9, eps: 4.80 },
  TSLA: { shares: 3.19e9, eps: 2.40 },
  META: { shares: 2.53e9, eps: 21.20 },
  AMD: { shares: 1.62e9, eps: 2.10 },
  INTC: { shares: 4.28e9, eps: 0.85 },
  NFLX: { shares: 4.28e8, eps: 19.80 },
  PLTR: { shares: 2.24e9, eps: 0.45 },
  COIN: { shares: 2.48e8, eps: 4.20 },
  DIS: { shares: 1.82e9, eps: 4.90 },
  PYPL: { shares: 1.01e9, eps: 4.10 },
  CRM: { shares: 9.65e8, eps: 9.80 },
  UBER: { shares: 2.07e9, eps: 2.15 },
  BABA: { shares: 2.38e9, eps: 7.60 },
  ARM: { shares: 1.04e9, eps: 0.95 },
  SMCI: { shares: 5.85e7, eps: 22.10 },
  'BTC-USD': { shares: 19.7e6 },
  'ETH-USD': { shares: 120.2e6 },
};

async function fetchQuoteDetails(symbol: string, currentPrice: number, isCustom?: boolean): Promise<{ marketCap?: number; peRatio?: number }> {
  const symUpper = symbol.toUpperCase();

  // Index funds & main index ETFs do not display market cap or PE
  if (symUpper.startsWith('^') || symUpper === 'SPY' || symUpper === 'QQQ' || symUpper === 'IWM' || symUpper === 'DIA') {
    return { marketCap: undefined, peRatio: undefined };
  }

  let marketCap: number | undefined;
  let peRatio: number | undefined;

  const f = EQUITY_FUNDAMENTALS[symUpper];

  // If isCustom is true, compute Market Cap & P/E for the last day of the custom range
  if (isCustom && f?.shares && currentPrice > 0) {
    marketCap = currentPrice * f.shares;
    if (f.eps) peRatio = currentPrice / f.eps;
    return { marketCap, peRatio };
  }

  // 1. In Electron Desktop App, query Nasdaq APIs for live Market Cap and trailing P/E
  if (window.electronAPI?.fetchStockApi) {
    try {
      const summaryUrl = `https://api.nasdaq.com/api/quote/${encodeURIComponent(symUpper)}/summary?assetclass=stocks`;
      const res = await fetchYahooApi(summaryUrl);
      const capStr = res?.data?.summaryData?.MarketCap?.value;
      if (capStr && capStr !== 'N/A') {
        const parsedCap = parseFloat(capStr.replace(/,/g, ''));
        if (!isNaN(parsedCap) && parsedCap > 0) {
          marketCap = parsedCap;
        }
      }
    } catch (e) {
      // Ignore error
    }

    try {
      const epsUrl = `https://api.nasdaq.com/api/quote/${encodeURIComponent(symUpper)}/eps?assetclass=stocks`;
      const epsJson = await fetchYahooApi(epsUrl);
      const list = epsJson?.data?.earningsPerShare;
      if (Array.isArray(list) && list.length >= 4) {
        const trailingEps = list.slice(0, 4).reduce((acc: number, curr: any) => acc + (typeof curr.earnings === 'number' ? curr.earnings : 0), 0);
        if (trailingEps > 0 && currentPrice > 0) {
          peRatio = currentPrice / trailingEps;
        }
      }
    } catch (e) {
      // Ignore error
    }
  }

  // 2. Fallback database calculation (dynamic based on live current price)
  if (!marketCap && f?.shares && currentPrice > 0) {
    marketCap = currentPrice * f.shares;
  }
  if (!peRatio && f?.eps && currentPrice > 0) {
    peRatio = currentPrice / f.eps;
  }

  return { marketCap, peRatio };
}

interface StockCacheEntry {
  data: { quote: StockQuote; chart: ChartDataPoint[] };
  timestamp: number;
}

const stockDataCache = new Map<string, StockCacheEntry>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export function clearStockCache(): void {
  stockDataCache.clear();
}

export async function fetchStockData(
  symbol: string,
  timeframe: Timeframe = '1D',
  customRange?: CustomDateRange,
  forceRefresh: boolean = false,
  includeDetails: boolean = true
): Promise<{ quote: StockQuote; chart: ChartDataPoint[] } | null> {
  const cleanSymbol = symbol.toUpperCase();
  const cacheKey = `${cleanSymbol}_${timeframe}_${customRange?.startDate || ''}_${customRange?.endDate || ''}_${includeDetails ? 'det' : 'basic'}`;

  if (!forceRefresh) {
    const cached = stockDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const targetSymbol = encodeURIComponent(cleanSymbol);
  let url = '';
  const isCustom = timeframe === 'CUSTOM' && !!customRange?.startDate && !!customRange?.endDate;
  let customDiffDays = 0;

  if (isCustom && customRange) {
    const startObj = new Date(`${customRange.startDate}T00:00:00`);
    const endObj = new Date(`${customRange.endDate}T23:59:59`);
    const p1 = Math.floor(startObj.getTime() / 1000);
    const p2 = Math.floor(endObj.getTime() / 1000);
    customDiffDays = Math.max(1, Math.ceil((p2 - p1) / 86400));

    let interval = '5m';
    if (customDiffDays <= 3) interval = '5m';
    else if (customDiffDays <= 14) interval = '15m';
    else if (customDiffDays <= 60) interval = '1h';
    else if (customDiffDays <= 365) interval = '1d';
    else interval = '1wk';

    url = `https://query1.finance.yahoo.com/v8/finance/chart/${targetSymbol}?period1=${p1}&period2=${p2}&interval=${interval}&includePrePost=false`;
  } else {
    const { range, interval } = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG['1D'];
    url = `https://query1.finance.yahoo.com/v8/finance/chart/${targetSymbol}?range=${range}&interval=${interval}&includePrePost=false`;
  }

  const json = await fetchYahooApi(url);

  if (json && json.chart && json.chart.result && json.chart.result.length > 0) {
    const result = json.chart.result[0];
    const meta = result.meta || {};
    const timestamps: number[] = result.timestamp || [];
    const quoteData = result.indicators?.quote?.[0] || {};
    const closes: (number | null)[] = quoteData.close || [];
    const opens: (number | null)[] = quoteData.open || [];
    const highs: (number | null)[] = quoteData.high || [];
    const lows: (number | null)[] = quoteData.low || [];
    const volumes: (number | null)[] = quoteData.volume || [];

    const chartPoints: ChartDataPoint[] = [];
    const validPrices: number[] = [];

    timestamps.forEach((t, idx) => {
      const c = closes[idx];
      if (c !== null && c !== undefined && !isNaN(c)) {
        const dateObj = new Date(t * 1000);
        let dateStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (isCustom) {
          if (customDiffDays <= 1) {
            dateStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (customDiffDays <= 7) {
            dateStr = `${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          } else {
            dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
          }
        } else if (timeframe !== '1D') {
          dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: timeframe === '5Y' || timeframe === 'ALL' ? '2-digit' : undefined });
        }

        chartPoints.push({
          timestamp: t,
          dateStr,
          close: Number(c.toFixed(2)),
          open: opens[idx] ? Number(opens[idx]?.toFixed(2)) : Number(c.toFixed(2)),
          high: highs[idx] ? Number(highs[idx]?.toFixed(2)) : Number(c.toFixed(2)),
          low: lows[idx] ? Number(lows[idx]?.toFixed(2)) : Number(c.toFixed(2)),
          volume: volumes[idx] || 0,
        });
        validPrices.push(c);
      }
    });

    const lastPointPrice = validPrices[validPrices.length - 1];
    const currentPrice = (isCustom && lastPointPrice) ? lastPointPrice : (meta.regularMarketPrice || lastPointPrice || 100);
    const previousClose = (isCustom || timeframe !== '1D')
      ? (chartPoints[0]?.open || validPrices[0] || meta.chartPreviousClose || meta.previousClose || currentPrice)
      : (meta.chartPreviousClose || meta.previousClose || validPrices[0] || currentPrice);

    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const quoteDetails = includeDetails
      ? await fetchQuoteDetails(symbol, currentPrice, isCustom)
      : { marketCap: undefined, peRatio: undefined };

    const quote: StockQuote = {
      symbol: meta.symbol || symbol.toUpperCase(),
      shortName: meta.shortName || meta.longName || symbol.toUpperCase(),
      longName: meta.longName || meta.shortName || symbol.toUpperCase(),
      exchangeName: meta.exchangeName || 'US',
      currency: meta.currency || 'USD',
      regularMarketPrice: Number(currentPrice.toFixed(2)),
      regularMarketChange: Number(change.toFixed(2)),
      regularMarketChangePercent: Number(changePercent.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      regularMarketOpen: meta.regularMarketOpen || chartPoints[0]?.open || currentPrice,
      regularMarketDayHigh: meta.regularMarketDayHigh || Math.max(...validPrices, currentPrice),
      regularMarketDayLow: meta.regularMarketDayLow || Math.min(...validPrices, currentPrice),
      regularMarketVolume: meta.regularMarketVolume || meta.volume || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || currentPrice * 1.15,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || currentPrice * 0.85,
      marketCap: resolveMarketCap(symbol, quoteDetails.marketCap ?? meta.marketCap),
      peRatio: quoteDetails.peRatio ?? meta.trailingPE ?? meta.peRatio,
      sparkline: downsamplePrices(validPrices, 30),
      marketState: meta.marketState || 'CLOSED',
    };

    const stockData = { quote, chart: chartPoints };
    stockDataCache.set(cacheKey, { data: stockData, timestamp: Date.now() });

    return stockData;
  }

  // Return null when unable to fetch live data (offline or API error)
  return null;
}

export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  
  const cleanSym = query.trim().toUpperCase();
  const q = encodeURIComponent(query.trim());
  
  // 1. Primary Yahoo Finance search API (query2 v1)
  const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${q}&quotesCount=8&newsCount=0&enableFuzzyQuery=true`;
  const json = await fetchYahooApi(searchUrl);

  if (json && json.quotes && Array.isArray(json.quotes) && json.quotes.length > 0) {
    const results = json.quotes
      .filter((q: any) => q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'INDEX' || q.quoteType === 'ETF' || q.quoteType === 'CRYPTOCURRENCY'))
      .map((q: any) => ({
        symbol: q.symbol,
        shortname: q.shortname || q.longname || q.symbol,
        longname: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || q.dispExchange || '',
        quoteType: q.quoteType,
        typeDisp: q.typeDisp || q.quoteType,
      }));
    if (results.length > 0) return results;
  }

  // 2. Exact ticker symbol validation via Chart API if query looks like a ticker symbol (1-8 chars, no spaces)
  if (cleanSym.length >= 1 && cleanSym.length <= 8 && !/\s/.test(cleanSym)) {
    try {
      const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanSym)}?range=1d&interval=5m`;
      const chartJson = await fetchYahooApi(chartUrl);
      const meta = chartJson?.chart?.result?.[0]?.meta;
      if (meta && meta.symbol) {
        return [{
          symbol: meta.symbol,
          shortname: meta.shortName || meta.longName || meta.symbol,
          longname: meta.longName || meta.shortName || meta.symbol,
          exchange: meta.exchangeName || 'US',
          quoteType: meta.instrumentType || 'EQUITY',
          typeDisp: meta.instrumentType || 'Equity',
        }];
      }
    } catch (err) {
      console.warn('Ticker validation fallback failed:', err);
    }
  }

  // 3. Local matching search fallback for offline mode
  const cleanQ = query.trim().toLowerCase();
  return POPULAR_SYMBOLS_DB.filter(
    item => item.symbol.toLowerCase().includes(cleanQ) || 
            item.shortname?.toLowerCase().includes(cleanQ)
  );
}
