from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings

from langchain_community.vectorstores import FAISS

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env", override=True)

api_key = os.getenv("NVIDIA_API_KEY")


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

    # NVIDIA Embeddings
    embeddings = NVIDIAEmbeddings(
        model="nvidia/nv-embedcode-7b-v1",
        api_key=api_key
    )

    # FAISS Vector DB
    vectorstore = FAISS.from_documents(
        split_docs,
        embeddings
    )

    return vectorstore