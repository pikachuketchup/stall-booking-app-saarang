import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LayoutGrid, Database } from 'lucide-react';

export default function Navbar({ dbDriver }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => (username ? navigate('/booking') : navigate('/'))}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              BoxReserve
              <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Interactive Box Booking System</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* DB Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>DB: <strong className="text-slate-200 uppercase">{dbDriver || 'MySQL'}</strong></span>
          </div>

          {username ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-200 text-xs sm:text-sm font-medium">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="max-w-[120px] truncate">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Switch User / Logout"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition border border-slate-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Switch User</span>
              </button>
            </div>
          ) : (
            location.pathname !== '/' && (
              <button
                onClick={() => navigate('/')}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition shadow"
              >
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
