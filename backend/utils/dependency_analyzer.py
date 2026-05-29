import re


def analyze_dependencies(files):

    dependency_map = {}

    entry_points = []

    for file in files:

        path = file["path"]

        content = file["content"]

        if path.endswith(
            ("main.py", "app.py", "server.py")
        ):
            entry_points.append(path)

        imports = []

        matches = re.findall(
            r"(?:from\s+([\w\.]+)|import\s+([\w\.]+))",
            content
        )

        for match in matches:

            imported = match[0] or match[1]

            imports.append(imported)

        dependency_map[path] = imports

    return {
        "entry_points": entry_points,
        "dependencies": dependency_map
    }

