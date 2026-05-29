from fastapi import APIRouter

import backend.data.store as store


router = APIRouter()


@router.get("/architecture-summary")
def architecture_summary():

    if store.repo_files is None:

        return {
            "summary": "Load repository first"
        }

    files = store.repo_files

    frontend_exists = any(
        "frontend" in file.lower()
        for file in files
    )

    backend_exists = any(
        "backend" in file.lower()
        for file in files
    )

    rag_exists = any(
        "rag" in file.lower()
        for file in files
    )

    llm_exists = any(
        "llm" in file.lower()
        or "nvidia" in file.lower()
        for file in files
    )

    summary = []

    if frontend_exists:
        summary.append("Frontend UI")

    if backend_exists:
        summary.append("FastAPI Backend")

    if rag_exists:
        summary.append("RAG Pipeline")

    if llm_exists:
        summary.append("LLM Integration")

    architecture_flow = " → ".join(summary)

    return {
        "summary": architecture_flow
    }

