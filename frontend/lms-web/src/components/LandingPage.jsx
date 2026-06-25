import React, { useState } from 'react';
import { 
  GraduationCap, Shield, BookOpen, Layers, Award, 
  ArrowRight, Key, AlertCircle, HelpCircle, Lock,
  Server, Video, CheckCircle, Mail, Database, Activity, FileText
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess, triggerLog }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');

  // Pre-configured login personas mirroring typical enterprise users
  const googleAccounts = [
    { name: 'Abhay Kumawat', email: 'abhay@xebia.com', role: 'student', avatar: 'AK', desc: 'Preconfigured Student Profile' },
    { name: 'John Doe', email: 'john.doe@xebia.com', role: 'trainer', avatar: 'JD', desc: 'Preconfigured Trainer Profile' },
    { name: 'Sarah Connor', email: 'sarah.c@xebia.com', role: 'manager', avatar: 'SC', desc: 'Preconfigured Manager Profile' },
    { name: 'System Admin', email: 'admin@xebia.com', role: 'admin', avatar: 'SA', desc: 'Preconfigured Administrator Profile' }
  ];

  const handleSelectQuickAccount = (account) => {
    setEmail(account.email);
    setName(account.name);
    setRole(account.role);
    setAuthStep(2);
    triggerLog('gateway', `GET /api/v1/iam/users/check?email=${account.email} - Checking provider identity registry`, 200);
    setTimeout(() => {
      triggerLog('iam', `IAM DB check complete. Identity found. Redirecting to password challenge screen.`, 200);
    }, 400);
  };

  const handleEmailNext = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const match = googleAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setName(match.name);
      setRole(match.role);
    } else {
      const prefix = email.split('@')[0];
      setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
      setRole('student');
    }

    setAuthStep(2);
    triggerLog('gateway', `GET /api/v1/iam/users/check?email=${email} - Mapped identity validation filter`, 200);
    setTimeout(() => {
      triggerLog('iam', `Account validation complete. Handshaking Google credentials...`, 200);
    }, 400);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    triggerLog('gateway', `POST /api/v1/iam/auth/google-callback - Transmitting payload headers`, 200);
    triggerLog('iam', `POST /api/v1/iam/auth/google-signin - Validating authentication credentials`, 200);
    
    setTimeout(() => {
      triggerLog('iam', `JWT verified. Sub: ${email} | Roles: [ROLE_${role.toUpperCase()}]`, 200);
      onLoginSuccess({
        name: name,
        email: email,
        role: role
      });
      setShowAuthModal(false);
      setAuthStep(1);
      setEmail('');
      setPassword('');
      setName('');
      setRole('student');
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, var(--xebia-grey-light) 0%, var(--xebia-black) 100%)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--xebia-velvet)',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px var(--xebia-velvet-glow)'
          }}>
            <GraduationCap size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.1 }}>
              enterprise <span className="gradient-text-velvet">lms</span>
            </h2>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              MANAGEMENT PORTAL
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: '500' }}>
          <a href="#overview" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Overview</a>
          <a href="#problem" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Problem</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Workflow</a>
          <a href="#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Architecture</a>
          <a href="#roles" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-smooth)' }}>Roles</a>
        </nav>

        <button onClick={() => setShowAuthModal(true)} className="btn btn-primary">
          <Key size={14} /> Sign In
        </button>
      </header>

      {/* Main Content Sections */}
      <main id="overview" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '80px 20px', gap: '80px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '30px', maxWidth: '900px', margin: '0 auto' }} className="floating-widget">
          <span className="badge badge-velvet" style={{ padding: '6px 16px' }}>
            Next-Gen Learning Platform
          </span>
          <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.2' }} className="gradient-text">
            One Platform. Every Institution. Complete Control.
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '800px' }}>
            A multi-tenant learning management system built for universities, colleges, and organisations — with dynamic access control that adapts at runtime, not redeploy time.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setShowAuthModal(true)} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Request a Demo
            </button>
            <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px', textDecoration: 'none' }}>
              Explore Features
            </a>
          </div>
        </section>

        {/* Trust Strip */}
        <div className="floating-delay-1" style={{
          width: '100%',
          padding: '18px 24px',
          background: 'rgba(131, 27, 132, 0.06)',
          borderTop: '1px solid var(--xebia-border)',
          borderBottom: '1px solid var(--xebia-border)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          fontWeight: '600',
          letterSpacing: '0.05em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          textAlign: 'center'
        }}>
          <span>Built for Universities</span>
          <span style={{ color: 'var(--xebia-border)' }}>·</span>
          <span>Corporate Training</span>
          <span style={{ color: 'var(--xebia-border)' }}>·</span>
          <span>Institutions of Every Scale</span>
        </div>

        {/* Problem Statement Section */}
        <section id="problem" className="floating-delay-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-velvet" style={{ background: 'rgba(255, 87, 87, 0.1)', color: 'var(--accent-coral)', borderColor: 'rgba(255, 87, 87, 0.2)' }}>
            The Fragmented Challenge
          </span>
          <h2 style={{ fontSize: '32px' }} className="gradient-text">
            Training shouldn't feel this fragmented.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            Most institutions juggle disconnected tools — one for content, another for communication, a third for access control. The result? Inconsistent permissions, scattered content, and ad-hoc communication that slows everyone down.
          </p>
          <div style={{
            background: 'rgba(131, 27, 132, 0.1)',
            border: '1px solid var(--xebia-border)',
            borderRadius: '12px',
            padding: '16px 24px',
            fontWeight: '600',
            fontSize: '18px',
            marginTop: '10px',
            color: '#f5f3f7'
          }}>
            Enterprise LMS brings it all together — securely, on one platform.
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-velvet">Capabilities</span>
            <h2 style={{ fontSize: '36px', marginTop: '10px' }} className="gradient-text">Platform Core Modules</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🔐</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>Dynamic Role-Based Access</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Roles, permissions, and module visibility are fully configurable — at runtime, without code changes. Need a new "Counsellor" role tomorrow? Create it in seconds, no redeployment required.
              </p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🏛️</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>True Multi-Tenancy</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Each university, college, or organisation operates in its own isolated space — same platform, zero data crossover.
              </p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>📚</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>Flexible Course Authoring</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Build courses with modules, submodules, notes, PDFs, PPTs, comparison tables, and video — with simple drag-and-drop ordering.
              </p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🎥</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>Secure Video Delivery</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Adaptive, chunked streaming (HLS) with short-lived signed URLs. No downloads. No leaks. Just secure learning.
              </p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>📝</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>Complete Assessment Engine</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Theoretical, practical, and theory-based assessments — created, submitted, evaluated, and scored online.
              </p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>Built-in Governance</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Sensitive actions like deletions go through a configurable approval workflow — nothing destructive happens without the right sign-off.
              </p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>📩</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>Multi-Channel Notifications</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Email, WhatsApp, and SMS — with automated document generation (PDF/XLSX/DOCX) via JasperReports, delivered reliably with retries and tracking.
              </p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>📊</span>
                <h3 style={{ fontSize: '18px', color: 'white' }}>Full Audit & Reporting</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Every sensitive action — access changes, approvals, provisioning — is logged for complete accountability.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-velvet">Lifecycle Flow</span>
            <h2 style={{ fontSize: '32px', marginTop: '10px' }} className="gradient-text">How It Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: 'rgba(131,27,132,0.3)', position: 'absolute', top: '10px', right: '15px' }}>01</div>
              <h3 style={{ fontSize: '16px', color: 'white', marginTop: '20px' }}>Configure access</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Admins configure roles, permissions, and modules at runtime.</p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: 'rgba(131,27,132,0.3)', position: 'absolute', top: '10px', right: '15px' }}>02</div>
              <h3 style={{ fontSize: '16px', color: 'white', marginTop: '20px' }}>Onboard entities</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Managers onboard specific partner universities and local trainers.</p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: 'rgba(131,27,132,0.3)', position: 'absolute', top: '10px', right: '15px' }}>03</div>
              <h3 style={{ fontSize: '16px', color: 'white', marginTop: '20px' }}>Build courses</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Trainers author custom modules, batches, cohorts, and grading tests.</p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: 'rgba(131,27,132,0.3)', position: 'absolute', top: '10px', right: '15px' }}>04</div>
              <h3 style={{ fontSize: '16px', color: 'white', marginTop: '20px' }}>Learn & evaluate</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Students stream HLS lectures, submit files, and review notification grades.</p>
            </div>
          </div>
        </section>

        {/* Architecture Highlight Section */}
        <section id="architecture" className="floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-velvet">Technology Stack</span>
            <h2 style={{ fontSize: '32px', marginTop: '10px' }} className="gradient-text">Engineered for Scale. Built to Last.</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
                Powered by an independent microservice architecture — Spring Boot backend, Next.js frontend, and Apache Kafka event bus. Each service scales independently, ensuring 99.5%+ availability and resilience even under heavy load.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge-velvet" style={{ textTransform: 'none' }}>Spring Boot 3.3</span>
                <span className="badge badge-velvet" style={{ textTransform: 'none' }}>Next.js 14</span>
                <span className="badge badge-velvet" style={{ textTransform: 'none' }}>Apache Kafka</span>
                <span className="badge badge-velvet" style={{ textTransform: 'none' }}>PostgreSQL</span>
              </div>
            </div>

            {/* Architecture Node Diagram representation */}
            <div style={{
              background: 'rgba(18, 6, 30, 0.4)',
              border: '1px solid var(--xebia-border)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>System Microservices</span>
                <span style={{ fontSize: '10px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }}></span> Active Cluster
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px' }}>
                <div style={{ border: '1px solid rgba(0, 245, 255, 0.2)', padding: '10px', borderRadius: '8px', background: 'rgba(0,245,255,0.03)' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>lms-gateway</div>
                  <div style={{ color: 'var(--text-muted)' }}>Spring Cloud Routing</div>
                </div>
                <div style={{ border: '1px solid rgba(131, 27, 132, 0.2)', padding: '10px', borderRadius: '8px', background: 'rgba(131,27,132,0.03)' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--xebia-velvet-light)' }}>lms-iam-service</div>
                  <div style={{ color: 'var(--text-muted)' }}>Identity & Tokens DB</div>
                </div>
                <div style={{ border: '1px solid rgba(57, 255, 20, 0.2)', padding: '10px', borderRadius: '8px', background: 'rgba(57,255,20,0.03)' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>lms-discovery-server</div>
                  <div style={{ color: 'var(--text-muted)' }}>Eureka Registry</div>
                </div>
                <div style={{ border: '1px solid rgba(255, 170, 0, 0.2)', padding: '10px', borderRadius: '8px', background: 'rgba(255,170,0,0.03)' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>lms-config-server</div>
                  <div style={{ color: 'var(--text-muted)' }}>Git Decrypted Repo</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Compliance Section */}
        <section className="floating-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <span className="badge badge-velvet" style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(0, 245, 255, 0.2)' }}>
              Compliance Standards
            </span>
            <h2 style={{ fontSize: '32px', marginTop: '10px', marginBottom: '16px' }} className="gradient-text">
              Security isn't an afterthought. It's the foundation.
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Our platform operates on a Zero-Trust security approach, ensuring institutional intellectual property and student privacy remains protected.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Shield size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Dynamic RBAC enforced at every request</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Shield size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>TLS encryption across all transport layers</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Shield size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Short-lived signed URLs for media & documents</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Shield size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Full multi-tenant data isolation</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Shield size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Complete audit trail for sensitive actions</span>
            </div>
          </div>
        </section>

        {/* Roles Section (Who's it for?) */}
        <section id="roles" className="floating-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-velvet">Target Audiences</span>
            <h2 style={{ fontSize: '32px', marginTop: '10px' }} className="gradient-text">System Roles & Access</h2>
          </div>

          <div style={{ overflowX: 'auto', width: '100%', background: 'rgba(18, 6, 30, 0.3)', borderRadius: '12px', border: '1px solid var(--xebia-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--xebia-border)', background: 'rgba(131,27,132,0.1)' }}>
                  <th style={{ padding: '16px', color: 'white', fontWeight: '700' }}>Role</th>
                  <th style={{ padding: '16px', color: 'white', fontWeight: '700' }}>What They Get</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--xebia-border)', background: 'rgba(131, 27, 132, 0.02)' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👑</span> Admin
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>Full platform control & governance</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--xebia-border)' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏢</span> Manager
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>Manage assigned universities & trainers</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--xebia-border)', background: 'rgba(131, 27, 132, 0.02)' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span> Trainer / Organiser
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>Author content, run batches, assess students</td>
                </tr>
                <tr>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🎓</span> Student
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>Learn, get assessed, engage, get notified</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Final CTA Section */}
        <section style={{
          background: 'radial-gradient(circle at center, rgba(131, 27, 132, 0.2) 0%, rgba(21, 0, 39, 0.6) 100%)',
          border: '1px solid var(--xebia-border)',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }} className="floating-widget">
          <h2 style={{ fontSize: '36px', fontWeight: '800' }} className="gradient-text">
            Ready to unify your training delivery?
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6' }}>
            Join institutions moving from fragmented tools to one secure, scalable platform.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setShowAuthModal(true)} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Get Started
            </button>
            <button onClick={() => setShowAuthModal(true)} className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Talk to Our Team
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--xebia-border)', padding: '30px 80px', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', color: 'var(--text-muted)', backdropFilter: 'blur(5px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>Enterprise LMS — Confidential Platform · © 2026</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#policy" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
            <a href="#contact" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</a>
            <a href="#docs" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Documentation</a>
          </div>
        </div>
      </footer>

      {/* Google Authentication Dialog Popup */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(5, 0, 11, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          backdropFilter: 'blur(8px)'
        }}>
          
          <div style={{
            background: '#ffffff',
            color: '#202124',
            width: '440px',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            position: 'relative'
          }}>
            
            {/* Google Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            </div>

            {/* Google OAuth Step 1: Email Challenge */}
            {authStep === 1 ? (
              <form onSubmit={handleEmailNext} style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '400', color: '#202124', margin: '0 0 8px 0' }}>
                  Sign in
                </h3>
                <p style={{ fontSize: '15px', color: '#202124', margin: '0 0 28px 0' }}>
                  to continue to <span style={{ fontWeight: '600' }}>xebia-lms-gateway</span>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '8px' }}>
                  <input 
                    type="email" 
                    placeholder="Email or phone" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 14px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      fontSize: '16px',
                      color: '#202124',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#1a73e8'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#dadce0'}
                    required
                  />
                  <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ fontSize: '14px', color: '#1a73e8', fontWeight: '500', textDecoration: 'none', marginTop: '4px' }}>
                    Forgot email?
                  </a>
                </div>

                <div style={{ fontSize: '13px', color: '#5f6368', textAlign: 'left', lineHeight: '1.4', margin: '24px 0 32px 0' }}>
                  Not your computer? Use Guest mode to sign in privately.<br />
                  <a href="#learn" onClick={(e) => e.preventDefault()} style={{ color: '#1a73e8', textDecoration: 'none', fontWeight: '500' }}>Learn more</a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#1a73e8', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
                    Create account
                  </span>
                  
                  <button 
                    type="submit"
                    style={{
                      background: '#1a73e8',
                      color: 'white',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1557b0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a73e8'}
                  >
                    Next
                  </button>
                </div>

                {/* Preconfigured account pre-fill options */}
                <div style={{ borderTop: '1px solid #dadce0', margin: '24px 0 12px 0', paddingTop: '16px', textAlign: 'left' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', display: 'block', marginBottom: '10px' }}>
                    Or select an enterprise account to pre-fill:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {googleAccounts.map(account => (
                      <div 
                        key={account.email}
                        onClick={() => handleSelectQuickAccount(account)}
                        style={{
                          padding: '10px',
                          border: '1px solid #dadce0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#3c4043' }}>{account.name}</div>
                        <div style={{ fontSize: '10px', color: '#5f6368' }}>{account.email}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            ) : (
              /* Google OAuth Step 2: Password challenge & user details profiling */
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Back link and email indicator */}
                <div 
                  onClick={() => setAuthStep(1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: '1px solid #dadce0',
                    cursor: 'pointer',
                    alignSelf: 'center',
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: '#3c4043'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--xebia-velvet)' }}></span>
                  <span>{email}</span>
                  <span style={{ fontSize: '10px', color: '#5f6368' }}>✎ Edit</span>
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: '400', color: '#202124', textAlign: 'center', margin: '0 0 8px 0' }}>
                  Welcome
                </h3>
                <p style={{ fontSize: '15px', color: '#202124', textAlign: 'center', margin: '0 0 28px 0' }}>
                  {name || 'Enterprise Learner'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input 
                      type="password" 
                      placeholder="Enter your password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16px 14px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        fontSize: '16px',
                        color: '#202124',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#1a73e8'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#dadce0'}
                      required
                    />
                  </div>

                  {/* Render additional fields if entering a custom email account */}
                  {!googleAccounts.some(acc => acc.email.toLowerCase() === email.toLowerCase()) && (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368' }}>Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Jane Smith" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            fontSize: '14px',
                            color: '#202124',
                            outline: 'none'
                          }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368' }}>Map Security Role</label>
                        <select 
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            fontSize: '14px',
                            color: '#3c4043',
                            outline: 'none',
                            background: '#white'
                          }}
                        >
                          <option value="student">Student Dashboard</option>
                          <option value="trainer">Trainer Workspace</option>
                          <option value="manager">Manager Dashboard</option>
                          <option value="organiser">Organiser Control</option>
                          <option value="admin">System Admin Console</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#1a73e8', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
                    Forgot password?
                  </span>
                  
                  <button 
                    type="submit"
                    style={{
                      background: '#1a73e8',
                      color: 'white',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1557b0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a73e8'}
                  >
                    Next
                  </button>
                </div>

              </form>
            )}

            <button 
              onClick={() => {
                setShowAuthModal(false);
                setAuthStep(1);
                setEmail('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1a73e8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '16px',
                alignSelf: 'flex-start',
                padding: '0'
              }}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
