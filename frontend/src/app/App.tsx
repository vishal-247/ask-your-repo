import { useState } from "react";
import { motion } from "motion/react";
import { MatteCard } from "./components/MatteCard";
import { FloatingOctocats } from "./components/FloatingOctocats";
import { Dashboard } from "./components/Dashboard";

const features = [
  {
    label: "Chat with any repo",
    desc: "Ask questions in plain English",
    bg: "#ede9fe", icon: "#7c3aed",
    iconPath: (
      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 2v-2H3a1 1 0 01-1-1V3z" fill="currentColor" />
    ),
  },
  {
    label: "Explore directory trees",
    desc: "Visual file structure at a glance",
    bg: "#fce7f3", icon: "#be185d",
    iconPath: (
      <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    ),
  },
  {
    label: "Understand architecture",
    desc: "Module relationships made clear",
    bg: "#d1fae5", icon: "#065f46",
    iconPath: (
      <>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: "Navigate at speed",
    desc: "Jump to any symbol instantly",
    bg: "#fef3c7", icon: "#92400e",
    iconPath: (
      <path d="M3 3l4 4-4 4M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

const steps = [
  {
    step: "01",
    title: "Paste a GitHub URL",
    desc: "Drop any public or private repository URL. We index the structure in seconds.",
    accent: "#ede9fe",
    border: "rgba(124,62,237,0.15)",
    stepColor: "#c4b5fd",
  },
  {
    step: "02",
    title: "Ask anything",
    desc: "Natural language questions about files, architecture, dependencies, or logic.",
    accent: "#fce7f3",
    border: "rgba(190,24,93,0.12)",
    stepColor: "#f9a8d4",
  },
  {
    step: "03",
    title: "Navigate freely",
    desc: "Follow threads, drill into files, and build a mental map of any codebase.",
    accent: "#d1fae5",
    border: "rgba(6,95,70,0.12)",
    stepColor: "#6ee7b7",
  },
];

export default function App() {
  const [page, setPage] = useState<"landing" | "dashboard">("landing");

  if (page === "dashboard") {
    return <Dashboard onBack={() => setPage("landing")} />;
  }

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: "#faf9ff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <FloatingOctocats />

      {/* Background gradient blobs — fixed, decorative */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.13) 0%, transparent 70%)",
          top: -100, left: -100, filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,182,206,0.14) 0%, transparent 70%)",
          top: 200, right: -80, filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(110,231,183,0.12) 0%, transparent 70%)",
          bottom: 100, left: "30%", filter: "blur(40px)",
        }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full flex items-center justify-between px-8 md:px-12 py-5"
          style={{
            borderBottom: "1px solid rgba(91,79,207,0.08)",
            background: "rgba(250,249,255,0.8)",
            backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 50,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c6ef5 0%, #5b4fcf 100%)", boxShadow: "0 2px 10px rgba(91,79,207,0.3)" }}
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="4" cy="4" r="2" fill="white" opacity="0.95" />
                <circle cx="13" cy="4" r="2" fill="white" opacity="0.95" />
                <circle cx="8.5" cy="13" r="2" fill="white" opacity="0.95" />
                <path d="M4 6 Q4 8.5 8.5 8.5 Q13 8.5 13 6" stroke="white" strokeWidth="1.4" strokeOpacity="0.55" fill="none" strokeLinecap="round" />
                <line x1="8.5" y1="8.5" x2="8.5" y2="11" stroke="white" strokeWidth="1.4" strokeOpacity="0.55" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Geist', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.025em" }}>
              ask your repo
            </span>
          </div>

         
          <button
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: "13.5px", fontWeight: 500,
              color: "white", background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)",
              border: "none", borderRadius: "10px", padding: "8px 18px", cursor: "pointer",
              letterSpacing: "-0.01em", boxShadow: "0 2px 12px rgba(91,79,207,0.28)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(91,79,207,0.38)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(91,79,207,0.28)";
            }}
          >
            Sign in
          </button>
        </motion.nav>

        {/* Hero */}
        <section className="w-full max-w-6xl mx-auto px-8 md:px-12 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col gap-8"
          >
            {/* Pill badge */}
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 self-start rounded-full px-4 py-1.5"
              style={{ background: "linear-gradient(90deg, #ede9fe, #fce7f3)", border: "1px solid rgba(167,139,250,0.3)" }}
            >
              <span style={{ fontSize: "13px" }}>✨</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#5b4fcf", fontWeight: 500 }}>
                Now in beta — free to try
              </span>
            </motion.div> */}

            {/* Headline */}
            <div>
              <h1 style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "clamp(38px, 5vw, 60px)",
                fontWeight: 600, color: "#1c1a2e",
                letterSpacing: "-0.04em", lineHeight: 1.06, margin: 0,
              }}>
                Talk to your<br />
                <span style={{
                  background: "linear-gradient(135deg, #7c6ef5 0%, #e879a0 60%, #f97316 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  codebase.
                </span>
              </h1>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: "17px", fontWeight: 400,
                color: "#7e7a9a", lineHeight: 1.65, marginTop: "18px", maxWidth: "420px",
              }}>
                Load any GitHub repository and have a real conversation with it.
                Explore structure, understand architecture, and navigate unfamiliar
                codebases — in seconds.
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-col gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                  className="flex items-center gap-3.5"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: f.bg, color: f.icon }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      {f.iconPath}
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#1c1a2e" }}>
                      {f.label}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#a09dc0", marginLeft: "8px" }}>
                      {f.desc}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                onClick={() => setPage("dashboard")}
                style={{
                  fontFamily: "'Geist', sans-serif", fontSize: "15px", fontWeight: 500,
                  color: "white", background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)",
                  border: "none", borderRadius: "12px", padding: "13px 26px", cursor: "pointer",
                  letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 4px 20px rgba(91,79,207,0.3)",
                }}
              >
                Open Dashboard
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>

              <motion.a
                href="https://github.com/shivani07-gh/ask-your-repo"
                target="_blank"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500,
                  color: "#5b4fcf", background: "#ede9fe",
                  border: "1px solid rgba(124,62,237,0.18)",
                  borderRadius: "12px", padding: "12px 22px",
                  textDecoration: "none", display: "flex", alignItems: "center", gap: "6px",
                  cursor: "pointer",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.5 0C3.36 0 0 3.36 0 7.5c0 3.31 2.15 6.12 5.13 7.11.38.07.52-.16.52-.36v-1.27c-2.1.46-2.54-.99-2.54-.99-.34-.87-.84-1.1-.84-1.1-.69-.47.05-.46.05-.46.76.05 1.16.78 1.16.78.67 1.16 1.77.82 2.2.63.07-.49.26-.82.48-1.01-1.68-.19-3.44-.84-3.44-3.74 0-.83.3-1.5.78-2.03-.08-.19-.34-.96.07-2 0 0 .64-.2 2.08.78a7.26 7.26 0 011.9-.25c.64 0 1.29.08 1.9.25 1.44-.99 2.08-.78 2.08-.78.41 1.04.15 1.81.07 2 .49.53.78 1.2.78 2.03 0 2.91-1.77 3.55-3.45 3.74.27.23.51.69.51 1.39v2.06c0 .2.14.44.52.36C12.85 13.62 15 10.81 15 7.5 15 3.36 11.64 0 7.5 0z" fill="currentColor" />
                </svg>
                View on GitHub
              </motion.a>
            </div>
          </motion.div>

          {/* Right — card */}
          <div className="flex items-center justify-center">
            <MatteCard />
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-8 md:px-12">
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(91,79,207,0.12), transparent)" }} />
        </div>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto px-8 md:px-12 py-20"
        >
          <div className="flex items-center gap-3 mb-12">
            <div style={{ width: 24, height: 1, background: "rgba(91,79,207,0.3)" }} />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#a09dc0", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              How it works
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{
                  background: s.accent,
                  border: `1px solid ${s.border}`,
                }}
              >
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", fontWeight: 500, color: s.stepColor }}>
                  {s.step}
                </span>
                <h3 style={{ fontFamily: "'Geist', sans-serif", fontSize: "18px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.025em", margin: 0 }}>
                  {s.title}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#7e7a9a", lineHeight: 1.65, margin: 0 }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto px-8 md:px-12 pb-24"
        >
          <div
            className="rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{
              background: "linear-gradient(135deg, #7c6ef5 0%, #5b4fcf 50%, #4338ca 100%)",
              boxShadow: "0 12px 48px rgba(91,79,207,0.28)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)", top: -80, right: -40 }} />
            <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: -60, left: 60 }} />

            <div className="relative flex flex-col gap-3">
              <h2 style={{ fontFamily: "'Geist', sans-serif", fontSize: "28px", fontWeight: 600, color: "white", letterSpacing: "-0.03em", margin: 0 }}>
                Ready to explore your codebase?
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
                Free to start. No credit card required.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => setPage("dashboard")}
              style={{
                fontFamily: "'Geist', sans-serif", fontSize: "15px", fontWeight: 600,
                color: "#5b4fcf", background: "white",
                border: "none", borderRadius: "12px", padding: "14px 28px", cursor: "pointer",
                letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "8px",
                whiteSpace: "nowrap", flexShrink: 0,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              Open Dashboard
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
        </motion.section>

        {/* Footer */}
        <footer
          className="w-full max-w-6xl mx-auto px-8 md:px-12 py-7 flex flex-wrap items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(91,79,207,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="3" cy="3" r="1.5" fill="white" opacity="0.9" />
                <circle cx="10" cy="3" r="1.5" fill="white" opacity="0.9" />
                <circle cx="6.5" cy="10" r="1.5" fill="white" opacity="0.9" />
                <path d="M3 4.5 Q3 6.5 6.5 6.5 Q10 6.5 10 4.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" fill="none" strokeLinecap="round" />
                <line x1="6.5" y1="6.5" x2="6.5" y2="8.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#c4bfe8" }}>
              © 2026 ask your repo
            </span>
          </div>
          <div className="flex gap-5">
            {["Privacy", "Terms", "GitHub"].map((label) => (
              <a
                key={label}
                href="#"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#c4bfe8", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#5b4fcf")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#c4bfe8")}
              >
                {label}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
