import re


ENTRY_POINT_FILES = {
    "main.py",
    "app.py",
    "server.py",
    "index.js"
}


def analyze_dependencies(files):

    dependency_map = {}

    entry_points = []

    internal_imports = set()

    external_imports = set()

    for file in files:

        path = file["path"]

        content = file["content"]

        filename = path.split("/")[-1]

        if filename in ENTRY_POINT_FILES:

            entry_points.append(path)

        imports = []

        matches = re.findall(
            r"(?:from\s+([\w\.]+)|import\s+([\w\.]+))",
            content
        )

        for match in matches:

            imported = match[0] or match[1]

            imports.append(imported)

            if "." in imported:
                internal_imports.add(imported)
            else:
                external_imports.add(imported)

        dependency_map[path] = imports

    return {

        "entry_points": entry_points,

        "internal_imports": list(
            internal_imports
        ),

        "external_imports": list(
            external_imports
        ),

        "dependencies": dependency_map
    }