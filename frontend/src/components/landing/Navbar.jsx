import React from 'react';
import { useNavigate } from 'react-router';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-[#5b4fcf]/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Brand logo & name */}
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10 bg-[#5b4fcf] rounded-xl flex items-center justify-center shadow-lg shadow-[#5b4fcf]/20 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
        </div>
        <span className="font-sans font-bold text-xl text-[#1c1a2e] tracking-tight group-hover:text-[#5b4fcf] transition-colors duration-300">
          ask your repo
        </span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-[#7e7a9a] font-medium text-sm">
        <a href="#features" className="hover:text-[#5b4fcf] transition-colors duration-200">Features</a>
        <a href="#docs" className="hover:text-[#5b4fcf] transition-colors duration-200">Docs</a>
        <a href="#changelog" className="hover:text-[#5b4fcf] transition-colors duration-200">Changelog</a>
      </div>

      {/* Action button */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-[#5b4fcf] hover:bg-[#483eb3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#5b4fcf]/20 hover:shadow-lg hover:shadow-[#5b4fcf]/30 active:scale-95 transition-all duration-200"
        >
          Sign in
        </button>
      </div>
    </nav>
  );
}
