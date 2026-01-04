"""ChromaDB vector store integration."""
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import os


class VectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB client with persistence."""
        self.persist_directory = persist_directory
        os.makedirs(persist_directory, exist_ok=True)
        
        # Disable telemetry to avoid errors
        os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")
        
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name="nexusmind_documents",
            metadata={"hnsw:space": "cosine"}
        )
    
    def add_documents(
        self, 
        texts: List[str], 
        source_id: str, 
        source_name: str,
        embeddings: Optional[List[List[float]]] = None
    ):
        """Add documents to the vector store with metadata."""
        ids = [f"{source_id}_{i}" for i in range(len(texts))]
        metadatas = [
            {
                "source_id": source_id,
                "source_name": source_name,
                "chunk_index": i
            }
            for i in range(len(texts))
        ]
        
        if embeddings:
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas
            )
        else:
            self.collection.add(
                ids=ids,
                documents=texts,
                metadatas=metadatas
            )
    
    def query(
        self, 
        query_text: str, 
        n_results: int = 5,
        active_source_ids: Optional[List[str]] = None,
        query_embeddings: Optional[List[float]] = None
    ) -> Dict:
        """Query the vector store with optional source filtering."""
        where_clause = None
        if active_source_ids:
            where_clause = {"source_id": {"$in": active_source_ids}}
        
        if query_embeddings:
            results = self.collection.query(
                query_embeddings=[query_embeddings],
                n_results=n_results,
                where=where_clause
            )
        else:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where=where_clause
            )
        
        return results
    
    def delete_source(self, source_id: str):
        """Delete all documents for a specific source."""
        self.collection.delete(
            where={"source_id": source_id}
        )


