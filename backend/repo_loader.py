# fetch_repo_files.py
from github import Github
from dotenv import load_dotenv
from pathlib import Path
import os

from backend.services.file_role_classifier import FileRoleClassifier

load_dotenv()

token = os.getenv("GITHUB_TOKEN")
g = Github(token)

_classifier = FileRoleClassifier()
SUPPORTED_EXTENSIONS = _classifier.SUPPORTED_EXTENSIONS


def fetch_repo_files(repo_name):

    repo = g.get_repo(repo_name)
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