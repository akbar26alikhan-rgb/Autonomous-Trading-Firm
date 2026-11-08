import os
from typing import Optional
from .base import LLMProvider

class AnthropicProvider(LLMProvider):
    """Anthropic Claude LLM provider using the anthropic SDK."""

    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is required for AnthropicProvider.")
        
        try:
            from anthropic import Anthropic
            self.client = Anthropic(api_key=self.api_key)
        except ImportError:
            raise ImportError("Please install anthropic: pip install anthropic")

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        kwargs = {
            "model": self.model,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_instruction:
            kwargs["system"] = system_instruction

        response = self.client.messages.create(**kwargs)
        return response.content[0].text if response.content else ""

    def provider_name(self) -> str:
        return f"Anthropic ({self.model})"
