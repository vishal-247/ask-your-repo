import React, { useRef, useEffect } from 'react';
import { Terminal, MessageSquare } from 'lucide-react';

export function MessageList({ messages, onSourceClick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = (text, btnId) => {
    navigator.clipboard.writeText(text);
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.innerHTML = 'Copied!';
      btn.classList.add('bg-emerald-500', 'text-white');
      setTimeout(() => {
        btn.innerHTML = 'Copy';
        btn.classList.remove('bg-emerald-500', 'text-white');
      }, 1500);
    }
  };

  // Helper to format message content (simple inline code rendering and code blocks)
  const formatText = (text) => {
    if (!text) return '';

    // Split text by code blocks ```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Extract language and code
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : 'code';
        const code = match ? match[2].trim() : part.slice(3, -3).trim();
        const btnId = `btn-${index}`;

        return (
          <div key={index} className="my-3 border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-full">
            <div className="bg-slate-800 text-slate-300 px-4 py-1.5 text-xs font-mono flex items-center justify-between">
              <span>{lang || 'code'}</span>
              <button
                id={btnId}
                onClick={() => copyToClipboard(code, btnId)}
                className="hover:text-white px-2 py-0.5 rounded bg-slate-700/50 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 overflow-x-auto text-xs font-mono leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Handle inline code formatting e.g. `code`
      const inlineParts = part.split(/(`[^`\n]+`)/g);
      return (
        <span key={index}>
          {inlineParts.map((subPart, subIdx) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={subIdx} className="bg-slate-100 text-[#5b4fcf] font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-65">
        <div className="w-16 h-16 bg-[#f0edff] text-[#5b4fcf] rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-[#1c1a2e] mb-1">Talk to your Codebase</h3>
        <p className="text-sm text-[#7e7a9a] max-w-sm">
          Ask questions about components, entry points, logic flows, or architectural layers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg, idx) => {
        const isUser = msg.sender === 'user';
        return (
          <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
            <div className={`max-w-[85%] flex flex-col gap-1.5`}>
              <div
                className={`px-4.5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-[#5b4fcf] text-white rounded-tr-sm'
                    : 'bg-white text-[#1c1a2e] border border-[#5b4fcf]/10 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{formatText(msg.text)}</div>
              </div>

              {/* Source References */}
              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-[#7e7a9a] uppercase tracking-wider mr-1">
                    Sources:
                  </span>
                  {msg.sources.map((src, srcIdx) => {
                    const filename = src.split('/').pop();
                    return (
                      <button
                        key={srcIdx}
                        onClick={() => onSourceClick && onSourceClick(src)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#f0edff] hover:text-[#5b4fcf] border border-slate-200 text-[#7e7a9a] font-mono text-[10px] rounded-lg transition-all"
                        title={`Click to view ${src}`}
                      >
                        <Terminal className="w-3 h-3 text-[#7e7a9a]/70" />
                        {filename}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
