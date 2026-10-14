import React, { useState } from 'react';
import { AlertTriangle, Sliders, ArrowRight, Bot, Award, Sparkles, PlusCircle } from 'lucide-react';
import { EduService } from '../services/api';

export default function WeakAreasView({ 
  subjects, 
  onStartQuizOnTopic, 
  onAskAI, 
  onAddToStudyPlan 
}) {
  const [threshold, setThreshold] = useState(60);

  // Dynamically calculate weak topics based on the configurable threshold
  const weakTopics = EduService.getWeakTopics(subjects, threshold);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Title & Threshold Controller */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="text-2xl font-bold text-white">AI Weak Topic Detection Engine</h3>
          </div>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            EduMentor AI analyzes your historical quizzes, unit tests, and practice scores to isolate specific sub-topics where your performance falls below benchmark.
          </p>
        </div>

        {/* Configurable Threshold Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 min-w-[280px]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Benchmark Threshold
            </span>
            <span className="text-indigo-400 font-extrabold text-sm">{threshold}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="80"
            step="5"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>40% (Lenient)</span>
            <span>60% (Default)</span>
            <span>80% (Strict)</span>
          </div>
        </div>
      </div>

      {/* Detection Summary Banner */}
      <div className="flex items-center justify-between px-2 text-sm">
        <span className="text-slate-300 font-medium">
          Found <strong className="text-rose-400">{weakTopics.length} topics</strong> below the {threshold}% threshold:
        </span>
        <span className="text-xs text-slate-500">
          Updated dynamically from student performance data
        </span>
      </div>

      {/* Weak Topics Grid */}
      {weakTopics.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <h4 className="text-lg font-bold text-white">No Weak Topics Found!</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            All your syllabus topics are currently above your {threshold}% threshold. Increase the threshold if you want to aim for higher mastery!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {weakTopics.map((item) => {
            const deficit = threshold - item.score;
            const isCritical = item.score < 45;

            return (
              <div
                key={item.topicId}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.subjectName}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-1.5">{item.topicName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Difficulty Level: <span className="text-slate-300 font-medium">{item.difficulty}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {item.score}% Mastery
                    </span>
                    <p className="text-[11px] text-rose-400 font-semibold mt-1">
                      -{deficit}% from target
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>

                {/* AI Recommendation Pill */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>AI Recommendation:</strong> Review fundamental definitions and practice 4 focused multiple-choice questions to reinforce conceptual clarity.
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => onStartQuizOnTopic(item.subjectName, item.topicName)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Take AI Quiz</span>
                  </button>

                  <button
                    onClick={() => onAskAI(`Explain the weak topic "${item.topicName}" from ${item.subjectName}. I scored ${item.score}%. Provide step-by-step guidance on how to master this topic.`)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ask Mentor</span>
                  </button>

                  <button
                    onClick={() => onAddToStudyPlan(item)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition flex items-center gap-1.5"
                    title="Add directly to your study plan"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Add to Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
