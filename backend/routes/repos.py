import os
import time

from github import Github
from github.GithubException import GithubException
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from backend.repo_loader import fetch_repo_files
from backend.embeddings import create_vector_store
import backend.data.store as store
from backend.utils.auth_deps import require_current_user
from backend.models.user import User


router = APIRouter()


_USER_REPOS_CACHE = {}
_USER_REPOS_CACHE_TTL_SECONDS = 300



class RepoRequest(BaseModel):
    repo_name: str = None
    fullName: str = None


class SearchReposRequest(BaseModel):
    username: str


def _serialize_user(user):
    return {
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
        "html_url": user.html_url,
    }


def _serialize_repo(repo):
    license_name = repo.license.name if repo.license else None

    owner_data = None
    try:
        if repo.owner:
            owner_data = {
                "login": repo.owner.login,
                "avatar_url": repo.owner.avatar_url,
            }
    except Exception:
        pass

    return {
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
        "updated_at": repo.updated_at.isoformat(),
        "topics": list(repo.topics or []),
        "license": {"name": license_name} if license_name else None,
        "fork": repo.fork,
        "size": repo.size,
        "owner": owner_data,
    }


def _build_tree_files(files):
    tree_entries = {}

    for file_data in files:
        path = file_data["path"]
        parts = path.split("/")

        for index in range(1, len(parts)):
            directory = "/".join(parts[:index])
            tree_entries[directory] = {
                "path": directory,
                "type": "tree",
            }

    blob_entries = [
        {
            "path": file_data["path"],
            "type": "blob",
            "size": len(file_data["content"].encode("utf-8")),
        }
        for file_data in files
    ]

    return list(tree_entries.values()) + blob_entries


@router.post("/search-repos")
def search_repos(data: SearchReposRequest, current_user: User = Depends(require_current_user)):
    token = os.getenv("GITHUB_TOKEN")
    g = Github(token, retry=None) if token else Github(retry=None)

    try:
        try:
            user = g.get_user(data.username)
            repos = [_serialize_repo(repo) for repo in user.get_repos()]
        except GithubException as exc:
            if token and exc.status == 401:
                print("WARNING: GITHUB_TOKEN is invalid. Falling back to unauthenticated client.")
                g_anonymous = Github(retry=None)
                user = g_anonymous.get_user(data.username)
                repos = [_serialize_repo(repo) for repo in user.get_repos()]
            else:
                raise exc

        return {
            "user": _serialize_user(user),
            "repos": repos,
        }
    except GithubException as exc:
        message = "Failed to fetch repositories from GitHub."
        if exc.status == 401:
            message = "Invalid GitHub token configured in backend/.env. Please check or remove GITHUB_TOKEN."
        elif exc.status == 403:
            message = "GitHub rate limit exceeded. Try again later or configure a valid GITHUB_TOKEN."
        elif exc.status == 404:
            message = "GitHub user not found."

        return {
            "user": None,
            "repos": [],
            "error": message,
        }


@router.post("/load-repo")
def load_repo(data: RepoRequest, current_user: User = Depends(require_current_user)):
    repo_name = data.repo_name or data.fullName

    if not repo_name:
        return {
            "message": "Repository name is required."
        }

    print("REPO RECEIVED:", repo_name)
    try:
        files = fetch_repo_files(repo_name)
    except GithubException as exc:
        message = "Failed to fetch repository from GitHub."
        if exc.status == 403:
            message = "GitHub rate limit exceeded or the repository is inaccessible."
        elif exc.status == 404:
            message = "Repository not found on GitHub."

        return {
            "message": message,
            "files": [],
            "error": message,
        }

    store.repo_files = files
    store.vectorstore = None

    warning = None
    try:
        store.vectorstore = create_vector_store(files)
    except Exception as exc:
        warning = f"Repository files loaded, but embeddings could not be built: {exc}"

    response = {
        "message": "Repository loaded successfully",
        "files": _build_tree_files(files),
    }

    if warning:
        response["warning"] = warning

    return response


@router.get("/users/{username}/repos")
def get_user_repos(username: str, current_user: User = Depends(require_current_user)):

    cached = _USER_REPOS_CACHE.get(username)
    now = time.time()

    if cached and now - cached["fetched_at"] < _USER_REPOS_CACHE_TTL_SECONDS:
        return {"repositories": cached["repositories"], "cached": True}

    g = Github(os.getenv("GITHUB_TOKEN"), retry=None)

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
def get_repo_files(current_user: User = Depends(require_current_user)):
    if store.repo_files is None:
        return {"files": []}
    return {
        "files": [
            {"path": f["path"], "content": f["content"]}
            for f in store.repo_files
        ]
    }


