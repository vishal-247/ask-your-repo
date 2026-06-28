<div align="center">

# 🚀 Ask Your Repo

### AI-powered GitHub Repository Intelligence Platform

Understand any GitHub repository through natural language conversations, semantic code search, architecture analysis, and AI-generated learning roadmaps.

<p>
<img src="https://img.shields.io/badge/Python-3.11-blue?logo=python">
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi">
<img src="https://img.shields.io/badge/LangChain-RAG-success">
<img src="https://img.shields.io/badge/FAISS-Vector_Search-orange">
<img src="https://img.shields.io/badge/NVIDIA-AI-76B900?logo=nvidia">
<img src="https://img.shields.io/badge/Version-v1.0-success">
<img src="https://img.shields.io/badge/License-MIT-blue">
</p>

> Transform any GitHub repository into an interactive AI knowledge base.

</div>

---

## 📖 Overview

Understanding an unfamiliar codebase is often one of the biggest challenges for developers.

**Ask Your Repo** is an AI-powered developer tool that transforms any public GitHub repository into an interactive knowledge base. It combines Retrieval-Augmented Generation (RAG), semantic code search, repository architecture analysis, and AI-generated onboarding roadmaps to help developers understand projects significantly faster.

Instead of manually exploring hundreds of files, developers can simply ask questions in natural language and receive contextual answers backed by relevant source files.

---

# ✨ Features

### 🤖 AI Codebase Chat

Interact with any repository using natural language.

- Context-aware AI responses
- Retrieval-Augmented Generation (RAG)
- Source file citations
- Semantic code search
- Repository-aware answers

---

### 📦 GitHub Repository Loader

Load repositories directly from GitHub.

- Public repository ingestion
- GitHub username search
- Repository selection
- Automatic indexing pipeline

---

### 📁 Interactive File Explorer

Navigate the repository through a clean explorer interface.

- Folder hierarchy
- File preview
- Syntax-highlighted code viewer
- Quick source inspection

---

### 🏗 Architecture Analyzer

Automatically classifies repository files into logical software layers.

Supported classifications include:

- Backend
- Frontend
- AI
- Database
- Configuration

---

### 🧠 AI Learning Roadmap

Generate an AI-powered onboarding roadmap for any repository.

The roadmap recommends:

- Where to start
- Important project files
- Learning sequence
- Project entry points
- Key implementation modules

---

### 🔍 Semantic Search

Powered by vector embeddings for accurate context retrieval.

- NVIDIA Embeddings
- FAISS Vector Database
- LangChain Retrieval Pipeline

---

# ⚙️ System Architecture

```text
                GitHub Repository
                        │
                        ▼
              Repository Loader
                        │
                        ▼
              Source Code Parser
                        │
                        ▼
              Code Chunk Generator
                        │
                        ▼
            NVIDIA Embedding Model
                        │
                        ▼
                 FAISS Vector Store
                        │
                        ▼
              Semantic Retrieval
                        │
                        ▼
                NVIDIA LLM (RAG)
                        │
                        ▼
        AI Response + Source References
```

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Python
- FastAPI

## AI

- LangChain
- NVIDIA Embeddings
- NVIDIA LLM
- FAISS

## APIs

- GitHub REST API

---

# 📸 Screenshots

## Landing Page
<img width="1897" height="905" alt="landingpg_ayr" src="https://github.com/user-attachments/assets/286745ef-550d-420a-bfde-5f9dd2e5d8b8" />


---

## Repository Loader

<img width="1917" height="913" alt="repoloader_ayr" src="https://github.com/user-attachments/assets/687044c6-7e4e-4f44-bd0d-47ced416a576" />


---

## AI Codebase Chat

<img width="1917" height="911" alt="chatbot_ayr" src="https://github.com/user-attachments/assets/58083bbf-ad3d-4309-b33f-44d66b99be8f" />


---

## File Explorer

<img width="1917" height="911" alt="fileexpl_ayr" src="https://github.com/user-attachments/assets/4ae555b6-5e00-471e-9cc5-0aded1ac9699" />

---

## Architecture Analyzer


<img width="1901" height="913" alt="architecture_ayr" src="https://github.com/user-attachments/assets/69f4d83a-d6cc-4d9b-8fc2-3978b7d1e786" />


---

## AI Learning Roadmap

<img width="1917" height="912" alt="learningroad_ayr" src="https://github.com/user-attachments/assets/100254c2-1b15-4ff3-ace8-f3adeb6e0911" />

---

# 📁 Project Structure

```text
ask-your-repo/

├── backend
│   ├── routes
│   ├── services
│   ├── data
│   ├── rag_pipeline.py
│   ├── roadmap_generator.py
│   ├── architecture_builder.py
│   └── main.py
│
├── frontend
│   ├── assets
│   ├── css
│   ├── js
│   ├── pages
│   └── index.html
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/ask-your-repo.git

cd ask-your-repo
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Backend

```bash
uvicorn backend.main:app --reload
```

## Launch Frontend

Open

```
frontend/index.html
```

or run using Live Server.

---

# 📡 API Endpoints

| Method | Endpoint | Description |
|----------|-------------------------|--------------------------------|
| POST | `/load-repo` | Clone & index GitHub repository |
| GET | `/users/{username}/repos` | Fetch user repositories |
| POST | `/ask` | Ask repository questions |
| GET | `/generate-roadmap` | Generate learning roadmap |
| GET | `/visualize` | Analyze repository architecture |

---

# 📊 Current Status

| Module | Status |
|----------|---------|
| Repository Loader | ✅ |
| GitHub Repository Search | ✅ |
| Repository Ingestion | ✅ |
| AI Codebase Chat | ✅ |
| Semantic Retrieval | ✅ |
| Source References | ✅ |
| File Explorer | ✅ |
| Architecture Analysis | ✅ |
| AI Learning Roadmap | ✅ |
| Authentication | 🚧 Planned |
| Database Integration | 🚧 Planned |
| Conversation History | 🚧 Planned |
| Saved Repositories | 🚧 Planned |

---

# 🔮 Upcoming Features

- User Authentication
- Database Persistence
- Conversation History
- Saved Repositories
- Interactive Dependency Graph
- Repository Analytics
- Repository Comparison
- Pull Request Insights
- Multi-user Workspaces
- Exportable Learning Roadmaps

---

# 💡 Motivation

Developers often spend hours understanding unfamiliar repositories before making their first contribution.

Ask Your Repo accelerates this onboarding process by combining semantic search, retrieval-augmented generation, architecture analysis, and AI-powered learning guidance into a single developer experience.

---

# 🤝 Contributing

Contributions, ideas, and feature requests are always welcome.

Feel free to fork the repository, open issues, or submit pull requests.

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ Star this repository if you found it useful!

Built with ❤️ using FastAPI, LangChain, FAISS and NVIDIA AI.

</div>
