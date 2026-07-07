import React, { useMemo } from 'react';
import { 
  BookOpen, Users, ClipboardCheck, Clock, ArrowUpRight, 
  TrendingUp, Award, Calendar, ChevronRight, Activity, AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCatalog } from '@/hooks/useCatalog';

const MOCK_ALERTS = [
  { id: 1, type: "grading", text: "Abhay Kumawat submitted Docker assessment", time: "10m ago", course: "Docker & Kubernetes Mastery" },
  { id: 2, type: "low_score", text: "Vikram Malhotra scored 65% in Data Science quiz", time: "2h ago", course: "Data Science with Pandas" },
  { id: 3, type: "enrollment", text: "Neha Patel enrolled in OAuth2 & JWT", time: "4h ago", course: "OAuth2 & JWT Architectures" }
];

export default function TeacherDashboard() {
  const { courses, categories, hydrated } = useCatalog();

  const dynamicPerformance = useMemo(() => {
    if (!hydrated) return [];
    return courses.map(course => {
      const catName = categories.find(cat => cat.id === course.categoryId)?.name || 'General';
      const seed = course.id || 1;
      const activeStudents = (seed * 7) % 30 + 15;
      const passingRate = (seed * 3) % 15 + 83;
      const avgScore = (seed * 4) % 12 + 81;
      return {
        id: course.id,
        title: course.title,
        category: catName,
        activeStudents,
        passingRate,
        avgScore
      };
    });
  }, [courses, categories, hydrated]);

  const stats = useMemo(() => {
    const courseCount = courses?.length || 0;
    const catCount = categories?.filter(c => !c.deletedAt)?.length || 0;
    const totalStudents = courseCount * 12 + 101;
    
    return [
      { title: 'My Managed Courses', value: String(courseCount), icon: BookOpen, change: `Across ${catCount} categories`, color: 'purple' },
      { title: 'Enrolled Students', value: String(totalStudents), icon: Users, change: 'Active this semester', color: 'emerald' },
      { title: 'Avg Passing Rate', value: '93%', icon: Award, change: 'Target rate is 90%', color: 'blue' },
      { title: 'Pending Submissions', value: '1', icon: ClipboardCheck, change: 'Requires evaluation', color: 'orange' }
    ];
  }, [courses, categories]);

  if (!hydrated) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader 
        title="Teacher Dashboard" 
        description="Review curriculum effectiveness, evaluate student submissions, and monitor course enrollments."
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Performance Table (2/3 col) */}
        <div className="lg:col-span-2 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Course Performance</h3>
              <p className="text-xs text-slate-400">Average metrics and metrics from active classes</p>
            </div>
            <Link to="/teacher/courses">
              <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">
                View All Courses
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-xs font-bold text-slate-400 uppercase tracking-wider pb-3">
                  <th className="pb-3">Course Title</th>
                  <th className="pb-3 text-center">Active Enrolled</th>
                  <th className="pb-3 text-center">Avg Score</th>
                  <th className="pb-3 text-center">Passing Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {dynamicPerformance.map(course => (
                  <tr key={course.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.005]">
                    <td className="py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{course.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{course.category}</p>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {course.activeStudents} students
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-emerald-500 font-black">{course.avgScore}%</span>
                    </td>
                    <td className="py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {course.passingRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts and Activity Feed (1/3 col) */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Action Alerts</h3>
            <p className="text-xs text-slate-400">Events requiring instructor review</p>
          </div>

          <div className="space-y-4">
            {MOCK_ALERTS.map(alert => (
              <div 
                key={alert.id}
                className="flex gap-3.5 rounded-2xl border border-slate-100 dark:border-white/[0.03] p-4 bg-slate-50/50 dark:bg-white/[0.005] hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  alert.type === 'grading' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : alert.type === 'low_score'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {alert.text}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[120px] font-medium">{alert.course}</span>
                    <span className="font-bold text-slate-500">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-white/[0.05] pt-4.5">
            <Link to="/teacher/assessments">
              <Button className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer">
                Manage All Assessments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
