from typing import Dict, Any
from .base_agent import BaseAgent
from trading_firm.llm.base import LLMProvider

class SentimentAnalyst(BaseAgent):
    """Specialized AI analyst tracking social media mood, Retail/FinTwit sentiment, and Fear & Greed posture."""

    def __init__(self, llm: LLMProvider):
        super().__init__(
            name="Sentiment Analyst",
            role="Retail sentiment, Fear & Greed Index, options put/call flow, and contrarian warning detection.",
            llm=llm
        )

    def analyze(self, ticker: str, sentiment_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
You are a Quantitative Behavioral Finance & Market Sentiment Analyst.
Analyze sentiment telemetry for {ticker}:

Social Sentiment Score: {sentiment_data.get('sentiment_score', 65)}/100 ({sentiment_data.get('sentiment_label', 'Bullish')})
Fear & Greed Index: {sentiment_data.get('fear_and_greed_index', 60)} ({sentiment_data.get('fear_and_greed_state', 'GREED')})
Put/Call Volume Ratio: {sentiment_data.get('put_call_ratio', 0.70)}
Social Mentions (24h): {sentiment_data.get('social_mention_volume', '100K+')}
Retail Bullishness: {sentiment_data.get('retail_sentiment_pct', 70)}%
Institutional Posture: {sentiment_data.get('institutional_sentiment_pct', 75)}%

Generate institutional sentiment assessment in JSON format:
{{
  "crowd_sentiment": "BULLISH" | "EXTREME_GREED" | "NEUTRAL" | "BEARISH" | "EXTREME_FEAR",
  "sentiment_score": <int 0-100>,
  "crowded_trade_warning": <bool true if positioning is dangerously overheated>,
  "options_bias": "CALL_HEAVY" | "BALANCED" | "PUT_HEAVY",
  "contrarian_indicator": "<brief note on whether sentiment offers contrarian buy/sell signal>",
  "sentiment_summary": "<2-sentence synthesis of market psychology>"
}}
Only return JSON.
"""
        response_text = self.llm.generate(
            prompt=prompt,
            system_instruction="You are a behavioral finance sentiment analyst. Spot crowd exuberance, panic bottoms, and option skew."
        )
        parsed = self._clean_json_response(response_text)
        
        if not parsed or "crowd_sentiment" not in parsed:
            score = sentiment_data.get("sentiment_score", 70)
            parsed = {
                "crowd_sentiment": "BULLISH" if score > 60 else "NEUTRAL",
                "sentiment_score": score,
                "crowded_trade_warning": score > 85,
                "options_bias": "CALL_HEAVY" if sentiment_data.get("put_call_ratio", 0.7) < 0.8 else "BALANCED",
                "contrarian_indicator": "Positioning is constructive but not yet at euphoric climax levels, allowing trend continuation.",
                "sentiment_summary": f"Market psychology reflects firm institutional conviction with low put/call hedging demand, providing steady bid support for {ticker}."
            }
            
        return parsed
