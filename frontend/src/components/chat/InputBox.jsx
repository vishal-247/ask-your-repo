import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';

export function InputBox({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 border-t border-[#5b4fcf]/10 bg-white/80 backdrop-blur-md flex gap-3 items-center"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
        placeholder={isLoading ? 'AI is thinking...' : 'Ask a question about the repository...'}
        className="flex-1 px-4.5 py-3.5 bg-[#f3f1fb]/50 focus:bg-[#f3f1fb] border border-[#5b4fcf]/10 focus:border-[#5b4fcf]/40 rounded-2xl text-sm text-[#1c1a2e] focus:outline-none transition-all"
      />
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
          !text.trim() || isLoading
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-[#5b4fcf] text-white hover:bg-[#483eb3] shadow-md shadow-[#5b4fcf]/20 active:scale-95'
        }`}
      >
        {isLoading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
}
export default InputBox;
