
from fastapi import APIRouter

from backend.roadmap_generator import (
    generate_learning_roadmap
)

import backend.data.store as store


router = APIRouter()


@router.get("/generate-roadmap")
def roadmap():

    if store.repo_files is None:

        return {
            "roadmap": "Load repository first"
        }

    roadmap = generate_learning_roadmap(
        store.repo_files
    )

    return {
        "roadmap": roadmap
    }

