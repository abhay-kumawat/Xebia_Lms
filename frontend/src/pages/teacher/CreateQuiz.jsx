import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Plus, Trash2, Save, Send, ChevronDown,
  ChevronUp, Timer, BookOpen, Settings, CheckSquare, ToggleLeft,
  Star, AlertCircle, Grip, Eye, EyeOff, Loader2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { createQuiz } from '@/services/quizService';
import { generateQuizQuestions, getDomainLabel } from '@/services/questionGeneratorService';

const COURSES = [
  'Generative AI Foundations',
  'Spring Boot Enterprise APIs',
  'Docker & Kubernetes Mastery',
  'Python & Data Engineering',
  'Web Security & OWASP',
  'Microservices Architecture',
  'Data Science with Python',
  'Java Full Stack Development'
];

const SUBJECTS = [
  'Artificial Intelligence', 'Backend Development', 'DevOps Engineering',
  'Data Science', 'Web Security', 'Frontend Development', 'Cloud Computing', 'Database Engineering'
];

const EMPTY_MCQ = () => ({
  id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: 'MCQ',
  text: '',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
  marks: 2,
  bloom: 'Understand'
});

const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];
const Q_TYPES = ['MCQ', 'True/False', 'Multi-Select', 'Fill-in-Blank'];

// ─── Question Editor Block ────────────────────────────────────────────────────

