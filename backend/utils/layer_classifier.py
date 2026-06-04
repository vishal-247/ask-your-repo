def classify_component(name):

    name = name.lower()

    # Data Layer

    if any(
        word in name
        for word in [
            ".models",
            "models",
            "data",
            "store",
            "database",
            "db",
            "migration"
        ]
    ):
        return "Data Layer"

    # AI Layer

    elif any(
        word in name
        for word in [
            "rag",
            "embedding",
            "llm",
            "vector",
            "translation",
            "language",
            "detector",
            "chatbot",
            "ai"
        ]
    ):
        return "AI Layer"

    # API Layer

    elif any(
        word in name
        for word in [
            "route",
            "api",
            "ask",
            "repos",
            "roadmap",
            "graph",
            "view",
            "views"
        ]
    ):
        return "API Layer"

    # Presentation Layer

    elif any(
        word in name
        for word in [
            "form",
            "forms",
            "template",
            "frontend",
            "ui"
        ]
    ):
        return "Presentation Layer"

    return "Business Layer"