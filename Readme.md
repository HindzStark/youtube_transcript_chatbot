# YouTubeChatBot (ClipSense AI)

Chat with any YouTube video using transcript-based Retrieval-Augmented Generation (RAG).

This project includes:
- A **FastAPI backend** that fetches video transcripts, builds FAISS vector stores, and answers questions with LangChain + OpenAI.
- A **browser extension popup (React + Vite)** that sends questions from the currently active YouTube tab.

---

## Features

- Ask natural-language questions about the open YouTube video
- Automatic transcript fetching (with fallback language translation to English)
- RAG pipeline using transcript chunking + embeddings + FAISS retrieval
- Adjustable answer length (`ans_len` from 1 to 5)
- FastAPI endpoints for loading a video and querying it

---

## Tech Stack

### Backend
- FastAPI
- LangChain
- OpenAI (`gpt-4o-mini`, `text-embedding-3-small`)
- FAISS
- YouTube Transcript API

### Extension Frontend
- React
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3

---

## Project Structure

```text
YoutubChatBot/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py        # FastAPI server
│       ├── chatbot.py     # Transcript + RAG logic
│       └── schemas.py
├── extension/
│   ├── public/
│   │   └── manifest.json  # Extension manifest
│   ├── src/
│   │   ├── App.jsx        # Popup UI + API calls
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── Readme.md
```

---

## How It Works

1. User opens a YouTube video and asks a question in the extension popup.
2. Extension sends the video URL to `POST /load-video`.
3. Backend extracts the video ID, fetches transcript, and builds a FAISS vector store.
4. Extension sends question to `POST /ask`.
5. Backend retrieves relevant transcript chunks and generates an answer with OpenAI.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Google Chrome (or Chromium-based browser for extension loading)
- OpenAI API key

---

## Backend Setup

From project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create environment file:

```bash
cat > .env << 'EOF'
OPENAI_API_KEY=your_openai_api_key_here
EOF
```

Run API server:

```bash
cd app
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/
```

Expected response:

```json
{"message":"Server Started Running"}
```

---

## Extension Setup (Development)

In a new terminal:

```bash
cd extension
npm install
npm run build
```

Load extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the folder: `extension/dist`

Now open any YouTube video and use the extension popup.

> Note: The backend must be running at `http://127.0.0.1:8000`.

---

## API Endpoints

### `GET /`
Returns server status.

### `POST /load-video`
Loads transcript + vector store for a YouTube video.

Request body:

```json
{
	"url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

Possible responses:

```json
{"message":"video loaded Successfully"}
```

```json
{"message":"video already exist"}
```

### `POST /ask`
Asks a question about a previously loaded video.

Request body:

```json
{
	"url": "https://www.youtube.com/watch?v=VIDEO_ID",
	"query": "What is the main topic?",
	"ans_len": 3
}
```

Response:

```json
{
	"answer": "..."
}
```

`ans_len` range is `1` to `5`.

---

## Troubleshooting

- **`Video not loaded yet`**
	- Call `/load-video` first for that URL.

- **`Transcript not available`**
	- Some videos disable transcripts or have unsupported transcript availability.

- **CORS / request blocked from extension**
	- Confirm backend is running on `127.0.0.1:8000`.
	- Confirm extension manifest host permissions include `http://127.0.0.1:8000/*`.

- **OpenAI authentication errors**
	- Verify `OPENAI_API_KEY` in `backend/.env`.
	- Restart backend after updating environment variables.

---

## Development Notes

- Backend keeps vector stores in in-memory dictionary keyed by YouTube video ID.
- Data resets when the server restarts.
- Current CORS allowlist targets local Vite origin (`localhost:5173`, `127.0.0.1:5173`).

---

## Quick Start (One View)

```bash
# Terminal 1 (backend)
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd app
uvicorn main:app --reload

# Terminal 2 (extension)
cd extension
npm install
npm run build
# Load extension/dist in chrome://extensions
```

---

## Future Improvements

- Persistent vector store cache (disk/DB) instead of memory-only state
- Better URL handling (playlist timestamps, shorts edge cases)
- Streaming responses in UI
- Settings panel for response length and model selection

---

## License

Add your preferred license (MIT/Apache-2.0/etc.) before public distribution.
