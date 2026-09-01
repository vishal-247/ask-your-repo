from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Global singleton instance for fast local embeddings
_embeddings_instance = None


def get_embeddings_model():
    """Returns permanent local HuggingFace embeddings (sentence-transformers/all-MiniLM-L6-v2)."""
    global _embeddings_instance
    if _embeddings_instance is None:
        print("Loading local HuggingFace Embeddings model (sentence-transformers/all-MiniLM-L6-v2)...")
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            encode_kwargs={"normalize_embeddings": True}
        )
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

    # Permanent Local Embeddings Model (No API calls required)
    embeddings = get_embeddings_model()

    # FAISS Vector DB
    vectorstore = FAISS.from_documents(
        split_docs,
        embeddings
    )

    print("FAISS VECTOR STORE CREATED SUCCESSFULLY VIA LOCAL HUGGINGFACE MODEL!")

    return vectorstore