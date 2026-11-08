import React, { useState } from 'react';
import { Play, Terminal, Cpu, LineChart, Code2, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  activeTab: 'arena' | 'terminal' | 'chart' | 'codebase' | 'settings';
  setActiveTab: (tab: 'arena' | 'terminal' | 'chart' | 'codebase' | 'settings') => void;
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  onRunAnalysis: () => void;
  isRunning: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  selectedTicker,
  onSelectTicker,
  onRunAnalysis,
  isRunning,
}) => {
  const [customTicker, setCustomTicker] = useState('');
  const popularTickers = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'BTC-USD', 'ETH-USD', 'AMD', 'SPY'];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTicker.trim()) {
      onSelectTicker(customTicker.trim().toUpperCase());
      setCustomTicker('');
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm font-mono font-bold text-sm tracking-wider">
            AT
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              Autonomous Trading Firm
            </span>
            <span className="text-[11px] text-slate-400 font-mono tracking-wide">
              Multi-Agent Quantitative Committee
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0 p-1 bg-slate-950/60 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'arena'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Agent Arena</span>
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CLI Console</span>
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'chart'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Market & Chart</span>
          </button>
          <button
            onClick={() => setActiveTab('codebase')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'codebase'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python & Docker</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Mandates</span>
          </button>
        </nav>

        {/* Zone 3: Ticker Selector & Primary Run Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <select
              value={popularTickers.includes(selectedTicker) ? selectedTicker : 'CUSTOM'}
              onChange={(e) => {
                if (e.target.value !== 'CUSTOM') {
                  onSelectTicker(e.target.value);
                }
              }}
              aria-label="Select ticker symbol"
              className="bg-transparent text-xs font-mono font-medium text-slate-200 px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              {popularTickers.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-slate-100">
                  {t}
                </option>
              ))}
              {!popularTickers.includes(selectedTicker) && (
                <option value="CUSTOM" className="bg-slate-900 text-slate-100">
                  {selectedTicker}
                </option>
              )}
            </select>
            <form onSubmit={handleCustomSubmit} className="hidden sm:flex items-center">
              <input
                type="text"
                placeholder="Custom..."
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value)}
                className="w-20 bg-slate-900/60 text-xs font-mono text-slate-200 px-2 py-1 rounded border-l border-slate-800 focus:outline-none focus:bg-slate-800 uppercase placeholder:normal-case placeholder:text-slate-500"
              />
            </form>
          </div>

          <button
            onClick={onRunAnalysis}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-slate-950 transition-all whitespace-nowrap shrink-0 shadow-sm ${
              isRunning
                ? 'bg-cyan-600/50 cursor-not-allowed text-slate-400'
                : 'bg-cyan-400 hover:bg-cyan-300 active:scale-95'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-slate-950'}`} />
            <span>{isRunning ? 'Deliberating...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
