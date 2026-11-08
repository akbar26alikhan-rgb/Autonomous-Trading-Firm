import React, { useState, useEffect } from 'react';
import { Search, X, Sliders, ArrowUpRight, PlusCircle, Check } from 'lucide-react';
import { StockSearchResult, CustomStockDetails } from '../types';

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (ticker: string, customDetails?: CustomStockDetails) => void;
  currentTicker: string;
}

export const StockSearchModal: React.FC<StockSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStock,
  currentTicker,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Custom Stock Details Form State
  const [customTicker, setCustomTicker] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('125.00');
  const [customSector, setCustomSector] = useState('Technology & Cloud');
  const [customPE, setCustomPE] = useState<string>('32.5');
  const [customGrowth, setCustomGrowth] = useState<string>('24.0');
  const [customMargin, setCustomMargin] = useState<string>('68.0');
  const [customDebt, setCustomDebt] = useState<string>('25.0');
  const [customHeadlines, setCustomHeadlines] = useState<string>(
    'Company closes landmark enterprise contracts expanding recurring revenue backlog.\nQuarterly margins outperform consensus estimates with strong operational cash flow.'
  );

  // Fetch search results from server
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      fetch(`/api/search-stocks?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.results) {
            setResults(data.results);
          }
        })
        .catch((err) => console.error('Stock search error:', err));
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = (customTicker || 'CUSTOM').toUpperCase().trim();
    const details: CustomStockDetails = {
      companyName: customName.trim() || `${symbol} Corp`,
      price: parseFloat(customPrice) || 100.0,
      peRatio: parseFloat(customPE) || 25.0,
      revenueGrowth: parseFloat(customGrowth) || 15.0,
      grossMargin: parseFloat(customMargin) || 60.0,
      debtToEquity: parseFloat(customDebt) || 20.0,
      sector: customSector,
      headlines: customHeadlines
        .split('\n')
        .map((h) => h.trim())
        .filter((h) => h.length > 0),
    };

    onSelectStock(symbol, details);
    onClose();
  };

  const filteredResults = selectedSector === 'ALL'
    ? results
    : results.filter((r) => r.sector.toUpperCase().includes(selectedSector));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'search'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Any Stock</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'custom'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Input Custom Stock Details</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 1: Search Any Stock */}
        {activeTab === 'search' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    onSelectStock(query.trim().toUpperCase());
                    onClose();
                  }
                }}
                placeholder="Search by ticker (e.g. PLTR, LLY, TSLA) or company name..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Sector Filters */}
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'TECH', label: 'Tech & AI' },
                { id: 'SEMICONDUCTOR', label: 'Semis' },
                { id: 'CRYPTO', label: 'Crypto' },
                { id: 'HEALTHCARE', label: 'Healthcare' },
                { id: 'FINANCIAL', label: 'Finance' },
                { id: 'RETAIL', label: 'Retail' },
                { id: 'ETF', label: 'Indices' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSector(s.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                    selectedSector === s.id
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Direct Ticker Prompt if not exact match */}
            {query.trim() && (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Can&apos;t find this symbol in suggestions?</span>
                  <div className="text-xs font-mono font-semibold text-white">
                    Analyze <strong className="text-cyan-400">{query.toUpperCase().trim()}</strong> directly
                  </div>
                </div>
                <button
                  onClick={() => {
                    onSelectStock(query.toUpperCase().trim());
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
                >
                  <span>Analyze Ticker</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 block mb-2">
                Available Equities &amp; Assets ({filteredResults.length})
              </span>

              {filteredResults.map((item) => {
                const isSelected = item.ticker === currentTicker;
                return (
                  <button
                    key={item.ticker}
                    onClick={() => {
                      onSelectStock(item.ticker);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-800/80 border-cyan-700/60'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                        {item.ticker.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                            {item.ticker}
                          </span>
                          <span className="text-slate-500 text-xs">·</span>
                          <span className="text-xs text-slate-300 truncate max-w-[240px]">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.sector}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-white tabular-nums">
                        ${item.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        P/E: <span className="text-slate-200 tabular-nums">{item.pe || 'N/A'}</span> · Rev: <span className="text-emerald-400 tabular-nums">+{item.growth}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Input Custom Stock Details */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="p-3 bg-cyan-950/30 border border-cyan-900/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
              Enter custom financial parameters for any public stock, private startup, or hypothetical scenario. The Fundamental, Technical, News, and Risk agents will evaluate your exact inputs.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Ticker Symbol *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PLTR, LLY, INFY, STARTUP"
                  value={customTicker}
                  onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Palantir Technologies Inc."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Share Price (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Sector / Industry
                </label>
                <input
                  type="text"
                  value={customSector}
                  onChange={(e) => setCustomSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Trailing P/E Ratio
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customPE}
                  onChange={(e) => setCustomPE(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  YoY Revenue Growth (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customGrowth}
                  onChange={(e) => setCustomGrowth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Gross Margin (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customMargin}
                  onChange={(e) => setCustomMargin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Debt-to-Equity Ratio
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customDebt}
                  onChange={(e) => setCustomDebt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Recent Headlines &amp; Catalysts (1 per line)
              </label>
              <textarea
                rows={3}
                value={customHeadlines}
                onChange={(e) => setCustomHeadlines(e.target.value)}
                placeholder="e.g. Major contract renewal signed with tier 1 cloud provider..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit &amp; Run Agent Committee</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
