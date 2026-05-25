from langchain_nvidia_ai_endpoints import ChatNVIDIA
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("NVIDIA_API_KEY")


def ask_question(vectorstore, query):

    llm = ChatNVIDIA(
        model="mistralai/mixtral-8x7b-instruct-v0.1",
        api_key=api_key,
        temperature=0
    )

    # Retrieve relevant chunks
    docs = vectorstore.similarity_search(query, k=6)

    context = "\n\n".join([
        f"FILE: {doc.metadata['source']}\n{doc.page_content}"
        for doc in docs
    ])

    prompt = f"""
You are a helpful assistant who has access to the following repository code context.
Instructions: 
-give answer based on the user question if its a genreal question you should answer based on your knowledge without the context
-if the question is specific to the code you should answer based on the context provided
-strictly provide answer only no explanations for general questions and for code specific questions provide detailed answer based on the context and also list the source files used to answer the question


REPOSITORY CODE:

{context}

USER QUESTION:
{query}

DETAILED ANSWER:
"""

    response = llm.invoke(prompt)

    # Remove duplicate source files
    unique_sources = list(set([
        doc.metadata["source"]
        for doc in docs
    ]))

    return {
        "answer": response.content,
        "sources": unique_sources
    }