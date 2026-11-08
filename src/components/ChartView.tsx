import React, { useState } from 'react';
import { FirmRunResult } from '../types';
import { formatCurrency, CurrencyCode } from '../utils/currency';

interface ChartViewProps {
  data: FirmRunResult | null;
  currency?: CurrencyCode;
}

export const ChartView: React.FC<ChartViewProps> = ({ data, currency = 'INR' }) => {
  const [showSMA, setShowSMA] = useState(true);
  const [showBB, setShowBB] = useState(true);

  if (!data) {
    return (
      <div className="py-24 text-center">
        <h3 className="text-lg font-semibold text-white">No Market Data Available</h3>
        <p className="text-sm text-slate-400 mt-2">Run the pipeline above to load candlestick and indicator telemetry.</p>
      </div>
    );
  }

  const { candles, technicals, currentPrice, ticker, tradeProposal } = data;
  const displayCandles = candles.slice(-50);

  // Math for SVG Chart
  const svgWidth = 850;
  const svgHeight = 340;
  const padding = { top: 20, right: 60, bottom: 30, left: 20 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const minPrice = Math.min(...displayCandles.map((c) => c.low)) * 0.98;
  const maxPrice = Math.max(...displayCandles.map((c) => c.high)) * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (p: number) => padding.top + chartHeight - ((p - minPrice) / priceRange) * chartHeight;
  const getX = (index: number) => padding.left + (index / (displayCandles.length - 1 || 1)) * chartWidth;
  const candleWidth = Math.max(chartWidth / displayCandles.length - 3, 2);

  // Moving average path
  const sma20Points: string[] = [];
  displayCandles.forEach((c, idx) => {
    const slice = displayCandles.slice(Math.max(0, idx - 19), idx + 1);
    const avg = slice.reduce((a, b) => a + b.close, 0) / slice.length;
    sma20Points.push(`${getX(idx)},${getY(avg)}`);
  });

  return (
    <div className="space-y-6">
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">{ticker} Daily Candlesticks</h3>
            <span className="text-slate-500">·</span>
            <span className="text-sm font-mono text-cyan-400 tabular-nums">{formatCurrency(currentPrice, currency)}</span>
            <span className="text-slate-500">·</span>
            <span className={`text-xs font-mono font-semibold ${technicals.trend === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {technicals.trend} TREND
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Support: {formatCurrency(technicals.sma50, currency)} · Volatility ATR: {formatCurrency(technicals.atr14, currency)} ({technicals.volatilityPct}%)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              showSMA
                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            SMA 20 Overlay
          </button>
          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              showBB
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Bollinger Bands
          </button>
        </div>
      </div>

      {/* Main SVG Candlestick Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const p = minPrice + priceRange * (1 - pct);
            const y = padding.top + chartHeight * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left + chartWidth + 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {formatCurrency(p, currency, { decimals: 1 })}
                </text>
              </g>
            );
          })}

          {/* Trade Proposal Levels: Entry, Target, Stop */}
          {tradeProposal.action !== 'HOLD' && (
            <>
              {/* Take Profit line */}
              <line
                x1={padding.left}
                y1={getY(tradeProposal.targetPrice)}
                x2={padding.left + chartWidth}
                y2={getY(tradeProposal.targetPrice)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text
                x={padding.left + chartWidth + 6}
                y={getY(tradeProposal.targetPrice) + 3}
                fill="#10b981"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                TP {formatCurrency(tradeProposal.targetPrice, currency, { decimals: 1 })}
              </text>

              {/* Stop Loss line */}
              <line
                x1={padding.left}
                y1={getY(tradeProposal.stopLoss)}
                x2={padding.left + chartWidth}
                y2={getY(tradeProposal.stopLoss)}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text
                x={padding.left + chartWidth + 6}
                y={getY(tradeProposal.stopLoss) + 3}
                fill="#f43f5e"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                SL {formatCurrency(tradeProposal.stopLoss, currency, { decimals: 1 })}
              </text>
            </>
          )}

          {/* Candlesticks */}
          {displayCandles.map((c, i) => {
            const x = getX(i);
            const isGreen = c.close >= c.open;
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
            const color = isGreen ? '#10b981' : '#f43f5e';

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}

          {/* SMA 20 Line */}
          {showSMA && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              points={sma20Points.join(' ')}
            />
          )}
        </svg>

        {/* RSI Sub-Panel */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-slate-400">RSI (14):</span>
            <span className="text-sm font-mono font-bold text-white tabular-nums">{technicals.rsi14}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              technicals.rsiCondition === 'OVERBOUGHT'
                ? 'bg-rose-950 text-rose-300'
                : technicals.rsiCondition === 'OVERSOLD'
                ? 'bg-emerald-950 text-emerald-300'
                : 'bg-slate-900 text-slate-300'
            }`}>
              {technicals.rsiCondition}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Overbought Threshold: 70 · Oversold: 30
          </div>
        </div>
      </div>
    </div>
  );
};
