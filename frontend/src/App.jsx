import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CoursesView from './components/CoursesView';
import WeakAreasView from './components/WeakAreasView';
import StudyPlanView from './components/StudyPlanView';
import QuizView from './components/QuizView';
import AIMentorView from './components/AIMentorView';
import ProgressView from './components/ProgressView';
import ProfileModal from './components/ProfileModal';
import LoginView from './components/LoginView';
import { EduService, loadData } from './services/api';

export default function App() {
  const [active, setActive] = useState('Dashboard');
  const [session, setSession] = useState(() => loadData('auth_session', null));
  const [student, setStudent] = useState({
    id: 'std_01',
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    enrollmentNo: 'EDU-2026-084',
    grade: 'Computer Science (Sem 4)',
    targetExam: 'GATE & Semester Exams',
    dayStreak: 7,
    studyMinutesToday: 42,
    dailyGoalMinutes: 60,
  });
  const [subjects, setSubjects] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Drilldown states passed to other tabs
  const [quizTarget, setQuizTarget] = useState({ subject: '', topic: '' });
  const [mentorInitialQuery, setMentorInitialQuery] = useState('');

  // Load learning data only after a student signs in.
  useEffect(() => {
    if (!session) return;

    async function initData() {
      const p = await EduService.getStudentProfile();
      if (p) {
        setStudent({
          ...p,
          name: session.user?.name || p.name,
          email: session.user?.email || p.email,
        });
      }

      const s = await EduService.getSubjects();
      setSubjects(s);

      const pl = await EduService.getStudyPlan();
      setStudyPlan(pl);

      const q = await EduService.getQuizHistory();
      setQuizHistory(q);
    }
    initData();
  }, [session]);

  const weakTopics = EduService.getWeakTopics(subjects, 60);

  const handleLogin = async (email, password) => {
    const newSession = await EduService.login(email, password);
    setSession(newSession);
  };

  const handleRegister = async (name, email, password) => {
    const newSession = await EduService.register(name, email, password);
    setSession(newSession);
  };

  const handleLogout = () => {
    EduService.logout();
    setSession(null);
    setSubjects([]);
    setStudyPlan([]);
    setQuizHistory([]);
    setActive('Dashboard');
    setIsProfileOpen(false);
  };

  // Cross-module actions
  const handleAskAI = (question) => {
    setMentorInitialQuery(question);
    setActive('AI Mentor');
    setMobileMenuOpen(false);
  };

  const handleStartQuizOnTopic = (subject, topic) => {
    setQuizTarget({ subject, topic });
    setActive('Quizzes');
    setMobileMenuOpen(false);
  };

  const handleToggleStudyItem = (day) => {
    const updated = EduService.toggleStudyPlanItem(day);
    setStudyPlan(updated);
  };

  const handleRegeneratePlan = async (weakList, goal) => {
    const updated = await EduService.generateAIStudyPlan(weakList, goal);
    setStudyPlan(updated);
  };

  const handleQuizCompleted = async (resultPayload) => {
    await EduService.recordQuizResult(resultPayload);
    // Reload subjects & history to show updated mastery scores immediately
    const s = await EduService.getSubjects();
    setSubjects(s);
    const q = await EduService.getQuizHistory();
    setQuizHistory(q);
  };

  const handleAddToStudyPlan = (weakItem) => {
    const newDay = studyPlan.length + 1;
    const newItem = {
      day: newDay,
      title: `${weakItem.topicName} Targeted Review`,
      topic: weakItem.topicName,
      subject: weakItem.subjectName,
      duration: '45 mins',
      completed: false,
      notes: `Focus on overcoming ${weakItem.score}% mastery deficit.`
    };
    const updated = [...studyPlan, newItem];
    setStudyPlan(updated);
    setActive('Study Plan');
  };

  const handleSaveProfile = async (updatedProfile) => {
    setStudent(updatedProfile);
    await EduService.updateStudentProfile(updatedProfile);
  };

  const handleAddSubject = async (subject) => {
    const updated = await EduService.addSubject(subject);
    setSubjects(updated);
    return updated;
  };

  const handleSaveSubject = async (subject) => {
    const updated = await EduService.saveSubject(subject);
    setSubjects(updated);
    return updated;
  };

  const handleRemoveSubject = async (subjectId) => {
    const updated = await EduService.removeSubject(subjectId);
    setSubjects(updated);
    return updated;
  };

  if (!session) {
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar
        active={active}
        setActive={(view) => {
          setActive(view);
          setMobileMenuOpen(false);
        }}
        weakCount={weakTopics.length}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        studentName={student.name}
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm">
          <div className="w-64 h-full bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">
                  Edu<span className="text-indigo-400">Mentor AI</span>
                </h1>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <nav className="mt-8 space-y-2">
                {['Dashboard', 'Courses', 'Weak Areas', 'Study Plan', 'Quizzes', 'AI Mentor', 'Progress'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setActive(item);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left font-medium text-sm transition ${
                      active === item ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300"
              >
                Signed in as <strong className="text-white block mt-0.5">{student.name}</strong>
              </button>
              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:ml-64 flex flex-col min-h-screen">
        <Header 
          active={active}
          onOpenProfile={() => setIsProfileOpen(true)}
          onLogout={handleLogout}
          streak={student.dayStreak || 7}
          studentName={student.name}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <div className="flex-1 pb-12">
          {active === 'Dashboard' && (
            <DashboardView
              subjects={subjects}
              weakTopics={weakTopics}
              studyPlan={studyPlan}
              quizHistory={quizHistory}
              onNavigate={(view) => setActive(view)}
              onAskAI={handleAskAI}
              onStartQuizOnTopic={handleStartQuizOnTopic}
              onToggleStudyItem={handleToggleStudyItem}
              student={student}
            />
          )}

          {active === 'Courses' && (
            <CoursesView
              subjects={subjects}
              onStartQuizOnTopic={handleStartQuizOnTopic}
              onAskAI={handleAskAI}
              onAddSubject={handleAddSubject}
              onSaveSubject={handleSaveSubject}
              onRemoveSubject={handleRemoveSubject}
            />
          )}

          {active === 'Weak Areas' && (
            <WeakAreasView
              subjects={subjects}
              onStartQuizOnTopic={handleStartQuizOnTopic}
              onAskAI={handleAskAI}
              onAddToStudyPlan={handleAddToStudyPlan}
            />
          )}

          {active === 'Study Plan' && (
            <StudyPlanView
              studyPlan={studyPlan}
              weakTopics={weakTopics}
              onToggleItem={handleToggleStudyItem}
              onRegeneratePlan={handleRegeneratePlan}
              onAskAI={handleAskAI}
              onStartQuizOnTopic={handleStartQuizOnTopic}
            />
          )}

          {active === 'Quizzes' && (
            <QuizView
              subjects={subjects}
              initialSubject={quizTarget.subject}
              initialTopic={quizTarget.topic}
              quizHistory={quizHistory}
              onQuizCompleted={handleQuizCompleted}
              onAskAI={handleAskAI}
            />
          )}

          {active === 'AI Mentor' && (
            <AIMentorView
              initialQuestion={mentorInitialQuery}
              onStartQuizOnTopic={handleStartQuizOnTopic}
            />
          )}

          {active === 'Progress' && (
            <ProgressView
              subjects={subjects}
              quizHistory={quizHistory}
              studyPlan={studyPlan}
            />
          )}
        </div>
      </main>

      {/* Student Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        student={student}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
