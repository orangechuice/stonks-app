import { StockQuote, ChartDataPoint, Timeframe, SearchResult } from '../types/stock';

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
};

async function fetchYahooApi(url: string) {
  try {
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const proxyRes = await fetch(proxyUrl);
      if (proxyRes.ok) return await proxyRes.json();
    } catch (proxyError) {
      console.warn('Proxy fetch failed for URL:', url, proxyError);
    }
  }
  return null;
}

export async function fetchStockData(
  symbol: string,
  timeframe: Timeframe = '1D'
): Promise<{ quote: StockQuote; chart: ChartDataPoint[] } | null> {
  const { range, interval } = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG['1D'];
  const targetSymbol = encodeURIComponent(symbol.toUpperCase());
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${targetSymbol}?range=${range}&interval=${interval}&includePrePost=false`;

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
        if (timeframe !== '1D') {
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

    const currentPrice = meta.regularMarketPrice || validPrices[validPrices.length - 1] || 100;
    const previousClose = meta.chartPreviousClose || meta.previousClose || validPrices[0] || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

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
      marketCap: resolveMarketCap(symbol, meta.marketCap),
      peRatio: meta.trailingPE || meta.peRatio,
      sparkline: validPrices.slice(-10),
      marketState: meta.marketState || 'CLOSED',
    };

    return { quote, chart: chartPoints };
  }

  // Return null when unable to fetch live data (offline or API error)
  return null;
}

export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  
  const q = encodeURIComponent(query.trim());
  const url = `https://query1.finance.yahoo.com/1/finance/search?q=${q}&quotesCount=8&newsCount=0&enableFuzzyQuery=true`;

  const json = await fetchYahooApi(url);

  if (json && json.quotes && Array.isArray(json.quotes) && json.quotes.length > 0) {
    return json.quotes
      .filter((q: any) => q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'INDEX' || q.quoteType === 'ETF' || q.quoteType === 'CRYPTOCURRENCY'))
      .map((q: any) => ({
        symbol: q.symbol,
        shortname: q.shortname || q.longname || q.symbol,
        longname: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || q.dispExchange || '',
        quoteType: q.quoteType,
        typeDisp: q.typeDisp || q.quoteType,
      }));
  }

  // Local matching search
  const cleanQ = query.trim().toLowerCase();
  const matched = POPULAR_SYMBOLS_DB.filter(
    item => item.symbol.toLowerCase().includes(cleanQ) || 
            item.shortname?.toLowerCase().includes(cleanQ)
  );

  // If query is an exact ticker symbol string like "AMD" or "PLTR", include it directly
  if (matched.length === 0 && cleanQ.length >= 1 && cleanQ.length <= 6) {
    return [{
      symbol: query.trim().toUpperCase(),
      shortname: `${query.trim().toUpperCase()} Ticker`,
      exchange: 'US',
      quoteType: 'EQUITY'
    }];
  }

  return matched;
}
