from collections import defaultdict
from backend.services.file_role_classifier import FileRoleClassifier


class ArchitectureBuilder:

    def __init__(self):
        self.classifier = FileRoleClassifier()

    def build(self, files):

        classified_files = self.classify_files(files)

        layer_groups, unknown_files = (
            self.create_layer_groups(
                classified_files
            )
        )

        nodes = self.create_nodes(
            layer_groups
        )

        return {
            "layers": layer_groups,
            "unknown_files": unknown_files,
            "nodes": nodes
        }

    def classify_files(self, files):

        results = []

        for file in files:

            path = file.get("path", "")
            content = file.get("content", "")

            classification = (
                self.classifier.classify(
                    path,
                    content
                )
            )

            results.append({
                "path": path,
                "classification": classification
            })

        return results

    def create_layer_groups(
        self,
        classified_files
    ):

        groups = defaultdict(
            lambda: {
                "count": 0,
                "files": [],
                "total_confidence": 0
            }
        )

        unknown_files = []

        for file in classified_files:

            path = file["path"]
            classification = file[
                "classification"
            ]

            primary_layer = (
                classification.get(
                    "primary_layer",
                    "Unknown"
                )
            )

            if primary_layer == "Unknown":

                unknown_files.append({
                    "path": path,
                    "classification":
                        classification
                })

                continue

            groups[primary_layer][
                "count"
            ] += 1

            groups[primary_layer][
                "total_confidence"
            ] += classification.get(
                "confidence",
                0
            )

            groups[primary_layer][
                "files"
            ].append({

                "path": path,

                "primary_layer":
                    classification.get(
                        "primary_layer"
                    ),

                "secondary_layers":
                    classification.get(
                        "secondary_layers",
                        []
                    ),

                "confidence":
                    classification.get(
                        "confidence",
                        0
                    ),

                "scores":
                    classification.get(
                        "scores",
                        {}
                    ),

                "reasons":
                    classification.get(
                        "reasons",
                        []
                    )
            })

        for layer in groups:

            count = groups[layer]["count"]

            if count > 0:

                groups[layer][
                    "avg_confidence"
                ] = round(
                    groups[layer][
                        "total_confidence"
                    ] / count,
                    2
                )

            else:

                groups[layer][
                    "avg_confidence"
                ] = 0

            del groups[layer][
                "total_confidence"
            ]

        return dict(groups), unknown_files

    def create_nodes(
        self,
        layer_groups
    ):

        nodes = []

        for layer, data in (
            layer_groups.items()
        ):

            nodes.append({

                "id":
                    layer.lower(),

                "label":
                    layer,

                "type":
                    "layer",

                "count":
                    data["count"],

                "avg_confidence":
                    data.get(
                        "avg_confidence",
                        0
                    )
            })

        return nodes


if __name__ == "__main__":

    files = [

        {
            "path":
            "frontend/components/Login.jsx",

            "content":
            """
            import React from 'react'
            import { useState } from 'react'
            """
        },

        {
            "path":
            "backend/routes/auth.py",

            "content":
            """
            from fastapi import APIRouter
            """
        },

        {
            "path":
            "ai/rag/chat.py",

            "content":
            """
            from langchain_openai import ChatOpenAI
            from langchain.vectorstores import FAISS
            """
        },

        {
            "path":
            "database/models/user.py",

            "content":
            """
            from sqlalchemy import Column
            """
        },

        {
            "path":
            "README.md",

            "content":
            """
            Project Documentation
            """
        }
    ]

    builder = ArchitectureBuilder()

    architecture = builder.build(
        files
    )

    from pprint import pprint
    pprint(architecture)