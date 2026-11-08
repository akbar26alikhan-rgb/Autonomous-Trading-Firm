from abc import ABC, abstractmethod
from typing import Optional

class LLMProvider(ABC):
    """Abstract interface for multi-provider LLM support."""

    @abstractmethod
    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Generate text completion from LLM."""
        pass
    
    @abstractmethod
    def provider_name(self) -> str:
        """Return provider brand name."""
        pass
