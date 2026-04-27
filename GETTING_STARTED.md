# Getting Started - Graham Value Platform

## ⚡ Quick Setup (5 minutes)

### Step 1: Get API Keys (2 min)

**Alpha Vantage** (Stock data)
- Go: https://www.alphavantage.co/
- Click: "GET FREE API KEY"
- Enter email → Get key instantly
- Copy key to clipboard

**Finnhub** (Options data)
- Go: https://finnhub.io/
- Sign up (takes 1 min)
- Dashboard → API tokens
- Copy key to clipboard

### Step 2: Setup Backend (2 min)

```bash
# Copy .env template
cp .env.example .env

# Open and edit .env
nano .env

# Paste your keys:
ALPHA_VANTAGE_API_KEY=paste_your_key_here
FINNHUB_API_KEY=paste_your_key_here
```

### Step 3: Start Backend (1 min)

```bash
# Install dependencies (first time only)
npm install

# Start server
npm start
```

You should see:
```
╔════════════════════════════════════════════════════╗
║   Graham Value Platform - Backend Server Running   ║
║   API Key Status:                                  ║
║   - Alpha Vantage: ✓ Configured                    ║
║   - Finnhub: ✓ Configured                          ║
║   Server: http://localhost:3001                    ║
╚════════════════════════════════════════════════════╝
```

### Step 4: Setup Frontend

In a NEW terminal:

```bash
# Create React app
npx create-react-app graham-frontend

# Copy app code
cp App.jsx graham-frontend/src/App.jsx

# Add API URL
echo "REACT_APP_API_URL=http://localhost:3001/api" > graham-frontend/.env

# Start frontend
cd graham-frontend && npm start
```

Visit: **http://localhost:3000**

---

## 🎯 Testing Your Setup

### Test 1: Backend is running
```bash
curl http://localhost:3001/health
# Should return: {"status":"Server is running",...}
```

### Test 2: Get a stock quote
```bash
curl http://localhost:3001/api/stock/quote/AAPL
# Should return price data for Apple
```

### Test 3: Frontend loads
- Open http://localhost:3000
- You should see the Graham Value Platform UI

### Test 4: Search a stock
- Enter cash amount: `5000`
- Enter symbol: `AAPL`
- Click "Search"
- Should show analysis

---

## 📁 Project Structure

```
graham-platform/
├── server.js              ← Backend (Express)
├── App.jsx                ← Frontend (React)
├── package.json           ← Dependencies
├── .env.example          ← Template (copy to .env)
├── README.md             ← Full documentation
├── DEPLOYMENT.md         ← Deploy to production
└── GETTING_STARTED.md    ← You are here
```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Cannot find module 'express'" | Run `npm install` |
| "API Key Invalid" | Check .env file, verify keys from websites |
| "CORS error in browser" | Make sure backend is running on port 3001 |
| "Symbol not found" | Try: AAPL, MSFT, JNJ, KO, PG, IBM, CVX, XOM |
| "API rate limit exceeded" | Wait 1 minute (5 calls/min limit on free tier) |
| "Port 3001 already in use" | Change PORT in .env or kill other process |

---

## ✅ Verification Checklist

- [ ] Node.js 16+ installed (`node --version`)
- [ ] API keys obtained from Alpha Vantage & Finnhub
- [ ] `.env` file created with API keys
- [ ] `npm install` completed
- [ ] Backend starts: `npm start`
- [ ] Backend responds to `/health` endpoint
- [ ] Frontend created: `npx create-react-app`
- [ ] `App.jsx` copied to `src/App.jsx`
- [ ] Frontend environment variable set
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Can search stocks and see data

---

## 🚀 Next Steps

### Option A: Continue Local Development
- Modify `App.jsx` to add features
- Test with different stocks
- Explore the Graham criteria

### Option B: Deploy Live
- See `DEPLOYMENT.md` for Heroku/Vercel instructions
- Takes ~10 minutes
- Share your app URL with friends

### Option C: Add Features
- [ ] Add watchlist (localStorage)
- [ ] Add stock comparison
- [ ] Add options chain viewer
- [ ] Connect to real trading API (Alpaca)
- [ ] Add database to save preferences

---

## 📚 Learning Resources

### Understanding Graham Value Investing
- Benjamin Graham's "The Intelligent Investor" (book)
- Graham Number = √(22.5 × EPS × Book Value per Share)
- Key metrics: P/E < 15, P/B < 1.5, Earnings Yield > 5%

### API Documentation
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)
- [Finnhub API Docs](https://finnhub.io/docs/api)

### React & Node.js
- [React Docs](https://react.dev)
- [Express.js Guide](https://expressjs.com/)

---

## 💬 Need Help?

1. **Check the README.md** — Has detailed API documentation
2. **Review DEPLOYMENT.md** — For production setup
3. **Check server logs** — Run backend with `npm run dev` for debugging
4. **Check browser console** — F12 → Console tab for frontend errors
5. **Verify API keys** — Test them directly on the API websites

---

## 🎉 You're Ready!

You now have:
- ✅ Full-stack stock analysis platform
- ✅ Real-time market data
- ✅ Graham value investing criteria
- ✅ Live suggestions engine
- ✅ Professional-grade UI

**Happy investing!** 📈

---

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Status:** Production Ready
