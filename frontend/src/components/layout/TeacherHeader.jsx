import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, LogOut, User, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils';

function getInitials(name) {
  if (!name) return 'TR';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function TeacherHeader({ title, subtitle }) {
  const { user, logout } = useTeacherAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const clickHandler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-[#334155] bg-white/95 dark:bg-[#111827]/90 backdrop-blur-md px-6 transition-colors duration-200">
      <div>
        {title && (
          <h1 className="text-lg font-bold text-emerald-600 dark:text-slate-100 flex items-center gap-2">
            {title}
          </h1>
        )}
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-[#334155] px-3.5 py-1.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer shadow-sm"
          >
            <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 border border-white/20 shadow-sm select-none">
              {getInitials(user?.fullName)}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
              {user?.fullName || 'Teacher'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-2.5 shadow-2xl space-y-1 select-none"
              >
                <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155]/60 mb-1.5">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-[#F8FAFC] truncate">
                    {user?.fullName || 'Teacher'}
                  </h4>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 uppercase tracking-wider">
                    Teacher
                  </p>
                </div>

                <Link
                  to="/teacher/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#2D3748] transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 text-emerald-600" />
                  <span>Dashboard</span>
                </Link>

                <div className="my-1.5 border-t border-slate-100 dark:border-[#334155]" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left border-0 bg-transparent"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
