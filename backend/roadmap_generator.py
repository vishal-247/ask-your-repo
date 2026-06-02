from langchain_nvidia_ai_endpoints import ChatNVIDIA
from dotenv import load_dotenv

import os

load_dotenv()

api_key = os.getenv("NVIDIA_API_KEY")


def generate_learning_roadmap(files):

    llm = ChatNVIDIA(
        model="meta/llama-3.1-70b-instruct",
        api_key=api_key,
        temperature=0
    )

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

    response = llm.invoke(prompt)

    return response.content