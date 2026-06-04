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

    frontend_files = []

    repo_modules = set()

    # Discover top-level modules present in repo

    for file in files:

        path = file["path"]

        parts = path.split("/")

        for part in parts[:-1]:
            if part:
                repo_modules.add(part)

    for file in files:

        path = file["path"]

        content = file["content"]
        path_lower = path.lower()
        if any(
            path_lower.endswith(ext)
            for ext in [
                ".html",
                ".css",
                ".js",
                ".jsx",
                ".tsx"
            ]
        ):
            frontend_files.append(path)

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
            # Determine if the import is internal or external based on repo modules
            if imported.startswith("."):
                internal_imports.add(imported)
                continue

            root_module = imported.split(".")[0]

            if root_module in repo_modules:

                internal_imports.add(imported)

            else:

                external_imports.add(imported)

        dependency_map[path] = imports

    print("\n===== DEPENDENCY ANALYSIS =====")
    print("REPO MODULES:", repo_modules)
    print("INTERNAL IMPORTS:", internal_imports)
    print("EXTERNAL IMPORTS:", external_imports)
    print("===============================\n")
    print("FRONTEND FILES:", frontend_files)

    return {

        "entry_points": entry_points,

        "internal_imports": list(
            internal_imports
        ),

        "external_imports": list(
            external_imports
        ),

        "dependencies": dependency_map,

        "repo_modules": list(
            repo_modules
        ),

        "frontend_files": frontend_files
    }