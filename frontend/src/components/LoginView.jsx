import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

export default function LoginView({ onLogin, onRegister }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await onRegister(name, email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (authError) {
      setError(authError.message || `Unable to ${isRegistering ? 'create your account' : 'sign in'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-indigo-950/30">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-300">
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="mt-5 text-center">
          <h1 className="text-2xl font-bold">{isRegistering ? 'Create your account' : 'Welcome to EduMentor AI'}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {isRegistering ? 'Create an account to save your learning progress and history.' : 'Sign in to continue your learning journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isRegistering && (
            <label className="block text-sm font-medium text-slate-300">
              Full name
              <input
                type="text"
                required
                maxLength={255}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-slate-300">
            Email
            <span className="relative mt-2 block">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-white outline-none focus:border-indigo-500"
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Password
            <span className="relative mt-2 block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={isRegistering ? 8 : undefined}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-11 text-white outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-2.5 rounded p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                  : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </span>
          </label>

          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? (isRegistering ? 'Creating account…' : 'Signing in…') : (isRegistering ? 'Create account' : 'Sign in')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setPassword('');
          }}
          className="mt-5 w-full text-center text-sm font-medium text-indigo-300 hover:text-indigo-200"
        >
          {isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>

      </div>
    </main>
  );
}
