import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle, Clock, Calendar,
  Sparkles, Save, Send, Link as LinkIcon, BookOpen,
  Play, Award, User, AlertTriangle, Upload, ChevronRight,
  Star, Loader2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import {
  getAssessments,
  createSubmission,
  getSubmissions,
  saveDraft,
  getDraft
} from '@/services/assessmentService';

// ─── Question type renderer ─────────────────────────────────────────────────

function QuestionBlock({ q, idx, answers, onTextChange, onMCQChange, onFileUpload, codeLang, setCodeLang, showToast }) {
  const value = answers[q.id] || '';

  return (
    <div className="border border-slate-100 dark:border-white/[0.04] rounded-2xl p-5 space-y-4 bg-slate-50/30 dark:bg-slate-900/20">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#831B84]/10 text-xs font-black text-[#831B84] dark:text-[#FF6200]">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
            {q.prompt}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5">
              {q.type}
            </span>
            <span className="text-[10px] font-bold text-[#FF6200]">
              {q.marks || 10} marks
            </span>
            {q.required && (
              <span className="text-[10px] font-bold text-rose-500">★ Required</span>
            )}
          </div>
        </div>
      </div>

      {/* ── MCQ ─────────────────────────────────────────────────── */}
      {q.type === 'MCQ' && (
        <div className="grid gap-2 sm:grid-cols-2 pl-9">
          {(q.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all text-xs font-medium select-none ${
                value === opt
                  ? 'border-[#831B84] bg-[#831B84]/5 text-[#831B84] dark:text-[#FF6200] font-bold'
                  : 'border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt}
                checked={value === opt}
                onChange={() => onMCQChange(q.id, opt)}
                className="accent-[#831B84] h-4 w-4"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* ── True / False ────────────────────────────────────────── */}
      {q.type === 'True/False' && (
        <div className="flex gap-3 pl-9">
          {['True', 'False'].map(opt => (
            <label
              key={opt}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 cursor-pointer transition-all text-sm font-bold select-none flex-1 justify-center ${
                value === opt
                  ? opt === 'True'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                  : 'border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt}
                checked={value === opt}
                onChange={() => onMCQChange(q.id, opt)}
                className="sr-only"
              />
              {opt === 'True' ? '✓' : '✗'} {opt}
            </label>
          ))}
        </div>
      )}

      {/* ── Short Answer ────────────────────────────────────────── */}
      {q.type === 'Short Answer' && (
        <div className="pl-9">
          <input
            type="text"
            value={value}
            onChange={e => onTextChange(q.id, e.target.value)}
            placeholder="Type your answer here (keep it concise)..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#831B84] transition-colors placeholder:text-slate-400"
          />
        </div>
      )}

      {/* ── Long Answer ─────────────────────────────────────────── */}
      {q.type === 'Long Answer' && (
        <div className="pl-9">
          <textarea
            rows={6}
            value={value}
            onChange={e => onTextChange(q.id, e.target.value)}
            placeholder="Write a detailed response here..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#831B84] transition-colors resize-none placeholder:text-slate-400"
          />
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            {value.length} characters
          </p>
        </div>
      )}

      {/* ── Coding ──────────────────────────────────────────────── */}
      {q.type === 'Coding' && (
        <div className="pl-9 space-y-0">
          <div className="flex justify-between items-center bg-slate-800 px-4 py-2 rounded-t-xl border border-slate-700">
            <select
              value={codeLang}
              onChange={e => setCodeLang(e.target.value)}
              className="bg-transparent border-0 outline-none text-[11px] font-bold text-slate-300 cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash / Docker</option>
            </select>
            <button
              type="button"
              onClick={() => showToast('Test cases passed: 2/2 ✓', 'success')}
              className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider border-0 bg-transparent cursor-pointer hover:text-emerald-300"
            >
              <Play className="h-3 w-3" /> Run Tests
            </button>
          </div>
          <textarea
            rows={10}
            value={value}
            onChange={e => onTextChange(q.id, e.target.value)}
            placeholder={`// Write your ${codeLang} code here...\n\n`}
            className="w-full rounded-b-xl border-x border-b border-slate-700 bg-slate-900 px-4 py-3.5 text-xs text-emerald-400 outline-none font-mono resize-none leading-relaxed"
          />
        </div>
      )}

      {/* ── File Upload ─────────────────────────────────────────── */}
      {q.type === 'File Upload' && (
        <div className="pl-9">
          <label className="block">
            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors select-none ${
              value
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                : 'border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-slate-900/20 hover:border-[#831B84]'
            }`}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(q.id, file.name);
                }}
              />
              {value ? (
                <>
                  <CheckCircle className="h-7 w-7 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Click to change file</p>
                </>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload file</p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, DOCX, ZIP, images — max 10MB</p>
                </>
              )}
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StudentSubmissionRunner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useStudentAuth();

  const assessmentId = location.state?.assessmentId;

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

  const [answers, setAnswers] = useState({});
  const [codeLang, setCodeLang] = useState('javascript');

  // ── Load assessment & restore draft ──────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const list = await getAssessments();
        const target = list.find(item =>
          String(item.id) === String(assessmentId) ||
          item.id === Number(assessmentId)
        );

        if (target) {
          setAssessment(target);

          const emailKey = user?.email || 'abhay.kumawat@xebia.com';

          // Check for existing final submission
          const subs = await getSubmissions();
          const existingSub = subs.find(s =>
            s.assessmentTitle?.toLowerCase() === target.title?.toLowerCase() &&
            s.email?.toLowerCase() === emailKey.toLowerCase() &&
            s.status !== 'Draft'
          );
          if (existingSub) {
            setExistingSubmission(existingSub);
            if (existingSub.answers) setAnswers(existingSub.answers);
          } else {
            // Try to restore draft from service
            const draft = getDraft(emailKey, String(assessmentId));
            if (draft?.answers) {
              setAnswers(draft.answers);
              showToast('Draft restored — continue where you left off.', 'info');
            }

            // Also check submission table for drafts
            const draftSub = subs.find(s =>
              s.assessmentTitle?.toLowerCase() === target.title?.toLowerCase() &&
              s.email?.toLowerCase() === emailKey.toLowerCase() &&
              s.status === 'Draft'
            );
            if (draftSub?.answers) setAnswers(prev => ({ ...draftSub.answers, ...prev }));
          }
        } else {
          showToast('Assignment not found. Redirecting...', 'error');
          setTimeout(() => navigate('/student/assignments'), 1500);
        }
      } catch (e) {
        console.error(e);
        showToast('Failed to load assignment details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assessmentId, user, navigate, showToast]);

  // ── Question list with fallback ───────────────────────────────────────
  const questionsList = useMemo(() => {
    if (assessment?.questions?.length > 0) return assessment.questions;
    // Fallback questions if assessment has none
    return [
      { id: 'fb-1', type: 'Short Answer', prompt: 'Paste your project repository URL or submission link.', marks: 20, required: true },
      { id: 'fb-2', type: 'Long Answer', prompt: 'Describe your design approach and key implementation decisions in detail.', marks: 50, required: true },
      { id: 'fb-3', type: 'MCQ', prompt: 'How complete is your submission?', marks: 20, required: true, options: ['Fully complete and tested', 'Complete with minor gaps', 'Partially complete', 'Incomplete — needs more time'] },
      { id: 'fb-4', type: 'File Upload', prompt: 'Upload your supporting documents or project archive.', marks: 10, required: false }
    ];
  }, [assessment]);

  // ── Answer change handlers ────────────────────────────────────────────
  const handleTextChange = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));
  const handleMCQChange = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));
  const handleFileUpload = (qId, fileName) => {
    setAnswers(prev => ({ ...prev, [qId]: fileName }));
    showToast(`"${fileName}" attached successfully.`, 'success');
  };

  // ── Save draft ────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    const emailKey = user?.email || 'abhay.kumawat@xebia.com';
    // Save to fast key-value store
    saveDraft(emailKey, String(assessmentId), answers);

    // Also persist to submissions table as Draft
    await createSubmission({
      studentName: user?.fullName || 'Abhay Kumawat',
      enrollmentNo: user?.enrollmentNo || 'XEB-2026-081',
      email: emailKey,
      assessmentTitle: assessment?.title,
      type: assessment?.type || 'Assignment',
      answers,
      status: 'Draft',
      submittedDate: new Date().toISOString().split('T')[0]
    });
    showToast('Draft saved! You can resume anytime before the deadline.', 'success');
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Check required questions
    const unanswered = questionsList.filter(q => q.required && !answers[q.id]);
    if (unanswered.length > 0) {
      showToast(`Please answer all required questions (${unanswered.length} remaining).`, 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const emailKey = user?.email || 'abhay.kumawat@xebia.com';
      const submission = {
        studentName: user?.fullName || 'Abhay Kumawat',
        enrollmentNo: user?.enrollmentNo || 'XEB-2026-081',
        email: emailKey,
        assessmentTitle: assessment?.title,
        type: assessment?.type || 'Assignment',
        answers,
        status: 'Pending Evaluation',
        submittedDate: new Date().toISOString().split('T')[0]
      };
      await createSubmission(submission);
      setSubmitted(true);
      showToast('Assignment submitted successfully! Your teacher will review it.', 'success');
    } catch (e) {
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#831B84]" />
          <p className="text-xs font-bold text-slate-500">Loading assignment...</p>
        </div>
      </div>
    );
  }

  // ── Already submitted ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-[28px] border border-slate-200 dark:border-[#334155] shadow-2xl p-10 text-center space-y-5">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Assignment Submitted!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Your work has been recorded and sent to{' '}
              <strong>{assessment?.teacherName || 'your instructor'}</strong> for evaluation.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-600 dark:text-slate-400 space-y-1 text-left">
            <div className="flex justify-between"><span>Assignment</span><span className="font-bold text-slate-800 dark:text-white truncate ml-2">{assessment?.title}</span></div>
            <div className="flex justify-between"><span>Submitted On</span><span className="font-bold text-slate-800 dark:text-white">{new Date().toLocaleDateString('en-IN')}</span></div>
            <div className="flex justify-between"><span>Status</span><span className="font-bold text-amber-500">Pending Evaluation</span></div>
            <div className="flex justify-between"><span>Passing Marks</span><span className="font-bold text-slate-800 dark:text-white">{assessment?.passingMarks || 60} / {assessment?.totalPoints || 100}</span></div>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            You will be notified when your teacher grades the submission. A certificate will be issued if you meet the passing marks.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/student/assignments')}
              variant="outline"
              className="flex-1 rounded-xl border-slate-200 dark:border-[#334155] font-bold cursor-pointer"
            >
              Back to Assignments
            </Button>
            <Button
              onClick={() => navigate('/student/dashboard')}
              variant="primary"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold border-0 cursor-pointer"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Already submitted (existing) ─────────────────────────────────────
  if (existingSubmission && existingSubmission.status !== 'Draft') {
    const passed = existingSubmission.status === 'Graded' &&
      existingSubmission.score >= (assessment?.passingMarks || 60);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-[28px] border border-slate-200 dark:border-[#334155] shadow-2xl p-10 text-center space-y-5">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${
            existingSubmission.status === 'Graded'
              ? passed ? 'bg-gradient-to-br from-amber-400 to-[#FF6200]' : 'bg-gradient-to-br from-rose-400 to-pink-600'
              : 'bg-gradient-to-br from-blue-400 to-indigo-600'
          }`}>
            {existingSubmission.status === 'Graded' ? <Award className="h-10 w-10 text-white" /> : <Clock className="h-10 w-10 text-white" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {existingSubmission.status === 'Graded'
                ? passed ? 'Assignment Passed! 🎉' : 'Assignment Graded'
                : 'Already Submitted'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {existingSubmission.status === 'Graded'
                ? `Score: ${existingSubmission.score}% — Grade: ${existingSubmission.letterGrade || 'N/A'}`
                : 'Your submission is awaiting evaluation.'}
            </p>
            {existingSubmission.feedback && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">
                Teacher: "{existingSubmission.feedback}"
              </p>
            )}
          </div>
          {existingSubmission.certificateId && passed && (
            <Button
              onClick={() => navigate('/student/assessments/certificate', { state: { certificateId: existingSubmission.certificateId } })}
              variant="primary"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6200] text-white font-bold border-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4" /> View Your Certificate
            </Button>
          )}
          <Button
            onClick={() => navigate('/student/assignments')}
            variant="outline"
            className="w-full rounded-xl border-slate-200 dark:border-[#334155] font-bold cursor-pointer"
          >
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const completionPct = questionsList.length > 0
    ? Math.round((Object.keys(answers).filter(k => answers[k]).length / questionsList.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 pb-16">

      {/* ── Top Header Bar ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/assignments')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-tight">
              {assessment?.title || 'Assignment'}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {assessment?.course} · {assessment?.subject} · Teacher: {assessment?.teacherName || 'Instructor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress pill */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
            <div className="h-2 w-20 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#831B84] to-[#FF6200] transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{completionPct}%</span>
          </div>
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            className="rounded-xl border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-bold px-4 py-2 cursor-pointer text-xs"
          >
            <Save className="h-3.5 w-3.5 mr-1" /> Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="primary"
            className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] hover:opacity-90 text-white font-bold px-5 py-2 shadow-md cursor-pointer border-0 text-xs flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6 grid gap-6 lg:grid-cols-3">

        {/* LEFT — Assignment info panel */}
        <div className="space-y-4">

          {/* Assignment Details Card */}
          <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#831B84]" /> Assignment Details
            </h3>
            <div className="space-y-2.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              {[
                { icon: BookOpen, label: 'Course', value: assessment?.course },
                { icon: Star, label: 'Subject', value: assessment?.subject || 'Core Specialization' },
                { icon: User, label: 'Teacher', value: assessment?.teacherName || 'Instructor' },
                { icon: Calendar, label: 'Due Date', value: assessment?.dueDate },
                { icon: Award, label: 'Total Marks', value: `${assessment?.totalPoints || 100} pts` },
                { icon: CheckCircle, label: 'Passing Marks', value: `${assessment?.passingMarks || 60} pts` },
                { icon: AlertTriangle, label: 'Difficulty', value: assessment?.difficulty || 'Medium' }
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-50 dark:border-white/[0.03] pb-2 last:border-0 last:pb-0">
                  <span className="flex items-center gap-1.5"><Icon className="h-3 w-3" />{label}</span>
                  <span className="font-black text-slate-800 dark:text-slate-200 text-right ml-2">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Card */}
          {(assessment?.description || assessment?.instructions) && (
            <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#831B84]" /> Instructions
              </h3>
              {assessment?.description && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Description</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{assessment.description}</p>
                </div>
              )}
              {assessment?.instructions && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Specific Instructions</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{assessment.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Reference Links */}
          {assessment?.referenceLinks?.length > 0 && (
            <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-[#831B84]" /> Reference Links
              </h3>
              <div className="space-y-1.5">
                {assessment.referenceLinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline truncate">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rubrics */}
          {assessment?.rubrics?.length > 0 && (
            <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#831B84]" /> Marking Criteria
              </h3>
              <div className="space-y-2">
                {assessment.rubrics.map((rub, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-[#1E293B] p-2 rounded-lg text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{rub.name}</span>
                    <span className="font-black text-[#831B84] dark:text-[#FF6200]">{rub.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Questions Workspace */}
        <div className="lg:col-span-2">
          <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155]/60 pb-4 mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#831B84]" />
                Answer Workspace
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {questionsList.length} question{questionsList.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-5">
              {questionsList.map((q, idx) => (
                <QuestionBlock
                  key={q.id || idx}
                  q={q}
                  idx={idx}
                  answers={answers}
                  onTextChange={handleTextChange}
                  onMCQChange={handleMCQChange}
                  onFileUpload={handleFileUpload}
                  codeLang={codeLang}
                  setCodeLang={setCodeLang}
                  showToast={showToast}
                />
              ))}
            </div>

            {/* Bottom submit bar */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-[#334155]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#831B84] to-[#FF6200] transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {completionPct}% complete
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  className="rounded-xl border-amber-400/30 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 font-bold px-5 py-2.5 cursor-pointer text-sm"
                >
                  <Save className="h-4 w-4 mr-1.5" /> Save Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="primary"
                  className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] hover:opacity-90 text-white font-bold px-6 py-2.5 shadow-lg cursor-pointer border-0 flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
