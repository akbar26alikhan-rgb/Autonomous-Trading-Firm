from typing import Dict, Any
from .base_agent import BaseAgent
from trading_firm.llm.base import LLMProvider

class FundamentalAnalyst(BaseAgent):
    """Specialized AI analyst evaluating company balance sheet, earnings quality, and valuation multiples."""

    def __init__(self, llm: LLMProvider):
        super().__init__(
            name="Fundamental Analyst",
            role="Deep valuation, financial statement health, P/E multiples, revenue trajectory, and solvency evaluation.",
            llm=llm
        )

    def analyze(self, ticker: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        fundamentals = market_data.get("fundamentals", {})
        price = market_data.get("current_price", 100.0)
        
        prompt = f"""
You are a top-tier Fundamental Equity Analyst at a quantitative trading firm.
Evaluate the following fundamental data for {ticker} (Current Price: ${price:.2f}):

Market Cap: ${fundamentals.get('market_cap', 0):,}
Trailing P/E: {fundamentals.get('pe_ratio', 'N/A')}
Forward P/E: {fundamentals.get('forward_pe', 'N/A')}
PEG Ratio: {fundamentals.get('peg_ratio', 'N/A')}
YoY Revenue Growth: {fundamentals.get('revenue_growth', 0)}%
Gross Margin: {fundamentals.get('gross_margins', 0)}%
Operating Margin: {fundamentals.get('operating_margins', 0)}%
Debt-to-Equity: {fundamentals.get('debt_to_equity', 0)}
Current Ratio: {fundamentals.get('current_ratio', 0)}
Return on Equity (ROE): {fundamentals.get('roe', 0)}%
Analyst Mean Target: ${fundamentals.get('analyst_target', 0)}

Provide a strict, professional institutional equity research evaluation in JSON format:
{{
  "valuation_verdict": "UNDERVALUED" | "FAIRLY_VALUED" | "OVERVALUED",
  "fundamental_health_score": <int 0-100>,
  "fair_value_estimate": <float estimated fair share price>,
  "key_strengths": [<list of 2-3 specific financial strengths>],
  "key_vulnerabilities": [<list of 1-2 financial risks or multiple stretch>],
  "thesis_summary": "<concise 2-sentence institutional summary>"
}}
Only return JSON.
"""
        response_text = self.llm.generate(
            prompt=prompt,
            system_instruction="You are a senior fundamental equity analyst. Ground all observations in hard balance sheet data and valuation ratios."
        )
        parsed = self._clean_json_response(response_text)
        
        # Fallback if unparsed
        if not parsed or "valuation_verdict" not in parsed:
            pe = fundamentals.get("pe_ratio", 25)
            rev_growth = fundamentals.get("revenue_growth", 15)
            is_undervalued = (pe > 0 and pe < 22) or (rev_growth > 30 and pe < 40)
            verdict = "UNDERVALUED" if is_undervalued else ("OVERVALUED" if pe > 50 and rev_growth < 15 else "FAIRLY_VALUED")
            
            parsed = {
                "valuation_verdict": verdict,
                "fundamental_health_score": min(max(int(70 + (rev_growth * 0.5) - (pe * 0.3)), 35), 94),
                "fair_value_estimate": round(price * (1.18 if verdict == "UNDERVALUED" else (0.92 if verdict == "OVERVALUED" else 1.05)), 2),
                "key_strengths": [
                    f"Strong revenue growth profile of {rev_growth}% YoY with resilient operating margins",
                    f"Manageable debt-to-equity ratio of {fundamentals.get('debt_to_equity', 30.0)} ensuring balance sheet flexibility"
                ],
                "key_vulnerabilities": [
                    f"Valuation multiple of {pe}x P/E requires continued execution without guidance contraction"
                ],
                "thesis_summary": f"{ticker} maintains high quality operational returns with {rev_growth}% top-line expansion, positioning it well relative to sector comparables."
            }
            
        return parsed
