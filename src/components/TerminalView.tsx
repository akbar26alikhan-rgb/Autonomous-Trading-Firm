import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, Copy, Check } from 'lucide-react';
import { FirmRunResult } from '../types';

interface TerminalViewProps {
  data: FirmRunResult | null;
  onRunCommand: (cmd: string) => void;
  isRunning: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ data, onRunCommand, isRunning }) => {
  const [inputVal, setInputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([
    '[*] Autonomous AI Trading Firm Terminal v1.0.0',
    '[*] System ready. Python 3.11 runtime active. Docker environment initialized.',
    '[*] Type "python main.py --help" or click a preset below to dispatch the committee.',
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      const fund = data.analystReports.fundamental;
      const tech = data.analystReports.technical;
      const trade = data.tradeProposal;
      const risk = data.riskAudit;

      const lines = [
        `\n================================================================================`,
        `          AUTONOMOUS AI TRADING FIRM  |  MULTI-AGENT RESEARCH DESK`,
        `================================================================================`,
        `[*] Target Asset   : ${data.ticker} ($${data.currentPrice.toFixed(2)})`,
        `[*] LLM Engine     : ${data.engine}`,
        `[*] Status         : Execution complete in 2.14s`,
        ``,
        `--- 1. ANALYST TEAM FINDINGS ---`,
        `  * Fundamental : ${fund.valuationVerdict} (Score: ${fund.healthScore}/100) | Fair: $${fund.fairValueEstimate.toFixed(2)}`,
        `  * Technical   : ${tech.trendSignal} (RSI: ${data.technicals.rsi14}) | Support: $${tech.supportLevel.toFixed(2)} | Resist: $${tech.resistanceLevel.toFixed(2)}`,
        `  * News Radar  : ${data.analystReports.news.catalystImpact} (Score: ${data.analystReports.news.score}/100)`,
        `  * Sentiment   : ${data.analystReports.sentiment.crowdSentiment} (Fear & Greed: ${data.newsSentiment.fearGreedIndex})`,
        ``,
        `--- 2. RESEARCHER COMMITTEE DEBATE ---`,
        `  * Bull Case (Conviction: ${data.researcherDebate.bullCase.conviction}%): ${data.researcherDebate.bullCase.thesis}`,
        `  * Bear Case (Conviction: ${data.researcherDebate.bearCase.conviction}%): ${data.researcherDebate.bearCase.thesis}`,
        `  * Committee Advantage: ${data.researcherDebate.advantage}`,
        ``,
        `--- 3. TRADER EXECUTION PROPOSAL ---`,
        `  * Order Action     : ${trade.action} (${trade.orderType})`,
        `  * Target Entry     : $${trade.entryPrice.toFixed(2)}`,
        `  * Take Profit      : $${trade.targetPrice.toFixed(2)}`,
        `  * Stop Loss        : $${trade.stopLoss.toFixed(2)}`,
        `  * Risk/Reward      : 1:${trade.riskRewardRatio}`,
        `  * Position Sizing  : ${trade.suggestedSizePct}% of equity`,
        ``,
        `--- 4. CHIEF RISK OFFICER AUDIT ---`,
        `  >>> VERDICT: ${risk.verdict} <<<`,
        `  * Authorized Shares: ${risk.approvedShares.toLocaleString()}`,
        `  * Max Dollar Risk  : $${risk.maxDollarLoss.toLocaleString()}`,
        `  * Fiduciary Reason : ${risk.fiduciaryReasoning}`,
        `================================================================================\n`,
      ];

      setHistory((prev) => [...prev, ...lines]);
    }
  }, [data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isRunning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isRunning) return;

    const cmd = inputVal.trim();
    setHistory((prev) => [...prev, `$ ${cmd}`]);
    setInputVal('');

    if (cmd === 'clear') {
      setHistory(['[*] Terminal cleared.']);
      return;
    }

    if (cmd.includes('main.py') || cmd.includes('python')) {
      onRunCommand(cmd);
    } else if (cmd === 'help' || cmd.includes('--help')) {
      setHistory((prev) => [
        ...prev,
        'Options:',
        '  --ticker, -t TEXT      Target ticker symbol (e.g. NVDA, AAPL, TSLA, BTC-USD)',
        '  --provider, -p CHOICE  LLM provider [gemini | openai | anthropic]',
        '  --model, -m TEXT       Model name override (e.g. gemini-3.8-flash)',
        '  --risk, -r CHOICE      Risk tolerance [conservative | moderate | aggressive]',
        '  --equity, -e FLOAT     Portfolio equity in USD (default: 100000)',
        '  --output, -o PATH      Export JSON report to file',
        '  --json                 Print machine-readable JSON to stdout',
      ]);
    } else if (cmd.includes('docker')) {
      setHistory((prev) => [
        ...prev,
        '[+] Building trading-firm container from Dockerfile...',
        '[+] Container ai_trading_firm started.',
        '[+] Dispatching multi-agent committee...',
      ]);
      onRunCommand('python main.py --ticker NVDA');
    } else {
      setHistory((prev) => [
        ...prev,
        `Command executed: "${cmd}". Type "python main.py --ticker <SYMBOL>" to trigger research.`,
      ]);
    }
  };

  const copyLog = () => {
    navigator.clipboard.writeText(history.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    'python main.py --ticker NVDA',
    'python main.py --ticker AAPL --risk conservative',
    'python main.py --ticker TSLA --equity 250000',
    'docker compose up',
    'python main.py --help',
  ];

  return (
    <div className="space-y-4">
      {/* Preset shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Quick CLI Presets:</span>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => {
                setInputVal(p);
              }}
              className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyLog}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Log'}</span>
          </button>
          <button
            onClick={() => setHistory(['[*] Terminal cleared.'])}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
        {/* Titlebar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="ml-2 text-slate-400 text-[11px] font-semibold tracking-wide">
              bash - python3 main.py (AI Trading Firm CLI)
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            x86_64 Linux · Virtualenv Active
          </div>
        </div>

        {/* Console Output Area */}
        <div className="p-4 h-[520px] overflow-y-auto space-y-1 text-slate-200 select-text">
          {history.map((line, i) => (
            <div
              key={i}
              className={`leading-relaxed whitespace-pre-wrap ${
                line.startsWith('$')
                  ? 'text-cyan-400 font-bold'
                  : line.includes('APPROVED')
                  ? 'text-emerald-400 font-bold'
                  : line.includes('REJECTED')
                  ? 'text-rose-400 font-bold'
                  : line.includes('MODIFIED')
                  ? 'text-amber-400 font-bold'
                  : line.includes('Bull Case')
                  ? 'text-emerald-300'
                  : line.includes('Bear Case')
                  ? 'text-rose-300'
                  : line.includes('ANALYST')
                  ? 'text-blue-300'
                  : 'text-slate-300'
              }`}
            >
              {line}
            </div>
          ))}

          {isRunning && (
            <div className="flex items-center gap-2 text-cyan-400 py-1">
              <span className="inline-block animate-spin w-3 h-3 border border-cyan-400 border-t-transparent rounded-full"></span>
              <span>Agents deliberating...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-900/60 p-3 flex items-center gap-2">
          <span className="text-cyan-400 font-bold select-none">&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isRunning}
            placeholder="e.g. python main.py --ticker NVDA --provider gemini"
            className="flex-1 bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-600 font-mono text-xs"
          />
          <button
            type="submit"
            disabled={isRunning}
            className="px-3 py-1 bg-cyan-500 text-slate-950 font-semibold rounded hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-1 transition-all"
          >
            <Play className="w-3 h-3 fill-slate-950" />
            <span>Execute</span>
          </button>
        </form>
      </div>
    </div>
  );
};
