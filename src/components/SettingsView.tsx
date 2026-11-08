import React from 'react';
import { ShieldCheck, Cpu, Database, Container, IndianRupee, DollarSign } from 'lucide-react';
import { CurrencyCode } from '../utils/currency';

interface SettingsViewProps {
  portfolioEquity: number;
  setPortfolioEquity: (val: number) => void;
  riskTolerance: string;
  setRiskTolerance: (val: string) => void;
  maxPositionSizePct: number;
  setMaxPositionSizePct: (val: number) => void;
  activeProvider: string;
  setActiveProvider: (val: string) => void;
  currency?: CurrencyCode;
  setCurrency?: (val: CurrencyCode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  portfolioEquity,
  setPortfolioEquity,
  riskTolerance,
  setRiskTolerance,
  maxPositionSizePct,
  setMaxPositionSizePct,
  activeProvider,
  setActiveProvider,
  currency = 'INR',
  setCurrency,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Trading Firm Risk Mandates & LLM Configuration</h3>
        <p className="text-xs text-slate-400 mt-1">
          Adjust the institutional guardrails enforced by the Chief Risk Officer, select currency denomination, and configure provider engines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Mandates */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">Chief Risk Officer Mandates</h4>
          </div>

          {/* Currency Denomination */}
          {setCurrency && (
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                Valuation Currency Denomination
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('INR')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border flex items-center justify-center gap-2 transition-all ${
                    currency === 'INR'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Indian Rupee (₹ INR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border flex items-center justify-center gap-2 transition-all ${
                    currency === 'USD'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>US Dollar ($ USD)</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">
              Portfolio Total Equity ({currency === 'INR' ? '₹ INR' : '$ USD'})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono text-slate-500 font-bold">
                {currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                value={portfolioEquity}
                onChange={(e) => setPortfolioEquity(Math.max(1000, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {currency === 'INR'
                ? 'Used for exact Rupee position sizing and VaR limits (default ₹10,00,000 = 10 Lakhs INR).'
                : 'Used for exact Dollar position sizing and Value-at-Risk limits (default $100,000 USD).'}
            </span>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">
              Risk Tolerance Posture
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'moderate', 'aggressive'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRiskTolerance(mode)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium capitalize border transition-all ${
                    riskTolerance === mode
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">
              Max Position Allocation Cap: <strong className="text-cyan-400 tabular-nums">{maxPositionSizePct}%</strong>
            </label>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={maxPositionSizePct}
              onChange={(e) => setMaxPositionSizePct(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>2% Conservative</span>
              <span>10% Standard</span>
              <span>20% High Risk</span>
            </div>
          </div>
        </div>

        {/* LLM & Model Engine Configuration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Multi-Provider LLM Engine</h4>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">
              Primary Agent LLM Provider
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: 'gemini', label: 'Google Gemini', model: 'gemini-3.8-flash' },
                { id: 'openai', label: 'OpenAI GPT', model: 'gpt-4o' },
                { id: 'anthropic', label: 'Anthropic Claude', model: 'claude-3-5' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setActiveProvider(prov.id)}
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    activeProvider === prov.id
                      ? 'bg-cyan-950/70 border-cyan-700 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs font-bold font-mono">{prov.label}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{prov.model}</span>
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 leading-relaxed block">
              Google Gemini is integrated directly into this full-stack environment using the modern <code className="text-cyan-300">@google/genai</code> SDK and <code className="text-cyan-300">gemini-3.8-flash</code>.
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-white">Financial Data Sources</span>
            </div>
            <p className="text-xs text-slate-400">
              The framework connects to Yahoo Finance for live price history, balance sheets, and technical series. You can also plug in Alpha Vantage or Polygon API keys in <code className="text-slate-300 font-mono">.env</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Docker Deployment Guide */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Container className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white">Docker & CLI Setup Guide</h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The Python framework is fully containerized. To run your autonomous trading desk inside Docker on your local machine:
        </p>

        <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-200 border border-slate-800 space-y-2">
          <div className="text-slate-400"># 1. Unpack downloaded zip and build container:</div>
          <div className="text-cyan-300">docker compose up --build</div>
          <div className="text-slate-400 mt-2"># 2. Or run ad-hoc command line queries on any ticker:</div>
          <div className="text-cyan-300">python main.py --ticker NVDA --provider gemini --model gemini-3.8-flash</div>
        </div>
      </div>
    </div>
  );
};
