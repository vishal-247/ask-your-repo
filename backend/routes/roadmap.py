from fastapi import APIRouter

from backend.roadmap_generator import (
    generate_learning_roadmap
)

from backend.routes.repos import repo_files


router = APIRouter()


@router.get("/generate-roadmap")
def roadmap():

    if repo_files is None:

        return {
            "error": "Load repository first"
        }

    roadmap = generate_learning_roadmap(
        repo_files
    )

    return {
        "roadmap": roadmap
    }

