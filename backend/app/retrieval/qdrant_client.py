from qdrant_client import QdrantClient
from qdrant_client.http import models as rest_models

from app.core.config import get_settings

CHUNK_COLLECTION_NAME = "vdr_chunks"
EMBEDDING_DIM = 512


def get_qdrant_client() -> QdrantClient:
    settings = get_settings()
    return QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)


def ensure_collection(client: QdrantClient) -> None:
    collections = client.get_collections().collections
    existing_collections = {collection.name for collection in collections}
    if CHUNK_COLLECTION_NAME not in existing_collections:
        client.create_collection(
            collection_name=CHUNK_COLLECTION_NAME,
            vectors_config=rest_models.VectorParams(size=EMBEDDING_DIM, distance=rest_models.Distance.COSINE),
        )
