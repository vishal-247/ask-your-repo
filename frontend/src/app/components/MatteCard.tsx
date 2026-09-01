import { motion } from "motion/react";

export function MatteCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full max-w-[400px] mx-auto"
    >
      {/* Glow blobs behind the card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 260, height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.28) 0%, transparent 70%)",
          top: -50, left: -40, filter: "blur(30px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,182,206,0.3) 0%, transparent 70%)",
          bottom: -30, right: -30, filter: "blur(24px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 160, height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(110,231,183,0.22) 0%, transparent 70%)",
          bottom: 40, left: -20, filter: "blur(20px)",
        }}
      />

      {/* Card body */}
      <div
        className="relative rounded-[28px] overflow-hidden flex flex-col gap-6 p-9"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 8px 40px rgba(91,79,207,0.1), 0 2px 8px rgba(91,79,207,0.06)",
        }}
      >
        {/* Logo cluster */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c6ef5 0%, #5b4fcf 100%)",
              boxShadow: "0 4px 16px rgba(91,79,207,0.35)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="7" cy="7" r="3" fill="white" opacity="0.95" />
              <circle cx="21" cy="7" r="3" fill="white" opacity="0.95" />
              <circle cx="14" cy="21" r="3" fill="white" opacity="0.95" />
              <path d="M7 10 Q7 14 14 14 Q21 14 21 10" stroke="white" strokeWidth="1.8" strokeOpacity="0.5" fill="none" strokeLinecap="round" />
              <line x1="14" y1="14" x2="14" y2="18" stroke="white" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1c1a2e", letterSpacing: "-0.02em", lineHeight: 1 }}>
              ask your repo
            </p>
            <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10.5px", color: "#a09dc0", letterSpacing: "0.08em", marginTop: "5px" }}>
              github.com/acme/platform
            </p>
          </div>
          {/* Status dot */}
          <div className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "rgba(110,231,183,0.18)", border: "1px solid rgba(52,211,153,0.3)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "9.5px", color: "#059669", letterSpacing: "0.06em" }}>LIVE</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(91,79,207,0.12), transparent)" }} />

        {/* Chat messages */}
        <div className="flex flex-col gap-3">
          {/* User bubble */}
          <div className="flex justify-end">
            <div
              className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]"
              style={{
                background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)",
                boxShadow: "0 2px 10px rgba(91,79,207,0.22)",
              }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "white", lineHeight: 1.5 }}>
                What does the auth module do?
              </p>
            </div>
          </div>

          {/* AI bubble */}
          <div className="flex justify-start">
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%]"
              style={{
                background: "#f3f1fb",
                border: "1px solid rgba(91,79,207,0.1)",
              }}
            >
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11.5px", color: "#4a4868", lineHeight: 1.65 }}>
                <span style={{ color: "#a09dc0" }}>src/auth/</span>{" "}
                handles JWT validation, session management &amp; OAuth2 flows via a composable middleware chain.
              </p>
            </div>
          </div>

          {/* User bubble 2 */}
          <div className="flex justify-end">
            <div
              className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]"
              style={{
                background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)",
                boxShadow: "0 2px 10px rgba(91,79,207,0.22)",
              }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "white", lineHeight: 1.5 }}>
                Show me the directory tree
              </p>
            </div>
          </div>

          {/* Typing indicator */}
          <div className="flex justify-start items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm w-fit" style={{ background: "#f3f1fb", border: "1px solid rgba(91,79,207,0.1)" }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#a09dc0" }}
              />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "142", label: "Files", color: "#ede9fe", text: "#7c3aed" },
            { value: "38", label: "Modules", color: "#fce7f3", text: "#be185d" },
            { value: "4.2k", label: "Lines", color: "#d1fae5", text: "#065f46" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl py-3 flex flex-col items-center gap-0.5"
              style={{ background: s.color }}
            >
              <span style={{ fontFamily: "'Geist', sans-serif", fontSize: "16px", fontWeight: 600, color: s.text, letterSpacing: "-0.02em" }}>
                {s.value}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10.5px", color: s.text, opacity: 0.7 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
