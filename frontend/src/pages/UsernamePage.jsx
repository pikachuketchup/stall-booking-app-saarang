import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ArrowRight, Sparkles, ShieldCheck, Grid } from 'lucide-react';

export default function UsernamePage() {
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = inputName.trim();
    if (!trimmed) {
      setError('Please enter a username to proceed.');
      return;
    }

    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters long.');
      return;
    }

    try {
      setLoading(true);
      await login(trimmed);
      navigate('/booking');
    } catch (err) {
      setError(err.message || 'Error logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Decorative badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STEP 1 OF 3: IDENTIFY YOURSELF</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-3">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">BoxReserve</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Enter your unique username to book your boxes, manage reservations, and proceed to payment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Your Unique Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. alex_smith or player1"
                  autoFocus
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-base"
                />
              </div>

              {error && (
                <p className="mt-2 text-sm text-rose-400 flex items-center gap-1.5 animate-shake">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <span>Entering...</span>
              ) : (
                <>
                  <span>Enter Booking Grid</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Feature highlights */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Real-time box grid</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>MySQL persistence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
