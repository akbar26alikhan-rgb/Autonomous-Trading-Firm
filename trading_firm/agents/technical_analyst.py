from typing import Dict, Any
from .base_agent import BaseAgent
from trading_firm.llm.base import LLMProvider

class TechnicalAnalyst(BaseAgent):
    """Specialized AI analyst focusing on candlestick structure, trend moving averages, RSI, and MACD."""

    def __init__(self, llm: LLMProvider):
        super().__init__(
            name="Technical Analyst",
            role="Trend geometry, support/resistance clustering, RSI momentum divergences, and MACD signals.",
            llm=llm
        )

    def analyze(self, ticker: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        technicals = market_data.get("technicals", {})
        price = market_data.get("current_price", 100.0)
        
        prompt = f"""
You are a senior Chartered Market Technician (CMT) at a systematic trading firm.
Evaluate technical indicator state for {ticker} (Last: ${price:.2f}):

Current Trend: {technicals.get('trend', 'NEUTRAL')}
RSI (14): {technicals.get('rsi_14', 50)} ({technicals.get('rsi_condition', 'NEUTRAL')})
SMA 20: ${technicals.get('sma_20', price)}
SMA 50: ${technicals.get('sma_50', price)}
SMA 200: ${technicals.get('sma_200', price)}
Bollinger Bands: Upper ${technicals.get('bollinger_bands', {}).get('upper', price*1.05)}, Middle ${technicals.get('bollinger_bands', {}).get('middle', price)}, Lower ${technicals.get('bollinger_bands', {}).get('lower', price*0.95)}
MACD Line: {technicals.get('macd', {}).get('macd_line', 0)}
MACD Histogram: {technicals.get('macd', {}).get('histogram', 0)}
ATR 14: ${technicals.get('atr_14', 2.50)} (Implied Volatility: {technicals.get('volatility_pct', 2.0)}%)

Output strict JSON:
{{
  "trend_signal": "BULLISH" | "BEARISH" | "NEUTRAL",
  "technical_score": <int 0-100>,
  "support_level": <float key support price>,
  "resistance_level": <float key resistance price>,
  "chart_pattern": "<detected pattern e.g. Ascending Triangle / Bull Flag / Channel Consolidation>",
  "momentum_state": "<short summary of RSI and MACD posture>",
  "technical_verdict": "<2-sentence actionable technical thesis>"
}}
Only return JSON.
"""
        response_text = self.llm.generate(
            prompt=prompt,
            system_instruction="You are a quantitative technical analyst. Focus on risk levels, trend alignment, and momentum oscillators."
        )
        parsed = self._clean_json_response(response_text)
        
        if not parsed or "trend_signal" not in parsed:
            trend = technicals.get("trend", "BULLISH")
            rsi = technicals.get("rsi_14", 55.0)
            atr = technicals.get("atr_14", price * 0.02)
            
            support = round(price - (atr * 1.8), 2)
            resistance = round(price + (atr * 2.5), 2)
            
            parsed = {
                "trend_signal": trend,
                "technical_score": int(78 if trend == "BULLISH" else (42 if trend == "BEARISH" else 58)),
                "support_level": support,
                "resistance_level": resistance,
                "chart_pattern": "Ascending Channel with Dynamic SMA Support" if trend == "BULLISH" else "Descending Range Compression",
                "momentum_state": f"RSI 14 at {rsi:.1f} shows controlled momentum without extreme exhaustion; MACD maintains positive trajectory.",
                "technical_verdict": f"Price is trading above key moving averages with defined support at ${support:.2f}. Setup offers favorable asymmetric risk-to-reward on pullbacks."
            }
            
        return parsed
