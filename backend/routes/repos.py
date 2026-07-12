import os
import time

from github import Github
from github.GithubException import GithubException
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from backend.repo_loader import fetch_repo_files
from backend.embeddings import create_vector_store
import backend.data.store as store

router = APIRouter()

_USER_REPOS_CACHE = {}
_USER_REPOS_CACHE_TTL_SECONDS = 300


class RepoRequest(BaseModel):
    repo_name: str = None
    fullName: str = None


class SearchRequest(BaseModel):
    username: str


def get_files_with_dirs(files):
    result = []
    seen_dirs = set()
    for f in files:
        result.append({
            "path": f["path"],
            "type": "blob",
            "size": len(f["content"])
        })
        # Add parent directories
        parts = f["path"].split("/")
        for i in range(1, len(parts)):
            dir_path = "/".join(parts[:i])
            if dir_path not in seen_dirs:
                seen_dirs.add(dir_path)
                result.append({
                    "path": dir_path,
                    "type": "tree"
                })
    return result


def index_repository(files):
    store.is_indexing = True
    try:
        store.vectorstore = create_vector_store(files)
    finally:
        store.is_indexing = False


@router.post("/load-repo")
def load_repo(data: RepoRequest, background_tasks: BackgroundTasks):
    repo_name = data.repo_name or data.fullName
    if not repo_name:
        return {"error": "repo_name or fullName is required"}

    print("REPO RECEIVED:", repo_name)
    files = fetch_repo_files(repo_name)

    store.repo_files = files
    background_tasks.add_task(index_repository, files)

    return {
        "message": "Repository loaded successfully",
        "files": get_files_with_dirs(files)
    }



@router.post("/search-repos")
def search_repos(data: SearchRequest):
    username = data.username.strip()
    cached = _USER_REPOS_CACHE.get(username)
    now = time.time()

    if cached and now - cached["fetched_at"] < _USER_REPOS_CACHE_TTL_SECONDS:
        repos = cached.get("repos", [])
        if repos and len(repos) > 0 and "owner" in repos[0]:
            return {
                "user": cached["user"],
                "repos": repos,
                "cached": True
            }

    g = Github(os.getenv("GITHUB_TOKEN"))

    try:
        user = g.get_user(username)
        
        # Build user profile data
        user_data = {
            "login": user.login,
            "name": user.name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "public_repos": user.public_repos,
            "followers": user.followers,
            "following": user.following,
            "location": user.location,
            "blog": user.blog,
            "twitter_username": user.twitter_username,
            "html_url": user.html_url
        }

        repos = []
        for repo in user.get_repos():
            repos.append({
                "id": repo.id,
                "name": repo.name,
                "full_name": repo.full_name,
                "description": repo.description,
                "html_url": repo.html_url,
                "stargazers_count": repo.stargazers_count,
                "forks_count": repo.forks_count,
                "watchers_count": repo.watchers_count,
                "language": repo.language,
                "private": repo.private,
                "updated_at": repo.updated_at.isoformat() if repo.updated_at else None,
                "topics": repo.get_topics(),
                "license": {"name": repo.license.name} if repo.license else None,
                "fork": repo.fork,
                "size": repo.size,
                "owner": {
                    "login": user.login,
                    "avatar_url": user.avatar_url
                }
            })


        _USER_REPOS_CACHE[username] = {
            "user": user_data,
            "repos": repos,
            "fetched_at": now
        }

        return {
            "user": user_data,
            "repos": repos,
            "cached": False
        }
    except GithubException as exc:
        if cached:
            return {
                "user": cached["user"],
                "repos": cached["repos"],
                "cached": True,
                "warning": "GitHub rate limit reached; returning cached profile and repositories.",
            }

        message = "Failed to fetch profile and repositories from GitHub."
        if exc.status == 403:
            message = "GitHub rate limit exceeded. Try again later or configure a GITHUB_TOKEN."
        elif exc.status == 404:
            message = f"GitHub user '{username}' not found."

        return {
            "user": None,
            "repos": [],
            "error": message,
        }


@router.get("/users/{username}/repos")
def get_user_repos(username: str):
    # Keep this endpoint for backward compatibility
    cached = _USER_REPOS_CACHE.get(username)
    now = time.time()

    if cached and now - cached["fetched_at"] < _USER_REPOS_CACHE_TTL_SECONDS:
        return {"repositories": cached.get("repos", []), "cached": True}

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
            "repos": repos,
            "fetched_at": now,
        }

        return {
            "repositories": repos,
            "cached": False,
        }
    except GithubException as exc:
        if cached:
            return {
                "repositories": cached.get("repos", []),
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
