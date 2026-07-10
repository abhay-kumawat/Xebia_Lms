import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Configure Access',
      desc: 'Administrators define roles, map permissions, and license modules dynamically at runtime.'
    },
    {
      step: '02',
      title: 'Onboard Entities',
      desc: 'Managers register departments, universities, corporate teams, and assign trainers.'
    },
    {
      step: '03',
      title: 'Deliver Content',
      desc: 'Trainers design custom modules, build batches, upload files, and publish cohorts.'
    },
    {
      step: '04',
      title: 'Track Performance',
      desc: 'Learners consume lectures, complete grading tests, and managers track telemetry metrics.'
    }
  ];

  return (
    <section id="how-it-works" style={{ 
      padding: '80px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '40px',
      borderTop: '1px solid #E6E6E6'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'left', maxWidth: '800px' }}>
        <span className="badge badge-velvet" style={{ padding: '6px 16px', fontWeight: '800' }}>
          THE PROCESS
        </span>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#000000', marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          A unified training lifecycle.
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          From setting up secure organization spaces to analyzing course completion rates, manage the entire learning journey in four simple stages.
        </p>
      </div>

      {/* Steps Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {steps.map(item => (
          <div 
            key={item.step}
            className="workflow-card"
            style={{ 
              background: '#ffffff',
              border: '1px solid #E6E6E6',
              borderRadius: '16px',
              padding: '30px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              transition: 'transform 0.2s, border-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#FF6200';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#E6E6E6';
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
              fontSize: '44px', 
              fontWeight: '900', 
              color: 'rgba(108, 29, 95, 0.1)', 
              position: 'absolute', 
              top: '15px', 
              right: '20px',
              fontFamily: 'var(--font-sans)'
            }}>
              {item.step}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#000000', marginTop: '20px', marginBlockEnd: '4px' }}>
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
