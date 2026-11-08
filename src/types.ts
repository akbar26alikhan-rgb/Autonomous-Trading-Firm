export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalData {
  rsi14: number;
  rsiCondition: string;
  sma20: number;
  sma50: number;
  sma200: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  macd: {
    line: number;
    histogram: number;
  };
  atr14: number;
  volatilityPct: number;
}

export interface FundamentalData {
  peRatio: number;
  forwardPe: number;
  pegRatio: number;
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  debtToEquity: number;
  currentRatio: number;
  roe: number;
  targetPrice: number;
  marketCap: number;
  high52w: number;
  low52w: number;
}

export interface NewsSentimentData {
  sentimentScore: number;
  sentimentLabel: string;
  fearGreedIndex: number;
  fearGreedLabel: string;
  putCallRatio: number;
  mentionVolume: string;
  headlines: string[];
}

export interface FundamentalReport {
  valuationVerdict: 'UNDERVALUED' | 'FAIRLY_VALUED' | 'OVERVALUED';
  healthScore: number;
  fairValueEstimate: number;
  strengths: string[];
  vulnerabilities: string[];
  summary: string;
}

export interface TechnicalReport {
  trendSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  technicalScore: number;
  supportLevel: number;
  resistanceLevel: number;
  pattern: string;
  summary: string;
}

export interface NewsReport {
  catalystImpact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  score: number;
  primaryCatalysts: string[];
  summary: string;
}

export interface SentimentReport {
  crowdSentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  score: number;
  optionsBias: string;
  summary: string;
}

export interface AnalystReports {
  fundamental: FundamentalReport;
  technical: TechnicalReport;
  news: NewsReport;
  sentiment: SentimentReport;
}

export interface ResearcherDebate {
  bullCase: {
    conviction: number;
    thesis: string;
    targetUpside: number;
    coreDrivers: string[];
  };
  bearCase: {
    conviction: number;
    thesis: string;
    targetDownside: number;
    vulnerabilities: string[];
  };
  rebuttals: Array<{
    speaker: string;
    argument: string;
  }>;
  advantage: 'BULL' | 'BEAR';
}

export interface TradeProposal {
  action: 'BUY' | 'SELL' | 'HOLD';
  orderType: 'LIMIT' | 'MARKET';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: number;
  suggestedSizePct: number;
  timeframe: string;
  tactics: string;
}

export interface RiskAudit {
  verdict: 'APPROVED' | 'MODIFIED' | 'REJECTED';
  approvedSizePct: number;
  approvedShares: number;
  maxDollarLoss: number;
  riskScore: number;
  fiduciaryReasoning: string;
}

export interface FirmRunResult {
  ticker: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  candles: Candle[];
  technicals: TechnicalData;
  fundamentals: FundamentalData;
  newsSentiment: NewsSentimentData;
  analystReports: AnalystReports;
  researcherDebate: ResearcherDebate;
  tradeProposal: TradeProposal;
  riskAudit: RiskAudit;
  engine: string;
  timestamp: string;
}
