import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero({ onSignInClick }) {
  const navigate = useNavigate();

  return (
    <section style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
      alignItems: 'center', 
      gap: '40px', 
      margin: '40px 0 60px 0',
      fontFamily: 'var(--font-sans)',
      padding: '0 20px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* Left Column: Copywriting & Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
        {/* Small Badge */}
        <span className="badge badge-velvet" style={{ padding: '6px 16px', fontWeight: '800' }}>
          XEBIA KNOWLEDGE PORTAL
        </span>

        {/* Corporate Heading */}
        <h1 style={{ 
          fontSize: '56px', 
          fontWeight: '800', 
          lineHeight: '1.1', 
          color: '#181818',
          letterSpacing: '-0.03em',
          margin: 0
        }}>
          Authority in<br />
          digital learning.
        </h1>

        {/* Signature Xebia Multicolored Gradient Spectrum Bar */}
        <div style={{
          height: '6px',
          width: '320px',
          backgroundImage: 'linear-gradient(90deg, #008BF7, #5C31CE 25%, #D9029C 50%, #F40642 75%, #F79D00)',
          borderRadius: '3px',
          margin: '4px 0'
        }} />

        {/* Subheading description */}
        <p style={{ 
          fontSize: '17px', 
          color: '#555555', 
          lineHeight: '1.6', 
          margin: 0
        }}>
          We help companies, universities, and institutions become digital learning leaders. From strategy to execution, we cover all fields of digital technology and technical education.
        </p>

        {/* Call to Actions */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button 
            onClick={onSignInClick}
            style={{ 
              background: '#84117C', 
              color: 'white', 
              border: 'none', 
              padding: '14px 32px', 
              borderRadius: '30px', 
              fontSize: '16px', 
              fontWeight: '700', 
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(132, 17, 124, 0.25)',
              transition: 'background 0.2s, transform 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#6C1D5F'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#84117C'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Enter LMS Portal
          </button>
        </div>
      </div>

      {/* Right Column: Branded Illustration Image */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <img 
          src="/hero-illustration.png" 
          alt="Xebia LMS Portal" 
          style={{ 
            width: '100%', 
            maxWidth: '460px', 
            height: 'auto', 
            display: 'block'
          }} 
        />
      </div>

    </section>
  );
}
