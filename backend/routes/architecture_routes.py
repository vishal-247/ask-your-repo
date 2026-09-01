from fastapi import APIRouter, Depends
import backend.data.store as store
from backend.services.architecture_service import ArchitectureService
from backend.utils.auth_deps import require_current_user
from backend.models.user import User

router = APIRouter()

architecture_service = ArchitectureService()


@router.get("/visualize")
async def visualize_architecture(current_user: User = Depends(require_current_user)):

    if store.repo_files is None:

        return {
            "message":
            "Load repository first"
        }

    return (
        architecture_service
        .generate_architecture()
    )