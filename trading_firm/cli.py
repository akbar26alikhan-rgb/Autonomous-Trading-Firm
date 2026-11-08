import sys
import json
import argparse
from typing import Optional
from trading_firm.config import FirmConfig
from trading_firm.pipeline import TradingFirmPipeline

BANNER = """
================================================================================
          AUTONOMOUS AI TRADING FIRM  |  MULTI-AGENT RESEARCH DESK
================================================================================
"""

def print_colored(text: str, color_code: str = "37"):
    """Print ANSI colored text in terminal."""
    print(f"\033[{color_code}m{text}\033[0m")

def run_cli():
    """Command-line interface entrypoint for the Autonomous Trading Firm."""
    parser = argparse.ArgumentParser(
        description="Autonomous AI Trading Firm CLI - Multi-Agent Investment Committee"
    )
    parser.add_argument("--ticker", "-t", type=str, default="RELIANCE", help="Asset ticker symbol (e.g. RELIANCE, TCS, INFY, NVDA, AAPL)")
    parser.add_argument("--exchange", "-x", type=str, default="NSE", choices=["NSE", "BSE", "NASDAQ", "NYSE", "GLOBAL"], help="Exchange venue [NSE, BSE, NASDAQ, NYSE]")
    parser.add_argument("--currency", "-c", type=str, default="INR", choices=["INR", "USD"], help="Valuation currency [INR, USD]")
    parser.add_argument("--provider", "-p", type=str, default="gemini", choices=["gemini", "openai", "anthropic"], help="LLM Provider")
    parser.add_argument("--model", "-m", type=str, default=None, help="LLM model name override")
    parser.add_argument("--risk", "-r", type=str, default="moderate", choices=["conservative", "moderate", "aggressive"], help="Firm risk tolerance")
    parser.add_argument("--equity", "-e", type=float, default=1000000.0, help="Total portfolio equity in active currency")
    parser.add_argument("--output", "-o", type=str, default=None, help="Save final research report to JSON file")
    parser.add_argument("--json", action="store_true", help="Output pure JSON only to stdout")

    args = parser.parse_args()

    config = FirmConfig(
        provider=args.provider,
        risk_tolerance=args.risk,
        portfolio_equity=args.equity,
    )
    if args.model:
        setattr(config, f"{args.provider}_model", args.model)

    sym = "₹" if args.currency == "INR" else "$"

    if not args.json:
        print_colored(BANNER, "36")
        print_colored(f"[*] Target Asset   : {args.ticker.upper()} ({args.exchange})", "37")
        print_colored(f"[*] Exchange Venue : {args.exchange} ({'National Stock Exchange' if args.exchange == 'NSE' else 'Bombay Stock Exchange' if args.exchange == 'BSE' else args.exchange})", "37")
        print_colored(f"[*] Currency       : {args.currency} ({sym})", "37")
        print_colored(f"[*] LLM Engine     : {args.provider.upper()}", "37")
        print_colored(f"[*] Risk Mandate   : {args.risk.upper()}", "37")
        print_colored(f"[*] Portfolio Size : {sym}{args.equity:,.2f}\n", "37")

    pipeline = TradingFirmPipeline(config)

    def on_progress(stage: str, msg: str, data: dict):
        if not args.json:
            color = "34" if "ANALYST" in stage else ("35" if "DEBATE" in stage else ("33" if "TRADER" in stage else "32"))
            print(f"[\033[{color}m{stage}\033[0m] {msg}")

    try:
        result = pipeline.execute(args.ticker, progress_callback=on_progress if not args.json else None)
    except Exception as e:
        print_colored(f"[Error] Failed to execute pipeline: {e}", "31")
        sys.exit(1)

    if args.json:
        print(json.dumps(result, indent=2))
        return

    # Print Terminal Executive Report
    market = result["market_data"]
    fund = result["analyst_reports"]["fundamental"]
    tech = result["analyst_reports"]["technical"]
    news = result["analyst_reports"]["news"]
    sent = result["analyst_reports"]["sentiment"]
    bull = result["debate"]["bull_case"]
    bear = result["debate"]["bear_case"]
    trade = result["trade_proposal"]
    risk = result["risk_review"]

    print("\n" + "=" * 80)
    print_colored(f"  EXECUTIVE TRADING DESK MEMO: {result['ticker']} ({sym}{market['current_price']:.2f})", "1;37")
    print("=" * 80)

    # Analyst Summary
    print_colored("\n--- 1. ANALYST TEAM FINDINGS ---", "1;34")
    print(f"  * Fundamental : {fund.get('valuation_verdict')} (Health: {fund.get('fundamental_health_score')}/100) | Fair Value: {sym}{fund.get('fair_value_estimate', 0):.2f}")
    print(f"  * Technical   : {tech.get('trend_signal')} (Trend: {market.get('technicals', {}).get('trend')}) | Support: {sym}{tech.get('support_level')} | Resist: {sym}{tech.get('resistance_level')}")
    print(f"  * News Impact : {news.get('catalyst_impact')} (Score: {news.get('news_sentiment_score')}/100) | Event Risk: {news.get('event_risk')}")
    print(f"  * Sentiment   : {sent.get('crowd_sentiment')} (Score: {sent.get('sentiment_score')}/100) | Options: {sent.get('options_bias')}")

    # Debate Summary
    print_colored("\n--- 2. RESEARCHER COMMITTEE DEBATE ---", "1;35")
    print(f"  * Bull Case (Conviction: {bull.get('conviction_score')}%): {bull.get('bullish_thesis')}")
    print(f"  * Bear Case (Conviction: {bear.get('conviction_score')}%): {bear.get('bearish_thesis')}")
    print(f"  * Committee Consensus Advantage: {result['debate']['consensus_winner']}")

    # Trade Proposal
    print_colored("\n--- 3. TRADER EXECUTION PROPOSAL ---", "1;33")
    print(f"  * Order Action     : {trade.get('action')} ({trade.get('order_type', 'LIMIT')})")
    print(f"  * Target Entry     : {sym}{trade.get('entry_price'):.2f}")
    print(f"  * Take Profit      : {sym}{trade.get('target_price'):.2f}")
    print(f"  * Stop Loss        : {sym}{trade.get('stop_loss'):.2f}")
    print(f"  * Risk/Reward      : 1:{trade.get('risk_reward_ratio')}")
    print(f"  * Proposed Size    : {trade.get('suggested_position_size_pct')}% of portfolio equity")
    print(f"  * Tactics          : {trade.get('execution_tactics')}")

    # Risk Manager Verdict
    verdict = risk.get('verdict')
    verdict_color = "1;32" if verdict == "APPROVED" else ("1;33" if verdict == "MODIFIED" else "1;31")
    print_colored("\n--- 4. CHIEF RISK OFFICER & PORTFOLIO MANAGER AUDIT ---", "1;36")
    print_colored(f"  >>> VERDICT: {verdict} <<<", verdict_color)
    print(f"  * Approved Sizing  : {risk.get('approved_position_size_pct')}% of equity ({risk.get('approved_shares')} shares)")
    print(f"  * Max Risk Capital : {sym}{risk.get('max_dollar_loss', 0):,.2f}")
    print(f"  * Fiduciary Reason : {risk.get('official_verdict_reasoning')}")
    print("=" * 80 + "\n")

    if args.output:
        with open(args.output, "w") as f:
            json.dump(result, f, indent=2)
        print_colored(f"[+] Full audit report written to: {args.output}", "32")

if __name__ == "__main__":
    run_cli()
