import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, GitFork, Code2, Lock, Unlock, Search,
  Calendar, ExternalLink, AlertCircle, Loader2, ArrowLeft,
  BookOpen, MapPin, Link2, Twitter,
} from "lucide-react";
import { RepoChat } from "./RepoChat";
import { backendApi } from "../lib/api";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  html_url: string;
}

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  private: boolean;
  updated_at: string;
  topics: string[];
  license: { name: string } | null;
  fork: boolean;
  size: number;
}

// ─── Language colour map ──────────────────────────────────────────────────────

const langColors: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", "C#": "#178600", Ruby: "#701516", Swift: "#F05138",
  Kotlin: "#A97BFF", PHP: "#4F5D95", HTML: "#e34c26", CSS: "#563d7c",
  Vue: "#41b883", Svelte: "#ff3e00", Dart: "#00B4AB", Shell: "#89e051",
  Nix: "#7e7eff", Elixir: "#6e4a7e", Haskell: "#5e5086",
};

function LangDot({ lang }: { lang: string }) {
  const color = langColors[lang] ?? "#a09dc0";
  return (
    <span className="flex items-center gap-1.5">
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11.5px", color: "#7e7a9a" }}>{lang}</span>
    </span>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

// ─── Repo Card ────────────────────────────────────────────────────────────────

const cardAccents = [
  { bg: "#f3f0ff", border: "rgba(124,110,245,0.18)", tag: "#ede9fe", tagText: "#5b4fcf" },
  { bg: "#fff0f6", border: "rgba(232,121,160,0.18)", tag: "#fce7f3", tagText: "#be185d" },
  { bg: "#f0fdf4", border: "rgba(52,211,153,0.2)",  tag: "#d1fae5", tagText: "#065f46" },
  { bg: "#fffbeb", border: "rgba(251,191,36,0.22)",  tag: "#fef3c7", tagText: "#92400e" },
  { bg: "#eff6ff", border: "rgba(96,165,250,0.2)",   tag: "#dbeafe", tagText: "#1d4ed8" },
];

function RepoCard({ repo, index, onExplore }: { repo: GithubRepo; index: number; onExplore: (repo: GithubRepo) => void }) {
  const accent = cardAccents[index % cardAccents.length];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -3, boxShadow: "0 12px 36px rgba(91,79,207,0.12)" }}
      className="flex flex-col rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: accent.bg,
        border: `1px solid ${accent.border}`,
        boxShadow: "0 2px 10px rgba(91,79,207,0.05)",
        transition: "box-shadow 0.25s, transform 0.25s",
      }}
    >
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {repo.private
              ? <Lock size={13} style={{ color: "#a09dc0", flexShrink: 0 }} />
              : <Unlock size={13} style={{ color: "#a09dc0", flexShrink: 0 }} />
            }
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "'Geist', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.02em", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              onClick={e => e.stopPropagation()}
            >
              {repo.name}
            </a>
            {repo.fork && (
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "9.5px", color: "#a09dc0", background: "rgba(160,157,192,0.15)", borderRadius: 6, padding: "1px 6px", flexShrink: 0 }}>fork</span>
            )}
          </div>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ color: "#a09dc0", flexShrink: 0, transition: "color 0.2s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#5b4fcf")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#a09dc0")}
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Description */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: "#7e7a9a", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.8em" }}>
          {repo.description ?? <span style={{ opacity: 0.45, fontStyle: "italic" }}>No description</span>}
        </p>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 4).map(t => (
              <span key={t} style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", background: accent.tag, color: accent.tagText, borderRadius: 6, padding: "2px 7px" }}>
                {t}
              </span>
            ))}
            {repo.topics.length > 4 && (
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "#a09dc0", padding: "2px 4px" }}>+{repo.topics.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
        style={{ borderTop: `1px solid ${accent.border}`, background: "rgba(255,255,255,0.5)" }}
      >
        <div className="flex items-center gap-4">
          {repo.language && <LangDot lang={repo.language} />}
          <span className="flex items-center gap-1" style={{ color: "#a09dc0" }}>
            <Star size={12} />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11.5px", color: "#7e7a9a" }}>{repo.stargazers_count.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1" style={{ color: "#a09dc0" }}>
            <GitFork size={12} />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11.5px", color: "#7e7a9a" }}>{repo.forks_count.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={11} style={{ color: "#c4bfe8" }} />
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10.5px", color: "#c4bfe8" }}>{timeAgo(repo.updated_at)}</span>
        </div>
      </div>

      {/* Explore button */}
      <button
        onClick={() => onExplore(repo)}
        style={{
          fontFamily: "'Geist', sans-serif", fontSize: "13px", fontWeight: 500,
          color: accent.tagText, background: accent.tag,
          border: "none", padding: "10px 0", cursor: "pointer",
          letterSpacing: "-0.01em", width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
      >
        <BookOpen size={13} /> Ask this repo
      </button>
    </motion.div>
  );
}

// ─── User Profile Card ────────────────────────────────────────────────────────

function UserProfile({ user }: { user: GithubUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center gap-4 rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(91,79,207,0.1)", backdropFilter: "blur(12px)" }}
    >
      <div className="relative">
        <img
          src={user.avatar_url}
          alt={user.login}
          style={{ width: 72, height: 72, borderRadius: "50%", border: "3px solid white", boxShadow: "0 4px 16px rgba(91,79,207,0.2)" }}
        />
        <div style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: "#34d399", border: "2px solid white" }} />
      </div>
      <div className="text-center">
        <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.02em", margin: 0 }}>
          {user.name ?? user.login}
        </p>
        <a href={user.html_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "#7e7a9a", textDecoration: "none" }}>
          @{user.login}
        </a>
      </div>
      {user.bio && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#7e7a9a", lineHeight: 1.55, textAlign: "center", margin: 0 }}>
          {user.bio}
        </p>
      )}
      <div className="flex gap-5 w-full justify-center">
        {[
          { val: user.public_repos, label: "Repos" },
          { val: user.followers, label: "Followers" },
          { val: user.following, label: "Following" },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center">
            <span style={{ fontFamily: "'Geist', sans-serif", fontSize: "17px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.02em" }}>{s.val.toLocaleString()}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#a09dc0" }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 w-full">
        {user.location && (
          <span className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#7e7a9a" }}>
            <MapPin size={12} style={{ color: "#c4bfe8" }} />{user.location}
          </span>
        )}
        {user.blog && (
          <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#5b4fcf", textDecoration: "none" }}>
            <Link2 size={12} />{user.blog}
          </a>
        )}
        {user.twitter_username && (
          <span className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#7e7a9a" }}>
            <Twitter size={12} style={{ color: "#c4bfe8" }} />@{user.twitter_username}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sort / Filter bar ────────────────────────────────────────────────────────

type SortKey = "updated" | "stars" | "forks" | "name";

function SortBar({ sort, setSort, filter, setFilter, total }: {
  sort: SortKey; setSort: (s: SortKey) => void;
  filter: string; setFilter: (f: string) => void;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#a09dc0", letterSpacing: "0.08em" }}>
          {total} REPOS
        </span>
        <div style={{ width: 1, height: 14, background: "rgba(91,79,207,0.15)" }} />
        <div className="flex gap-1">
          {(["updated", "stars", "forks", "name"] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: "12.5px", fontWeight: sort === s ? 600 : 400,
                color: sort === s ? "#5b4fcf" : "#a09dc0",
                background: sort === s ? "#ede9fe" : "transparent",
                border: sort === s ? "1px solid rgba(91,79,207,0.2)" : "1px solid transparent",
                borderRadius: 8, padding: "4px 10px", cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <input
        placeholder="Filter repos…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{
          fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#1c1a2e",
          background: "rgba(255,255,255,0.7)", border: "1px solid rgba(91,79,207,0.12)",
          borderRadius: 10, padding: "6px 14px", outline: "none", width: 180,
          backdropFilter: "blur(8px)",
        }}
      />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function Dashboard({ onBack }: { onBack: () => void }) {
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [user, setUser]         = useState<GithubUser | null>(null);
  const [repos, setRepos]       = useState<GithubRepo[]>([]);
  const [sort, setSort]         = useState<SortKey>("updated");
  const [filter, setFilter]     = useState("");
  const [chatRepo, setChatRepo] = useState<GithubRepo | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const fetchRepos = useCallback(async (username: string) => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    setFilter("");
    try {
      const data = await backendApi.searchRepositories<GithubUser, GithubRepo>(username.trim());
      setUser(data.user);
      setRepos(data.repos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepos(query);
  };

  const sortedRepos = [...repos]
    .filter(r => r.name.toLowerCase().includes(filter.toLowerCase()) || (r.description ?? "").toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sort === "stars") return b.stargazers_count - a.stargazers_count;
      if (sort === "forks") return b.forks_count - a.forks_count;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const handleExplore = (repo: GithubRepo) => {
    setChatRepo(repo);
  };

  if (chatRepo) {
    return <RepoChat repo={chatRepo as any} onBack={() => setChatRepo(null)} />;
  }

  return (
    <div className="min-h-screen w-full" style={{ background: "#faf9ff", fontFamily: "'Inter', sans-serif" }}>
      {/* BG blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)", top: -100, left: -80, filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,182,206,0.1) 0%, transparent 70%)", top: 300, right: -60, filter: "blur(40px)" }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Navbar */}
        <nav
          className="w-full flex items-center justify-between px-8 md:px-12 py-4"
          style={{ borderBottom: "1px solid rgba(91,79,207,0.08)", background: "rgba(250,249,255,0.85)", backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 50 }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7e7a9a", transition: "color 0.2s", padding: 0 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#5b4fcf")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#7e7a9a")}
            >
              <ArrowLeft size={16} />
            </button>
            <div style={{ width: 1, height: 18, background: "rgba(91,79,207,0.12)" }} />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)", boxShadow: "0 2px 10px rgba(91,79,207,0.3)" }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="4" cy="4" r="2" fill="white" opacity="0.95" />
                  <circle cx="11" cy="4" r="2" fill="white" opacity="0.95" />
                  <circle cx="7.5" cy="11" r="2" fill="white" opacity="0.95" />
                  <path d="M4 6 Q4 7.5 7.5 7.5 Q11 7.5 11 6" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" fill="none" strokeLinecap="round" />
                  <line x1="7.5" y1="7.5" x2="7.5" y2="9" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Geist', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.025em" }}>
                ask your repo
              </span>
            </div>
          </div>

          {/* <NavigationMenu>
            <NavigationMenuList>
              {["Explore", "Trending", "Docs"].map(item => (
                <NavigationMenuItem key={item}>
                  <NavigationMenuLink
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: "#7e7a9a", cursor: "pointer", padding: "6px 12px", borderRadius: 8 }}
                  >
                    {item}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu> */}

          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "#059669", letterSpacing: "0.06em" }}>LIVE API</span>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="w-full max-w-6xl mx-auto px-8 md:px-12 py-12">

          {/* Hero search area */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-10"
          >
            <h1 style={{ fontFamily: "'Geist', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.04em", margin: "0 0 10px", lineHeight: 1.1 }}>
              Explore any GitHub{" "}
              <span style={{ background: "linear-gradient(135deg, #7c6ef5, #e879a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                profile
              </span>
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#7e7a9a", margin: 0 }}>
              Enter a GitHub username to explore their repositories
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="flex gap-3 mb-10 max-w-xl mx-auto"
          >
            <div
              className="flex items-center gap-3 flex-1 rounded-2xl px-5"
              style={{
                background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)",
                border: "1.5px solid rgba(91,79,207,0.18)",
                boxShadow: "0 4px 24px rgba(91,79,207,0.08)",
              }}
            >
              <Search size={17} style={{ color: "#a09dc0", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. torvalds, gaearon, sindresorhus…"
                autoFocus
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#1c1a2e",
                  background: "transparent", border: "none", outline: "none", flex: 1,
                  padding: "14px 0",
                }}
              />
              {loading && <Loader2 size={16} style={{ color: "#a09dc0", flexShrink: 0, animation: "spin 1s linear infinite" }} />}
            </div>
            <motion.button
              type="submit"
              disabled={loading || !query.trim()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: "'Geist', sans-serif", fontSize: "14.5px", fontWeight: 500,
                color: "white", background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)",
                border: "none", borderRadius: 14, padding: "0 24px", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading || !query.trim() ? 0.55 : 1,
                boxShadow: "0 4px 16px rgba(91,79,207,0.28)",
                transition: "opacity 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </motion.button>
          </motion.form>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-8 max-w-xl mx-auto"
                style={{ background: "#fff0f2", border: "1px solid rgba(224,92,122,0.2)" }}
              >
                <AlertCircle size={16} style={{ color: "#e05c7a", flexShrink: 0 }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: "#be185d", margin: 0 }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && !user && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-5 py-20"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #ede9fe, #fce7f3)", border: "1px solid rgba(167,139,250,0.2)" }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 0C8.95 0 0 8.95 0 20c0 8.85 5.74 16.35 13.7 18.98 1 .18 1.37-.43 1.37-.96 0-.47-.02-2.05-.02-3.73-5.03.92-6.35-1.23-6.75-2.36-.23-.58-1.2-2.35-2.06-2.82-.7-.38-1.7-1.3-.02-1.32 1.58-.02 2.7 1.45 3.08 2.05 1.8 3.02 4.67 2.17 5.82 1.65.18-1.3.7-2.17 1.27-2.68-4.45-.5-9.1-2.22-9.1-9.87 0-2.18.77-3.97 2.05-5.37-.2-.5-.9-2.54.2-5.3 0 0 1.67-.52 5.5 2.05 1.6-.45 3.3-.67 5-.67 1.7 0 3.4.22 5 .67 3.83-2.6 5.5-2.05 5.5-2.05 1.1 2.76.4 4.8.2 5.3 1.28 1.4 2.05 3.17 2.05 5.37 0 7.67-4.67 9.37-9.12 9.87.72.62 1.35 1.82 1.35 3.68 0 2.65-.02 4.8-.02 5.47 0 .53.37 1.15 1.37.96C34.26 36.35 40 28.83 40 20 40 8.95 31.05 0 20 0z" fill="#a09dc0" opacity="0.4" />
                </svg>
              </div>
              <div className="text-center">
                <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "18px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                  Search a GitHub user
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#a09dc0", margin: 0 }}>
                  Try <span style={{ color: "#5b4fcf", cursor: "pointer" }} onClick={() => { setQuery("torvalds"); fetchRepos("torvalds"); }}>torvalds</span>
                  {" · "}
                  <span style={{ color: "#5b4fcf", cursor: "pointer" }} onClick={() => { setQuery("gaearon"); fetchRepos("gaearon"); }}>gaearon</span>
                  {" · "}
                  <span style={{ color: "#5b4fcf", cursor: "pointer" }} onClick={() => { setQuery("sindresorhus"); fetchRepos("sindresorhus"); }}>sindresorhus</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* Results layout */}
          {user && (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Sidebar */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <UserProfile user={user} />
              </div>

              {/* Repos */}
              <div className="flex-1 min-w-0 flex flex-col gap-5">
                <SortBar sort={sort} setSort={setSort} filter={filter} setFilter={setFilter} total={sortedRepos.length} />
                <AnimatePresence mode="popLayout">
                  {sortedRepos.length === 0 ? (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#a09dc0", textAlign: "center", padding: "48px 0" }}
                    >
                      No repos match your filter.
                    </motion.p>
                  ) : (
                    <motion.div
                      key="grid"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {sortedRepos.map((repo, i) => (
                        <RepoCard key={repo.id} repo={repo} index={i} onExplore={handleExplore} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
