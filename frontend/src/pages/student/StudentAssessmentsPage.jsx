import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, Trophy, Clock, CheckCircle, Award, Lock, Star,
  BarChart3, BookOpen, Target, Zap, ChevronRight, AlertCircle,
  Filter, Search, RefreshCw, Timer, Users, TrendingUp
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { getQuizList, getAttemptByQuizAndEmail, getStudentAttempts, getAttemptCount } from '@/services/quizService';
import { getCertificatesByEmail } from '@/services/certificateService';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, color }) {
  const colorMap = {
    purple: 'from-[#831B84]/10 to-[#FF6200]/10 text-[#831B84]',
    emerald: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
    amber: 'from-amber-500/10 to-orange-500/10 text-amber-600',
    blue: 'from-blue-500/10 to-indigo-500/10 text-blue-600'
  };
  return (
    <div className={`rounded-[20px] bg-gradient-to-br ${colorMap[color] || colorMap.purple} border border-white/5 p-5 flex items-center gap-4`}>
      <div className="h-11 w-11 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{label}</p>
      </div>
    </div>
  );
}

// ─── Quiz Card ────────────────────────────────────────────────────────────────

function QuizCard({ quiz, attempt, attemptsUsed, onStart, cert }) {
  const status = attempt ? (attempt.passed ? 'passed' : 'failed') : 'not-started';
  const maxAttempts = quiz.maxAttempts || 2;
  const canRetake = !attempt?.passed && attemptsUsed < maxAttempts;

  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
  };

  const gradeColor = (g) => {
    if (!g) return '';
    if (['A+', 'A'].includes(g)) return 'text-emerald-600 dark:text-emerald-400';
    if (['B+', 'B'].includes(g)) return 'text-blue-600 dark:text-blue-400';
    if (g === 'C') return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="group rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Color accent top */}
      <div className={`h-1.5 w-full ${
        status === 'passed' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
        status === 'failed' ? 'bg-gradient-to-r from-rose-400 to-pink-500' :
        'bg-gradient-to-r from-[#831B84] to-[#FF6200]'
      }`} />

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {quiz.status === 'Published' && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${difficultyColors['Medium']}`}>
                {quiz.subject}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#831B84] dark:group-hover:text-[#FF6200] transition-colors">
              {quiz.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{quiz.course}</p>
          </div>

          {/* Score badge */}
          {attempt && (
            <div className={`shrink-0 text-center rounded-2xl border-2 px-3 py-2 ${
              attempt.passed
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10'
                : 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/10'
            }`}>
              <p className={`text-xl font-black ${gradeColor(attempt.grade)}`}>{attempt.percentage}%</p>
              <p className={`text-[10px] font-bold ${gradeColor(attempt.grade)}`}>{attempt.grade}</p>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {quiz.timeLimitMinutes} min</span>
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {quiz.questions?.length || 0} questions</span>
          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Pass: {quiz.passingPercentage}%</span>
          <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> {quiz.totalMarks} marks</span>
        </div>

        {/* Attempt tracker */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>Attempts: {attemptsUsed} / {maxAttempts}</span>
          {quiz.dueDate && <span>Due: {new Date(quiz.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
        </div>

        {/* Per-question result bar (if attempted) */}
        {attempt && (
          <div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${attempt.passed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-pink-500'}`}
                style={{ width: `${attempt.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Score: {attempt.earnedMarks}/{attempt.totalMarks}</span>
              <span>{attempt.passed ? '✓ Passed' : `✗ Need ${quiz.passingPercentage}%`}</span>
            </div>
          </div>
        )}

        {/* Certificate banner */}
        {cert && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-3 py-2">
            <Award className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 flex-1">Certificate earned — ID: {cert.certificateId}</p>
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-1">
          {!attempt ? (
            <Button
              onClick={() => onStart(quiz.id)}
              variant="primary"
              className="w-full rounded-2xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold border-0 cursor-pointer py-3 flex items-center justify-center gap-2 hover:opacity-90 shadow-md"
            >
              <PlayCircle className="h-4 w-4" /> Start Quiz
            </Button>
          ) : attempt.passed ? (
            <Button
              onClick={() => onStart(quiz.id)}
              variant="outline"
              className="w-full rounded-2xl border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer py-3 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" /> View Results
            </Button>
          ) : canRetake ? (
            <Button
              onClick={() => onStart(quiz.id)}
              variant="outline"
              className="w-full rounded-2xl border-amber-400/30 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 font-bold cursor-pointer py-3 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Retake Quiz ({maxAttempts - attemptsUsed} left)
            </Button>
          ) : (
            <Button
              onClick={() => onStart(quiz.id)}
              variant="outline"
              className="w-full rounded-2xl border-slate-200 dark:border-[#334155] text-slate-500 font-bold cursor-pointer py-3 flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4" /> View Results
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentAssessmentsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useStudentAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const email = user?.email || 'abhay.kumawat@xebia.com';

  useEffect(() => {
    setQuizzes(getQuizList().filter(q => q.status === 'Published'));
    setAttempts(getStudentAttempts(email));
    setCertificates(getCertificatesByEmail(email));
    setLoading(false);
  }, [email]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.course.toLowerCase().includes(search.toLowerCase()) ||
        q.subject.toLowerCase().includes(search.toLowerCase());
      const attempt = attempts.find(a => a.quizId === q.id);
      const matchFilter =
        filterStatus === 'All' ||
        (filterStatus === 'Not Started' && !attempt) ||
        (filterStatus === 'Passed' && attempt?.passed) ||
        (filterStatus === 'Failed' && attempt && !attempt.passed);
      return matchSearch && matchFilter;
    });
  }, [quizzes, attempts, search, filterStatus]);

  const stats = useMemo(() => {
    const passed = attempts.filter(a => a.passed).length;
    const total = quizzes.length;
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0;
    return { total, attempted: attempts.length, passed, avgScore };
  }, [quizzes, attempts]);

  const handleStart = (quizId) => {
    navigate('/student/quiz/run', { state: { quizId } });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#831B84] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 px-4 sm:px-6 lg:px-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Quizzes & Assessments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Attempt timed quizzes, track your scores, and earn certificates.
          </p>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} value={stats.total} label="Total Quizzes" color="purple" />
        <StatCard icon={PlayCircle} value={stats.attempted} label="Attempted" color="blue" />
        <StatCard icon={CheckCircle} value={stats.passed} label="Passed" color="emerald" />
        <StatCard icon={TrendingUp} value={`${stats.avgScore}%`} label="Average Score" color="amber" />
      </div>

      {/* ── Filter & Search ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes by title, course, or subject..."
            className="w-full rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#831B84] transition-colors placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Not Started', 'Passed', 'Failed'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                filterStatus === s
                  ? 'bg-[#831B84] text-white border-[#831B84]'
                  : 'border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111827] hover:border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quiz Grid ───────────────────────────────────────────────────────── */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-700">
          <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-500">No quizzes match your filters.</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setFilterStatus('All'); }}
            className="mt-3 text-sm text-[#831B84] font-bold cursor-pointer hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredQuizzes.map(quiz => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              attempt={attempts.find(a => a.quizId === quiz.id)}
              attemptsUsed={getAttemptCount(quiz.id, email)}
              onStart={handleStart}
              cert={certificates.find(c => c.quizName === quiz.title || c.assignmentName === quiz.title + ' (Quiz)')}
            />
          ))}
        </div>
      )}

      {/* ── Certificates Earned ─────────────────────────────────────────────── */}
      {certificates.length > 0 && (
        <div className="rounded-[24px] border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-6">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-amber-500" /> Your Certificates ({certificates.length})
          </h2>
          <div className="space-y-3">
            {certificates.map(cert => (
              <div key={cert.id} className="flex items-center justify-between gap-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#334155] p-4">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{cert.courseName || cert.assignmentName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {cert.certificateId} · Issued: {cert.completionDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-lg">
                    {cert.grade} · {cert.finalPercentage}%
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/student/assessments/certificate', { state: { certificateId: cert.certificateId } })}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6200] text-white text-[10px] font-black cursor-pointer border-0 hover:opacity-90"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
