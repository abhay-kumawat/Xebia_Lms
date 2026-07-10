import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, CloudUpload, FileText, CheckCircle, 
  Settings2, Calendar, Clock, Globe, ShieldAlert, Sparkles, Trash2, Plus, AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/layout/PageHeader';
import { useToast } from '@/hooks/useToast';
import { createAssessment, updateAssessment, getAssessments } from '@/services/assessmentService';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const editAssessmentId = location.state?.assignmentId;
  const editMode = !!editAssessmentId;

  // File Upload References & State
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Form States
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Assignment');
  const [course, setCourse] = useState('Spring Boot Enterprise APIs');
  const [subject, setSubject] = useState('Software Engineering');
  const [difficulty, setDifficulty] = useState('Medium');
  const [maxMarks, setMaxMarks] = useState('100');
  const [passingMarks, setPassingMarks] = useState('50');
  const [estTime, setEstTime] = useState('2 hours');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');

  // Scheduling
  const [dueDate, setDueDate] = useState('2026-07-16');
  const [dueTime, setDueTime] = useState('23:59');
  const [allowLate, setAllowLate] = useState(true);

  // Scope
  const [scope, setScope] = useState('Entire Course');

  // Submission Config Checkboxes
  const [allowPdf, setAllowPdf] = useState(true);
  const [allowImages, setAllowImages] = useState(false);
  const [allowText, setAllowText] = useState(false);
  const [allowRepo, setAllowRepo] = useState(false);

  // Rubric State
  const [rubrics, setRubrics] = useState([
    { name: 'Code Quality & Structure', points: 40 },
    { name: 'Functional Implementation', points: 40 },
    { name: 'Documentation & Formatting', points: 20 }
  ]);
  const [newRubricName, setNewRubricName] = useState('');
  const [newRubricPoints, setNewRubricPoints] = useState('10');

  // Questions State
  const [questions, setQuestions] = useState([
    { id: 1, type: 'Short Answer', prompt: 'Explain the difference between monolith and microservices.' },
    { id: 2, type: 'MCQ', prompt: 'Which HTTP method is typically used to create a resource?', options: ['GET', 'POST', 'PUT', 'DELETE'] }
  ]);
  const [newQuestionType, setNewQuestionType] = useState('MCQ');
  const [newQuestionPrompt, setNewQuestionPrompt] = useState('');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');

  // Load existing details for edit mode
  useEffect(() => {
    if (editMode) {
      async function loadDetails() {
        try {
          const list = await getAssessments();
          const target = list.find(item => item.id === Number(editAssessmentId) || item.id === editAssessmentId);
          if (target) {
            setTitle(target.title || '');
            setType(target.type || 'Assignment');
            setCourse(target.course || 'Spring Boot Enterprise APIs');
            setSubject(target.subject || 'Software Engineering');
            setDifficulty(target.difficulty || 'Medium');
            setMaxMarks(String(target.totalPoints || 100));
            setPassingMarks(String(target.passingMarks || 50));
            setEstTime(target.estTime || '2 hours');
            setDescription(target.description || '');
            setInstructions(target.instructions || '');
            setReferenceLinks(target.referenceLinks ? target.referenceLinks.join('\n') : '');
            setDueDate(target.dueDate || '2026-07-16');
            setDueTime(target.dueTime || '23:59');
            setAllowLate(target.allowLate !== false);
            setScope(target.scope || 'Entire Course');
            setAllowPdf(target.allowPdf !== false);
            setAllowImages(!!target.allowImages);
            setAllowText(!!target.allowText);
            setAllowRepo(!!target.allowRepo);
            if (target.rubrics) setRubrics(target.rubrics);
            if (target.questions) setQuestions(target.questions);
          }
        } catch (err) {
          console.error(err);
        }
      }
      loadDetails();
    }
  }, [editMode, editAssessmentId]);

  // Handlers
  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index, e) => {
    e.stopPropagation();
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Add Rubric Criterion
  const addRubric = () => {
    if (!newRubricName.trim() || !newRubricPoints.trim()) return;
    setRubrics(prev => [...prev, { name: newRubricName.trim(), points: parseInt(newRubricPoints) || 10 }]);
    setNewRubricName('');
    setNewRubricPoints('10');
  };

  // Remove Rubric Criterion
  const removeRubric = (idx) => {
    setRubrics(prev => prev.filter((_, i) => i !== idx));
  };

  // Add Question
  const addQuestion = () => {
    if (!newQuestionPrompt.trim()) return;
    const opts = newQuestionType === 'MCQ' 
      ? newQuestionOptions.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    setQuestions(prev => [...prev, {
      id: Date.now(),
      type: newQuestionType,
      prompt: newQuestionPrompt.trim(),
      options: opts
    }]);
    setNewQuestionPrompt('');
    setNewQuestionOptions('');
  };

  // Remove Question
  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Save / Publish submit handler
  const handleSave = async (statusVal) => {
    if (!title.trim()) {
      showToast("Please enter an assignment title", "error");
      return;
    }

    const payload = {
      title,
      type,
      course,
      subject,
      difficulty,
      totalPoints: parseInt(maxMarks) || 100,
      passingMarks: parseInt(passingMarks) || 50,
      estTime,
      description,
      instructions,
      referenceLinks: referenceLinks.split('\n').map(s => s.trim()).filter(Boolean),
      dueDate,
      dueTime,
      allowLate,
      scope,
      allowPdf,
      allowImages,
      allowText,
      allowRepo,
      rubrics,
      questions,
      questionsCount: questions.length,
      status: statusVal // 'Draft' or 'Published'
    };

    try {
      if (editMode) {
        await updateAssessment(editAssessmentId, payload);
        showToast("Assessment updated successfully!", "success");
      } else {
        await createAssessment(payload);
        showToast(`Assessment ${statusVal === 'Draft' ? 'saved as draft' : 'published'} successfully!`, "success");
      }
      navigate('/teacher/assessments');
    } catch (err) {
      showToast("Failed to save assignment details", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-300">
      
      {/* Top Breadcrumb & Heading Actions */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/teacher/assessments')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {editMode ? 'Edit Assessment' : 'Create Assessment'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure coursework, questions, and grading rubrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/teacher/assessments')}
            variant="ghost" 
            className="rounded-xl border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-350 cursor-pointer font-bold px-5 py-2.5 bg-transparent"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSave('Draft')}
            variant="outline" 
            className="rounded-xl border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-bold px-5 py-2.5 cursor-pointer"
          >
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave('Published')}
            variant="primary" 
            className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] hover:opacity-90 text-white font-bold px-6 py-2.5 shadow-md cursor-pointer border-0"
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Forms Grid Layout */}
      <div className="max-w-7xl mx-auto px-8 mt-8 grid gap-8 lg:grid-cols-3">
        
        {/* Left Column (2/3 width) - Basic Info, Attachments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Information Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-7 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <FileText className="h-5 w-5 text-[#831B84]" />
              <span>Basic Information</span>
            </h3>

            {/* Assignment Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                Assessment Title <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spring Boot REST Endpoints Lab"
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#831B84] focus:bg-white dark:focus:bg-[#1E293B]"
              />
            </div>

            {/* Course & Subject Selection */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#831B84] focus:bg-white dark:focus:bg-[#1E293B]"
                >
                  <option>Generative AI Foundations</option>
                  <option>Spring Boot Enterprise APIs</option>
                  <option>Docker & Kubernetes Mastery</option>
                  <option>Data Science with Pandas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. REST API, Docker Networking"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#831B84] focus:bg-white"
                />
              </div>
            </div>

            {/* Difficulty, Type and Marks Configuration */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3.5 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#831B84] focus:bg-white"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3.5 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#831B84] focus:bg-white"
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3.5 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#831B84] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Passing Marks
                </label>
                <input
                  type="number"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3.5 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#831B84] focus:bg-white"
                />
              </div>
            </div>

            {/* Description & Reference Links */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of the assignment task..."
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#831B84] focus:bg-white resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Specific Instructions / Reference Links
              </label>
              <textarea
                rows={3}
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                placeholder="Insert documentation URLs (one per line)..."
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#831B84] focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Dynamic Rubric Builder */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-7 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <Settings2 className="h-5 w-5 text-[#831B84]" />
              <span>Marking Rubrics builder</span>
            </h3>

            {/* Current Rubrics list */}
            <div className="space-y-2">
              {rubrics.map((rub, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-100 dark:border-white/[0.03] px-4 py-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{rub.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#831B84] bg-[#831B84]/5 px-2.5 py-1 rounded-lg">{rub.points} pts</span>
                    <button type="button" onClick={() => removeRubric(idx)} className="text-rose-500 hover:text-rose-600 border-0 bg-transparent cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Rubric Item Form */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={newRubricName}
                onChange={(e) => setNewRubricName(e.target.value)}
                placeholder="e.g. Unit Test Coverage"
                className="flex-1 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
              <input
                type="number"
                value={newRubricPoints}
                onChange={(e) => setNewRubricPoints(e.target.value)}
                placeholder="Points"
                className="w-full sm:w-24 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
              <Button onClick={addRubric} variant="outline" className="rounded-xl border-[#831B84]/20 text-[#831B84] font-bold py-2 cursor-pointer whitespace-nowrap">
                Add Rubric
              </Button>
            </div>
          </div>

          {/* Dynamic Question Builder */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-7 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <Sparkles className="h-5 w-5 text-[#831B84]" />
              <span>Questions Manager</span>
            </h3>

            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-slate-100 dark:border-white/[0.03] p-4 bg-slate-50/50 dark:bg-[#1E293B]/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Q{idx+1}: {q.type}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">{q.prompt}</p>
                      {q.options && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.options.map((opt, i) => (
                            <span key={i} className="text-[10px] font-medium text-slate-500 bg-white dark:bg-[#111827] border border-slate-100 px-2 py-0.5 rounded">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => removeQuestion(q.id)} className="text-rose-500 hover:text-rose-600 border-0 bg-transparent cursor-pointer shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Question Creator Form */}
            <div className="border-t border-slate-100 dark:border-white/[0.03] pt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Short Answer">Short Answer</option>
                    <option value="Long Answer">Long Answer</option>
                    <option value="Coding">Coding Workspace</option>
                    <option value="File Upload">File Upload</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Question Prompt</label>
                  <input
                    type="text"
                    value={newQuestionPrompt}
                    onChange={(e) => setNewQuestionPrompt(e.target.value)}
                    placeholder="e.g. Write a function to reverse a linked list."
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {newQuestionType === 'MCQ' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Options (Comma separated)</label>
                  <input
                    type="text"
                    value={newQuestionOptions}
                    onChange={(e) => setNewQuestionOptions(e.target.value)}
                    placeholder="e.g. GET, POST, PUT, DELETE"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              )}

              <Button onClick={addQuestion} variant="outline" className="rounded-xl border-emerald-500/20 text-emerald-600 font-bold py-2 cursor-pointer w-full flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" /> Add Question to List
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - Scheduling, Scope, Config */}
        <div className="space-y-8">
          
          {/* Scheduling Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <Calendar className="h-5 w-5 text-[#831B84]" />
              <span>Scheduling</span>
            </h3>

            {/* Due Date & Time Grid */}
            <div className="space-y-3.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Due Date &amp; Time
              </label>
              <div className="grid gap-3 grid-cols-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:bg-white"
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Allow Late Submissions Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#334155]/60">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                  Allow Late Submissions
                </p>
                <p className="text-[10px] text-slate-400">
                  Flag as late but accept uploads.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAllowLate(!allowLate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none border-0 cursor-pointer ${
                  allowLate ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowLate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Config Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <Settings2 className="h-5 w-5 text-[#831B84]" />
              <span>Config Details</span>
            </h3>

            <div className="space-y-3.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Est. Completion Duration</label>
              <input
                type="text"
                value={estTime}
                onChange={(e) => setEstTime(e.target.value)}
                placeholder="e.g. 2 hours"
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-3.5 border-t border-slate-100 dark:border-[#334155]/60 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Allowed Format Settings
              </p>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPdf}
                  onChange={(e) => setAllowPdf(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-500"
                />
                <span>File Upload (PDF, DOCX)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowImages}
                  onChange={(e) => setAllowImages(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-500"
                />
                <span>Images (JPG, PNG)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowText}
                  onChange={(e) => setAllowText(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-500"
                />
                <span>Text Entry (Markdown)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRepo}
                  onChange={(e) => setAllowRepo(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-500"
                />
                <span>Code Repository (Github Link)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
