from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable, Any

from sklearn.feature_extraction.text import HashingVectorizer


class EmbeddingsProvider(ABC):
    @abstractmethod
    def embed(self, text: str) -> list[float]:
        raise NotImplementedError

    def embed_documents(self, texts: Iterable[str]) -> list[list[float]]:
        return [self.embed(text) for text in texts]


class LocalEmbeddingProvider(EmbeddingsProvider):
    def __init__(self, dimension: int = 512) -> None:
        self.vectorizer = HashingVectorizer(
            n_features=dimension,
            alternate_sign=False,
            norm="l2",
        )

    def embed(self, text: str) -> list[float]:
        matrix: Any = self.vectorizer.transform([text])
        vector = matrix.toarray()[0]
        return [float(value) for value in vector]
