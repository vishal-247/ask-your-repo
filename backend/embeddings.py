import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env", override=True)

# Global singleton instance for fast API embeddings
_embeddings_instance = None


def get_embeddings_model():
    """Returns lightweight API-based embeddings instance (0 PyTorch/GPU RAM overhead)."""
    global _embeddings_instance
    if _embeddings_instance is None:
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        if openrouter_key:
            from langchain_openai import OpenAIEmbeddings
            print("Using OpenRouter Embeddings (openai/text-embedding-3-small)...")
            _embeddings_instance = OpenAIEmbeddings(
                model="openai/text-embedding-3-small",
                openai_api_key=openrouter_key,
                openai_api_base="https://openrouter.ai/api/v1"
            )
        elif gemini_key:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            print("Using Google Gemini Embeddings (models/embedding-001)...")
            _embeddings_instance = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=gemini_key
            )
        else:
            raise ValueError("No valid API key found for embeddings (OPENROUTER_API_KEY or GEMINI_API_KEY).")

    return _embeddings_instance


def create_vector_store(files):

    documents = []

    for file in files:

        doc = Document(
            page_content=file["content"],
            metadata={
                "source": file["path"]
            }
        )

        documents.append(doc)

    # Chunking
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    split_docs = splitter.split_documents(documents)

    print("TOTAL CHUNKS:", len(split_docs))

    # Fast API-based Embeddings Model (0 RAM / PyTorch overhead)
    embeddings = get_embeddings_model()

    # FAISS Vector DB
    vectorstore = FAISS.from_documents(
        split_docs,
        embeddings
    )

    print("FAISS VECTOR STORE CREATED SUCCESSFULLY VIA API EMBEDDINGS!")

    return vectorstore