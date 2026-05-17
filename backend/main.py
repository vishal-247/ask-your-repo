from fastapi import FastAPI
from pydantic import BaseModel

from backend.repo_loader import fetch_repo_files
from backend.embeddings import create_vector_store
from backend.rag_pipeline import ask_question
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store vector DB temporarily
vectorstore = None


class RepoRequest(BaseModel):
    repo_name: str


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():

    return {
        "message": "Ask Your Repo Backend Running 😭🔥"
    }


@app.post("/load-repo")
def load_repo(data: RepoRequest):

    global vectorstore

    files = fetch_repo_files(data.repo_name)

    vectorstore = create_vector_store(files)

    return {
        "message": "Repository loaded successfully 😭🔥",
        "total_files": len(files)
    }


@app.post("/ask")
def ask(data: QuestionRequest):

    global vectorstore

    if vectorstore is None:

        return {
            "error": "Load repository first"
        }

    result = ask_question(
        vectorstore,
        data.question
    )

    return result