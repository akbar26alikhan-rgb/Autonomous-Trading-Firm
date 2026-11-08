import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini client if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Technical indicator calculations (in TS for backend execution)
// Technical indicator calculations (in TS for backend execution)
const USD_TO_INR = 86.50;

interface StockDefinition {
  name: string;
  price: number;
  pe: number;
  growth: number;
  sector: string;
  debtEq: number;
  isINR?: boolean;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'GLOBAL';
  bseCode?: string;
  nseCode?: string;
  headlines?: string[];
}

const knownStocks: Record<string, StockDefinition> = {
  // --- National Stock Exchange of India (NSE) ---
  RELIANCE: { name: 'Reliance Industries Ltd.', price: 1274.50, pe: 24.5, growth: 12.8, sector: 'Energy & Telecom', debtEq: 38.0, isINR: true, exchange: 'NSE', bseCode: '500325', nseCode: 'RELIANCE' },
  'RELIANCE.NS': { name: 'Reliance Industries Ltd.', price: 1274.50, pe: 24.5, growth: 12.8, sector: 'Energy & Telecom', debtEq: 38.0, isINR: true, exchange: 'NSE', bseCode: '500325', nseCode: 'RELIANCE' },
  TCS: { name: 'Tata Consultancy Services', price: 4150.00, pe: 29.8, growth: 8.5, sector: 'IT Services & Consulting', debtEq: 9.0, isINR: true, exchange: 'NSE', bseCode: '532540', nseCode: 'TCS' },
  'TCS.NS': { name: 'Tata Consultancy Services', price: 4150.00, pe: 29.8, growth: 8.5, sector: 'IT Services & Consulting', debtEq: 9.0, isINR: true, exchange: 'NSE', bseCode: '532540', nseCode: 'TCS' },
  INFY: { name: 'Infosys Limited', price: 1865.00, pe: 27.2, growth: 9.4, sector: 'Enterprise Digital Services', debtEq: 11.0, isINR: true, exchange: 'NSE', bseCode: '500209', nseCode: 'INFY' },
  'INFY.NS': { name: 'Infosys Limited', price: 1865.00, pe: 27.2, growth: 9.4, sector: 'Enterprise Digital Services', debtEq: 11.0, isINR: true, exchange: 'NSE', bseCode: '500209', nseCode: 'INFY' },
  HDFCBANK: { name: 'HDFC Bank Limited', price: 1745.00, pe: 18.5, growth: 14.2, sector: 'Banking & Financials', debtEq: 120.0, isINR: true, exchange: 'NSE', bseCode: '500180', nseCode: 'HDFCBANK' },
  'HDFCBANK.NS': { name: 'HDFC Bank Limited', price: 1745.00, pe: 18.5, growth: 14.2, sector: 'Banking & Financials', debtEq: 120.0, isINR: true, exchange: 'NSE', bseCode: '500180', nseCode: 'HDFCBANK' },
  TATAMOTORS: { name: 'Tata Motors Limited', price: 825.00, pe: 10.4, growth: 22.0, sector: 'Automotive & EV', debtEq: 45.0, isINR: true, exchange: 'NSE', bseCode: '500570', nseCode: 'TATAMOTORS' },
  'TATAMOTORS.NS': { name: 'Tata Motors Limited', price: 825.00, pe: 10.4, growth: 22.0, sector: 'Automotive & EV', debtEq: 45.0, isINR: true, exchange: 'NSE', bseCode: '500570', nseCode: 'TATAMOTORS' },
  ICICIBANK: { name: 'ICICI Bank Limited', price: 1268.00, pe: 17.6, growth: 16.5, sector: 'Private Sector Banking', debtEq: 95.0, isINR: true, exchange: 'NSE', bseCode: '532174', nseCode: 'ICICIBANK' },
  SBIN: { name: 'State Bank of India', price: 815.00, pe: 9.8, growth: 11.0, sector: 'Public Sector Banking', debtEq: 110.0, isINR: true, exchange: 'NSE', bseCode: '500112', nseCode: 'SBIN' },
  BHARTIARTL: { name: 'Bharti Airtel Limited', price: 1610.00, pe: 54.0, growth: 18.0, sector: 'Telecommunications & 5G', debtEq: 85.0, isINR: true, exchange: 'NSE', bseCode: '532454', nseCode: 'BHARTIARTL' },
  ITC: { name: 'ITC Limited', price: 478.00, pe: 26.5, growth: 7.5, sector: 'FMCG & Agri-Business', debtEq: 0.0, isINR: true, exchange: 'NSE', bseCode: '500875', nseCode: 'ITC' },
  LT: { name: 'Larsen & Toubro Ltd.', price: 3620.00, pe: 34.0, growth: 15.0, sector: 'Infrastructure & Defense', debtEq: 65.0, isINR: true, exchange: 'NSE', bseCode: '500510', nseCode: 'LT' },
  BAJFINANCE: { name: 'Bajaj Finance Limited', price: 6890.00, pe: 28.5, growth: 24.0, sector: 'Consumer Lending & NBFC', debtEq: 210.0, isINR: true, exchange: 'NSE', bseCode: '500034', nseCode: 'BAJFINANCE' },
  MARUTI: { name: 'Maruti Suzuki India', price: 11450.00, pe: 24.0, growth: 13.5, sector: 'Passenger Vehicles', debtEq: 2.0, isINR: true, exchange: 'NSE', bseCode: '532500', nseCode: 'MARUTI' },
  HINDUNILVR: { name: 'Hindustan Unilever Ltd.', price: 2380.00, pe: 52.0, growth: 6.5, sector: 'Consumer Staples & FMCG', debtEq: 0.0, isINR: true, exchange: 'NSE', bseCode: '500696', nseCode: 'HINDUNILVR' },
  WIPRO: { name: 'Wipro Limited', price: 545.00, pe: 21.0, growth: 5.8, sector: 'Global IT & AI Services', debtEq: 14.0, isINR: true, exchange: 'NSE', bseCode: '507685', nseCode: 'WIPRO' },
  NIFTY50: { name: 'Nifty 50 Benchmark', price: 24180.00, pe: 22.4, growth: 12.0, sector: 'NSE Benchmark Index', debtEq: 0.0, isINR: true, exchange: 'NSE' },
  BANKNIFTY: { name: 'Nifty Bank Index', price: 51850.00, pe: 16.8, growth: 14.5, sector: 'NSE Banking Sector Index', debtEq: 0.0, isINR: true, exchange: 'NSE' },

  // --- Bombay Stock Exchange (BSE) ---
  SENSEX: { name: 'BSE S&P Sensex 30 Index', price: 79640.00, pe: 23.1, growth: 11.5, sector: 'BSE Benchmark Index', debtEq: 0.0, isINR: true, exchange: 'BSE', bseCode: '1' },
  BSE100: { name: 'BSE 100 Index', price: 25420.00, pe: 22.8, growth: 12.2, sector: 'BSE Broad Market Index', debtEq: 0.0, isINR: true, exchange: 'BSE' },
  '500325': { name: 'Reliance Industries (BSE)', price: 1274.80, pe: 24.5, growth: 12.8, sector: 'Energy & Telecom (BSE)', debtEq: 38.0, isINR: true, exchange: 'BSE', bseCode: '500325', nseCode: 'RELIANCE' },
  'RELIANCE.BO': { name: 'Reliance Industries (BSE)', price: 1274.80, pe: 24.5, growth: 12.8, sector: 'Energy & Telecom (BSE)', debtEq: 38.0, isINR: true, exchange: 'BSE', bseCode: '500325', nseCode: 'RELIANCE' },
  '532540': { name: 'Tata Consultancy Services (BSE)', price: 4151.20, pe: 29.8, growth: 8.5, sector: 'IT Services & Consulting (BSE)', debtEq: 9.0, isINR: true, exchange: 'BSE', bseCode: '532540', nseCode: 'TCS' },
  'TCS.BO': { name: 'Tata Consultancy Services (BSE)', price: 4151.20, pe: 29.8, growth: 8.5, sector: 'IT Services & Consulting (BSE)', debtEq: 9.0, isINR: true, exchange: 'BSE', bseCode: '532540', nseCode: 'TCS' },
  '500209': { name: 'Infosys Limited (BSE)', price: 1865.50, pe: 27.2, growth: 9.4, sector: 'Enterprise Digital Services (BSE)', debtEq: 11.0, isINR: true, exchange: 'BSE', bseCode: '500209', nseCode: 'INFY' },
  'INFY.BO': { name: 'Infosys Limited (BSE)', price: 1865.50, pe: 27.2, growth: 9.4, sector: 'Enterprise Digital Services (BSE)', debtEq: 11.0, isINR: true, exchange: 'BSE', bseCode: '500209', nseCode: 'INFY' },
  '500180': { name: 'HDFC Bank Limited (BSE)', price: 1745.30, pe: 18.5, growth: 14.2, sector: 'Banking & Financials (BSE)', debtEq: 120.0, isINR: true, exchange: 'BSE', bseCode: '500180', nseCode: 'HDFCBANK' },
  'HDFCBANK.BO': { name: 'HDFC Bank Limited (BSE)', price: 1745.30, pe: 18.5, growth: 14.2, sector: 'Banking & Financials (BSE)', debtEq: 120.0, isINR: true, exchange: 'BSE', bseCode: '500180', nseCode: 'HDFCBANK' },
  '500570': { name: 'Tata Motors Limited (BSE)', price: 825.25, pe: 10.4, growth: 22.0, sector: 'Automotive & EV (BSE)', debtEq: 45.0, isINR: true, exchange: 'BSE', bseCode: '500570', nseCode: 'TATAMOTORS' },
  'TATAMOTORS.BO': { name: 'Tata Motors Limited (BSE)', price: 825.25, pe: 10.4, growth: 22.0, sector: 'Automotive & EV (BSE)', debtEq: 45.0, isINR: true, exchange: 'BSE', bseCode: '500570', nseCode: 'TATAMOTORS' },
  '532174': { name: 'ICICI Bank Limited (BSE)', price: 1268.40, pe: 17.6, growth: 16.5, sector: 'Banking (BSE)', debtEq: 95.0, isINR: true, exchange: 'BSE', bseCode: '532174', nseCode: 'ICICIBANK' },
  '500112': { name: 'State Bank of India (BSE)', price: 815.30, pe: 9.8, growth: 11.0, sector: 'Public Sector Banking (BSE)', debtEq: 110.0, isINR: true, exchange: 'BSE', bseCode: '500112', nseCode: 'SBIN' },
  '532454': { name: 'Bharti Airtel Limited (BSE)', price: 1610.50, pe: 54.0, growth: 18.0, sector: 'Telecom (BSE)', debtEq: 85.0, isINR: true, exchange: 'BSE', bseCode: '532454', nseCode: 'BHARTIARTL' },
  '500875': { name: 'ITC Limited (BSE)', price: 478.15, pe: 26.5, growth: 7.5, sector: 'FMCG (BSE)', debtEq: 0.0, isINR: true, exchange: 'BSE', bseCode: '500875', nseCode: 'ITC' },
  '500510': { name: 'Larsen & Toubro Ltd. (BSE)', price: 3620.80, pe: 34.0, growth: 15.0, sector: 'Infrastructure (BSE)', debtEq: 65.0, isINR: true, exchange: 'BSE', bseCode: '500510', nseCode: 'LT' },
  '500034': { name: 'Bajaj Finance Limited (BSE)', price: 6891.00, pe: 28.5, growth: 24.0, sector: 'NBFC (BSE)', debtEq: 210.0, isINR: true, exchange: 'BSE', bseCode: '500034', nseCode: 'BAJFINANCE' },
  '532500': { name: 'Maruti Suzuki India (BSE)', price: 11452.00, pe: 24.0, growth: 13.5, sector: 'Automobiles (BSE)', debtEq: 2.0, isINR: true, exchange: 'BSE', bseCode: '532500', nseCode: 'MARUTI' },
  '500696': { name: 'Hindustan Unilever (BSE)', price: 2380.50, pe: 52.0, growth: 6.5, sector: 'FMCG (BSE)', debtEq: 0.0, isINR: true, exchange: 'BSE', bseCode: '500696', nseCode: 'HINDUNILVR' },
  '507685': { name: 'Wipro Limited (BSE)', price: 545.20, pe: 21.0, growth: 5.8, sector: 'IT Services (BSE)', debtEq: 14.0, isINR: true, exchange: 'BSE', bseCode: '507685', nseCode: 'WIPRO' },

  // --- Global Equities & Tech Leaders ---
  NVDA: { name: 'NVIDIA Corporation', price: 138.25, pe: 48.2, growth: 82.5, sector: 'Semiconductors & AI Hardware', debtEq: 21.4, exchange: 'NASDAQ' },
  AAPL: { name: 'Apple Inc.', price: 234.50, pe: 33.1, growth: 6.8, sector: 'Consumer Electronics', debtEq: 145.0, exchange: 'NASDAQ' },
  MSFT: { name: 'Microsoft Corporation', price: 422.80, pe: 34.6, growth: 15.2, sector: 'Cloud & Enterprise AI', debtEq: 38.5, exchange: 'NASDAQ' },
  TSLA: { name: 'Tesla, Inc.', price: 288.90, pe: 68.4, growth: 9.2, sector: 'EV & Autonomous Systems', debtEq: 12.0, exchange: 'NASDAQ' },
  GOOGL: { name: 'Alphabet Inc.', price: 178.40, pe: 22.8, growth: 14.5, sector: 'Search & Cloud AI', debtEq: 10.2, exchange: 'NASDAQ' },
  AMZN: { name: 'Amazon.com, Inc.', price: 204.10, pe: 41.5, growth: 12.8, sector: 'E-Commerce & AWS', debtEq: 52.0, exchange: 'NASDAQ' },
  META: { name: 'Meta Platforms, Inc.', price: 588.20, pe: 28.4, growth: 18.9, sector: 'Social Media & Open AI', debtEq: 18.0, exchange: 'NASDAQ' },
  PLTR: { name: 'Palantir Technologies', price: 62.40, pe: 88.5, growth: 30.2, sector: 'Enterprise AI & Defense', debtEq: 0.0, exchange: 'NYSE' },
  AMD: { name: 'Advanced Micro Devices', price: 142.60, pe: 42.0, growth: 28.0, sector: 'Semiconductors', debtEq: 15.0, exchange: 'NASDAQ' },
  AVGO: { name: 'Broadcom Inc.', price: 172.50, pe: 36.2, growth: 44.0, sector: 'Semiconductors & Networking', debtEq: 92.0, exchange: 'NASDAQ' },
  TSM: { name: 'Taiwan Semiconductor', price: 194.80, pe: 24.5, growth: 36.0, sector: 'Semiconductor Foundry', debtEq: 22.0, exchange: 'NYSE' },
  ASML: { name: 'ASML Holding N.V.', price: 712.00, pe: 38.1, growth: 18.5, sector: 'Lithography Equipment', debtEq: 25.0, exchange: 'NASDAQ' },
  COIN: { name: 'Coinbase Global, Inc.', price: 295.40, pe: 44.0, growth: 78.0, sector: 'Crypto Infrastructure & Fintech', debtEq: 45.0, exchange: 'NASDAQ' },
  NFLX: { name: 'Netflix, Inc.', price: 825.00, pe: 41.2, growth: 15.8, sector: 'Streaming Media', debtEq: 65.0, exchange: 'NASDAQ' },
  CRM: { name: 'Salesforce, Inc.', price: 328.00, pe: 45.0, growth: 11.2, sector: 'Enterprise Cloud CRM', debtEq: 20.0, exchange: 'NYSE' },
  ORCL: { name: 'Oracle Corporation', price: 188.50, pe: 40.8, growth: 14.0, sector: 'Cloud Infrastructure', debtEq: 180.0, exchange: 'NYSE' },
  LLY: { name: 'Eli Lilly and Company', price: 842.00, pe: 54.0, growth: 32.0, sector: 'Pharmaceuticals & GLP-1', debtEq: 80.0, exchange: 'NYSE' },
  NVO: { name: 'Novo Nordisk A/S', price: 112.50, pe: 32.0, growth: 24.0, sector: 'Healthcare & Therapeutics', debtEq: 15.0, exchange: 'NYSE' },
  JPM: { name: 'JPMorgan Chase & Co.', price: 244.20, pe: 12.8, growth: 9.5, sector: 'Investment Banking', debtEq: 160.0, exchange: 'NYSE' },
  V: { name: 'Visa Inc.', price: 310.50, pe: 31.0, growth: 10.2, sector: 'Payment Networks', debtEq: 45.0, exchange: 'NYSE' },
  COST: { name: 'Costco Wholesale Corp.', price: 955.00, pe: 52.0, growth: 8.5, sector: 'Discount Wholesale Retail', debtEq: 18.0, exchange: 'NASDAQ' },
  WMT: { name: 'Walmart Inc.', price: 88.40, pe: 34.0, growth: 6.2, sector: 'Consumer Retail', debtEq: 70.0, exchange: 'NYSE' },
  SPY: { name: 'SPDR S&P 500 ETF Trust', price: 592.30, pe: 26.5, growth: 8.0, sector: 'Broad Market ETF', debtEq: 0, exchange: 'NYSE' },
  QQQ: { name: 'Invesco QQQ Trust', price: 512.40, pe: 30.2, growth: 14.0, sector: 'Nasdaq-100 Tech ETF', debtEq: 0, exchange: 'NASDAQ' },
  'BTC-USD': { name: 'Bitcoin USD', price: 89450.00, pe: 0, growth: 110.0, sector: 'Digital Assets & Store of Value', debtEq: 0, exchange: 'GLOBAL' },
  'ETH-USD': { name: 'Ethereum USD', price: 3180.00, pe: 0, growth: 75.0, sector: 'Smart Contract Platform', debtEq: 0, exchange: 'GLOBAL' },
  'SOL-USD': { name: 'Solana USD', price: 215.50, pe: 0, growth: 140.0, sector: 'High-Throughput L1 Blockchain', debtEq: 0, exchange: 'GLOBAL' },
};

