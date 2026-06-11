from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.architecture_routes import (
    router as architecture_router
)

import backend.routes.repos as repos
import backend.routes.ask as ask
import backend.routes.roadmap as roadmap
#import backend.routes.dependencies as dependencies





app = FastAPI(
    title="AskYourRepo API"
)


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
#app.include_router(dependencies.router)
app.include_router(architecture_router)


@app.get("/")
def home():

    return {
        "message": "AskYourRepo API Running "
    }