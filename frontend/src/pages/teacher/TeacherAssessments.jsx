import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ClipboardList, Plus, FileText, CheckSquare, Clock, Award, 
  Search, Filter, ChevronRight, User, BookOpen, Calendar, HelpCircle, Mail, FileSpreadsheet, Settings2, Trash2, Sparkles 
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/layout/PageHeader';
import { useToast } from '@/hooks/useToast';
import { getAssessments, createAssessment, getSubmissions, gradeSubmission, deleteAssessment } from '@/services/assessmentService';

const MOCK_COURSES = [
  "Generative AI Foundations",
  "Spring Boot Enterprise APIs",
  "Docker & Kubernetes Mastery",
  "Data Science with Pandas"
];

const MOCK_ROSTER = [
  { name: "Abhay Kumawat", enrollmentNo: "XEB-2026-081", email: "abhay.kumawat@xebia.com", department: "Data & AI", practice: "GenAI" },
  { name: "Aarav Sharma", enrollmentNo: "XEB-2026-095", email: "aarav.sharma@xebia.com", department: "DevOps & Cloud", practice: "Cloud Native" },
  { name: "Neha Patel", enrollmentNo: "XEB-2026-112", email: "neha.patel@xebia.com", department: "Computer Science", practice: "Java" },
  { name: "Vikram Malhotra", enrollmentNo: "XEB-2026-150", email: "vikram.m@xebia.com", department: "AI & Analytics", practice: "Python" },
  { name: "Rohan Das", enrollmentNo: "XEB-2026-204", email: "rohan.das@xebia.com", department: "Computer Science", practice: "Security" }
];

const selectedStudentMockPassed = (student, assTitle) => {
  const trackerMockStudents = {
    "XEB-2026-081": [
      { title: "GenAI Core Concepts", score: 95 },
      { title: "Spring Boot REST Endpoints", score: 90 },
      { title: "Docker Container Lifecycle", score: 92 }
    ],
    "XEB-2026-095": [
      { title: "Cloud Fundamentals", score: 88 },
      { title: "Kubernetes Pods & Services", score: 82 }
    ],
    "XEB-2026-112": [
      { title: "Java Streams API", score: 91 },
      { title: "Spring Data JPA Repositories", score: 87 }
    ],
    "XEB-2026-150": [
      { title: "Pandas DataFrames", score: 78 }
    ],
    "XEB-2026-204": [
      { title: "XSS & CSRF Prevention", score: 84 },
      { title: "JWT Token verification", score: 88 }
    ]
  };

  const records = trackerMockStudents[student.enrollmentNo] || [];
  return records.find(r => r.title.toLowerCase() === assTitle.toLowerCase());
};

