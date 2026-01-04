# Troubleshooting Guide

## "Failed to fetch" Error When Uploading Files

This error typically means the frontend cannot reach the backend server. Check the following:

### 1. Backend Server is Running

Make sure the FastAPI backend is running:
```bash
cd nexusmind/backend
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 2. Backend is on Correct Port

The frontend expects the backend on `http://localhost:8000`. If you're running on a different port, update the API URL in:
- `frontend/components/SourcesTab.tsx` (line 65)
- `frontend/components/ChatTab.tsx` (line ~70)
- `frontend/app/page.tsx` (line ~20)

### 3. Check Browser Console

Open browser DevTools (F12) and check the Console tab for detailed error messages.

### 4. Verify Backend is Reachable

Test the backend health endpoint:
```bash
curl http://localhost:8000/
```

Or open in browser: `http://localhost:8000/`

You should see: `{"status":"ok","service":"NexusMind API"}`

### 5. CORS Configuration

If running on a different port, update CORS in `backend/main.py`:
```python
allow_origins=["http://localhost:3000", "http://localhost:3001"]  # Add your port
```

### 6. Firewall/Antivirus

Some firewalls or antivirus software may block localhost connections. Temporarily disable to test.

## Other Common Issues

### Import Errors

If you see import errors, make sure you're running from the correct directory:
```bash
cd nexusmind/backend
uvicorn main:app --reload
```

### Port Already in Use

If port 8000 is already in use:
```bash
# Windows: Find process using port 8000
netstat -ano | findstr :8000

# Then kill the process or use a different port
uvicorn main:app --reload --port 8001
```

### ChromaDB Errors

If you see ChromaDB errors, make sure NumPy < 2.0.0 is installed:
```bash
pip install "numpy<2.0.0"
```


