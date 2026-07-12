/** Fill in these three backend URLs. */
export const BACKEND_ENDPOINTS = {
  searchRepositories: "/api/search-repos",
  loadRepository: "/api/load-repo",
  sendChatMessage: "/api/ask",
} as const;


export interface BackendFile {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface LoadRepositoryResponse { files: BackendFile[]; }
interface ChatResponse { answer: string; }

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  if (!endpoint.trim()) throw new Error("A backend endpoint has not been configured in src/app/lib/api.ts.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error((await response.text().catch(() => "")) || `Backend request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export const backendApi = {
  // POST { username } -> { user, repos }
  searchRepositories: <User, Repository>(username: string) =>
    post<{ user: User; repos: Repository[] }>(BACKEND_ENDPOINTS.searchRepositories, { username }),
  // POST { fullName } -> { files }
  loadRepository: (fullName: string) => post<LoadRepositoryResponse>(BACKEND_ENDPOINTS.loadRepository, { fullName }),
  // POST { fullName, message } -> { answer }
  sendChatMessage: (fullName: string, message: string) => post<ChatResponse>(BACKEND_ENDPOINTS.sendChatMessage, { fullName, message }),
};
