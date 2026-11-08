from typing import Dict, Any
from .base_agent import BaseAgent
from trading_firm.llm.base import LLMProvider

class TraderAgent(BaseAgent):
    """Execution Trader agent formulating actionable orders with entry, stop loss, and target prices."""

    def __init__(self, llm: LLMProvider):
        super().__init__(
            name="Execution Trader",
            role="Synthesis of analyst reports and researcher debate into an optimized trade order ticket with calculated R:R.",
            llm=llm
        )

    def propose_trade(
        self,
        ticker: str,
        analyst_reports: Dict[str, Any],
        debate_result: Dict[str, Any],
        market_data: Dict[str, Any],
        risk_tolerance: str = "moderate"
    ) -> Dict[str, Any]:
        price = market_data.get("current_price", 100.0)
        atr = market_data.get("technicals", {}).get("atr_14", price * 0.02)
        bull_conv = debate_result.get("bull_case", {}).get("conviction_score", 70)
        bear_conv = debate_result.get("bear_case", {}).get("conviction_score", 40)
        
        prompt = f"""
You are the Head Execution Trader at an institutional quantitative trading firm.
You have received the comprehensive intelligence package for {ticker} (Market Price: ${price:.2f}):

Analyst Reports Summary:
- Fundamental Verdict: {analyst_reports.get('fundamental', {}).get('valuation_verdict', 'N/A')} (Health: {analyst_reports.get('fundamental', {}).get('fundamental_health_score', 70)}/100)
- Technical Trend: {analyst_reports.get('technical', {}).get('trend_signal', 'N/A')} (Support: ${analyst_reports.get('technical', {}).get('support_level', 0)}, Resistance: ${analyst_reports.get('technical', {}).get('resistance_level', 0)})
- News Catalyst Impact: {analyst_reports.get('news', {}).get('catalyst_impact', 'N/A')} (Score: {analyst_reports.get('news', {}).get('news_sentiment_score', 70)}/100)
- Sentiment Crowd: {analyst_reports.get('sentiment', {}).get('crowd_sentiment', 'N/A')}

Researcher Debate Resolution:
- Bull Conviction: {bull_conv}%
- Bear Conviction: {bear_conv}%
- Risk Tolerance Setting: {risk_tolerance}

Design an exact, mathematically sound Trade Proposal in JSON format:
{{
  "action": "BUY" | "SELL" | "HOLD",
  "order_type": "LIMIT" | "MARKET",
  "entry_price": <float optimal entry price>,
  "target_price": <float target price for taking profit>,
  "stop_loss": <float defensive stop loss price>,
  "risk_reward_ratio": <float e.g. 2.75 for 1:2.75 risk-to-reward>,
  "suggested_position_size_pct": <float between 2.0 and 10.0 representing % of total equity>,
  "timeframe": "<e.g. Swing (5-15 Days) | Tactical (2-6 Weeks) | Position (1-3 Months)>",
  "execution_tactics": "<2-sentence explanation of entry trigger and execution approach>",
  "trade_thesis": "<comprehensive 2-sentence rationale for the trade>"
}}
Only return JSON.
"""
        response_text = self.llm.generate(
            prompt=prompt,
            system_instruction="You are a seasoned institutional trader. Prioritize capital preservation, favorable risk/reward >= 1:2.0, and precise levels."
        )
        parsed = self._clean_json_response(response_text)
        
        if not parsed or "action" not in parsed:
            # Fallback deterministic math
            is_buy = bull_conv >= bear_conv
            action = "BUY" if is_buy else "HOLD"
            
            if action == "BUY":
                entry = round(price * 0.995, 2)
                stop_loss = round(entry - (atr * 1.5), 2)
                risk_amt = max(entry - stop_loss, 0.5)
                target = round(entry + (risk_amt * 2.6), 2)
                rr = round((target - entry) / risk_amt, 2)
                size_pct = 7.5 if risk_tolerance == "aggressive" else (5.0 if risk_tolerance == "moderate" else 3.5)
            else:
                entry = price
                stop_loss = round(price * 0.95, 2)
                target = round(price * 1.08, 2)
                rr = 1.6
                size_pct = 0.0

            parsed = {
                "action": action,
                "order_type": "LIMIT",
                "entry_price": entry,
                "target_price": target,
                "stop_loss": stop_loss,
                "risk_reward_ratio": rr,
                "suggested_position_size_pct": size_pct,
                "timeframe": "Swing (5-15 Days)",
                "execution_tactics": f"Scale into position near ${entry:.2f} limit order with defensive stop anchored below key technical support at ${stop_loss:.2f}.",
                "trade_thesis": f"Favorable asymmetric setup supported by high bull conviction ({bull_conv}%), bullish indicator alignment, and defined risk limit."
            }
            
        return parsed
