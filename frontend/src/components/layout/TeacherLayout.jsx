import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import { useCatalog } from '@/hooks/useCatalog';
import XebiaAssistant from '@/components/common/XebiaAssistant';

export default function TeacherLayout({ children }) {
  const { branding, hydrated } = useCatalog();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    document.title = 'Xebia Academy | Teacher Portal';
    if (hydrated && branding) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#6C1D5F');
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#84117C');
    }
  }, [branding, hydrated]);

  let title = 'Teacher Portal';
  let subtitle = 'Curriculum management and student grading workspace';

  if (path.includes('/teacher/dashboard')) {
    title = 'Teacher Dashboard';
    subtitle = 'Welcome back! Review recent activities, overall scores, and pending submissions.';
  } else if (path.includes('/teacher/students')) {
    title = 'Student Tracker';
    subtitle = 'Track registered student profiles, learning hours, quiz scores, and progression.';
  } else if (path.includes('/teacher/assessments')) {
    title = 'Assessments Management';
    subtitle = 'Manage homework assignments, publish quizzes, and view student test grades.';
  } else if (path.includes('/teacher/courses')) {
    title = 'Courses Management';
    subtitle = 'View course catalogs, curriculum builder structures, and student enrollments.';
  }

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#0B1120] text-brand-text-primary dark:text-[#F8FAFC] transition-colors duration-300">
      <TeacherSidebar />
      <div style={{ paddingLeft: 240 }}>
        <TeacherHeader title={title} subtitle={subtitle} />
        <main className="min-h-screen">{children}</main>
      </div>
      <XebiaAssistant />
    </div>
  );
}
