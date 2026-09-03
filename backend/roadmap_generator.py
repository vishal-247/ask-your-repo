from backend.utils.llm_utils import get_chat_llm


def generate_learning_roadmap(files):

    # Build repository structure context
    file_list = "\n".join([
        file["path"]
        for file in files
    ])

    prompt = f"""
You are an expert software architect and onboarding mentor.

Your task is to generate a beginner-friendly learning roadmap
for understanding a GitHub repository.

REPOSITORY FILE STRUCTURE:

{file_list}

Instructions:
- Identify important files/folders
- Detect likely entry points
- Suggest best learning order
- Explain why each step matters
- Keep roadmap beginner-friendly
- Mention estimated difficulty
- Mention estimated learning time

OUTPUT FORMAT:

1. File/folder name
   - Why important
   - What to learn there

At the end include:
- Difficulty Level
- Estimated Learning Time
"""

    try:
        llm = get_chat_llm(temperature=0)
        response = llm.invoke(prompt)
        return response.content
    except Exception as exc:
        print(f"Roadmap LLM Invocation error: {exc}")
        # Structured fallback
        return f"""
# 🗺️ Repository Onboarding Roadmap

## 1. Project Configuration & Entry Points
- **package.json / requirements.txt / main.py**: Review core dependencies and application entry script.

## 2. Core Source Directory (`src/` or `backend/`)
- **Key Modules**: Inspect route definitions, controllers, and data handling models.

## 3. Data & Storage
- **Models / Database**: Understand data schema definitions and vector store embeddings.

---
- **Difficulty Level**: Intermediate
- **Estimated Learning Time**: 1 - 2 Hours
"""