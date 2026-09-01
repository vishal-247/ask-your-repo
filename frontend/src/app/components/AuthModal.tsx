import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, User, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { backendApi } from "../lib/api";

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, loginUser } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(authModalMode);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setUsername("");
    setPassword("");
  }, [authModalMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const res = await backendApi.login(username.trim(), password);
        loginUser(res.access_token, res.user);
      } else {
        const res = await backendApi.register(username.trim(), password);
        loginUser(res.access_token, res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 100 }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-md rounded-3xl p-8 overflow-hidden shadow-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(124, 110, 245, 0.2)",
            boxShadow: "0 20px 50px rgba(91, 79, 207, 0.25)",
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Title Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md"
              style={{ background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)" }}
            >
              <Lock size={22} className="text-white" />
            </div>
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "22px",
                fontWeight: 600,
                color: "#1c1a2e",
                letterSpacing: "-0.03em",
              }}
            >
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13.5px",
                color: "#7e7a9a",
                marginTop: "4px",
              }}
            >
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Choose a username and password to get started"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: "#f1efff" }}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: mode === "login" ? "white" : "transparent",
                color: mode === "login" ? "#5b4fcf" : "#7e7a9a",
                boxShadow: mode === "login" ? "0 2px 8px rgba(91,79,207,0.12)" : "none",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: mode === "signup" ? "white" : "transparent",
                color: mode === "signup" ? "#5b4fcf" : "#7e7a9a",
                boxShadow: mode === "signup" ? "0 2px 8px rgba(91,79,207,0.12)" : "none",
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5"
              style={{ background: "#fff0f2", border: "1px solid rgba(224,92,122,0.2)" }}
            >
              <AlertCircle size={16} className="text-pink-600 flex-shrink-0" />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#be185d", margin: 0 }}>
                {error}
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1c1a2e",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Username
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                style={{
                  background: "#f9f8fe",
                  border: "1.5px solid rgba(91,79,207,0.15)",
                }}
              >
                <User size={16} style={{ color: "#a09dc0" }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoFocus
                  required
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "#1c1a2e",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1c1a2e",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                style={{
                  background: "#f9f8fe",
                  border: "1.5px solid rgba(91,79,207,0.15)",
                }}
              >
                <Lock size={16} style={{ color: "#a09dc0" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "#1c1a2e",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-3 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)",
                fontFamily: "'Geist', sans-serif",
                fontSize: "14.5px",
                boxShadow: "0 4px 18px rgba(91,79,207,0.32)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#7e7a9a" }}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: "#5b4fcf",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