function QuestionEditor({ q, idx, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const update = (field, val) => onUpdate(q.id, field, val);
  const updateOption = (i, val) => {
    const opts = [...q.options];
    opts[i] = val;
    update('options', opts);
  };

  const ensureOptions = (type) => {
    if (type === 'True/False') return ['True', 'False'];
    if (type === 'MCQ' || type === 'Multi-Select' || type === 'Fill-in-Blank') {
      return q.options?.length === 4 ? q.options : ['', '', '', ''];
    }
    return q.options || ['', '', '', ''];
  };

  return (
    <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/50 dark:bg-[#1E293B]/30 border-b border-slate-100 dark:border-[#334155]/50">
        <Grip className="h-4 w-4 text-slate-300 cursor-grab shrink-0" />
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span className="h-6 w-6 rounded-full bg-[#831B84]/10 text-[#831B84] text-[10px] font-black flex items-center justify-center shrink-0">
            {idx + 1}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate flex-1 max-w-xs">
            {q.text || 'New question...'}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
            {q.type}
          </span>
          <span className="text-[9px] font-black text-[#FF6200]">{q.marks}m</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => !isFirst && onMoveUp(q.id)} disabled={isFirst}
            className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer border-0 bg-transparent">
            <ChevronUp className="h-3 w-3" />
          </button>
          <button type="button" onClick={() => !isLast && onMoveDown(q.id)} disabled={isLast}
            className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer border-0 bg-transparent">
            <ChevronDown className="h-3 w-3" />
          </button>
          <button type="button" onClick={() => setCollapsed(c => !c)}
            className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent">
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
          <button type="button" onClick={() => onDelete(q.id)}
            className="h-6 w-6 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-600 cursor-pointer border-0 bg-transparent">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-5 space-y-4">
          {/* Type + Marks + Bloom row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Type</label>
              <select value={q.type} onChange={e => {
                update('type', e.target.value);
                update('options', ensureOptions(e.target.value));
                update('correct', 0);
              }}
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-[#831B84] dark:text-slate-200">
                {Q_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Marks</label>
              <input type="number" min="1" max="10" value={q.marks} onChange={e => update('marks', parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-[#831B84] dark:text-slate-200" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bloom's Level</label>
              <select value={q.bloom} onChange={e => update('bloom', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-[#831B84] dark:text-slate-200">
                {BLOOM_LEVELS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Question Text *</label>
            <textarea
              rows={3}
              value={q.text}
              onChange={e => update('text', e.target.value)}
              placeholder="Enter the question statement..."
              className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs outline-none focus:border-[#831B84] dark:text-slate-200 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Options */}
          {(q.type === 'MCQ' || q.type === 'Multi-Select' || q.type === 'Fill-in-Blank') && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Answer Options {q.type === 'Multi-Select' ? '(check all correct)' : '(select correct)'}
              </label>
              {(q.options || ['', '', '', '']).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type={q.type === 'Multi-Select' ? 'checkbox' : 'radio'}
                    name={`correct-${q.id}`}
                    checked={q.type === 'Multi-Select'
                      ? (Array.isArray(q.correct) ? q.correct.includes(i) : q.correct === i)
                      : q.correct === i}
                    onChange={() => {
                      if (q.type === 'Multi-Select') {
                        const current = Array.isArray(q.correct) ? q.correct : [q.correct];
                        const newCorrect = current.includes(i) ? current.filter(x => x !== i) : [...current, i];
                        update('correct', newCorrect);
                      } else {
                        update('correct', i);
                      }
                    }}
                    className="accent-[#831B84] h-4 w-4 shrink-0 cursor-pointer"
                  />
                  <span className="text-[10px] font-black text-slate-400 w-4 shrink-0">{String.fromCharCode(65 + i)}</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-[#831B84] dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              ))}
            </div>
          )}

          {q.type === 'True/False' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correct Answer</label>
              <div className="flex gap-4">
                {['True', 'False'].map((opt, i) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
                    <input type="radio" name={`correct-${q.id}`} checked={q.correct === i} onChange={() => update('correct', i)}
                      className="accent-[#831B84] h-4 w-4 cursor-pointer" />
                    {i === 0 ? '✓' : '✗'} {opt}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Explanation (teacher only) */}
          <div>
            <button type="button" onClick={() => setShowExplanation(e => !e)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer border-0 bg-transparent hover:text-slate-600 mb-1">
              {showExplanation ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showExplanation ? 'Hide' : 'Add'} Explanation (shown to student after submission)
            </button>
            {showExplanation && (
              <textarea
                rows={2}
                value={q.explanation}
                onChange={e => update('explanation', e.target.value)}
                placeholder="Explain why the correct answer is correct..."
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-xs outline-none focus:border-[#831B84] dark:text-slate-200 resize-none placeholder:text-slate-400"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1=Settings, 2=Questions
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState(COURSES[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [passingPct, setPassingPct] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [randomizeQ, setRandomizeQ] = useState(true);
  const [randomizeOpts, setRandomizeOpts] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [difficulty, setDifficulty] = useState('Medium');
  const [aiCount, setAiCount] = useState(15);

  // Questions
  const [questions, setQuestions] = useState([]);

  const totalMarks = questions.reduce((s, q) => s + (q.marks || 2), 0);

  // ── Question Mutation Helpers ─────────────────────────────────────────────

  const addQuestion = () => setQuestions(prev => [...prev, EMPTY_MCQ()]);

  const updateQuestion = useCallback((id, field, val) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: val } : q));
  }, []);

  const deleteQuestion = useCallback((id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const moveUp = useCallback((id) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx === 0) return prev;
      const n = [...prev];
      [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
      return n;
    });
  }, []);

  const moveDown = useCallback((id) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx === prev.length - 1) return prev;
      const n = [...prev];
      [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
      return n;
    });
  }, []);

  // ── AI Generation ────────────────────────────────────────────────────────

  const handleAIGenerate = async () => {
    if (!title && !topic) {
      showToast('Please enter a quiz title or topic first.', 'warning');
      return;
    }
    setGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 1200)); // UX delay
      const generated = generateQuizQuestions(course, topic || title, difficulty, aiCount, randomizeOpts);
      const mapped = generated.map(q => ({
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: q.type,
        text: q.text,
        options: q.options || ['True', 'False'],
        correct: q.correct,
        explanation: q.explanation || '',
        marks: q.marks || 2,
        bloom: q.bloom || 'Understand'
      }));
      setQuestions(mapped);
      const domain = getDomainLabel(course, topic);
      showToast(`✨ Generated ${mapped.length} ${domain} questions!`, 'success');
      if (step === 1) setStep(2);
    } catch (e) {
      showToast('Generation failed. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // ── Save / Publish ────────────────────────────────────────────────────────

  const handleSave = async (status) => {
    if (!title.trim()) { showToast('Quiz title is required.', 'error'); return; }
    if (questions.length < 1) { showToast('Add at least 1 question.', 'error'); return; }

    const incomplete = questions.filter(q => !q.text.trim());
    if (incomplete.length > 0) {
      showToast(`${incomplete.length} question(s) have no text. Please fill them in.`, 'warning');
      return;
    }

    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const quiz = {
        title,
        course,
        subject,
        description,
        teacherName: 'Siddharth Sen',
        timeLimitMinutes: parseInt(timeLimit) || 15,
        passingPercentage: parseInt(passingPct) || 70,
        totalMarks,
        maxAttempts: parseInt(maxAttempts) || 2,
        dueDate,
        randomizeQuestions: randomizeQ,
        randomizeOptions: randomizeOpts,
        showExplanations,
        status,
        questions
      };
      createQuiz(quiz);
      showToast(status === 'Published' ? '🚀 Quiz published successfully!' : 'Quiz saved as draft.', 'success');
      navigate('/teacher/assessments');
    } catch (e) {
      showToast('Failed to save quiz.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-16">

      {/* ── Top Header ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-6 lg:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/teacher/assessments')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 cursor-pointer transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white">Create Quiz</h1>
            <p className="text-[10px] text-slate-500">{questions.length} questions · {totalMarks} total marks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs border-0 cursor-pointer hover:opacity-90 shadow-md disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {generating ? 'Generating...' : '✨ AI Generate'}
          </button>
          <Button onClick={() => handleSave('Draft')} disabled={saving} variant="outline"
            className="rounded-xl border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer">
            <Save className="h-3.5 w-3.5 mr-1" /> Draft
          </Button>
          <Button onClick={() => handleSave('Published')} disabled={saving} variant="primary"
            className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold border-0 cursor-pointer text-xs shadow-md">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
            Publish
          </Button>
        </div>
      </div>

      {/* ── Step Tabs ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-6 lg:px-8">
        <div className="flex gap-1 py-2">
          {[{ i: 1, label: 'Quiz Settings', icon: Settings }, { i: 2, label: `Questions (${questions.length})`, icon: BookOpen }].map(({ i, label, icon: Icon }) => (
            <button key={i} type="button" onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border-0 ${
                step === i ? 'bg-[#831B84]/10 text-[#831B84] dark:text-[#FF6200]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
              }`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 mt-6 space-y-6">

        {/* ── Step 1: Settings ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* AI Generate Banner */}
            <div className="rounded-[20px] bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-300/30 dark:border-violet-700/30 p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-violet-500" /> AI Question Generation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fill in the settings below, then click "AI Generate" to instantly create {aiCount}+ quiz questions tailored to your course and topic.
                </p>
              </div>
              <button type="button" onClick={handleAIGenerate} disabled={generating}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-xs cursor-pointer border-0 hover:opacity-90 shadow-md disabled:opacity-60 flex items-center gap-2">
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {generating ? 'Generating...' : 'Generate Now'}
              </button>
            </div>

            <div className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#831B84]" /> Basic Settings
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quiz Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Spring Boot Security & JWT Quiz"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white placeholder:text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course</label>
                  <select value={course} onChange={e => setCourse(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white">
                    {COURSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Topic / Module <span className="text-slate-300">(used for AI generation)</span>
                </label>
                <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. JWT Authentication, Docker Networking, Transformers..."
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white placeholder:text-slate-400" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of the quiz..."
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white resize-none placeholder:text-slate-400" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Time Limit (min)', value: timeLimit, onChange: setTimeLimit, type: 'number', min: 5 },
                  { label: 'Passing %', value: passingPct, onChange: setPassingPct, type: 'number', min: 30, max: 100 },
                  { label: 'Max Attempts', value: maxAttempts, onChange: setMaxAttempts, type: 'number', min: 1, max: 5 },
                  { label: 'AI Question Count', value: aiCount, onChange: setAiCount, type: 'number', min: 5, max: 30 },
                ].map(({ label, value, onChange, type, min, max }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                    <input type={type} min={min} max={max} value={value} onChange={e => onChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-[#831B84] dark:text-white" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  { label: 'Randomize Question Order', val: randomizeQ, set: setRandomizeQ },
                  { label: 'Randomize Option Order', val: randomizeOpts, set: setRandomizeOpts },
                  { label: 'Show Explanations After Submit', val: showExplanations, set: setShowExplanations }
                ].map(({ label, val, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => set(v => !v)}
                      className={`h-5 w-9 rounded-full transition-all cursor-pointer ${val ? 'bg-[#831B84]' : 'bg-slate-300 dark:bg-slate-700'} relative`}>
                      <div className={`h-4 w-4 rounded-full bg-white shadow absolute top-0.5 transition-all ${val ? 'left-4' : 'left-0.5'}`} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} variant="primary"
                className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold border-0 cursor-pointer px-6 py-3">
                Next: Add Questions →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Questions ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Quiz Questions <span className="text-slate-400 font-bold">({questions.length})</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Total: {totalMarks} marks · Passing: {Math.round((passingPct / 100) * totalMarks)} marks</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleAIGenerate} disabled={generating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs border-0 cursor-pointer hover:opacity-90 shadow-md disabled:opacity-60">
                  {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Regenerate
                </button>
                <button type="button" onClick={addQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#831B84]/30 bg-[#831B84]/5 text-[#831B84] font-bold text-xs cursor-pointer hover:bg-[#831B84]/10">
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-16 rounded-[24px] border-2 border-dashed border-violet-300/40 dark:border-violet-700/30 bg-violet-50/30 dark:bg-violet-900/5">
                <Sparkles className="h-10 w-10 text-violet-400 mx-auto mb-3" />
                <h4 className="font-black text-slate-700 dark:text-slate-300">No questions yet</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">Use AI generation or add manually</p>
                <div className="flex justify-center gap-3">
                  <button type="button" onClick={handleAIGenerate} disabled={generating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs cursor-pointer border-0 flex items-center gap-2 disabled:opacity-60">
                    {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    AI Generate Questions
                  </button>
                  <button type="button" onClick={addQuestion}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:border-slate-300 bg-white dark:bg-[#111827] flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5" /> Add Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <QuestionEditor
                    key={q.id}
                    q={q}
                    idx={idx}
                    onUpdate={updateQuestion}
                    onDelete={deleteQuestion}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    isFirst={idx === 0}
                    isLast={idx === questions.length - 1}
                  />
                ))}
                <button type="button" onClick={addQuestion}
                  className="w-full py-4 rounded-[20px] border-2 border-dashed border-slate-200 dark:border-[#334155] text-slate-400 hover:text-[#831B84] hover:border-[#831B84]/30 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 bg-transparent">
                  <Plus className="h-4 w-4" /> Add Another Question
                </button>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setStep(1)} variant="outline"
                className="rounded-xl border-slate-200 dark:border-[#334155] text-slate-600 font-bold cursor-pointer">
                ← Back to Settings
              </Button>
              <div className="flex gap-3">
                <Button onClick={() => handleSave('Draft')} disabled={saving} variant="outline"
                  className="rounded-xl border-amber-400/30 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 font-bold cursor-pointer">
                  <Save className="h-3.5 w-3.5 mr-1" /> Save Draft
                </Button>
                <Button onClick={() => handleSave('Published')} disabled={saving} variant="primary"
                  className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold border-0 cursor-pointer shadow-md">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                  Publish Quiz
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
