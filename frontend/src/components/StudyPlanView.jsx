import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, Sparkles, RefreshCw, Bot, Award, Clock } from 'lucide-react';

export default function StudyPlanView({ 
  studyPlan, 
  weakTopics, 
  onToggleItem, 
  onRegeneratePlan, 
  onAskAI, 
  onStartQuizOnTopic 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('College Semester Exams');
  const [dailyTime, setDailyTime] = useState('60 mins');
  const [showConfig, setShowConfig] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const completedCount = studyPlan.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / studyPlan.length) * 100) || 0;
  const visiblePlan = selectedDay === null
    ? studyPlan
    : studyPlan.filter((item) => item.day === selectedDay);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onRegeneratePlan(weakTopics, selectedGoal);
    setIsGenerating(false);
    setShowConfig(false);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarDays className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Adaptive Learning Pathway
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">Personalized 7-Day Recovery Plan</h3>
          <p className="text-sm text-slate-300 max-w-2xl">
            Custom-tailored study agenda systematically addressing your weakest topics (<strong className="text-indigo-300">{weakTopics.map(w => w.topicName).slice(0, 2).join(', ')}</strong>) with spaced repetition and milestone tests.
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{showConfig ? 'Close Generator' : 'AI Re-Plan Pathway'}</span>
        </button>
      </div>

      {/* Plan Configuration Panel (Toggled) */}
      {showConfig && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Configure AI Study Plan Parameters</span>
            </h4>
            <span className="text-xs text-slate-400">Adapts to current weak topics</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Academic Goal</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="College Semester Exams">College Semester Exams</option>
                <option value="GATE Computer Science">GATE Computer Science</option>
                <option value="Technical Interview Prep">Technical Interview Prep</option>
                <option value="Remediate Weak Topics ASAP">Remediate Weak Topics ASAP</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Available Daily Study Time</label>
              <select
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="30 mins">30 mins / day (Express)</option>
                <option value="45 mins">45 mins / day (Standard)</option>
                <option value="60 mins">60 mins / day (Recommended)</option>
                <option value="90 mins">90 mins / day (Intensive)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Adaptive Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate New Study Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Metric Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan Execution</span>
          <h4 className="text-lg font-bold text-white mt-0.5">
            {completedCount} of {studyPlan.length} Days Completed ({progressPercent}%)
          </h4>
        </div>

        <div className="w-full sm:w-64">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Day by Day Plan Cards */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2" aria-label="Select a study plan day">
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            aria-pressed={selectedDay === null}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              selectedDay === null
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500/50'
            }`}
          >
            All days
          </button>
          {studyPlan.map((item) => (
            <button
              key={item.day}
              type="button"
              onClick={() => setSelectedDay(item.day)}
              aria-pressed={selectedDay === item.day}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                selectedDay === item.day
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : item.completed
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500/50'
              }`}
            >
              Day {item.day}
            </button>
          ))}
        </div>

        {visiblePlan.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
            No study plan days yet. Generate a plan to get started.
          </div>
        )}

        {visiblePlan.map((item) => (
          <div
            key={item.day}
            className={`p-5 rounded-2xl border transition-all ${
              item.completed
                ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 text-white shadow-md'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Checkbox & Details */}
              <div className="flex items-start gap-3.5 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleItem(item.day)}
                  className="mt-1 focus:outline-none"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-500 hover:text-indigo-400 transition" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded ${
                      item.completed ? 'bg-slate-800 text-slate-400' : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    }`}>
                      Day {item.day}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </span>
                  </div>

                  <h4 className={`text-base font-bold ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {item.title}
                  </h4>

                  {item.notes && (
                    <p className="text-xs text-slate-400 mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions for this Day */}
              <div className="flex items-center gap-2 pl-9 sm:pl-0">
                <button
                  onClick={() => onAskAI(`I am studying Day ${item.day} of my study plan: "${item.title}" (${item.topic} in ${item.subject}). Can you give me a structured tutorial with key concepts, code/examples, and revision tips?`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ask Mentor</span>
                </button>

                <button
                  onClick={() => onStartQuizOnTopic(item.subject, item.topic)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1 shadow-md shadow-indigo-600/20"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Quiz</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
