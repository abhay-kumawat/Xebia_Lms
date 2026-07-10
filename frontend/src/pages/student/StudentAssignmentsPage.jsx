'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, UploadCloud, Calendar, FileText, Award,
  Clock, BookOpen, Star, ChevronRight, AlertCircle, Loader2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useNavigate } from 'react-router-dom';
import { getAssessments, getSubmissions } from '@/services/assessmentService';

// ─── Static Xebia portal assignments (always visible) ──────────────────────
const XEBIA_PORTAL_ASSIGNMENTS = [
  {
    id: 'xebia-assign-1',
    title: 'Xebia Portal Orientation Submission',
    course: 'Xebia Academy Portal',
    courseTitle: 'Xebia Academy Portal',
    type: 'Assignment',
    subject: 'Platform Orientation',
    teacherName: 'Priya Sharma',
    dueDate: '2026-07-12',
    totalPoints: 50,
    passingMarks: 35,
    difficulty: 'Easy',
    status: 'Published',
    description: 'Write a walkthrough of the Xebia portal highlighting the Home, Courses, Assignments, and Assessments experience.',
    instructions: 'Include one improvement suggestion for learners and one for admins. Keep responses concise and professional.',
    questions: [
      {
        id: 'xq1-1', type: 'Short Answer', prompt: 'Describe the Xebia Academy Home page and what information it provides to students.', marks: 10, required: true
      },
      {
        id: 'xq1-2', type: 'Long Answer', prompt: 'Write a complete walkthrough of the portal from login to submitting an assignment. Include each section you visit.', marks: 25, required: true
      },
      {
        id: 'xq1-3', type: 'Short Answer', prompt: 'Provide one improvement suggestion for learners and one for platform administrators.', marks: 15, required: true
      }
    ],
    rubrics: [
      { name: 'Portal navigation clarity', points: 20 },
      { name: 'Understanding of learner journeys', points: 20 },
      { name: 'Quality of improvement suggestions', points: 10 }
    ]
  },
  {
    id: 'xebia-assign-2',
    title: 'Course Launch Readiness Checklist',
    course: 'Xebia Academy Portal',
    courseTitle: 'Xebia Academy Portal',
    type: 'Assignment',
    subject: 'Content Strategy',
    teacherName: 'Ananya Desai',
    dueDate: '2026-07-18',
    totalPoints: 75,
    passingMarks: 50,
    difficulty: 'Medium',
    status: 'Published',
    description: 'Prepare a release checklist for a new Xebia learning path.',
    instructions: 'Cover course structure, module naming, content order, assessment readiness, and expected learner outcomes.',
    questions: [
      {
        id: 'xq2-1', type: 'Long Answer', prompt: 'Write a complete course launch readiness checklist covering: course structure, module naming, content order, assessment readiness, and learner outcome definitions.', marks: 50, required: true
      },
      {
        id: 'xq2-2', type: 'Short Answer', prompt: 'What are the 3 most important things a course designer must verify before going live?', marks: 15, required: true
      },
      {
        id: 'xq2-3', type: 'True/False', prompt: 'A course can be published without at least one assessment or quiz.', marks: 10, required: true, options: ['True', 'False']
      }
    ],
    rubrics: [
      { name: 'Readiness coverage', points: 30 },
      { name: 'Content structure', points: 25 },
      { name: 'Practicality of recommendations', points: 20 }
    ]
  },
  {
    id: 'xebia-assign-3',
    title: 'Capstone Project Submission Plan',
    course: 'Xebia Academy Portal',
    courseTitle: 'Xebia Academy Portal',
    type: 'Assignment',
    subject: 'Project Management',
    teacherName: 'Siddharth Sen',
    dueDate: '2026-07-24',
    totalPoints: 100,
    passingMarks: 70,
    difficulty: 'Hard',
    status: 'Published',
    description: 'Submit a capstone plan for a portal-based learning journey.',
    instructions: 'Include the project objective, milestones, deliverables, and how you would track progress inside the Xebia portal.',
    questions: [
      {
        id: 'xq3-1', type: 'Short Answer', prompt: 'State the project title and primary objective of your capstone learning journey.', marks: 15, required: true
      },
      {
        id: 'xq3-2', type: 'Long Answer', prompt: 'Define 3–5 milestones for your project. For each milestone, describe the deliverable, timeline, and acceptance criteria.', marks: 40, required: true
      },
      {
        id: 'xq3-3', type: 'Long Answer', prompt: 'Explain how you would use the Xebia portal features (courses, assignments, assessments, leaderboard) to track your progress throughout the capstone.', marks: 30, required: true
      },
      {
        id: 'xq3-4', type: 'File Upload', prompt: 'Upload your project plan document (PDF or DOCX format).', marks: 15, required: false
      }
    ],
    rubrics: [
      { name: 'Milestone planning', points: 40 },
      { name: 'Portal usage strategy', points: 30 },
      { name: 'Clarity of deliverables', points: 30 }
    ]
  }
];

