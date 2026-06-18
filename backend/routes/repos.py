import os
import time

from github import Github
from github.GithubException import GithubException
from fastapi import APIRouter
from pydantic import BaseModel

from backend.repo_loader import fetch_repo_files
from backend.embeddings import create_vector_store
import backend.data.store as store


router = APIRouter()


_USER_REPOS_CACHE = {}
_USER_REPOS_CACHE_TTL_SECONDS = 300



class RepoRequest(BaseModel):
    repo_name: str


@router.post("/load-repo")
def load_repo(data: RepoRequest):

    global vectorstore
    global repo_files
    print("REPO RECEIVED:", data.repo_name)
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

    cached = _USER_REPOS_CACHE.get(username)
    now = time.time()

    if cached and now - cached["fetched_at"] < _USER_REPOS_CACHE_TTL_SECONDS:
        return {"repositories": cached["repositories"], "cached": True}

    g = Github(os.getenv("GITHUB_TOKEN"))

    try:
        user = g.get_user(username)

        repos = []

        for repo in user.get_repos():

            repos.append({
                "name": repo.name,
                "full_name": repo.full_name,
                "url": repo.html_url
            })

        _USER_REPOS_CACHE[username] = {
            "repositories": repos,
            "fetched_at": now,
        }

        return {
            "repositories": repos,
            "cached": False,
        }
    except GithubException as exc:
        if cached:
            return {
                "repositories": cached["repositories"],
                "cached": True,
                "warning": "GitHub rate limit reached; returning cached repositories.",
            }

        message = "Failed to fetch repositories from GitHub."
        if exc.status == 403:
            message = "GitHub rate limit exceeded. Try again later or configure a GitHub token."

        return {
            "repositories": [],
            "error": message,
        }


@router.get("/repo-files")
def get_repo_files():
    if store.repo_files is None:
        return {"files": []}
    return {
        "files": [
            {"path": f["path"], "content": f["content"]}
            for f in store.repo_files
        ]
    }


