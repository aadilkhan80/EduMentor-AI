import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const session = loadData('auth_session', null);
  if (session?.accessToken && session.accessToken !== 'demo-session') {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Initial mock state stored in localStorage for instant offline/demo capability
const DEFAULT_STUDENT = {
  id: 'std_01',
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  enrollmentNo: 'EDU-2026-084',
  grade: 'Computer Science & Engineering (Sem 4)',
  targetExam: 'GATE & Semester Exams',
  dayStreak: 7,
  studyMinutesToday: 42,
  dailyGoalMinutes: 60,
  overallScore: 78,
};

const DEFAULT_SUBJECTS = [
  {
    id: 'sub_1',
    name: 'Database Management (DBMS)',
    code: 'CS301',
    icon: '🗄️',
    progress: 65,
    topics: [
      { id: 'top_1', name: 'SQL & Relational Algebra', score: 82, difficulty: 'Medium', lastTested: '2026-09-25' },
      { id: 'top_2', name: 'ER Modeling & Relational Design', score: 76, difficulty: 'Easy', lastTested: '2026-09-24' },
      { id: 'top_3', name: 'Normalization (1NF, 2NF, 3NF, BCNF)', score: 42, difficulty: 'Hard', lastTested: '2026-09-28' },
      { id: 'top_4', name: 'Transactions & Concurrency Control', score: 48, difficulty: 'Hard', lastTested: '2026-09-27' },
      { id: 'top_5', name: 'Indexing & B-Trees', score: 70, difficulty: 'Medium', lastTested: '2026-09-20' },
    ],
  },
  {
    id: 'sub_2',
    name: 'Data Structures & Algorithms (DSA)',
    code: 'CS302',
    icon: '💻',
    progress: 58,
    topics: [
      { id: 'top_6', name: 'Arrays & Two Pointers', score: 85, difficulty: 'Easy', lastTested: '2026-09-26' },
      { id: 'top_7', name: 'Trees & Binary Search Trees', score: 68, difficulty: 'Medium', lastTested: '2026-09-23' },
      { id: 'top_8', name: 'Dynamic Programming & Memoization', score: 38, difficulty: 'Hard', lastTested: '2026-09-29' },
      { id: 'top_9', name: 'Graph Algorithms (BFS/DFS, Dijkstra)', score: 50, difficulty: 'Hard', lastTested: '2026-09-25' },
    ],
  },
  {
    id: 'sub_3',
    name: 'Python Programming',
    code: 'CS204',
    icon: '🐍',
    progress: 82,
    topics: [
      { id: 'top_10', name: 'Data Types & Control Flow', score: 92, difficulty: 'Easy', lastTested: '2026-09-21' },
      { id: 'top_11', name: 'OOP & Classes', score: 84, difficulty: 'Medium', lastTested: '2026-09-22' },
      { id: 'top_12', name: 'Decorators & Generators', score: 70, difficulty: 'Hard', lastTested: '2026-09-24' },
    ],
  },
  {
    id: 'sub_4',
    name: 'Discrete Mathematics',
    code: 'MA201',
    icon: '📐',
    progress: 74,
    topics: [
      { id: 'top_13', name: 'Propositional Logic', score: 88, difficulty: 'Easy', lastTested: '2026-09-18' },
      { id: 'top_14', name: 'Combinatorics & Probability', score: 72, difficulty: 'Medium', lastTested: '2026-09-19' },
      { id: 'top_15', name: 'Recurrence Relations', score: 55, difficulty: 'Hard', lastTested: '2026-09-23' },
    ],
  },
];

const DEFAULT_STUDY_PLAN = [
  { day: 1, title: 'Normalization Basics & Functional Dependencies', topic: 'Normalization', subject: 'DBMS', duration: '45 mins', completed: true, notes: 'Cover 1NF and 2NF criteria with practical table breakdowns.' },
  { day: 2, title: '3NF & BCNF Decomposition Techniques', topic: 'Normalization', subject: 'DBMS', duration: '50 mins', completed: true, notes: 'Focus on dependency preservation and lossless joins.' },
  { day: 3, title: 'Dynamic Programming: 1D Memoization', topic: 'Dynamic Programming', subject: 'DSA', duration: '60 mins', completed: false, notes: 'Solve Fibonacci, Climbing Stairs, and Coin Change.' },
  { day: 4, title: 'ACID Properties & Transaction Schedules', topic: 'Transactions', subject: 'DBMS', duration: '45 mins', completed: false, notes: 'Study Serializability, Conflict Serializability & Precedence graphs.' },
  { day: 5, title: 'Graph Traversal (BFS & DFS Masterclass)', topic: 'Graph Algorithms', subject: 'DSA', duration: '50 mins', completed: false, notes: 'Implement cycle detection in directed and undirected graphs.' },
  { day: 6, title: 'Weak-Topic Practice & Doubt Clearance', topic: 'Mixed Weak Topics', subject: 'All', duration: '40 mins', completed: false, notes: 'Consult AI Mentor on failed practice quiz questions.' },
  { day: 7, title: 'Full Adaptive Milestone Assessment', topic: 'Comprehensive Test', subject: 'DBMS + DSA', duration: '60 mins', completed: false, notes: 'Take 20-question AI milestone quiz to re-evaluate weak status.' },
];

const DEFAULT_QUIZZES_HISTORY = [
  { id: 'q_101', subject: 'DBMS', topic: 'Normalization', score: 40, total: 100, date: '2026-09-28', status: 'Needs Review', questionsCount: 5 },
  { id: 'q_102', subject: 'DSA', topic: 'Dynamic Programming', score: 45, total: 100, date: '2026-09-27', status: 'Needs Review', questionsCount: 5 },
  { id: 'q_103', subject: 'Python', topic: 'OOP & Classes', score: 88, total: 100, date: '2026-09-25', status: 'Mastered', questionsCount: 5 },
  { id: 'q_104', subject: 'DBMS', topic: 'SQL Queries & Joins', score: 82, total: 100, date: '2026-09-24', status: 'Mastered', questionsCount: 5 },
];

// Helper to safely load / save from localStorage
export const loadData = (key, fallback) => {
  try {
    const item = localStorage.getItem(`edumentor_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const saveData = (key, data) => {
  try {
    localStorage.setItem(`edumentor_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

const currentUserId = () => loadData('auth_session', null)?.user?.id || 'guest';
const historyStorageKey = (type) => `${type}_${currentUserId()}`;

// API Services with automatic backend sync & mock resilience
export const EduService = {
  register: async (name, email, password) => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      const session = { accessToken: res.data.access_token, user: res.data.user };
      saveData('auth_session', session);
      return session;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Account creation is unavailable. Make sure the backend is running and try again.');
    }
  },

  login: async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const session = { accessToken: res.data.access_token, user: res.data.user };
      saveData('auth_session', session);
      return session;
    } catch (error) {
      if (error.response || email !== DEFAULT_STUDENT.email || password !== 'password123') {
        throw new Error(error.response?.data?.detail || 'Invalid email or password.');
      }

      const session = {
        accessToken: 'demo-session',
        user: {
          id: DEFAULT_STUDENT.id,
          name: DEFAULT_STUDENT.name,
          email: DEFAULT_STUDENT.email,
          role: 'student',
        },
      };
      saveData('auth_session', session);
      return session;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('edumentor_auth_session');
    } catch (error) {
      console.error('Unable to clear the signed-in session', error);
    }
  },

  getSearchHistory: async () => {
    try {
      const res = await apiClient.get('/history/search');
      saveData(historyStorageKey('search_history'), res.data);
      return res.data;
    } catch (error) {
      if (error.response) throw new Error(error.response.data?.detail || 'Could not load search history.');
      return loadData(historyStorageKey('search_history'), []);
    }
  },

  addSearchHistory: async (query) => {
    const cached = loadData(historyStorageKey('search_history'), []);
    try {
      const res = await apiClient.post('/history/search', { query });
      const updated = [res.data, ...cached.filter((item) => item.query !== query)].slice(0, 50);
      saveData(historyStorageKey('search_history'), updated);
      return updated;
    } catch (error) {
      if (error.response) throw new Error(error.response.data?.detail || 'Could not save search history.');
      const entry = { id: `search_${Date.now()}`, query, createdAt: new Date().toISOString() };
      const updated = [entry, ...cached.filter((item) => item.query !== query)].slice(0, 50);
      saveData(historyStorageKey('search_history'), updated);
      return updated;
    }
  },

  removeSearchHistory: async (entryId) => {
    const cached = loadData(historyStorageKey('search_history'), []);
    try {
      await apiClient.delete(`/history/search/${encodeURIComponent(entryId)}`);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        throw new Error(error.response.data?.detail || 'Could not remove this search.');
      }
    }
    const updated = cached.filter((item) => item.id !== entryId);
    saveData(historyStorageKey('search_history'), updated);
    return updated;
  },

  clearSearchHistory: async () => {
    try {
      await apiClient.delete('/history/search');
    } catch (error) {
      if (error.response) throw new Error(error.response.data?.detail || 'Could not clear search history.');
    }
    saveData(historyStorageKey('search_history'), []);
    return [];
  },

  getAIHistory: async () => {
    try {
      const res = await apiClient.get('/ai/history');
      saveData(historyStorageKey('ai_history'), res.data);
      return res.data;
    } catch (error) {
      if (error.response) throw new Error(error.response.data?.detail || 'Could not load AI history.');
      return loadData(historyStorageKey('ai_history'), []);
    }
  },

  saveAIExchange: async (question, answer) => {
    const cached = loadData(historyStorageKey('ai_history'), []);
    try {
      await apiClient.post('/ai/history', { question, answer });
      const createdAt = new Date().toISOString();
      const updated = [
        ...cached,
        { id: `chat_user_${Date.now()}`, role: 'user', content: question, createdAt },
        { id: `chat_assistant_${Date.now()}`, role: 'assistant', content: answer, createdAt },
      ];
      saveData(historyStorageKey('ai_history'), updated);
      return updated;
    } catch (error) {
      if (error.response) throw new Error(error.response.data?.detail || 'Could not save AI history.');
      const createdAt = new Date().toISOString();
      const updated = [
        ...cached,
        { id: `chat_user_${Date.now()}`, role: 'user', content: question, createdAt },
        { id: `chat_assistant_${Date.now()}`, role: 'assistant', content: answer, createdAt },
      ];
      saveData(historyStorageKey('ai_history'), updated);
      return updated;
    }
  },

  clearAIHistory: async () => {
    try {
      await apiClient.delete('/ai/history');
    } catch (error) {
      if (error.response) throw new Error(error.response.data?.detail || 'Could not clear AI history.');
    }
    saveData(historyStorageKey('ai_history'), []);
    return [];
  },

  // Student
  getStudentProfile: async () => {
    try {
      const res = await apiClient.get('/students/me');
      return res.data;
    } catch {
      return loadData('student', DEFAULT_STUDENT);
    }
  },

  updateStudentProfile: async (profile) => {
    saveData('student', profile);
    try {
      await apiClient.put('/students/me', profile);
    } catch {}
    return profile;
  },

  // Subjects & Topics
  getSubjects: async () => {
    try {
      const res = await apiClient.get('/subjects');
      const cachedSubjects = loadData('subjects', null);
      const deletedSubjectIds = new Set(loadData('deleted_subject_ids', []));
      if (!Array.isArray(cachedSubjects)) {
        const subjects = res.data.filter((subject) => !deletedSubjectIds.has(subject.id));
        saveData('subjects', subjects);
        return subjects;
      }

      const mergedSubjects = res.data.filter((subject) => !deletedSubjectIds.has(subject.id));
      cachedSubjects.forEach((cachedSubject) => {
        if (deletedSubjectIds.has(cachedSubject.id)) return;
        const index = mergedSubjects.findIndex((subject) => subject.id === cachedSubject.id);
        if (index === -1) {
          mergedSubjects.push(cachedSubject);
        } else {
          mergedSubjects[index] = cachedSubject;
        }
      });
      saveData('subjects', mergedSubjects);
      return mergedSubjects;
    } catch {
      const deletedSubjectIds = new Set(loadData('deleted_subject_ids', []));
      const subjects = loadData('subjects', DEFAULT_SUBJECTS)
        .filter((subject) => !deletedSubjectIds.has(subject.id));
      saveData('subjects', subjects);
      return subjects;
    }
  },

  addSubject: async (subject) => {
    const subjects = loadData('subjects', DEFAULT_SUBJECTS);
    const deletedSubjectIds = loadData('deleted_subject_ids', []);
    try {
      const res = await apiClient.post('/subjects', subject);
      const updated = [...subjects.filter((item) => item.id !== res.data.id), res.data];
      saveData('deleted_subject_ids', deletedSubjectIds.filter((id) => id !== res.data.id));
      saveData('subjects', updated);
      return updated;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Could not add this subject.');
      }
      const updated = [...subjects, subject];
      saveData('deleted_subject_ids', deletedSubjectIds.filter((id) => id !== subject.id));
      saveData('subjects', updated);
      return updated;
    }
  },

  saveSubject: async (subject) => {
    const subjects = loadData('subjects', DEFAULT_SUBJECTS);
    try {
      const res = await apiClient.put(`/subjects/${encodeURIComponent(subject.id)}`, subject);
      const updated = subjects.map((item) => item.id === subject.id ? res.data : item);
      saveData('subjects', updated);
      return updated;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Could not update this subject.');
      }
      const updated = subjects.map((item) => item.id === subject.id ? subject : item);
      saveData('subjects', updated);
      return updated;
    }
  },

  removeSubject: async (subjectId) => {
    const subjects = loadData('subjects', DEFAULT_SUBJECTS);
    const deletedSubjectIds = loadData('deleted_subject_ids', []);
    try {
      await apiClient.delete(`/subjects/${encodeURIComponent(subjectId)}`);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        throw new Error(error.response.data?.detail || 'Could not remove this subject.');
      }
    }

    saveData('deleted_subject_ids', [...new Set([...deletedSubjectIds, subjectId])]);
    const updated = subjects.filter((subject) => subject.id !== subjectId);
    saveData('subjects', updated);
    return updated;
  },

  // Weak Topic Detection Engine (Calculates topics < threshold)
  getWeakTopics: (subjects, threshold = 60) => {
    const weakList = [];
    subjects.forEach((sub) => {
      sub.topics.forEach((top) => {
        if (top.score < threshold) {
          weakList.push({
            subjectName: sub.name,
            subjectCode: sub.code,
            topicId: top.id,
            topicName: top.name,
            score: top.score,
            difficulty: top.difficulty,
            severity: top.score < 45 ? 'Critical' : 'Moderate',
          });
        }
      });
    });
    return weakList.sort((a, b) => a.score - b.score);
  },

  // Study Plan
  getStudyPlan: async () => {
    try {
      const res = await apiClient.get('/study-plans/current');
      return res.data;
    } catch {
      return loadData('study_plan', DEFAULT_STUDY_PLAN);
    }
  },

  toggleStudyPlanItem: (day) => {
    const plan = loadData('study_plan', DEFAULT_STUDY_PLAN);
    const updated = plan.map((item) =>
      item.day === day ? { ...item, completed: !item.completed } : item
    );
    saveData('study_plan', updated);
    return updated;
  },

  generateAIStudyPlan: async (weakTopics, targetGoal = 'Exam Preparation') => {
    try {
      const res = await apiClient.post('/study-plans/generate', { weakTopics, targetGoal });
      saveData('study_plan', res.data);
      return res.data;
    } catch {
      // Dynamic client-side generator based on current weak topics
      const generated = [
        { day: 1, title: `${weakTopics[0]?.topicName || 'Core Concept'} Diagnostics & Foundations`, topic: weakTopics[0]?.topicName || 'Foundations', subject: weakTopics[0]?.subjectName || 'General', duration: '45 mins', completed: false, notes: 'Read introductory notes and identify critical gaps.' },
        { day: 2, title: `${weakTopics[0]?.topicName || 'Concept'} Solved Problems & Examples`, topic: weakTopics[0]?.topicName || 'Examples', subject: weakTopics[0]?.subjectName || 'General', duration: '50 mins', completed: false, notes: 'Follow step-by-step problem walkthroughs.' },
        { day: 3, title: `${weakTopics[1]?.topicName || 'Secondary Weak Topic'} Deep Dive`, topic: weakTopics[1]?.topicName || 'Advanced', subject: weakTopics[1]?.subjectName || 'General', duration: '55 mins', completed: false, notes: 'Focus on theoretical rules and structural nuances.' },
        { day: 4, title: 'Hands-on Practice & Algorithm Tracing', topic: 'Practice Drills', subject: 'Core', duration: '60 mins', completed: false, notes: 'Work through 5 standard textbook problems without looking at solutions.' },
        { day: 5, title: 'Interactive AI Mentor Doubt Clearing Session', topic: 'Doubt Solver', subject: 'All', duration: '40 mins', completed: false, notes: 'Ask EduMentor AI on any steps that felt ambiguous.' },
        { day: 6, title: 'Timed Practice Quiz Simulation', topic: 'Quiz Prep', subject: 'Weak Areas', duration: '45 mins', completed: false, notes: 'Take a generated 10-question quiz under exam conditions.' },
        { day: 7, title: 'Milestone Review & Progress Re-Evaluation', topic: 'Milestone Assessment', subject: 'All Weak Topics', duration: '60 mins', completed: false, notes: 'Verify score progression to update mastery threshold.' },
      ];
      saveData('study_plan', generated);
      return generated;
    }
  },

  // Quizzes
  getQuizHistory: async () => {
    try {
      const res = await apiClient.get('/quizzes/history');
      saveData(historyStorageKey('quiz_history'), res.data);
      return res.data;
    } catch (error) {
      if (error.response) throw new Error(error.response.data?.detail || 'Could not load quiz history.');
      return loadData(
        historyStorageKey('quiz_history'),
        currentUserId() === 'std_01' ? DEFAULT_QUIZZES_HISTORY : [],
      );
    }
  },

  generateQuizQuestions: async (subject, topic, difficulty, count = 4) => {
    try {
      const res = await apiClient.post('/quizzes/generate', { subject, topic, difficulty, count });
      return res.data;
    } catch {
      // High quality curated dynamic quiz bank for immediate flawless demonstration
      const bank = {
        Normalization: [
          {
            id: 1,
            question: "Which normal form requires eliminating partial functional dependencies on a composite primary key?",
            options: ["1NF", "2NF", "3NF", "BCNF"],
            correctAnswer: 1, // 2NF
            explanation: "Second Normal Form (2NF) enforces that every non-prime attribute must be fully functionally dependent on the primary key, eliminating partial dependencies."
          },
          {
            id: 2,
            question: "A relation is in 3NF if it is in 2NF and has no:",
            options: ["Multivalued dependencies", "Transitive dependencies", "Partial dependencies", "Trivial functional dependencies"],
            correctAnswer: 1, // Transitive
            explanation: "3NF requires that no non-prime attribute is transitively dependent on the primary key (X -> Y and Y -> Z where Z is non-prime)."
          },
          {
            id: 3,
            question: "In Boyce-Codd Normal Form (BCNF), for every functional dependency X -> Y, X must be a:",
            options: ["Candidate Key / Super Key", "Foreign Key", "Prime Attribute", "Non-prime Attribute"],
            correctAnswer: 0,
            explanation: "BCNF is a stricter version of 3NF where for every non-trivial functional dependency X -> Y, X must be a super key."
          },
          {
            id: 4,
            question: "Which anomaly occurs when deleting one piece of data inadvertently deletes unrelated required information?",
            options: ["Update Anomaly", "Insertion Anomaly", "Deletion Anomaly", "Read Anomaly"],
            correctAnswer: 2,
            explanation: "A Deletion Anomaly happens when unintended loss of data occurs upon deleting a record due to poor database normalization."
          }
        ],
        Transactions: [
          {
            id: 1,
            question: "Which ACID property guarantees that all operations in a transaction are completed or none are?",
            options: ["Atomicity", "Consistency", "Isolation", "Durability"],
            correctAnswer: 0,
            explanation: "Atomicity ensures 'all-or-nothing' execution. If a transaction fails midway, all prior changes are rolled back."
          },
          {
            id: 2,
            question: "A precedence graph is used to test for which type of serializability?",
            options: ["View Serializability", "Conflict Serializability", "Recoverability", "Cascadelessness"],
            correctAnswer: 1,
            explanation: "A cycle in a precedence (serialization) graph indicates that the schedule is NOT conflict serializable."
          },
          {
            id: 3,
            question: "Two-Phase Locking (2PL) protocol guarantees:",
            options: ["Deadlock freedom", "Conflict Serializability", "No starvation", "Zero latency"],
            correctAnswer: 1,
            explanation: "Standard 2PL guarantees conflict serializability, though it can still lead to potential deadlocks."
          },
          {
            id: 4,
            question: "Which isolation level prevents Dirty Reads but still allows Non-repeatable Reads?",
            options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
            correctAnswer: 1,
            explanation: "Read Committed only allows reading data committed by other transactions, preventing dirty reads."
          }
        ],
        "Dynamic Programming": [
          {
            id: 1,
            question: "What are the two essential characteristics of problems solved by Dynamic Programming?",
            options: ["Greedy choice & divide-and-conquer", "Optimal substructure & overlapping subproblems", "Linear recursion & backtracking", "Heuristic search & memoization"],
            correctAnswer: 1,
            explanation: "DP requires optimal substructure (optimal solution to problem contains optimal solutions to subproblems) and overlapping subproblems."
          },
          {
            id: 2,
            question: "Top-down Dynamic Programming is commonly referred to as:",
            options: ["Tabulation", "Memoization", "Branch and Bound", "Divide and Conquer"],
            correctAnswer: 1,
            explanation: "Top-down DP uses recursion along with a cache (memoization table) to avoid recomputing solved subproblems."
          },
          {
            id: 3,
            question: "What is the time complexity of the classic 0/1 Knapsack problem using DP with N items and W capacity?",
            options: ["O(2^N)", "O(N * W)", "O(N log W)", "O(W^2)"],
            correctAnswer: 1,
            explanation: "The standard 2D DP matrix computes states of size N x W, giving pseudo-polynomial time O(N * W)."
          },
          {
            id: 4,
            question: "In the Longest Common Subsequence (LCS) of strings of lengths M and N, the space complexity can be optimized to:",
            options: ["O(1)", "O(min(M, N))", "O(M * N)", "O(M + N)"],
            correctAnswer: 1,
            explanation: "Because the current state only depends on the previous row/column, space can be reduced to O(min(M, N))."
          }
        ],
        General: [
          {
            id: 1,
            question: "What is the primary benefit of modular code architecture?",
            options: ["Higher memory usage", "Separation of concerns & maintainability", "Faster network latency", "Elimination of databases"],
            correctAnswer: 1,
            explanation: "Modular architecture separates system concerns into independent, testable, and maintainable units."
          },
          {
            id: 2,
            question: "Which data structure follows First-In, First-Out (FIFO) semantics?",
            options: ["Stack", "Queue", "Heap", "Binary Tree"],
            correctAnswer: 1,
            explanation: "A Queue processes elements in the exact order they arrived (FIFO)."
          },
          {
            id: 3,
            question: "In relational algebra, which operator selects rows that satisfy a specified predicate?",
            options: ["Projection (π)", "Selection (σ)", "Cartesian Product (×)", "Join (⨝)"],
            correctAnswer: 1,
            explanation: "Selection (sigma σ) filters tuples (rows) meeting the given condition."
          },
          {
            id: 4,
            question: "What is the average time complexity of searching an element in a Hash Table?",
            options: ["O(log N)", "O(N)", "O(1)", "O(N log N)"],
            correctAnswer: 2,
            explanation: "With a uniform hash function and low load factor, search runs in O(1) expected time."
          }
        ]
      };

      const matchedKey = Object.keys(bank).find(k => topic.toLowerCase().includes(k.toLowerCase())) || 'General';
      return bank[matchedKey] || bank.General;
    }
  },

  recordQuizResult: async (quizData) => {
    // Record in history
    const history = loadData(
      historyStorageKey('quiz_history'),
      currentUserId() === 'std_01' ? DEFAULT_QUIZZES_HISTORY : [],
    );
    const newEntry = {
      id: `q_${Date.now()}`,
      subject: quizData.subject,
      topic: quizData.topic,
      score: quizData.score,
      total: 100,
      date: new Date().toISOString().split('T')[0],
      status: quizData.score >= 60 ? 'Mastered' : 'Needs Review',
      questionsCount: quizData.questionsCount,
    };
    history.unshift(newEntry);
    saveData(historyStorageKey('quiz_history'), history);

    // Update topic score in subjects
    const subjects = loadData('subjects', DEFAULT_SUBJECTS);
    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        if (t.name.toLowerCase().includes(quizData.topic.toLowerCase()) || quizData.topic.toLowerCase().includes(t.name.toLowerCase())) {
          // Weighted update: 60% new score + 40% previous score
          t.score = Math.round(t.score * 0.4 + quizData.score * 0.6);
          t.lastTested = newEntry.date;
        }
      });
      // Recalculate subject overall progress
      const avg = Math.round(s.topics.reduce((acc, cur) => acc + cur.score, 0) / s.topics.length);
      s.progress = avg;
    });
    saveData('subjects', subjects);

    try {
      await apiClient.post('/quizzes/results', quizData);
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Quiz result could not be saved.');
      }
    }

    return newEntry;
  },

  // AI Mentor Chat
  askAIMentor: async (question, chatHistory = []) => {
    try {
      const res = await apiClient.post('/ai/ask', { question, history: chatHistory });
      return res.data.answer;
    } catch {
      // Smart contextual academic responses generator for instant responsiveness
      const q = question.toLowerCase();

      if (q.includes('normalization') || q.includes('dbms')) {
        return `### 🗄️ Database Normalization Explained

**Normalization** is the systematic process of organizing data in a relational database to **reduce redundancy** and **prevent update anomalies** (insertion, deletion, update).

---

#### 1. First Normal Form (1NF)
- **Rule**: Every column must hold atomic (indivisible) values.
- **Rule**: No repeating groups or arrays.

#### 2. Second Normal Form (2NF)
- **Rule**: Must be in 1NF.
- **Rule**: No **partial dependency** — all non-key attributes must depend on the *entire* candidate key (important when primary key is composite).

#### 3. Third Normal Form (3NF)
- **Rule**: Must be in 2NF.
- **Rule**: No **transitive dependency** ($X \\rightarrow Y$ and $Y \\rightarrow Z$). Non-key attributes must depend *only* on the primary key.

#### 4. Boyce-Codd Normal Form (BCNF)
- **Rule**: Stricter 3NF. For every non-trivial functional dependency $X \\rightarrow Y$, $X$ **must be a Super Key**.

---

💡 **Practice Question for you:**  
*If a table has Primary Key (StudentID, CourseID) and an attribute InstructorOffice, which depends only on InstructorName (who depends on CourseID), which normal form does it violate?*  
*(Answer: 3NF due to transitive dependency!)*`;
      }

      if (q.includes('transaction') || q.includes('acid')) {
        return `### ⚡ ACID Properties in DBMS

Transactions guarantee reliability in multi-user databases through four foundational properties:

1. **Atomicity (All or Nothing)**:  
   If step 3 of a 5-step bank transfer crashes, all modifications are automatically rolled back.
2. **Consistency (Preserving Invariants)**:  
   Total money before and after transfer must remain identical.
3. **Isolation (Concurrent Execution)**:  
   Intermediate states of one transaction are hidden from others until committed.
4. **Durability (Permanence)**:  
   Once a transaction commits, data survives even unexpected power failure.

> 💡 **Quick Tip for Ideathon/Exams**: Use a Precedence Graph (Serialization Graph) to test Conflict Serializability. If the graph has a cycle, the schedule is **not** conflict serializable.`;
      }

      if (q.includes('dynamic programming') || q.includes('dp')) {
        return `### 🧠 Dynamic Programming (DP) Blueprint

Dynamic Programming is simply **recursion with a notebook (memoization)** to solve problems with overlapping subproblems and optimal substructure.

#### The 4-Step Recipe:
1. **Define the State**: What variables describe a subproblem? (e.g. \`dp[i]\` = max profit up to day \`i\`)
2. **Formulate the Recurrence Relation**: Transition from smaller subproblems to larger ones.
3. **Identify Base Cases**: What is the value when \`i = 0\` or \`n = 1\`?
4. **Determine Evaluation Order**: Top-down (memoization) or Bottom-up (tabulation).

\`\`\`python
# Example: Classic Fibonacci with Memoization
memo = {}
def fib(n):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]
\`\`\`

Would you like to try a practice problem like **0/1 Knapsack** or **Climbing Stairs**?`;
      }

      // Default smart response
      return `### 🎓 EduMentor AI Insight

Regarding **"${question}"**:

1. **Core Concept**: Understanding this concept requires connecting fundamentals to real-world software architecture and mathematical rigor.
2. **Key Takeaway**: Always break down the problem into smaller verifiable components, test edge cases, and verify operational time/space complexity.
3. **Next Step**: I recommend taking a quick 3-question adaptive quiz on this topic to solidify your memory retention!

Feel free to ask me to provide code snippets, step-by-step examples, or practice exam questions!`;
    }
  }
};
