import React, { useState } from 'react';
import { Play, Terminal, Cpu, LineChart, Code2, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  activeTab: 'arena' | 'terminal' | 'chart' | 'codebase' | 'settings';
  setActiveTab: (tab: 'arena' | 'terminal' | 'chart' | 'codebase' | 'settings') => void;
  selectedTicker: string;
  exchange?: string;
  currency: 'INR' | 'USD';
  onToggleCurrency: (currency: 'INR' | 'USD') => void;
  onOpenSearch: () => void;
  onRunAnalysis: () => void;
  isRunning: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  selectedTicker,
  exchange = 'NSE',
  currency,
  onToggleCurrency,
  onOpenSearch,
  onRunAnalysis,
  isRunning,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
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
        <nav className="hidden xl:flex items-center gap-1 shrink-0 p-1 bg-slate-950/60 rounded-lg border border-slate-800">
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

        {/* Zone 3: Search Any Stock & Primary Run Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Currency Toggle */}
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => onToggleCurrency('INR')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                currency === 'INR'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display all prices in Indian Rupee (₹)"
            >
              ₹ INR
            </button>
            <button
              onClick={() => onToggleCurrency('USD')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                currency === 'USD'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display all prices in US Dollars ($)"
            >
              $ USD
            </button>
          </div>

          {/* Prominent Stock Search & Custom Input Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs transition-colors group cursor-pointer"
            title="Search any stock or input custom company details"
          >
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
              exchange === 'BSE'
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : exchange === 'NSE'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : 'bg-blue-950/80 text-blue-300 border-blue-800'
            }`}>
              {exchange}
            </span>
            <span className="font-mono font-bold text-white group-hover:text-cyan-300">
              {selectedTicker}
            </span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">· Search Equities</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 rounded">
              ⌘K
            </kbd>
          </button>

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
