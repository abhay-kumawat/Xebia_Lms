'use client';

import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useCatalog } from '@/hooks/useCatalog';
import XebiaAssistant from '@/components/common/XebiaAssistant';

export default function AppLayout({ children }) {
  const { branding, hydrated } = useCatalog();

  useEffect(() => {
    if (hydrated) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#6C1D5F');
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#84117C');
    }
  }, [branding, hydrated]);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#09090E] text-brand-text-primary dark:text-slate-100 transition-all duration-300">
      <Sidebar />
      <div style={{ paddingLeft: 240 }}>
        <main className="min-h-screen">{children}</main>
      </div>
      <XebiaAssistant />
    </div>
  );
}