export default function TeacherAssessments() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { submissionId } = useParams();
  
  // States
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('submissions');
  const [selectedTrackerAss, setSelectedTrackerAss] = useState('');
  const [trackerSearchTerm, setTrackerSearchTerm] = useState('');
  
  // Evaluation States
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalApproved, setEvalApproved] = useState(true);
  const [evalQuestionScores, setEvalQuestionScores] = useState({});
  const [gradingScale, setGradingScale] = useState({
    APlus: 90,
    A: 80,
    BPlus: 70,
    B: 60,
    C: 50,
    D: 40
  });

  const getLetterGrade = (score) => {
    const s = Number(score) || 0;
    if (s >= gradingScale.APlus) return 'A+';
    if (s >= gradingScale.A) return 'A';
    if (s >= gradingScale.BPlus) return 'B+';
    if (s >= gradingScale.B) return 'B';
    if (s >= gradingScale.C) return 'C';
    if (s >= gradingScale.D) return 'D';
    return 'F';
  };

  const currentSubmissionAssessment = useMemo(() => {
    if (!selectedSubmission) return null;
    return assessments.find(a => a.title.toLowerCase() === selectedSubmission.assessmentTitle.toLowerCase());
  }, [selectedSubmission, assessments]);

  const submissionQuestions = useMemo(() => {
    if (currentSubmissionAssessment?.questions && currentSubmissionAssessment.questions.length > 0) {
      return currentSubmissionAssessment.questions;
    }
    return [
      { id: 1, type: 'Short Answer', prompt: 'Question 1: Explain the implementation details and design choices of your submission.' },
      { id: 2, type: 'Coding', prompt: 'Question 2: Code execution & test case validation.' }
    ];
  }, [currentSubmissionAssessment]);

  // Create Form States
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Quiz');
  const [newCourse, setNewCourse] = useState(MOCK_COURSES[0]);
  const [newPoints, setNewPoints] = useState('100');
  const [newQuestions, setNewQuestions] = useState('10');
  const [newDueDate, setNewDueDate] = useState('2026-07-25');

  // Load assessments and submissions on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [assList, subList] = await Promise.all([
          getAssessments(),
          getSubmissions()
        ]);
        setAssessments(assList);
        setSubmissions(subList);
        if (assList && assList.length > 0) {
          setSelectedTrackerAss(assList[0].title);
        }
      } catch (err) {
        showToast("Error fetching assessments data", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

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
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Please enter an assessment title", "error");
      return;
    }

    const newAssessment = {
      title: newTitle,
      type: newType,
      course: newCourse,
      totalPoints: parseInt(newPoints) || 100,
      questionsCount: newType === 'Quiz' ? (parseInt(newQuestions) || 10) : 1,
      dueDate: newDueDate
    };

    try {
      await createAssessment(newAssessment);
      const refreshed = await getAssessments();
      setAssessments(refreshed);
      setCreateModalOpen(false);
      showToast("Assessment created successfully!", "success");
      
      // Reset Form
      setNewTitle('');
      setNewType('Quiz');
      setNewCourse(MOCK_COURSES[0]);
      setNewPoints('100');
      setNewQuestions('10');
      setNewDueDate('2026-07-25');
    } catch (err) {
      showToast("Failed to create assessment", "error");
    }
  };

  // Open grading modal
  const startGrading = (sub) => {
    setSelectedSubmission(sub);
    setGradeScore(sub.score !== null ? String(sub.score) : '');
    setEvalFeedback(sub.feedback || '');
    setEvalApproved(sub.status !== 'Rejected');
    
    // Initialize question scores
    const initialScores = {};
    const subAss = assessments.find(a => a.title.toLowerCase() === sub.assessmentTitle.toLowerCase());
    const subQuestions = (subAss?.questions && subAss.questions.length > 0) 
      ? subAss.questions 
      : [
          { id: 1, type: 'Short Answer', prompt: 'Question 1: Explain the implementation details and design choices of your submission.' },
          { id: 2, type: 'Coding', prompt: 'Question 2: Code execution & test case validation.' }
        ];

    subQuestions.forEach(q => {
      initialScores[q.id] = (sub.questionScores && sub.questionScores[q.id] !== undefined)
        ? sub.questionScores[q.id]
        : '';
    });
    setEvalQuestionScores(initialScores);
    setGradeModalOpen(true);
  };

  const closeGradingModal = () => {
    setGradeModalOpen(false);
    setSelectedSubmission(null);
    if (submissionId) {
      navigate('/teacher/assessments');
    }
  };

  // Auto-open grading based on route param
  useEffect(() => {
    if (!loading && submissionId && submissions.length > 0) {
      const sub = submissions.find(s => String(s.id) === String(submissionId));
      if (sub) {
        startGrading(sub);
      } else {
        showToast("Submission not found", "error");
        navigate('/teacher/assessments');
      }
    }
  }, [submissionId, loading, submissions]);

  // Submit grading score
  const handleGradeSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Auto-calculate score based on question scores if available
    let totalScore = 0;
    const scores = Object.entries(evalQuestionScores).map(([_, v]) => Number(v) || 0);
    if (scores.length > 0) {
      const sum = scores.reduce((a, b) => a + b, 0);
      const maxPts = currentSubmissionAssessment?.totalPoints || 100;
      totalScore = Math.min(100, Math.round((sum / maxPts) * 100));
    } else {
      totalScore = parseInt(gradeScore) || 0;
    }

    const calculatedGrade = getLetterGrade(totalScore);

    try {
      await gradeSubmission(
        selectedSubmission.id, 
        totalScore, 
        evalFeedback, 
        calculatedGrade, 
        evalApproved, 
        evalQuestionScores
      );
      
      const refreshed = await getSubmissions();
      setSubmissions(refreshed);
      closeGradingModal();
      showToast(`Successfully graded ${selectedSubmission.studentName}'s submission!`, "success");
    } catch (err) {
      showToast("Failed to save grade", "error");
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      try {
        await deleteAssessment(id);
        const refreshed = await getAssessments();
        setAssessments(refreshed);
        showToast("Assessment deleted successfully", "success");
      } catch (err) {
        showToast("Failed to delete assessment", "error");
      }
    }
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
              className="flex items-center gap-2 rounded-2xl border-[#831B84]/20 bg-[#831B84]/5 text-[#831B84] hover:bg-[#831B84]/10 dark:text-[#831B84] font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import from Excel</span>
            </Button>
            <Button
              onClick={() => navigate('/teacher/assessments/quiz/create')}
              variant="outline"
              className="flex items-center gap-2 rounded-2xl border-violet-500/20 bg-violet-500/5 text-violet-600 hover:bg-violet-500/10 dark:text-violet-400 font-semibold cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create Quiz</span>
            </Button>
            <Button 
              onClick={() => navigate('/teacher/assessments/create')}
              variant="primary" 
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#831B84] to-[#FF6200] hover:opacity-90 shadow-md cursor-pointer border-0 text-white font-semibold"
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
              className="group flex flex-col justify-between rounded-2xl border border-slate-100 p-4.5 dark:border-white/[0.03] dark:bg-white/[0.005] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  item.type === 'Quiz' ? 'bg-[#831B84]/10 text-[#831B84]' : 'bg-[#FF6200]/10 text-[#FF6200]'
                }`}>
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{item.title}</h4>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/teacher/assessments/create', { state: { assignmentId: item.id } });
                        }}
                        className="text-slate-400 hover:text-emerald-500 transition-colors p-0.5 border-0 bg-transparent cursor-pointer"
                        title="Edit"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAssessment(item.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 border-0 bg-transparent cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
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
      {/* Bottom Section: Student Submissions & Completion Tracker */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
        {/* Tab Toggle */}
        <div className="flex border-b border-slate-100 dark:border-white/[0.05] mb-5">
          <button
            onClick={() => setActiveSubTab('submissions')}
            className={`border-b-2 px-5 py-3 text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'submissions' 
                ? 'border-[#831B84] text-[#831B84] dark:text-[#831B84]' 
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Incoming Submissions Log
          </button>
          <button
            onClick={() => setActiveSubTab('tracker')}
            className={`border-b-2 px-5 py-3 text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'tracker' 
                ? 'border-[#831B84] text-[#831B84] dark:text-[#831B84]' 
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Student Completion Tracker Grid
          </button>
        </div>

        {activeSubTab === 'submissions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Submissions</h3>
              <Button 
                onClick={handleExportToCSV}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 border-[#831B84]/20 bg-[#831B84]/5 text-[#831B84] hover:bg-[#831B84]/10 dark:text-[#831B84] font-semibold rounded-xl cursor-pointer"
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
                          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#831B84]/10 to-[#FF6200]/10 font-bold text-[#831B84] dark:text-[#FF6200] flex items-center justify-center text-[10px]">
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
                            onClick={() => navigate(`/teacher/assessments/grade/${sub.id}`)}
                            variant="ghost"
                            size="xs"
                            className="text-[#831B84] hover:text-[#681069] dark:text-[#831B84] dark:hover:text-[#681069] cursor-pointer font-bold uppercase tracking-wider text-[10px] p-0"
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
        )}

        {activeSubTab === 'tracker' && (
          <div className="space-y-5">
            {/* Filter and search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-white/[0.01] p-4 rounded-2xl border border-slate-100 dark:border-white/[0.03]">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 shrink-0">Select Assignment:</span>
                <select
                  value={selectedTrackerAss}
                  onChange={(e) => setSelectedTrackerAss(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300 w-full sm:w-72"
                >
                  {assessments.map(ass => (
                    <option key={ass.id} value={ass.title}>{ass.title} ({ass.type})</option>
                  ))}
                </select>
              </div>

              {/* Search within tracker */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={trackerSearchTerm}
                  onChange={(e) => setTrackerSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#831B84] dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Completion Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3.5">Student Details</th>
                    <th className="pb-3.5">Enrollment No</th>
                    <th className="pb-3.5">Email Address</th>
                    <th className="pb-3.5 text-center">Status</th>
                    <th className="pb-3.5 text-center">Grade Score</th>
                    <th className="pb-3.5 text-center">Certificate Status</th>
                    <th className="pb-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {MOCK_ROSTER.filter(st => 
                    st.name.toLowerCase().includes(trackerSearchTerm.toLowerCase()) ||
                    st.email.toLowerCase().includes(trackerSearchTerm.toLowerCase())
                  ).map(student => {
                    const sub = submissions.find(s => 
                      s.assessmentTitle.toLowerCase() === selectedTrackerAss.toLowerCase() &&
                      (s.email.toLowerCase() === student.email.toLowerCase() || s.enrollmentNo === student.enrollmentNo)
                    );

                    let statusBadge = <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Not Submitted</span>;
                    let gradeText = "-";
                    let certText = <span className="text-xs text-slate-450 dark:text-slate-400">Not Earned</span>;
                    let actionBtn = null;

                    if (sub) {
                      if (sub.status === 'Graded') {
                        statusBadge = <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Completed & Graded</span>;
                        gradeText = `${sub.score}%`;
                        
                        certText = (
                          <span className="text-[10px] font-bold text-[#831B84] bg-[#831B84]/10 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <Award className="h-3 w-3" /> Awarded
                          </span>
                        );
                      } else if (sub.status === 'Pending Evaluation') {
                        statusBadge = <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">Pending Grading</span>;
                        actionBtn = (
                          <Button
                            onClick={() => navigate(`/teacher/assessments/grade/${sub.id}`)}
                            variant="ghost"
                            size="xs"
                            className="text-[#831B84] hover:text-[#681069] dark:text-[#831B84] dark:hover:text-[#681069] cursor-pointer font-bold uppercase tracking-wider text-[10px] p-0"
                          >
                            Grade Now →
                          </Button>
                        );
                      }
                    } else {
                      const mockPassed = selectedStudentMockPassed(student, selectedTrackerAss);
                      if (mockPassed) {
                        statusBadge = <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Completed & Graded</span>;
                        gradeText = `${mockPassed.score}%`;
                        certText = (
                          <span className="text-[10px] font-bold text-[#831B84] bg-[#831B84]/10 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <Award className="h-3 w-3" /> Awarded
                          </span>
                        );
                      }
                    }

                    return (
                      <tr key={student.enrollmentNo} className="group hover:bg-slate-50/45 dark:hover:bg-white/[0.005] transition-colors">
                        <td className="py-4 font-semibold text-slate-800 dark:text-slate-150">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 font-bold text-purple-600 flex items-center justify-center text-[10px]">
                              {student.name.charAt(0)}
                            </div>
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-xs text-slate-600 dark:text-slate-400">
                          {student.enrollmentNo}
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                          {student.email}
                        </td>
                        <td className="py-4 text-center">
                          {statusBadge}
                        </td>
                        <td className="py-4 text-center font-bold text-slate-700 dark:text-slate-200">
                          {gradeText}
                        </td>
                        <td className="py-4 text-center">
                          {certText}
                        </td>
                        <td className="py-4 text-right">
                          {actionBtn}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {createModalOpen && (
          <Modal
            open={createModalOpen}
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#831B84] focus:bg-white dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100"
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
                  className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] hover:opacity-90 text-white cursor-pointer border-0"
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
            open={gradeModalOpen}
            onClose={closeGradingModal}
            title="Evaluate Submission Workflow"
            size="lg"
          >
            <form onSubmit={handleGradeSubmit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left side: Questions and Answers */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-100 dark:border-white/[0.03] p-4 text-xs grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Name</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedSubmission.studentName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment Title</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedSubmission.assessmentTitle}</p>
                    </div>
                  </div>

                  {/* Questions scoring list */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Questions & Student Answers</h4>
                    {submissionQuestions.map((q, idx) => {
                      const studentAnswer = selectedSubmission.answers?.[q.id] || selectedSubmission.answers?.[String(q.id)] || "";
                      const maxQPoints = q.marks || Math.round((currentSubmissionAssessment?.totalPoints || 100) / submissionQuestions.length);

                      return (
                        <div key={q.id} className="rounded-xl border border-slate-100 dark:border-white/[0.03] p-4 bg-slate-50/20 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-350 flex-1">
                              Q{idx + 1}: {q.prompt}
                            </p>
                            <span className="text-[10px] font-black text-[#FF6200] bg-[#FF6200]/10 px-2 py-0.5 rounded-full shrink-0">{maxQPoints} pts</span>
                          </div>
                          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.03] p-3 text-xs">
                            {q.type === 'File Upload' ? (
                              <div className="flex items-center gap-2 text-blue-500 font-semibold cursor-pointer">
                                <FileText className="h-4 w-4" />
                                <span>{studentAnswer || 'No file uploaded'}</span>
                              </div>
                            ) : q.type === 'Coding' ? (
                              <pre className="whitespace-pre-wrap text-emerald-600 dark:text-emerald-400 font-mono text-[10px] bg-slate-900 p-3 rounded-lg overflow-auto max-h-40">
                                {studentAnswer || '// No code submitted'}
                              </pre>
                            ) : (
                              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                {studentAnswer || <span className="italic text-slate-400">No answer provided</span>}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between gap-4 pt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Award Marks (max {maxQPoints})</span>
                            <input
                              type="number"
                              min="0"
                              max={maxQPoints}
                              placeholder="0"
                              value={evalQuestionScores[q.id] !== undefined ? evalQuestionScores[q.id] : ''}
                              onChange={(e) => setEvalQuestionScores(prev => ({
                                ...prev,
                                [q.id]: e.target.value
                              }))}
                              className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-right outline-none dark:border-white/[0.08] dark:bg-slate-900 font-bold"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback Comments */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personalized Feedback & Annotations</label>
                    <textarea
                      rows={3}
                      value={evalFeedback}
                      onChange={(e) => setEvalFeedback(e.target.value)}
                      placeholder="Add evaluation comments and annotations for this student..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none transition-all dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-100 resize-none"
                    />
                  </div>
                </div>

                {/* Right side: Grading Calculations and Scale Customizer */}
                <div className="space-y-5 border-l border-slate-100 dark:border-white/[0.04] pl-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Grading Output</h4>
                    
                    {/* Auto-calculate total points */}
                    <div className="rounded-xl bg-slate-50 dark:bg-white/[0.01] p-4 text-center border border-slate-100 dark:border-white/[0.03]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto-calculated Score</p>
                      <p className="text-3xl font-black text-[#831B84] dark:text-[#FF6200] mt-1">
                        {(() => {
                          const scores = Object.values(evalQuestionScores).map(v => Number(v) || 0);
                          if (scores.length > 0) {
                            const sum = scores.reduce((a, b) => a + b, 0);
                            const maxPts = currentSubmissionAssessment?.totalPoints || 100;
                            return Math.min(100, Math.round((sum / maxPts) * 100));
                          }
                          return 0;
                        })()}%
                      </p>
                      <p className="text-xs font-bold text-emerald-650 bg-emerald-500/10 px-2 py-0.5 rounded inline-block mt-2">
                        Grade: {(() => {
                          const scores = Object.values(evalQuestionScores).map(v => Number(v) || 0);
                          const sum = scores.reduce((a, b) => a + b, 0);
                          const maxPts = currentSubmissionAssessment?.totalPoints || 100;
                          const pct = Math.min(100, Math.round((sum / maxPts) * 100));
                          return getLetterGrade(pct);
                        })()}
                      </p>
                    </div>

                    {/* Status Approval */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Approval Workflow</label>
                      {currentSubmissionAssessment?.passingMarks && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-3 py-2 text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                          Certificate auto-issued if score ≥ {currentSubmissionAssessment.passingMarks} / {currentSubmissionAssessment.totalPoints || 100} pts
                        </div>
                      )}
                      <div className="flex gap-4 flex-col">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="approved"
                            checked={evalApproved}
                            onChange={() => setEvalApproved(true)}
                            className="accent-emerald-500"
                          />
                          <span>Approve Submission</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="approved"
                            checked={!evalApproved}
                            onChange={() => setEvalApproved(false)}
                            className="accent-rose-500"
                          />
                          <span>Reject Submission</span>
                        </label>
                      </div>
                    </div>

                    {/* Scale Customizer */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Customize Grade Scale Thresholds</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">A+ Threshold</span>
                          <input
                            type="number"
                            value={gradingScale.APlus}
                            onChange={(e) => setGradingScale(prev => ({ ...prev, APlus: parseInt(e.target.value) || 90 }))}
                            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center bg-white outline-none dark:border-white/[0.08] dark:bg-slate-900"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">A Threshold</span>
                          <input
                            type="number"
                            value={gradingScale.A}
                            onChange={(e) => setGradingScale(prev => ({ ...prev, A: parseInt(e.target.value) || 80 }))}
                            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center bg-white outline-none dark:border-white/[0.08] dark:bg-slate-900"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">B+ Threshold</span>
                          <input
                            type="number"
                            value={gradingScale.BPlus}
                            onChange={(e) => setGradingScale(prev => ({ ...prev, BPlus: parseInt(e.target.value) || 70 }))}
                            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center bg-white outline-none dark:border-white/[0.08] dark:bg-slate-900"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">B Threshold</span>
                          <input
                            type="number"
                            value={gradingScale.B}
                            onChange={(e) => setGradingScale(prev => ({ ...prev, B: parseInt(e.target.value) || 60 }))}
                            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center bg-white outline-none dark:border-white/[0.08] dark:bg-slate-900"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">C Threshold</span>
                          <input
                            type="number"
                            value={gradingScale.C}
                            onChange={(e) => setGradingScale(prev => ({ ...prev, C: parseInt(e.target.value) || 50 }))}
                            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center bg-white outline-none dark:border-white/[0.08] dark:bg-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                <Button 
                  onClick={closeGradingModal} 
                  variant="ghost" 
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] hover:opacity-90 text-white cursor-pointer border-0"
                >
                  Submit Grade &amp; Evaluation
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
