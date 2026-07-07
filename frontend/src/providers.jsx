'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CatalogProvider } from '@/hooks/useCatalog';
import { ToastProvider } from '@/hooks/useToast';
import { AuthProvider } from '@/hooks/useAuth';
import { StudentAuthProvider } from '@/hooks/useStudentAuth';
import { TeacherAuthProvider } from '@/hooks/useTeacherAuth';
import { ThemeProvider } from '@/context/ThemeContext';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <StudentAuthProvider>
              <TeacherAuthProvider>
                <CatalogProvider>{children}</CatalogProvider>
              </TeacherAuthProvider>
            </StudentAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
