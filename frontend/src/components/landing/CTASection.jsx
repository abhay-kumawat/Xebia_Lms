import React from 'react';

export default function CTASection({ onSignInClick }) {
  return (
    <section id="cta" style={{
      background: 'linear-gradient(135deg, rgba(108, 29, 95, 0.03) 0%, rgba(132, 17, 124, 0.06) 100%)',
      border: '1px solid rgba(108, 29, 95, 0.1)',
      borderRadius: '24px',
      padding: '60px 40px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      margin: '40px 0 80px 0'
    }}>
      <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#000000', margin: 0, letterSpacing: '-0.02em' }}>
        Ready to unify your training delivery?
      </h2>
      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6', margin: 0 }}>
        Join institutions and departments moving from fragmented learning ecosystems to one secure, scalable platform.
      </p>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <button 
          onClick={onSignInClick} 
          style={{ 
            background: '#84117C', 
            color: 'white', 
            border: 'none',
            padding: '14px 32px', 
            fontSize: '15px',
            fontWeight: '700',
            borderRadius: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(132, 17, 124, 0.25)',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#6C1D5F'}
          onMouseOut={(e) => e.currentTarget.style.background = '#84117C'}
        >
          Get Started Now
        </button>
        <button 
          onClick={onSignInClick} 
          style={{ 
            background: '#ffffff', 
            color: '#6C1D5F', 
            border: '2px solid #84117C',
            padding: '12px 32px', 
            fontSize: '15px',
            fontWeight: '700',
            borderRadius: '24px',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#84117C'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#6C1D5F'; }}
        >
          Talk to Our Team
        </button>
      </div>
    </section>
  );
}
