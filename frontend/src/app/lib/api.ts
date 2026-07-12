export const BACKEND_ENDPOINTS = {
  searchRepositories: "/api/search-repos",
  loadRepository: "/api/load-repo",
  sendChatMessage: "/api/ask",
  visualizeArchitecture: "/api/visualize",
} as const;


export interface BackendFile {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface LoadRepositoryResponse { files: BackendFile[]; }
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

async function get<T>(endpoint: string): Promise<T> {
  if (!endpoint.trim()) throw new Error("A backend endpoint has not been configured in src/app/lib/api.ts.");
  const response = await fetch(endpoint, {
    method: "GET",
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
  // GET -> { nodes, edges, layers, unknown_files }
  visualizeArchitecture: () => get<ArchitectureResponse>(BACKEND_ENDPOINTS.visualizeArchitecture),
};

