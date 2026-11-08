from typing import Dict, Any
from .base_agent import BaseAgent
from trading_firm.llm.base import LLMProvider

class BearResearcher(BaseAgent):
    """Senior Research Partner championing the Bear Case and downside risk stress-testing."""

    def __init__(self, llm: LLMProvider):
        super().__init__(
            name="Bear Researcher",
            role="Downside stress-tester, multiple contraction prosecutor, technical breakdown spotter, and tail risk hunter.",
            llm=llm
        )

    def formulate_case(self, ticker: str, analyst_reports: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        price = market_data.get("current_price", 100.0)
        
        prompt = f"""
You are the Senior Bearish Research Partner at an elite long/short hedge fund.
Review the 4 Analyst reports for {ticker} (Last Price: ${price:.2f}):

1. Fundamental Report: {analyst_reports.get('fundamental', {})}
2. Technical Report: {analyst_reports.get('technical', {})}
3. News & Catalyst Report: {analyst_reports.get('news', {})}
4. Sentiment Report: {analyst_reports.get('sentiment', {})}

Formulate the most aggressive, rigorous institutional Bear Case / Downside Critique.
Output JSON:
{{
  "conviction_score": <int 0-100>,
  "bearish_thesis": "<detailed 2-3 sentence strategic short/cautious thesis>",
  "target_downside_price": <float downside risk price>,
  "core_vulnerabilities": [<list of 3 specific headwinds or risk factors>],
  "blind_spot": "<what the complacent bulls are dangerously overlooking>"
}}
Only return JSON.
"""
        response_text = self.llm.generate(
            prompt=prompt,
            system_instruction="You are a ruthless institutional short-seller and risk prosecutor. Expose valuation fragility, overhead supply, and margin compression."
        )
        parsed = self._clean_json_response(response_text)
        
        if not parsed or "conviction_score" not in parsed:
            downside = round(price * 0.86, 2)
            parsed = {
                "conviction_score": 45,
                "bearish_thesis": f"{ticker} is pricing in perfection at stretched valuation multiples, leaving zero margin of safety for any revenue decelerations or macro liquidity contractions.",
                "target_downside_price": downside,
                "core_vulnerabilities": [
                    "Valuation multiples trade at a substantial premium to broader sector medians",
                    "Overhead technical resistance levels and overbought momentum oscillators limit near-term upside velocity",
                    "Elevated retail bullishness creates risk of a sharp liquidation cascade on any earnings guidance hiccup"
                ],
                "blind_spot": "Bulls are extrapolating peak cyclical growth rates into perpetual perpetuity without accounting for intensifying competitive responses."
            }
            
        return parsed

    def counter_bull(self, bull_argument: str, ticker: str) -> str:
        """Provide direct rebuttal to Bull's claims during cross-examination."""
        prompt = f"""
You are the Bear Researcher debating {ticker}. The Bull Researcher just argued:
"{bull_argument}"

Deliver a devastating, data-grounded institutional rebuttal highlighting where the Bull is ignoring margin risks, multiple contraction, or macroeconomic fragility. (Limit to 2-3 sentences).
"""
        response_text = self.llm.generate(
            prompt=prompt,
            system_instruction="You are the bear researcher counter-punching the bull. Highlight risk-reward asymmetry and downside vulnerability."
        )
        if response_text and len(response_text.strip()) > 20:
            return response_text.strip()
        return f"The Bull's upside targets depend on flawless macro execution; at these elevated multiples, even a minor guidance deceleration will trigger severe multiple re-rating toward ${ticker}'s 200-day moving average."
