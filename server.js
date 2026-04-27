import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import NodeCache from 'node-cache';

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

// ==================== STOCK DATA ====================

// Get stock quote (price, basic data)
app.get('/api/stock/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `quote_${symbol}`;
    
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_KEY
      }
    });

    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({ error: 'Symbol not found' });
    }

    const result = {
      symbol: data['01. symbol'],
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: data['10. change percent'],
      timestamp: data['07. latest trading day']
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Quote error:', error.message);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Get company fundamentals (P/E, Book Value, etc.)
app.get('/api/stock/fundamentals/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `fundamentals_${symbol}`;
    
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Get overview data
    const overviewResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'OVERVIEW',
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_KEY
      }
    });

    const overview = overviewResponse.data;
    
    if (!overview.Symbol) {
      return res.status(404).json({ error: 'Company data not found' });
    }

    const result = {
      symbol: overview.Symbol,
      name: overview.Name,
      sector: overview.Sector,
      pe_ratio: parseFloat(overview.TrailingPE) || null,
      price_to_book: parseFloat(overview.PriceToBookRatio) || null,
      dividend_yield: parseFloat(overview.DividendYield) || 0,
      earnings_per_share: parseFloat(overview.EPS) || null,
      market_cap: overview.MarketCapitalization,
      total_debt: overview.TotalDebt,
      total_assets: overview.TotalAssets,
      current_ratio: parseFloat(overview.CurrentRatio) || null,
      debt_to_equity: parseFloat(overview.DebtToEquityRatio) || null,
      roe: parseFloat(overview.ReturnOnEquityTTM) || null,
      revenue: overview.RevenueTTM
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Fundamentals error:', error.message);
    res.status(500).json({ error: 'Failed to fetch fundamentals' });
  }
});

// Get income statement data
app.get('/api/stock/income/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `income_${symbol}`;
    
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'INCOME_STATEMENT',
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_KEY
      }
    });

    const statements = response.data.annualReports;
    if (!statements || statements.length === 0) {
      return res.status(404).json({ error: 'Income statement not found' });
    }

    const latest = statements[0];
    const result = {
      symbol: symbol.toUpperCase(),
      fiscal_date_ending: latest.fiscalDateEnding,
      total_revenue: latest.totalRevenue,
      net_income: latest.netIncome,
      operating_income: latest.operatingIncome,
      gross_profit: latest.grossProfit
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Income statement error:', error.message);
    res.status(500).json({ error: 'Failed to fetch income statement' });
  }
});

// ==================== OPTIONS DATA ====================

// Get options chain from Finnhub
app.get('/api/options/chain/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `options_${symbol}`;
    
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Get option expiration dates
    const expirationResponse = await axios.get(
      `https://api.example.com/stock/${symbol.toUpperCase()}/options/expirations`,
      {
        params: { token: FINNHUB_KEY }
      }
    );

    // For now, return mock data - Finnhub doesn't have free options endpoint
    // You can upgrade to paid plan or use other options APIs
    const result = {
      symbol: symbol.toUpperCase(),
      message: 'Options data requires paid Finnhub plan. Using mock data.',
      expirations: ['2026-05-17', '2026-06-21', '2026-07-19'],
      note: 'Upgrade Finnhub to paid plan for real options data'
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Options error:', error.message);
    // Return mock data on error
    res.json({
      symbol: req.params.symbol.toUpperCase(),
      message: 'Using mock options data',
      expirations: ['2026-05-17', '2026-06-21', '2026-07-19']
    });
  }
});

// ==================== GRAHAM SCREENER ====================

// Get Graham value screening for all stocks
app.get('/api/graham/screen', async (req, res) => {
  try {
    const symbols = ['AAPL', 'MSFT', 'JNJ', 'KO', 'PG', 'IBM', 'CVX', 'XOM', 'MRK', 'INTC', 'T', 'D'];
    const results = [];

    for (const symbol of symbols) {
      try {
        // Get fundamentals
        const fundamentals = await axios.get(`http://localhost:${process.env.PORT || 3001}/api/stock/fundamentals/${symbol}`);
        const quote = await axios.get(`http://localhost:${process.env.PORT || 3001}/api/stock/quote/${symbol}`);

        const data = fundamentals.data;
        
        // Calculate Graham criteria
        const criteria = {
          lowPE: data.pe_ratio ? data.pe_ratio < 15 : false,
          lowPB: data.price_to_book ? data.price_to_book < 1.5 : false,
          highEarningsYield: data.earnings_per_share && quote.data.price ? (data.earnings_per_share / quote.data.price) > 0.05 : false,
          strongBalance: data.current_ratio ? data.current_ratio > 1.5 : false,
          lowDebtToEquity: data.debt_to_equity ? data.debt_to_equity < 1 : false
        };

        const metCriteria = Object.values(criteria).filter(v => v).length;
        const grahamScore = (metCriteria / 5) * 100;

        results.push({
          symbol: symbol,
          name: data.name,
          price: quote.data.price,
          grahamScore: grahamScore,
          criteria: criteria,
          pe_ratio: data.pe_ratio,
          price_to_book: data.price_to_book,
          dividend_yield: data.dividend_yield
        });
      } catch (err) {
        console.error(`Error screening ${symbol}:`, err.message);
      }
    }

    res.json(results.sort((a, b) => b.grahamScore - a.grahamScore));
  } catch (error) {
    console.error('Screening error:', error.message);
    res.status(500).json({ error: 'Failed to run screening' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════╗
  ║   Graham Value Platform - Backend Server Running   ║
  ║   API Key Status:                                  ║
  ║   - Alpha Vantage: ${ALPHA_VANTAGE_KEY ? '✓ Configured' : '✗ Missing'}           ║
  ║   - Finnhub: ${FINNHUB_KEY ? '✓ Configured' : '✗ Missing'}                  ║
  ║   Server: http://localhost:${PORT}                         ║
  ╚════════════════════════════════════════════════════╝
  `);
});

export default app;
