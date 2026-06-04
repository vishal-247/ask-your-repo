from fastapi import APIRouter

import backend.data.store as store

from backend.utils.dependency_analyzer import (
    analyze_dependencies
)

from backend.utils.architecture_builder import (
    build_architecture
)

from backend.utils.graph_builder import (
    build_graph
)

router = APIRouter()

@router.get("/graph")
def graph():

    dependency_data = analyze_dependencies(
        store.repo_files
    )

    architecture_data = build_architecture(
        dependency_data
    )

    return build_graph(
        architecture_data
    )