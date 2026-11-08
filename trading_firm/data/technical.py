from typing import Dict, Any, List
import math

def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """Calculate Relative Strength Index (RSI)."""
    if len(prices) < period + 1:
        return 50.0
    
    deltas = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    gains = [d if d > 0 else 0 for d in deltas]
    losses = [-d if d < 0 else 0 for d in deltas]
    
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    
    for i in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100.0 - (100.0 / (1.0 + rs)), 2)

def calculate_sma(prices: List[float], period: int) -> float:
    """Calculate Simple Moving Average."""
    if len(prices) < period:
        return prices[-1] if prices else 0.0
    return round(sum(prices[-period:]) / period, 2)

def calculate_ema(prices: List[float], period: int) -> float:
    """Calculate Exponential Moving Average."""
    if len(prices) < period:
        return prices[-1] if prices else 0.0
    multiplier = 2.0 / (period + 1)
    ema = sum(prices[:period]) / period
    for p in prices[period:]:
        ema = (p - ema) * multiplier + ema
    return round(ema, 2)

def calculate_bollinger_bands(prices: List[float], period: int = 20, num_std: float = 2.0) -> Dict[str, float]:
    """Calculate Bollinger Bands (Upper, Middle, Lower)."""
    if len(prices) < period:
        current = prices[-1] if prices else 100.0
        return {"upper": current * 1.05, "middle": current, "lower": current * 0.95}
    
    slice_prices = prices[-period:]
    sma = sum(slice_prices) / period
    variance = sum((p - sma) ** 2 for p in slice_prices) / period
    std_dev = math.sqrt(variance)
    
    return {
        "upper": round(sma + (num_std * std_dev), 2),
        "middle": round(sma, 2),
        "lower": round(sma - (num_std * std_dev), 2),
    }

def calculate_macd(prices: List[float]) -> Dict[str, float]:
    """Calculate MACD Line, Signal Line, and Histogram."""
    if len(prices) < 26:
        return {"macd_line": 0.0, "signal_line": 0.0, "histogram": 0.0}
    
    ema12 = calculate_ema(prices, 12)
    ema26 = calculate_ema(prices, 26)
    macd_line = round(ema12 - ema26, 2)
    signal_line = round(macd_line * 0.85, 2) # Approximation for 9 EMA of MACD
    histogram = round(macd_line - signal_line, 2)
    
    return {
        "macd_line": macd_line,
        "signal_line": signal_line,
        "histogram": histogram
    }

def calculate_atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> float:
    """Calculate Average True Range for volatility estimation."""
    if len(closes) < 2:
        return (highs[-1] - lows[-1]) if highs else 1.0
        
    true_ranges = []
    for i in range(1, len(closes)):
        h = highs[i]
        l = lows[i]
        prev_close = closes[i - 1]
        tr = max(h - l, abs(h - prev_close), abs(l - prev_close))
        true_ranges.append(tr)
        
    if not true_ranges:
        return 1.0
    return round(sum(true_ranges[-period:]) / min(len(true_ranges), period), 2)

def calculate_technical_indicators(candles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate full suite of technical indicators from candle series."""
    if not candles:
        return {}
        
    closes = [c["close"] for c in candles]
    highs = [c["high"] for c in candles]
    lows = [c["low"] for c in candles]
    volumes = [c.get("volume", 1000000) for c in candles]
    
    current_price = closes[-1]
    sma20 = calculate_sma(closes, 20)
    sma50 = calculate_sma(closes, 50)
    sma200 = calculate_sma(closes, 200)
    rsi14 = calculate_rsi(closes, 14)
    bb = calculate_bollinger_bands(closes, 20, 2.0)
    macd = calculate_macd(closes)
    atr = calculate_atr(highs, lows, closes, 14)
    
    # Trend classification
    trend = "BULLISH" if current_price > sma50 and sma50 > sma200 else ("BEARISH" if current_price < sma50 and sma50 < sma200 else "NEUTRAL")
    
    # RSI Signal
    rsi_condition = "OVERBOUGHT" if rsi14 > 70 else ("OVERSOLD" if rsi14 < 30 else "NEUTRAL")
    
    return {
        "current_price": current_price,
        "rsi_14": rsi14,
        "rsi_condition": rsi_condition,
        "sma_20": sma20,
        "sma_50": sma50,
        "sma_200": sma200,
        "trend": trend,
        "bollinger_bands": bb,
        "macd": macd,
        "atr_14": atr,
        "volatility_pct": round((atr / current_price) * 100, 2) if current_price else 1.5,
    }
