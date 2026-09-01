
from fastapi import APIRouter, Depends
from backend.roadmap_generator import generate_learning_roadmap
import backend.data.store as store
from backend.utils.auth_deps import require_current_user
from backend.models.user import User

router = APIRouter()


@router.get("/generate-roadmap")
def roadmap(current_user: User = Depends(require_current_user)):

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

