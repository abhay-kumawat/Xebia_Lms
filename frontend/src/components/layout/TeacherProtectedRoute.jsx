import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';

export default function TeacherProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useTeacherAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Verifying teacher session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'teacher') {
    // Redirect to the teacher login page
    return <Navigate to="/teacher/login" state={{ from: location }} replace />;
  }

  return children;
}
