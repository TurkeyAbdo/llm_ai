"""FastAPI backend for NexusMind."""
import os
import tempfile
from typing import List
import traceback

# Disable ChromaDB telemetry to avoid errors
os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import FileInfo, ChatRequest, ChatResponse, UploadResponse
from vectorstore import VectorStore
from llm import LLMModel
from utils import extract_text_from_file, chunk_text, generate_source_id

# Initialize FastAPI app
app = FastAPI(title="NexusMind API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
vectorstore = VectorStore()
llm_model = None  # Lazy loading

# In-memory file registry (in production, use a database)
file_registry: dict[str, str] = {}  # file_id -> file_name


def get_llm_model():
    """Lazy load LLM model."""
    global llm_model
    if llm_model is None:
        llm_model = LLMModel()
    return llm_model


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    print("NexusMind API starting up...")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "NexusMind API"}


@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and process a file (PDF, TXT, or DOCX)."""
    # Validate file type
    allowed_types = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: PDF, TXT, DOCX"
        )
    
    # Generate source ID
    source_id = generate_source_id()
    source_name = file.filename or f"file_{source_id[:8]}"
    
    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(source_name)[1]) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Extract text
        text = extract_text_from_file(tmp_file_path, file.content_type)
        
        if not text:
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Chunk text
        chunks = chunk_text(text, chunk_size=500, chunk_overlap=100)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to create text chunks")
        
        # Add to vector store
        vectorstore.add_documents(
            texts=chunks,
            source_id=source_id,
            source_name=source_name
        )
        
        # Register file
        file_registry[source_id] = source_name
        
        return UploadResponse(
            file_id=source_id,
            file_name=source_name,
            chunks_created=len(chunks),
            status="success"
        )
    
    except Exception as e:
        print(f"Error processing file: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    
    finally:
        # Clean up temp file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


@app.get("/files", response_model=List[FileInfo])
async def get_files():
    """Get list of all uploaded files."""
    files = [
        FileInfo(id=file_id, name=file_name)
        for file_id, file_name in file_registry.items()
    ]
    return files


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the documents using active file filtering."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # Query vector store with source filtering
        active_source_ids = request.active_file_ids if request.active_file_ids else None
        
        # Adjust number of results based on number of active sources
        # More sources = more chunks needed, but limit to avoid context overflow
        num_sources = len(active_source_ids) if active_source_ids else 0
        n_results = min(3 + (num_sources * 2), 10) if num_sources > 0 else 5
        
        results = vectorstore.query(
            query_text=request.message,
            n_results=n_results,
            active_source_ids=active_source_ids
        )
        
        # Extract context from results
        if results and results.get("documents") and results["documents"][0]:
            context_chunks = results["documents"][0]
            metadatas_list = results.get("metadatas", [[]])[0]
            
            # Get unique source IDs used
            sources_used = list(set([
                meta["source_id"] 
                for meta in metadatas_list 
                if meta
            ]))
            source_names = [file_registry.get(sid, sid) for sid in sources_used]
            
            # Build context with better organization for multiple sources
            # Group chunks by source for better structure
            if len(sources_used) > 1:
                # Multiple sources: organize by source
                source_groups = {}
                
                for i, chunk in enumerate(context_chunks):
                    if i < len(metadatas_list) and metadatas_list[i]:
                        chunk_source = metadatas_list[i].get("source_id")
                        source_name = file_registry.get(chunk_source, chunk_source)
                        
                        if chunk_source not in source_groups:
                            source_groups[chunk_source] = []
                        source_groups[chunk_source].append(chunk)
                
                # Build context with source labels
                context_parts = []
                for source_id in sources_used:
                    if source_id in source_groups:
                        source_name = file_registry.get(source_id, source_id)
                        chunks_text = "\n".join(source_groups[source_id])
                        context_parts.append(f"[From {source_name}]\n{chunks_text}")
                
                context = "\n\n---\n\n".join(context_parts)
            else:
                # Single source: simple concatenation
                context = "\n\n".join(context_chunks)
        else:
            context = "No relevant context found."
            source_names = []
        
        # Generate response using LLM
        llm = get_llm_model()
        response = llm.generate_response(
            user_message=request.message,
            context=context,
            max_length=512,
            temperature=0.7
        )
        
        return ChatResponse(
            response=response,
            sources_used=source_names
        )
    
    except Exception as e:
        print(f"Error in chat: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

