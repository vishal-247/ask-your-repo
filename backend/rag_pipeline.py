from backend.utils.llm_utils import get_chat_llm


def ask_question(vectorstore, query):

    # Retrieve relevant chunks
    docs = vectorstore.similarity_search(query, k=6)

    context = "\n\n".join([
        f"FILE: {doc.metadata['source']}\n{doc.page_content}"
        for doc in docs
    ])

    prompt = f"""
You are a helpful assistant who has access to the following repository code context.
Instructions: 
- give answer based on the user question if it's a general question you should answer based on your knowledge without the context
- if the question is specific to the code you should answer based on the context provided
- strictly provide answer only no explanations for general questions and for code specific questions provide detailed answer based on the context and also list the source files used to answer the question

REPOSITORY CODE:

{context}

USER QUESTION:
{query}

DETAILED ANSWER:
"""

    # Remove duplicate source files
    unique_sources = list(set([
        doc.metadata["source"]
        for doc in docs
    ]))

    try:
        llm = get_chat_llm(temperature=0)
        response = llm.invoke(prompt)
        answer = response.content
    except Exception as exc:
        print(f"LLM Invocation error: {exc}")
        answer = (
            f"Here are the relevant code snippets found in your repository:\n\n{context}\n\n"
            f"(Note: AI LLM synthesis model is unavailable or rate-limited. Relevant files are listed below.)"
        )

    return {
        "answer": answer,
        "sources": unique_sources
    }