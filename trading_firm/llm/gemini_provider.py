import os
from typing import Optional
from .base import LLMProvider

class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider using the google-genai SDK."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-3.8-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is required for GeminiProvider.")
        
        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
        except ImportError:
            raise ImportError("Please install google-genai: pip install google-genai")

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        config = {}
        if system_instruction:
            config["system_instruction"] = system_instruction
            
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config if config else None,
        )
        return response.text or ""

    def provider_name(self) -> str:
        return f"Google Gemini ({self.model})"
