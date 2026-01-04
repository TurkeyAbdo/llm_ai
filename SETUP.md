# NexusMind Setup Guide

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- CUDA 12.8 compatible GPU (RTX 5060 or similar)
- Hugging Face account and access token (for Llama-3.2-1B-Instruct)

## Backend Setup

1. **Create and activate virtual environment:**
   ```bash
   cd nexusmind
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install PyTorch with CUDA 12.8 support (nightly build):**
   ```bash
   pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
   ```

3. **Install remaining dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Hugging Face token (required for Llama model):**
   ```bash
   # Option 1: Login via CLI
   huggingface-cli login
   
   # Option 2: Set environment variable
   # Windows PowerShell
   $env:HUGGING_FACE_HUB_TOKEN="your_token_here"
   # Linux/Mac
   export HUGGING_FACE_HUB_TOKEN="your_token_here"
   ```

5. **Start the backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Go to the **Sources** tab and upload PDF, TXT, or DOCX files
4. Check the boxes next to files you want to activate
5. Switch to the **Chat** tab to start asking questions
6. The chat will only use context from activated sources

## Notes

- First run will download the Llama-3.2-1B-Instruct model (~1.3GB)
- ChromaDB data is stored in `./chroma_db` directory
- The model uses 4-bit quantization to reduce memory usage
- Ensure you have sufficient GPU memory (4GB+ recommended)

