import React from 'react';
import { useNavigate } from 'react-router';
import { MessageSquare, FolderTree, Landmark, Terminal, ArrowRight, Github } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5 text-[#5b4fcf]" />,
      iconBg: 'bg-[#f0edff]',
      title: 'Chat with any repo',
      desc: 'Ask questions in plain English',
    },
    {
      icon: <FolderTree className="w-5 h-5 text-[#e05c7a]" />,
      iconBg: 'bg-[#ffe8f0]',
      title: 'Explore directory trees',
      desc: 'Visual file structure at a glance',
    },
    {
      icon: <Landmark className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      title: 'Understand architecture',
      desc: 'Module relationships made clear',
    },
    {
      icon: <Terminal className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50',
      title: 'Navigate at speed',
      desc: 'Jump to any symbol instantly',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#1c1a2e] leading-[1.15] tracking-tight">
        Talk to your <br />
        <span className="bg-gradient-to-r from-[#5b4fcf] via-[#e05c7a] to-[#ff8c42] bg-clip-text text-transparent">
          codebase.
        </span>
      </h1>

      {/* Description */}
      <p className="text-base md:text-lg text-[#7e7a9a] font-normal leading-relaxed">
        Load any GitHub repository and have a real conversation with it. Explore structure, understand architecture, and navigate unfamiliar codebases — in seconds.
      </p>

      {/* Feature List */}
      <div className="space-y-4 my-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <div className={`w-10 h-10 ${f.iconBg} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
              {f.icon}
            </div>
            <div>
              <span className="font-semibold text-sm text-[#1c1a2e]">{f.title}</span>
              <span className="text-xs text-[#7e7a9a] ml-2 font-medium">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-[#5b4fcf] hover:bg-[#4b3ec0] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#5b4fcf]/20 hover:shadow-xl hover:shadow-[#5b4fcf]/35 active:scale-98 transition-all duration-200"
        >
          Open Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>

        <a
          href="https://github.com/shivani07-gh/ask-your-repo"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-[#5b4fcf]/10 hover:border-[#5b4fcf]/25 bg-[#f0edff]/30 hover:bg-[#f0edff]/60 text-[#5b4fcf] px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 active:scale-98 transition-all duration-200"
        >
          <Github className="w-4 h-4" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
