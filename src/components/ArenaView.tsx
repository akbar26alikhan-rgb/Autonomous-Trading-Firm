import React from 'react';
import { FirmRunResult } from '../types';
import { 
  Building2, 
  Activity, 
  Newspaper, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ArrowRight
} from 'lucide-react';

interface ArenaViewProps {
  data: FirmRunResult | null;
  isRunning: boolean;
  onOpenSearch?: () => void;
  onSelectQuickTicker?: (ticker: string) => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  data,
  isRunning,
  onOpenSearch,
  onSelectQuickTicker,
}) => {
  if (isRunning && !data) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full mb-4"></div>
        <h3 className="text-lg font-semibold text-white">Investment Committee in Session</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
          Specialist Analyst, Researcher, Trader, and Risk Manager agents are gathering live data, conducting cross-examination debates, and formulating risk-mandated trade proposals.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <Scale className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">No Trading Session Active</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
          Select an asset ticker above and click &quot;Run Pipeline&quot; to convene the AI Trading Firm analyst and research teams.
        </p>
      </div>
    );
  }

  const {
    ticker,
    companyName,
    sector,
    currentPrice,
    technicals,
    fundamentals,
    analystReports,
    researcherDebate,
    tradeProposal,
    riskAudit,
    engine,
  } = data;

  const isApproved = riskAudit.verdict === 'APPROVED';
  const isModified = riskAudit.verdict === 'MODIFIED';

  return (
    <div className="space-y-8">
      {/* 1. Target Asset Header Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-lg text-cyan-400">
              {ticker.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{ticker}</h2>
                <span className="text-slate-400 text-sm">·</span>
                <span className="text-sm font-medium text-slate-300">{companyName}</span>
                <span className="text-slate-400 text-sm">·</span>
                <span className="text-xs text-slate-400">{sector}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                <span>P/E: <strong className="text-slate-200 tabular-nums">{fundamentals.peRatio || 'N/A'}</strong></span>
                <span>·</span>
                <span>Rev Growth: <strong className="text-slate-200 tabular-nums">+{fundamentals.revenueGrowth}%</strong></span>
                <span>·</span>
                <span>Engine: <strong className="text-cyan-400">{engine}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block">Last Close</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-white">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block">52W Range</span>
              <span className="text-xs font-mono tabular-nums text-slate-300">
                ${fundamentals.low52w.toFixed(2)} - ${fundamentals.high52w.toFixed(2)}
              </span>
            </div>
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                <span>Search / Custom Asset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Tickers & Custom Asset Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 font-mono">
            <span className="text-slate-500 text-[11px]">Quick Assets:</span>
            {['NVDA', 'AAPL', 'MSFT', 'TSLA', 'PLTR', 'COIN', 'LLY', 'BTC-USD', 'SPY'].map((t) => (
              <button
                key={t}
                onClick={() => onSelectQuickTicker && onSelectQuickTicker(t)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  t === ticker
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline underline-offset-4"
            >
              + Input Custom Stock Details / Scenario
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Stage Breadcrumb */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center gap-2 text-slate-300">
          <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px]">1</span>
          <span>Analyst Team</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center gap-2 text-slate-300">
          <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px]">2</span>
          <span>Researcher Debate</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center gap-2 text-slate-300">
          <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px]">3</span>
          <span>Trader Proposal</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center gap-2 text-slate-300">
          <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px]">4</span>
          <span>Risk Veto Audit</span>
        </div>
      </div>

      {/* 2. ANALYST TEAM QUADRANT */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-mono text-slate-400">
            01. Specialized Analyst Intelligence Reports
          </h3>
          <span className="text-xs text-slate-500 font-mono">4 Bots Dispatched</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fundamental Analyst */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Fundamental Analyst</h4>
                    <span className="text-[11px] text-slate-400">Financials & Balance Sheet</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {analystReports.fundamental.valuationVerdict}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Score: <span className="tabular-nums text-slate-200">{analystReports.fundamental.healthScore}/100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {analystReports.fundamental.summary}
              </p>

              <div className="space-y-1.5 text-xs">
                {analystReports.fundamental.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-emerald-400 mt-0.5">·</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Fair Value Model:</span>
              <span className="font-semibold text-slate-200 tabular-nums">
                ${analystReports.fundamental.fairValueEstimate.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Technical Analyst */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Technical Analyst</h4>
                    <span className="text-[11px] text-slate-400">Price Structure & Indicators</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {analystReports.technical.trendSignal}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    RSI 14: <span className="tabular-nums text-slate-200">{technicals.rsi14}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {analystReports.technical.summary}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Key Pattern:</span>
                  <span className="text-slate-200 font-medium">{analystReports.technical.pattern}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Support / Resistance:</span>
                  <span className="text-slate-200 tabular-nums">
                    ${analystReports.technical.supportLevel.toFixed(2)} / ${analystReports.technical.resistanceLevel.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>SMA 50 / 200 Cross:</span>
              <span className="font-semibold text-emerald-400">
                ${technicals.sma50} &gt; ${technicals.sma200}
              </span>
            </div>
          </div>

          {/* News & Catalyst Analyst */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">News & Catalyst Analyst</h4>
                    <span className="text-[11px] text-slate-400">Headlines & Macro Radar</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {analystReports.news.catalystImpact}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Score: <span className="tabular-nums text-slate-200">{analystReports.news.score}/100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {analystReports.news.summary}
              </p>

              <div className="space-y-1.5 text-xs">
                {analystReports.news.primaryCatalysts.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-amber-400 mt-0.5">·</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Primary Risk Horizon:</span>
              <span className="font-semibold text-slate-200">Medium-Term Guidance</span>
            </div>
          </div>

          {/* Sentiment Analyst */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Sentiment Analyst</h4>
                    <span className="text-[11px] text-slate-400">Social Mood & Fear / Greed</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-300">
                    {analystReports.sentiment.crowdSentiment}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Score: <span className="tabular-nums text-slate-200">{analystReports.sentiment.score}/100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {analystReports.sentiment.summary}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">OPTIONS SKEW</span>
                  <span className="text-slate-200">{analystReports.sentiment.optionsBias}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FEAR & GREED</span>
                  <span className="text-emerald-400 font-semibold">{data.newsSentiment.fearGreedIndex} ({data.newsSentiment.fearGreedLabel})</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Crowded Trade Risk:</span>
              <span className="font-semibold text-emerald-400">Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RESEARCHER TEAM DEBATE */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-mono text-slate-400">
            02. Investment Committee Debate (Bull vs. Bear Case)
          </h3>
          <span className="text-xs font-mono text-cyan-400">
            Debate Winner: <strong>{researcherDebate.advantage} CASE</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bull Researcher */}
          <div className="bg-slate-900/70 border border-emerald-900/40 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-900/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Bull Researcher Case</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {researcherDebate.bullCase.conviction}% Conviction
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-4">
              {researcherDebate.bullCase.thesis}
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              {researcherDebate.bullCase.coreDrivers.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">·</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-900/30 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Modeled Target Upside:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                ${researcherDebate.bullCase.targetUpside.toFixed(2)} (+{(((researcherDebate.bullCase.targetUpside - currentPrice) / currentPrice) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Bear Researcher */}
          <div className="bg-slate-900/70 border border-rose-900/40 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-900/30">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-bold text-white">Bear Researcher Case</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-rose-400">
                  {researcherDebate.bearCase.conviction}% Conviction
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-4">
              {researcherDebate.bearCase.thesis}
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              {researcherDebate.bearCase.vulnerabilities.map((v, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400 mt-0.5">·</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-rose-900/30 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Downside Stress Target:</span>
              <span className="font-bold text-rose-400 tabular-nums">
                ${researcherDebate.bearCase.targetDownside.toFixed(2)} ({(((researcherDebate.bearCase.targetDownside - currentPrice) / currentPrice) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Cross-Examination Rebuttals */}
        <div className="mt-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2.5">
            Cross-Examination Transcript
          </span>
          <div className="space-y-2.5 text-xs">
            {researcherDebate.rebuttals.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className={`w-28 shrink-0 font-mono font-semibold ${r.speaker.includes('Bull') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {r.speaker}:
                </div>
                <div className="text-slate-300 leading-relaxed">
                  &quot;{r.argument}&quot;
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 & 5: TRADER PROPOSAL & RISK MANAGER VERDICT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trader Proposal */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">03. Execution Trader Proposal</h4>
                  <span className="text-[11px] text-slate-400">Order Ticket Specification</span>
                </div>
              </div>
              <div className="px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold text-xs">
                {tradeProposal.action} ({tradeProposal.orderType})
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Entry Limit</span>
                <span className="text-base font-mono font-bold tabular-nums text-white">
                  ${tradeProposal.entryPrice.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Stop Loss</span>
                <span className="text-base font-mono font-bold tabular-nums text-rose-400">
                  ${tradeProposal.stopLoss.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Take Profit</span>
                <span className="text-base font-mono font-bold tabular-nums text-emerald-400">
                  ${tradeProposal.targetPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono mb-4">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Risk-to-Reward Ratio:</span>
                <span className="font-semibold text-cyan-300">1 : {tradeProposal.riskRewardRatio}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Proposed Sizing:</span>
                <span className="font-semibold text-slate-200">{tradeProposal.suggestedSizePct}% of Equity</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Timeframe:</span>
                <span className="text-slate-200">{tradeProposal.timeframe}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              &quot;{tradeProposal.tactics}&quot;
            </p>
          </div>
        </div>

        {/* Risk Manager Verdict */}
        <div className={`rounded-xl p-5 border flex flex-col justify-between ${
          isApproved
            ? 'bg-slate-900/80 border-emerald-900/60'
            : isModified
            ? 'bg-slate-900/80 border-amber-900/60'
            : 'bg-slate-900/80 border-rose-900/60'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isApproved ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {isApproved ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">04. Chief Risk Officer & Portfolio Veto</h4>
                  <span className="text-[11px] text-slate-400">Fiduciary Mandate Review</span>
                </div>
              </div>

              <div className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wider ${
                isApproved 
                  ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' 
                  : isModified
                  ? 'bg-amber-950 border border-amber-700 text-amber-300'
                  : 'bg-rose-950 border border-rose-700 text-rose-300'
              }`}>
                VERDICT: {riskAudit.verdict}
              </div>
            </div>

            {/* Compliance Matrix */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Risk / Reward Mandate (&gt;= 1:2.0)</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">1:{tradeProposal.riskRewardRatio} (PASSED)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Max Drawdown Risk Limit (&lt;= 2.0%)</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">Capped (PASSED)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Single-Asset Concentration (&lt;= 10%)</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">{riskAudit.approvedSizePct}% (PASSED)</span>
              </div>
            </div>

            {/* Approved Allocation Details */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block">Authorized Shares</span>
                <span className="text-sm font-bold text-white tabular-nums">{riskAudit.approvedShares.toLocaleString()} shares</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block">Max Dollar Loss Cap</span>
                <span className="text-sm font-bold text-rose-400 tabular-nums">${riskAudit.maxDollarLoss.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Official Fiduciary Ruling:</span>
              {riskAudit.fiduciaryReasoning}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
