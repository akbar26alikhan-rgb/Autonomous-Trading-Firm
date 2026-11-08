import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { ArenaView } from './components/ArenaView';
import { TerminalView } from './components/TerminalView';
import { ChartView } from './components/ChartView';
import { CodebaseView } from './components/CodebaseView';
import { SettingsView } from './components/SettingsView';
import { FirmRunResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'arena' | 'terminal' | 'chart' | 'codebase' | 'settings'>('arena');
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  const [portfolioEquity, setPortfolioEquity] = useState<number>(100000);
  const [riskTolerance, setRiskTolerance] = useState<string>('moderate');
  const [maxPositionSizePct, setMaxPositionSizePct] = useState<number>(10);
  const [activeProvider, setActiveProvider] = useState<string>('gemini');

  const [firmData, setFirmData] = useState<FirmRunResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (tickerToRun: string = selectedTicker) => {
    try {
      setIsRunning(true);
      setError(null);

      const res = await fetch('/api/run-firm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: tickerToRun,
          riskTolerance,
          portfolioEquity,
          maxPositionSizePct,
          provider: activeProvider,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to complete trading firm run');
      }

      setFirmData(json);
    } catch (err: any) {
      console.error('Failed to run trading firm analysis:', err);
      setError(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  // Run initial session on mount
  useEffect(() => {
    runAnalysis('NVDA');
  }, []);

  const handleTerminalCommand = (cmd: string) => {
    // Extract ticker from command if present: --ticker <TICKER> or -t <TICKER>
    const match = cmd.match(/(?:--ticker|-t)\s+([A-Za-z0-9\-_]+)/);
    const target = match ? match[1].toUpperCase() : selectedTicker;
    if (target !== selectedTicker) {
      setSelectedTicker(target);
    }
    runAnalysis(target);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Header */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTicker={selectedTicker}
        onSelectTicker={(t) => {
          setSelectedTicker(t);
          runAnalysis(t);
        }}
        onRunAnalysis={() => runAnalysis(selectedTicker)}
        isRunning={isRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono flex items-center justify-between">
            <span>Execution Notice: {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'arena' && <ArenaView data={firmData} isRunning={isRunning} />}
        {activeTab === 'terminal' && (
          <TerminalView
            data={firmData}
            onRunCommand={handleTerminalCommand}
            isRunning={isRunning}
          />
        )}
        {activeTab === 'chart' && <ChartView data={firmData} />}
        {activeTab === 'codebase' && <CodebaseView />}
        {activeTab === 'settings' && (
          <SettingsView
            portfolioEquity={portfolioEquity}
            setPortfolioEquity={setPortfolioEquity}
            riskTolerance={riskTolerance}
            setRiskTolerance={setRiskTolerance}
            maxPositionSizePct={maxPositionSizePct}
            setMaxPositionSizePct={setMaxPositionSizePct}
            activeProvider={activeProvider}
            setActiveProvider={setActiveProvider}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Autonomous AI Trading Firm Framework</span>
            <span>·</span>
            <span>Multi-Agent Research Committee</span>
          </div>
          <div>
            <span>Dockerized CLI Runtime · MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
