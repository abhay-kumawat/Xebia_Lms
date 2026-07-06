import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, LayoutDashboard, PlayCircle, ClipboardList, FileCheck2, BellRing,
  User, Settings, LogOut, Sun, Moon
} from 'lucide-react';
import StudentLogo from '@/components/ui/StudentLogo';
import { cn } from '@/utils';
import { useStudentAuth } from '@/auth/student/studentAuthHooks';
import { useTheme } from '@/context/ThemeContext';

const STUDENT_NAV_ITEMS = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/learning-content', label: 'Learning Content', icon: PlayCircle },
  { href: '/student/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/student/assessments', label: 'Assessments', icon: FileCheck2 },
  { href: '/student/notifications', label: 'Notifications', icon: BellRing },
  { href: '/student/profile', label: 'Profile', icon: User },
  { href: '/student/settings', label: 'Settings', icon: Settings },
];

export default function StudentSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-gradient-to-b from-[#181223] via-[#0E1017] to-[#08090E] border-r border-white/[0.04] text-slate-300 transition-all duration-300"
      style={{ width: 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.04]">
        <StudentLogo size="lg" />
      </div>

      {/* Nav label */}
      <p className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-400/70">
        Student Menu
      </p>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
        {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden group',
                active ? 'text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              )}
            >
              {/* Active Indicator Background */}
              {active && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/15 to-indigo-600/5 border-l-2 border-purple-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              
              <Icon 
                className={cn(
                  'relative z-10 h-[18px] w-[18px] shrink-0 transition-all duration-300 group-hover:scale-110',
                  active ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-slate-400 group-hover:text-white'
                )}
                strokeWidth={active ? 2.5 : 2} 
              />
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="mt-auto p-4 border-t border-white/[0.04] bg-white/[0.01]">
          <div className="flex flex-col gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-inner ring-2 ring-white/10">
                {(user.fullName || 'S')[0].toUpperCase()}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F101A]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white leading-tight">
                  {user.fullName || 'Student User'}
                </p>
                <p className="truncate text-[10px] text-slate-500 mt-0.5 font-medium leading-none">
                  {user.email || 'student@xebia.com'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5 mt-1">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center rounded-xl p-2 transition-all text-slate-400 hover:bg-white/[0.06] hover:text-amber-400 cursor-pointer border-0 bg-transparent"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5 text-amber-400" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center justify-center rounded-xl p-2 transition-all text-slate-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer border-0 bg-transparent"
                title="Log out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
