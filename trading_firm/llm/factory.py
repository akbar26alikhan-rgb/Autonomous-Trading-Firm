import os
from typing import Optional
from .base import LLMProvider
from .gemini_provider import GeminiProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider

class SimulatedProvider(LLMProvider):
    """Fallback provider when running without live external API keys."""

    def __init__(self, model: str = "mock-quant-v1"):
        self.model = model

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        # Returns a structured qualitative analysis based on the prompt's role
        return "Simulated analysis based on deterministic financial rules."

    def provider_name(self) -> str:
        return f"Simulated Quant Engine ({self.model})"

def get_llm_provider(
    provider_name: str = "gemini",
    api_key: Optional[str] = None,
    model: Optional[str] = None
) -> LLMProvider:
    """Factory method to get LLM provider by name."""
    provider_name = provider_name.lower().strip()
    
    if provider_name in ["gemini", "google"]:
        model_name = model or os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
        try:
            return GeminiProvider(api_key=api_key, model=model_name)
        except Exception as e:
            print(f"[Warning] Gemini provider initialization failed: {e}. Falling back to Simulated.")
            return SimulatedProvider(model=model_name)
            
    elif provider_name in ["openai", "gpt"]:
        model_name = model or os.getenv("OPENAI_MODEL", "gpt-4o")
        try:
            return OpenAIProvider(api_key=api_key, model=model_name)
        except Exception as e:
            print(f"[Warning] OpenAI provider initialization failed: {e}. Falling back to Simulated.")
            return SimulatedProvider(model=model_name)
            
    elif provider_name in ["anthropic", "claude"]:
        model_name = model or os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        try:
            return AnthropicProvider(api_key=api_key, model=model_name)
        except Exception as e:
            print(f"[Warning] Anthropic provider initialization failed: {e}. Falling back to Simulated.")
            return SimulatedProvider(model=model_name)
            
    else:
        return SimulatedProvider(model="deterministic-agent")
