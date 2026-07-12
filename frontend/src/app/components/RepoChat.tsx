import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Send, Bot, User, GitFork, Star,
  FileText, FolderTree, Zap, RefreshCw, Copy, Check,
  ExternalLink, Code2, Loader2, ChevronRight,
} from "lucide-react";
import { backendApi } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Repo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  default_branch?: string;
  topics?: string[];
  owner: { login: string; avatar_url: string };
}

interface GithubFile {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const langColors: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", "C#": "#178600", Ruby: "#701516", Swift: "#F05138",
  Kotlin: "#A97BFF", PHP: "#4F5D95", HTML: "#e34c26", CSS: "#563d7c",
};

async function fetchRepoTree(fullName: string): Promise<GithubFile[]> {
  const data = await backendApi.loadRepository(fullName);
  return data.files;
}

function buildTreeContext(files: GithubFile[]): string {
  const dirs = new Set<string>();
  files.forEach(f => {
    const parts = f.path.split("/");
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join("/"));
  });
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  return sorted.slice(0, 200).map(f => `${f.type === "tree" ? "📁" : "📄"} ${f.path}`).join("\n");
}

// ─── AI answer generator (rule-based, no API key needed) ─────────────────────

function generateAnswer(question: string, repo: Repo, files: GithubFile[], fileContent: Record<string, string>): string {
  const q = question.toLowerCase();
  const allPaths = files.map(f => f.path);
  const blobs = files.filter(f => f.type === "blob");
  const dirs = [...new Set(files.filter(f => f.type === "tree").map(f => f.path.split("/")[0]))];

  // Tree / structure
  if (q.includes("tree") || q.includes("structure") || q.includes("folder") || q.includes("director") || q.includes("files")) {
    const top = files.filter(f => !f.path.includes("/")).slice(0, 30);
    const display = top.map(f => `${f.type === "tree" ? "📁" : "📄"} ${f.path}`).join("\n");
    return `Here's the top-level structure of **${repo.name}**:\n\n\`\`\`\n${display}\n\`\`\`\n\nTotal: **${blobs.length} files** across **${dirs.length} directories**. Ask me to drill into any folder.`;
  }

  // README
  if (q.includes("readme") || q.includes("about") || q.includes("what is") || q.includes("what does")) {
    const readme = fileContent["README.md"] ?? fileContent["readme.md"] ?? fileContent["README.MD"] ?? "";
    if (readme) {
      const short = readme.slice(0, 800).trim();
      return `Here's what the README says about **${repo.name}**:\n\n${short}${readme.length > 800 ? "\n\n_...truncated. Ask me about specific sections._" : ""}`;
    }
    if (repo.description) {
      return `**${repo.name}** — ${repo.description}\n\nNo README found, but this is a **${repo.language ?? "multi-language"}** project with ${blobs.length} files and ${repo.stargazers_count.toLocaleString()} stars.`;
    }
    return `No README found in **${repo.name}**. It's a ${repo.language ?? "general"} repository with ${blobs.length} files. Ask me to explore specific folders or files.`;
  }

  // Dependencies / package
  if (q.includes("depend") || q.includes("package") || q.includes("librar") || q.includes("npm") || q.includes("pip") || q.includes("cargo")) {
    const pkgFile = fileContent["package.json"] ?? fileContent["requirements.txt"] ?? fileContent["Cargo.toml"] ?? fileContent["go.mod"] ?? fileContent["pyproject.toml"] ?? "";
    if (pkgFile) {
      const short = pkgFile.slice(0, 600).trim();
      const fname = fileContent["package.json"] ? "package.json" : fileContent["requirements.txt"] ? "requirements.txt" : fileContent["Cargo.toml"] ? "Cargo.toml" : "go.mod";
      return `Here's the **${fname}** for **${repo.name}**:\n\n\`\`\`\n${short}\n\`\`\``;
    }
    const depFiles = allPaths.filter(p => ["package.json","requirements.txt","Cargo.toml","go.mod","Gemfile","pom.xml","pyproject.toml"].includes(p.split("/").pop() ?? ""));
    if (depFiles.length) return `Found these dependency files:\n${depFiles.map(p => `- \`${p}\``).join("\n")}\n\nAsk me to read any of them.`;
    return `No standard dependency files found in **${repo.name}**. The repo uses **${repo.language ?? "unknown"}** as primary language.`;
  }

  // Language / tech stack
  if (q.includes("language") || q.includes("tech") || q.includes("stack") || q.includes("built with")) {
    const exts: Record<string, number> = {};
    blobs.forEach(f => {
      const ext = f.path.split(".").pop() ?? "";
      if (ext) exts[ext] = (exts[ext] ?? 0) + 1;
    });
    const top5 = Object.entries(exts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const extList = top5.map(([e, c]) => `\`.${e}\` — ${c} files`).join("\n");
    return `**Tech stack for ${repo.name}:**\n\nPrimary language: **${repo.language ?? "mixed"}**\n\nFile breakdown:\n${extList}\n\nTopics: ${(repo.topics ?? []).join(", ") || "none listed"}`;
  }

  // Specific file lookup
  const fileMatch = allPaths.find(p => q.includes(p.toLowerCase()) || q.includes(p.split("/").pop()?.toLowerCase() ?? ""));
  if (fileMatch && fileContent[fileMatch]) {
    const content = fileContent[fileMatch].slice(0, 800);
    return `Here's **${fileMatch}**:\n\n\`\`\`\n${content}\n\`\`\`\n${fileContent[fileMatch].length > 800 ? "\n_Showing first 800 chars. Ask for a specific section._" : ""}`;
  }
  if (fileMatch) {
    return `Found **${fileMatch}** in the tree. It's a ${files.find(f => f.path === fileMatch)?.size ?? "?"} byte file. Ask me to read its contents.`;
  }

  // Entry points
  if (q.includes("entry") || q.includes("main") || q.includes("start") || q.includes("index")) {
    const entries = allPaths.filter(p => ["main","index","app","server","mod"].some(e => p.split("/").pop()?.toLowerCase().startsWith(e)));
    if (entries.length) return `Likely entry points in **${repo.name}**:\n${entries.slice(0, 10).map(p => `- \`${p}\``).join("\n")}`;
    return `No obvious entry point found. The repo has ${blobs.length} files — the primary language is **${repo.language ?? "unknown"}**.`;
  }

  // Tests
  if (q.includes("test") || q.includes("spec") || q.includes("coverage")) {
    const tests = allPaths.filter(p => p.includes("test") || p.includes("spec") || p.includes("__tests__"));
    if (tests.length) return `Found **${tests.length} test files/dirs** in **${repo.name}**:\n${tests.slice(0, 10).map(p => `- \`${p}\``).join("\n")}${tests.length > 10 ? `\n_...and ${tests.length - 10} more_` : ""}`;
    return `No test directories found in **${repo.name}**. This might be an early-stage or library-only project.`;
  }

  // Contributors / author
  if (q.includes("author") || q.includes("contribut") || q.includes("owner") || q.includes("who")) {
    return `**${repo.name}** is owned by **${repo.owner.login}** on GitHub.\n\nThe repo has earned **${repo.stargazers_count.toLocaleString()} stars** and been forked **${repo.forks_count.toLocaleString()} times**, suggesting a healthy contributor base.\n\nView all contributors → ${repo.html_url}/graphs/contributors`;
  }

  // Stats
  if (q.includes("star") || q.includes("fork") || q.includes("popular") || q.includes("stats")) {
    return `**Stats for ${repo.name}:**\n\n⭐ **${repo.stargazers_count.toLocaleString()}** stars\n🍴 **${repo.forks_count.toLocaleString()}** forks\n📄 **${blobs.length}** files\n🗂 **${dirs.length}** directories\n💻 Primary language: **${repo.language ?? "mixed"}**`;
  }

  // Config / CI
  if (q.includes("config") || q.includes("ci") || q.includes("deploy") || q.includes("workflow") || q.includes("docker")) {
    const cfgs = allPaths.filter(p => p.includes(".github") || p.includes("docker") || p.includes(".yml") || p.includes(".yaml") || p.includes("config") || p === "Makefile");
    if (cfgs.length) return `Config & CI files in **${repo.name}**:\n${cfgs.slice(0, 12).map(p => `- \`${p}\``).join("\n")}`;
    return `No CI/config files detected. This looks like a bare-code repo without automated pipelines yet.`;
  }

  // Fallback
  const randomSuggestions = [
    "Show the directory tree",
    "What language is this built in?",
    "What does the README say?",
    "Find the entry point",
    "List test files",
    "What are the dependencies?",
  ];
  return `I'm exploring **${repo.full_name}** — ${repo.description ?? "no description"}.\n\nHere's what I know:\n- **${blobs.length} files** across **${dirs.length} top-level directories**\n- Primary language: **${repo.language ?? "mixed"}**\n- ⭐ ${repo.stargazers_count.toLocaleString()} stars\n\nTry asking:\n${randomSuggestions.map(s => `- _${s}_`).join("\n")}`;
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED = [
  { label: "Directory tree", icon: <FolderTree size={13} />, q: "Show me the directory structure" },
  { label: "Tech stack",     icon: <Code2 size={13} />,      q: "What tech stack is this built with?" },
  { label: "README",         icon: <FileText size={13} />,   q: "What does the README say?" },
  { label: "Entry point",    icon: <Zap size={13} />,        q: "Where is the entry point?" },
  { label: "Dependencies",   icon: <RefreshCw size={13} />,  q: "What are the dependencies?" },
  { label: "Test files",     icon: <ChevronRight size={13} />, q: "List test files and folders" },
];

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3).replace(/^\w+\n/, "");
        return (
          <pre key={i} style={{ background: "rgba(28,26,46,0.07)", borderRadius: 10, padding: "12px 14px", overflowX: "auto", margin: "8px 0", fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "#1c1a2e", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            <code>{code}</code>
          </pre>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12.5px", background: "rgba(91,79,207,0.1)", color: "#5b4fcf", borderRadius: 5, padding: "1px 5px" }}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ fontWeight: 600, color: isUser ? "white" : "#1c1a2e" }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return <em key={i} style={{ fontStyle: "italic", opacity: 0.75 }}>{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end"
        style={{
          background: isUser ? "linear-gradient(135deg, #7c6ef5, #5b4fcf)" : "#f0edff",
          boxShadow: isUser ? "0 2px 10px rgba(91,79,207,0.28)" : "none",
          border: isUser ? "none" : "1px solid rgba(91,79,207,0.12)",
        }}
      >
        {isUser
          ? <User size={14} style={{ color: "white" }} />
          : <Bot size={14} style={{ color: "#5b4fcf" }} />
        }
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-1 max-w-[78%]">
        <div
          className="rounded-2xl px-4 py-3 relative group"
          style={{
            background: isUser ? "linear-gradient(135deg, #7c6ef5, #5b4fcf)" : "rgba(255,255,255,0.82)",
            border: isUser ? "none" : "1px solid rgba(91,79,207,0.1)",
            boxShadow: isUser ? "0 4px 18px rgba(91,79,207,0.22)" : "0 2px 10px rgba(91,79,207,0.05)",
            backdropFilter: isUser ? "none" : "blur(12px)",
            borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
          }}
        >
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", lineHeight: 1.7, color: isUser ? "white" : "#1c1a2e", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {renderContent(msg.content)}
          </p>
          {/* Copy btn */}
          {!isUser && (
            <button
              onClick={copy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              style={{ background: "rgba(91,79,207,0.08)", border: "none", borderRadius: 6, padding: "3px 5px", cursor: "pointer", transition: "opacity 0.2s", color: "#7e7a9a" }}
            >
              {copied ? <Check size={11} style={{ color: "#34d399" }} /> : <Copy size={11} />}
            </button>
          )}
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "#c4bfe8", alignSelf: isUser ? "flex-end" : "flex-start", paddingInline: 4 }}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Thinking indicator ───────────────────────────────────────────────────────

function Thinking() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f0edff", border: "1px solid rgba(91,79,207,0.12)" }}>
        <Bot size={14} style={{ color: "#5b4fcf" }} />
      </div>
      <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.82)", border: "1px solid rgba(91,79,207,0.1)", backdropFilter: "blur(12px)", borderRadius: "20px 20px 20px 6px" }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.65, delay: i * 0.14, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#a09dc0" }} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RepoChat({ repo, onBack }: { repo: Repo; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [files, setFiles] = useState<GithubFile[]>([]);
  const [fileContent, setFileContent] = useState<Record<string, string>>({});
  const [loadingRepo, setLoadingRepo] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load repo tree on mount
  useEffect(() => {
    (async () => {
      setLoadingRepo(true);
      try {
        const tree = await fetchRepoTree(repo.full_name);
        setFiles(tree);
        setFileContent({});
        const welcome: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Hey! I've loaded **${repo.full_name}** and I'm ready to explore it with you.\n\n${repo.description ? `_${repo.description}_\n\n` : ""}I can see **${tree.filter(f => f.type === "blob").length} files** across **${[...new Set(tree.filter(f => f.type === "tree").map(f => f.path.split("/")[0]))].length} directories**. What would you like to know?`,
          timestamp: new Date(),
        };
        setMessages([welcome]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to reach the backend.";
        setMessages([{ id: crypto.randomUUID(), role: "assistant", content: `Sorry, ${message}`, timestamp: new Date() }]);
      } finally {
        setLoadingRepo(false);
      }
    })();
  }, [repo.full_name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: q, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    try {
      const { answer } = await backendApi.sendChatMessage(repo.full_name, q);
      const botMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: answer, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reach the backend.";
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Sorry, ${message}`, timestamp: new Date() }]);
    } finally {
      setThinking(false);
    }
  }, [thinking, repo]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const langColor = langColors[repo.language ?? ""] ?? "#a09dc0";

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: "#faf9ff", fontFamily: "'Inter', sans-serif" }}>
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.09) 0%, transparent 70%)", top: -80, right: -60, filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,182,206,0.09) 0%, transparent 70%)", bottom: 80, left: -40, filter: "blur(40px)" }} />
      </div>

      {/* Header */}
      <div className="relative flex-shrink-0" style={{ zIndex: 10 }}>
        <div
          className="flex items-center gap-4 px-6 py-4"
          style={{ background: "rgba(250,249,255,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(91,79,207,0.09)" }}
        >
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#7e7a9a", display: "flex", alignItems: "center", gap: 6, padding: 0, fontFamily: "'Inter', sans-serif", fontSize: "13.5px", transition: "color 0.2s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#5b4fcf")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#7e7a9a")}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div style={{ width: 1, height: 20, background: "rgba(91,79,207,0.12)" }} />

          {/* Repo identity */}
          <img src={repo.owner.avatar_url} alt={repo.owner.login} style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid white", boxShadow: "0 2px 8px rgba(91,79,207,0.18)" }} />
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Geist', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {repo.full_name}
              </span>
              {repo.language && (
                <span className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 flex-shrink-0" style={{ background: `${langColor}18`, border: `1px solid ${langColor}30` }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: langColor, display: "inline-block" }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: langColor }}>{repo.language}</span>
                </span>
              )}
            </div>
            {repo.description && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#a09dc0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>
                {repo.description}
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="hidden sm:flex items-center gap-1.5" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#a09dc0" }}>
              <Star size={12} style={{ color: "#f59e0b" }} />
              {repo.stargazers_count.toLocaleString()}
            </span>
            <span className="hidden sm:flex items-center gap-1.5" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#a09dc0" }}>
              <GitFork size={12} />
              {repo.forks_count.toLocaleString()}
            </span>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif", fontSize: "12.5px", fontWeight: 500, color: "#5b4fcf", background: "#ede9fe", border: "1px solid rgba(91,79,207,0.18)", borderRadius: 8, padding: "5px 12px", textDecoration: "none", transition: "opacity 0.2s" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              <ExternalLink size={12} /> GitHub
            </a>
          </div>
        </div>

        {/* Loading bar */}
        {loadingRepo && (
          <div style={{ height: 2, background: "rgba(91,79,207,0.08)" }}>
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ height: "100%", width: "40%", background: "linear-gradient(90deg, transparent, #7c6ef5, transparent)" }}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto relative" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto px-5 py-6 flex flex-col gap-5">
          {loadingRepo && messages.length === 0 && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={18} style={{ color: "#a09dc0", animation: "spin 1s linear infinite" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#a09dc0" }}>Indexing repository…</span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map(m => <Bubble key={m.id} msg={m} />)}
            {thinking && <Thinking key="thinking" />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested prompts — shown until first user message */}
      <AnimatePresence>
        {messages.length <= 1 && !loadingRepo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex-shrink-0 relative px-5 pb-2"
            style={{ zIndex: 10 }}
          >
            <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
              {SUGGESTED.map(s => (
                <button
                  key={s.label}
                  onClick={() => send(s.q)}
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2"
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "12.5px", fontWeight: 500,
                    color: "#5b4fcf", background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(91,79,207,0.16)", cursor: "pointer",
                    backdropFilter: "blur(8px)", transition: "background 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#ede9fe"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.8)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="flex-shrink-0 relative px-5 pb-5 pt-3" style={{ zIndex: 10 }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(91,79,207,0.16)", boxShadow: "0 4px 24px rgba(91,79,207,0.08)" }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
              onKeyDown={handleKey}
              placeholder={`Ask anything about ${repo.name}…`}
              disabled={loadingRepo}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: "14.5px", color: "#1c1a2e",
                background: "transparent", border: "none", outline: "none", flex: 1,
                resize: "none", lineHeight: 1.6, maxHeight: 140, overflowY: "auto",
                padding: "2px 0",
              }}
            />
            <motion.button
              onClick={() => send(input)}
              disabled={!input.trim() || thinking || loadingRepo}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              style={{
                width: 38, height: 38, borderRadius: 12, border: "none", cursor: input.trim() && !thinking ? "pointer" : "not-allowed",
                background: input.trim() && !thinking ? "linear-gradient(135deg, #7c6ef5, #5b4fcf)" : "#e8e6f0",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: input.trim() && !thinking ? "0 3px 14px rgba(91,79,207,0.32)" : "none",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              <Send size={15} style={{ color: input.trim() && !thinking ? "white" : "#a09dc0" }} />
            </motion.button>
          </div>
          <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "#c4bfe8", textAlign: "center", marginTop: 8 }}>
            Enter to send · Shift+Enter for newline · Powered by your backend
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
