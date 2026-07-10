'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, FolderOpen, HardDrive, Percent, ArrowUpRight,
  TrendingUp, Calendar, CheckCircle, Clock, Plus, BarChart2,
  Filter, Award, Download, Zap, Brain, Shield, ChevronDown,
  UserPlus, FolderPlus, ClipboardList, CheckSquare, Activity, FileText, Sparkles, Play, ArrowRight
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { StatCard as DashboardStatCard } from '@/components/dashboard/DashboardCards';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';

export default function Dashboard() {
  const { showToast } = useToast();
  const panelClass = 'rounded-[28px] border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-6 shadow-sm dark:shadow-xl ring-1 ring-slate-100/50 dark:ring-white/[0.04] backdrop-blur-xl transition-all duration-300 text-slate-850 dark:text-slate-100';
  
  // Tab states
  const [activeTab, setActiveTab] = useState('summary');
  const [showBranding, setShowBranding] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [showZohoSync, setShowZohoSync] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  
  const [aiTopic, setAiTopic] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const adminCards = [
    { title: 'Course Registry', sub: 'Manage learning syllabus catalogs', icon: BookOpen, to: '/admin/courses', color: 'from-[#831B84] to-[#4A1E47]' },
    { title: 'Category Manager', sub: 'Group curriculum topics', icon: FolderPlus, to: '/admin/categories', color: 'from-[#FF6200] to-[#5B1E53]' },
    { title: 'User Directory', sub: 'Nominated employee directory', icon: Users, to: '/admin/dashboard', color: 'from-[#4A1E47] to-[#331431]' },
    { title: 'Media Library', sub: 'Manage global resource files', icon: HardDrive, to: '/admin/media', color: 'from-[#01AC9F] to-[#018d82]' },
    { title: 'Upload Center', sub: 'Upload study files and notes', icon: Plus, to: '/admin/upload-content', color: 'from-[#5C4F61] to-[#3D3441]' },
    { title: 'System Branding', sub: 'Dynamic primary & secondary colors', icon: Sparkles, action: () => setShowBranding(true), color: 'from-[#793B74] to-[#51234E]' },
    { title: 'Global Analytics', sub: 'Platform learning coverage rates', icon: BarChart2, action: () => setActiveTab('coverage'), color: 'from-[#01AC9F] to-[#0b7f76]' },
    { title: 'AI Syllabus Builder', sub: 'Draft modules from prompt outline', icon: Brain, action: () => setShowAIBuilder(true), color: 'from-[#5B1E53] to-[#3f1239]' },
    { title: 'Zoho Sync Pipeline', sub: 'Zoho integration synchronization', icon: Zap, action: () => setShowZohoSync(true), color: 'from-[#FF6200] to-[#cc4e00]' },
    { title: 'Audit Event Logs', sub: 'Administrator action trail', icon: ClipboardList, action: () => setShowLogs(true), color: 'from-[#855889] to-[#5C395F]' },
    { title: 'Academic Settings', sub: 'Configure session structures', icon: CheckSquare, action: () => setShowSettings(true), color: 'from-[#91759E] to-[#674F73]' },
    { title: 'Academy Impact', sub: 'Enterprise learning certifications', icon: Award, action: () => setShowImpact(true), color: 'from-[#831B84] to-[#FF6200]' }
  ];

  const handleGenerateSyllabus = () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiResult(`### AI Generated Syllabus for "${aiTopic}"\n\n- **Module 1**: Core Foundations & Prerequisites\n- **Module 2**: Practical Hands-on Exercises & Scaffolding\n- **Module 3**: Advanced Architectural Integration\n- **Module 4**: Final Capstone Project Evaluation`);
      setAiLoading(false);
    }, 1500);
  };

  const handleRunZohoSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast('Zoho CRM & HR Sync successfully completed.', 'success');
    }, 2000);
  };

  // Filter states
  const [filters, setFilters] = useState({
    year: '2026',
    quarter: 'all',
    region: 'all',
    location: 'all',
    businessUnit: 'all',
    department: 'all',
    practice: 'all',
    employeeGrade: 'all',
  });

  // Hardcoded Dashboard Mock Data matching backend schemas exactly
  const MOCK_ANALYTICS_DATA = {
    regionsList: ["India", "US", "UK"],
    locationsList: ["Delhi", "Gurgaon", "Bangalore", "Pune", "Noida", "Mumbai"],
    departmentsList: ["Computer Science", "Information Technology", "DevOps & Cloud", "AI & Analytics"],
    gradesList: ["E1", "E2", "E3", "M1", "M2"],
    businessUnitsList: ["Digital", "Cloud & Infra", "Data & AI", "Advisory"],
    practicesList: ["Java", "Python", "Cloud Native", "GenAI", "Security"],

    executiveSummary: {
      totalEmployees: 135,
      employeesNominated: 120,
      employeesTrained: 120,
      learningCoveragePct: 88.8,
      totalSessionsConducted: 48,
      totalAttendees: 120,
      totalNominations: 120,
      totalLearningHours: 2656.0,
      avgHoursPerSession: 55.3,
      totalCertificationsCompleted: 45,
      certificationGrowthPct: 14.5,
      employeesTrainedInAI: 59,
      aiCertificationsAchieved: 18,
      aiLearningHours: 1240.0,
      avgFeedbackRating: 4.6,
      trainingSatisfactionScore: 92,
      recommendationPct: 85
    },

    learningCoverage: {
      regionCoverage: { India: 84.2, US: 72.5, UK: 68.0 },
      locationCoverage: { Delhi: 85.0, Gurgaon: 82.3, Bangalore: 79.5, Pune: 76.0, Noida: 81.2, Mumbai: 74.5 },
      gradeCoverage: { E1: 90.0, E2: 82.5, E3: 75.0, M1: 62.0, M2: 55.0 },
      businessUnitCoverage: { Digital: 82.5, "Cloud & Infra": 79.0, "Data & AI": 88.4, Advisory: 64.0 }
    },

    learningHoursAnalytics: {
      totalLearningHours: 2656.0,
      avgLearningHoursPerEmployee: 19.7,
      avgLearningHoursPerActiveLearner: 22.1,
      topProjects: [
        { project: "Project-105", hours: 124.5 },
        { project: "Project-112", hours: 108.0 },
        { project: "Project-108", hours: 98.4 },
        { project: "Project-114", hours: 95.0 },
        { project: "Project-101", hours: 89.2 }
      ],
      topRegions: [
        { region: "India", hours: 1859.0 },
        { region: "US", hours: 531.0 },
        { region: "UK", hours: 266.0 }
      ],
      topLearners: [
        { name: "Aarav Sharma", hours: 94.5 },
        { name: "Megha Rana", hours: 91.0 },
        { name: "Karan Singh", hours: 88.0 },
        { name: "Rohit Vaishnav", hours: 85.5 },
        { name: "Nisha Sharma", hours: 82.0 },
        { name: "Amit Patel", hours: 78.5 },
        { name: "Neha Singh", hours: 75.0 },
        { name: "Rohan Verma", hours: 72.0 },
        { name: "Kirti Verma", hours: 68.5 },
        { name: "Suresh Kumar", hours: 65.0 }
      ]
    },

    learningPillars: [
      { pillar: "Pillar 1: Compliance Learning", hours: 250, trained: 85, active: true },
      { pillar: "Pillar 2: Technical Learning", hours: 1593, trained: 120, active: true },
      { pillar: "Pillar 3: AI & GenAI Learning", hours: 1240, trained: 59, active: true },
      { pillar: "Pillar 4: Leadership Development", hours: 180, trained: 40, active: true },
      { pillar: "Pillar 5: Upskilling & Cross-Skilling", hours: 320, trained: 65, active: true },
      { pillar: "Pillar 6: Certifications", hours: 450, trained: 45, active: true },
      { pillar: "Pillar 7: Flagship Programs", hours: 420, trained: 55, active: true }
    ],

    aiTransformation: {
      aiReadinessIndex: 82.4,
      employeesTrainedOnAI: 59,
      employeesCertifiedOnAI: 18,
      aiLearningHours: 1240,
      aiSessionsConducted: 12,
      aiAttendancePct: 92.5,
      funnel: {
        registered: 135,
        attended: 120,
        completed: 59,
        certified: 18,
        usingAITools: 41
      },
      toolsAdoption: [
        { tool: "Copilot Users", count: 45 },
        { tool: "Kiro Users", count: 32 },
        { tool: "Claude Users", count: 28 },
        { tool: "Other AI Tools", count: 15 }
      ],
      aiMaturityScore: 78.5
    },

    certificationTracker: {
      funnel: {
        assigned: 65,
        enrolled: 58,
        started: 50,
        completed: 45,
        submitted: 45,
        approvedInZoho: 45
      },
      totalCertifications: 65,
      certificationsByTechnology: {
        AWS: 18,
        Azure: 12,
        Databricks: 10,
        Java: 5
      },
      certificationsByRegion: {
        India: 35,
        US: 7,
        UK: 3
      },
      highDemandCertifications: [
        { name: "AWS Solutions Architect", count: 24 },
        { name: "Databricks Developer", count: 18 },
        { name: "Azure AI Engineer", count: 15 }
      ]
    },

    flagshipPrograms: [
      { program: "YMP (Young Managers)", participants: 25, completionRate: 92, learningHours: 120, feedback: 4.6 },
      { program: "Quantum Shift", participants: 18, completionRate: 88, learningHours: 90, feedback: 4.4 },
      { program: "Tech AI Thon", participants: 55, completionRate: 75, learningHours: 220, feedback: 4.8 },
      { program: "Databricks Program", participants: 30, completionRate: 90, learningHours: 150, feedback: 4.5 }
    ],

    learningTrends: [
      { label: "Jan", sessions: 5, trained: 20, hours: 80, certs: 2 },
      { label: "Feb", sessions: 8, trained: 35, hours: 140, certs: 4 },
      { label: "Mar", sessions: 12, trained: 58, hours: 232, certs: 7 },
      { label: "Apr", sessions: 15, trained: 72, hours: 288, certs: 10 },
      { label: "May", sessions: 20, trained: 95, hours: 380, certs: 15 },
      { label: "Jun", sessions: 25, trained: 120, hours: 2656, certs: 45 }
    ],

    trainingEffectiveness: {
      feedbackScore: 4.6,
      trainerRating: 4.5,
      sessionRating: 4.3,
      recommendationPct: 85,
      attendanceRate: 89.4,
      completionRate: 84.2,
      bestRatedTrainings: [
        { title: "GenAI & Prompt Engineering Foundation", rating: 4.8 },
        { title: "AWS Cloud Practitioner & DevOps Essentials", rating: 4.5 }
      ],
      bestRatedTrainers: [
        { name: "Dr. Priya Sharma", rating: 4.9 },
        { name: "Amit Patel", rating: 4.7 }
      ]
    },

    learningChampions: {
      topLearnerOfTheQuarter: "Aarav Sharma",
      topAILearner: "Akash Patel",
      topCertifiedEmployee: "Neha Singh",
      learningChampionsList: ["Aarav Sharma", "Megha Rana", "Karan Singh", "Rohit Vaishnav", "Nisha Sharma"]
    },

    projectInvestment: [
      { project: "Project-105", trained: 12, hours: 124.5, certs: 3, aiScore: 84.5, coverage: 80 },
      { project: "Project-112", trained: 10, hours: 108.0, certs: 2, aiScore: 78.0, coverage: 75 },
      { project: "Project-108", trained: 8, hours: 98.4, certs: 1, aiScore: 82.5, coverage: 70 },
      { project: "Project-114", trained: 7, hours: 95.0, certs: 2, aiScore: 90.0, coverage: 85 }
    ],

    fresherJourney: {
      funnel: {
        campusHiring: 50,
        trainingEnrollment: 50,
        trainingCompletion: 45,
        certificationCompletion: 40,
        projectAllocation: 42,
        billableDeployment: 38
      },
      freshersHired: 50,
      trainingCompletionRate: 90.0,
      certificationCompletionRate: 80.0,
      deploymentRate: 76.0,
      avgTimeToDeploymentDays: 105
    },

    futureEnhancements: {
      skillGapAnalysis: [
        { skill: "GenAI / LangChain", current: 45, required: 80 },
        { skill: "AWS Cloud Architecture", current: 65, required: 85 },
        { skill: "Databricks & Spark", current: 30, required: 75 }
      ],
      suggestedCourses: [
        { title: "Advanced Kubernetes Patterns", reason: "Popular in DevOps practice" },
        { title: "Generative AI Agents", reason: "Highly demanded skill gap in AI" }
      ],
      predictiveForecasts: {
        certificationCompletionPrediction: "84% success rate predicted",
        learningRiskIndicators: "5 learners behind schedule",
        aiReadinessForecast: "+25% increase in AI capacity next quarter"
      }
    }
  };

  // Data states
  const [data, setData] = useState(MOCK_ANALYTICS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const heroHighlights = useMemo(() => ([
    '2026',
    'Q2',
    `${data?.executiveSummary?.employeesTrained || 120} Active Learners`,
    `${data?.executiveSummary?.totalSessionsConducted || 48} Live Sessions`,
    `${data?.executiveSummary?.learningCoveragePct || 88.8}% Coverage`
  ]), [data]);

  const summaryStats = useMemo(() => ([
    { title: 'Total Users', value: '135', trend: '+8%', iconName: 'Users', color: 'purple' },
    { title: 'Active Students', value: data?.executiveSummary?.employeesTrained || '120', trend: '+12%', iconName: 'UserPlus', color: 'emerald' },
    { title: 'Active Admins', value: '5', trend: 'Stable', iconName: 'Shield', color: 'teal' },
    { title: 'Total Courses', value: '12', trend: '+3 new', iconName: 'BookOpen', color: 'orange' },
    { title: 'Published Courses', value: '9', trend: '75%', iconName: 'CheckCircle', color: 'teal' },
    { title: 'Draft Courses', value: '3', trend: 'Ready', iconName: 'FolderOpen', color: 'plum' },
    { title: 'Total Assessments', value: '24', trend: '+6%', iconName: 'ClipboardList', color: 'pink' },
    { title: 'Certificates Issued', value: data?.executiveSummary?.totalCertificationsCompleted || '45', trend: '+14%', iconName: 'Award', color: 'purple' },
    { title: 'Learning Hours', value: `${data?.executiveSummary?.totalLearningHours || 2656}h`, trend: 'Peak', iconName: 'Clock', color: 'orange' },
    { title: 'Completion Rate', value: `${data?.executiveSummary?.learningCoveragePct || 88}%`, trend: 'Healthy', iconName: 'Percent', color: 'emerald' }
  ]), [data]);

  // Fetch dashboard metrics (disabled to use local mock data)
  const fetchDashboardData = useCallback(async () => {
    // Local mock loading simulation if needed, currently instant
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // CSV Export logic
  const handleExportCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `Xebia_LMS_${activeTab}_Report.csv`;
    
    if (activeTab === 'summary') {
      const s = data.executiveSummary;
      csvContent += "Metric,Value\n";
      csvContent += `Total Employees,${s.totalEmployees}\n`;
      csvContent += `Employees Nominated,${s.employeesNominated}\n`;
      csvContent += `Employees Trained,${s.employeesTrained}\n`;
      csvContent += `Learning Coverage %,${s.learningCoveragePct}%\n`;
      csvContent += `Sessions Conducted,${s.totalSessionsConducted}\n`;
      csvContent += `Learning Hours,${s.totalLearningHours}\n`;
      csvContent += `Certifications Completed,${s.totalCertificationsCompleted}\n`;
      csvContent += `AI Trained,${s.employeesTrainedInAI}\n`;
    } else if (activeTab === 'coverage') {
      csvContent += "Dimension,Name,Coverage %\n";
      Object.entries(data.learningCoverage.regionCoverage).forEach(([k, v]) => {
        csvContent += `Region,${k},${v}%\n`;
      });
      Object.entries(data.learningCoverage.locationCoverage).forEach(([k, v]) => {
        csvContent += `Location,${k},${v}%\n`;
      });
      Object.entries(data.learningCoverage.gradeCoverage).forEach(([k, v]) => {
        csvContent += `Grade,${k},${v}%\n`;
      });
    } else if (activeTab === 'hours') {
      csvContent += "Learner Name,Total Hours\n";
      data.learningHoursAnalytics.topLearners.forEach(l => {
        csvContent += `"${l.name}",${l.hours}\n`;
      });
    } else if (activeTab === 'pillars') {
      csvContent += "Pillar Name,Hours,Trained Employees\n";
      data.learningPillars.forEach(p => {
        csvContent += `"${p.pillar}",${p.hours},${p.trained}\n`;
      });
    } else if (activeTab === 'ai') {
      const ai = data.aiTransformation;
      csvContent += "AI Metric,Value\n";
      csvContent += `AI Readiness Index,${ai.aiReadinessIndex}%\n`;
      csvContent += `Trained on AI,${ai.employeesTrainedOnAI}\n`;
      csvContent += `Certified on AI,${ai.employeesCertifiedOnAI}\n`;
      csvContent += `AI Learning Hours,${ai.aiLearningHours}\n`;
    } else if (activeTab === 'certifications') {
      csvContent += "Technology,Completed Certifications\n";
      Object.entries(data.certificationTracker.certificationsByTechnology).forEach(([k, v]) => {
        csvContent += `"${k}",${v}\n`;
      });
    } else if (activeTab === 'flagship') {
      csvContent += "Program Name,Participants,Hours,Feedback Rating\n";
      data.flagshipPrograms.forEach(p => {
        csvContent += `"${p.program}",${p.participants},${p.learningHours},${p.feedback}\n`;
      });
    } else if (activeTab === 'trends') {
      csvContent += "Month,Sessions,Trained,Hours,Certs\n";
      data.learningTrends.forEach(t => {
        csvContent += `"${t.label}",${t.sessions},${t.trained},${t.hours},${t.certs}\n`;
      });
    } else if (activeTab === 'effectiveness') {
      const e = data.trainingEffectiveness;
      csvContent += "Effectiveness Metric,Score\n";
      csvContent += `Feedback Rating,${e.feedbackScore}/5\n`;
      csvContent += `Trainer Rating,${e.trainerRating}/5\n`;
      csvContent += `Recommendation %,${e.recommendationPct}%\n`;
      csvContent += `Completion %,${e.completionRate}%\n`;
    } else if (activeTab === 'champions') {
      csvContent += "Champion Category,Name\n";
      csvContent += `Top Learner of Quarter,${data.learningChampions.topLearnerOfTheQuarter}\n`;
      csvContent += `Top AI Learner,${data.learningChampions.topAILearner}\n`;
      csvContent += `Top Certified,${data.learningChampions.topCertifiedEmployee}\n`;
    } else if (activeTab === 'investment') {
      csvContent += "Project,Trained Employees,Hours,Certs,AI Score,Coverage\n";
      data.projectInvestment.forEach(p => {
        csvContent += `"${p.project}",${p.trained},${p.hours},${p.certs},${p.aiScore},${p.coverage}%\n`;
      });
    } else if (activeTab === 'fresher') {
      csvContent += "Freshers Hired,Training Completion %,Deployment %\n";
      csvContent += `${data.fresherJourney.freshersHired},${data.fresherJourney.trainingCompletionRate}%,${data.fresherJourney.deploymentRate}%\n`;
    } else {
      csvContent += "Skill,Current Level,Required Level\n";
      data.futureEnhancements.skillGapAnalysis.forEach(sg => {
        csvContent += `"${sg.skill}",${sg.current}%,${sg.required}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${filename}`, 'success');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Predefined options matching Spring Boot Controller mappings
  const yearOptions = ['2026', '2025'];
  const quarterOptions = [
    { label: 'All Quarters', value: 'all' },
    { label: 'Q1 (Jan - Mar)', value: 'q1' },
    { label: 'Q2 (Apr - Jun)', value: 'q2' },
    { label: 'Q3 (Jul - Sep)', value: 'q3' },
    { label: 'Q4 (Oct - Dec)', value: 'q4' }
  ];
  const regionOptions = ['all', 'India', 'US', 'UK'];
  const locationOptions = ['all', 'Delhi', 'Gurgaon', 'Bangalore', 'Pune', 'Noida', 'Mumbai'];
  const buOptions = ['all', 'Digital', 'Cloud & Infra', 'Data & AI', 'Advisory'];
  const deptOptions = ['all', 'Computer Science', 'Information Technology', 'DevOps & Cloud', 'AI & Analytics'];
  const practiceOptions = ['all', 'Java', 'Python', 'Cloud Native', 'GenAI', 'Security'];
  const gradeOptions = ['all', 'E1', 'E2', 'E3', 'M1', 'M2'];

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-success border-t-transparent" />
          <p className="text-sm font-medium text-brand-text-secondary">Connecting to Backend Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-surface p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-brand-text-primary">Analytics Connection Offline</h2>
          <p className="text-sm text-brand-text-secondary">{error}</p>
          <Button onClick={fetchDashboardData} className="w-full">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#09090E] text-slate-800 dark:text-slate-100 px-8 pb-8 pt-6 transition-colors duration-300">
      
      {/* ── Premium Hero Header ── */}
      <div
        style={{ background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 35%, #5B21B6 70%, #6D28D9 100%)' }}
        className="mb-8 rounded-[24px] text-white p-9 sm:p-11 lg:p-12 shadow-2xl shadow-purple-950/60 ring-1 ring-white/20 relative overflow-hidden min-h-[320px] lg:min-h-[360px] flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute right-[-10%] top-[-20%] h-80 w-80 rounded-full bg-purple-400/15 blur-3xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-20%] h-64 w-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        {/* Left Section (60% width) */}
              <div className="relative z-10 space-y-6 w-full lg:w-[58%]">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-white leading-tight">
            Learning Management Dashboard
          </h2>
          <p className="text-sm sm:text-base text-purple-100/95 leading-relaxed font-medium max-w-2xl">
            Manage courses, categories, learning programs, and training content from a centralized admin workspace. Track platform performance, monitor learner engagement, and streamline your organization's learning experience.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {heroHighlights.map((badge, idx) => (
              <span
                key={idx}
                className="text-xs font-bold px-4 py-1.5 rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Right Section (40% width - Symmetrical 2x2 Stats Cards Grid) */}
        <div className="relative z-10 grid grid-cols-2 gap-5 lg:gap-6 w-full lg:w-[40%] shrink-0 min-w-[300px] lg:min-w-[460px]">
          {[
            { label: 'Total Learners', val: data?.executiveSummary?.employeesTrained || 120, icon: Users, iconBg: 'bg-blue-400/25 text-blue-200' },
            { label: 'Completion Rate', val: `${data?.executiveSummary?.learningCoveragePct || 88}%`, icon: Percent, iconBg: 'bg-purple-400/25 text-purple-200' },
            { label: 'Training Hours', val: `${data?.executiveSummary?.totalLearningHours || 2656} hrs`, icon: Clock, iconBg: 'bg-amber-400/25 text-amber-200' },
            { label: 'AI Certified', val: data?.executiveSummary?.employeesTrainedInAI || 59, icon: Brain, iconBg: 'bg-emerald-400/25 text-emerald-200' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
                <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                  className="group bg-white/12 border border-white/20 backdrop-blur-md rounded-[24px] p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:bg-white/18 transition-all duration-300 flex flex-col justify-between min-h-[135px] lg:min-h-[150px] w-full overflow-hidden relative"
              >
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_42%,rgba(255,255,255,0.04))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${stat.iconBg} backdrop-blur-md shadow-inner`}>
                    <Icon className="h-6 w-6 lg:h-7 lg:w-7" />
                  </div>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-100/90 block">{stat.label}</span>
                  <span className="text-2xl sm:text-3xl font-black text-white block mt-1 tracking-tight">{stat.val}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Dynamic Filters Toolbar ── */}
      <div className={`${panelClass} mb-8 text-slate-100`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 border-b border-white/[0.06] pb-3 select-none">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#8B5CF6]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#F8FAFC]">Organizational Filters</span>
          </div>
          
          {/* Action buttons inside filter card header */}
          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer bg-transparent"
            >
              <Download className="h-4 w-4 mr-1.5" /> Export Report
            </button>
            <Link to="/admin/courses/new">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-purple-500/25 transition-all cursor-pointer border-0"
              >
                <Plus className="h-4 w-4" /> Add Course
              </motion.button>
            </Link>
          </div>
        </div>
        
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {[
            { label: 'Year', val: filters.year, opts: yearOptions, key: 'year' },
            { label: 'Quarter', val: filters.quarter, opts: quarterOptions, key: 'quarter', isObj: true },
            { label: 'Region', val: filters.region, opts: regionOptions, key: 'region' },
            { label: 'Location', val: filters.location, opts: locationOptions, key: 'location' },
            { label: 'Department', val: filters.department, opts: deptOptions, key: 'department' },
            { label: 'Practice', val: filters.practice, opts: practiceOptions, key: 'practice' },
            { label: 'Grade', val: filters.employeeGrade, opts: gradeOptions, key: 'employeeGrade' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1] uppercase tracking-wider">{f.label}</label>
              <select
                value={f.val}
                onChange={e => handleFilterChange(f.key, e.target.value)}
                className="w-full h-[52px] rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs text-white outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/40 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              >
                {f.opts.map(o => (
                  <option key={f.isObj ? o.value : o} value={f.isObj ? o.value : o} className="bg-[#0F1017] text-white">
                    {f.isObj ? o.label : (o === 'all' ? `All ${f.label}s` : o)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* ── Premium Navigation Tabs ── */}
      <div className="mb-8 flex flex-wrap gap-5 lg:gap-6 border-b border-white/[0.06] pb-3 select-none">
        {[
          { id: 'summary', label: 'Executive Summary', icon: BarChart2 },
          { id: 'coverage', label: 'Learning Coverage', icon: Users },
          { id: 'hours', label: 'Learning Hours', icon: Clock },
          { id: 'pillars', label: 'Training Pillars', icon: FolderOpen },
          { id: 'ai', label: 'AI Transformation', icon: Brain },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'flagship', label: 'Flagship Programs', icon: Zap },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'effectiveness', label: 'Effectiveness', icon: CheckCircle },
          { id: 'champions', label: 'Champions', icon: Award },
          { id: 'investment', label: 'Project Investment', icon: HardDrive },
          { id: 'fresher', label: 'Fresher Journey', icon: Users },
          { id: 'future', label: 'Future Analytics', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer relative bg-transparent border-0 ${
                active
                  ? 'bg-purple-500/15 text-purple-400'
                  : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {active && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-gradient-to-r from-[#7C3AED] to-[#9333EA] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content View ── */}
      {loading ? (
        <div className="flex py-20 justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#6D28D9] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-8 animate-fade-in text-slate-805 dark:text-slate-100 select-none">
              
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Executive Summary</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live KPIs with animated cards, cleaner hierarchy, and better scanability.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" /> Real-time pulse
                </div>
              </div>

              {/* Shoolini-style Visual LMS Admin Grid */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 select-none">
                {adminCards.map((card, idx) => {
                  const Icon = card.icon;
                  const content = (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.4 }}
                      whileHover={{ y: -6, scale: 1.02, boxShadow: '0 20px 30px rgba(108,29,95,0.12)' }}
                      className={`group relative overflow-hidden rounded-[28px] p-6 text-white shadow-md cursor-pointer h-44 bg-gradient-to-br ${card.color} flex flex-col justify-between`}
                    >
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-300 pointer-events-none">
                        <Icon size={100} strokeWidth={1} />
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                          Admin Portal
                        </span>
                        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm group-hover:rotate-6 transition-transform">
                          <Icon size={18} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-black tracking-tight leading-tight text-white mb-1 group-hover:translate-x-1 transition-transform">
                          {card.title}
                        </h3>
                        <p className="text-[11px] text-white/75 leading-tight font-medium">
                          {card.sub}
                        </p>
                      </div>
                    </motion.div>
                  );

                  return card.to ? (
                    <Link key={card.title} to={card.to}>{content}</Link>
                  ) : (
                    <div key={card.title} onClick={card.action}>{content}</div>
                  );
                })}
              </div>

              {/* Main Dashboard Widget Layout */}
              <div className="grid gap-8 lg:grid-cols-12">
                
                {/* Left Column (8 / 12) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Visual Charts section */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Monthly Enrollments */}
                    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-white">Monthly Enrollments</h4>
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded-full">+24% YoY</span>
                      </div>
                      {/* CSS SVG Bar Chart */}
                      <div className="h-44 w-full flex items-end justify-between pt-4 pb-2 px-1">
                        {[
                          { m: 'Jan', val: 32 },
                          { m: 'Feb', val: 45 },
                          { m: 'Mar', val: 56 },
                          { m: 'Apr', val: 78 },
                          { m: 'May', val: 92 },
                          { m: 'Jun', val: 120 }
                        ].map((bar, i) => (
                          <div key={i} className="flex flex-col items-center flex-1 gap-2">
                            <div className="w-8 rounded-t bg-gradient-to-t from-purple-600 to-indigo-500 hover:opacity-85 transition-all relative group" style={{ height: `${(bar.val / 120) * 110}px` }}>
                              <span className="absolute top-[-26px] left-1/2 -translate-x-1/2 bg-[#0F1017] text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md border border-white/[0.06]">{bar.val}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{bar.m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* User Growth */}
                    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-white">User Growth Trend</h4>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full">MoM Growth</span>
                      </div>
                      {/* SVG Line Graph */}
                      <div className="h-44 w-full relative pt-4">
                        <svg className="w-full h-32" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,80 Q50,60 100,50 T200,30 T300,10" fill="none" stroke="#10B981" strokeWidth="3" />
                          <path d="M0,80 Q50,60 100,50 T200,30 T300,10 L300,100 L0,100 Z" fill="url(#growthGrad)" />
                        </svg>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
                          <span>Jan</span>
                          <span>Mar</span>
                          <span>May</span>
                          <span>Jun</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Learning Analytics */}
                  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <h4 className="text-sm font-bold text-white">AI Learning Analytics & Index</h4>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3 text-xs">
                      <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                        <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">AI Readiness Index</p>
                        <p className="text-2xl font-black text-purple-400 mt-1">{data?.executiveSummary?.learningCoveragePct || 88}%</p>
                        <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: `${data?.executiveSummary?.learningCoveragePct || 88}%` }} />
                        </div>
                      </div>
                      <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                        <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">AI Certifications</p>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{data?.executiveSummary?.employeesTrainedInAI || 59} Certs</p>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">92% Completion success rate</p>
                      </div>
                      <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                        <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">GenAI Copilot Activity</p>
                        <p className="text-2xl font-black text-blue-450 mt-1">94.8% Active</p>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Active coding companion sessions</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-7 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white">Recent Activities Feed</h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        { text: 'Rohit Vaishnav registered as a new student', time: '10 mins ago', badge: 'User', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/10' },
                        { text: 'Dr. Sarah Chen updated Course Module: Cloud Native Deployments', time: '1 hour ago', badge: 'Course', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/10' },
                        { text: 'Priya Sharma created assessment: Terraform Automation Basics', time: '3 hours ago', badge: 'Assessment', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' },
                        { text: 'User Rohit completed certification: AI Foundation Program', time: '5 hours ago', badge: 'Certificate', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/10' }
                      ].map((act, idx) => (
                        <motion.div
                          key={act.time}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.08, duration: 0.3 }}
                          className="flex justify-between items-start gap-4 text-xs p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all"
                        >
                          <div className="flex gap-2.5 items-start flex-1 min-w-0">
                            <span className="h-2 w-2 rounded-full shrink-0 mt-1.5 bg-purple-500" />
                            <p className="font-semibold text-slate-200 leading-tight">{act.text}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 block whitespace-nowrap">{act.time}</span>
                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-lg mt-1 uppercase ${act.color}`}>{act.badge}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top Performers Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Performing Courses */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-7 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300"
                    >
                      <h4 className="text-sm font-bold text-white mb-4">Top Performing Courses</h4>
                      <div className="space-y-3">
                        {[
                          { title: 'Docker & Kubernetes Basics', coverage: 95 },
                          { title: 'Spring Boot & Microservices', coverage: 91 },
                          { title: 'Next.js 14 Enterprise Masterclass', coverage: 88 }
                        ].map((c, i) => (
                          <motion.div
                            key={c.title}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06, duration: 0.3 }}
                            className="text-xs space-y-1.5 p-2.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 transition-all border border-white/[0.04]"
                          >
                            <div className="flex justify-between font-semibold">
                              <span className="truncate pr-4 text-slate-200">{c.title}</span>
                              <span className="text-emerald-400 font-bold shrink-0">{c.coverage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${c.coverage}%` }} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Top Trainers */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-7 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300"
                    >
                      <h4 className="text-sm font-bold text-white mb-4">Top Instructors</h4>
                      <div className="space-y-3.5">
                        {[
                          { name: 'Dr. Sarah Chen', dept: 'Cloud & DevOps', score: '4.9' },
                          { name: 'Dr. Priya Sharma', dept: 'Data & AI', score: '4.8' },
                          { name: 'Prof. James Wilson', dept: 'Enterprise Java', score: '4.7' }
                        ].map((t, i) => (
                          <motion.div
                            key={t.name}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06, duration: 0.3 }}
                            className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white/[0.02] hover:bg-purple-500/10 transition-all border border-white/[0.04]"
                          >
                            <div>
                              <p className="font-bold text-slate-200">{t.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">{t.dept}</p>
                            </div>
                            <span className="font-black text-xs text-purple-400 bg-purple-500/10 border border-purple-500/10 px-2.5 py-1 rounded-full">⭐ {t.score}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                </div>

                {/* Right Column (4 / 12) */}
                <div className="lg:col-span-4 space-y-8">
                  
                  {/* Quick Actions Panel */}
                  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                    <h4 className="text-sm font-bold text-white mb-4">Quick Actions Panel</h4>
                    <div className="flex flex-col gap-2.5">
                      <Link to="/admin/courses/new" className="w-full">
                        <Button className="w-full justify-start text-left text-xs py-3 rounded-xl cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" /> Add Course
                        </Button>
                      </Link>
                      <button
                        onClick={() => showToast('Add User opened', 'info')}
                        className="w-full flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-white/[0.07] transition-all cursor-pointer text-left bg-transparent"
                      >
                        <UserPlus className="h-4 w-4 text-purple-400 mr-1" /> Add User
                      </button>
                      <button
                        onClick={() => showToast('Create Assessment opened', 'info')}
                        className="w-full flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-white/[0.07] transition-all cursor-pointer text-left bg-transparent"
                      >
                        <ClipboardList className="h-4 w-4 text-emerald-400 mr-1" /> Create Assessment
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="w-full flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-white/[0.07] transition-all cursor-pointer text-left bg-transparent"
                      >
                        <FileText className="h-4 w-4 text-blue-400 mr-1" /> Generate Report
                      </button>
                      <button
                        onClick={() => showToast('Publish Certificate opened', 'info')}
                        className="w-full flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-white/[0.07] transition-all cursor-pointer text-left bg-transparent"
                      >
                        <Award className="h-4 w-4 text-amber-400 mr-1" /> Publish Certificate
                      </button>
                    </div>
                  </div>

                  {/* Latest Course Uploads */}
                  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                    <h4 className="text-sm font-bold text-white mb-4">Latest Course Uploads</h4>
                    <div className="space-y-4">
                      {[
                        { title: 'Kubernetes Deep Dive', bu: 'Cloud & Infra', files: '12 submodules' },
                        { title: 'Advanced React Architecture', bu: 'Digital BU', files: '8 submodules' },
                        { title: 'Introduction to GenAI', bu: 'Data & AI BU', files: '6 submodules' }
                      ].map((c, i) => (
                        <div key={c.title} className="text-xs flex gap-3 items-center justify-between border-b border-white/[0.06] pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-bold text-slate-200">{c.title}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{c.bu} · {c.files}</p>
                          </div>
                          <Play className="h-4 w-4 text-purple-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Student Registrations */}
                  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                    <h4 className="text-sm font-bold text-white mb-4">Recent Student Registrations</h4>
                    <div className="space-y-3.5">
                      {[
                        { name: 'Rohit Vaishnav', practice: 'Java Development', badge: 'Online' },
                        { name: 'Nisha Sharma', practice: 'GenAI Technologies', badge: 'Online' },
                        { name: 'Kirti Verma', practice: 'Security Services', badge: 'Offline' }
                      ].map((std, i) => (
                        <div key={std.name} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-200">{std.name}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{std.practice}</p>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${std.badge === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-white/[0.05] text-slate-400 border border-white/[0.06]'}`}>{std.badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                    <h4 className="text-sm font-bold text-white mb-4">Pending Approvals</h4>
                    <div className="space-y-3 text-xs">
                      {[
                        { text: 'AWS Cloud Practitioner certification request', desc: 'Requested by Rohit Vaishnav' },
                        { text: 'Terraform Advanced course draft publish request', desc: 'Uploaded by Amit Patel' }
                      ].map((app, i) => (
                        <div key={app.text} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] space-y-1">
                          <p className="font-semibold text-slate-200 leading-tight">{app.text}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{app.desc}</p>
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => showToast('Approved successfully', 'success')} className="text-[9px] font-bold text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer">Approve</button>
                            <button onClick={() => showToast('Declined request', 'warning')} className="text-[9px] font-bold text-red-400 hover:underline bg-transparent border-0 cursor-pointer">Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Live Sessions */}
                  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300">
                    <h4 className="text-sm font-bold text-white mb-4">Upcoming Live Sessions</h4>
                    <div className="space-y-3.5">
                      {[
                        { title: 'Kubernetes Hands-on Workshop', date: 'July 5th, 2:00 PM', host: 'Sarah Chen' },
                        { title: 'AI & GenAI Integration Q&A Session', date: 'July 8th, 11:00 AM', host: 'Priya Sharma' }
                      ].map((ses, i) => (
                        <div key={ses.title} className="text-xs flex gap-3.5 items-start">
                          <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0 text-center min-w-[40px]">
                            <Calendar className="h-4 w-4 mx-auto" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{ses.title}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Host: {ses.host} · {ses.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LEARNING COVERAGE */}
          {activeTab === 'coverage' && (
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in text-slate-100">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300 space-y-4">
                <h3 className="text-sm font-bold text-white">Coverage by Region & Location</h3>
                <div className="space-y-3">
                  {Object.entries(data.learningCoverage.locationCoverage).map(([loc, val]) => (
                    <div key={loc} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>{loc} location</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full" style={{ width: `${val}%`, background: 'linear-gradient(90deg, #8B5CF6, #10B981)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300 space-y-4">
                <h3 className="text-sm font-bold text-white">Coverage by Employee Grade & BU</h3>
                <div className="space-y-3">
                  {Object.entries(data.learningCoverage.gradeCoverage).map(([grade, val]) => (
                    <div key={grade} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>Grade {grade}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full" style={{ width: `${val}%`, background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)' }} />
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-white/[0.06] my-4 pt-3" />
                  {Object.entries(data.learningCoverage.businessUnitCoverage).map(([bu, val]) => (
                    <div key={bu} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>BU: {bu}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEARNING HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-6 animate-fade-in text-slate-100">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TOTAL LEARNING HOURS</p>
                  <p className="text-3xl font-black mt-1 text-purple-400">{data.learningHoursAnalytics.totalLearningHours} hrs</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AVG HOURS PER EMPLOYEE</p>
                  <p className="text-3xl font-black mt-1 text-indigo-400">{data.learningHoursAnalytics.avgLearningHoursPerEmployee} hrs</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AVG HOURS PER ACTIVE LEARNER</p>
                  <p className="text-3xl font-black mt-1 text-emerald-400">{data.learningHoursAnalytics.avgLearningHoursPerActiveLearner} hrs</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Top 10 Learners</h3>
                  <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-white/[0.04] border-b border-white/[0.06] font-bold text-slate-400">
                          <th className="px-4 py-2">Learner</th>
                          <th className="px-4 py-2 text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.learningHoursAnalytics.topLearners.map((l, idx) => (
                          <tr key={idx} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-2 font-medium text-slate-200">{l.name}</td>
                            <td className="px-4 py-2 text-right font-bold text-emerald-400">{l.hours} hrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Hours by Project & Region</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Projects Investment</p>
                      {data.learningHoursAnalytics.topProjects.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium">{p.project}</span>
                          <span className="font-bold text-purple-400">{p.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/[0.06] my-4" />
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Regions Distribution</p>
                      {data.learningHoursAnalytics.topRegions.map((r, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium">{r.region}</span>
                          <span className="font-bold text-indigo-400">{r.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRAINING PILLARS */}
          {activeTab === 'pillars' && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-fade-in text-slate-100">
              {data.learningPillars.map((p, idx) => (
                <div key={idx} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                    <h4 className="text-xs font-bold text-white">{p.pillar}</h4>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Trained Employees:</span>
                    <strong className="text-slate-200">{p.trained}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Total Learning Hours:</span>
                    <strong className="text-emerald-400">{p.hours} hrs</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: AI TRANSFORMATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in text-slate-100">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-550">AI READINESS INDEX</p>
                  <p className="text-3xl font-black mt-1 text-purple-400">{data.aiTransformation.aiReadinessIndex}%</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-550">TRAINED ON AI</p>
                  <p className="text-3xl font-black mt-1 text-indigo-400">{data.aiTransformation.employeesTrainedOnAI}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-550">AI CERTIFICATIONS</p>
                  <p className="text-3xl font-black mt-1 text-emerald-400">{data.aiTransformation.employeesCertifiedOnAI}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-550">AI MATURITY SCORE</p>
                  <p className="text-3xl font-black mt-1 text-orange-400">{data.aiTransformation.aiMaturityScore} / 100</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Adoption Funnel</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Registered Pool', val: data.aiTransformation.funnel.registered, pct: 100, color: 'bg-slate-500' },
                      { label: 'Nominated Pool', val: data.aiTransformation.funnel.attended, pct: Math.round((data.aiTransformation.funnel.attended / data.aiTransformation.funnel.registered) * 100), color: 'bg-blue-500' },
                      { label: 'Trained Pool', val: data.aiTransformation.funnel.completed, pct: Math.round((data.aiTransformation.funnel.completed / data.aiTransformation.funnel.registered) * 100), color: 'bg-purple-500' },
                      { label: 'Certified Pool', val: data.aiTransformation.funnel.certified, pct: Math.round((data.aiTransformation.funnel.certified / data.aiTransformation.funnel.registered) * 100), color: 'bg-green-500' },
                      { label: 'Active Tool Usage', val: data.aiTransformation.funnel.usingAITools, pct: Math.round((data.aiTransformation.funnel.usingAITools / data.aiTransformation.funnel.registered) * 100), color: 'bg-amber-500' }
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold text-slate-300">
                          <span>{step.label}</span>
                          <span>{step.val} ({step.pct}%)</span>
                        </div>
                        <div className="h-3 w-full rounded-lg bg-white/[0.06] overflow-hidden">
                          <div className={`h-full ${step.color}`} style={{ width: `${step.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Tools Adoption</h3>
                  <div className="space-y-4">
                    {data.aiTransformation.toolsAdoption.map((ta, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-white/[0.06] pb-2.5 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-300">{ta.tool}</span>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{ta.count} active developers</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-fade-in text-slate-100">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Certification Pipeline Funnel</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Assigned Certifications', count: data.certificationTracker.funnel.assigned, color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
                      { label: 'Enrolled & Started', count: data.certificationTracker.funnel.enrolled, color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
                      { label: 'Completed & Submitted', count: data.certificationTracker.funnel.completed, color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
                      { label: 'Zoho Approved', count: data.certificationTracker.funnel.approvedInZoho, color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-white/[0.06] pb-2.5 last:border-0 last:pb-0">
                        <span className="font-medium text-slate-350">{item.label}</span>
                        <span className={`font-black px-3 py-1 rounded-full text-[10px] ${item.color}`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Certifications by Technology</h3>
                  <div className="space-y-3">
                    {Object.entries(data.certificationTracker.certificationsByTechnology).map(([tech, count]) => (
                      <div key={tech} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-semibold">{tech}</span>
                        <strong className="text-emerald-400">{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FLAGSHIP PROGRAMS */}
          {activeTab === 'flagship' && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300 space-y-4 animate-fade-in text-slate-100">
              <h3 className="text-sm font-bold text-white">Flagship Programs Analytics</h3>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/[0.06] font-bold text-slate-400">
                      <th className="px-4 py-3">Program Name</th>
                      <th className="px-4 py-3">Participants</th>
                      <th className="px-4 py-3">Completion Rate</th>
                      <th className="px-4 py-3">Total Learning Hours</th>
                      <th className="px-4 py-3 text-right">Feedback Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.flagshipPrograms.map((p, idx) => (
                      <tr key={idx} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-200">{p.program}</td>
                        <td className="px-4 py-3 text-slate-450">{p.participants} members</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">{p.completionRate}%</td>
                        <td className="px-4 py-3 font-bold text-indigo-400">{p.learningHours} hrs</td>
                        <td className="px-4 py-3 text-right font-black text-amber-400">⭐ {p.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: TRENDS */}
          {activeTab === 'trends' && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300 space-y-4 animate-fade-in text-slate-100">
              <h3 className="text-sm font-bold text-white">Month-over-Month Learning Progress</h3>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/[0.06] font-bold text-slate-400">
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Sessions Conducted</th>
                      <th className="px-4 py-3">Employees Trained</th>
                      <th className="px-4 py-3">Total Learning Hours</th>
                      <th className="px-4 py-3 text-right">Certifications Achieved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.learningTrends.map((t, idx) => (
                      <tr key={idx} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-200">{t.label}</td>
                        <td className="px-4 py-3 text-slate-450">{t.sessions} sessions</td>
                        <td className="px-4 py-3 text-slate-450">{t.trained} trainees</td>
                        <td className="px-4 py-3 font-bold text-purple-400">{t.hours} hrs</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">{t.certs} certs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: TRAINING EFFECTIVENESS */}
          {activeTab === 'effectiveness' && (
            <div className="space-y-6 animate-fade-in text-slate-100">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">FEEDBACK SCORE</p>
                  <p className="text-3xl font-black mt-1 text-emerald-400">{data.trainingEffectiveness.feedbackScore} / 5.0</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TRAINER RATING</p>
                  <p className="text-3xl font-black mt-1 text-purple-400">{data.trainingEffectiveness.trainerRating} / 5.0</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">RECOMMENDATION %</p>
                  <p className="text-3xl font-black mt-1 text-indigo-400">{data.trainingEffectiveness.recommendationPct}%</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Best Rated Courses</h3>
                  <div className="space-y-3">
                    {data.trainingEffectiveness.bestRatedTrainings.map((br, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-white/[0.06] pb-2.5 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-300">{br.title}</span>
                        <span className="text-amber-400 font-bold">⭐ {br.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Top Trainers</h3>
                  <div className="space-y-3">
                    {data.trainingEffectiveness.bestRatedTrainers.map((br, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-white/[0.06] pb-2.5 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-300">{br.name}</span>
                        <span className="text-emerald-400 font-bold">⭐ {br.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: LEARNING CHAMPIONS */}
          {activeTab === 'champions' && (
            <div className="space-y-6 animate-fade-in text-slate-100">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 shadow-xl ring-1 ring-white/[0.04] space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Learner of Quarter</p>
                  <h4 className="text-lg font-bold text-emerald-400">{data.learningChampions.topLearnerOfTheQuarter}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Highest study hours recorded</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 shadow-xl ring-1 ring-white/[0.04] space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top AI Transformation Learner</p>
                  <h4 className="text-lg font-bold text-purple-400">{data.learningChampions.topAILearner}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Top scorer in AI certifications</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 shadow-xl ring-1 ring-white/[0.04] space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Certified Pioneer</p>
                  <h4 className="text-lg font-bold text-indigo-400">{data.learningChampions.topCertifiedEmployee}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Completed multiple certifications</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                <h3 className="text-sm font-bold text-white">Executive Learning Champions List</h3>
                <div className="grid gap-3 sm:grid-cols-5 text-center">
                  {data.learningChampions.learningChampionsList.map((champ, idx) => (
                    <div key={idx} className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.04] transition-all">
                      <span className="text-xl">🏆</span>
                      <p className="text-xs font-bold text-slate-200 mt-1">{champ}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: PROJECT INVESTMENT */}
          {activeTab === 'investment' && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300 space-y-4 animate-fade-in text-slate-100">
              <h3 className="text-sm font-bold text-white">Project learning investments</h3>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/[0.06] font-bold text-slate-400">
                      <th className="px-4 py-3">Project Code</th>
                      <th className="px-4 py-3">Employees Trained</th>
                      <th className="px-4 py-3">Total Hours Invested</th>
                      <th className="px-4 py-3">Certifications Achieved</th>
                      <th className="px-4 py-3">AI Readiness Score</th>
                      <th className="px-4 py-3 text-right">Coverage Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projectInvestment.map((p, idx) => (
                      <tr key={idx} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-200">{p.project}</td>
                        <td className="px-4 py-3 text-slate-450">{p.trained} trainees</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">{p.hours} hrs</td>
                        <td className="px-4 py-3 text-slate-450">{p.certs} completed</td>
                        <td className="px-4 py-3 font-bold text-purple-400">{p.aiScore} pts</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">{p.coverage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: FRESHER JOURNEY */}
          {activeTab === 'fresher' && (
            <div className="space-y-6 animate-fade-in text-slate-100">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">CAMPUS RECRUITS</p>
                  <p className="text-3xl font-black mt-1 text-emerald-400">{data.fresherJourney.freshersHired}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TRAINING COMPLETION</p>
                  <p className="text-3xl font-black mt-1 text-emerald-400">{data.fresherJourney.trainingCompletionRate}%</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">DEPLOYMENT RATE</p>
                  <p className="text-3xl font-black mt-1 text-purple-400">{data.fresherJourney.deploymentRate}%</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center shadow-xl ring-1 ring-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AVG TIME TO DEPLOY</p>
                  <p className="text-3xl font-black mt-1 text-amber-400">{data.fresherJourney.avgTimeToDeploymentDays} Days</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                <h3 className="text-sm font-bold text-white">Campus to Deployment Funnel Tracker</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Hired & Inducted', count: data.fresherJourney.funnel.campusHiring, color: 'bg-slate-500' },
                    { label: 'Enrolled in Technical Training', count: data.fresherJourney.funnel.trainingEnrollment, color: 'bg-blue-550' },
                    { label: 'Completed Learning Journey', count: data.fresherJourney.funnel.trainingCompletion, color: 'bg-purple-500' },
                    { label: 'Acquired Certification', count: data.fresherJourney.funnel.certificationCompletion, color: 'bg-pink-500' },
                    { label: 'Project Allocated', count: data.fresherJourney.funnel.projectAllocation, color: 'bg-amber-500' },
                    { label: 'Billably Deployed', count: data.fresherJourney.funnel.billableDeployment, color: 'bg-green-500' }
                  ].map((step, idx) => {
                    const maxCount = data.fresherJourney.funnel.campusHiring;
                    const pct = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold text-slate-300">
                          <span>{step.label}</span>
                          <span>{step.count} candidates ({pct}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-lg bg-white/[0.06] overflow-hidden">
                          <div className={`h-full ${step.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FUTURE ANALYTICS */}
          {activeTab === 'future' && (
            <div className="space-y-6 animate-fade-in text-slate-100">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-purple-400" /> Skill Gap Analysis Matrix
                  </h3>
                  <div className="space-y-4">
                    {data.futureEnhancements.skillGapAnalysis.map((sg, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold text-slate-350">
                          <span>{sg.skill}</span>
                          <span>Current: {sg.current}% / Target: {sg.required}%</span>
                        </div>
                        <div className="relative h-3 w-full rounded-lg bg-white/[0.06] overflow-hidden">
                          {/* target indicator */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${sg.required}%` }} title="Target Required" />
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-purple-550" style={{ width: `${sg.current}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white">Predictive Forecasts & Risk Indicators</h3>
                  <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold">
                      <strong>🔮 Certification Forecast:</strong> {data.futureEnhancements.predictiveForecasts.certificationCompletionPrediction}
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
                      <strong>⚠️ Risk Warning:</strong> {data.futureEnhancements.predictiveForecasts.learningRiskIndicators}
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl text-xs font-semibold">
                      <strong>🚀 AI Readiness Forecast:</strong> {data.futureEnhancements.predictiveForecasts.aiReadinessForecast}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-xl ring-1 ring-white/[0.04] space-y-3">
                <h3 className="text-sm font-bold text-white">Suggested Skills Mitigation Courses</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {data.futureEnhancements.suggestedCourses.map((sc, idx) => (
                    <div key={idx} className="bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06] space-y-1">
                      <p className="font-bold text-slate-200">{sc.title}</p>
                      <p className="text-slate-400 font-semibold">{sc.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showBranding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-black text-white">LMS Dynamic Branding Control</h3>
              </div>
              <button onClick={() => setShowBranding(false)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-4 text-slate-300 text-xs">
              <div className="space-y-2">
                <label className="block font-bold uppercase text-[10px] text-slate-400">Primary Color Preset</label>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#831B84] border border-white/25" />
                  <span className="font-mono text-sm self-center text-white">#831B84 (Tranquil Velvet)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block font-bold uppercase text-[10px] text-slate-400">Secondary Color Preset</label>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#FF6200] border border-white/25" />
                  <span className="font-mono text-sm self-center text-white">#FF6200 (Bright Tr. Velvet)</span>
                </div>
              </div>

              <Button onClick={() => { setShowBranding(false); showToast('Theme branding synchronized globally.', 'success'); }} className="w-full mt-2 bg-gradient-to-r from-purple-650 to-[#FF6200] hover:opacity-90 border-0 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer">
                Synchronize Platform Branding
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showAIBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#01AC9F]" />
                <h3 className="text-lg font-black text-white">AI Syllabus blueprint Builder</h3>
              </div>
              <button onClick={() => { setShowAIBuilder(false); setAiTopic(''); setAiResult(''); }} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Create Module Outline from Prompt</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter course topic (e.g. AWS Solutions Architect, React 19)"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs outline-none text-white"
                  />
                  <Button 
                    onClick={handleGenerateSyllabus} 
                    disabled={aiLoading}
                    className="bg-[#01AC9F] hover:bg-[#009b8f] border-0 text-white cursor-pointer px-4 rounded-xl py-2"
                  >
                    {aiLoading ? 'Drafting...' : 'Build Draft'}
                  </Button>
                </div>
              </div>

              {aiResult && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left text-xs text-slate-350 leading-relaxed font-mono whitespace-pre-line max-h-56 overflow-y-auto">
                  {aiResult}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showZohoSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-black text-white">Zoho CRM Sync Pipeline</h3>
              </div>
              <button onClick={() => setShowZohoSync(false)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-4 text-slate-300 text-xs">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Zoho Connection Status</p>
                  <p className="text-sm font-black text-white mt-1">135 Employees Synced</p>
                </div>
                <span className="text-[11px] font-bold text-white bg-emerald-500 px-3 py-1 rounded-full uppercase">Connected</span>
              </div>

              <div className="divide-y divide-white/5 font-semibold">
                <div className="py-2.5 flex justify-between"><span>CRM Connector Health</span><span className="text-emerald-400 font-extrabold">100% Operational</span></div>
                <div className="py-2.5 flex justify-between"><span>Last Checked Pipeline</span><span className="text-white font-extrabold">2 hours ago</span></div>
                <div className="py-2.5 flex justify-between"><span>Pending Certifications</span><span className="text-white font-extrabold">0 approvals</span></div>
              </div>

              <Button 
                onClick={handleRunZohoSync} 
                disabled={syncing}
                className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90 border-0 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer text-white font-bold"
              >
                {syncing ? 'Syncing Pipeline...' : 'Run Manual CRM Pipeline Sync'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-black text-white">Administrator Audit Logs</h3>
              </div>
              <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-3.5 max-h-80 overflow-y-auto">
              {[
                { actor: 'Admin Vikram Malhotra', action: 'Created course Docker & Kubernetes Mastery', time: '1 hour ago' },
                { actor: 'Admin Priya Sharma', action: 'Modified category DevOps & Cloud Architecture', time: '2 hours ago' },
                { actor: 'Admin Akash Patel', action: 'Deleted draft course Legacy Java 6 Frameworks', time: '5 hours ago' },
              ].map((log, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-extrabold text-white">{log.actor}</h4>
                    <p className="text-slate-400 mt-1 font-medium leading-snug">{log.action}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-black text-white">Academic Parameters</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-4 text-slate-300 text-xs">
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="font-semibold">Maximum Active Cohorts</span>
                <span className="font-black text-white">25 Cohorts</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="font-semibold">Allow Student Registration</span>
                <span className="font-black text-emerald-400">Yes (Public)</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="font-semibold">Redis Cache TTL Configuration</span>
                <span className="font-black text-white">3600 seconds</span>
              </div>
              <Button onClick={() => { setShowSettings(false); showToast('Academic parameters synchronized.', 'success'); }} className="w-full mt-2 bg-gradient-to-r from-purple-650 to-indigo-700 hover:opacity-90 border-0 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer text-white font-bold">
                Apply System Configurations
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showImpact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-black text-white">Academy Certifications Status</h3>
              </div>
              <button onClick={() => setShowImpact(false)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold">×</button>
            </div>

            <div className="grid gap-4 grid-cols-2 text-center text-white">
              {[
                { value: '14', label: 'Active Business Groups', color: 'text-purple-400 bg-purple-950/20 border border-purple-900/20' },
                { value: '135 / 200', label: 'Registered Licenses', color: 'text-blue-400 bg-blue-950/20 border border-blue-900/20' },
                { value: '5', label: 'Platform Administrators', color: 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/20' },
                { value: '92%', label: 'Platform Satisfaction', color: 'text-orange-400 bg-orange-950/20 border border-orange-900/20' },
              ].map((metric) => (
                <div key={metric.label} className={`p-5 rounded-2xl ${metric.color.split(' ')[1]} ${metric.color.split(' ')[2]} flex flex-col justify-center items-center`}>
                  <p className={`text-2xl font-black ${metric.color.split(' ')[0]}`}>{metric.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 leading-snug">{metric.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
