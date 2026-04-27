# Graham Value Investment Platform

A full-stack web application for analyzing stocks using Benjamin Graham's value investing criteria. Real-time data from Alpha Vantage and Finnhub APIs.

## 📋 Features

- **Real-time Stock Analysis** — Live prices and fundamentals from Alpha Vantage
- **Graham Criteria Screening** — Automatically evaluates P/E, P/B, earnings yield, debt ratios
- **Smart Suggestions** — Find affordable stocks based on your budget
- **Options Chain Viewer** — See call/put options and affordability
- **Graham Score** — Proprietary scoring system (0-100%)
- **Caching** — Efficient API usage with smart caching

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- API Keys:
  - **Alpha Vantage** (free: https://www.alphavantage.co/)
  - **Finnhub** (free: https://finnhub.io/)

### Step 1: Get API Keys

#### Alpha Vantage
1. Go to https://www.alphavantage.co/
2. Click "GET FREE API KEY"
3. Enter your email
4. Copy your API key (you'll get it immediately)

#### Finnhub
1. Go to https://finnhub.io/
2. Click "Sign Up"
3. Create account
4. Go to Dashboard → API tokens
5. Copy your API key

### Step 2: Setup Backend

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your API keys
nano .env
# Add:
# ALPHA_VANTAGE_API_KEY=your_key_here
# FINNHUB_API_KEY=your_key_here
# PORT=3001
# FRONTEND_URL=http://localhost:3000

# Start backend server
npm start
```

Backend should be running at: `http://localhost:3001`

### Step 3: Setup Frontend

```bash
# If using Create React App
npx create-react-app graham-platform
cd graham-platform

# Copy App.jsx to src/App.jsx
cp App.jsx src/App.jsx

# Create .env file
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env

# Start frontend
npm start
```

Frontend should be at: `http://localhost:3000`

## 📊 API Endpoints

### Stock Data
- `GET /api/stock/quote/:symbol` — Get stock price
- `GET /api/stock/fundamentals/:symbol` — Get P/E, P/B, dividends, etc.
- `GET /api/stock/income/:symbol` — Get income statement data

### Graham Screening
- `GET /api/graham/screen` — Screen all stocks for Graham criteria

### Health
- `GET /health` — Server status

### Example Usage

```javascript
// Get Apple stock quote
fetch('http://localhost:3001/api/stock/quote/AAPL')
  .then(r => r.json())
  .then(data => console.log(data))

// Output:
// {
//   symbol: "AAPL",
//   price: 169.43,
//   change: 2.50,
//   changePercent: "1.50%"
// }
```

## 🎯 Understanding Graham Score

Graham Score is calculated from 5 criteria:

| Criteria | Graham Value | Your Metric |
|----------|-------------|-----------|
| P/E Ratio | < 15 | pe_ratio |
| Price-to-Book | < 1.5 | price_to_book |
| Earnings Yield | > 5% | eps / price |
| Current Ratio | > 1.5 | current_assets / current_liabilities |
| Debt-to-Equity | < 1.0 | total_debt / total_equity |

**Score Interpretation:**
- 80-100%: **STRONG BUY** (meets 4-5 criteria)
- 60-79%: **BUY** (meets 3-4 criteria)
- 40-59%: **HOLD** (meets 2-3 criteria)
- 0-39%: **AVOID** (meets 0-2 criteria)

## 📝 Caching Strategy

The backend caches API responses to save quota:

| Data | Cache Time | Why |
|------|-----------|-----|
| Stock Quote | 1 hour | Price changes frequently |
| Fundamentals | 24 hours | Updated quarterly |
| Income Statement | 30 days | Annual/quarterly filings |
| Graham Screen | 6 hours | Combines all data |

## 🌐 Deployment

### Deploy to Vercel (Frontend)

```bash
npm install -g vercel
vercel
```

### Deploy to Heroku (Backend)

```bash
# Install Heroku CLI
# Login and create app
heroku create graham-api

# Set environment variables
heroku config:set ALPHA_VANTAGE_API_KEY=your_key
heroku config:set FINNHUB_API_KEY=your_key

# Deploy
git push heroku main
```

Then update frontend `.env`:
```
REACT_APP_API_URL=https://graham-api.herokuapp.com/api
```

## 📦 File Structure

```
graham-platform/
├── server.js              # Express backend
├── App.jsx                # React frontend
├── package.json           # Node dependencies
├── .env.example          # Template for environment variables
├── README.md             # This file
└── public/               # Frontend assets
    ├── index.html
    └── index.css
```

## 🔧 API Rate Limits

### Alpha Vantage (Free Tier)
- 5 API calls per minute
- 500 calls per day
- Historical data: 20+ years

### Finnhub (Free Tier)
- 60 API calls per minute
- Real-time quotes
- 30-minute market data delay

### Best Practices
- Cache aggressively (1+ hour for fundamentals)
- Batch requests when possible
- Use the Graham screener endpoint (runs all checks once)
- Upgrade to paid plans if you need:
  - Real-time options data
  - Sub-minute price updates
  - Intraday data

## 🐛 Troubleshooting

### "API Key Invalid"
- Check `.env` file has correct keys
- Verify API keys from respective websites
- Restart backend: `npm start`

### "Symbol not found"
- Alpha Vantage supports 5000+ US stocks
- Try: AAPL, MSFT, JNJ, KO, PG, IBM, CVX, XOM, MRK, INTC, T, D
- Check spelling (symbol must be exact)

### CORS Errors
- Verify `FRONTEND_URL` in `.env` matches frontend URL
- Should be `http://localhost:3000` for local development

### Slow API Responses
- First request to a stock takes 1-2 seconds
- Subsequent requests are cached (instant)
- Alpha Vantage can be slow - this is normal

## 💡 Next Steps

1. **Add More Stocks** — Edit the symbols list in `/api/graham/screen`
2. **Upgrade APIs** — Pay plans offer real-time options and faster response
3. **Add Trading** — Use Alpaca API to actually execute trades
4. **Mobile App** — Convert to React Native
5. **Database** — Add PostgreSQL to track personal watchlists

## 📚 Resources

- [Benjamin Graham's "The Intelligent Investor"](https://www.amazon.com/Intelligent-Investor-Definitive-Investing-Strategies/dp/0060555661)
- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [Finnhub Docs](https://finnhub.io/docs/api)
- [Graham Number Calculator](https://www.grahamvalue.com/)

## 📄 License

MIT License - Feel free to use this for personal or commercial projects

## 🤝 Support

Having issues? 
- Check `/health` endpoint to verify backend is running
- Verify API keys are correct and have quota remaining
- Check browser console for error messages
- Review Alpha Vantage/Finnhub documentation

---

**Built with React, Node.js, and real financial data.** Happy investing! 🚀
