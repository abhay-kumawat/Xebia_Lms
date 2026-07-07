import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Plus, FileText, CheckSquare, Clock, Award, 
  Search, Filter, ChevronRight, User, BookOpen, Calendar, HelpCircle, Mail, FileSpreadsheet 
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/layout/PageHeader';
import { useToast } from '@/hooks/useToast';

// Mock Assessments Data
const INITIAL_ASSESSMENTS = [
  { id: 1, title: "GenAI Core Concepts", type: "Quiz", course: "Generative AI Foundations", totalPoints: 100, questionsCount: 10, dueDate: "2026-07-15" },
  { id: 2, title: "Docker Container Lifecycle", type: "Quiz", course: "Docker & Kubernetes Mastery", totalPoints: 100, questionsCount: 10, dueDate: "2026-07-20" },
  { id: 3, title: "Spring Boot REST Endpoints", type: "Assignment", course: "Spring Boot Enterprise APIs", totalPoints: 100, questionsCount: 1, dueDate: "2026-07-18" },
  { id: 4, title: "Data Science DataFrame Ops", type: "Quiz", course: "Data Science with Pandas", totalPoints: 50, questionsCount: 5, dueDate: "2026-07-12" }
];

// Mock Student Submissions Data (including Enrollment Number and Email)
const INITIAL_SUBMISSIONS = [
  { id: 101, studentName: "Abhay Kumawat", enrollmentNo: "XEB-2026-081", email: "abhay.kumawat@xebia.com", assessmentTitle: "Docker Container Lifecycle", type: "Quiz", submittedDate: "2026-07-07", status: "Graded", score: 92 },
  { id: 102, studentName: "Neha Patel", enrollmentNo: "XEB-2026-112", email: "neha.patel@xebia.com", assessmentTitle: "Docker Container Lifecycle", type: "Quiz", submittedDate: "2026-07-06", status: "Graded", score: 87 },
  { id: 103, studentName: "Aarav Sharma", enrollmentNo: "XEB-2026-095", email: "aarav.sharma@xebia.com", assessmentTitle: "Docker Container Lifecycle", type: "Quiz", submittedDate: "2026-07-06", status: "Graded", score: 82 },
  { id: 104, studentName: "Abhay Kumawat", enrollmentNo: "XEB-2026-081", email: "abhay.kumawat@xebia.com", assessmentTitle: "Spring Boot REST Endpoints", type: "Assignment", submittedDate: "2026-07-07", status: "Pending Evaluation", score: null },
  { id: 105, studentName: "Rohan Das", enrollmentNo: "XEB-2026-204", email: "rohan.das@xebia.com", assessmentTitle: "Spring Boot REST Endpoints", type: "Assignment", submittedDate: "2026-07-05", status: "Graded", score: 88 }
];

const MOCK_COURSES = [
  "Generative AI Foundations",
  "Spring Boot Enterprise APIs",
  "Docker & Kubernetes Mastery",
  "Data Science with Pandas"
];

