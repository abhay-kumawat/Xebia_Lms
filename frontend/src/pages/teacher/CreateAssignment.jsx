import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, CloudUpload, FileText, CheckCircle, 
  Settings2, Calendar, Clock, Globe, ShieldAlert, Sparkles 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/layout/PageHeader';
import { useToast } from '@/hooks/useToast';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Form States
  const [title, setTitle] = useState('Microservices Architecture Lab 2');
  const [type, setType] = useState('Document Submission (PDF)');
  const [maxMarks, setMaxMarks] = useState('100');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  
  // Scheduling
  const [dueDate, setDueDate] = useState('2026-07-16');
  const [dueTime, setDueTime] = useState('23:59');
  const [allowLate, setAllowLate] = useState(true);

  // Scope
  const [scope, setScope] = useState('Specific Batches');

  // Submission Config Checkboxes
  const [allowPdf, setAllowPdf] = useState(true);
  const [allowImages, setAllowImages] = useState(false);
  const [allowText, setAllowText] = useState(false);
  const [allowRepo, setAllowRepo] = useState(false);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please enter an assignment title", "error");
      return;
    }
    showToast("Assignment published successfully!", "success");
    navigate('/teacher/assessments');
  };

  const handleSaveDraft = () => {
    showToast("Draft saved successfully!", "success");
    navigate('/teacher/assessments');
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
              Create Assignment
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure coursework and grading rubrics for this cohort.
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
            onClick={handleSaveDraft}
            variant="outline" 
            className="rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold px-5 py-2.5 cursor-pointer"
          >
            Save Draft
          </Button>
          <Button 
            onClick={handlePublish}
            variant="primary" 
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 py-2.5 shadow-md cursor-pointer border-0"
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
              <FileText className="h-5 w-5 text-emerald-500" />
              <span>Basic Information</span>
            </h3>

            {/* Assignment Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                Assignment Title <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Microservices Architecture Lab 2"
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1E293B]"
              />
            </div>

            {/* Grid for Type and Max Marks */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assignment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-emerald-500 focus:bg-white"
                >
                  <option>Document Submission (PDF)</option>
                  <option>Code Repository Link</option>
                  <option>Quiz / Multiple Choice</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Maximum Marks
                </label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Description / Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description &amp; Prompt
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief overview and the main task for this assignment..."
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-emerald-500 focus:bg-white resize-none"
              />
            </div>

            {/* Specific Instructions (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Specific Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any specific formatting rules, naming conventions, or resources they should use..."
                className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] px-4.5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-emerald-500 focus:bg-white resize-none"
              />
            </div>

          </div>

          {/* Resource Attachments Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-7 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CloudUpload className="h-5 w-5 text-emerald-500" />
                <span>Resource Attachments</span>
              </h3>
              <Badge variant="neutral" className="text-[10px] tracking-wider uppercase font-bold bg-slate-100 dark:bg-slate-800">Optional</Badge>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide templates, reading materials, or reference links for students.
            </p>

            {/* File Drag & Drop Box */}
            <div className="border-2 border-dashed border-slate-200 dark:border-[#334155] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-[#1E293B]/20 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors cursor-pointer select-none">
              <CloudUpload className="h-10 w-10 text-slate-400 dark:text-slate-550 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Click to upload files or drag and drop
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                PDF, ZIP, DOCX, or Images up to 25 MB
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - Scheduling, Scope, Config */}
        <div className="space-y-8">
          
          {/* Scheduling Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <Calendar className="h-5 w-5 text-emerald-500" />
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

          {/* Assignment Scope Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <Globe className="h-5 w-5 text-emerald-500" />
              <span>Assignment Scope</span>
            </h3>

            {/* Scope Radios */}
            <div className="space-y-4">
              
              {/* Entire Course */}
              <label className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-white/[0.03] p-3 hover:bg-slate-50 dark:hover:bg-white/[0.005] cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="Entire Course"
                  checked={scope === 'Entire Course'}
                  onChange={() => setScope('Entire Course')}
                  className="mt-0.5 accent-emerald-500 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-300">Entire Course</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assign to all course-registered students.</p>
                </div>
              </label>

              {/* Specific Batches */}
              <div className={`rounded-xl border p-3 ${
                scope === 'Specific Batches' 
                  ? 'border-emerald-500/35 bg-emerald-500/[0.01]' 
                  : 'border-slate-100 dark:border-white/[0.03] hover:bg-slate-50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="Specific Batches"
                    checked={scope === 'Specific Batches'}
                    onChange={() => setScope('Specific Batches')}
                    className="mt-0.5 accent-emerald-500 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300">Specific Batches</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Select specific cohorts.</p>
                  </div>
                </label>

                {scope === 'Specific Batches' && (
                  <div className="mt-3 pl-6 space-y-2 border-t border-slate-100 dark:border-white/[0.03] pt-3">
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 border border-emerald-500/20"
                    >
                      Configure Batches (2)
                    </button>
                    <p className="text-[9px] text-slate-400 font-medium">
                      Selected: <span className="font-bold">B-2026-Q1, B-2026-Q2</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Individual Students */}
              <label className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-white/[0.03] p-3 hover:bg-slate-50 dark:hover:bg-white/[0.005] cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="Individual Students"
                  checked={scope === 'Individual Students'}
                  onChange={() => setScope('Individual Students')}
                  className="mt-0.5 accent-emerald-500 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-300">Individual Students</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Custom student selection.</p>
                </div>
              </label>

            </div>
          </div>

          {/* Submission Config Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#334155]/60 pb-3">
              <Settings2 className="h-5 w-5 text-emerald-500" />
              <span>Submission Config</span>
            </h3>

            {/* Checkbox Config Options */}
            <div className="space-y-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Allowed Formats
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
