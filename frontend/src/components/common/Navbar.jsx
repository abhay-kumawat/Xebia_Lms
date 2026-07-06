import React from 'react';
import { Key } from 'lucide-react';
import Logo from './Logo';
import Button from './Button';

export default function Navbar({ onSignInClick }) {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '20px 80px',
      borderBottom: '1px solid var(--xebia-border)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }}>
      <Logo />

      <nav style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: '500' }}>
        <a href="/#overview" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Overview</a>
        <a href="/#problem" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Problem</a>
        <a href="/#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Features</a>
        <a href="/#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Workflow</a>
        <a href="/#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Architecture</a>
        <a href="/#roles" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Roles</a>
      </nav>

      <Button onClick={onSignInClick} variant="primary">
        <Key size={14} /> Sign In
      </Button>
    </header>
  );
}
