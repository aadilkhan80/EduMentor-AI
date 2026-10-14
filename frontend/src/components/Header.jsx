import React from 'react';
import { Menu, Sparkles, Flame, LogOut } from 'lucide-react';

export default function Header({ active, onOpenProfile, onLogout, streak = 7, onToggleMobileMenu, studentName = "Student" }) {
  const getSubheading = (view) => {
    switch(view) {
      case 'Dashboard': return 'Here is your personalized learning overview today.';
      case 'Courses': return 'Explore syllabus topics, masteries, and recent performance.';
      case 'Weak Areas': return 'AI-detected concepts requiring focused reinforcement.';
      case 'Study Plan': return 'Your adaptive 7-day milestone revision schedule.';
      case 'Quizzes': return 'AI-generated adaptive practice quizzes and results.';
      case 'AI Mentor': return 'Ask doubts, request code breakdowns, and generate examples.';
      case 'Progress': return 'Deep analytics, historical trends, and topic growth.';
      default: return 'Learn Smarter. Improve Faster.';
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">EduMentor AI</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Welcome back 👋</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{active}</h2>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5">{getSubheading(active)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{streak} Day Streak</span>
        </div>

        {/* AI Ready Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Engine Ready</span>
        </div>

        {/* User Avatar Button */}
        <button 
          onClick={onOpenProfile}
          title="View Student Profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 font-bold text-white shadow-md shadow-indigo-600/30 hover:ring-2 hover:ring-indigo-400 transition"
        >
          {studentName.charAt(0)}
        </button>
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
