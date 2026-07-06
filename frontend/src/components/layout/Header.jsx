'use client';

import { Bell, Search, User, Sun, Moon, SlidersHorizontal, Check, X, BookOpen, Users, FolderTree, FileText, Landmark } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn, formatDateTime } from '@/utils';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// Highlight helper
function highlightText(text, query) {
  if (!text) return '';
  if (!query.trim()) return text;
  const parts = String(text).split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-100 dark:bg-amber-950/60 text-brand-primary dark:text-brand-secondary font-semibold rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export default function Header({ title, subtitle }) {
  const {
    courses, categories, students, mediaLibrary, instructors,
    notifications, markAllNotificationsAsRead, clearNotifications, branding
  } = useCatalog();
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    'courses', 'students', 'categories', 'instructors', 'videos', 'pdfs', 'ppts', 'assignments', 'published', 'draft', 'active', 'inactive'
  ]);
  
  // Notifications panel state
  const [notifOpen, setNotifOpen] = useState(false);

  // Refs for closing panels on click outside
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;
    setTheme(activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const clickHandler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Filter Checkbox Toggles
  const handleFilterToggle = (val) => {
    setSelectedFilters((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleSelectAllFilters = () => {
    const allFilters = [
      'courses', 'students', 'categories', 'instructors', 'videos', 'pdfs', 'ppts', 'assignments', 'published', 'draft', 'active', 'inactive'
    ];
    if (selectedFilters.length === allFilters.length) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(allFilters);
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  // Multi-entity search querying logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results = [];
    const q = searchQuery.toLowerCase();

    // 1. Categories
    if (selectedFilters.includes('categories')) {
      categories.filter(c => !c.deletedAt).forEach(cat => {
        const matchName = cat.name.toLowerCase().includes(q);
        const matchDesc = cat.description?.toLowerCase().includes(q);
        const matchActive = selectedFilters.includes(cat.status);
        
        if ((matchName || matchDesc) && matchActive) {
          results.push({
            type: 'category',
            title: cat.name,
            subtitle: cat.description,
            link: `/admin/categories/${cat.id}`,
            icon: FolderTree,
            badge: 'Category'
          });
        }
      });
    }

    // 2. Courses
    if (selectedFilters.includes('courses')) {
      courses.filter(c => !c.deletedAt).forEach(course => {
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchTech = course.technology?.toLowerCase().includes(q);
        const matchPub = selectedFilters.includes(course.status);
        
        if ((matchTitle || matchTech) && matchPub) {
          results.push({
            type: 'course',
            title: course.title,
            subtitle: `${course.technology} · ${course.difficulty}`,
            link: `/admin/courses/${course.id}/builder`,
            icon: BookOpen,
            badge: 'Course'
          });
        }
      });
    }

    // 3. Students
    if (selectedFilters.includes('students')) {
      students.forEach(student => {
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchEmail = student.email.toLowerCase().includes(q);
        const matchActive = selectedFilters.includes(student.status === 'completed' ? 'active' : student.status);
        
        if ((matchName || matchEmail) && matchActive) {
          results.push({
            type: 'student',
            title: student.fullName,
            subtitle: `${student.department} · ${student.city}`,
            link: `/admin/dashboard`, // Jump to dashboard where student list is visible
            icon: Users,
            badge: 'Student'
          });
        }
      });
    }

    // 4. Instructors
    if (selectedFilters.includes('instructors')) {
      (instructors || []).forEach(inst => {
        const matchName = inst.fullName.toLowerCase().includes(q);
        const matchEmail = inst.email.toLowerCase().includes(q);
        
        if (matchName || matchEmail) {
          results.push({
            type: 'instructor',
            title: inst.fullName,
            subtitle: `${inst.department} · ${inst.email}`,
            link: `/admin/dashboard`,
            icon: Landmark,
            badge: 'Instructor'
          });
        }
      });
    }

    // 5. Media Library / Content Files
    mediaLibrary.forEach(file => {
      const matchTitle = file.title.toLowerCase().includes(q);
      const isVideo = file.type === 'video' && selectedFilters.includes('videos');
      const isPdf = file.type === 'pdf' && selectedFilters.includes('pdfs');
      const isPpt = file.type === 'ppt' && selectedFilters.includes('ppts');
      const isDoc = file.type === 'doc' && selectedFilters.includes('assignments'); // Map Doc as Assignment
      
      const typeAllowed = isVideo || isPdf || isPpt || isDoc;
      
      if (matchTitle && (selectedFilters.length === 0 || typeAllowed)) {
        results.push({
          type: 'media',
          title: file.title,
          subtitle: `File inside Course: ${file.courseName}`,
          link: `/admin/courses/${file.courseId}/builder`,
          icon: FileText,
          badge: file.type.toUpperCase()
        });
      }
    });

    return results.slice(0, 10); // Cap at 10 suggestions
  }, [searchQuery, selectedFilters, courses, categories, students, mediaLibrary, instructors]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleSuggestionClick = (link) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(link);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/[0.05] bg-white/90 dark:bg-[#0C0D12]/90 backdrop-blur-xl px-6 transition-all duration-300 shadow-sm dark:shadow-md dark:shadow-black/20">
      <div>
        {title && (
          <h1 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {title}
          </h1>
        )}
        {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5 leading-none">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        
        {/* Global Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center gap-2">
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-450 dark:text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650 hover:border-slate-350 dark:hover:border-white/[0.14] focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-transparent border-0 cursor-pointer p-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={cn(
                  'rounded-xl border p-2 flex items-center justify-center transition-all cursor-pointer bg-transparent',
                  selectedFilters.length < 12
                    ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                    : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-550 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-white/[0.08] hover:text-slate-800 dark:hover:text-white'
                )}
                title="Advanced Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {selectedFilters.length < 12 && (
                  <span className="ml-1 text-[10px] font-bold bg-purple-650 text-white rounded-full h-4 w-4 flex items-center justify-center">
                    {selectedFilters.length}
                  </span>
                )}
              </button>

              {/* Filter Panel Dropdown */}
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 z-40 w-64 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0F1017] p-4 shadow-2xl shadow-slate-100 dark:shadow-black/40 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">Advanced Search Filters</span>
                      <button type="button" onClick={handleClearFilters} className="text-[10px] text-purple-605 dark:text-purple-400 hover:text-purple-300 bg-transparent border-0 cursor-pointer">Clear</button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin text-xs text-slate-600 dark:text-slate-300 pr-1">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold py-1 border-b border-slate-100 dark:border-white/[0.06]">
                        <input
                          type="checkbox"
                          checked={selectedFilters.length === 12}
                          onChange={handleSelectAllFilters}
                          className="rounded border-slate-350 dark:border-slate-700 bg-white/5 text-[#84117C]"
                        />
                        Select All Filters
                      </label>

                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-2 tracking-wider">Entities</p>
                      {[
                        { val: 'courses', lbl: 'Courses' },
                        { val: 'students', lbl: 'Students' },
                        { val: 'instructors', lbl: 'Instructors' },
                        { val: 'categories', lbl: 'Categories' }
                      ].map((item) => (
                        <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(item.val)}
                            onChange={() => handleFilterToggle(item.val)}
                            className="rounded border-slate-350 dark:border-slate-700 bg-white/5 text-[#84117C]"
                          />
                          {item.lbl}
                        </label>
                      ))}

                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-2 tracking-wider">Media Types</p>
                      {[
                        { val: 'videos', lbl: 'Videos' },
                        { val: 'pdfs', lbl: 'PDFs' },
                        { val: 'ppts', lbl: 'PPT Slides' },
                        { val: 'assignments', lbl: 'Assignments' }
                      ].map((item) => (
                        <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(item.val)}
                            onChange={() => handleFilterToggle(item.val)}
                            className="rounded border-slate-350 dark:border-slate-700 bg-white/5 text-[#84117C]"
                          />
                          {item.lbl}
                        </label>
                      ))}

                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-2 tracking-wider">Statuses</p>
                      {[
                        { val: 'published', lbl: 'Published' },
                        { val: 'draft', lbl: 'Draft' },
                        { val: 'active', lbl: 'Active' },
                        { val: 'inactive', lbl: 'Inactive' }
                      ].map((item) => (
                        <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(item.val)}
                            onChange={() => handleFilterToggle(item.val)}
                            className="rounded border-slate-350 dark:border-slate-700 bg-white/5 text-[#84117C]"
                          />
                          {item.lbl}
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Live Search Suggestions Dropdown */}
          <AnimatePresence>
            {searchOpen && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 mt-2 z-40 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0F1017] p-2 shadow-2xl shadow-slate-100 dark:shadow-black/40 overflow-hidden"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-white/[0.06] text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500">
                  Live Search Results ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No results match "{searchQuery}" under active filters.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(item.link)}
                        className="flex w-full items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04] rounded-xl text-left transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 shrink-0">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-xs text-slate-800 dark:text-white truncate">
                              {highlightText(item.title, searchQuery)}
                            </h4>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {highlightText(item.subtitle, searchQuery)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer bg-transparent border-0"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer bg-transparent border-0"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0C0D12] animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-full mt-2 z-40 w-80 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0F1017] p-2 shadow-2xl shadow-slate-100 dark:shadow-black/40 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-3 py-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">System Notifications</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={markAllNotificationsAsRead} className="text-[10px] font-semibold text-purple-650 dark:text-purple-400 hover:opacity-85 bg-transparent border-0 cursor-pointer">Mark all read</button>
                    <span className="text-slate-200 dark:text-white/10">|</span>
                    <button type="button" onClick={clearNotifications} className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent border-0 cursor-pointer">Clear</button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No new notifications.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3 border-b border-slate-100 dark:border-white/[0.04] last:border-0 text-left transition-colors relative hover:bg-slate-50 dark:hover:bg-white/[0.02]',
                          !notif.read ? 'bg-purple-500/[0.03]' : ''
                        )}
                      >
                        {!notif.read && (
                          <div className="absolute top-4 left-2.5 h-1.5 w-1.5 rounded-full bg-purple-500" />
                        )}
                        <div className="pl-3">
                          <h4 className="font-semibold text-xs text-slate-800 dark:text-white">{notif.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-650 mt-1 font-medium">{formatDateTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User profile dropdown indicator */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] px-3 py-1.5 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-105 dark:hover:bg-white/[0.07] transition-all cursor-default">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#6C1D5F] to-[#84117C] flex items-center justify-center text-xs font-black text-white shrink-0">
            {(user?.fullName || 'A')[0].toUpperCase()}
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.fullName || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
