import React, { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Loader, Sparkles, Zap } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function GrahamValuePlatform() {
  const [cashAmount, setCashAmount] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Fetch real stock data from backend
  const searchStock = async () => {
    if (!searchSymbol.trim() || !cashAmount) {
      setError('Please enter both a stock symbol and cash amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch quote and fundamentals
      const quoteResponse = await fetch(`${API_URL}/stock/quote/${searchSymbol.toUpperCase()}`);
      const fundamentalsResponse = await fetch(`${API_URL}/stock/fundamentals/${searchSymbol.toUpperCase()}`);

      if (!quoteResponse.ok || !fundamentalsResponse.ok) {
        throw new Error('Stock not found');
      }

      const quote = await quoteResponse.json();
      const fundamentals = await fundamentalsResponse.json();

      // Calculate Graham criteria
      const grahamScore = calculateGrahamScore(fundamentals, quote);

      setStockData({
        symbol: quote.symbol,
        price: quote.price,
        name: fundamentals.name
      });

      setRecommendations({
        grahamScore: grahamScore.score,
        recommendation: grahamScore.recommendation,
        criteria: grahamScore.criteria,
        shareCount: Math.floor(parseFloat(cashAmount) / quote.price),
        investmentAmount: Math.floor(parseFloat(cashAmount) / quote.price) * quote.price,
        remaining: parseFloat(cashAmount) - (Math.floor(parseFloat(cashAmount) / quote.price) * quote.price),
        dividendYield: fundamentals.dividend_yield
      });
    } catch (err) {
      setError(`Failed to fetch stock data: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Graham score based on fundamentals
  const calculateGrahamScore = (fundamentals, quote) => {
    const criteria = {
      lowPE: fundamentals.pe_ratio ? fundamentals.pe_ratio < 15 : false,
      lowPB: fundamentals.price_to_book ? fundamentals.price_to_book < 1.5 : false,
      highEarningsYield: fundamentals.earnings_per_share ? (fundamentals.earnings_per_share / quote.price) > 0.05 : false,
      strongBalance: fundamentals.current_ratio ? fundamentals.current_ratio > 1.5 : false,
      lowDebtToEquity: fundamentals.debt_to_equity ? fundamentals.debt_to_equity < 1 : false
    };

    const metCriteria = Object.values(criteria).filter(v => v).length;
    const score = (metCriteria / 5) * 100;

    let recommendation = 'HOLD';
    if (score >= 80) recommendation = 'STRONG BUY';
    else if (score >= 60) recommendation = 'BUY';
    else if (score >= 40) recommendation = 'HOLD';
    else recommendation = 'AVOID';

    return { score, recommendation, criteria };
  };

  // Generate suggestions by screening all stocks
  const generateSuggestions = async () => {
    if (!cashAmount) {
      setError('Please enter your cash amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/graham/screen`);
      const screenResults = await response.json();

      if (!Array.isArray(screenResults)) {
        throw new Error('Invalid screening results');
      }

      // Filter stocks you can afford
      const affordableSuggestions = screenResults.filter(stock => {
        const shareCount = Math.floor(parseFloat(cashAmount) / stock.price);
        return shareCount > 0;
      }).map(stock => ({
        ...stock,
        type: 'stock',
        shareCount: Math.floor(parseFloat(cashAmount) / stock.price),
        totalCost: Math.floor(parseFloat(cashAmount) / stock.price) * stock.price,
        remainingCash: parseFloat(cashAmount) - (Math.floor(parseFloat(cashAmount) / stock.price) * stock.price)
      }));

      setSuggestions(affordableSuggestions);
    } catch (err) {
      setError(`Failed to generate suggestions: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-emerald-400" size={36} />
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
              Graham Value Platform
            </h1>
          </div>

          <div className="flex gap-2 pb-2">
            {[
              { id: 'suggestions', label: '✨ Suggestions' },
              { id: 'search', label: '📊 Search' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* INPUT SECTION */}
        <div className="bg-slate-800/30 backdrop-blur border border-slate-700/30 rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-2 text-sm">Cash Available</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-emerald-400" size={18} />
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-2 text-sm">Stock Symbol</label>
              <input
                type="text"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && searchStock()}
                placeholder="e.g., AAPL"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition uppercase text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={searchStock}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : <TrendingUp size={16} />}
                Search
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* SUGGESTIONS TAB */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-yellow-400" />
                Smart Suggestions for ${cashAmount || '0'}
              </h2>
              <button
                onClick={generateSuggestions}
                disabled={loading || !cashAmount}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : <Zap size={16} />}
                Generate
              </button>
            </div>

            {suggestions.length === 0 && !loading && (
              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-12 text-center">
                <Sparkles className="mx-auto mb-4 text-slate-500" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Get Stock Suggestions</h3>
                <p className="text-slate-400">Enter your cash and click Generate to see stocks you can afford.</p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {suggestions.slice(0, 10).map((stock) => (
                  <div
                    key={stock.symbol}
                    className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/10 border-2 border-emerald-700/40 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-emerald-400">{stock.symbol}</h4>
                        <p className="text-slate-300 text-sm">{stock.name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        stock.grahamScore >= 80 ? 'bg-green-900/50 text-green-300' :
                        stock.grahamScore >= 60 ? 'bg-blue-900/50 text-blue-300' :
                        'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        {stock.grahamScore.toFixed(0)}%
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Price</span>
                        <span className="text-white font-bold">${stock.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Shares you can buy</span>
                        <span className="text-emerald-300 font-bold">{stock.shareCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Total investment</span>
                        <span className="text-cyan-300 font-bold">${stock.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Graham Score</span>
                        <span className="text-yellow-300 font-bold">{stock.grahamScore.toFixed(0)}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSearchSymbol(stock.symbol);
                        setActiveTab('search');
                      }}
                      className="w-full bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-500/60 text-emerald-200 font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && recommendations && stockData && (
          <div className="space-y-6">
            <div className="rounded-2xl p-8 bg-gradient-to-r from-emerald-900/20 to-emerald-900/10 border-2 border-emerald-700/40">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{stockData.symbol}</h2>
                  <p className="text-slate-300">{stockData.name}</p>
                </div>
                <div className="text-3xl font-bold text-emerald-400">${stockData.price.toFixed(2)}</div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Graham Score</p>
                  <p className="text-2xl font-bold text-yellow-400">{recommendations.grahamScore.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Recommendation</p>
                  <p className={`text-xl font-bold ${
                    recommendations.recommendation === 'STRONG BUY' ? 'text-green-400' :
                    recommendations.recommendation === 'BUY' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {recommendations.recommendation}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">You can buy</p>
                  <p className="text-2xl font-bold text-cyan-400">{recommendations.shareCount}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Investment</p>
                  <p className="text-2xl font-bold text-emerald-400">${recommendations.investmentAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!recommendations && activeTab === 'search' && (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-12 text-center">
            <TrendingUp className="mx-auto mb-4 text-slate-500" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Search a Stock</h3>
            <p className="text-slate-400">Enter a symbol to analyze it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
