import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Logo({ size = 22, glow = true }) {
  return (
    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'var(--xebia-velvet)',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: glow ? '0 0 10px var(--xebia-velvet-glow)' : 'none'
      }}>
        <GraduationCap size={size} color="white" />
      </div>
      <div>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '800', 
          lineHeight: 1.1,
          color: 'var(--brand-primary)'
        }}>
          xebia <span style={{ color: 'var(--brand-secondary)' }}>academy</span>
        </h2>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          LMS PORTAL
        </span>
      </div>
    </a>
  );
}
