import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { TrendingUp, Award, Target, BookOpen, AlertTriangle } from 'lucide-react';

export default function ProgressView({ subjects, quizHistory, studyPlan }) {
  // 1. Prepare Subject data for BarChart
  const subjectChartData = subjects.map(s => ({
    name: s.code || s.name.split(' ')[0],
    fullName: s.name,
    score: s.progress,
  }));

  // 2. Prepare Quiz timeline data for LineChart
  const quizTrendData = [...quizHistory].reverse().map((q, idx) => ({
    test: `Test ${idx + 1}`,
    score: q.score,
    topic: q.topic,
    subject: q.subject,
  }));

  // 3. Overall stats calculation
  const overallAvg = Math.round(
    subjects.reduce((acc, s) => acc + s.progress, 0) / (subjects.length || 1)
  );
  
  const completedPlanItems = studyPlan.filter(i => i.completed).length;
  const planCompletionRate = Math.round((completedPlanItems / (studyPlan.length || 1)) * 100);

  const bestSubject = [...subjects].sort((a, b) => b.progress - a.progress)[0];
  const lowestSubject = [...subjects].sort((a, b) => a.progress - b.progress)[0];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Overview Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Performance</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{overallAvg}%</p>
          <p className="text-xs text-emerald-400 font-medium">+6% improvement this month</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Strongest Subject</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white truncate">{bestSubject?.name || 'Python'}</p>
          <p className="text-xs text-slate-400">{bestSubject?.progress}% Mastery</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Needs Reinforcement</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-white truncate">{lowestSubject?.name || 'DSA'}</p>
          <p className="text-xs text-rose-400 font-medium">{lowestSubject?.progress}% Mastery</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Study Plan Execution</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{planCompletionRate}%</p>
          <p className="text-xs text-slate-400">{completedPlanItems} of {studyPlan.length} milestones cleared</p>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Subject Performance Comparison */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-base">Subject Mastery Breakdown</h4>
              <p className="text-xs text-slate-400">Comparative performance across syllabus domains</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">
              Benchmark: 60%
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Bar 
                  dataKey="score" 
                  fill="#6366f1" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Quiz Score Timeline */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-base">Quiz Score Trajectory</h4>
              <p className="text-xs text-slate-400">Chronological trend of your recent assessments</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-500/20 text-purple-300">
              Recent Tests
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="test" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  formatter={(value, name, item) => [`${value}% (${item.payload.topic})`, 'Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  dot={{ fill: '#c084fc', r: 5 }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Quizzes Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
        <h4 className="font-bold text-white text-base">Comprehensive Assessment Log</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Test ID</th>
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold">Topic Tested</th>
                <th className="pb-3 font-semibold">Questions</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quizHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-sm text-slate-400">
                    No quiz history yet. Complete a practice quiz to see your results here.
                  </td>
                </tr>
              ) : quizHistory.map(q => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 text-slate-400 font-mono">{q.id}</td>
                    <td className="py-3 font-medium text-white">{q.subject}</td>
                    <td className="py-3 text-slate-300">{q.topic}</td>
                    <td className="py-3 text-slate-400">{q.questionsCount || 4} MCQs</td>
                    <td className="py-3 font-bold text-white">
                      <span className={q.score >= 60 ? 'text-emerald-400' : 'text-rose-400'}>
                        {q.score}%
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{q.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        q.score >= 60 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {q.status || (q.score >= 60 ? 'Mastered' : 'Needs Review')}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
