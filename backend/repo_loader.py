from github import Github
from github.GithubException import GithubException
from dotenv import load_dotenv
from pathlib import Path
import os

from backend.services.file_role_classifier import FileRoleClassifier

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env", override=True)

_classifier = FileRoleClassifier()
SUPPORTED_EXTENSIONS = _classifier.SUPPORTED_EXTENSIONS


def fetch_repo_files(repo_name):
    token = os.getenv("GITHUB_TOKEN")
    g_client = Github(token, retry=None) if token else Github(retry=None)
    
    try:
        repo = g_client.get_repo(repo_name)
    except GithubException as exc:
        if token and exc.status == 401:
            print("WARNING: GITHUB_TOKEN is invalid. Falling back to unauthenticated client.")
            g_client = Github(retry=None)
            repo = g_client.get_repo(repo_name)
        else:
            raise exc

    all_files = []

    def read_contents(path=""):
        contents = repo.get_contents(path)

        for content in contents:

            if content.type == "dir":
                read_contents(content.path)

            else:
                ext = Path(content.name).suffix.lower()

                if ext in SUPPORTED_EXTENSIONS:

                    try:
                        file_data = {
                            "path": content.path,
                            "content": content.decoded_content.decode("utf-8")
                        }
                        all_files.append(file_data)
                        print("Loaded:", content.path)

                    except Exception as e:
                        print("Error reading", content.path, ":", e)

    read_contents()
    return all_files