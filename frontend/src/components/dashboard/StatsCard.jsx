import React from 'react';

export function StatsCard({ title, value, icon, description, bgClass = 'bg-white', borderClass = 'border-[#5b4fcf]/10', textClass = 'text-[#5b4fcf]' }) {
  return (
    <div className={`p-5 rounded-[1.5rem] border ${borderClass} ${bgClass} shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex items-center justify-between gap-4`}>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-[#7e7a9a] uppercase tracking-wider block mb-1">
          {title}
        </span>
        <h3 className="text-2xl font-black text-[#1c1a2e] leading-tight truncate">
          {value}
        </h3>
        {description && (
          <p className="text-[11px] text-[#7e7a9a] mt-1 font-medium truncate">
            {description}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 ${textClass}`}>
        {icon}
      </div>
    </div>
  );
}
