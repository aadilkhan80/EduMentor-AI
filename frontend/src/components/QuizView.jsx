import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Bot, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { EduService } from '../services/api';

export default function QuizView({ 
  subjects, 
  initialSubject, 
  initialTopic, 
  quizHistory, 
  onQuizCompleted, 
  onAskAI 
}) {
  // Mode: 'setup' | 'taking' | 'results'
  const [mode, setMode] = useState('setup');
  
  // Setup parameters
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || subjects[0]?.name || 'Database Management (DBMS)');
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || 'Normalization (1NF, 2NF, 3NF, BCNF)');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { 0: optionIndex, 1: optionIndex }
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  // Results state
  const [results, setResults] = useState(null);

  // Update selected topic if subject changes
  const activeSubjectObj = subjects.find(s => s.name === selectedSubject) || subjects[0];
  
  useEffect(() => {
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialTopic) setSelectedTopic(initialTopic);
  }, [initialSubject, initialTopic]);

  // Quiz timer
  useEffect(() => {
    let timer = null;
    if (mode === 'taking' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (mode === 'taking' && timeLeft === 0) {
      handleSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  const handleStartQuiz = async () => {
    setIsGenerating(true);
    try {
      const generated = await EduService.generateQuizQuestions(selectedSubject, selectedTopic, difficulty, questionCount);
      setQuestions(generated);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setTimeLeft(questionCount * 45); // 45 seconds per question
      setMode('taking');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const scorePercentage = Math.round((correct / questions.length) * 100);
    const resultPayload = {
      subject: selectedSubject,
      topic: selectedTopic,
      difficulty,
      score: scorePercentage,
      correctCount: correct,
      incorrectCount: questions.length - correct,
      questionsCount: questions.length,
      answers: selectedAnswers,
      questions
    };

    setResults(resultPayload);
    setMode('results');

    // Persist to database & update topic mastery
    await onQuizCompleted(resultPayload);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* MODE 1: SETUP */}
      {mode === 'setup' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Award className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  AI Quiz Generator
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">Targeted Adaptive Assessment</h3>
              <p className="text-sm text-slate-300 max-w-2xl">
                Generate tailored multiple-choice tests with step-by-step AI explanations to evaluate and reinforce your weak subjects.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Configuration Form */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 lg:col-span-2">
              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Configure Your Quiz Parameters</span>
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      const sub = subjects.find(s => s.name === e.target.value);
                      if (sub && sub.topics[0]) setSelectedTopic(sub.topics[0].name);
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Topic / Concept</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {activeSubjectObj?.topics.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.score}% mastery)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                        difficulty === d
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Questions Count</label>
                <div className="flex gap-3">
                  {[3, 4, 5, 8].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition ${
                        questionCount === cnt
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartQuiz}
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span>Synthesizing Adaptive Questions...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      <span>Start AI Quiz Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Tips & Recent Tests */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
              <h4 className="font-bold text-white text-base">Recent Quizzes</h4>
              <div className="space-y-3">
                {quizHistory.slice(0, 4).map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{item.topic}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{item.subject} • {item.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${item.score >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: TAKING QUIZ */}
      {mode === 'taking' && questions[currentIndex] && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 max-w-3xl mx-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {selectedSubject} • {selectedTopic}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
              {questions[currentIndex].question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {questions[currentIndex].options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                </button>
              );
            })}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                <span>Submit & View Results</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: RESULTS & EXPLANATIONS */}
      {mode === 'results' && results && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Score Header Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-center space-y-4 shadow-xl">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Quiz Completed</span>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                Your Score: <span className={results.score >= 60 ? 'text-emerald-400' : 'text-rose-400'}>{results.score}%</span>
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {results.correctCount} correct out of {results.questionsCount} questions in {results.topic}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setMode('setup')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Take Another Quiz</span>
              </button>
              <button
                onClick={() => onAskAI(`I just completed a quiz on "${results.topic}" in ${results.subject} and scored ${results.score}%. Can you provide a breakdown of common mistakes and how to improve?`)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Ask AI Mentor About Mistakes</span>
              </button>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span>Detailed Question Review & AI Explanations</span>
            </h4>

            {results.questions.map((q, qIdx) => {
              const studentChoice = results.answers[qIdx];
              const isCorrect = studentChoice === q.correctAnswer;

              return (
                <div 
                  key={q.id || qIdx}
                  className={`p-5 rounded-2xl border transition ${
                    isCorrect
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-900/90 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="font-semibold text-white text-sm leading-relaxed">
                      {qIdx + 1}. {q.question}
                    </h5>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctAnswer;
                      const isOptionSelected = optIdx === studentChoice;

                      let optClass = 'bg-slate-950/60 border-slate-800/80 text-slate-400';
                      if (isOptionCorrect) {
                        optClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold';
                      } else if (isOptionSelected && !isCorrect) {
                        optClass = 'bg-rose-500/10 border-rose-500/40 text-rose-300 line-through';
                      }

                      return (
                        <div key={optIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${optClass}`}>
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {isOptionCorrect && <span className="text-[10px] uppercase font-bold text-emerald-400">Correct Answer</span>}
                          {isOptionSelected && !isCorrect && <span className="text-[10px] uppercase font-bold text-rose-400">Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Explanation Box */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Explanation:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
