import React, { useMemo, useState, useEffect } from 'react';
import { 
  BookOpen, Users, ClipboardCheck, Clock, ArrowUpRight, 
  TrendingUp, Award, Calendar, ChevronRight, Activity, AlertCircle, Plus, Download, Brain, Sparkles, Zap, Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { motion } from 'framer-motion';
import { getSubmissions } from '@/services/assessmentService';

const MOCK_ALERTS = [
  { id: 1, type: "grading", text: "Abhay Kumawat submitted Docker assessment", time: "10m ago", course: "Docker & Kubernetes Mastery" },
  { id: 2, type: "low_score", text: "Vikram Malhotra scored 65% in Data Science quiz", time: "2h ago", course: "Data Science with Pandas" },
  { id: 3, type: "enrollment", text: "Neha Patel enrolled in OAuth2 & JWT", time: "4h ago", course: "OAuth2 & JWT Architectures" }
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { courses, categories, hydrated } = useCatalog();
  const { showToast } = useToast();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotResponse, setCopilotResponse] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  // Load submissions on mount
  useEffect(() => {
    async function loadData() {
      try {
        const subList = await getSubmissions();
        setSubmissions(subList);
      } catch (err) {
        console.error("Failed to load submissions in dashboard:", err);
      }
    }
    loadData();
  }, []);

  const teacherCards = [
    { title: 'Managed Courses', sub: 'View all curriculum content', icon: BookOpen, to: '/teacher/courses', color: 'from-[#831B84] to-[#4A1E47]' },
    { title: 'Student Tracker', sub: 'Monitor learners and scores', icon: Users, to: '/teacher/students', color: 'from-[#FF6200] to-[#5B1E53]' },
    { title: 'Assessments', sub: 'Grade assignments & homework', icon: ClipboardCheck, to: '/teacher/assessments', color: 'from-[#4A1E47] to-[#331431]' },
    { title: 'Create Assignment', sub: 'Publish new assignments', icon: Plus, to: '/teacher/assessments/create', color: 'from-[#01AC9F] to-[#018d82]' },
    { title: 'Import Quiz', sub: 'Upload quiz templates from Excel', icon: Download, to: '/teacher/assessments/import-excel', color: 'from-[#5C4F61] to-[#3D3441]' },
    { title: 'Discussion Board', sub: 'Collaborate with student cohorts', icon: Activity, action: () => showToast('Opening discussion boards...', 'success'), color: 'from-[#793B74] to-[#51234E]' },
    { title: 'Grading Alerts', sub: 'Unprocessed grading submissions', icon: AlertCircle, action: () => showToast('1 pending grade assignment available.', 'info'), color: 'from-[#FF6200] to-[#cc4e00]' },
    { title: 'Teaching Calendar', sub: 'Schedule lecture times', icon: Calendar, action: () => setShowCalendar(true), color: 'from-[#855889] to-[#5C395F]' },
    { title: 'Resource Library', sub: 'PDFs, Videos, and study tools', icon: BookOpen, to: '/teacher/courses', color: 'from-[#91759E] to-[#674F73]' },
    { title: 'AI Copilot', sub: 'Create quizzes from prompt', icon: Brain, action: () => setShowCopilot(true), color: 'from-[#01AC9F] to-[#0b7f76]' },
    { title: 'Teacher Settings', sub: 'Personalize grading rubric parameters', icon: Clock, action: () => setShowSettings(true), color: 'from-[#5B1E53] to-[#3f1239]' },
    { title: 'Xebia Impact', sub: 'Key performance statistics', icon: Award, action: () => setShowImpact(true), color: 'from-[#831B84] to-[#FF6200]' }
  ];

  const handleGenerateQuiz = () => {
    if (!copilotInput.trim()) return;
    setCopilotLoading(true);
    setTimeout(() => {
      setCopilotResponse(`### AI Generated Quiz Outline for "${copilotInput}"\n\n1. **Question 1**: What is the primary advantage of this topic? (Multiple Choice)\n2. **Question 2**: Explain the lifecycle or architectural flow. (Short Answer)\n3. **Question 3**: Identify the best practices of deployment. (True/False)\n\n*Ready to export to Excel template.*`);
      setCopilotLoading(false);
    }, 1500);
  };

  const dynamicPerformance = useMemo(() => {
    if (!hydrated) return [];
    return courses.map(course => {
      const catName = categories.find(cat => cat.id === course.categoryId)?.name || 'General';
      const seed = course.id || 1;
      const activeStudents = (seed * 7) % 30 + 15;
      const passingRate = (seed * 3) % 15 + 83;
      const avgScore = (seed * 4) % 12 + 81;
      return {
        id: course.id,
        title: course.title,
        category: catName,
        activeStudents,
        passingRate,
        avgScore
      };
    });
  }, [courses, categories, hydrated]);

  const stats = useMemo(() => {
    const courseCount = courses?.length || 0;
    const catCount = categories?.filter(c => !c.deletedAt)?.length || 0;
    const totalStudents = courseCount * 12 + 101;
    const pendingCount = submissions.filter(s => s.status === 'Pending Evaluation').length;
    
    return [
      { title: 'My Managed Courses', value: String(courseCount), icon: BookOpen, change: `Across ${catCount} categories`, color: 'purple' },
      { title: 'Enrolled Students', value: String(totalStudents), icon: Users, change: 'Active this semester', color: 'emerald' },
      { title: 'Avg Passing Rate', value: '93%', icon: Award, change: 'Target rate is 90%', color: 'blue' },
      { title: 'Pending Submissions', value: String(pendingCount), icon: ClipboardCheck, change: 'Requires evaluation', color: 'orange' }
    ];
  }, [courses, categories, submissions]);

  const dynamicAlerts = useMemo(() => {
    const alertsList = [];
    const sorted = [...submissions].sort((a, b) => b.id - a.id);
    
    sorted.forEach((sub) => {
      if (sub.status === 'Pending Evaluation') {
        alertsList.push({
          id: `alert-sub-${sub.id}`,
          submissionId: sub.id,
          type: 'grading',
          text: `${sub.studentName} submitted ${sub.assessmentTitle}`,
          time: 'Just now',
          course: sub.assessmentTitle
        });
      } else if (sub.status === 'Graded' && sub.score < 70) {
        alertsList.push({
          id: `alert-sub-${sub.id}`,
          submissionId: sub.id,
          type: 'low_score',
          text: `${sub.studentName} scored ${sub.score}% in ${sub.assessmentTitle}`,
          time: 'Earlier today',
          course: sub.assessmentTitle
        });
      } else if (sub.status === 'Graded') {
        alertsList.push({
          id: `alert-sub-${sub.id}`,
          submissionId: sub.id,
          type: 'enrollment',
          text: `${sub.studentName} passed ${sub.assessmentTitle} (${sub.score}%)`,
          time: 'Earlier today',
          course: sub.assessmentTitle
        });
      }
    });

    if (alertsList.length === 0) {
      // Map mock alerts to mock IDs if necessary
      return MOCK_ALERTS.map(ma => {
        // Find matching student name in mock data or just fallback
        const matchSub = submissions.find(s => ma.text.includes(s.studentName));
        return {
          ...ma,
          submissionId: matchSub?.id || null
        };
      });
    }
    return alertsList.slice(0, 5);
  }, [submissions]);

  if (!hydrated) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Teacher Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-[0_35px_120px_-45px_rgba(76,29,149,0.9)] text-white select-none"
        style={{ background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 34%, #312E81 68%, #0F172A 100%)' }}
      >
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,transparent_35%,transparent_65%,rgba(255,255,255,0.06)_100%)] pointer-events-none" />
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              Instructor Workspace
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back to your dashboard! 📚
            </h2>
            <p className="text-sm text-purple-200/80 max-w-xl font-medium">
              Author curriculum, configure assessment quizzes, review student tracking scores, and manage course settings from a unified portal.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/8 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] text-white/50 font-bold uppercase">Courses</p>
              <p className="text-xl font-black text-emerald-300">{courses.length}</p>
            </div>
            <div className="bg-white/8 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] text-white/50 font-bold uppercase">Students</p>
              <p className="text-xl font-black text-purple-300">{courses.length * 12 + 101}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Shoolini-style Visual LMS Teacher Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 select-none">
        {teacherCards.map((card, idx) => {
          const Icon = card.icon;
          const content = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: '0 20px 30px rgba(108,29,95,0.12)' }}
              className={`group relative overflow-hidden rounded-[28px] p-6 text-white shadow-md cursor-pointer h-44 bg-gradient-to-br ${card.color} flex flex-col justify-between`}
            >
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-300 pointer-events-none">
                <Icon size={100} strokeWidth={1} />
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                  Instructor Portal
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Performance Table (2/3 col) */}
        <div className="lg:col-span-2 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Course Performance</h3>
              <p className="text-xs text-slate-400">Average metrics and metrics from active classes</p>
            </div>
            <Link to="/teacher/courses">
              <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">
                View All Courses
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-xs font-bold text-slate-400 uppercase tracking-wider pb-3">
                  <th className="pb-3">Course Title</th>
                  <th className="pb-3 text-center">Active Enrolled</th>
                  <th className="pb-3 text-center">Avg Score</th>
                  <th className="pb-3 text-center">Passing Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {dynamicPerformance.map(course => (
                  <tr key={course.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.005]">
                    <td className="py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{course.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{course.category}</p>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {course.activeStudents} students
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-emerald-500 font-black">{course.avgScore}%</span>
                    </td>
                    <td className="py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {course.passingRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts and Activity Feed (1/3 col) */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Action Alerts</h3>
            <p className="text-xs text-slate-400">Events requiring instructor review</p>
          </div>

          <div className="space-y-4">
            {dynamicAlerts.map(alert => (
              <div 
                key={alert.id}
                onClick={() => {
                  if (alert.submissionId) {
                    navigate(`/teacher/assessments/grade/${alert.submissionId}`);
                  } else {
                    navigate('/teacher/assessments');
                  }
                }}
                className="flex gap-3.5 rounded-2xl border border-slate-100 dark:border-white/[0.03] p-4 bg-slate-50/50 dark:bg-white/[0.005] hover:bg-slate-100 dark:hover:bg-white/[0.015] hover:border-[#831B84]/30 transition-all cursor-pointer select-none"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  alert.type === 'grading' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : alert.type === 'low_score'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {alert.text}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[120px] font-medium">{alert.course}</span>
                    <span className="font-bold text-slate-500">{alert.time}</span>
                  </div>
                  {alert.type === 'grading' && (
                    <div className="mt-2 flex justify-start">
                      <span className="text-[10px] font-black text-[#831B84] hover:text-[#681069] dark:text-[#FF6200] dark:hover:text-[#e05600] flex items-center gap-0.5">
                        Grade Now →
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-white/[0.05] pt-4.5">
            <Link to="/teacher/assessments">
              <Button className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer">
                Manage All Assessments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl border border-brand-border bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-black text-slate-850 dark:text-white">Teaching Calendar</h3>
              </div>
              <button onClick={() => setShowCalendar(false)} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            <div className="space-y-3.5">
              {[
                { day: 'Tuesday', time: '11:00 AM - 12:30 PM', topic: 'Docker Core Concepts & Image Building', students: 18 },
                { day: 'Thursday', time: '03:00 PM - 04:30 PM', topic: 'React Custom Hooks & Suspense API', students: 24 },
                { day: 'Friday', time: '02:00 PM - 03:00 PM', topic: 'AI Architecture Q&A Office Hours', students: 12 },
              ].map((slot) => (
                <div key={slot.day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <div>
                    <p className="text-xs font-black text-brand-primary uppercase tracking-wide">{slot.day}</p>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">{slot.topic}</h4>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{slot.time}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{slot.students} Students Nominated</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {showCopilot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl border border-brand-border bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#01AC9F]" />
                <h3 className="text-lg font-black text-slate-850 dark:text-white">AI Course Assistant Copilot</h3>
              </div>
              <button onClick={() => { setShowCopilot(false); setCopilotInput(''); setCopilotResponse(''); }} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">Generate Assessment Quiz</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter topic (e.g. AWS S3 Buckets, Docker Multi-stage builds)"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs outline-none"
                  />
                  <Button 
                    onClick={handleGenerateQuiz} 
                    disabled={copilotLoading}
                    className="bg-[#01AC9F] hover:bg-[#009b8f] border-0 text-white cursor-pointer px-4 rounded-xl py-2"
                  >
                    {copilotLoading ? 'Thinking...' : 'Generate'}
                  </Button>
                </div>
              </div>

              {copilotResponse && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl text-left text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-mono whitespace-pre-line max-h-56 overflow-y-auto">
                  {copilotResponse}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-brand-border bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-black text-slate-850 dark:text-white">Grading Rubrics Configuration</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-350">Quiz Passing Threshold</span>
                <span className="font-black text-brand-primary">70%</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-350">Assignment Grace Period</span>
                <span className="font-black text-brand-primary">24 hours</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-350">Zoho Approval Auto-Sync</span>
                <span className="font-black text-emerald-500">Enabled</span>
              </div>
              <Button onClick={() => { setShowSettings(false); showToast('Rubric settings updated successfully', 'success'); }} className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:opacity-90 border-0 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer">
                Save & Apply Rubric Changes
              </Button>
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
                <Award className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-black text-slate-850 dark:text-white">Your Instructor Analytics</h3>
              </div>
              <button onClick={() => setShowImpact(false)} className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>

            <div className="grid gap-4 grid-cols-2 text-center">
              {[
                { value: '145', label: 'Trained Students Graded', color: 'text-purple-650 bg-purple-50/50' },
                { value: '4.7/5', label: 'Avg Instructor Feedback', color: 'text-blue-650 bg-blue-50/50' },
                { value: '93.5%', label: 'Course Passing Rate', color: 'text-emerald-650 bg-emerald-50/50' },
                { value: '12', label: 'Curriculum Lectures Published', color: 'text-orange-650 bg-orange-50/50' },
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
  );
}
