import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  ChevronRight, ChevronLeft, Trash2, Download, BookOpen, Calendar,
  Clock, Target, BarChart2, Eye, EyeOff, Sparkles, Plus
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';

// ─── MOCK COURSES ──────────────────────────────────────────
const MOCK_COURSES = [
  'Generative AI Foundations',
  'Spring Boot Enterprise APIs',
  'Docker & Kubernetes Mastery',
  'Data Science with Pandas',
];

// ─── REQUIRED COLUMNS ──────────────────────────────────────
const REQUIRED_COLS = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];

// ─── SAMPLE TEMPLATE GENERATOR ─────────────────────────────
function downloadTemplate() {
  const ws_data = [
    ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Marks', 'Explanation'],
    [
      'What is a Docker container?',
      'A virtual machine',
      'A lightweight runtime environment',
      'A database engine',
      'A cloud service',
      'B',
      '5',
      'Containers package applications along with their dependencies into a portable runtime.',
    ],
    [
      'Which keyword is used to create a class in Java?',
      'object',
      'define',
      'class',
      'struct',
      'C',
      '5',
      'The "class" keyword defines a class in Java.',
    ],
    [
      'What does REST stand for?',
      'Representational State Transfer',
      'Remote Execution Shell Transfer',
      'Real-time Event Streaming Tool',
      'Recursive State Tree',
      'A',
      '5',
      '',
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quiz Questions');
  XLSX.writeFile(wb, 'quiz_template.xlsx');
}

// ─── STEP INDICATOR ────────────────────────────────────────
function StepBar({ current }) {
  const steps = [
    { label: 'Upload & Preview', icon: <Upload className="h-4 w-4" /> },
    { label: 'Configure Quiz', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Confirm & Publish', icon: <CheckCircle className="h-4 w-4" /> },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            i < current
              ? 'text-emerald-600 dark:text-emerald-400'
              : i === current
              ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 dark:text-slate-600'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              i < current
                ? 'bg-emerald-500 text-white'
                : i === current
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              {i < current ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className="hidden sm:block">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-1 ${i < current ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── STEP 1: UPLOAD & PREVIEW ──────────────────────────────
function StepUpload({ questions, setQuestions, onNext }) {
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseExcel = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      showToast('Please upload a valid .xlsx or .xls file.', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        // Validate headers
        if (rows.length === 0) {
          showToast('The Excel file is empty.', 'error');
          return;
        }
        const keys = Object.keys(rows[0]);
        const missing = REQUIRED_COLS.filter(c => !keys.includes(c));
        if (missing.length > 0) {
          showToast(`Missing columns: ${missing.join(', ')}`, 'error');
          setErrors(missing.map(m => `Missing required column: "${m}"`));
          return;
        }

        // Parse questions
        const rowErrors = [];
        const parsed = rows.map((row, i) => {
          const rowNum = i + 2;
          const errs = [];
          if (!row['Question']?.toString().trim()) errs.push(`Row ${rowNum}: Question is empty`);
          if (!row['Option A']?.toString().trim()) errs.push(`Row ${rowNum}: Option A is empty`);
          if (!row['Option B']?.toString().trim()) errs.push(`Row ${rowNum}: Option B is empty`);
          if (!row['Option C']?.toString().trim()) errs.push(`Row ${rowNum}: Option C is empty`);
          if (!row['Option D']?.toString().trim()) errs.push(`Row ${rowNum}: Option D is empty`);
          const ans = row['Correct Answer']?.toString().trim().toUpperCase();
          if (!['A', 'B', 'C', 'D'].includes(ans)) errs.push(`Row ${rowNum}: Correct Answer must be A, B, C, or D`);
          rowErrors.push(...errs);
          return {
            id: i + 1,
            question: row['Question']?.toString().trim(),
            optionA: row['Option A']?.toString().trim(),
            optionB: row['Option B']?.toString().trim(),
            optionC: row['Option C']?.toString().trim(),
            optionD: row['Option D']?.toString().trim(),
            correctAnswer: ans,
            marks: parseInt(row['Marks']) || 1,
            explanation: row['Explanation']?.toString().trim() || '',
          };
        }).filter(q => q.question);

        setErrors(rowErrors);
        setQuestions(parsed);
        setShowPreview(true);

        if (rowErrors.length === 0) {
          showToast(`✅ Successfully parsed ${parsed.length} questions!`, 'success');
        } else {
          showToast(`Parsed ${parsed.length} questions with ${rowErrors.length} warnings.`, 'error');
        }
      } catch {
        showToast('Failed to read the Excel file. Please check the format.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [showToast, setQuestions]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    parseExcel(e.dataTransfer.files[0]);
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Download Template Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.04] px-5 py-4">
        <div>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">📥 Need the Excel template?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Download a ready-to-fill template with the correct column format.</p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-white dark:bg-[#111827] px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[24px] p-12 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all ${
          dragOver
            ? 'border-emerald-500 bg-emerald-500/5 scale-[1.01]'
            : questions.length > 0
            ? 'border-emerald-500/40 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.02]'
            : 'border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#1E293B]/20 hover:border-emerald-500/50 dark:hover:border-emerald-500/30'
        }`}
      >
        <input
          type="file"
          ref={fileRef}
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => parseExcel(e.target.files[0])}
        />

        {questions.length > 0 ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">{fileName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-500">{questions.length} questions</span> parsed successfully
            </p>
            <p className="text-[11px] text-slate-400 mt-2">Click or drag to replace the file</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#1E293B] flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              Drop your Excel file here
            </p>
            <p className="text-sm text-slate-400 mt-1">or click to browse from your computer</p>
            <p className="text-[11px] text-slate-400 mt-3 bg-slate-100 dark:bg-[#1E293B] px-3 py-1 rounded-full">
              Supports .xlsx and .xls files
            </p>
          </>
        )}
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-1.5">
          <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            {errors.length} validation warning{errors.length > 1 ? 's' : ''} found:
          </p>
          {errors.map((err, i) => (
            <p key={i} className="text-[11px] text-red-500 pl-5">• {err}</p>
          ))}
        </div>
      )}

      {/* Questions Preview Table */}
      {questions.length > 0 && (
        <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155]/60 bg-slate-50 dark:bg-white/[0.01]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Question Preview
              <Badge className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">{questions.length} Questions</Badge>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#334155]/60 bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-400 w-8">#</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-400">Question</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-400">Options</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-400 text-center">Answer</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-400 text-center">Marks</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-400 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {questions.map((q, i) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 py-3.5 text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-semibold max-w-xs">
                      <p className="line-clamp-2">{q.question}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs">
                      <div className="space-y-0.5">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <p key={opt} className={`text-[10px] ${q.correctAnswer === opt ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                            {opt}. {q[`option${opt}`]}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/20">
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">{q.marks}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-0 bg-transparent cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer action */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          disabled={questions.length === 0}
          variant="primary"
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold shadow-md border-0 text-white ${
            questions.length > 0
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          Configure Quiz Settings
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 2: CONFIGURE QUIZ ────────────────────────────────
function StepConfigure({ config, setConfig, questions, onNext, onBack }) {
  const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-7 shadow-sm space-y-5">

        {/* Quiz Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Quiz Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => setConfig(c => ({ ...c, title: e.target.value }))}
            placeholder="e.g. Docker Fundamentals Quiz"
            className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Course */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Associated Course</label>
          <select
            value={config.course}
            onChange={(e) => setConfig(c => ({ ...c, course: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
          >
            <option value="">— Select a course —</option>
            {MOCK_COURSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Duration + Passing % grid */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Duration (minutes)</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4 py-3.5">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="number"
                min={5}
                value={config.durationMinutes}
                onChange={(e) => setConfig(c => ({ ...c, durationMinutes: parseInt(e.target.value) || 30 }))}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none border-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Passing %</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4 py-3.5">
              <Target className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="number"
                min={1}
                max={100}
                value={config.passingPercent}
                onChange={(e) => setConfig(c => ({ ...c, passingPercent: parseInt(e.target.value) || 60 }))}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none border-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Due Date</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4 py-3.5">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={config.dueDate}
                onChange={(e) => setConfig(c => ({ ...c, dueDate: e.target.value }))}
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white outline-none border-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Questions', value: questions.length, icon: <BarChart2 className="h-4 w-4 text-emerald-500" /> },
          { label: 'Total Marks', value: totalMarks, icon: <Target className="h-4 w-4 text-emerald-500" /> },
          { label: 'Passing Marks', value: Math.ceil(totalMarks * config.passingPercent / 100), icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
        ].map((s, i) => (
          <div key={i} className="rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-5 text-center shadow-sm">
            <div className="flex justify-center mb-2">{s.icon}</div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button onClick={onBack} variant="ghost" className="rounded-xl border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-400 font-bold px-5 cursor-pointer bg-transparent flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!config.title.trim()}
          variant="primary"
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold shadow-md border-0 text-white ${
            config.title.trim()
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          Preview & Confirm
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 3: CONFIRM & PUBLISH ─────────────────────────────
function StepConfirm({ config, questions, onBack, onSubmit, submitting }) {
  const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);

  return (
    <div className="space-y-6">
      {/* Quiz summary card */}
      <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.03] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">{config.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{config.course || 'No course selected'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Questions', value: questions.length },
            { label: 'Total Marks', value: totalMarks },
            { label: 'Duration', value: `${config.durationMinutes} min` },
            { label: 'Passing %', value: `${config.passingPercent}%` },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] p-3 text-center shadow-sm">
              <p className="text-lg font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
        {config.dueDate && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            Due on {new Date(config.dueDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        )}
      </div>

      {/* Questions list preview */}
      <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#334155]/60 bg-slate-50 dark:bg-white/[0.01]">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            All Questions ({questions.length})
          </h4>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/[0.03] max-h-72 overflow-y-auto">
          {questions.map((q, i) => (
            <div key={q.id} className="px-6 py-4 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{q.question}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  ✓ Correct: {q.correctAnswer} — {q[`option${q.correctAnswer}`]} ({q.marks} mark{q.marks !== 1 ? 's' : ''})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button onClick={onBack} variant="ghost" className="rounded-xl border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-400 font-bold px-5 cursor-pointer bg-transparent flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          variant="primary"
          className="flex items-center gap-2 rounded-xl px-8 py-3 font-bold shadow-md border-0 text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 cursor-pointer"
        >
          {submitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Publish Quiz</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function ImportQuizFromExcel() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    course: '',
    durationMinutes: 30,
    passingPercent: 60,
    dueDate: '',
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: config.title,
        course: config.course,
        durationMinutes: config.durationMinutes,
        passingPercent: config.passingPercent,
        dueDate: config.dueDate,
        totalMarks: questions.reduce((a, q) => a + q.marks, 0),
        questions: questions.map(q => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          explanation: q.explanation,
        })),
      };

      const res = await fetch('http://localhost:8082/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Server error');

      showToast(`Quiz "${config.title}" published with ${questions.length} questions!`, 'success');
      setTimeout(() => navigate('/teacher/assessments'), 1500);
    } catch {
      showToast('Failed to publish quiz. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-300">

      {/* Top Bar */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/teacher/assessments')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              Import Quiz from Excel
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload an Excel spreadsheet to auto-generate a quiz assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-8 mt-8">
        <StepBar current={step} />

        {step === 0 && (
          <StepUpload
            questions={questions}
            setQuestions={setQuestions}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepConfigure
            config={config}
            setConfig={setConfig}
            questions={questions}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepConfirm
            config={config}
            questions={questions}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