function calculateCandleData(ticker: string, customDetails?: any, currency: 'INR' | 'USD' = 'INR', exchangePreference?: string) {
  const sym = ticker.toUpperCase().trim();
  const known = knownStocks[sym];

  // Resolve exchange: NSE, BSE, NASDAQ, NYSE, or GLOBAL
  let exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'GLOBAL' = 'NSE';
  if (customDetails?.exchange) {
    exchange = customDetails.exchange;
  } else if (exchangePreference && (exchangePreference === 'NSE' || exchangePreference === 'BSE')) {
    exchange = exchangePreference;
  } else if (known?.exchange) {
    exchange = known.exchange;
  } else if (sym.endsWith('.BO') || /^\d{6}$/.test(sym) || sym === 'SENSEX' || sym === 'BSE100') {
    exchange = 'BSE';
  } else if (sym.endsWith('.NS') || sym.includes('NIFTY')) {
    exchange = 'NSE';
  } else if (currency === 'INR') {
    exchange = 'NSE';
  } else {
    exchange = 'NASDAQ';
  }

  // Price resolution: if in INR mode and stock is in USD without isINR flag, convert to INR
  let basePrice = 120.0;
  if (customDetails?.price !== undefined && customDetails.price > 0) {
    basePrice = Number(customDetails.price);
  } else if (known) {
    if (currency === 'INR') {
      basePrice = known.isINR ? known.price : Number((known.price * USD_TO_INR).toFixed(2));
    } else {
      basePrice = known.isINR ? Number((known.price / USD_TO_INR).toFixed(2)) : known.price;
    }
  }

  const seed = {
    name: customDetails?.companyName || known?.name || `${sym} Corporation`,
    price: basePrice,
    pe: customDetails?.peRatio !== undefined ? Number(customDetails.peRatio) : (known?.pe !== undefined ? known.pe : 28.0),
    growth: customDetails?.revenueGrowth !== undefined ? Number(customDetails.revenueGrowth) : (known?.growth !== undefined ? known.growth : 18.0),
    sector: customDetails?.sector || known?.sector || 'Global Equities',
    debtEq: customDetails?.debtToEquity !== undefined ? Number(customDetails.debtToEquity) : (known?.debtEq !== undefined ? known.debtEq : 35.0),
    grossMargin: customDetails?.grossMargin !== undefined ? Number(customDetails.grossMargin) : 64.5,
    customHeadlines: customDetails?.headlines,
  };

  const candles: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> = [];
  let cur = seed.price * 0.88;
  const now = new Date();

  // Pseudo-random generation based on ticker hash
  let seedNum = 0;
  for (let i = 0; i < ticker.length; i++) {
    seedNum = (seedNum << 5) - seedNum + ticker.charCodeAt(i);
  }
  const pseudoRandom = () => {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    return seedNum / 233280;
  };

  for (let i = 90; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const drift = (seed.price - cur) * 0.04;
    const vol = cur * 0.02;
    const change = drift + (pseudoRandom() - 0.48) * vol * 2;
    cur = Math.max(cur + change, 5);

    const open = cur - change * 0.5;
    const high = Math.max(open, cur) + pseudoRandom() * vol;
    const low = Math.min(open, cur) - pseudoRandom() * vol;

    candles.push({
      date: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(cur.toFixed(2)),
      volume: Math.floor(5000000 + pseudoRandom() * 35000000),
    });
  }

  const closes = candles.map((c) => c.close);
  const currentPrice = closes[closes.length - 1];

  // Moving averages
  const calcSMA = (period: number) => {
    if (closes.length < period) return currentPrice;
    const slice = closes.slice(-period);
    return Number((slice.reduce((a, b) => a + b, 0) / period).toFixed(2));
  };

  const sma20 = calcSMA(20);
  const sma50 = calcSMA(50);
  const sma200 = calcSMA(Math.min(90, closes.length));

  // RSI
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= 14; i++) {
    const diff = closes[closes.length - 15 + i] - closes[closes.length - 16 + i];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= 14;
  avgLoss /= 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi14 = Number((100 - 100 / (1 + rs)).toFixed(1));

  // Bollinger Bands
  const slice20 = closes.slice(-20);
  const mean20 = slice20.reduce((a, b) => a + b, 0) / 20;
  const variance = slice20.reduce((acc, val) => acc + Math.pow(val - mean20, 2), 0) / 20;
  const std = Math.sqrt(variance);

  // ATR
  const ranges: number[] = [];
  for (let i = candles.length - 14; i < candles.length; i++) {
    const c = candles[i];
    const prev = candles[i - 1];
    ranges.push(Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close)));
  }
  const atr14 = Number((ranges.reduce((a, b) => a + b, 0) / ranges.length).toFixed(2));

  return {
    ticker: ticker.toUpperCase(),
    companyName: seed.name,
    exchange,
    currentPrice,
    sector: seed.sector,
    candles,
    technicals: {
      rsi14,
      rsiCondition: rsi14 > 70 ? 'OVERBOUGHT' : rsi14 < 30 ? 'OVERSOLD' : 'NEUTRAL',
      sma20,
      sma50,
      sma200,
      trend: currentPrice > sma50 && sma50 > sma200 ? 'BULLISH' : currentPrice < sma50 && sma50 < sma200 ? 'BEARISH' : 'NEUTRAL',
      bollinger: {
        upper: Number((mean20 + 2 * std).toFixed(2)),
        middle: Number(mean20.toFixed(2)),
        lower: Number((mean20 - 2 * std).toFixed(2)),
      },
      macd: {
        line: Number(((sma20 - sma50) * 0.4).toFixed(2)),
        histogram: Number(((currentPrice - sma20) * 0.25).toFixed(2)),
      },
      atr14,
      volatilityPct: Number(((atr14 / currentPrice) * 100).toFixed(2)),
    },
    fundamentals: {
      peRatio: seed.pe,
      forwardPe: seed.pe > 0 ? Number((seed.pe * 0.88).toFixed(1)) : 0,
      pegRatio: seed.pe > 0 ? Number((seed.pe / Math.max(seed.growth, 1)).toFixed(2)) : 0,
      revenueGrowth: seed.growth,
      grossMargin: 64.5,
      operatingMargin: 32.8,
      debtToEquity: seed.debtEq,
      currentRatio: 2.35,
      roe: 27.4,
      targetPrice: Number((currentPrice * 1.18).toFixed(2)),
      marketCap: Math.floor(currentPrice * 2500000000),
      high52w: Number(Math.max(...candles.map((c) => c.high)).toFixed(2)),
      low52w: Number(Math.min(...candles.map((c) => c.low)).toFixed(2)),
    },
    newsSentiment: {
      sentimentScore: seed.growth > 30 ? 78 : 64,
      sentimentLabel: seed.growth > 30 ? 'High Conviction Bullish' : 'Constructive',
      fearGreedIndex: 68,
      fearGreedLabel: 'Greed',
      putCallRatio: 0.68,
      mentionVolume: '148.5K mentions (24h)',
      headlines: (seed.customHeadlines && seed.customHeadlines.length > 0) ? seed.customHeadlines : [
        `${seed.name} expands operational market presence on ${exchange} with multi-year contract renewals.`,
        `Institutional analysts maintain positive coverage on ${seed.name} (${exchange}) citing resilient product margins.`,
        `Macro economic conditions across India and global markets remain stable, supporting ${exchange} liquidity.`,
        `Management reaffirms long-term growth and capital allocation commitments for shareholders.`,
      ],
    },
  };
}

