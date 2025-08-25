# AI Blog Generator — Dual Provider (Groq + Gemini)

## Quick start

1. Copy `backend/.env.example` to `backend/.env` and fill your API keys.
2. Create a Python virtualenv and install requirements:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the backend:
   ```
   python app.py
   ```
4. Open the frontend in your browser:
   - Use a local static server (recommended):
     ```
     cd frontend
     python -m http.server 5500
     ```
     then open http://127.0.0.1:5500
   - Or access via Flask root route at http://127.0.0.1:5000

## Notes
- Backend will attempt the requested provider first, then fallback to the other provider automatically.
- Keep your API keys safe. Do NOT commit `.env` to a public repo.
