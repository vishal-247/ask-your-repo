from fastapi import APIRouter, Depends
from pydantic import BaseModel

from backend.rag_pipeline import ask_question
import backend.data.store as store
from backend.utils.auth_deps import require_current_user
from backend.models.user import User


router = APIRouter()


class QuestionRequest(BaseModel):
    question: str = None
    message: str = None
    fullName: str = None


@router.post("/ask")
def ask(data: QuestionRequest, current_user: User = Depends(require_current_user)):
    question = data.question or data.message
    if not question:
        return {
            "answer": "No question or message provided.",
            "sources": []
        }

    if store.is_indexing:
        return {
            "answer": "🔄 I'm currently indexing this repository. Please wait a few seconds and try again!",
            "sources": []
        }

    if store.vectorstore is None:
        return {
            "answer": "Load repository first",
            "sources": []
        }

    result = ask_question(
        store.vectorstore,
        question
    )

    return result
