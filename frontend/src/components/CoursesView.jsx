import React, { useEffect, useState } from 'react';
import { BookOpen, Search, ArrowRight, Bot, Award, AlertTriangle, CheckCircle, Plus, Pencil, X, Trash2, History } from 'lucide-react';
import { EduService } from '../services/api';

export default function CoursesView({
  subjects,
  onStartQuizOnTopic,
  onAskAI,
  onAddSubject,
  onSaveSubject,
  onRemoveSubject,
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 'sub_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  useEffect(() => {
    EduService.getSearchHistory()
      .then(setSearchHistory)
      .catch((error) => setSaveError(error.message));
  }, []);

  const filteredTopics = activeSubject?.topics.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const openEditor = (mode, topic) => {
    setSaveError('');
    setEditor({ mode, topic });
    if (mode === 'add-subject') {
      setForm({ name: '', code: '', icon: '📚' });
    } else if (mode === 'edit-subject') {
      setForm({ name: activeSubject.name, code: activeSubject.code, icon: activeSubject.icon });
    } else if (mode === 'add-topic') {
      setForm({ name: '', difficulty: 'Medium', score: 0 });
    } else {
      setForm({ name: topic.name, difficulty: topic.difficulty, score: topic.score });
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveError('');
    setIsSaving(true);
    try {
      if (editor.mode === 'add-subject') {
        const subject = {
          id: `sub_${Date.now()}`,
          name: form.name.trim(),
          code: form.code.trim(),
          icon: form.icon.trim() || '📚',
          progress: 0,
          topics: [],
        };
        await onAddSubject(subject);
        setSelectedSubjectId(subject.id);
      } else if (editor.mode === 'edit-subject') {
        await onSaveSubject({
          ...activeSubject,
          name: form.name.trim(),
          code: form.code.trim(),
          icon: form.icon.trim() || '📚',
        });
      } else {
        const topic = {
          ...(editor.mode === 'edit-topic' ? editor.topic : {}),
          id: editor.mode === 'edit-topic' ? editor.topic.id : `top_${Date.now()}`,
          name: form.name.trim(),
          difficulty: form.difficulty,
          score: Number(form.score),
          lastTested: editor.mode === 'edit-topic' ? editor.topic.lastTested : null,
        };
        const topics = editor.mode === 'edit-topic'
          ? activeSubject.topics.map((item) => item.id === topic.id ? topic : item)
          : [...activeSubject.topics, topic];
        const progress = topics.length
          ? Math.round(topics.reduce((total, item) => total + item.score, 0) / topics.length)
          : 0;
        await onSaveSubject({ ...activeSubject, topics, progress });
      }
      setEditor(null);
    } catch (error) {
      setSaveError(error.message || 'Could not save these learning details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSubject = async () => {
    if (!activeSubject || !window.confirm(`Remove "${activeSubject.name}" and all its learning topics?`)) return;
    setSaveError('');
    setIsRemoving(true);
    try {
      const updated = await onRemoveSubject(activeSubject.id);
      setSelectedSubjectId(updated[0]?.id || '');
    } catch (error) {
      setSaveError(error.message || 'Could not remove this subject.');
    } finally {
      setIsRemoving(false);
    }
  };

  const saveSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    try {
      setSearchHistory(await EduService.addSearchHistory(query));
      setIsSearchHistoryOpen(false);
      setSaveError('');
    } catch (error) {
      setSaveError(error.message || 'Could not save search history.');
    }
  };

  const removeSearch = async (entryId) => {
    try {
      setSearchHistory(await EduService.removeSearchHistory(entryId));
    } catch (error) {
      setSaveError(error.message || 'Could not remove this search.');
    }
  };

  const clearSearches = async () => {
    try {
      setSearchHistory(await EduService.clearSearchHistory());
    } catch (error) {
      setSaveError(error.message || 'Could not clear search history.');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Course Syllabus & Topic Mastery</h3>
          <p className="text-sm text-slate-400">
            Drill down into individual syllabus modules to track your understanding and practice targeted quizzes.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-72">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="search"
                placeholder="Search topic or concept..."
                value={searchQuery}
                onFocus={() => setIsSearchHistoryOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    saveSearch();
                  }
                  if (event.key === 'Escape') setIsSearchHistoryOpen(false);
                }}
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={saveSearch}
                aria-label="Save search"
                title="Save search"
                className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            {isSearchHistoryOpen && searchHistory.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <History className="h-3.5 w-3.5" /> Recent searches
                  </span>
                  <button type="button" onClick={clearSearches} className="text-xs text-rose-300 hover:text-rose-200">
                    Clear
                  </button>
                </div>
                {searchHistory.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(entry.query);
                        setIsSearchHistoryOpen(false);
                      }}
                      className="min-w-0 flex-1 truncate text-left text-sm text-slate-300"
                    >
                      {entry.query}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSearch(entry.id)}
                      aria-label={`Remove search ${entry.query}`}
                      className="rounded p-1 text-slate-500 hover:text-rose-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => openEditor('add-subject')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Add Subject
          </button>
        </div>
      </div>
      {saveError && !editor && <p role="alert" className="text-sm text-rose-300">{saveError}</p>}

      {/* Subject Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {subjects.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          const weakCount = sub.topics.filter(t => t.score < 60).length;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{sub.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {sub.code}
                </span>
              </div>
              <h4 className="font-bold text-white mt-3 text-sm truncate">{sub.name}</h4>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">{sub.progress}% Mastery</span>
                {weakCount > 0 && (
                  <span className="text-rose-400 font-semibold">{weakCount} weak</span>
                )}
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    sub.progress >= 75 ? 'bg-emerald-500' : sub.progress >= 60 ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${sub.progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-500" />
          <h4 className="mt-3 font-semibold text-white">No subjects yet</h4>
          <p className="mt-1 text-sm text-slate-400">Add a subject to start tracking your learning.</p>
        </div>
      )}

      {/* Topics List for Active Subject */}
      {activeSubject && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-xl bg-slate-800 border border-slate-700">
                {activeSubject.icon}
              </span>
              <div>
                <h4 className="text-xl font-bold text-white">{activeSubject.name}</h4>
                <p className="text-xs text-slate-400">
                  {activeSubject.topics.length} Syllabus Topics • Average Performance: {activeSubject.progress}%
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openEditor('edit-subject')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2"
              >
                <Pencil className="w-4 h-4 text-indigo-400" />
                <span>Edit Subject</span>
              </button>
              <button
                onClick={() => openEditor('add-topic')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Add Learning Topic</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveSubject}
                disabled={isRemoving}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-2 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isRemoving ? 'Removing…' : 'Remove Subject'}</span>
              </button>
              <button
                onClick={() => onAskAI(`Give me a summary and exam cheat sheet for the subject: ${activeSubject.name}`)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Subject AI Summary</span>
              </button>
            </div>
          </div>

          {/* Topics Table/Cards */}
          <div className="space-y-3 pt-2">
            {filteredTopics.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No topics found matching "{searchQuery}".
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const isWeak = topic.score < 60;
                const isStrong = topic.score >= 75;

                return (
                  <div
                    key={topic.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h5 className="font-semibold text-white text-base">{topic.name}</h5>
                        {isWeak && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Weak Area
                          </span>
                        )}
                        {isStrong && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Strong
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                        <span>Difficulty: <strong className="text-slate-300">{topic.difficulty}</strong></span>
                        <span>•</span>
                        <span>Last Tested: {topic.lastTested || 'Recent'}</span>
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-36">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-medium">Mastery</span>
                          <span className={`font-bold ${isWeak ? 'text-rose-400' : isStrong ? 'text-emerald-400' : 'text-indigo-400'}`}>
                            {topic.score}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              isWeak ? 'bg-rose-500' : isStrong ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditor('edit-topic', topic)}
                          aria-label={`Edit ${topic.name} learning details`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onStartQuizOnTopic(activeSubject.name, topic.name)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Practice Quiz</span>
                        </button>
                        <button
                          onClick={() => onAskAI(`Explain the concept of "${topic.name}" from ${activeSubject.name}. Provide a clear explanation, real-life examples, and common interview/exam traps.`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                        >
                          <Bot className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Ask AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editor.mode === 'add-subject' ? 'Add a subject' :
                    editor.mode === 'edit-subject' ? 'Edit subject details' :
                      editor.mode === 'add-topic' ? 'Add a learning topic' : 'Edit learning details'}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {editor.mode.includes('subject') ? 'Update the subject information.' : 'Update the topic and its mastery details.'}
                </p>
              </div>
              <button type="button" onClick={() => setEditor(null)} aria-label="Close editor" className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-300">
              {editor.mode.includes('subject') ? 'Subject name' : 'Topic name'}
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </label>

            {editor.mode.includes('subject') ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-slate-300">
                  Subject code
                  <input
                    required
                    value={form.code}
                    onChange={(event) => setForm({ ...form, code: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  Icon
                  <input
                    value={form.icon}
                    onChange={(event) => setForm({ ...form, icon: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-slate-300">
                  Difficulty
                  <select
                    value={form.difficulty}
                    onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    {['Easy', 'Medium', 'Hard'].map((level) => <option key={level}>{level}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  Mastery score (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.score}
                    onChange={(event) => setForm({ ...form, score: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </label>
              </div>
            )}

            {saveError && <p role="alert" className="text-sm text-rose-300">{saveError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditor(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
