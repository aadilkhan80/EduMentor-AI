import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  AlertTriangle, 
  CalendarDays, 
  Award, 
  Bot, 
  TrendingUp, 
  UserCircle,
  LogOut
} from 'lucide-react';

export default function Sidebar({ active, setActive, weakCount, onOpenProfile, onLogout, studentName = "Alex Johnson" }) {
  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Courses', icon: BookOpen, badge: null },
    { name: 'Weak Areas', icon: AlertTriangle, badge: weakCount > 0 ? `${weakCount}` : null, badgeColor: 'bg-rose-500' },
    { name: 'Study Plan', icon: CalendarDays, badge: '7d', badgeColor: 'bg-indigo-500' },
    { name: 'Quizzes', icon: Award, badge: 'AI', badgeColor: 'bg-purple-500' },
    { name: 'AI Mentor', icon: Bot, badge: 'Live', badgeColor: 'bg-emerald-500' },
    { name: 'Progress', icon: TrendingUp, badge: null },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-900 p-6 md:flex md:flex-col justify-between z-20">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 font-bold text-white shadow-lg shadow-indigo-500/20">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              Edu<span className="text-indigo-400">Mentor</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">AI Learning</span>
          </div>
        </div>

        <nav className="mt-8 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-left hover:border-slate-700 hover:bg-slate-800/50 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white group-hover:scale-105 transition">
              {studentName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">Signed in as</p>
              <p className="text-sm font-semibold text-white truncate">{studentName}</p>
            </div>
            <UserCircle className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition" />
          </div>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
