
from fastapi import APIRouter
from pydantic import BaseModel

from backend.rag_pipeline import ask_question
from backend.routes.repos import vectorstore


router = APIRouter()


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
def ask(data: QuestionRequest):

    if vectorstore is None:

        return {
            "error": "Load repository first"
        }

    result = ask_question(
        vectorstore,
        data.question
    )

    return result
