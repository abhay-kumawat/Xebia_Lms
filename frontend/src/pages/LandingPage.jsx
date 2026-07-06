import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Hero from '../components/landing/Hero';
import Problem from '../components/landing/Problem';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Architecture from '../components/landing/Architecture';
import Security from '../components/landing/Security';
import Roles from '../components/landing/Roles';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, var(--xebia-grey-light) 0%, var(--xebia-black) 100%)', display: 'flex', flexDirection: 'column' }}>
      <Navbar onSignInClick={() => navigate('/portal-selector')} />

      <main id="overview" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '80px 20px', gap: '80px', maxWidth: '1200px', margin: '0 auto' }}>
        <Hero onSignInClick={() => navigate('/portal-selector')} />
        <Problem />
        <Features />
        <HowItWorks />
        <Architecture />
        <Security />
        <Roles />
        <CTASection onSignInClick={() => navigate('/portal-selector')} />
      </main>

      <Footer />
    </div>
  );
}
