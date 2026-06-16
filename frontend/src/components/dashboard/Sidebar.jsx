import React from 'react';
import { 
  Database, 
  MessageSquare, 
  FolderTree, 
  Network, 
  Map, 
  Link, 
  GitBranch,
  Home,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function Sidebar({ activeTab, setActiveTab, currentRepo, isLoading }) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'loader', label: 'Repo Loader', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'chat', label: 'Codebase Chat', icon: <MessageSquare className="w-4 h-4" />, disabled: !currentRepo },
    { id: 'explorer', label: 'File Explorer', icon: <FolderTree className="w-4 h-4" />, disabled: !currentRepo },
    { id: 'architecture', label: 'Architecture', icon: <Network className="w-4 h-4" />, disabled: !currentRepo },
    { id: 'roadmap', label: 'Learning Roadmap', icon: <Map className="w-4 h-4" />, disabled: !currentRepo },
    { id: 'dependencies', label: 'Dependencies', icon: <Link className="w-4 h-4" />, disabled: !currentRepo },
  ];

  return (
    <aside className="w-64 border-r border-[#5b4fcf]/10 bg-white/80 backdrop-blur-md flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div 
        className="p-6 border-b border-[#5b4fcf]/10 flex items-center gap-2.5 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="w-8.5 h-8.5 bg-[#5b4fcf] rounded-lg flex items-center justify-center shadow-md shadow-[#5b4fcf]/20 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
        </div>
        <span className="font-bold text-base text-[#1c1a2e] group-hover:text-[#5b4fcf] transition-colors duration-300">
          ask your repo
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                item.disabled 
                  ? 'text-[#7e7a9a]/40 cursor-not-allowed opacity-50' 
                  : isActive
                    ? 'bg-[#5b4fcf] text-white shadow-lg shadow-[#5b4fcf]/20'
                    : 'text-[#7e7a9a] hover:bg-[#f0edff]/50 hover:text-[#5b4fcf]'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Repository Status Footer */}
      <div className="p-4 border-t border-[#5b4fcf]/10 bg-[#faf9ff]/50 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Home 
            className="w-4 h-4 text-[#7e7a9a] cursor-pointer hover:text-[#5b4fcf] transition-colors"
            onClick={() => navigate('/')}
          />
          <span className="text-xs font-semibold text-[#7e7a9a]">Current Status:</span>
        </div>
        
        {currentRepo ? (
          <div className="flex flex-col gap-1 bg-white p-2.5 rounded-xl border border-[#5b4fcf]/10 shadow-sm">
            <span className="text-xs font-bold text-[#1c1a2e] truncate" title={currentRepo}>
              {currentRepo.split('/').pop()}
            </span>
            <span className="text-[10px] text-[#7e7a9a] truncate font-mono">
              {currentRepo}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 font-semibold uppercase">
              {isLoading ? (
                <>
                  <Loader className="w-3 h-3 animate-spin text-[#5b4fcf]" />
                  <span className="text-[#5b4fcf]">Indexing...</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Loaded
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-[#7e7a9a] italic px-1">
            No repository active. Load one to get started.
          </div>
        )}
      </div>
    </aside>
  );
}