export default function TeacherAssessments() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // States
  const [assessments, setAssessments] = useState(INITIAL_ASSESSMENTS);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  
  // Create Form States
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Quiz');
  const [newCourse, setNewCourse] = useState(MOCK_COURSES[0]);
  const [newPoints, setNewPoints] = useState('100');
  const [newQuestions, setNewQuestions] = useState('10');
  const [newDueDate, setNewDueDate] = useState('2026-07-25');

  // Stats calculation
  const stats = useMemo(() => {
    const totalAss = assessments.length;
    const totalSub = submissions.length;
    const pending = submissions.filter(s => s.status === 'Pending Evaluation').length;
    const graded = submissions.filter(s => s.status === 'Graded');
    const avgScore = graded.length > 0 
      ? Math.round(graded.reduce((acc, curr) => acc + curr.score, 0) / graded.length) 
      : 0;

    return [
      { title: 'Total Assessments', value: totalAss, icon: ClipboardList, change: 'Active in curriculum', color: 'purple' },
      { title: 'Submissions Received', value: totalSub, icon: FileText, change: 'Across all active students', color: 'blue' },
      { title: 'Pending Evaluation', value: pending, icon: Clock, change: 'Requires manual grading', color: 'orange' },
      { title: 'Average Test Score', value: `${avgScore}%`, icon: Award, change: 'On completed quizzes', color: 'emerald' }
    ];
  }, [assessments, submissions]);

  // Handle Create Assessment Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Please enter an assessment title", "error");
      return;
    }

    const newAssessment = {
      id: assessments.length + 1,
      title: newTitle,
      type: newType,
      course: newCourse,
      totalPoints: parseInt(newPoints) || 100,
      questionsCount: newType === 'Quiz' ? (parseInt(newQuestions) || 10) : 1,
      dueDate: newDueDate
    };

    setAssessments([newAssessment, ...assessments]);
    setCreateModalOpen(false);
    showToast("Assessment created successfully!", "success");
    
    // Reset Form
    setNewTitle('');
    setNewType('Quiz');
    setNewCourse(MOCK_COURSES[0]);
    setNewPoints('100');
    setNewQuestions('10');
    setNewDueDate('2026-07-25');
  };

  // Open grading modal
  const startGrading = (sub) => {
    setSelectedSubmission(sub);
    setGradeScore('');
    setGradeModalOpen(true);
  };

  // Submit grading score
  const handleGradeSubmit = (e) => {
    e.preventDefault();
    const scoreVal = parseInt(gradeScore);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      showToast("Please enter a valid score between 0 and 100", "error");
      return;
    }

    // Update submissions list
    setSubmissions(submissions.map(sub => {
      if (sub.id === selectedSubmission.id) {
        return { ...sub, status: 'Graded', score: scoreVal };
      }
      return sub;
    }));

    setGradeModalOpen(false);
    showToast(`Successfully graded ${selectedSubmission.studentName}'s submission!`, "success");
  };

  // Export submissions list to CSV (Excel compatible)
  const handleExportToCSV = () => {
    // Define headers
    const headers = ["Student Name", "Enrollment No", "Email Address", "Assessment Title", "Type", "Submission Date", "Status", "Score (%)"];
    
    // Map entries
    const rows = submissions.map(sub => [
      `"${sub.studentName.replace(/"/g, '""')}"`,
      `"${sub.enrollmentNo.replace(/"/g, '""')}"`,
      `"${sub.email.replace(/"/g, '""')}"`,
      `"${sub.assessmentTitle.replace(/"/g, '""')}"`,
      `"${sub.type}"`,
      `"${sub.submittedDate}"`,
      `"${sub.status}"`,
      sub.score !== null ? `"${sub.score}%"` : '"N/A"'
    ]);

    // Build content
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    // Download File
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `student_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Spreadsheet exported successfully!", "success");
  };

  return (
    <div className="space-y-8 pb-12 px-6">
      {/* Page Header */}
      <PageHeader 
        title="Assessments Management" 
        description="Create quizzes, evaluate programming assignments, and view grading statistics."
        action={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/teacher/assessments/import-excel')}
              variant="outline"
              className="flex items-center gap-2 rounded-2xl border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import from Excel</span>
            </Button>
            <Button 
              onClick={() => navigate('/teacher/assessments/create')}
              variant="primary" 
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md cursor-pointer border-0 text-white font-semibold"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Assessment</span>
            </Button>
          </div>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.change}
            color={stat.color}
          />
        ))}
      </div>

      {/* Top Section: List of Assessments */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Active Assessments</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assessments.map(item => (
            <div 
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 p-4.5 dark:border-white/[0.03] dark:bg-white/[0.005] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  item.type === 'Quiz' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
                }`}>
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.course}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.03] pt-3 text-[10px] font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-600 dark:text-slate-350">{item.type}</span>
                  <span>Max {item.totalPoints} pts</span>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300">Due: {item.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Student Submissions Full-Width Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Submissions</h3>
          <Button 
            onClick={handleExportToCSV}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 border-emerald-500/20 bg-emerald-505/5 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 font-semibold rounded-xl cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel (CSV)</span>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.04] text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3.5">Student Details</th>
                <th className="pb-3.5">Enrollment No</th>
                <th className="pb-3.5">Email Address</th>
                <th className="pb-3.5">Assessment Name</th>
                <th className="pb-3.5 text-center">Submitted Date</th>
                <th className="pb-3.5 text-right">Score / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {submissions.map(sub => (
                <tr 
                  key={sub.id} 
                  className="group hover:bg-slate-50/45 dark:hover:bg-white/[0.005] transition-colors"
                >
                  {/* Name */}
                  <td className="py-4 font-semibold text-slate-800 dark:text-slate-150">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px]">
                        {sub.studentName.charAt(0)}
                      </div>
                      <span>{sub.studentName}</span>
                    </div>
                  </td>

                  {/* Enrollment No */}
                  <td className="py-4 font-bold text-xs text-slate-600 dark:text-slate-400">
                    {sub.enrollmentNo}
                  </td>

                  {/* Email */}
                  <td className="py-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                    {sub.email}
                  </td>

                  {/* Assessment Title */}
                  <td className="py-4">
                    <p className="font-semibold text-slate-700 dark:text-slate-350">{sub.assessmentTitle}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{sub.type}</p>
                  </td>

                  {/* Date */}
                  <td className="py-4 text-center text-xs font-medium text-slate-500">
                    {sub.submittedDate}
                  </td>

                  {/* Score / Action */}
                  <td className="py-4 text-right">
                    {sub.status === 'Graded' ? (
                      <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 rounded-lg px-2.5 py-1">
                        {sub.score}%
                      </span>
                    ) : (
                      <Button
                        onClick={() => startGrading(sub)}
                        variant="ghost"
                        size="xs"
                        className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-350 cursor-pointer font-bold uppercase tracking-wider text-[10px] p-0"
                      >
                        Grade Now →
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ASSESSMENT MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <Modal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            title="Create New Assessment"
            size="md"
          >
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Assessment Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="Quiz"
                      checked={newType === 'Quiz'} 
                      onChange={() => setNewType('Quiz')}
                      className="accent-emerald-500" 
                    />
                    <span>Quiz (Multiple Choice)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="Assignment"
                      checked={newType === 'Assignment'} 
                      onChange={() => setNewType('Assignment')}
                      className="accent-emerald-500" 
                    />
                    <span>Assignment (File Upload)</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Assessment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Spring Boot Data Filters Quiz"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Associated Course */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Associated Course</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
                >
                  {MOCK_COURSES.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Max Points */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Points</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {newType === 'Quiz' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Number of Questions</label>
                  <input
                    type="number"
                    value={newQuestions}
                    onChange={(e) => setNewQuestions(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                <Button 
                  onClick={() => setCreateModalOpen(false)} 
                  variant="ghost" 
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white cursor-pointer border-0"
                >
                  Publish Assessment
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* GRADING SUBMISSION MODAL */}
      <AnimatePresence>
        {gradeModalOpen && selectedSubmission && (
          <Modal
            isOpen={gradeModalOpen}
            onClose={() => setGradeModalOpen(false)}
            title="Evaluate Submission"
            size="sm"
          >
            <form onSubmit={handleGradeSubmit} className="space-y-5">
              <div className="rounded-xl bg-slate-50 dark:bg-white/[0.005] border border-slate-100 dark:border-white/[0.03] p-4 text-xs space-y-2">
                <p><span className="font-bold text-slate-400 uppercase tracking-wider">Student Name:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSubmission.studentName}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wider">Enrollment No:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSubmission.enrollmentNo}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wider">Email Address:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedSubmission.email}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wider">Assessment:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSubmission.assessmentTitle}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wider">Submitted:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedSubmission.submittedDate}</span></p>
              </div>

              {/* Grade Score Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Assign Score (0 - 100%)</label>
                <input
                  type="number"
                  placeholder="e.g. 95"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                <Button 
                  onClick={() => setGradeModalOpen(false)} 
                  variant="ghost" 
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white cursor-pointer border-0"
                >
                  Submit Grade
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
