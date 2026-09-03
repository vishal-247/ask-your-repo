export const BACKEND_ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  me: "/api/auth/me",
  searchRepositories: "/api/search-repos",
  loadRepository: "/api/load-repo",
  sendChatMessage: "/api/ask",
  visualizeArchitecture: "/api/visualize",
} as const;

export interface AuthUser {
  id: number;
  username: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface BackendFile {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface LoadRepositoryResponse {
  files: BackendFile[];
  error?: string;
  message?: string;
}
interface ChatResponse { answer: string; }

export interface ArchitectureNode {
  id: string;
  label: string;
  type: string;
  count: number;
  avg_confidence: number;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  weight: number;
}

export interface ArchitectureFile {
  path: string;
  primary_layer: string;
  secondary_layers: string[];
  confidence: number;
  scores: Record<string, number>;
  reasons: string[];
}

export interface ArchitectureLayerData {
  count: number;
  avg_confidence: number;
  files: ArchitectureFile[];
}

export interface FileDependency {
  file: string;
  path: string;
  dependencies: string[];
}

export interface ArchitectureResponse {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  layers: Record<string, ArchitectureLayerData>;
  unknown_files: any[];
  file_dependencies: FileDependency[];
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("ask_your_repo_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  if (!endpoint.trim()) throw new Error("A backend endpoint has not been configured in src/app/lib/api.ts.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 401 && endpoint !== BACKEND_ENDPOINTS.login) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ask_your_repo_unauthorized"));
      }
      throw new Error("Authentication required. Please sign in to access this service.");
    }
    let errMsg = `Backend request failed (${response.status}).`;
    try {
      const data = await response.json();
      if (data && typeof data === "object") {
        if ("detail" in data) errMsg = String(data.detail);
        else if ("error" in data) errMsg = String(data.error);
        else if ("message" in data) errMsg = String(data.message);
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) errMsg = text;
    }
    throw new Error(errMsg);
  }
  return response.json() as Promise<T>;
}

async function get<T>(endpoint: string): Promise<T> {
  if (!endpoint.trim()) throw new Error("A backend endpoint has not been configured in src/app/lib/api.ts.");
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    if (response.status === 401 && endpoint !== BACKEND_ENDPOINTS.me) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ask_your_repo_unauthorized"));
      }
      throw new Error("Authentication required. Please sign in to access this service.");
    }
    let errMsg = `Backend request failed (${response.status}).`;
    try {
      const data = await response.json();
      if (data && typeof data === "object") {
        if ("detail" in data) errMsg = String(data.detail);
        else if ("error" in data) errMsg = String(data.error);
        else if ("message" in data) errMsg = String(data.message);
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) errMsg = text;
    }
    throw new Error(errMsg);
  }
  return response.json() as Promise<T>;
}

export const backendApi = {
  login: (username: string, password: string) =>
    post<AuthTokenResponse>(BACKEND_ENDPOINTS.login, { username, password }),
  register: (username: string, password: string) =>
    post<AuthTokenResponse>(BACKEND_ENDPOINTS.register, { username, password }),
  getMe: () =>
    get<AuthUser>(BACKEND_ENDPOINTS.me),
  // POST { username } -> { user, repos }
  searchRepositories: <User, Repository>(username: string) =>
    post<{ user: User | null; repos: Repository[]; error?: string }>(BACKEND_ENDPOINTS.searchRepositories, { username }),
  // POST { fullName } -> { files }
  loadRepository: (fullName: string) => post<LoadRepositoryResponse>(BACKEND_ENDPOINTS.loadRepository, { fullName }),
  // POST { fullName, message } -> { answer }
  sendChatMessage: (fullName: string, message: string) => post<ChatResponse>(BACKEND_ENDPOINTS.sendChatMessage, { fullName, message }),
  // GET -> { nodes, edges, layers, unknown_files }
  visualizeArchitecture: () => get<ArchitectureResponse>(BACKEND_ENDPOINTS.visualizeArchitecture),
};
