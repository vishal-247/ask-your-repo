from backend.services.dependency_extractor import DependencyExtractor

def analyze_dependencies(repo_files):
    extractor = DependencyExtractor()
    results = []
    for file in repo_files:
        results.append(extractor.extract(file["path"], file["content"]))
    return results
