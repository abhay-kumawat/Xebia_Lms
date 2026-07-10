import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import { useCatalog } from '@/hooks/useCatalog';

export default function StudentLayout({ children }) {
  const { branding, hydrated } = useCatalog();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    document.title = 'Xebia Academy | Student Portal';
    if (hydrated && branding) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#831B84');
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#FF6200');
    }
  }, [branding, hydrated]);

  let title = 'Xebia Academy';
  let subtitle = 'Accelerating your developer skill transition journey.';

  if (path.includes('/student/dashboard')) {
    title = 'Student Dashboard';
    subtitle = 'Welcome back! Monitor your streaks, grades, assignments, and learning progression.';
  } else if (path.includes('/student/courses')) {
    title = 'My Learning Paths';
    subtitle = 'Browse registered paths, resume lecture tracks, and access files.';
  } else if (path.includes('/student/learning-content')) {
    title = 'Learning Content';
    subtitle = 'Access study materials, videos, PDFs, and lectures for your enrolled courses.';
  } else if (path.includes('/student/assignments')) {
    title = 'Assignments Hub';
    subtitle = 'View assigned milestones, read instructor instructions, and submit work.';
  } else if (path.includes('/student/assessments')) {
    title = 'Assessments Arena';
    subtitle = 'Take course quizzes, check knowledge benchmarks, and view scores.';
  } else if (path.includes('/student/notifications')) {
    title = 'Notifications';
    subtitle = 'Stay updated with notifications regarding course updates, assignments, and grades.';
  } else if (path.includes('/student/profile')) {
    title = 'My Profile';
    subtitle = 'Manage your personal details, academic focus, and profile biography.';
  } else if (path.includes('/student/settings')) {
    title = 'Settings';
    subtitle = 'Configure account settings, security options, and notification preferences.';
  } else if (path.includes('/student/discussion')) {
    title = 'Cohorts Discussion';
    subtitle = 'Collaborate and ask questions with instructors and peer students.';
  } else if (path.includes('/student/leaderboard')) {
    title = 'Leaderboard & Champions';
    subtitle = 'See where you stand among your peers and check your ranking metrics.';
  }

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#0B1120] text-brand-text-primary dark:text-[#F8FAFC] transition-colors duration-300">
      <StudentSidebar />
      <div style={{ paddingLeft: 240 }}>
        <StudentHeader title={title} subtitle={subtitle} />
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
