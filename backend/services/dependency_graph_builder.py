#patch code for testing purpose, not for production use
from collections import defaultdict


class DependencyGraphBuilder:

    def build(
        self,
        classified_files,
        dependency_data
    ):

        path_to_layer = {}

        for file in classified_files:

            path_to_layer[
                file["path"]
            ] = (
                file["classification"]
                .get(
                    "primary_layer",
                    "Unknown"
                )
            )

        edge_weights = defaultdict(int)

        for file in dependency_data:

            source_path = (
                file.get(
                    "path",
                    ""
                )
            )

            source_layer = (
                path_to_layer.get(
                    source_path,
                    "Unknown"
                )
            )

            if source_layer == "Unknown":
                continue

            for dependency in (
                file.get(
                    "dependencies",
                    []
                )
            ):

                target_layer = (
                    self._guess_layer(
                        dependency
                    )
                )

                if (
                    target_layer
                    == "Unknown"
                ):
                    continue

                if (
                    source_layer
                    == target_layer
                ):
                    continue

                edge_weights[
                    (
                        source_layer,
                        target_layer
                    )
                ] += 1

        edges = []

        for (
            source,
            target
        ), weight in (
            edge_weights.items()
        ):

            edges.append({
                "source": source,
                "target": target,
                "weight": weight
            })

        return {
            "edges": edges
        }

    def _guess_layer(
        self,
        dependency
    ):

        dependency = (
            dependency.lower()
        )

        if any(
            word in dependency
            for word in [
                "react",
                "next",
                "component",
                "ui"
            ]
        ):
            return "Frontend"

        if any(
            word in dependency
            for word in [
                "fastapi",
                "django",
                "flask",
                "api",
                "route"
            ]
        ):
            return "Backend"

        if any(
            word in dependency
            for word in [
                "langchain",
                "openai",
                "rag",
                "faiss",
                "llm"
            ]
        ):
            return "AI"

        if any(
            word in dependency
            for word in [
                "database",
                "sqlalchemy",
                "mongodb",
                "postgres"
            ]
        ):
            return "Database"

        return "Unknown"