import json
import re
from typing import Dict, Any, Optional
from trading_firm.llm.base import LLMProvider

class BaseAgent:
    """Base class for all trading firm specialist agents."""

    def __init__(self, name: str, role: str, llm: LLMProvider):
        self.name = name
        self.role = role
        self.llm = llm

    def _clean_json_response(self, text: str) -> Dict[str, Any]:
        """Extract and parse clean JSON from LLM output."""
        try:
            # First check if pure JSON
            text = text.strip()
            if text.startswith("{") and text.endswith("}"):
                return json.loads(text)
            
            # Find JSON code block ```json ... ```
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            
            # Find first { and last }
            first_brace = text.find("{")
            last_brace = text.rfind("}")
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                return json.loads(text[first_brace:last_brace + 1])
        except Exception:
            pass
        return {}
