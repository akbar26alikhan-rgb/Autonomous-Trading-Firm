# Autonomous AI Trading Firm Framework

An institutional-grade, multi-agent algorithmic trading firm implemented in Python with containerized Docker support and a sleek web management terminal.

```
                         +-----------------------+
                         | Market Data & Metrics |
                         +-----------+-----------+
                                     |
           +-------------------------+-------------------------+
           |                         |                         |
+----------v-----------+  +----------v-----------+  +----------v-----------+  +----------v-----------+
| Fundamental Analyst  |  |  Technical Analyst   |  |     News Analyst     |  |   Sentiment Analyst  |
|  (P/E, Growth, DCF)  |  |  (RSI, MACD, SMAs)   |  | (Catalysts & Events) |  | (Social & Fear/Greed) |
+----------+-----------+  +----------+-----------+  +----------+-----------+  +----------+-----------+
           |                         |                         |                         |
           +-------------------------+-------------------------+-------------------------+
                                     |
                         +-----------v-----------+
                         |    Researcher Team    |
                         |  (Bull vs Bear Debate)|
                         +-----------+-----------+
                                     |
                         +-----------v-----------+
                         |     Trader Agent      |
                         | (Entry/Stop/Target R:R)|
                         +-----------+-----------+
                                     |
                         +-----------v-----------+
                         | Risk/Portfolio Manager|
                         | (Audit & Final Veto)  |
                         +-----------------------+
```

## Features

- **Specialized Multi-Agent Teams**:
  - **Analyst Team**:
    - **Fundamental Analyst**: Evaluates balance sheet strength, P/E multiples, revenue trajectory, DCF estimates, and solvency ratios.
    - **Technical Analyst**: Computes RSI, MACD histograms, SMA 20/50/200 crossovers, Bollinger Bands, and key support/resistance boundaries.
    - **News Analyst**: Scans corporate headlines, earnings releases, and regulatory events.
    - **Sentiment Analyst**: Tracks FinTwit sentiment, Fear & Greed index, retail exuberance, and options put/call skew.
  - **Researcher Committee**:
    - **Bull Researcher**: Formulates high-conviction long thesis with target upside.
    - **Bear Researcher**: Downside stress-tester, multiple contraction prosecutor, and tail risk spotter.
    - **Cross-Examination**: Direct multi-turn rebuttal round between Bull and Bear.
  - **Execution Trader**:
    - Synthesizes findings into an institutional order ticket with calculated 1:2+ Risk/Reward ratio, entry, take profit, stop loss, and tactics.
  - **Chief Risk Officer & Portfolio Manager**:
    - Fiduciary veto and portfolio guardian. Audits against Value-at-Risk (VaR), max single-position allocation %, and portfolio equity drawdown limits.

- **Multi-Provider LLM Flexibility**:
  - Google Gemini (`gemini-3.8-flash`, `gemini-4-argon`)
  - OpenAI (`gpt-4o`, `gpt-4o-mini`)
  - Anthropic (`claude-3-5-sonnet`)
  - Offline Quantitative Engine fallback when no keys are provided

- **Docker & Docker Compose**:
  - Run the entire trading firm in one command without manual dependency setup.

## Quickstart (CLI)

```bash
# 1. Clone or download the repository
git clone <repo-url>
cd trading-firm

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API keys (optional if using local quant fallback)
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY

# 4. Run an analysis on any ticker
python main.py --ticker NVDA
```

### CLI Command Options

```bash
# Analyze Apple with Google Gemini
python main.py --ticker AAPL --provider gemini --model gemini-3.8-flash

# Run with Conservative Risk Tolerance and $250,000 Portfolio
python main.py --ticker TSLA --risk conservative --equity 250000

# Analyze Bitcoin USD and export report to JSON
python main.py --ticker BTC-USD --output btc_report.json

# Clean JSON output for scripting / pipelines
python main.py --ticker MSFT --json
```

## Running with Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# Run a specific ticker directly via Docker
docker run --rm -it \
  -e GEMINI_API_KEY="your-key-here" \
  trading-firm --ticker AMD --provider gemini
```

## Project Structure

```
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── main.py
├── .env.example
├── README.md
└── trading_firm/
    ├── __init__.py
    ├── config.py
    ├── pipeline.py
    ├── cli.py
    ├── llm/
    │   ├── base.py
    │   ├── gemini_provider.py
    │   ├── openai_provider.py
    │   ├── anthropic_provider.py
    │   └── factory.py
    ├── data/
    │   ├── market_data.py
    │   ├── technical.py
    │   └── news_sentiment.py
    └── agents/
        ├── base_agent.py
        ├── fundamental_analyst.py
        ├── technical_analyst.py
        ├── news_analyst.py
        ├── sentiment_analyst.py
        ├── bull_researcher.py
        ├── bear_researcher.py
        ├── trader.py
        └── risk_manager.py
```
