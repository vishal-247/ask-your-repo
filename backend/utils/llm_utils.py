import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

NVIDIA_CHAT_MODELS = [
    "deepseek-ai/deepseek-v4-flash-0731",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "mistralai/mistral-large-2-instruct",
    "google/gemma-3-12b-it",
    "meta/llama-3.3-70b-instruct",
]


def get_chat_llm(temperature: float = 0):
    """Returns an active LLM instance supporting Groq, Google Gemini, or NVIDIA."""
    # 1. Check for Groq API (High performance, free tier)
    if GROQ_API_KEY:
        try:
            from langchain_groq import ChatGroq
            print("Using Groq LLM (llama-3.3-70b-versatile)...")
            return ChatGroq(
                model="llama-3.3-70b-versatile",
                groq_api_key=GROQ_API_KEY,
                temperature=temperature
            )
        except Exception as e:
            print(f"Groq LLM init failed: {e}")

    # 2. Check for Google Gemini API
    if GEMINI_API_KEY:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            print("Using Google Gemini LLM (gemini-1.5-flash)...")
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=GEMINI_API_KEY,
                temperature=temperature
            )
        except Exception as e:
            print(f"Gemini LLM init failed: {e}")

    # 3. Check for NVIDIA API
    if NVIDIA_API_KEY:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        for model_name in NVIDIA_CHAT_MODELS:
            try:
                return ChatNVIDIA(
                    model=model_name,
                    api_key=NVIDIA_API_KEY,
                    temperature=temperature
                )
            except Exception:
                continue

        return ChatNVIDIA(
            model=NVIDIA_CHAT_MODELS[0],
            api_key=NVIDIA_API_KEY,
            temperature=temperature
        )

    raise ValueError("No valid LLM API keys found (GROQ_API_KEY, GEMINI_API_KEY, or NVIDIA_API_KEY).")
