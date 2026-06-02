def build_architecture(dependency_data):

    architecture = {

        "entry_points":
        dependency_data["entry_points"],

        "layers": [

            {
                "name": "Frontend",
                "components": []
            },

            {
                "name": "Backend",
                "components": []
            },

            {
                "name": "AI Layer",
                "components": []
            }
        ]
    }

    for imp in dependency_data["internal_imports"]:

        imp_lower = imp.lower()

        if any(
            keyword in imp_lower
            for keyword in [
                "rag",
                "embedding",
                "llm",
                "vector"
            ]
        ):

            architecture["layers"][2][
                "components"
            ].append(imp)

        elif any(
            keyword in imp_lower
            for keyword in [
                "route",
                "repo",
                "service",
                "backend",
                "api"
            ]
        ):

            architecture["layers"][1][
                "components"
            ].append(imp)

        elif "frontend" in imp_lower:

            architecture["layers"][0][
                "components"
            ].append(imp)

    return architecture