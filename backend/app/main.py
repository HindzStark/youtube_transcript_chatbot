from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from chatbot import (
    load_video,
    ask_question,
    get_video_id,
    InvalidYouTubeUrlError,
    TranscriptNotAvailableError,
    VectorStoreError,
    QuestionAnswerError,
    LoadVideoError,
)
from pydantic import BaseModel,Field
from typing import Annotated


app=FastAPI()

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

class VideoRequest(BaseModel):
    url: Annotated[str,Field(...,description="Url of the video")]

class Question(BaseModel):
    url:Annotated[str,Field(...,description="Url of the video")]
    query:Annotated[str,Field(...,description="Question for the video")]
    ans_len:Annotated[int,Field(...,description="length of ans for the video",ge=1,le=5)]
    


video_vectorstores = {}

@app.get("/")
def home():
    return{"message":"Server Started Running"}

@app.post("/load-video")
def load_video_api(video_url:VideoRequest):
    try:
        video_id=get_video_id(video_url.url)

        if video_id in video_vectorstores:
            return {"message":"video already exist"}
        
        vector_store=load_video(video_url.url)
        video_vectorstores[video_id] = vector_store

        return{"message":"video loaded Successfully"}
    except InvalidYouTubeUrlError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except TranscriptNotAvailableError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except VectorStoreError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except LoadVideoError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal server error") from exc

@app.post("/ask")
def ask_query(query:Question):
    try:
        video_id=get_video_id(query.url)

        if video_id not in video_vectorstores:
            raise HTTPException(status_code=400, detail="Video not loaded yet")
        
        video_vector=video_vectorstores[video_id]

        answer=ask_question(
            video_vector,
            query.query,
            query.ans_len
        )

        return{"answer":answer}
    except InvalidYouTubeUrlError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except QuestionAnswerError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal server error") from exc


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)