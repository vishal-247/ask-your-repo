from pathlib import Path


class FileParser:

    SKIP_DIRS = {
        ".git",
        ".github",
        "node_modules",
        "venv",
        ".venv",
        "__pycache__",
        "dist",
        "build",
        ".idea",
        ".vscode",
        "target",
        "bin",
        "obj"
    }

    SKIP_EXTENSIONS = {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".ico",
        ".pdf",
        ".zip",
        ".tar",
        ".gz",
        ".exe",
        ".dll",
        ".so",
        ".class",
        ".jar",
        ".pyc"
    }

    MAX_FILE_SIZE = 1024 * 1024  # 1 MB

    def parse_repository(
        self,
        repo_path
    ):

        repo_path = Path(repo_path)

        files = []

        if not repo_path.exists():
            raise FileNotFoundError(
                f"Repository not found: {repo_path}"
            )

        for file_path in repo_path.rglob("*"):

            if not file_path.is_file():
                continue

            if self._should_skip(file_path):
                continue

            content = self._read_file(
                file_path
            )

            if content is None:
                continue

            relative_path = (
                file_path
                .relative_to(repo_path)
                .as_posix()
            )

            files.append({
                "path": relative_path,
                "content": content
            })

        return files

    def _should_skip(
        self,
        file_path
    ):

        parts = set(file_path.parts)

        if (
            parts
            & self.SKIP_DIRS
        ):
            return True

        if (
            file_path.suffix.lower()
            in self.SKIP_EXTENSIONS
        ):
            return True

        try:

            if (
                file_path.stat().st_size
                > self.MAX_FILE_SIZE
            ):
                return True

        except Exception:
            return True

        return False

    def _read_file(
        self,
        file_path
    ):

        encodings = [
            "utf-8",
            "latin-1",
            "cp1252"
        ]

        for encoding in encodings:

            try:

                with open(
                    file_path,
                    "r",
                    encoding=encoding
                ) as file:

                    return file.read()

            except Exception:
                continue

        return None


if __name__ == "__main__":

    parser = FileParser()

    files = parser.parse_repository(
        "sample_repo"
    )

    print(
        f"Parsed {len(files)} files"
    )

    for file in files[:5]:
        print(file["path"])