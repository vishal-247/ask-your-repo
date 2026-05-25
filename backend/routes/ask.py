from fastapi import APIRouter
from pydantic import BaseModel

from backend.rag_pipeline import ask_question

import backend.data.store as store


router = APIRouter()


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
def ask(data: QuestionRequest):

    if store.vectorstore is None:

        return {
            "answer": "Load repository first",
            "sources": []
        }

    result = ask_question(
        store.vectorstore,
        data.question
    )

    return result

