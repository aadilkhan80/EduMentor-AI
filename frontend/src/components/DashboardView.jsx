import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  Flame, 
  Clock, 
  ArrowRight, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function DashboardView({ 
  subjects, 
  weakTopics, 
  studyPlan, 
  quizHistory, 
  onNavigate, 
  onAskAI, 
  onStartQuizOnTopic,
  onToggleStudyItem,
  student
}) {
  const [quickQuestion, setQuickQuestion] = useState('');

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    onAskAI(quickQuestion);
    setQuickQuestion('');
  };

  const avgQuizScore = quizHistory.length 
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / quizHistory.length) 
    : 86;

  // Find lowest scoring weak topic
  const topCriticalWeakTopic = weakTopics[0];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* 1. Quick Stats */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat 
          title="Active Courses" 
          value={`${subjects.length}`} 
          icon={<BookOpen className="w-6 h-6 text-blue-400" />} 
          subtitle="4 curriculum subjects"
          onClick={() => onNavigate('Courses')}
        />
        <Stat 
          title="Avg Quiz Score" 
          value={`${avgQuizScore}%`} 
          icon={<Award className="w-6 h-6 text-amber-400" />} 
          subtitle="Based on recent tests"
          onClick={() => onNavigate('Quizzes')}
        />
        <Stat 
          title="Day Streak" 
          value={`${student.dayStreak || 7} 🔥`} 
          icon={<Flame className="w-6 h-6 text-orange-400" />} 
          subtitle="Consistent study habit"
        />
        <Stat 
          title="Today's Study Time" 
          value={`${student.studyMinutesToday || 42}m`} 
          icon={<Clock className="w-6 h-6 text-purple-400" />} 
          subtitle="Goal: 60 mins"
        />
      </section>

      {/* 2. Critical Weak Topic Banner (If weak topics detected) */}
      {topCriticalWeakTopic && (
        <section className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 uppercase">
                  Weak Topic Detected
                </span>
                <span className="text-xs text-slate-400">{topCriticalWeakTopic.subjectName}</span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1">
                {topCriticalWeakTopic.topicName} — Current Mastery: <span className="text-rose-400 font-extrabold">{topCriticalWeakTopic.score}%</span>
              </h4>
              <p className="text-sm text-slate-300 mt-0.5">
                Our AI engine noticed lower performance here. Reinforcing this now will boost your overall grade.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onStartQuizOnTopic(topCriticalWeakTopic.subjectName, topCriticalWeakTopic.topicName)}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
            >
              <span>Practice AI Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAskAI(`Explain ${topCriticalWeakTopic.topicName} in ${topCriticalWeakTopic.subjectName} with simple examples and key formulas.`)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
            >
              Ask AI to Explain
            </button>
          </div>
        </section>
      )}

      {/* 3. Your Subjects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Your Subjects</h3>
            <p className="text-xs text-slate-400">Click any subject to view detailed topic-level analysis</p>
          </div>
          <button 
            onClick={() => onNavigate('Courses')}
            className="flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {subjects.map((subject) => {
            const subjectWeakCount = subject.topics.filter(t => t.score < 60).length;
            return (
              <div
                key={subject.id || subject.name}
                onClick={() => onNavigate('Courses')}
                className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/90 p-5 transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-850 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-slate-800 border border-slate-700/60 p-3.5 text-2xl group-hover:scale-110 transition">
                    {subject.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base truncate group-hover:text-indigo-300 transition">
                        {subject.name}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {subject.code}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span>{subject.topics.length} Topics</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-200">{subject.progress}% Mastered</span>
                      {subjectWeakCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 font-medium">{subjectWeakCount} weak</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                </div>

                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        subject.progress >= 75
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : subject.progress >= 60
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Ask Your AI Mentor (Directly functional!) */}
      <section className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 p-6 shadow-xl shadow-indigo-950/30">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-indigo-500/20 p-4 text-3xl border border-indigo-500/30 shadow-inner">
            🤖
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Instant Academic Copilot
              </span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Ask your AI Mentor</h3>
            <p className="mt-1 text-sm text-slate-300">
              Get personalized explanations, solve doubts step-by-step, generate coding examples, and get exam tips.
            </p>

            <form onSubmit={handleQuickAsk} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                placeholder="Ask something like: Explain DBMS normalization or solve 0/1 Knapsack..."
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-500 hover:to-purple-500 transition shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center gap-2"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick suggested chips */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-medium py-1">Try asking:</span>
              {[
                "Explain DBMS normalization",
                "Transactions & ACID properties",
                "Dynamic programming memoization",
                "Difference between 2NF and 3NF"
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onAskAI(chip)}
                  className="rounded-lg bg-slate-800/90 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700/80 px-2.5 py-1 text-slate-300 hover:text-white transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Today's Study Goal & Personalized Plan Preview */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Goal Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Today's Study Goal</span>
                <span>🎯</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-300">
                70% Done
              </span>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>42 minutes completed</span>
                <span>60 min daily target</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                  style={{ width: '70%' }}
                />
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Recommendation:</span>
              </div>
              <p>
                Complete 18 more minutes on <strong>DBMS Normalization</strong> to hit your milestone target for today!
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('Study Plan')}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <span>View Full 7-Day Study Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Study Plan Items Checklist */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Current Milestone Checklist</h3>
              <p className="text-xs text-slate-400">Mark off items as you study to adapt your curriculum</p>
            </div>
            <button
              onClick={() => onNavigate('Study Plan')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Manage Plan →
            </button>
          </div>

          <div className="space-y-3">
            {studyPlan.slice(0, 4).map((item) => (
              <div
                key={item.day}
                onClick={() => onToggleStudyItem(item.day)}
                className={`cursor-pointer flex items-center justify-between p-3.5 rounded-xl border transition ${
                  item.completed
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                    : 'bg-slate-800/60 border-slate-700 hover:border-indigo-500/40 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase ${item.completed ? 'text-slate-500' : 'text-indigo-400'}`}>
                        Day {item.day}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{item.subject}</span>
                    </div>
                    <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {item.title}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium px-2 py-1 rounded bg-slate-800">
                    {item.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ title, value, icon, subtitle, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-indigo-500/40 hover:bg-slate-850' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/50">
          {icon}
        </div>
        {onClick && <span className="text-xs text-indigo-400 hover:underline">View</span>}
      </div>
      <p className="mt-3 text-xs font-medium text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-extrabold text-white tracking-tight">{value}</p>
      {subtitle && <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>}
    </div>
  );
}
