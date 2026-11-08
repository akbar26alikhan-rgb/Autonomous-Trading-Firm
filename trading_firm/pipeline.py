import time
from typing import Dict, Any, Callable, Optional
from trading_firm.config import FirmConfig
from trading_firm.llm.factory import get_llm_provider
from trading_firm.data.market_data import MarketDataFetcher
from trading_firm.data.news_sentiment import NewsSentimentHarvester
from trading_firm.agents.fundamental_analyst import FundamentalAnalyst
from trading_firm.agents.technical_analyst import TechnicalAnalyst
from trading_firm.agents.news_analyst import NewsAnalyst
from trading_firm.agents.sentiment_analyst import SentimentAnalyst
from trading_firm.agents.bull_researcher import BullResearcher
from trading_firm.agents.bear_researcher import BearResearcher
from trading_firm.agents.trader import TraderAgent
from trading_firm.agents.risk_manager import RiskManagerAgent

class TradingFirmPipeline:
    """
    Orchestrates the entire multi-agent trading firm research & execution workflow:
    1. Data & Indicators -> 2. Analyst Team -> 3. Researcher Debate -> 4. Trader Proposal -> 5. Risk Review
    """

    def __init__(self, config: Optional[FirmConfig] = None):
        self.config = config or FirmConfig()
        self.llm = get_llm_provider(
            provider_name=self.config.provider,
            model=getattr(self.config, f"{self.config.provider}_model", None)
        )
        
        # Instantiate Agents
        self.fundamental_analyst = FundamentalAnalyst(self.llm)
        self.technical_analyst = TechnicalAnalyst(self.llm)
        self.news_analyst = NewsAnalyst(self.llm)
        self.sentiment_analyst = SentimentAnalyst(self.llm)
        self.bull_researcher = BullResearcher(self.llm)
        self.bear_researcher = BearResearcher(self.llm)
        self.trader = TraderAgent(self.llm)
        self.risk_manager = RiskManagerAgent(self.llm)

    def execute(
        self,
        ticker: str,
        progress_callback: Optional[Callable[[str, str, Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """
        Execute full autonomous trading pipeline for given ticker.
        `progress_callback(stage_id, message, payload)` allows streaming updates to CLI or web UI.
        """
        start_time = time.time()
        ticker = ticker.upper().strip()

        def notify(stage: str, msg: str, data: Optional[Dict[str, Any]] = None):
            if progress_callback:
                progress_callback(stage, msg, data or {})

        # Stage 1: Market Data & Indicators
        notify("DATA_GATHERING", f"Harvesting market quotes, financials, and technical indicators for {ticker}...")
        fetcher = MarketDataFetcher(ticker)
        market_data = fetcher.get_market_snapshot()
        
        harvester = NewsSentimentHarvester(ticker)
        news_sentiment_data = harvester.harvest()
        notify("DATA_READY", f"Market data loaded (${market_data['current_price']:.2f}).", {
            "market_data": market_data,
            "news_sentiment": news_sentiment_data
        })

        # Stage 2: Analyst Team
        notify("ANALYSTS_START", "Analyst Team activated: Conducting fundamental, technical, news & sentiment analysis...")
        
        fundamental_report = self.fundamental_analyst.analyze(ticker, market_data)
        notify("ANALYST_FUNDAMENTAL", "Fundamental analysis complete.", fundamental_report)
        
        technical_report = self.technical_analyst.analyze(ticker, market_data)
        notify("ANALYST_TECHNICAL", "Technical indicator analysis complete.", technical_report)
        
        news_report = self.news_analyst.analyze(ticker, news_sentiment_data)
        notify("ANALYST_NEWS", "News & catalyst assessment complete.", news_report)
        
        sentiment_report = self.sentiment_analyst.analyze(ticker, news_sentiment_data)
        notify("ANALYST_SENTIMENT", "Social mood & sentiment scan complete.", sentiment_report)

        analyst_reports = {
            "fundamental": fundamental_report,
            "technical": technical_report,
            "news": news_report,
            "sentiment": sentiment_report,
        }

        # Stage 3: Researcher Team Debate
        notify("DEBATE_START", "Research Team convening: Bull vs. Bear debate initiated...")
        
        bull_case = self.bull_researcher.formulate_case(ticker, analyst_reports, market_data)
        notify("DEBATE_BULL", f"Bull Researcher argues long case (Conviction: {bull_case.get('conviction_score')}%)", bull_case)
        
        bear_case = self.bear_researcher.formulate_case(ticker, analyst_reports, market_data)
        notify("DEBATE_BEAR", f"Bear Researcher argues short/cautious case (Conviction: {bear_case.get('conviction_score')}%)", bear_case)
        
        # Cross Examination Rounds
        bull_rebuttal = self.bull_researcher.counter_bear(bear_case.get("bearish_thesis", ""), ticker)
        bear_rebuttal = self.bear_researcher.counter_bull(bull_case.get("bullish_thesis", ""), ticker)
        
        debate_result = {
            "bull_case": bull_case,
            "bear_case": bear_case,
            "cross_examination": [
                {"speaker": "Bull Researcher", "statement": bull_rebuttal},
                {"speaker": "Bear Researcher", "statement": bear_rebuttal}
            ],
            "consensus_winner": "BULL" if bull_case.get("conviction_score", 0) >= bear_case.get("conviction_score", 0) else "BEAR"
        }
        notify("DEBATE_COMPLETE", f"Debate concluded. Advantage: {debate_result['consensus_winner']}", debate_result)

        # Stage 4: Execution Trader Proposal
        notify("TRADER_START", "Execution Trader formulating order ticket and risk-to-reward ratio...")
        trade_proposal = self.trader.propose_trade(
            ticker=ticker,
            analyst_reports=analyst_reports,
            debate_result=debate_result,
            market_data=market_data,
            risk_tolerance=self.config.risk_tolerance
        )
        notify("TRADER_PROPOSAL", f"Trade proposal generated: {trade_proposal.get('action')} @ ${trade_proposal.get('entry_price')}", trade_proposal)

        # Stage 5: Risk Manager & Portfolio Manager Audit
        notify("RISK_START", "Chief Risk Officer conducting portfolio risk and mandate audit...")
        risk_review = self.risk_manager.review_trade(
            ticker=ticker,
            trade_proposal=trade_proposal,
            market_data=market_data,
            portfolio_equity=self.config.portfolio_equity,
            max_position_size_pct=self.config.max_position_size_pct,
            max_loss_pct=self.config.max_loss_per_trade_pct,
            min_risk_reward=self.config.min_risk_reward_ratio,
            risk_tolerance=self.config.risk_tolerance
        )
        notify("RISK_VERDICT", f"Final Verdict: {risk_review.get('verdict')}", risk_review)

        total_elapsed = round(time.time() - start_time, 2)

        return {
            "ticker": ticker,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "elapsed_seconds": total_elapsed,
            "provider": self.llm.provider_name(),
            "market_data": market_data,
            "analyst_reports": analyst_reports,
            "debate": debate_result,
            "trade_proposal": trade_proposal,
            "risk_review": risk_review,
        }
