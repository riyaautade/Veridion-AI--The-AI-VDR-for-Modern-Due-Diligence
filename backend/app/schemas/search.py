from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=512)


class SearchSource(BaseModel):
    filename: str
    page_number: int | None
    score: float
    text: str | None = None

class SearchResponse(BaseModel):
    answer: str
    sources: list[SearchSource]

class CompareRequest(BaseModel):
    document_id_1: int
    document_id_2: int

class CompareResponse(BaseModel):
    comparison: str
