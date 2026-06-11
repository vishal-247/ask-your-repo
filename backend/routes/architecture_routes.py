from fastapi import APIRouter

import backend.data.store as store

from backend.services.architecture_service import (
    ArchitectureService
)

router = APIRouter()

architecture_service = (
    ArchitectureService()
)


@router.get("/visualize")
async def visualize_architecture():

    if store.repo_files is None:

        return {
            "message":
            "Load repository first"
        }

    return (
        architecture_service
        .generate_architecture()
    )