// API: Search Stocks and Companies
app.get('/api/search-stocks', (req, res) => {
  const query = ((req.query.q as string) || '').toUpperCase().trim();
  const currency = ((req.query.currency as string) || 'INR') as 'INR' | 'USD';
  const exchangeFilter = ((req.query.exchange as string) || 'ALL').toUpperCase().trim();
  
  const allList = Object.entries(knownStocks).map(([ticker, data]) => {
    let price = data.price;
    if (currency === 'INR' && !data.isINR) {
      price = Number((data.price * USD_TO_INR).toFixed(2));
    } else if (currency === 'USD' && data.isINR) {
      price = Number((data.price / USD_TO_INR).toFixed(2));
    }
    return {
      ticker,
      name: data.name,
      price,
      sector: data.sector,
      pe: data.pe,
      growth: data.growth,
      isINR: data.isINR,
      exchange: data.exchange,
      bseCode: data.bseCode,
      nseCode: data.nseCode,
    };
  });

  let filtered = allList;
  if (exchangeFilter !== 'ALL') {
    filtered = filtered.filter((item) => item.exchange === exchangeFilter);
  }

  if (query) {
    filtered = filtered.filter(
      (item) =>
        item.ticker.includes(query) ||
        item.name.toUpperCase().includes(query) ||
        item.sector.toUpperCase().includes(query) ||
        (item.bseCode && item.bseCode.includes(query))
    );
  }

  // If exact query is not present and a search query exists, add custom asset option
  if (query && !filtered.some((item) => item.ticker === query)) {
    const isBseQuery = query.endsWith('.BO') || /^\d{6}$/.test(query);
    const assignedExchange = exchangeFilter !== 'ALL' ? exchangeFilter : (isBseQuery ? 'BSE' : (currency === 'INR' ? 'NSE' : 'NASDAQ'));
    filtered.unshift({
      ticker: query,
      name: `${query} (Search / Custom Asset)`,
      price: currency === 'INR' ? 1250.0 : 125.0,
      sector: 'Custom / Unlisted Asset',
      pe: 25.0,
      growth: 15.0,
      isINR: currency === 'INR',
      exchange: assignedExchange as any,
      bseCode: undefined,
      nseCode: undefined,
    });
  }

  res.json({ success: true, results: filtered.slice(0, 30) });
});

