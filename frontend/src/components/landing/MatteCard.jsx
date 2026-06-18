import React, { useState, useEffect } from 'react';

export default function MatteCard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Run an animation sequence to simulate typing/chatting
    const timers = [
      setTimeout(() => setStep(1), 1000),  // User message 1
      setTimeout(() => setStep(2), 2200),  // AI is typing 1
      setTimeout(() => setStep(3), 3500),  // AI reply 1
      setTimeout(() => setStep(4), 5000),  // User message 2
      setTimeout(() => setStep(5), 6200),  // AI is typing 2
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-[500px] bg-white/85 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_30px_100px_rgba(91,79,207,0.12)] border border-white/60 relative overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_40px_120px_rgba(91,79,207,0.18)]">
      {/* Matte Card Header */}
      <div className="flex items-center justify-between border-b border-[#5b4fcf]/10 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#5b4fcf] to-[#7b6ffd] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5b4fcf]/30">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-lg text-[#1c1a2e] leading-tight">ask your repo</h4>
            <span className="text-xs text-[#7e7a9a] font-mono">github.com/acme/platform</span>
          </div>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-xs font-semibold tracking-wider">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          LIVE
        </div>
      </div>

      {/* Chat Messages Simulator */}
      <div className="space-y-4 min-h-[260px] flex flex-col justify-end">
        {step >= 1 && (
          <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#5b4fcf] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[80%] shadow-md shadow-[#5b4fcf]/15">
              What does the auth module do?
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex justify-start items-center gap-2">
            <div className="bg-[#f3f1fb] text-[#7e7a9a] px-4 py-3 rounded-2xl rounded-tl-sm text-sm flex gap-1">
              <span className="w-2.5 h-2.5 bg-[#5b4fcf]/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2.5 h-2.5 bg-[#5b4fcf]/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2.5 h-2.5 bg-[#5b4fcf]/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#f3f1fb] text-[#1c1a2e] px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] border border-[#5b4fcf]/5">
              <code className="bg-white/80 px-1 py-0.5 rounded text-xs font-mono text-[#5b4fcf] border border-[#5b4fcf]/10">src/auth/</code> handles JWT validation, session management & OAuth2 flows via a composable middleware chain.
            </div>
          </div>
        )}

        {step >= 4 && (
          <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#5b4fcf] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[80%] shadow-md shadow-[#5b4fcf]/15">
              Show me the directory tree
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex justify-start items-center gap-2">
            <div className="bg-[#f3f1fb] text-[#7e7a9a] px-4 py-3 rounded-2xl rounded-tl-sm text-sm flex gap-1">
              <span className="w-2.5 h-2.5 bg-[#5b4fcf]/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2.5 h-2.5 bg-[#5b4fcf]/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2.5 h-2.5 bg-[#5b4fcf]/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Repo Stats Pills */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#5b4fcf]/10">
        <div className="bg-[#f0edff] rounded-2xl p-3 text-center border border-[#5b4fcf]/5 hover:scale-[1.02] transition-transform duration-200">
          <div className="text-xl font-bold text-[#5b4fcf]">142</div>
          <div className="text-[10px] text-[#7e7a9a] font-medium tracking-wide uppercase mt-0.5">Files</div>
        </div>
        <div className="bg-[#ffe8f0] rounded-2xl p-3 text-center border border-pink-200/50 hover:scale-[1.02] transition-transform duration-200">
          <div className="text-xl font-bold text-[#e05c7a]">38</div>
          <div className="text-[10px] text-[#7e7a9a] font-medium tracking-wide uppercase mt-0.5">Modules</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-200/40 hover:scale-[1.02] transition-transform duration-200">
          <div className="text-xl font-bold text-emerald-600">4.2k</div>
          <div className="text-[10px] text-[#7e7a9a] font-medium tracking-wide uppercase mt-0.5">Lines</div>
        </div>
      </div>
    </div>
  );
}
