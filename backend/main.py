from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import backend.routes.repos as repos
import backend.routes.ask as ask
import backend.routes.roadmap as roadmap
import backend.routes.architecture as architecture
import backend.routes.dependencies as dependencies
import backend.routes.graph as graph


app = FastAPI(
    title="AskYourRepo API"
)
app.include_router(graph.router)
app.include_router(dependencies.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repos.router)
app.include_router(ask.router)
app.include_router(roadmap.router)
app.include_router(architecture.router)


@app.get("/")
def home():

    return {
        "message": "AskYourRepo API Running "
    }