from abc import ABC, abstractmethod
from typing import Any, Optional

import httpx
# pyrefly: ignore [missing-import]
from langchain.llms.base import LLM

from app.core.config import get_settings


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs: Any) -> str:
        raise NotImplementedError


class GroqLLMProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile") -> None:
        self.api_key = api_key
        self.model = model
        self.base_url = "https://api.groq.com/openai/v1"

    def _call(self, prompt: str) -> str:
        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "model": self.model,
            "max_tokens": 1024,
            "temperature": 0.2,
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}
        url = f"{self.base_url}/chat/completions"

        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            body = response.json()

        return body.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

    def generate(self, prompt: str, **kwargs: Any) -> str:
        return self._call(prompt)


def get_llm_provider() -> LLMProvider:
    settings = get_settings()
    provider = settings.llm_provider.lower()
    if provider == "groq":
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is required for groq provider.")
        return GroqLLMProvider(api_key=settings.groq_api_key)

    raise RuntimeError(f"Unsupported LLM provider: {settings.llm_provider}")
