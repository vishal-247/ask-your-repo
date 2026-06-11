import re
from pathlib import Path


class DependencyExtractor:

    PYTHON_IMPORTS = [
        r"import\s+([a-zA-Z0-9_\.]+)",
        r"from\s+([a-zA-Z0-9_\.]+)\s+import",
    ]

    JS_IMPORTS = [
        r"import\s+.*?\s+from\s+['\"](.+?)['\"]",
        r"require\(['\"](.+?)['\"]\)",
    ]

    def __init__(self):

        self.python_patterns = [
            re.compile(pattern)
            for pattern in self.PYTHON_IMPORTS
        ]

        self.js_patterns = [
            re.compile(pattern)
            for pattern in self.JS_IMPORTS
        ]

    def extract(
        self,
        file_path: str,
        content: str
    ):

        try:

            file_path = str(file_path or "")
            content = str(content or "")

            dependencies = set()

            dependencies.update(
                self._extract_python_imports(
                    content
                )
            )

            dependencies.update(
                self._extract_js_imports(
                    content
                )
            )

            return {
                "file": Path(file_path).name,
                "path": file_path,
                "dependencies": sorted(
                    list(dependencies)
                )
            }

        except Exception as e:

            return {
                "file": Path(
                    file_path
                ).name,
                "path": file_path,
                "dependencies": [],
                "error": str(e)
            }

    def _extract_python_imports(
        self,
        content
    ):

        imports = set()

        for pattern in self.python_patterns:

            matches = pattern.findall(
                content
            )

            for match in matches:

                cleaned = match.strip()

                if cleaned:
                    imports.add(cleaned)

        return imports

    def _extract_js_imports(
        self,
        content
    ):

        imports = set()

        for pattern in self.js_patterns:

            matches = pattern.findall(
                content
            )

            for match in matches:

                cleaned = match.strip()

                if cleaned:
                    imports.add(cleaned)

        return imports