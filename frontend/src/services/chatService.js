const API_BASE_URL = 'https://ask-your-repo.onrender.com';

export const chatService = {
  async loadRepo(repoName) {
    const response = await fetch(`${API_BASE_URL}/load-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_name: repoName }),
    });
    if (!response.ok) {
      throw new Error(`Failed to load repository: ${response.statusText}`);
    }
    return response.json();
  },

  async askQuestion(question) {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      throw new Error(`Failed to ask question: ${response.statusText}`);
    }
    return response.json();
  },

  async getRoadmap() {
    const response = await fetch(`${API_BASE_URL}/generate-roadmap`);
    if (!response.ok) {
      throw new Error(`Failed to generate roadmap: ${response.statusText}`);
    }
    return response.json();
  },

  async getArchitecture() {
    const response = await fetch(`${API_BASE_URL}/visualize`);
    if (!response.ok) {
      throw new Error(`Failed to load architecture: ${response.statusText}`);
    }
    return response.json();
  },

  async getDependencies() {
    const response = await fetch(`${API_BASE_URL}/dependencies`);
    if (!response.ok) {
      throw new Error(`Failed to load dependencies: ${response.statusText}`);
    }
    return response.json();
  },

  async getUserRepos(username) {
    const response = await fetch(`${API_BASE_URL}/users/${username}/repos`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user repos: ${response.statusText}`);
    }
    return response.json();
  },

  async getRepoFiles() {
    const response = await fetch(`${API_BASE_URL}/repo-files`);
    if (!response.ok) {
      throw new Error(`Failed to fetch repo files: ${response.statusText}`);
    }
    return response.json();
  }
};
