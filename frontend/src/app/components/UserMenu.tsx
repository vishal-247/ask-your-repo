import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openAuthModal("login")}
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "#5b4fcf",
            background: "#ede9fe",
            border: "1px solid rgba(124,62,237,0.18)",
            borderRadius: "10px",
            padding: "8px 16px",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#e0d9ff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#ede9fe";
          }}
        >
          Sign in
        </button>

        <button
          onClick={() => openAuthModal("signup")}
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "white",
            background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)",
            border: "none",
            borderRadius: "10px",
            padding: "8px 18px",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            boxShadow: "0 2px 12px rgba(91,79,207,0.28)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(91,79,207,0.38)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(91,79,207,0.28)";
          }}
        >
          Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 cursor-pointer transition-all"
        style={{
          background: "rgba(237, 233, 254, 0.6)",
          border: "1px solid rgba(124, 62, 237, 0.2)",
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
          style={{ background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)" }}
        >
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "13.5px",
            fontWeight: 600,
            color: "#1c1a2e",
          }}
        >
          {user.username}
        </span>
        <ChevronDown size={14} style={{ color: "#7e7a9a" }} />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: 40 }}
              onClick={() => setDropdownOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 rounded-2xl p-2 shadow-xl"
              style={{
                zIndex: 50,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(91, 79, 207, 0.15)",
                boxShadow: "0 10px 30px rgba(91, 79, 207, 0.15)",
              }}
            >
              <div className="px-3 py-2 border-b border-purple-100 mb-1">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#a09dc0" }}>
                  Signed in as
                </p>
                <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1c1a2e" }}>
                  @{user.username}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