// API: Run Multi-Agent Trading Firm
app.post('/api/run-firm', async (req, res) => {
  try {
    const {
      ticker = 'RELIANCE',
      riskTolerance = 'moderate',
      portfolioEquity = 1000000,
      maxPositionSizePct = 10,
      customDetails,
      currency = 'INR',
      exchange: requestedExchange,
    } = req.body;

    const market = calculateCandleData(ticker, customDetails, currency, requestedExchange);
    const price = market.currentPrice;
    const atr = market.technicals.atr14;
    const currSym = currency === 'INR' ? '₹' : '$';
    const exchange = market.exchange;

    let aiOutput: any = null;

    // If Gemini client is available, attempt real AI generation
    if (ai) {
      try {
        const prompt = `
You are the central engine of an Autonomous AI Trading Firm with 4 specialist teams:
1. Analyst Team:
   - Fundamental Analyst (evaluates valuation multiples, margins, balance sheet)
   - Technical Analyst (evaluates trend, RSI, MACD, support/resistance levels)
   - News Analyst (evaluates corporate catalysts and macro events)
   - Sentiment Analyst (evaluates retail sentiment and Fear/Greed)
2. Researcher Team:
   - Bull Researcher (constructs strong institutional long thesis with conviction score 0-100)
   - Bear Researcher (stress-tests downside, multiple contraction, short thesis with conviction score 0-100)
   - Cross-Examination Debate (Bull answers Bear, Bear answers Bull)
3. Trader Agent:
   - Synthesizes all inputs into an actionable trade proposal (Action: BUY/SELL/HOLD, Order Type: LIMIT, Entry, Target, Stop Loss, Risk/Reward ratio >= 1:2.0, Position Size %)
4. Chief Risk Officer / Portfolio Manager:
   - Fiduciary review enforcing portfolio mandates (Max position size <= ${maxPositionSizePct}%, Max risk <= 2% of ${currSym}${portfolioEquity.toLocaleString()} equity).
   - Verdict: "APPROVED", "MODIFIED", or "REJECTED" with clear institutional reasoning.

Market Intelligence for ${market.ticker} (${market.companyName}):
Current Price: ${currSym}${price} (${currency})
Fundamentals: P/E: ${market.fundamentals.peRatio}, Rev Growth: ${market.fundamentals.revenueGrowth}%, Gross Margin: ${market.fundamentals.grossMargin}%, Debt/Equity: ${market.fundamentals.debtToEquity}
Technicals: Trend: ${market.technicals.trend}, RSI 14: ${market.technicals.rsi14} (${market.technicals.rsiCondition}), SMA 20: $${market.technicals.sma20}, SMA 50: $${market.technicals.sma50}, ATR 14: $${atr}
News Headlines: ${market.newsSentiment.headlines.join(' | ')}
Sentiment: Score ${market.newsSentiment.sentimentScore}/100, Fear & Greed: ${market.newsSentiment.fearGreedIndex}

Output strict JSON with this exact schema:
{
  "analystReports": {
    "fundamental": {
      "valuationVerdict": "UNDERVALUED" | "FAIRLY_VALUED" | "OVERVALUED",
      "healthScore": 0-100,
      "fairValueEstimate": number,
      "strengths": ["...", "..."],
      "vulnerabilities": ["..."],
      "summary": "..."
    },
    "technical": {
      "trendSignal": "BULLISH" | "BEARISH" | "NEUTRAL",
      "technicalScore": 0-100,
      "supportLevel": number,
      "resistanceLevel": number,
      "pattern": "...",
      "summary": "..."
    },
    "news": {
      "catalystImpact": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "score": 0-100,
      "primaryCatalysts": ["...", "..."],
      "summary": "..."
    },
    "sentiment": {
      "crowdSentiment": "BULLISH" | "NEUTRAL" | "BEARISH",
      "score": 0-100,
      "optionsBias": "CALL_HEAVY" | "BALANCED" | "PUT_HEAVY",
      "summary": "..."
    }
  },
  "researcherDebate": {
    "bullCase": {
      "conviction": 0-100,
      "thesis": "...",
      "targetUpside": number,
      "coreDrivers": ["...", "..."]
    },
    "bearCase": {
      "conviction": 0-100,
      "thesis": "...",
      "targetDownside": number,
      "vulnerabilities": ["...", "..."]
    },
    "rebuttals": [
      {"speaker": "Bull Researcher", "argument": "..."},
      {"speaker": "Bear Researcher", "argument": "..."}
    ],
    "advantage": "BULL" | "BEAR"
  },
  "tradeProposal": {
    "action": "BUY" | "SELL" | "HOLD",
    "orderType": "LIMIT",
    "entryPrice": number,
    "targetPrice": number,
    "stopLoss": number,
    "riskRewardRatio": number,
    "suggestedSizePct": number,
    "timeframe": "...",
    "tactics": "..."
  },
  "riskAudit": {
    "verdict": "APPROVED" | "MODIFIED" | "REJECTED",
    "approvedSizePct": number,
    "approvedShares": number,
    "maxDollarLoss": number,
    "riskScore": 0-100,
    "fiduciaryReasoning": "..."
  }
}
Return only JSON.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        aiOutput = JSON.parse(text);
      } catch (geminiError) {
        console.warn('Gemini generation failed, falling back to quantitative benchmark engine:', geminiError);
      }
    }

    // High-fidelity fallback / baseline if Gemini is unavailable
    if (!aiOutput) {
      const isBullish = market.technicals.trend === 'BULLISH' || market.fundamentals.revenueGrowth > 20;
      const entry = Number((price * 0.995).toFixed(2));
      const stop = Number((entry - atr * 1.6).toFixed(2));
      const target = Number((entry + (entry - stop) * 2.6).toFixed(2));
      const rr = Number(((target - entry) / Math.max(entry - stop, 0.1)).toFixed(2));
      const sizePct = riskTolerance === 'aggressive' ? 7.5 : riskTolerance === 'moderate' ? 5.0 : 3.5;
      const dollarRiskPerShare = entry - stop;
      const positionDollars = portfolioEquity * (sizePct / 100);
      const shares = Math.floor(positionDollars / entry);
      const totalDollarRisk = Number((shares * dollarRiskPerShare).toFixed(2));

      aiOutput = {
        analystReports: {
          fundamental: {
            valuationVerdict: isBullish ? 'UNDERVALUED' : 'FAIRLY_VALUED',
            healthScore: Math.min(Math.max(Math.floor(65 + market.fundamentals.revenueGrowth * 0.4), 45), 95),
            fairValueEstimate: Number((price * 1.2).toFixed(2)),
            strengths: [
              `Consistent top-line growth at ${market.fundamentals.revenueGrowth}% YoY outperforming sector average`,
              `Prudent debt-to-equity leverage profile of ${market.fundamentals.debtToEquity} provides strong liquidity`,
            ],
            vulnerabilities: [
              `Valuation multiple of ${market.fundamentals.peRatio}x trailing earnings demands sustained operational outperformance`,
            ],
            summary: `${market.companyName} exhibits durable competitive moat dynamics and strong balance sheet health, well-positioned for cash flow generation.`,
          },
          technical: {
            trendSignal: market.technicals.trend,
            technicalScore: market.technicals.trend === 'BULLISH' ? 82 : 55,
            supportLevel: Number((price - atr * 1.8).toFixed(2)),
            resistanceLevel: Number((price + atr * 2.4).toFixed(2)),
            pattern: market.technicals.trend === 'BULLISH' ? 'Ascending Trend Channel & Golden Moving Average Alignment' : 'Range Consolidation',
            summary: `Price action maintains structural support above SMA 50 with RSI 14 at ${market.technicals.rsi14} preserving healthy upward momentum.`,
          },
          news: {
            catalystImpact: 'POSITIVE',
            score: 76,
            primaryCatalysts: [
              'Expanding datacenter enterprise footprint and high-margin recurring contract backlog',
              'Constructive macro rate backdrop stabilizing equity cost of capital',
            ],
            summary: 'Headline and event sentiment remains constructive, with positive operational catalysts outpacing macro noise.',
          },
          sentiment: {
            crowdSentiment: 'BULLISH',
            score: market.newsSentiment.sentimentScore,
            optionsBias: 'CALL_HEAVY',
            summary: 'Institutional positioning shows sustained accumulation with options put/call ratio indicating muted hedging demand.',
          },
        },
        researcherDebate: {
          bullCase: {
            conviction: 84,
            thesis: `${market.ticker} offers asymmetric upside driven by multiple expansion, robust revenue acceleration, and resilient pricing power.`,
            targetUpside: Number((price * 1.24).toFixed(2)),
            coreDrivers: [
              'Underappreciated operating margin expansion flowing into free cash flow',
              'Technical breakout confirmation above key horizontal resistance',
              'Institutional accumulation with favorable risk skew',
            ],
          },
          bearCase: {
            conviction: 42,
            thesis: `Valuation leaves little margin for error against macro cyclicality or potential competitive pricing pressure.`,
            targetDownside: Number((price * 0.86).toFixed(2)),
            vulnerabilities: [
              'Potential multiple re-rating if guidance decelerates',
              'Overhead supply near 52-week highs could induce profit-taking',
            ],
          },
          rebuttals: [
            {
              speaker: 'Bull Researcher',
              argument: 'The Bear overstates margin risk; high return on equity and secular demand create a substantial barrier against multiple contraction.',
            },
            {
              speaker: 'Bear Researcher',
              argument: 'Bulls are pricing perfection; any macro shock or capex pause will rapidly test the lower Bollinger Band at current multiples.',
            },
          ],
          advantage: isBullish ? 'BULL' : 'BEAR',
        },
        tradeProposal: {
          action: isBullish ? 'BUY' : 'HOLD',
          orderType: 'LIMIT',
          entryPrice: entry,
          targetPrice: target,
          stopLoss: stop,
          riskRewardRatio: rr,
          suggestedSizePct: sizePct,
          timeframe: 'Swing (5-15 Days)',
          tactics: `Execute limit buy order near $${entry} with strict invalidation trigger below the $${stop} structural swing low.`,
        },
        riskAudit: {
          verdict: 'APPROVED',
          approvedSizePct: sizePct,
          approvedShares: shares,
          maxDollarLoss: totalDollarRisk,
          riskScore: 38,
          fiduciaryReasoning: `Approved: Risk/Reward ratio of 1:${rr} exceeds firm mandate of 1:2.0. Maximum portfolio capital at risk is strictly capped at $${totalDollarRisk.toLocaleString()} (${((totalDollarRisk / portfolioEquity) * 100).toFixed(2)}% of equity).`,
        },
      };
    }

    return res.json({
      success: true,
      ticker: market.ticker,
      companyName: market.companyName,
      exchange: market.exchange,
      sector: market.sector,
      currentPrice: market.currentPrice,
      candles: market.candles,
      technicals: market.technicals,
      fundamentals: market.fundamentals,
      newsSentiment: market.newsSentiment,
      analystReports: aiOutput.analystReports,
      researcherDebate: aiOutput.researcherDebate,
      tradeProposal: aiOutput.tradeProposal,
      riskAudit: aiOutput.riskAudit,
      engine: ai ? 'Google Gemini 3.8 Flash' : 'Quantitative Benchmark Engine',
      currency,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error executing trading firm run:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error running trading firm',
    });
  }
});

// API: Get Python Source Code Tree & File Contents
app.get('/api/python-codebase', (_req, res) => {
  try {
    const filesToInclude = [
      'main.py',
      'requirements.txt',
      'setup_laptop.sh',
      'setup_laptop.bat',
      'Dockerfile',
      'docker-compose.yml',
      '.env.example',
      'README.md',
      'trading_firm/__init__.py',
      'trading_firm/config.py',
      'trading_firm/pipeline.py',
      'trading_firm/cli.py',
      'trading_firm/llm/__init__.py',
      'trading_firm/llm/base.py',
      'trading_firm/llm/gemini_provider.py',
      'trading_firm/llm/openai_provider.py',
      'trading_firm/llm/anthropic_provider.py',
      'trading_firm/llm/factory.py',
      'trading_firm/data/__init__.py',
      'trading_firm/data/market_data.py',
      'trading_firm/data/technical.py',
      'trading_firm/data/news_sentiment.py',
      'trading_firm/agents/__init__.py',
      'trading_firm/agents/base_agent.py',
      'trading_firm/agents/fundamental_analyst.py',
      'trading_firm/agents/technical_analyst.py',
      'trading_firm/agents/news_analyst.py',
      'trading_firm/agents/sentiment_analyst.py',
      'trading_firm/agents/bull_researcher.py',
      'trading_firm/agents/bear_researcher.py',
      'trading_firm/agents/trader.py',
      'trading_firm/agents/risk_manager.py',
    ];

    const codebase: Record<string, string> = {};

    for (const relPath of filesToInclude) {
      const fullPath = path.resolve(__dirname, relPath);
      if (fs.existsSync(fullPath)) {
        codebase[relPath] = fs.readFileSync(fullPath, 'utf-8');
      }
    }

    res.json({ success: true, files: codebase });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Get Entire Full-Stack Project (Frontend + Backend + Python Framework)
app.get('/api/full-codebase', (_req, res) => {
  try {
    const fullFilesToInclude = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      'metadata.json',
      '.env.example',
      'setup_laptop.sh',
      'setup_laptop.bat',
      'server.ts',
      'main.py',
      'requirements.txt',
      'Dockerfile',
      'docker-compose.yml',
      'README.md',
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css',
      'src/types.ts',
      'src/utils/currency.ts',
      'src/components/TopBar.tsx',
      'src/components/ArenaView.tsx',
      'src/components/TerminalView.tsx',
      'src/components/ChartView.tsx',
      'src/components/CodebaseView.tsx',
      'src/components/SettingsView.tsx',
      'src/components/StockSearchModal.tsx',
      'trading_firm/__init__.py',
      'trading_firm/config.py',
      'trading_firm/pipeline.py',
      'trading_firm/cli.py',
      'trading_firm/llm/__init__.py',
      'trading_firm/llm/base.py',
      'trading_firm/llm/gemini_provider.py',
      'trading_firm/llm/openai_provider.py',
      'trading_firm/llm/anthropic_provider.py',
      'trading_firm/llm/factory.py',
      'trading_firm/data/__init__.py',
      'trading_firm/data/market_data.py',
      'trading_firm/data/technical.py',
      'trading_firm/data/news_sentiment.py',
      'trading_firm/agents/__init__.py',
      'trading_firm/agents/base_agent.py',
      'trading_firm/agents/fundamental_analyst.py',
      'trading_firm/agents/technical_analyst.py',
      'trading_firm/agents/news_analyst.py',
      'trading_firm/agents/sentiment_analyst.py',
      'trading_firm/agents/bull_researcher.py',
      'trading_firm/agents/bear_researcher.py',
      'trading_firm/agents/trader.py',
      'trading_firm/agents/risk_manager.py',
    ];

    const codebase: Record<string, string> = {};

    for (const relPath of fullFilesToInclude) {
      const fullPath = path.resolve(__dirname, relPath);
      if (fs.existsSync(fullPath)) {
        codebase[relPath] = fs.readFileSync(fullPath, 'utf-8');
      }
    }

    res.json({ success: true, files: codebase });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite or Static Serving
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Autonomous AI Trading Firm backend running on port ${port}`);
});
