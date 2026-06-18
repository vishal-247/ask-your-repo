import re
from pathlib import Path
from typing import Dict, List


class FileRoleClassifier:
    """
    Classifies a file into:
    - Frontend
    - Backend
    - AI
    - Database

    Returns:
    {
        "primary_layer": "...",
        "secondary_layers": [...],
        "confidence": 0.91,
        "scores": {...},
        "reasons": [...]
    }
    """

    FRONTEND_PATTERNS = [
        r"import\s+react",
        r"from\s+['\"]react['\"]",
        r"usestate",
        r"useeffect",
        r"next/",
        r"nextjs",
        r"next\.config",
        r"vue",
        r"angular",
        r"tailwind",
        r"redux",
        r"zustand",
        r"react-router",
        r"next/link",
        r"next/navigation",
        r"vite",
        r"svelte",
        r"nuxt",
    ]

    BACKEND_PATTERNS = [
        r"fastapi",
        r"express",
        r"flask",
        r"django",
        r"spring",
        r"apirouter",
        r"router\.get",
        r"router\.post",
        r"@app\.get",
        r"@app\.post",
        r"@controller",
        r"@restcontroller",
        r"uvicorn",
        r"nestjs",
        r"koa",
        r"gin",
        r"fiber",
        r"requestmapping",
    ]

    AI_PATTERNS = [
        r"langchain",
        r"openai",
        r"chatopenai",
        r"faiss",
        r"chromadb",
        r"vectorstore",
        r"retriever",
        r"embedding",
        r"\brag\b",
        r"\bllm\b",
        r"transformers",
        r"sentence_transformers",
        r"llama_index",
        r"huggingface",
        r"crewai",
        r"autogen",
        r"litellm",
        r"ollama",
        r"vllm",
        r"haystack",
        r"llama_cpp",
        r"pydanticai",
        r"prompt_template",
        r"tool_call",
        r"agent",
    ]

    DATABASE_PATTERNS = [
        r"mongodb",
        r"mongoose",
        r"sqlalchemy",
        r"postgres",
        r"mysql",
        r"sqlite",
        r"sessionlocal",
        r"sessionmaker",
        r"create_engine",
        r"declarative_base",
        r"pymongo",
        r"motor",
        r"redis",
        r"asyncpg",
    ]

    FRONTEND_PATHS = {
        "frontend",
        "client",
        "components",
        "pages",
        "ui",
        "views",
        "assets",
    }

    BACKEND_PATHS = {
        "backend",
        "server",
        "routes",
        "controllers",
        "middleware",
        "handlers",
        "api",
    }

    AI_PATHS = {
        "ai",
        "llm",
        "rag",
        "embedding",
        "vector",
        "chatbot",
        "retriever",
        "inference",
    }

    DATABASE_PATHS = {
        "database",
        "db",
        "schema",
        "schemas",
        "migration",
        "migrations",
        "entities",
    }

    # CHANGED: removed FRONTEND_EXTENSIONS, replaced with FRONTEND_EXTENSION_SCORES
    FRONTEND_EXTENSION_SCORES = {
        ".jsx":  3,
        ".tsx":  3,
        ".css":  3,
        ".scss": 3,
        ".html": 2,
    }

    SUPPORTED_EXTENSIONS = {
        ".py",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".java",
        ".go",
        ".cpp",
        ".cs",
        ".html",
        ".css",
        ".scss",
    }

    def __init__(self):

        self.compiled_patterns = {
            "Frontend": [
                re.compile(p, re.IGNORECASE)
                for p in self.FRONTEND_PATTERNS
            ],
            "Backend": [
                re.compile(p, re.IGNORECASE)
                for p in self.BACKEND_PATTERNS
            ],
            "AI": [
                re.compile(p, re.IGNORECASE)
                for p in self.AI_PATTERNS
            ],
            "Database": [
                re.compile(p, re.IGNORECASE)
                for p in self.DATABASE_PATTERNS
            ],
        }

    def classify(
        self,
        file_path: str,
        content: str
    ) -> Dict:

        try:

            file_path = str(file_path or "")
            content = str(content or "")

            ext = Path(file_path).suffix.lower()

            if ext and ext not in self.SUPPORTED_EXTENSIONS:
                return {
                    "primary_layer": "Unknown",
                    "secondary_layers": [],
                    "confidence": 0.0,
                    "scores": {},
                    "reasons": [
                        f"unsupported extension {ext}"
                    ]
                }

            path = file_path.lower()
            text = content.lower()

            scores = {
                "Frontend": 0,
                "Backend": 0,
                "AI": 0,
                "Database": 0,
            }

            reasons = {
                "Frontend": [],
                "Backend": [],
                "AI": [],
                "Database": [],
            }

            self._score_content(
                text,
                scores,
                reasons
            )

            self._score_paths(
                path,
                scores,
                reasons
            )

            self._score_extensions(
                ext,
                scores,
                reasons
            )

            return self._build_result(
                scores,
                reasons
            )

        except Exception as e:

            return {
                "primary_layer": "Unknown",
                "secondary_layers": [],
                "confidence": 0.0,
                "scores": {},
                "reasons": [
                    f"classification error: {str(e)}"
                ]
            }

    def _score_content(
        self,
        text: str,
        scores: Dict,
        reasons: Dict
    ):

        for layer, patterns in self.compiled_patterns.items():

            for pattern in patterns:

                if pattern.search(text):
                    scores[layer] += 5
                    reasons[layer].append(
                        f"matched '{pattern.pattern}'"
                    )

    def _score_paths(
        self,
        path: str,
        scores: Dict,
        reasons: Dict
    ):

        path_parts = set(
            Path(path)
            .as_posix()
            .lower()
            .split("/")
        )

        groups = {
            "Frontend": self.FRONTEND_PATHS,
            "Backend": self.BACKEND_PATHS,
            "AI": self.AI_PATHS,
            "Database": self.DATABASE_PATHS,
        }

        for layer, keywords in groups.items():

            for keyword in keywords:

                if keyword.lower() in path_parts:

                    scores[layer] += 2

                    reasons[layer].append(
                        f"path contains '{keyword}'"
                    )

    # CHANGED: graduated scores per extension instead of flat +1
    def _score_extensions(
        self,
        ext: str,
        scores: Dict,
        reasons: Dict
    ):

        score = self.FRONTEND_EXTENSION_SCORES.get(ext, 0)

        if score:
            scores["Frontend"] += score
            reasons["Frontend"].append(
                f"frontend extension {ext} (+{score})"
            )

    def _build_result(
        self,
        scores: Dict,
        reasons: Dict
    ) -> Dict:

        total_score = sum(scores.values())

        if total_score == 0:
            return {
                "primary_layer": "Unknown",
                "secondary_layers": [],
                "confidence": 0.0,
                "scores": scores,
                "reasons": []
            }

        sorted_layers = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        primary_layer = sorted_layers[0][0]
        primary_score = sorted_layers[0][1]

        second_score = (
            sorted_layers[1][1]
            if len(sorted_layers) > 1
            else 0
        )

        confidence = round(
            primary_score /
            max(primary_score + second_score, 1),
            2
        )

        secondary_layers = [
            layer
            for layer, score in sorted_layers[1:]
            if score >= max(2, primary_score * 0.5)
        ]

        unique_reasons = list(
            dict.fromkeys(
                reasons[primary_layer]
            )
        )

        return {
            "primary_layer": primary_layer,
            "secondary_layers": secondary_layers,
            "confidence": confidence,
            "scores": scores,
            "reasons": unique_reasons[:5]
        }


if __name__ == "__main__":

    classifier = FileRoleClassifier()

    sample_code = """
    from langchain_openai import ChatOpenAI
    from langchain.vectorstores import FAISS

    retriever = vectorstore.as_retriever()
    """

    result = classifier.classify(
        "services/rag/chat_service.py",
        sample_code
    )

    print(result)