import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, Users, FileText, CheckCircle, Clock, Award, 
  TrendingUp, Calendar, ArrowLeft, Download, ShieldAlert, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import { getAssessments, getSubmissions } from '@/services/assessmentService';

export default function TeacherAnalytics() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [assList, subList] = await Promise.all([
          getAssessments(),
          getSubmissions()
        ]);
        setAssessments(assList);
        setSubmissions(subList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // calculations
  const totalStudents = 5;
  const pendingReviews = useMemo(() => submissions.filter(s => s.status === 'Pending Evaluation').length, [submissions]);
  const completedReviews = useMemo(() => submissions.filter(s => s.status === 'Graded').length, [submissions]);
  const avgScore = useMemo(() => {
    const graded = submissions.filter(s => s.score !== null);
    if (graded.length === 0) return 85; // Fallback
    return Math.round(graded.reduce((acc, curr) => acc + curr.score, 0) / graded.length);
  }, [submissions]);

  const passRatio = useMemo(() => {
    const graded = submissions.filter(s => s.score !== null);
    if (graded.length === 0) return 92;
    const passed = graded.filter(s => s.score >= 50).length;
    return Math.round((passed / graded.length) * 100);
  }, [submissions]);

  // Student Leaderboard / Rankings
  const studentRankings = useMemo(() => {
    const students = [
      { name: "Abhay Kumawat", enrollmentNo: "XEB-2026-081", department: "Data & AI", avgScore: 92, certificates: 3 },
      { name: "Aarav Sharma", enrollmentNo: "XEB-2026-095", department: "DevOps & Cloud", avgScore: 85, certificates: 2 },
      { name: "Neha Patel", enrollmentNo: "XEB-2026-112", department: "Computer Science", avgScore: 89, certificates: 2 },
      { name: "Rohan Das", enrollmentNo: "XEB-2026-204", department: "Computer Science", avgScore: 86, certificates: 1 },
      { name: "Vikram Malhotra", enrollmentNo: "XEB-2026-150", department: "AI & Analytics", avgScore: 78, certificates: 1 }
    ];
    return students.sort((a, b) => b.avgScore - a.avgScore);
  }, []);

  // Stats list
  const statCards = [
    { title: 'Registered Students', value: totalStudents, icon: Users, change: '100% active roster', color: 'purple' },
    { title: 'Total Assignments', value: assessments.length || 4, icon: FileText, change: 'Across all core courses', color: 'blue' },
    { title: 'Pending Evaluations', value: pendingReviews, icon: Clock, change: 'Requires teacher grading', color: 'orange' },
    { title: 'Average Assessment Score', value: `${avgScore}%`, icon: Award, change: `Pass Ratio: ${passRatio}%`, color: 'emerald' }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#831B84] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 px-6 bg-slate-50 dark:bg-[#0B1120] min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <PageHeader 
        title="Teacher Analytics Dashboard"
        description="Monitor submission rates, grade distributions, and student progression metrics."
        action={
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="flex items-center gap-2 rounded-2xl border-[#831B84]/20 bg-[#831B84]/5 text-[#831B84] hover:bg-[#831B84]/10 dark:text-[#831B84] font-semibold cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </Button>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
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

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Bar Chart: Submission Rates */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <BarChart2 className="h-4.5 w-4.5 text-[#831B84]" />
              <span>Submission Rate per Assignment</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mb-6 uppercase tracking-wider">Completed submissions vs class size</p>
          </div>
          <div className="h-48 flex items-end justify-between px-2 gap-4">
            {[
              { label: 'GenAI Quiz', pct: 80, color: '#831B84' },
              { label: 'Docker Quiz', pct: 60, color: '#FF6200' },
              { label: 'Spring REST', pct: 40, color: '#10B981' },
              { label: 'Pandas Quiz', pct: 20, color: '#3B82F6' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="relative w-full flex justify-center">
                  {/* Tooltip */}
                  <span className="absolute -top-7 text-[10px] font-black text-white bg-slate-900 dark:bg-slate-800 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.pct}%
                  </span>
                  <div 
                    style={{ height: `${(bar.pct / 100) * 120}px`, backgroundColor: bar.color }}
                    className="w-8 rounded-t-lg transition-all duration-500 hover:opacity-85 shadow-sm"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 truncate w-14 text-center">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart: Grade Distribution */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Award className="h-4.5 w-4.5 text-[#831B84]" />
              <span>Grade Distribution</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mb-4 uppercase tracking-wider">Across graded submissions</p>
          </div>
          
          <div className="flex items-center justify-around gap-2">
            {/* Custom SVG Donut */}
            <svg width="120" height="120" viewBox="0 0 42 42" className="transform -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="4.5" className="dark:stroke-slate-850" />
              {/* Segment 1: A/A+ (60%) */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#831B84" strokeWidth="4.5" strokeDasharray="60 40" strokeDashoffset="0" />
              {/* Segment 2: B/B+ (30%) */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#FF6200" strokeWidth="4.5" strokeDasharray="30 70" strokeDashoffset="-60" />
              {/* Segment 3: C/D (10%) */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="4.5" strokeDasharray="10 90" strokeDashoffset="-90" />
            </svg>

            <div className="text-[10px] font-bold space-y-1.5 text-slate-550 dark:text-slate-400">
              <p className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#831B84]" /> A+/A (60%)</p>
              <p className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FF6200]" /> B+/B (30%)</p>
              <p className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#10B981]" /> C/D/F (10%)</p>
            </div>
          </div>
        </div>

        {/* Line / Area Chart: Submission Trend */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <TrendingUp className="h-4.5 w-4.5 text-[#831B84]" />
              <span>Monthly Submissions Trend</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mb-4 uppercase tracking-wider">Historical monthly timeline</p>
          </div>

          <div className="h-32 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#831B84" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#831B84" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-white/[0.02]" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-white/[0.02]" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-white/[0.02]" />
              
              {/* Area */}
              <path d="M 0 100 L 0 80 Q 50 60 75 70 T 150 40 T 225 50 T 300 20 L 300 100 Z" fill="url(#areaGrad)" />
              {/* Line */}
              <path d="M 0 80 Q 50 60 75 70 T 150 40 T 225 50 T 300 20" fill="none" stroke="#831B84" strokeWidth="2.5" />
              
              {/* Dots */}
              <circle cx="75" cy="70" r="3.5" fill="#831B84" />
              <circle cx="150" cy="40" r="3.5" fill="#831B84" />
              <circle cx="225" cy="50" r="3.5" fill="#831B84" />
              <circle cx="300" cy="20" r="3.5" fill="#831B84" />
            </svg>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-1">
              <span>April</span>
              <span>May</span>
              <span>June</span>
              <span>July (Current)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Weekly Submission Heat Map & Roster Ranking */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Heat Map Calendar Grid */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02] lg:col-span-1 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Calendar className="h-4.5 w-4.5 text-[#831B84]" />
              <span>Weekly Activity Heat Map</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Submission frequency calendar</p>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {/* 7 Days headings */}
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-[9px] font-bold text-slate-400 text-center">{d}</span>
            ))}
            
            {/* 28 blocks of heat map grid */}
            {[
              2, 5, 0, 1, 3, 0, 0,
              4, 1, 2, 0, 3, 0, 1,
              0, 2, 6, 1, 0, 0, 0,
              1, 3, 2, 5, 1, 0, 2
            ].map((freq, i) => {
              let color = 'bg-slate-100 dark:bg-slate-850';
              if (freq > 0 && freq <= 2) color = 'bg-purple-200 dark:bg-purple-950/40 text-purple-650';
              if (freq > 2 && freq <= 4) color = 'bg-[#831B84]/40 text-white';
              if (freq > 4) color = 'bg-[#831B84] text-white';

              return (
                <div 
                  key={i} 
                  className={`h-7 rounded-md ${color} flex items-center justify-center text-[9px] font-black shadow-xs transition-transform hover:scale-105 cursor-pointer`}
                  title={`${freq} submissions`}
                >
                  {freq > 0 ? freq : ''}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 pt-2">
            <span>Low Frequency</span>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded bg-slate-100 dark:bg-slate-850" />
              <span className="h-2 w-2 rounded bg-purple-200" />
              <span className="h-2 w-2 rounded bg-[#831B84]/40" />
              <span className="h-2 w-2 rounded bg-[#831B84]" />
            </div>
            <span>High Intensity</span>
          </div>
        </div>

        {/* Student Leaderboard Rankings */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.02] lg:col-span-2 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Sparkles className="h-4.5 w-4.5 text-[#831B84]" />
              <span>Student Performance Leaderboard</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ranked by average assessment marks</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Student details</th>
                  <th className="pb-2">Enrollment No</th>
                  <th className="pb-2">Department</th>
                  <th className="pb-2 text-center">Certificates</th>
                  <th className="pb-2 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {studentRankings.map((st, idx) => (
                  <tr key={st.enrollmentNo} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.005]">
                    <td className="py-2.5 font-black text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                      {st.name}
                    </td>
                    <td className="py-2.5 text-slate-500 font-semibold">
                      {st.enrollmentNo}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-500">
                      {st.department}
                    </td>
                    <td className="py-2.5 text-center font-bold text-purple-600 dark:text-purple-400">
                      {st.certificates}
                    </td>
                    <td className="py-2.5 text-right font-black text-emerald-500">
                      {st.avgScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
