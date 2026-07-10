import React from 'react';
import { Target, AlertCircle, RefreshCw } from 'lucide-react';

export default function Problem() {
  const challenges = [
    {
      title: 'Disconnected Ecosystems',
      icon: <AlertCircle size={22} color="#E31818" />,
      desc: 'Most enterprise learning is scattered across various systems, making it impossible to track progress or deliver unified curricula.'
    },
    {
      title: 'Rigid Learning Paths',
      icon: <Target size={22} color="#E31818" />,
      desc: 'Standard LMS tools offer static courses with no adaptability for different roles, skill levels, or organizational structures.'
    },
    {
      title: 'No Real-time Feedback',
      icon: <RefreshCw size={22} color="#E31818" />,
      desc: 'Managers lack visibility into team progress, and training is delivered without live data telemetry or skill verification.'
    }
  ];

  return (
    <section id="problem" style={{ 
      padding: '80px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '40px',
      borderTop: '1px solid #E6E6E6'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'left', maxWidth: '800px' }}>
        <span className="badge badge-velvet" style={{ background: 'rgba(227, 24, 24, 0.08)', color: '#E31818', border: '1px solid rgba(227, 24, 24, 0.15)', padding: '6px 16px', fontWeight: '800' }}>
          THE CHALLENGE
        </span>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#000000', marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Why traditional learning management systems fail.
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Scaling technology training across thousands of employees requires a dynamic, role-adaptive platform, not a static library of unguided videos.
        </p>
      </div>

      {/* Grid of challenges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {challenges.map(item => (
          <div
            key={item.title}
            className="problem-card"
            style={{
              background: '#ffffff',
              border: '1px solid #E6E6E6',
              borderRadius: '12px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
            }}
          >
            {/* Slide-up Hover Overlay */}
            <div 
              className="hover-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#831B84',
                padding: '30px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0,
                transform: 'translateY(100%)',
                pointerEvents: 'none',
                zIndex: 5
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.5', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
              
              <a 
                href="/#features"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  color: '#831B84',
                  padding: '10px 20px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  width: 'fit-content',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
              >
                <span style={{ marginRight: '8px' }}>View Course</span>
                <span style={{ fontSize: '14px' }}>➔</span>
              </a>
            </div>

            {/* Normal State Card Content */}
            <div style={{
              background: 'rgba(227, 24, 24, 0.06)',
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.icon}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#000000', margin: 0 }}>
              {item.title}
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
