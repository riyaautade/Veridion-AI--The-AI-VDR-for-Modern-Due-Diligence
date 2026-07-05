import uuid
from typing import Any

from qdrant_client.http import models as rest_models

from app.ai.embeddings import LocalEmbeddingProvider
from app.database.models import Document, DocumentChunk
from app.retrieval.qdrant_client import CHUNK_COLLECTION_NAME, ensure_collection, get_qdrant_client


def index_document_chunks(
    document: Document,
    chunks: list[DocumentChunk],
    allowed_roles: list[str],
) -> None:
    client = get_qdrant_client()
    ensure_collection(client)
    embedding_provider = LocalEmbeddingProvider()

    texts = [chunk.text for chunk in chunks]
    vectors = embedding_provider.embed_documents(texts)

    points: list[rest_models.PointStruct] = []
    for chunk, vector in zip(chunks, vectors):
        payload: dict[str, Any] = {
            "deal_id": document.deal_id,
            "document_id": document.id,
            "document_type": document.document_type,
            "file_type": document.file_type,
            "filename": document.filename,
            "original_filename": document.original_filename,
            "allowed_roles": allowed_roles,
            "page_number": chunk.page_number,
            "chunk_index": chunk.chunk_index,
        }
        payload["text"] = chunk.text
        points.append(
            rest_models.PointStruct(
                id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document.id}-{chunk.chunk_index}")),
                vector=vector,
                payload=payload,
            )
        )

    client.upsert(collection_name=CHUNK_COLLECTION_NAME, points=points)


def search_document_chunks(
    deal_id: int,
    user_role: str,
    query: str,
    limit: int = 5,
) -> list[dict[str, Any]]:
    client = get_qdrant_client()
    ensure_collection(client)
    embedding_provider = LocalEmbeddingProvider()
    query_vector = embedding_provider.embed(query)

    filter_expression = rest_models.Filter(
        must=[
            rest_models.FieldCondition(
                key="deal_id", match=rest_models.MatchValue(value=deal_id)
            ),
            rest_models.FieldCondition(
                key="allowed_roles", match=rest_models.MatchValue(value=user_role)
            ),
        ]
    )

    results = client.search(
        collection_name=CHUNK_COLLECTION_NAME,
        query_vector=query_vector,
        limit=limit,
        query_filter=filter_expression,
        with_payload=True,
    )

    documents: list[dict[str, Any]] = []
    for result in results:
        payload = result.payload or {}
        documents.append(
            {
                "score": float(result.score or 0.0),
                "document_id": payload.get("document_id"),
                "filename": payload.get("filename"),
                "original_filename": payload.get("original_filename"),
                "page_number": payload.get("page_number"),
                "chunk_index": payload.get("chunk_index"),
                "text": payload.get("text", ""),
                "allowed_roles": payload.get("allowed_roles", []),
            }
        )
    return documents
