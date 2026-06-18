import React from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import MatteCard from '../components/landing/MatteCard';
import { FloatingOctocats } from '../components/landing/FloatingOctocats';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01',
      title: 'Paste a GitHub URL',
      desc: 'Drop any public or private repository URL. We index the structure in seconds.',
      bg: 'bg-[#f0edff]/40',
      border: 'border-[#5b4fcf]/10',
      text: 'text-[#5b4fcf]',
    },
    {
      num: '02',
      title: 'Ask anything',
      desc: 'Natural language questions about files, architecture, dependencies, or logic.',
      bg: 'bg-[#ffe8f0]/40',
      border: 'border-[#e05c7a]/10',
      text: 'text-[#e05c7a]',
    },
    {
      num: '03',
      title: 'Navigate freely',
      desc: 'Follow threads, drill into files, and build a mental map of any codebase.',
      bg: 'bg-emerald-50/40',
      border: 'border-emerald-500/10',
      text: 'text-emerald-600',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#faf9ff] text-[#1c1a2e] overflow-x-hidden font-sans pb-20">
      {/* Animated Floating Octocats Background */}
      <FloatingOctocats />

      {/* Navigation Header */}
      <Navbar />

      {/* Hero Content Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Title and Features */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Hero />
          </div>

          {/* Right Column: Matte Card chatbot preview */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <MatteCard />
          </div>
        </div>
      </main>

      {/* How it Works Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 mt-32 md:mt-48 relative z-10">
        <div className="flex flex-col gap-2 mb-12">
          <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-[#7e7a9a] uppercase flex items-center gap-2">
            <span className="w-6 h-[1px] bg-[#7e7a9a]"></span>
            HOW IT WORKS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-[2rem] border ${step.border} ${step.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg`}
            >
              <div className={`font-mono font-bold text-lg ${step.text} mb-6`}>{step.num}</div>
              <h3 className="font-bold text-xl text-[#1c1a2e] mb-3">{step.title}</h3>
              <p className="text-sm text-[#7e7a9a] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-6 mt-20 md:mt-28 relative z-10">
        <div className="bg-gradient-to-r from-[#5b4fcf] to-[#7c6efe] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-[#5b4fcf]/15 relative overflow-hidden group">
          {/* Accent Glow Circle inside Banner */}
          <div className="absolute right-[-10%] top-[-50%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="flex flex-col gap-2 relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Ready to explore your codebase?
            </h2>
            <p className="text-white/80 text-sm md:text-base font-medium">
              Free to start. No credit card required.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white hover:bg-slate-50 text-[#5b4fcf] px-7 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95 transition-all duration-200 relative z-10 w-full md:w-auto justify-center"
          >
            Open Dashboard
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
