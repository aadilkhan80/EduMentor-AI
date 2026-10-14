import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, Copy, Check, Award, Trash2 } from 'lucide-react';
import { EduService } from '../services/api';

const WELCOME_MESSAGE = {
  id: 'msg_welcome',
  role: 'assistant',
  content: `### 👋 Hello! I am your EduMentor AI.

I specialize in breaking down complex concepts, answering your doubts, and creating tailored study drills.

**What can I help you with today?**
- 🗄️ Explain **DBMS Normalization** (1NF, 2NF, 3NF, BCNF)
- ⚡ Break down **Transactions & ACID Properties**
- 💻 Master **Dynamic Programming & Memoization**
- 📐 Discrete Mathematics and Recurrence Relations
- 📝 Generate practice questions and step-by-step proofs`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function AIMentorView({ initialQuestion, onStartQuizOnTopic }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    EduService.getAIHistory()
      .then((history) => {
        if (!isMounted || history.length === 0) return;
        const savedMessages = history.map((message) => ({
          ...message,
          timestamp: message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        }));
        setMessages([WELCOME_MESSAGE, ...savedMessages]);
      })
      .catch((error) => {
        if (isMounted) setHistoryError(error.message);
      })
      .finally(() => {
        if (isMounted) setIsHistoryLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If redirected with an initial question from Dashboard or Courses
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await EduService.askAIMentor(query, messages);
      const assistantMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
      await EduService.saveAIExchange(query, answer);
      setHistoryError('');
    } catch (e) {
      setHistoryError(e.message || 'The AI exchange could not be saved.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear your saved AI chat history?')) return;
    try {
      await EduService.clearAIHistory();
      setMessages([WELCOME_MESSAGE]);
      setHistoryError('');
    } catch (error) {
      setHistoryError(error.message || 'AI history could not be cleared.');
    }
  };

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    "Explain DBMS normalization with 1NF, 2NF, 3NF examples",
    "Explain ACID properties in Transactions with banking analogy",
    "What is the difference between Memoization and Tabulation?",
    "Give me 3 practice multiple-choice questions on Binary Trees"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-5xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 mb-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">EduMentor AI Chatbot</h3>
            <p className="text-xs text-slate-400">
              Context-aware academic doubt solver & explanation engine
              {isHistoryLoading ? ' · Loading saved history…' : ` · ${Math.floor((messages.length - 1) / 2)} saved chats`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={messages.length <= 1}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-rose-500/50 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear history
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
      {historyError && <p role="alert" className="mb-2 text-xs text-rose-300">{historyError}</p>}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isUser 
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white' 
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                isUser
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap">
                  {msg.content}
                </div>

                <div className={`mt-2 flex items-center justify-between text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-slate-300 transition flex items-center gap-1"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>EduMentor AI is thinking and formulating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips */}
      <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="mt-2 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-700 focus-within:border-indigo-500 shadow-xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your mentor anything (e.g. Explain 3NF vs BCNF with examples)..."
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold transition shadow-md shadow-indigo-600/30 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