// ─── Difficulty badge helper ────────────────────────────────────────────────
function DifficultyBadge({ level }) {
  const map = {
    Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${map[level] || map.Medium}`}>
      {level || 'Medium'}
    </span>
  );
}

export default function StudentAssignmentsPage() {
  const { courses } = useCatalog();
  const { showToast } = useToast();
  const { user } = useStudentAuth();
  const navigate = useNavigate();

  const [dbAssignments, setDbAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load assignments and submissions ────────────────────────────────
  const loadData = async () => {
    try {
      const [list, subs] = await Promise.all([getAssessments(), getSubmissions()]);
      const assignmentsOnly = list.filter(a => a.type?.toLowerCase() === 'assignment');
      setDbAssignments(assignmentsOnly);
      const emailKey = user?.email || 'abhay.kumawat@xebia.com';
      setSubmissions(subs.filter(s => s.email?.toLowerCase() === emailKey.toLowerCase()));
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  // ── Extract assignments from course builder ─────────────────────────
  const liveAssignments = useMemo(() => {
    const list = [];
    (courses || []).forEach(c => {
      (c.modules || []).forEach(m => {
        (m.submodules || []).forEach(s => {
          (s.contents || []).forEach(ct => {
            if (ct.type === 'assignment') {
              let assignMeta = {};
              try { assignMeta = JSON.parse(ct.markdown || '{}'); } catch {}
              list.push({
                id: ct.id,
                title: ct.title || 'Practical Project Assignment',
                course: c.title,
                courseTitle: c.title,
                type: 'Assignment',
                subject: assignMeta.assignmentData?.subject || 'Course Project',
                teacherName: 'Course Instructor',
                dueDate: assignMeta.assignmentData?.dueDate || '2026-12-31',
                totalPoints: assignMeta.assignmentData?.totalMarks || 100,
                passingMarks: assignMeta.assignmentData?.passingMarks || 70,
                difficulty: assignMeta.assignmentData?.difficulty || 'Medium',
                description: assignMeta.assignmentData?.description || 'Complete the project assignment.',
                instructions: assignMeta.assignmentData?.instructions || 'Build and deploy the project and submit the repository link.',
                questions: assignMeta.assignmentData?.questions || [
                  { id: `${ct.id}-q1`, type: 'Short Answer', prompt: 'Paste your project repository link.', marks: 20, required: true },
                  { id: `${ct.id}-q2`, type: 'Long Answer', prompt: 'Describe your design decisions and implementation approach.', marks: 50, required: true },
                  { id: `${ct.id}-q3`, type: 'File Upload', prompt: 'Upload your project ZIP or PDF report.', marks: 30, required: false }
                ],
                rubrics: assignMeta.assignmentData?.rubricCriteria || [],
                status: 'Published'
              });
            }
          });
        });
      });
    });
    return list;
  }, [courses]);

  // ── Merge all assignments ───────────────────────────────────────────
  const assignmentsToShow = useMemo(() => {
    const list = [...XEBIA_PORTAL_ASSIGNMENTS];

    liveAssignments.forEach(la => {
      if (!list.some(item => item.title.toLowerCase() === la.title.toLowerCase())) {
        list.push(la);
      }
    });

    dbAssignments.forEach(da => {
      if (!list.some(item => item.title.toLowerCase() === da.title.toLowerCase())) {
        list.push({
          ...da,
          courseTitle: da.course,
          totalPoints: da.totalPoints || 100,
          passingMarks: da.passingMarks || Math.round((da.totalPoints || 100) * 0.6),
          questions: da.questions || [
            { id: `${da.id}-q1`, type: 'Short Answer', prompt: 'Paste your project repository link or file upload URL.', marks: 30, required: true },
            { id: `${da.id}-q2`, type: 'Long Answer', prompt: 'Describe your approach, design decisions, and key implementation details.', marks: 50, required: true },
            { id: `${da.id}-q3`, type: 'MCQ', prompt: 'How confident are you in your submission quality?', marks: 20, required: true, options: ['Very confident', 'Somewhat confident', 'Needs improvement', 'Incomplete'] }
          ]
        });
      }
    });

    return list;
  }, [liveAssignments, dbAssignments]);

  // ── Check submission state per assignment ───────────────────────────
  const getSubmissionState = (assignment) => {
    const sub = submissions.find(s =>
      s.assessmentTitle?.toLowerCase() === assignment.title.toLowerCase()
    );
    return sub || null;
  };

  // ── Navigate to submission workspace ───────────────────────────────
  const handleOpenAssignment = (assignment) => {
    // Ensure the assignment is stored in localStorage so the runner can find it
    const existing = JSON.parse(localStorage.getItem('xebia-lms-assessments') || '[]');
    const alreadyExists = existing.some(a =>
      String(a.id) === String(assignment.id) ||
      a.title.toLowerCase() === assignment.title.toLowerCase()
    );
    if (!alreadyExists) {
      localStorage.setItem('xebia-lms-assessments', JSON.stringify([assignment, ...existing]));
    } else {
      // Update existing entry to include questions if missing
      const updated = existing.map(a => {
        if (a.title.toLowerCase() === assignment.title.toLowerCase()) {
          return { ...a, ...assignment };
        }
        return a;
      });
      localStorage.setItem('xebia-lms-assessments', JSON.stringify(updated));
    }

    navigate('/student/assessments/run', { state: { assessmentId: assignment.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#831B84]" />
          <p className="text-xs font-bold text-slate-500">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-teal-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Assignments</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-12">
          Complete your assigned coursework and earn certificates upon passing.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Assigned', value: assignmentsToShow.length, icon: BookOpen, color: 'from-purple-500 to-indigo-500' },
          { label: 'Submitted', value: submissions.filter(s => s.status !== 'Draft').length, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
          { label: 'Graded', value: submissions.filter(s => s.status === 'Graded').length, icon: Star, color: 'from-amber-500 to-orange-500' },
          { label: 'Pending', value: assignmentsToShow.length - submissions.filter(s => s.status !== 'Draft').length, icon: AlertCircle, color: 'from-rose-500 to-pink-500' }
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} p-4 text-white shadow-md`}>
            <stat.icon className="h-5 w-5 opacity-80 mb-2" />
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {assignmentsToShow.length === 0 ? (
        <div className="mt-12 text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] max-w-md mx-auto">
          <CheckCircle className="h-10 w-10 text-teal-500 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Assignments Due</h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            When a teacher publishes an assignment, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {assignmentsToShow.map((assignment) => {
            const sub = getSubmissionState(assignment);
            const isDraft = sub?.status === 'Draft';
            const isSubmitted = sub && sub.status !== 'Draft';
            const isGraded = sub?.status === 'Graded';
            const hasCertificate = isGraded && sub?.approved && sub?.certificateId;
            const passed = isGraded && sub?.score >= (assignment.passingMarks || 60);
            const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntilDue < 0;
            const isUrgent = daysUntilDue >= 0 && daysUntilDue <= 2;

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-2xl p-2.5 ${
                      isGraded ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                      isSubmitted ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                      'bg-teal-50 text-teal-600 dark:bg-teal-950/60'
                    }`}>
                      {isGraded ? <Award className="h-5 w-5" /> : isSubmitted ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Status badge */}
                      {isGraded ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 text-[9px] font-black uppercase">
                          Graded — {sub.score}%
                        </span>
                      ) : isSubmitted ? (
                        <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-0.5 text-[9px] font-black uppercase">
                          Submitted
                        </span>
                      ) : isDraft ? (
                        <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-0.5 text-[9px] font-black uppercase">
                          Draft Saved
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 text-[9px] font-black uppercase">
                          Not Started
                        </span>
                      )}
                      <DifficultyBadge level={assignment.difficulty} />
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {assignment.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 mb-3">
                    {assignment.courseTitle || assignment.course}
                  </p>

                  {/* Metadata Grid */}
                  <div className="rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800 p-3 space-y-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Award className="h-3 w-3" /> Total Marks</span>
                      <span className="text-slate-800 dark:text-slate-200">{assignment.totalPoints || 100} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" /> Passing Marks</span>
                      <span className="text-slate-800 dark:text-slate-200">{assignment.passingMarks || 60} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Questions</span>
                      <span className="text-slate-800 dark:text-slate-200">{assignment.questions?.length || 3}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due Date</span>
                      <span className={`font-black ${isOverdue ? 'text-rose-500' : isUrgent ? 'text-amber-500' : 'text-teal-600 dark:text-teal-400'}`}>
                        {isOverdue ? 'Overdue' : isUrgent ? `${daysUntilDue}d left` : assignment.dueDate}
                      </span>
                    </div>
                    {assignment.teacherName && (
                      <div className="flex justify-between">
                        <span>Teacher</span>
                        <span className="text-slate-800 dark:text-slate-200 truncate ml-2">{assignment.teacherName}</span>
                      </div>
                    )}
                  </div>

                  {/* Grade result */}
                  {isGraded && (
                    <div className={`mt-3 rounded-xl p-3 text-xs font-semibold ${
                      passed
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black">
                          {passed ? '🎉 Passed!' : '❌ Not Passed'}
                        </span>
                        <span className="text-[10px] font-black bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full">
                          Grade: {sub.letterGrade || 'N/A'}
                        </span>
                      </div>
                      {sub.feedback && (
                        <p className="text-[10px] italic opacity-80 mt-1">"{sub.feedback}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="px-5 pb-5 pt-2 space-y-2">
                  {hasCertificate ? (
                    <button
                      type="button"
                      onClick={() => navigate('/student/assessments/certificate', { state: { certificateId: sub.certificateId } })}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6200] text-white text-xs font-black shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Award className="h-4 w-4" /> View Certificate
                    </button>
                  ) : isGraded && !passed ? (
                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed"
                    >
                      Minimum score not met
                    </button>
                  ) : isSubmitted ? (
                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold cursor-not-allowed border border-blue-200 dark:border-blue-800"
                    >
                      <CheckCircle className="h-4 w-4" /> Submitted — Awaiting Grading
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenAssignment(assignment)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:opacity-90 text-white text-xs font-black shadow-md transition-opacity cursor-pointer"
                    >
                      {isDraft ? (
                        <><Clock className="h-4 w-4" /> Resume Draft</>
                      ) : (
                        <><UploadCloud className="h-4 w-4" /> Start Assignment</>
                      )}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
