from backend.services.architecture_builder import (
    ArchitectureBuilder
)

from backend.services.dependency_extractor import (
    DependencyExtractor
)

from backend.services.dependency_graph_builder import (
    DependencyGraphBuilder
)

import backend.data.store as store


class ArchitectureService:

    def __init__(self):

        self.architecture_builder = (
            ArchitectureBuilder()
        )

        self.dependency_extractor = (
            DependencyExtractor()
        )

        self.graph_builder = (
            DependencyGraphBuilder()
        )

    def generate_architecture(
        self
    ):

        files = self._load_repo_files()

        architecture = (
            self.architecture_builder
            .build(files)
        )

        classified_files = (
            self.architecture_builder
            .classify_files(files)
        )

        dependency_data = []

        for file in files:

            dependency_data.append(

                self.dependency_extractor
                .extract(
                    file["path"],
                    file["content"]
                )
            )

        graph = (
            self.graph_builder
            .build(
                classified_files,
                dependency_data
            )
        )

        return {

            "nodes":
                architecture["nodes"],

            "edges":
                graph["edges"],

            "layers":
                architecture["layers"],

            "unknown_files":
                architecture[
                    "unknown_files"
                ]
        }

    def _load_repo_files(
        self
    ):

        if store.repo_files is None:

            raise Exception(
                "Load repository first"
            )

        return store.repo_files