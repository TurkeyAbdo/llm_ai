"""Utility functions for text extraction and chunking."""
import os
import uuid
from typing import List
from pathlib import Path
import PyPDF2
from docx import Document


def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from PDF, TXT, or DOCX files."""
    text = ""
    
    if file_type == "application/pdf":
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
    
    elif file_type == "text/plain":
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    
    elif file_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
        doc = Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    
    return text.strip()


def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks."""
    if not text:
        return []
    
    words = text.split()
    chunks = []
    
    if len(words) <= chunk_size:
        return [text]
    
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        start = end - chunk_overlap
    
    return chunks


def generate_source_id() -> str:
    """Generate a unique source ID."""
    return str(uuid.uuid4())


