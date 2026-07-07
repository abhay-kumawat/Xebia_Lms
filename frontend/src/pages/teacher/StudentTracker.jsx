import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Award, Clock, BookOpen, CheckCircle, 
  ChevronRight, Calendar, UserCheck, X, FileText, BarChart2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/layout/PageHeader';

// Mock Student Database for Teacher Portal
const MOCK_STUDENTS = [
  {
    id: 1,
    name: "Abhay Kumawat",
    email: "abhay.kumawat@xebia.com",
    department: "Data & AI",
    practice: "GenAI",
    grade: "E2",
    learningHours: 48.5,
    avgScore: 92,
    completedCoursesCount: 4,
    status: "Active",
    lastActive: "2026-07-07",
    enrolledCourses: [
      { id: 101, title: "Generative AI Foundations", progress: 100, status: "Completed" },
      { id: 102, title: "Spring Boot Enterprise APIs", progress: 100, status: "Completed" },
      { id: 103, title: "Docker & Kubernetes Mastery", progress: 75, status: "In Progress" },
      { id: 104, title: "PostgreSQL Advanced Indexing", progress: 20, status: "In Progress" }
    ],
    assessments: [
      { title: "GenAI Core Concepts", score: 95, date: "2026-07-01", status: "Passed" },
      { title: "Spring Boot REST endpoints", score: 90, date: "2026-06-25", status: "Passed" },
      { title: "Docker Container Lifecycle", score: 92, date: "2026-06-18", status: "Passed" }
    ],
    activities: [
      { action: "Completed submodule 'Spring Security Filters'", date: "2026-07-07 09:12" },
      { action: "Submitted assessment 'GenAI Core Concepts'", date: "2026-07-01 14:30" },
      { action: "Started course 'Docker & Kubernetes Mastery'", date: "2026-06-28 11:15" }
    ]
  },
  {
    id: 2,
    name: "Aarav Sharma",
    email: "aarav.sharma@xebia.com",
    department: "DevOps & Cloud",
    practice: "Cloud Native",
    grade: "E1",
    learningHours: 32.2,
    avgScore: 85,
    completedCoursesCount: 2,
    status: "Active",
    lastActive: "2026-07-06",
    enrolledCourses: [
      { id: 101, title: "Generative AI Foundations", progress: 100, status: "Completed" },
      { id: 103, title: "Docker & Kubernetes Mastery", progress: 100, status: "Completed" },
      { id: 105, title: "AWS Cloud Practitioner", progress: 45, status: "In Progress" }
    ],
    assessments: [
      { title: "Cloud Fundamentals", score: 88, date: "2026-06-20", status: "Passed" },
      { title: "Kubernetes Pods & Services", score: 82, date: "2026-06-12", status: "Passed" }
    ],
    activities: [
      { action: "Watched video 'Kubernetes ConfigMaps'", date: "2026-07-06 17:05" },
      { action: "Completed course 'Docker & Kubernetes Mastery'", date: "2026-07-04 15:20" }
    ]
  },
  {
    id: 3,
    name: "Neha Patel",
    email: "neha.patel@xebia.com",
    department: "Computer Science",
    practice: "Java",
    grade: "E3",
    learningHours: 56.8,
    avgScore: 89,
    completedCoursesCount: 5,
    status: "Active",
    lastActive: "2026-07-07",
    enrolledCourses: [
      { id: 102, title: "Spring Boot Enterprise APIs", progress: 100, status: "Completed" },
      { id: 106, title: "Java Concurrency In Practice", progress: 100, status: "Completed" },
      { id: 107, title: "Microservices Design Patterns", progress: 85, status: "In Progress" }
    ],
    assessments: [
      { title: "Java Streams API", score: 91, date: "2026-06-29", status: "Passed" },
      { title: "Spring Data JPA Repositories", score: 87, date: "2026-06-22", status: "Passed" }
    ],
    activities: [
      { action: "Started quiz 'Microservices Design Patterns'", date: "2026-07-07 08:44" },
      { action: "Completed submodule 'ForkJoinPool'", date: "2026-07-05 16:10" }
    ]
  },
  {
    id: 4,
    name: "Vikram Malhotra",
    email: "vikram.m@xebia.com",
    department: "AI & Analytics",
    practice: "Python",
    grade: "M1",
    learningHours: 12.5,
    avgScore: 78,
    completedCoursesCount: 1,
    status: "Inactive",
    lastActive: "2026-06-30",
    enrolledCourses: [
      { id: 108, title: "Data Science with Pandas", progress: 100, status: "Completed" },
      { id: 109, title: "Deep Learning with PyTorch", progress: 15, status: "In Progress" }
    ],
    assessments: [
      { title: "Pandas DataFrames", score: 78, date: "2026-06-28", status: "Passed" }
    ],
    activities: [
      { action: "Logged out from browser", date: "2026-06-30 18:22" },
      { action: "Completed course 'Data Science with Pandas'", date: "2026-06-28 12:40" }
    ]
  },
  {
    id: 5,
    name: "Rohan Das",
    email: "rohan.das@xebia.com",
    department: "Computer Science",
    practice: "Security",
    grade: "E2",
    learningHours: 24.1,
    avgScore: 86,
    completedCoursesCount: 2,
    status: "Active",
    lastActive: "2026-07-05",
    enrolledCourses: [
      { id: 110, title: "OWASP Top 10 Security", progress: 100, status: "Completed" },
      { id: 111, title: "OAuth2 & JWT Architectures", progress: 100, status: "Completed" }
    ],
    assessments: [
      { title: "XSS & CSRF Prevention", score: 84, date: "2026-06-24", status: "Passed" },
      { title: "JWT Token verification", score: 88, date: "2026-06-19", status: "Passed" }
    ],
    activities: [
      { action: "Enrolled in course 'OAuth2 & JWT Architectures'", date: "2026-07-05 10:15" }
    ]
  }
];

