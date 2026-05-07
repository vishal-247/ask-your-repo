from github import Github
from dotenv import load_dotenv
import os

load_dotenv()

token = os.getenv("GITHUB_TOKEN")

g = Github(token)

repo = g.get_repo("facebook/react")

contents = repo.get_contents("")

for content in contents:
    print(content.path)