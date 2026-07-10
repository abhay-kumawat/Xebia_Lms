import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle, AlertTriangle,
  Flag, Award, BookOpen, RotateCcw, ChevronRight, Send, Loader2,
  CheckSquare, Circle, Star, XCircle, Info
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import {
  getQuizForStudent, getAttemptByQuizAndEmail, getAttemptCount,
  saveInProgressAttempt, loadInProgressAttempt,
  saveTimer, loadTimer, submitQuizAttempt
} from '@/services/quizService';
import { checkAndIssueCertificate } from '@/services/certificateService';

// ─── Timer Display ────────────────────────────────────────────────────────────

function TimerDisplay({ secondsLeft, totalSeconds }) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isUrgent = secondsLeft < 120;
  const isCritical = secondsLeft < 30;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-sm font-black border transition-all ${
      isCritical ? 'bg-rose-600 text-white border-rose-700 animate-pulse' :
      isUrgent ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/30' :
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }`}>
      <Clock className={`h-4 w-4 ${isCritical ? 'animate-spin' : ''}`} />
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
      <div className="hidden md:block w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isCritical ? 'bg-white' : isUrgent ? 'bg-amber-500' : 'bg-[#831B84]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Question Navigator ───────────────────────────────────────────────────────

function QuestionNavigator({ questions, currentIdx, answers, flagged, onNavigate }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {questions.map((q, i) => {
        const answered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
        const isFlagged = flagged.has(q.id);
        const isCurrent = i === currentIdx;
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onNavigate(i)}
            className={`h-8 w-8 rounded-lg text-[10px] font-black transition-all border cursor-pointer ${
              isCurrent ? 'bg-[#831B84] text-white border-[#831B84] scale-110 shadow-md' :
              isFlagged ? 'bg-amber-400 text-white border-amber-500' :
              answered ? 'bg-emerald-500 text-white border-emerald-600' :
              'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#831B84]'
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

// ─── Question Renderers ───────────────────────────────────────────────────────

function MCQQuestion({ q, value, onChange }) {
  return (
    <div className="space-y-3">
      {q.options.map((opt, i) => (
        <label key={i} className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all select-none group ${
          value === i
            ? 'border-[#831B84] bg-[#831B84]/5 dark:bg-[#831B84]/10'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
        }`}>
          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            value === i ? 'border-[#831B84] bg-[#831B84]' : 'border-slate-300 dark:border-slate-600'
          }`}>
            {value === i && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <input type="radio" name={`q-${q.id}`} value={i} checked={value === i} onChange={() => onChange(i)} className="sr-only" />
          <span className={`text-sm ${value === i ? 'font-bold text-[#831B84] dark:text-[#FF6200]' : 'text-slate-700 dark:text-slate-200'}`}>
            <span className="font-black mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}

function TrueFalseQuestion({ q, value, onChange }) {
  return (
    <div className="flex gap-4">
      {['True', 'False'].map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(i)}
          className={`flex-1 py-5 rounded-2xl border-2 font-black text-base transition-all cursor-pointer ${
            value === i
              ? i === 0
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          {i === 0 ? '✓' : '✗'} {opt}
        </button>
      ))}
    </div>
  );
}

function MultiSelectQuestion({ q, value = [], onChange }) {
  const toggle = (i) => {
    const current = Array.isArray(value) ? value : [];
    const newVal = current.includes(i) ? current.filter(x => x !== i) : [...current, i];
    onChange(newVal);
  };
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
        <CheckSquare className="h-3 w-3" /> Select all that apply
      </p>
      {q.options.map((opt, i) => {
        const selected = Array.isArray(value) && value.includes(i);
        return (
          <label key={i} className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all select-none ${
            selected
              ? 'border-[#831B84] bg-[#831B84]/5 dark:bg-[#831B84]/10'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300'
          }`}>
            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
              selected ? 'border-[#831B84] bg-[#831B84]' : 'border-slate-300 dark:border-slate-600'
            }`}>
              {selected && <CheckCircle className="h-3 w-3 text-white" />}
            </div>
            <input type="checkbox" checked={selected} onChange={() => toggle(i)} className="sr-only" />
            <span className={`text-sm ${selected ? 'font-bold text-[#831B84] dark:text-[#FF6200]' : 'text-slate-700 dark:text-slate-200'}`}>
              <span className="font-black mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function FillInBlankQuestion({ q, value, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">Choose the correct word or phrase to fill in the blank:</p>
      <div className="grid grid-cols-2 gap-3">
        {(q.options || []).map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
              value === i
                ? 'border-[#831B84] bg-[#831B84]/10 text-[#831B84] dark:text-[#FF6200]'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function QuizResults({ result, quiz, onRetake, onBack, certificateId }) {
  const navigate = useNavigate();
  const [expandedQ, setExpandedQ] = useState(null);

  const gradeColors = {
    'A+': 'from-amber-500 to-[#FF6200]',
    'A': 'from-emerald-500 to-teal-500',
    'B+': 'from-blue-500 to-indigo-500',
    'B': 'from-blue-400 to-blue-600',
    'C': 'from-slate-400 to-slate-600',
    'D': 'from-orange-400 to-orange-600',
    'F': 'from-rose-500 to-pink-600'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Score Card */}
        <div className={`rounded-[28px] bg-gradient-to-br ${gradeColors[result.grade] || gradeColors['B']} p-8 text-white shadow-2xl text-center`}>
          <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            {result.passed ? <Award className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
          </div>
          <h2 className="text-3xl font-black">
            {result.passed ? 'Quiz Passed! 🎉' : 'Quiz Completed'}
          </h2>
          <p className="opacity-80 mt-1 text-sm">{quiz?.title}</p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/15 rounded-2xl p-4">
              <p className="text-3xl font-black">{result.percentage}%</p>
              <p className="text-xs uppercase tracking-wider opacity-80 mt-1">Score</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-4">
              <p className="text-3xl font-black">{result.grade}</p>
              <p className="text-xs uppercase tracking-wider opacity-80 mt-1">Grade</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-4">
              <p className="text-3xl font-black">{result.earnedMarks}/{result.totalMarks}</p>
              <p className="text-xs uppercase tracking-wider opacity-80 mt-1">Marks</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm opacity-80">
            <p>⏱ Time: {Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</p>
            <p>✓ Correct: {result.perQuestion.filter(q => q.isCorrect).length}/{result.perQuestion.length}</p>
          </div>
        </div>

        {/* Certificate section */}
        {certificateId && result.passed && (
          <div className="rounded-[20px] bg-gradient-to-r from-amber-500/10 to-[#FF6200]/10 border-2 border-amber-400/30 p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Certificate Earned!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your performance has earned you a certificate of completion.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/assessments/certificate', { state: { certificateId } })}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6200] text-white font-black text-sm cursor-pointer border-0 shadow-md hover:opacity-90 whitespace-nowrap"
            >
              View Certificate →
            </button>
          </div>
        )}

        {/* Per-question breakdown */}
        {quiz?.showExplanations && (
          <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#831B84]" /> Question Review & Explanations
            </h3>
            <div className="space-y-3">
              {result.perQuestion.map((pq, idx) => (
                <div key={pq.questionId} className={`rounded-2xl border p-4 ${
                  pq.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-900/10'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {pq.isCorrect
                        ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                        : <XCircle className="h-4 w-4 text-rose-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Q{idx + 1}: {pq.questionText}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">
                        <span className={`px-2 py-0.5 rounded-full ${pq.isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-800/30 dark:text-rose-300'}`}>
                          {pq.isCorrect ? `+${pq.earnedMarks} marks` : '0 marks'}
                        </span>
                        {!pq.isCorrect && pq.options && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Correct: {pq.type === 'Multi-Select'
                              ? (Array.isArray(pq.correctAnswer) ? pq.correctAnswer : [pq.correctAnswer]).map(i => pq.options[i]).join(', ')
                              : pq.options[pq.correctAnswer]}
                          </span>
                        )}
                      </div>
                      {pq.explanation && (
                        <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-black/20 rounded-xl p-2.5 flex gap-2">
                          <Info className="h-3 w-3 shrink-0 mt-0.5 text-blue-500" />
                          <p>{pq.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1 rounded-xl border-slate-200 dark:border-[#334155] font-bold cursor-pointer py-3">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Quizzes
          </Button>
          {!result.passed && onRetake && (
            <Button onClick={onRetake} variant="outline" className="flex-1 rounded-xl border-amber-400/30 text-amber-600 font-bold cursor-pointer py-3">
              <RotateCcw className="h-4 w-4 mr-1" /> Retake Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentQuizRunner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useStudentAuth();

  const quizId = location.state?.quizId;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [certificateId, setCertificateId] = useState(null);
  const [startTime] = useState(Date.now());

  const timerRef = useRef(null);
  const email = user?.email || 'abhay.kumawat@xebia.com';
  const studentName = user?.fullName || 'Abhay Kumawat';
  const enrollmentNo = user?.enrollmentNo || 'XEB-2026-081';

  // Load quiz
  useEffect(() => {
    if (!quizId) {
      showToast('No quiz selected.', 'error');
      navigate('/student/assessments');
      return;
    }
    const shuffleSeed = Date.now();
    const inProgress = loadInProgressAttempt(quizId, email);
    const loadedQuiz = getQuizForStudent(quizId, inProgress?.shuffleSeed || shuffleSeed);

    if (!loadedQuiz) {
      showToast('Quiz not found.', 'error');
      navigate('/student/assessments');
      return;
    }

    setQuiz(loadedQuiz);

    if (inProgress?.answers) {
      setAnswers(inProgress.answers);
      showToast('Resuming your saved quiz progress.', 'info');
    }

    const savedSeconds = loadTimer(quizId, email);
    const totalSeconds = (loadedQuiz.timeLimitMinutes || 15) * 60;
    setSecondsLeft(savedSeconds !== null ? savedSeconds : totalSeconds);
    setLoading(false);
  }, [quizId, email]);

  // Timer countdown
  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    timerRef.current = setTimeout(() => {
      const newSecs = secondsLeft - 1;
      setSecondsLeft(newSecs);
      if (newSecs % 10 === 0) saveTimer(quizId, email, newSecs);
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [secondsLeft, result]);

  // Save progress on answer change
  useEffect(() => {
    if (quiz && Object.keys(answers).length > 0) {
      saveInProgressAttempt(quizId, email, answers, quiz._shuffleSeed);
    }
  }, [answers]);

  const currentQuestion = quiz?.questions?.[currentIdx];
  const totalSeconds = (quiz?.timeLimitMinutes || 15) * 60;

  const handleAnswer = useCallback((qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  }, []);

  const toggleFlag = useCallback((qId) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId); else next.add(qId);
      return next;
    });
  }, []);

  const handleAutoSubmit = useCallback(async () => {
    showToast('⏰ Time is up! Submitting your quiz automatically.', 'warning');
    await doSubmit();
  }, [answers, quiz]);

  const doSubmit = useCallback(async () => {
    if (submitting || !quiz) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const res = submitQuizAttempt(quizId, email, studentName, enrollmentNo, answers, timeTaken);

    if (res) {
      // Try to issue certificate (quiz-only path)
      const certResult = checkAndIssueCertificate({
        studentEmail: email,
        studentName,
        enrollmentNo,
        courseName: quiz.course || 'Xebia Academy',
        assignmentTitle: quiz.title + ' (Quiz)',
        assignmentScore: res.percentage,
        assignmentPassing: quiz.passingPercentage || 70,
        quizScore: null,
        quizPassing: null,
        instructorName: quiz.teacherName || 'Instructor',
        subject: quiz.subject || 'Course Specialization',
        quizTitle: quiz.title,
        letterGrade: res.grade
      });

      if (certResult.issued) {
        setCertificateId(certResult.certificate.certificateId);
        showToast('🎉 Certificate earned! View it in your results.', 'success');
      }

      setResult(res);
    } else {
      showToast('Failed to submit quiz. Please try again.', 'error');
    }
    setSubmitting(false);
  }, [submitting, quiz, quizId, email, studentName, enrollmentNo, answers, startTime]);

  const handleSubmit = () => {
    const unanswered = quiz?.questions?.filter(q => answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === '').length || 0;
    if (unanswered > 0) {
      const go = window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`);
      if (!go) return;
    }
    doSubmit();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#831B84]" />
          <p className="text-xs font-bold text-slate-500">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // ── Already attempted ──────────────────────────────────────────────────────
  const existingAttempt = !result ? getAttemptByQuizAndEmail(quizId, email) : null;
  if (existingAttempt && !result) {
    return (
      <QuizResults
        result={existingAttempt}
        quiz={quiz}
        onBack={() => navigate('/student/assessments')}
        onRetake={
          getAttemptCount(quizId, email) < (quiz?.maxAttempts || 2)
            ? () => {
                localStorage.removeItem(`xebia-lms-quiz-attempts-inprogress-${quizId}-${email}`);
                window.location.reload();
              }
            : null
        }
        certificateId={existingAttempt.passed ? certificateId : null}
      />
    );
  }

  // ── Show results ───────────────────────────────────────────────────────────
  if (result) {
    return (
      <QuizResults
        result={result}
        quiz={quiz}
        onBack={() => navigate('/student/assessments')}
        onRetake={
          getAttemptCount(quizId, email) < (quiz?.maxAttempts || 2) && !result.passed
            ? () => window.location.reload()
            : null
        }
        certificateId={result.passed ? certificateId : null}
      />
    );
  }

  const answeredCount = quiz?.questions?.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length || 0;
  const progress = quiz?.questions?.length > 0 ? Math.round((answeredCount / quiz.questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-4 lg:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Exit quiz? Your progress is saved and you can resume.')) {
                navigate('/student/assessments');
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-slate-900 dark:text-white truncate">{quiz?.title}</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{quiz?.course} · {answeredCount}/{quiz?.questions?.length} answered</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <TimerDisplay secondsLeft={secondsLeft || 0} totalSeconds={totalSeconds} />
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="primary"
            className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold px-4 py-2 border-0 cursor-pointer text-xs flex items-center gap-1.5 shadow-md disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-[#831B84] to-[#FF6200] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 mt-6 grid gap-6 lg:grid-cols-4">

        {/* Sidebar: Navigator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Question Navigator
            </h3>
            <QuestionNavigator
              questions={quiz?.questions || []}
              currentIdx={currentIdx}
              answers={answers}
              flagged={flagged}
              onNavigate={setCurrentIdx}
            />
            <div className="mt-4 space-y-1.5 text-[9px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-emerald-500" /><span className="text-slate-500">Answered</span></div>
              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-amber-400" /><span className="text-slate-500">Flagged</span></div>
              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-[#831B84]" /><span className="text-slate-500">Current</span></div>
              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded border-2 border-slate-300 dark:border-slate-600" /><span className="text-slate-500">Not answered</span></div>
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Quiz Info</h3>
            {[
              { label: 'Questions', value: quiz?.questions?.length },
              { label: 'Total Marks', value: quiz?.totalMarks },
              { label: 'Passing', value: `${quiz?.passingPercentage}%` },
              { label: 'Answered', value: `${answeredCount} / ${quiz?.questions?.length}` },
              { label: 'Flagged', value: flagged.size }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-[11px]">
                <span className="text-slate-500">{label}</span>
                <span className="font-black text-slate-800 dark:text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Current Question */}
        <div className="lg:col-span-3">
          {currentQuestion && (
            <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 lg:p-8 shadow-sm">
              {/* Question header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-7 w-7 flex items-center justify-center rounded-full bg-[#831B84]/10 text-xs font-black text-[#831B84]">
                      {currentIdx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {currentQuestion.type}
                    </span>
                    <span className="text-[10px] font-black text-[#FF6200]">
                      {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}
                    </span>
                    {currentQuestion.bloom && (
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                        {currentQuestion.bloom}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold border cursor-pointer transition-all ${
                    flagged.has(currentQuestion.id)
                      ? 'bg-amber-400 text-white border-amber-500'
                      : 'border-slate-200 dark:border-[#334155] text-slate-400 hover:text-amber-500'
                  }`}
                >
                  <Flag className="h-3 w-3" />
                  <span>{flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>

              {/* Question input */}
              <div>
                {currentQuestion.type === 'MCQ' && (
                  <MCQQuestion
                    q={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={val => handleAnswer(currentQuestion.id, val)}
                  />
                )}
                {currentQuestion.type === 'True/False' && (
                  <TrueFalseQuestion
                    q={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={val => handleAnswer(currentQuestion.id, val)}
                  />
                )}
                {currentQuestion.type === 'Multi-Select' && (
                  <MultiSelectQuestion
                    q={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={val => handleAnswer(currentQuestion.id, val)}
                  />
                )}
                {currentQuestion.type === 'Fill-in-Blank' && (
                  <FillInBlankQuestion
                    q={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={val => handleAnswer(currentQuestion.id, val)}
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-[#334155] font-bold cursor-pointer disabled:opacity-40 px-5 py-2.5"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <span className="text-xs text-slate-400 font-bold">
                  {currentIdx + 1} of {quiz?.questions?.length}
                </span>

                {currentIdx < (quiz?.questions?.length || 1) - 1 ? (
                  <Button
                    onClick={() => setCurrentIdx(i => Math.min((quiz?.questions?.length || 1) - 1, i + 1))}
                    variant="primary"
                    className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold border-0 cursor-pointer px-5 py-2.5"
                  >
                    Next <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="primary"
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold border-0 cursor-pointer px-5 py-2.5 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? 'Submitting...' : 'Finish & Submit'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