export default function StudentTracker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('courses');

  // List of departments for filtering
  const departments = useMemo(() => {
    const depts = new Set(MOCK_STUDENTS.map(s => s.department));
    return ['All', ...Array.from(depts)];
  }, []);

  // Filter students based on search and selected filters
  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All' || student.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [searchTerm, selectedDept, selectedStatus]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = MOCK_STUDENTS.length;
    const active = MOCK_STUDENTS.filter(s => s.status === 'Active').length;
    const avgScore = Math.round(MOCK_STUDENTS.reduce((acc, curr) => acc + curr.avgScore, 0) / total);
    const totalHours = Math.round(MOCK_STUDENTS.reduce((acc, curr) => acc + curr.learningHours, 0));
    
    return [
      { title: 'Total Registered Students', value: total, icon: Users, change: '100% active profile sync', color: 'purple' },
      { title: 'Active Students This Week', value: active, icon: UserCheck, change: `${active} of ${total} students`, color: 'emerald' },
      { title: 'Average Assessment Score', value: `${avgScore}%`, icon: Award, change: 'Across all core modules', color: 'blue' },
      { title: 'Total Hours Completed', value: `${totalHours} hrs`, icon: Clock, change: 'Cumulative learning duration', color: 'orange' }
    ];
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader 
        title="Student Tracker" 
        description="Monitor student activity, assessment history, completed courses, and overall learning progression."
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

      {/* Filter and Search Container */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-100 dark:focus:bg-transparent"
          />
        </div>

        {/* Filters Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none hover:border-slate-300 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none hover:border-slate-300 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

      </div>

      {/* Student List Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-white/[0.05] dark:bg-white/[0.01]">
                <th className="px-6 py-4">Student Details</th>
                <th className="px-6 py-4">Cohort / Practice</th>
                <th className="px-6 py-4 text-center">Completed Courses</th>
                <th className="px-6 py-4 text-center">Avg Score</th>
                <th className="px-6 py-4 text-center">Hours Logged</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-white/[0.05]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="group hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    {/* Name and Email */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department & Practice */}
                    <td className="px-6 py-4.5">
                      <p className="font-medium text-slate-700 dark:text-slate-300">{student.department}</p>
                      <p className="text-xs text-slate-400">{student.practice} • {student.grade}</p>
                    </td>

                    {/* Completed Courses Count */}
                    <td className="px-6 py-4.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {student.completedCoursesCount}
                    </td>

                    {/* Average Assessment Score */}
                    <td className="px-6 py-4.5 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        student.avgScore >= 90 ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {student.avgScore}%
                      </span>
                    </td>

                    {/* Learning Hours Logged */}
                    <td className="px-6 py-4.5 text-center font-medium text-slate-700 dark:text-slate-300">
                      {student.learningHours} hrs
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4.5">
                      <Badge 
                        variant={student.status === 'Active' ? 'success' : 'neutral'}
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      >
                        {student.status}
                      </Badge>
                    </td>

                    {/* View Details Button */}
                    <td className="px-6 py-4.5 text-right">
                      <Button
                        onClick={() => setSelectedStudent(student)}
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-350 cursor-pointer flex items-center justify-end gap-1"
                      >
                        <span>View Profile</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No students match your query. Try resetting the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Drawer / Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <Modal
            isOpen={!!selectedStudent}
            onClose={() => setSelectedStudent(null)}
            title="Student Profile Details"
            size="lg"
          >
            <div className="space-y-6">
              {/* Profile Summary Header */}
              <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-transparent p-5 border border-emerald-500/10 dark:from-emerald-950/20 dark:via-teal-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-xl font-black text-white shadow-md">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedStudent.name}</h3>
                    <p className="text-sm text-slate-400">{selectedStudent.email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <Badge className="bg-emerald-100 text-emerald-750 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold">{selectedStudent.department}</Badge>
                      <Badge className="bg-blue-100 text-blue-750 dark:bg-blue-950/50 dark:text-blue-300 font-semibold">{selectedStudent.practice}</Badge>
                      <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">Grade {selectedStudent.grade}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-slate-200/50 dark:border-white/[0.05] pt-4 text-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Learning</p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.learningHours} hrs</p>
                  </div>
                  <div className="border-x border-slate-200/50 dark:border-white/[0.05]">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Avg Quiz Score</p>
                    <p className="text-lg font-black text-emerald-500 mt-0.5">{selectedStudent.avgScore}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Completed Courses</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-450 mt-0.5">{selectedStudent.completedCoursesCount}</p>
                  </div>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 dark:border-white/[0.05]">
                <button
                  onClick={() => setActiveModalTab('courses')}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    activeModalTab === 'courses' 
                      ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Courses Enrolled
                </button>
                <button
                  onClick={() => setActiveModalTab('assessments')}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    activeModalTab === 'assessments' 
                      ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Assessment History
                </button>
                <button
                  onClick={() => setActiveModalTab('activity')}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    activeModalTab === 'activity' 
                      ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Recent Activities
                </button>
              </div>

              {/* Tab Contents */}
              <div className="max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {activeModalTab === 'courses' && (
                  <div className="space-y-4">
                    {selectedStudent.enrolledCourses.map(course => (
                      <div 
                        key={course.id} 
                        className="rounded-xl border border-slate-100 p-4 dark:border-white/[0.03] dark:bg-white/[0.005]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{course.title}</p>
                          <Badge 
                            variant={course.status === 'Completed' ? 'success' : 'primary'}
                            className="text-[10px] font-semibold"
                          >
                            {course.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500 w-8 text-right">{course.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeModalTab === 'assessments' && (
                  <div className="space-y-3">
                    {selectedStudent.assessments.map((test, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 dark:border-white/[0.03]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{test.title}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {test.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 rounded-lg px-2.5 py-1">
                            {test.score}%
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">{test.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeModalTab === 'activity' && (
                  <div className="relative border-l border-slate-200 dark:border-white/[0.05] pl-6 ml-3 space-y-5">
                    {selectedStudent.activities.map((act, index) => (
                      <div key={index} className="relative">
                        <span className="absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{act.action}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{act.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button Footer */}
              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                <Button onClick={() => setSelectedStudent(null)} variant="primary" className="rounded-xl">
                  Close Profile
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
