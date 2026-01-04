# NexusMind

A simplified NotebookLM clone - AI-powered document chat with source filtering.

## Project Structure

```
nexusmind/
├── backend/              # FastAPI backend
│   ├── main.py          # FastAPI application
│   ├── models.py        # Pydantic models
│   ├── vectorstore.py   # ChromaDB integration
│   ├── llm.py           # Llama model integration
│   └── utils.py         # Text extraction and chunking utilities
├── frontend/            # Next.js frontend
│   ├── app/
│   ├── components/
│   └── package.json
├── requirements.txt     # Python dependencies
└── README.md
```

## Features

- **Sources Tab**: Upload and manage PDF/TXT/DOCX files
- **Chat Tab**: Query documents with active source filtering
- **Vector Search**: ChromaDB-based semantic search
- **LLM Integration**: Llama-3.2-1B-Instruct with 4-bit quantization

## Quick Start

See [SETUP.md](SETUP.md) for detailed installation instructions.

### Backend
```bash
# Install PyTorch with CUDA 12.8 first (nightly)
pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128

# Install other dependencies
pip install -r requirements.txt

# Start server
cd backend
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**Important:** You need a Hugging Face account and access token to download the Llama model. Set it via `huggingface-cli login` or `HUGGING_FACE_HUB_TOKEN` environment variable.

## Technical Stack

- **Backend**: FastAPI, ChromaDB, Transformers, BitsAndBytes
- **Frontend**: Next.js, React, TypeScript
- **Model**: meta-llama/Llama-3.2-1B-Instruct (4-bit quantized)
- **Hardware**: Optimized for RTX 5060, CUDA 12.8


