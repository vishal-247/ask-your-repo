import os
from github import Github
from fastapi import APIRouter
from pydantic import BaseModel

from backend.repo_loader import fetch_repo_files
from backend.embeddings import create_vector_store
import backend.data.store as store


router = APIRouter()



class RepoRequest(BaseModel):
    repo_name: str


@router.post("/load-repo")
def load_repo(data: RepoRequest):

    global vectorstore
    global repo_files

    files = fetch_repo_files(
        data.repo_name
    )

    store.repo_files = files

    store.vectorstore = create_vector_store(files)

    return {
        "message": "Repository loaded successfully "
    }


@router.get("/users/{username}/repos")
def get_user_repos(username: str):

    g = Github( os.getenv("GITHUB_TOKEN") )

    user = g.get_user(username)

    repos = []

    for repo in user.get_repos():

        repos.append({
            "name": repo.name,
            "full_name": repo.full_name,
            "url": repo.html_url
        })

    return {
        "repositories": repos
    }

