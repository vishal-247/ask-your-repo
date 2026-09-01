from fastapi import APIRouter, Depends
import backend.data.store as store
from backend.utils.dependency_analyzer import analyze_dependencies
from backend.utils.auth_deps import require_current_user

router = APIRouter()


@router.get("/dependencies")
def dependencies(current_user=Depends(require_current_user)):
    if store.repo_files is None:
        return {"error": "Load repository first"}

    return analyze_dependencies(store.repo_files)

