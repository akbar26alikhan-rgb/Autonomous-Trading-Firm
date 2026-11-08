import os
from dataclasses import dataclass, field
from typing import Optional
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

@dataclass
class FirmConfig:
    """Trading firm configuration parameters and credentials."""
    # LLM Settings
    provider: str = os.getenv("LLM_PROVIDER", "gemini").lower()
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    
    # Financial Data APIs (optional, defaults to yfinance)
    alpha_vantage_key: Optional[str] = os.getenv("ALPHA_VANTAGE_API_KEY")
    polygon_api_key: Optional[str] = os.getenv("POLYGON_API_KEY")
    
    # Risk Management Parameters
    portfolio_equity: float = float(os.getenv("PORTFOLIO_EQUITY", "100000.0"))
    max_position_size_pct: float = float(os.getenv("MAX_POSITION_SIZE_PCT", "10.0"))  # Max 10% per trade
    max_loss_per_trade_pct: float = float(os.getenv("MAX_LOSS_PER_TRADE_PCT", "2.0")) # Max 2% risk of equity
    min_risk_reward_ratio: float = float(os.getenv("MIN_RISK_REWARD_RATIO", "2.0"))   # Minimum 1:2.0 R:R
    risk_tolerance: str = os.getenv("RISK_TOLERANCE", "moderate").lower()             # conservative, moderate, aggressive
    
    # Debate Settings
    debate_rounds: int = int(os.getenv("DEBATE_ROUNDS", "2"))
    verbose: bool = True
