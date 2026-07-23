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

const PRESET_MOCK_DATA: Record<string, Partial<StockQuote>> = {
  '^GSPC': { symbol: '^GSPC', shortName: 'S&P 500', exchangeName: 'SNP', regularMarketPrice: 7498.96, regularMarketChange: -10.50, regularMarketChangePercent: -0.14, previousClose: 7509.46, sparkline: [7515, 7520, 7525, 7510, 7505, 7495, 7502, 7498.96] },
  'AAPL': { symbol: 'AAPL', shortName: 'Apple Inc.', exchangeName: 'NASDAQ', regularMarketPrice: 325.89, regularMarketChange: -1.84, regularMarketChangePercent: -0.56, previousClose: 327.73, sparkline: [327, 328, 326.5, 325, 326, 325.89] },
  'NVDA': { symbol: 'NVDA', shortName: 'NVIDIA Corporation', exchangeName: 'NASDAQ', regularMarketPrice: 148.50, regularMarketChange: 6.85, regularMarketChangePercent: 4.84, previousClose: 141.65, sparkline: [142, 143.5, 145, 144, 147.2, 148.5] },
  'GOOGL': { symbol: 'GOOGL', shortName: 'Alphabet Inc.', exchangeName: 'NASDAQ', regularMarketPrice: 341.91, regularMarketChange: -4.30, regularMarketChangePercent: -1.24, previousClose: 346.21, sparkline: [346, 345, 343, 344, 342, 341.91] },
  'MSFT': { symbol: 'MSFT', shortName: 'Microsoft Corporation', exchangeName: 'NASDAQ', regularMarketPrice: 390.34, regularMarketChange: -7.39, regularMarketChangePercent: -1.86, previousClose: 397.73, sparkline: [397, 395, 394, 392, 391, 390.34] },
  'COIN': { symbol: 'COIN', shortName: 'Coinbase Global, Inc.', exchangeName: 'NASDAQ', regularMarketPrice: 166.12, regularMarketChange: -9.72, regularMarketChangePercent: -5.53, previousClose: 175.84, sparkline: [175, 172, 170, 168, 165, 166.12] },
  'TSLA': { symbol: 'TSLA', shortName: 'Tesla, Inc.', exchangeName: 'NASDAQ', regularMarketPrice: 254.20, regularMarketChange: 14.12, regularMarketChangePercent: 5.88, previousClose: 240.08, sparkline: [241, 244, 248, 251, 253, 254.20] },
  'AMD': { symbol: 'AMD', shortName: 'Advanced Micro Devices', exchangeName: 'NASDAQ', regularMarketPrice: 178.40, regularMarketChange: 5.20, regularMarketChangePercent: 3.00, previousClose: 173.20, sparkline: [173, 174, 176, 175, 177, 178.40] },
  'NFLX': { symbol: 'NFLX', shortName: 'Netflix, Inc.', exchangeName: 'NASDAQ', regularMarketPrice: 645.20, regularMarketChange: 8.50, regularMarketChangePercent: 1.33, previousClose: 636.70, sparkline: [637, 639, 641, 643, 645.20] },
  'PLTR': { symbol: 'PLTR', shortName: 'Palantir Technologies', exchangeName: 'NYSE', regularMarketPrice: 28.50, regularMarketChange: 1.25, regularMarketChangePercent: 4.58, previousClose: 27.25, sparkline: [27.2, 27.5, 27.8, 28.1, 28.5] },
  'SPY': { symbol: 'SPY', shortName: 'SPDR S&P 500 ETF', exchangeName: 'NYSE', regularMarketPrice: 548.20, regularMarketChange: -0.75, regularMarketChangePercent: -0.14, previousClose: 548.95, sparkline: [549, 548.5, 548.2] },
  'QQQ': { symbol: 'QQQ', shortName: 'Invesco QQQ Trust', exchangeName: 'NASDAQ', regularMarketPrice: 478.10, regularMarketChange: 2.40, regularMarketChangePercent: 0.50, previousClose: 475.70, sparkline: [476, 477, 478.1] },
};

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
): Promise<{ quote: StockQuote; chart: ChartDataPoint[] }> {
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
      marketCap: meta.marketCap,
      peRatio: meta.trailingPE || meta.peRatio,
      sparkline: validPrices.slice(-10),
      marketState: meta.marketState || 'CLOSED',
    };

    return { quote, chart: chartPoints };
  }

  // Fallback generation if Yahoo Finance API is unreachable
  return generateMockData(symbol, timeframe);
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

function generateMockData(symbol: string, timeframe: Timeframe) {
  const symUpper = symbol.toUpperCase();
  const preset = PRESET_MOCK_DATA[symUpper];
  const basePrice = preset?.regularMarketPrice || (symUpper.charCodeAt(0) * 2.5 + 50);
  const pctChange = preset?.regularMarketChangePercent ?? (symUpper.length % 2 === 0 ? 2.45 : -1.85);
  const changeAmt = basePrice * (pctChange / 100);
  const prevClose = basePrice - changeAmt;

  const numPoints = timeframe === '1D' ? 40 : timeframe === '1W' ? 35 : timeframe === '1M' ? 30 : 50;
  const chartPoints: ChartDataPoint[] = [];

  let currentPointPrice = prevClose;
  const priceStep = changeAmt / numPoints;
  const now = Date.now() / 1000;

  for (let i = 0; i < numPoints; i++) {
    const timeOffset = (numPoints - i) * (timeframe === '1D' ? 300 : 86400);
    const pointTimestamp = Math.floor(now - timeOffset);
    const dateObj = new Date(pointTimestamp * 1000);
    
    const wave = Math.sin(i * 0.4) * (basePrice * 0.008);
    currentPointPrice = prevClose + (priceStep * i) + wave;

    let dateStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (timeframe !== '1D') {
      dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    chartPoints.push({
      timestamp: pointTimestamp,
      dateStr,
      close: Number(currentPointPrice.toFixed(2)),
      open: Number((currentPointPrice - 0.5).toFixed(2)),
      high: Number((currentPointPrice + 1.2).toFixed(2)),
      low: Number((currentPointPrice - 1.1).toFixed(2)),
      volume: 1500000 + i * 20000,
    });
  }

  const quote: StockQuote = {
    symbol: symUpper,
    shortName: preset?.shortName || `${symUpper} Corp`,
    exchangeName: preset?.exchangeName || 'NASDAQ',
    currency: 'USD',
    regularMarketPrice: Number(basePrice.toFixed(2)),
    regularMarketChange: Number(changeAmt.toFixed(2)),
    regularMarketChangePercent: Number(pctChange.toFixed(2)),
    previousClose: Number(prevClose.toFixed(2)),
    regularMarketOpen: Number((prevClose + 0.5).toFixed(2)),
    regularMarketDayHigh: Number((basePrice * 1.015).toFixed(2)),
    regularMarketDayLow: Number((basePrice * 0.985).toFixed(2)),
    regularMarketVolume: preset?.regularMarketVolume || 25000000,
    fiftyTwoWeekHigh: preset?.fiftyTwoWeekHigh || Number((basePrice * 1.25).toFixed(2)),
    fiftyTwoWeekLow: preset?.fiftyTwoWeekLow || Number((basePrice * 0.75).toFixed(2)),
    marketCap: preset?.marketCap || 950000000000,
    peRatio: preset?.peRatio || 28.4,
    sparkline: chartPoints.slice(-10).map(p => p.close),
    marketState: 'CLOSED',
  };

  return { quote, chart: chartPoints };
}
