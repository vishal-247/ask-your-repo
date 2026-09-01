import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

DEFAULT_OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct")

OPENROUTER_FALLBACK_MODELS = [
    "meta-llama/llama-3.3-70b-instruct",
    "deepseek/deepseek-chat",
    "openrouter/free",
]


def get_chat_llm(temperature: float = 0, model_name: str = None):
    """Returns an active LLM instance supporting OpenRouter (primary), Groq, or Google Gemini."""
    
    # 1. OpenRouter API (Primary - Unified access with server-side free model fallbacks)
    if OPENROUTER_API_KEY:
        try:
            from langchain_openai import ChatOpenAI
            selected_model = model_name or DEFAULT_OPENROUTER_MODEL
            fallback_models = ([selected_model] + [m for m in OPENROUTER_FALLBACK_MODELS if m != selected_model])[:3]
            print(f"Using OpenRouter LLM ({selected_model}) with fallbacks: {fallback_models}...")
            return ChatOpenAI(
                model_name=selected_model,
                openai_api_key=OPENROUTER_API_KEY,
                openai_api_base="https://openrouter.ai/api/v1",
                temperature=temperature,
                default_headers={
                    "HTTP-Referer": "https://github.com/ask-my-repo",
                    "X-Title": "Ask My Repo",
                },
                extra_body={
                    "models": fallback_models
                }
            )
        except Exception as e:
            print(f"OpenRouter LLM init failed: {e}")

    # 2. Check for Groq API
    if GROQ_API_KEY:
        try:
            from langchain_groq import ChatGroq
            groq_model = "llama-3.3-70b-specdec"
            print(f"Using Groq LLM ({groq_model})...")
            return ChatGroq(
                model=groq_model,
                groq_api_key=GROQ_API_KEY,
                temperature=temperature
            )
        except Exception as e:
            print(f"Groq LLM init failed: {e}")

    # 3. Check for Google Gemini API
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

    raise ValueError("No valid LLM API keys found (OPENROUTER_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY).")



