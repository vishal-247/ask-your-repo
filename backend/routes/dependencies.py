from fastapi import APIRouter

import backend.data.store as store

from backend.utils.dependency_analyzer import (
    analyze_dependencies
)

router = APIRouter()


@router.get("/dependencies")
def dependencies():

    if store.repo_files is None:

        return {
            "error": "Load repository first"
        }

    return analyze_dependencies(
        store.repo_files
    )

