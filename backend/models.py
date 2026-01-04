"""Pydantic models for API requests and responses."""
from pydantic import BaseModel
from typing import List, Optional


class FileInfo(BaseModel):
    """File information response."""
    id: str
    name: str


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str
    active_file_ids: List[str] = []


class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    sources_used: List[str] = []


class UploadResponse(BaseModel):
    """Upload response model."""
    file_id: str
    file_name: str
    chunks_created: int
    status: str

