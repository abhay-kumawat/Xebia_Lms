import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, BookOpen, Award, Brain, History, Trophy, Sparkles,
  ArrowRight, Search, Bell, RefreshCw, AlertTriangle, Flame,
  Tv, Calendar, Target, Clock, GraduationCap, CheckCircle2, ChevronRight,
  TrendingUp, Award as BadgeIcon, Zap, Star, Play, Users, BookMarked,
  Activity, CheckCircle, Lock, BarChart, ArrowUpRight, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Layout Components
import Button from '@/components/ui/Button';

// Hooks & Services
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useToast } from '@/hooks/useToast';
import { useCatalog } from '@/hooks/useCatalog';
import {
  getStudentDashboardData,
  getStudentProgress,
  getStudentCertificates,
  getStudentAIProgress,
  getStudentHistory,
  getStudentRanking,
  getStudentRecommendations
} from '@/services/studentDashboardService';
import { getAssessments, getSubmissions } from '@/services/assessmentService';

function getInitials(name) {
  if (!name) return 'AK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Dashboard Tab Panels
import LearningProgress from '@/components/dashboard/LearningProgress';
import CertificationSection from '@/components/dashboard/CertificationSection';
import AILearningProgress from '@/components/dashboard/AILearningProgress';
import LearningHistory from '@/components/dashboard/LearningHistory';
import Leaderboard from '@/components/dashboard/Leaderboard';
import RecommendedCourses from '@/components/dashboard/RecommendedCourses';

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Animated progress bar
function AnimatedBar({ value, color = 'bg-gradient-to-r from-purple-600 to-indigo-500', delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// Stat card with counter
function StatCard({ label, value, suffix = '', icon: Icon, gradient, delay = 0 }) {
  const count = useCounter(parseInt(value) || 0, 1200);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg cursor-default ${gradient}`}
    >
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
      <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-white/5 translate-y-4 -translate-x-4" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">{label}</span>
          <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl font-black tracking-tight">
          {count}{suffix}
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useStudentAuth();
  const { showToast } = useToast();
  const { courses: liveCourses, categories: liveCategories } = useCatalog();
  const [activeTab, setActiveTab] = useState('overview');
  const [showTimetable, setShowTimetable] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const tracks = [
    { title: 'GenAI & LangChain Architectures', duration: '14:20' },
    { title: 'Spring Boot 3.3 Mastery Tips', duration: '08:45' },
    { title: 'Vite & React 19 Upgrade Guide', duration: '11:15' },
  ];

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [aiProgress, setAIProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [dbAssessments, setDbAssessments] = useState([]);
  const [dbSubmissions, setDbSubmissions] = useState([]);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const userName = user?.fullName || 'Abhay Kumawat';
  const userAvatar = user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Abhay+Kumawat';

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [dashRes, progRes, certRes, aiRes, histRes, rankRes, recRes, assessmentsList, submissionsList] = await Promise.all([
        getStudentDashboardData(),
        getStudentProgress(),
        getStudentCertificates(),
        getStudentAIProgress(),
        getStudentHistory(),
        getStudentRanking(),
        getStudentRecommendations(),
        getAssessments(),
        getSubmissions()
      ]);
      setDashboardData(dashRes);
      setProgressData(progRes);
      
      const studentEmail = user?.email || 'abhay.kumawat@xebia.com';
      const studentName = user?.fullName || 'Abhay Kumawat';
      const filteredCerts = (certRes || []).filter(c => 
        !c.studentEmail || 
        c.studentEmail.toLowerCase() === studentEmail.toLowerCase() || 
        c.studentName?.toLowerCase() === studentName.toLowerCase()
      );
      setCertificates(filteredCerts);
      setAIProgress(aiRes);
      setHistory(histRes);
      setRanking(rankRes);
      setRecommendations(recRes);
      setDbAssessments(assessmentsList);
      setDbSubmissions(submissionsList);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      setError('We could not connect to the Learning Management System server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Memoized progress and dashboard data merging live catalog courses
  const processedProgressData = useMemo(() => {
    if (!progressData) return null;
    
    // Map live courses from useCatalog into the student's enrolled courses list
    const mappedLiveCourses = (liveCourses || []).map(lc => {
      const cat = (liveCategories || []).find(c => c.id === lc.categoryId);
      const categoryName = cat ? cat.name : (lc.technology || 'General');
      
      return {
        id: String(lc.id),
        name: lc.title,
        progress: lc.progress || 0,
        lessonsCompleted: lc.lessonsCompleted || 0,
        remainingLessons: lc.remainingLessons || 12,
        category: categoryName,
        trainer: lc.trainer || 'Prof. Abhay Kumawat',
        thumbnail: lc.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
      };
    });

    const mergedEnrolledCourses = [...(progressData.enrolledCourses || [])];
    mappedLiveCourses.forEach(lc => {
      const exists = mergedEnrolledCourses.some(mc => mc.name.toLowerCase() === lc.name.toLowerCase() || String(mc.id) === String(lc.id));
      if (!exists) {
        mergedEnrolledCourses.push(lc);
      }
    });

    const totalEnrolled = mergedEnrolledCourses.length;
    const totalProgress = mergedEnrolledCourses.reduce((acc, c) => acc + c.progress, 0);
    const overallCompletion = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

    return {
      ...progressData,
      metrics: {
        ...progressData.metrics,
        overallCourseCompletion: overallCompletion
      },
      enrolledCourses: mergedEnrolledCourses
    };
  }, [progressData, liveCourses, liveCategories]);

  const processedDashboardData = useMemo(() => {
    if (!dashboardData || !processedProgressData) return null;

    const mergedEnrolledCourses = processedProgressData.enrolledCourses;
    const totalEnrolled = mergedEnrolledCourses.length;
    const active = mergedEnrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length;
    const completed = mergedEnrolledCourses.filter(c => c.progress === 100).length;

    const stats = (dashboardData.overviewStats || []).map(s => {
      if (s.id === 'enrolled') return { ...s, value: String(totalEnrolled) };
      if (s.id === 'active') return { ...s, value: String(active) };
      if (s.id === 'completed') return { ...s, value: String(completed) };
      return s;
    });

    return {
      ...dashboardData,
      overviewStats: stats,
      courses: mergedEnrolledCourses
    };
  }, [dashboardData, processedProgressData]);

  const pendingAssignmentsCount = useMemo(() => {
    const studentEnrollment = user?.enrollmentNo || 'XEB-2026-081';
    const assignmentsList = dbAssessments.filter(a => a.type?.toLowerCase() === 'assignment');
    
    const pending = assignmentsList.filter(ass => {
      return !dbSubmissions.some(sub => 
        sub.assessmentTitle === ass.title && 
        sub.enrollmentNo === studentEnrollment
      );
    });
    
    return pending.length > 0 ? pending.length : 3;
  }, [dbAssessments, dbSubmissions, user]);

  const dynamicDeadlines = useMemo(() => {
    const list = [];
    const studentEnrollment = user?.enrollmentNo || 'XEB-2026-081';

    dbAssessments.forEach(ass => {
      const hasSubmitted = dbSubmissions.some(sub => 
        sub.assessmentTitle === ass.title && 
        sub.enrollmentNo === studentEnrollment
      );

      if (!hasSubmitted) {
        list.push({
          text: `${ass.title} (${ass.type})`,
          when: `Due ${ass.dueDate}`,
          urgent: new Date(ass.dueDate) <= new Date(Date.now() + 2 * 24 * 3600 * 1000)
        });
      }
    });

    if (list.length === 0) {
      return [
        { text: 'Xebia Orientation Submission', when: 'Due 2026-07-12', urgent: false },
        { text: 'Docker Container Quiz', when: 'Due 2026-07-20', urgent: false }
      ];
    }

    return list.slice(0, 3);
  }, [dbAssessments, dbSubmissions, user]);

  const studentCards = useMemo(() => [
    { title: 'My Courses', sub: 'Explore active enrollments', icon: BookOpen, to: '/student/courses', color: 'from-[#831B84] to-[#4A1E47]' },
    { title: 'Timetable', sub: 'Online classes & schedules', icon: Calendar, action: () => setShowTimetable(true), color: 'from-[#FF6200] to-[#5B1E53]' },
    { title: 'My Exams', sub: 'Quizzes & final evaluations', icon: FileText, to: '/student/assessments', color: 'from-[#4A1E47] to-[#331431]' },
    { title: 'Student Support', sub: 'Get help and resolve issues', icon: Users, to: '/student/discussion', color: 'from-[#5C4F61] to-[#3D3441]' },
    { title: 'myCard', sub: 'Student Profile & Digital ID', icon: Award, to: '/student/profile', color: 'from-[#793B74] to-[#51234E]' },
    { title: 'My Fees', sub: 'Pending dues & receipt invoices', icon: BookMarked, action: () => setShowFees(true), color: 'from-[#01AC9F] to-[#0b7f76]' },
    { title: 'Overall Progress', sub: 'View completed modules', icon: TrendingUp, action: () => setActiveTab('progress'), color: 'from-[#01AC9F] to-[#018d82]' },
    { title: 'Lecture Videos', sub: 'Recorded lectures repository', icon: Play, to: '/student/learning-content', color: 'from-[#5B1E53] to-[#3f1239]' },
    { title: 'No Dues', sub: `${pendingAssignmentsCount} pending assignments`, icon: CheckCircle2, to: '/student/assignments', color: 'from-[#855889] to-[#5C395F]' },
    { title: 'RESULT', sub: 'Final marks & transcript sheets', icon: GraduationCap, action: () => setActiveTab('progress'), color: 'from-[#91759E] to-[#674F73]' },
    { title: 'Radio Xebia', sub: 'LMS Broadcast & Podcasts', icon: Zap, action: () => setShowRadio(true), color: 'from-[#FF6200] to-[#cc4e00]' },
    { title: 'Xebia Impact', sub: 'Global achievements logs', icon: Sparkles, action: () => setShowImpact(true), color: 'from-[#831B84] to-[#FF6200]' }
  ], [pendingAssignmentsCount]);

  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({
        date: d.getDate(),
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
        isToday: i === 0,
        hasDeadline: i === 1 || i === 3
      });
    }
    return days;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-6 lg:p-8 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-3xl bg-gradient-to-r from-slate-200 to-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-6 lg:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-brand-border/70 bg-white p-8 text-center shadow-xl max-w-md"
        >
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-brand-text-primary">Connection Offline</h3>
          <p className="mt-2 text-sm text-brand-text-secondary">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-6 w-full">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
          </Button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'My Dashboard', icon: BarChart2 },
    { id: 'progress', label: 'Learning Progress', icon: BookOpen },
    { id: 'certificates', label: 'Certifications', icon: Award },
    { id: 'ai', label: 'AI Analytics', icon: Brain },
    { id: 'history', label: 'Learning History', icon: History },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'recommendations', label: 'Recommended', icon: Sparkles }
  ];

  const skills = [
    { name: 'React & Front-end', level: 85, color: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
    { name: 'Python Engineering', level: 70, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { name: 'AWS Cloud Services', level: 60, color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
    { name: 'Data Modeling & SQL', level: 90, color: 'bg-gradient-to-r from-emerald-500 to-teal-500' }
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/20 text-brand-text-primary transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#7C3AED]/8 blur-3xl" />
        <div className="absolute right-[-6rem] top-32 h-96 w-96 rounded-full bg-[#10B5A5]/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-[#F59E0B]/8 blur-3xl" />
      </div>
      <div className="relative p-6 lg:p-8 space-y-6">

        {/* ── Premium Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-[0_35px_120px_-45px_rgba(76,29,149,0.9)]"
          style={{ background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 34%, #312E81 68%, #0F172A 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,transparent_35%,transparent_65%,rgba(255,255,255,0.06)_100%)]" />
          <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />

          <div className="relative p-7 md:p-9">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left: Avatar + Greeting */}
              <div className="flex items-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  className="relative shrink-0"
                >
                  <div className="h-18 w-18 md:h-20 md:w-20 rounded-2xl border-2 border-white/30 flex items-center justify-center text-2xl font-black bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg select-none" style={{ height: '72px', width: '72px' }}>
                    {getInitials(userName)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                  </div>
                </motion.div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                      Xebia Academy
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    Welcome back, {userName.split(' ')[0]}! 👋
                  </h2>
                  <p className="text-sm text-purple-200/80 mt-1 font-medium">
                    You're on a <span className="text-orange-300 font-bold">5-day streak</span>. Keep the momentum going!
                  </p>
                </div>
              </div>

              {/* Right: Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                {[
                  { label: 'Streak', value: '5 Days', icon: '🔥', accent: 'text-orange-300' },
                  { label: 'Completion', value: `${processedProgressData?.metrics?.overallCourseCompletion || 78}%`, icon: '📈', accent: 'text-emerald-300' },
                  { label: 'Rank', value: '#4', icon: '🏆', accent: 'text-yellow-300' },
                ].map((m) => (
                  <div key={m.label} className="text-center bg-white/8 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm hover:bg-white/12 transition-colors">
                    <div className="text-xl mb-1">{m.icon}</div>
                    <div className={`text-base font-black ${m.accent}`}>{m.value}</div>
                    <div className="text-[10px] text-white/50 mt-0.5 font-semibold uppercase tracking-wide">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span className="font-semibold">Weekly Goal Progress</span>
                <span className="font-bold text-white">4.5 / 6 hours</span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs Navisticky top-6 z-40 flex flex-wrap gap-1 bg-white/90 border border-slate-200/80 rounded-2xl p-1.5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.3)] backdrop-blur-xl select-none">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#831B84] to-[#511345] text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </motion.{tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Active Panel Render ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >

            {/* ══════════════════════════════
                OVERVIEW PANEL
            ══════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Shoolini-style Visual LMS Navigation Grid */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 select-none">
                  {studentCards.map((card, idx) => {
                    const Icon = card.icon;
                    const content = (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.4 }}
                        whileHover={{ y: -6, scale: 1.02, boxShadow: '0 20px 30px rgba(108,29,95,0.12)' }}
                        className={`group relative overflow-hidden rounded-[28px] p-6 text-white shadow-md cursor-pointer h-44 bg-gradient-to-br ${card.color} flex flex-col justify-between`}
                      >
                        {/* Huge background visual icon */}
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-300 pointer-events-none">
                          <Icon size={100} strokeWidth={1} />
                        </div>
                        
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                            Access Portal
                          </span>
                          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm group-hover:rotate-6 transition-transform">
                            <Icon size={18} className="text-white" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-black tracking-tight leading-tight text-white mb-1 group-hover:translate-x-1 transition-transform">
                            {card.title}
                          </h3>
                          <p className="text-[11px] text-white/75 leading-tight font-medium">
                            {card.sub}
                          </p>
                        </div>
                      </motion.div>
                    );

                    return card.to ? (
                      <Link key={card.title} to={card.to}>{content}</Link>
                    ) : (
                      <div key={card.title} onClick={card.action}>{content}</div>
                    );
                  })}
                </div>

                {/* Main 3-column layout */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                  {/* COLUMN 1 */}
                  <div className="space-y-5">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-purple-50 -translate-y-10 translate-x-10 pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                          Continue Learning
                        </span>
                        <span className="text-xs font-bold text-slate-500">{processedDashboardData?.continueLearning?.progress || 68}% Done</span>
                      </div>

                      <div className="relative overflow-hidden rounded-2xl mb-4 group">
                        <img
                          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                          alt="Learning preview"
                          className="h-32 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <div className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                            <Play className="h-3 w-3 text-purple-700 fill-purple-700 ml-0.5" />
                          </div>
                          <span className="text-xs font-semibold text-white">Resume</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                        {processedDashboardData?.continueLearning?.subtitle || 'Advanced React Patterns & Architecture'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {processedDashboardData?.continueLearning?.description || 'Master advanced hooks, context patterns, and enterprise-level component architecture.'}
                      </p>

                      <div className="mt-4 space-y-2.5">
                        <AnimatedBar value={processedDashboardData?.continueLearning?.progress || 68} color="bg-gradient-to-r from-[#831B84] to-purple-500" />
                        <Button className="w-full flex items-center justify-center gap-2 py-2.5 text-xs bg-gradient-to-r from-[#831B84] to-[#9b2d89] hover:opacity-90 border-0 cursor-pointer rounded-xl shadow-md shadow-purple-500/20">
                          Resume Session <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>

                    {/* Live Sessions */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.5)] ring-1 ring-white/60 backdrop-blur-xl hover:shadow-[0_25px_80px_-30px_rgba(15,23,42,0.7)] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">Live Sessions</h3>
                        <span className="ml-auto text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wide">Live</span>
                      </div>

                      <div className="space-y-3">
                        {[
                          { title: 'DevOps Best Practices', time: 'Today, 3:30 PM', live: true },
                          { title: 'React 19 Hooks Workshop', time: 'Tomorrow, 11:00 AM', live: false },
                        ].map((session) => (
                          <div key={session.title} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${session.live ? 'border-red-100 bg-red-50/50' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/60'}`}>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{session.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {session.time}
                              </p>
                            </div>
                            <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer border-0 transition-all ${session.live ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                              {session.live ? '● Join Now' : 'Remind'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* COLUMN 2 */}
                  <div className="space-y-5">

                    {/* Skill Progress */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-slate-800">Skill Mastery</h3>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wide">Technologies</span>
                      </div>

                      <div className="space-y-4">
                        {skills.map((skill, i) => (
                          <div key={skill.name}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-semibold text-slate-700">{skill.name}</span>
                              <span className="font-bold text-slate-500">{skill.level}%</span>
                            </div>
                            <AnimatedBar value={skill.level} color={skill.color} delay={i * 100} />
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Learning Insights */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">Learning Insights</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Weekly Hours', value: '5.4h', icon: '⏱️', trend: '+12%' },
                          { label: 'Completed', value: '3 Courses', icon: '✅', trend: 'This month' },
                          { label: 'Quiz Average', value: '88%', icon: '📊', trend: '+5% vs last' },
                          { label: 'Global Rank', value: '#4th', icon: '🏆', trend: 'Top 5%' },
                        ].map((item) => (
                          <div key={item.label} className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-100 p-3.5 rounded-2xl hover:shadow-sm transition-shadow">
                            <div className="text-lg mb-1">{item.icon}</div>
                            <div className="text-sm font-black text-slate-800">{item.value}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.label}</div>
                            <div className="text-[9px] font-bold text-emerald-600 mt-1 bg-emerald-50 px-1.5 py-0.5 rounded-full inline-block">{item.trend}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Achievements */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-800">Recent Achievements</h4>
                        <button onClick={() => setActiveTab('certificates')} className="text-xs text-purple-600 hover:text-purple-800 font-bold cursor-pointer bg-transparent border-0">View All →</button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { icon: '🔥', title: 'Streak Master', desc: '5-day login streak achieved', color: 'bg-orange-50 border-orange-100' },
                          { icon: '🐍', title: 'Python Certified', desc: 'Completed Python Foundations', color: 'bg-blue-50 border-blue-100' },
                          { icon: '⭐', title: 'Top Performer', desc: 'Ranked in top 5% this week', color: 'bg-purple-50 border-purple-100' },
                        ].map((ach) => (
                          <div key={ach.title} className={`flex items-center gap-3 p-3 rounded-2xl border ${ach.color}`}>
                            <div className="text-xl shrink-0">{ach.icon}</div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{ach.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{ach.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* COLUMN 3 */}
                  <div className="space-y-5">

                    {/* Weekly Goal */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                          <Target className="h-4 w-4 text-amber-600" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Weekly Goal</h4>
                        <span className="ml-auto text-[10px] font-bold text-amber-600">75%</span>
                      </div>

                      <div className="relative h-24 w-24 mx-auto mb-4">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                          <motion.circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke="url(#goalGrad)" strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="100"
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 25 }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                          />
                          <defs>
                            <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#831B84" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-black text-slate-800">4.5h</span>
                          <span className="text-[9px] text-slate-500 font-semibold">of 6h</span>
                        </div>
                      </div>

                      <p className="text-center text-[11px] text-slate-500">
                        1.5 hours more to hit your weekly goal! 💪
                      </p>
                    </motion.div>

                    {/* Learning Streak */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center">
                          <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Weekly Streak</h4>
                        <span className="ml-auto text-base font-black text-orange-500">5🔥</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 text-center">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                          const isActive = idx < 5;
                          const isToday = idx === 4;
                          return (
                            <div key={idx} className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">{day}</span>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300 }}
                                className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                                  isToday
                                    ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md shadow-orange-400/40 ring-2 ring-orange-300'
                                    : isActive
                                    ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {isActive ? '🔥' : '○'}
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Calendar Deadlines */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h4>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-4">
                        {getCalendarDays().map((day, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">{day.dayLabel}</span>
                            <div className={`h-8 w-8 mx-auto rounded-lg flex flex-col items-center justify-center text-xs font-bold relative ${
                              day.isToday
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md'
                                : 'bg-slate-50 border border-slate-100 text-slate-700 hover:bg-purple-50 transition-colors'
                            }`}>
                              <span>{day.date}</span>
                              {day.hasDeadline && (
                                <span className={`absolute -bottom-0.5 h-1.5 w-1.5 rounded-full ${day.isToday ? 'bg-yellow-300' : 'bg-red-400'}`} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2.5">
                        {dynamicDeadlines.map((item) => (
                          <div key={item.text} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-[11px] ${item.urgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                            <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${item.urgent ? 'bg-red-500' : 'bg-slate-400'}`} />
                            <div>
                              <p className="font-semibold text-slate-700">{item.text}</p>
                              <p className={`text-[10px] mt-0.5 font-bold ${item.urgent ? 'text-red-500' : 'text-slate-400'}`}>{item.when}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Recommended Courses */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Recommended for {userName.split(' ')[0]}</h4>
                        <p className="text-[10px] text-slate-500">Curated by AI based on your progress</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('recommendations')} className="text-xs text-purple-600 hover:text-purple-800 font-bold cursor-pointer bg-transparent border-0 flex items-center gap-1">
                      Explore More <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(recommendations.length > 0 ? recommendations.slice(0, 3) : [
                      { id: 1, category: 'Cloud', title: 'AWS Solutions Architect', description: 'Master AWS services, architecture patterns, and cloud-native application design.', duration: '8 weeks', level: 'Intermediate' },
                      { id: 2, category: 'AI/ML', title: 'Machine Learning with Python', description: 'From linear regression to neural networks — a practical hands-on ML journey.', duration: '10 weeks', level: 'Advanced' },
                      { id: 3, category: 'DevOps', title: 'Kubernetes & Container Mastery', description: 'Deploy and scale enterprise applications using Kubernetes and Docker.', duration: '6 weeks', level: 'Intermediate' },
                    ]).map((course, i) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="group flex flex-col justify-between p-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-purple-50/30 hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div>
                          <span className="text-[9px] font-bold uppercase text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">{course.category}</span>
                          <h5 className="text-sm font-bold text-slate-800 mt-2.5 mb-1 group-hover:text-purple-700 transition-colors leading-snug">{course.title}</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400">{course.duration} · {course.level}</span>
                          <span className="text-[10px] font-bold text-purple-600 group-hover:text-purple-800 flex items-center gap-0.5 transition-colors">
                            Enroll Now <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

              </div>
            )}

            {/* PROGRESS PANEL */}
            {activeTab === 'progress' && <LearningProgress progressData={processedProgressData} />}

            {/* CERTIFICATES PANEL */}
            {activeTab === 'certificates' && <CertificationSection certificates={certificates} />}

            {/* AI PROGRESS PANEL */}
            {activeTab === 'ai' && <AILearningProgress aiData={aiProgress} />}

            {/* HISTORY PANEL */}
            {activeTab === 'history' && <LearningHistory history={history} />}

            {/* LEADERBOARD PANEL */}
            {activeTab === 'leaderboard' && <Leaderboard ranking={ranking} />}

            {/* RECOMMENDATIONS PANEL */}
            {activeTab === 'recommendations' && <RecommendedCourses recommendations={recommendations} />}

          </motion.div>
        </AnimatePresence>

        {/* Modals */}
        {showTimetable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-3xl border border-brand-border bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-primary" />
                  <h3 className="text-lg font-black text-slate-850 dark:text-white">Weekly Academic Timetable</h3>
                </div>
                <button onClick={() => setShowTimetable(false)} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
              </div>
              <div className="space-y-3.5">
                {[
                  { day: 'Monday', time: '10:00 AM - 11:30 AM', subject: 'Advanced React Architecture', room: 'Virtual Lab 1' },
                  { day: 'Wednesday', time: '02:00 PM - 03:30 PM', subject: 'Docker & Kubernetes Mastery', room: 'Cloud Room A' },
                  { day: 'Friday', time: '04:00 PM - 05:30 PM', subject: 'Generative AI Foundation', room: 'AI Theater' },
                ].map((slot) => (
                  <div key={slot.day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div>
                      <p className="text-xs font-black text-brand-primary uppercase tracking-wide">{slot.day}</p>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">{slot.subject}</h4>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{slot.time}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{slot.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showFees && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-3xl border border-brand-border bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-black text-slate-850 dark:text-white">Fees & Financial Ledger</h3>
                </div>
                <button onClick={() => setShowFees(false)} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
              </div>
              
              <div className="space-y-4">
                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Account Balance</p>
                    <p className="text-3xl font-black text-slate-850 dark:text-white mt-1">$0.00</p>
                  </div>
                  <span className="text-[11px] font-bold text-white bg-emerald-500 px-3 py-1 rounded-full uppercase">All Paid</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <div className="py-2.5 flex justify-between"><span>Enterprise Tuition Fees</span><span className="font-extrabold text-slate-850 dark:text-white">$1,200.00</span></div>
                  <div className="py-2.5 flex justify-between"><span>Laboratory & AWS Sandboxes</span><span className="font-extrabold text-slate-850 dark:text-white">$150.00</span></div>
                  <div className="py-2.5 flex justify-between"><span>Final Examination Fee</span><span className="font-extrabold text-slate-850 dark:text-white">$100.00</span></div>
                </div>

                <Button className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 border-0 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer">
                  Download Payment Receipt (PDF)
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showRadio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-3xl border border-brand-border bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-center"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-full uppercase border border-orange-100 dark:border-orange-900/20">Podcast Stream</span>
                <button onClick={() => setShowRadio(false)} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
              </div>

              {/* Album Art Icon */}
              <div className="mx-auto h-28 w-28 rounded-[24px] bg-gradient-to-tr from-[#FF6200] to-[#FF6200] flex items-center justify-center text-white shadow-lg relative overflow-hidden group">
                <Zap size={44} className={`text-white transition-all ${radioPlaying ? 'scale-110' : 'group-hover:rotate-12'}`} />
                {radioPlaying && (
                  <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-2">
                    <div className="flex gap-1 items-end h-6">
                      <div className="w-1 bg-white h-4 rounded animate-[float1_0.6s_ease-in-out_infinite]" />
                      <div className="w-1 bg-white h-6 rounded animate-[float1_0.8s_ease-in-out_infinite_0.2s]" />
                      <div className="w-1 bg-white h-3 rounded animate-[float1_0.5s_ease-in-out_infinite_0.1s]" />
                    </div>
                  </div>
                )}
              </div>

              <h4 className="text-base font-extrabold text-slate-850 dark:text-white mt-5">{tracks[currentTrack].title}</h4>
              <p className="text-xs text-slate-500 mt-1">Xebia Radio Broadcast · {tracks[currentTrack].duration}</p>

              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <button 
                  onClick={() => setCurrentTrack(prev => (prev === 0 ? tracks.length - 1 : prev - 1))}
                  className="h-10 w-10 rounded-full border-0 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-350 flex items-center justify-center cursor-pointer hover:bg-slate-100"
                >
                  ⏮
                </button>
                <button 
                  onClick={() => setRadioPlaying(!radioPlaying)}
                  className="h-14 w-14 rounded-full border-0 bg-[#FF6200] text-white flex items-center justify-center cursor-pointer hover:opacity-95 shadow-md shadow-orange-500/20 text-lg font-bold"
                >
                  {radioPlaying ? '⏸' : '▶'}
                </button>
                <button 
                  onClick={() => setCurrentTrack(prev => (prev === tracks.length - 1 ? 0 : prev + 1))}
                  className="h-10 w-10 rounded-full border-0 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-350 flex items-center justify-center cursor-pointer hover:bg-slate-100"
                >
                  ⏭
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showImpact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-3xl border border-brand-border bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-primary" />
                  <h3 className="text-lg font-black text-slate-850 dark:text-white">Xebia Academy Global Impact</h3>
                </div>
                <button onClick={() => setShowImpact(false)} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
              </div>

              <div className="grid gap-4 grid-cols-2 text-center">
                {[
                  { value: '5,000+', label: 'Trained Professionals', color: 'text-purple-650 bg-purple-50/50' },
                  { value: '120+', label: 'Expert Courses', color: 'text-blue-650 bg-blue-50/50' },
                  { value: '94%', label: 'Certification Passing Rate', color: 'text-emerald-650 bg-emerald-50/50' },
                  { value: '26k+', label: 'Total Learning Hours', color: 'text-orange-650 bg-orange-50/50' },
                ].map((metric) => (
                  <div key={metric.label} className={`p-5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-center items-center`}>
                    <p className={`text-2xl font-black ${metric.color.split(' ')[0]}`}>{metric.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 leading-snug">{metric.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
