import React from 'react';
import { Cloud, Database, Cpu, Layers, GitBranch, Terminal } from 'lucide-react';

export default function Features() {
  const capabilities = [
    {
      title: 'Cloud',
      icon: <Cloud size={24} color="#FF6200" />,
      desc: 'Strategy, architecture migration, and cloud-native software engineering. Certified training across AWS, Microsoft Azure, and Google Cloud.'
    },
    {
      title: 'Data & AI',
      icon: <Database size={24} color="#FF6200" />,
      desc: 'Build scalable data pipelines, design advanced machine learning models, and implement production-ready Generative AI solutions safely.'
    },
    {
      title: 'DevOps',
      icon: <GitBranch size={24} color="#FF6200" />,
      desc: 'Establish high-performance developer platforms. Standardize continuous delivery pipelines, Kubernetes scaling, and SRE operations.'
    },
    {
      title: 'Intelligent Automation',
      icon: <Cpu size={24} color="#FF6200" />,
      desc: 'Deploy low-code solutions like Appian and Mendix to automate mission-critical banking operations, customer portals, and workflows.'
    },
    {
      title: 'Agile & Leadership',
      icon: <Layers size={24} color="#FF6200" />,
      desc: 'Transform product management, train Scrum Masters, Agile coaches, and align business strategy with technical delivery.'
    },
    {
      title: 'Software Development',
      icon: <Terminal size={24} color="#FF6200" />,
      desc: 'Develop secure, microservices-based backend architectures, cloud-ready applications, and modern frontend user experiences.'
    }
  ];

  return (
    <section id="features" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Section Header */}
      <div>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#000000', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Our fields of expertise.
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: '1.6' }}>
          Explore our primary disciplines. We train teams and individuals across the entire digital technology spectrum.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {capabilities.map(cap => (
          <div
            key={cap.title}
            className="feature-card"
            style={{
              background: '#ffffff',
              border: '1px solid #E6E6E6',
              borderRadius: '12px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#FF6200';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(108, 29, 95, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#E6E6E6';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.01)';
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
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
                  {cap.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.5', margin: 0 }}>
                  {cap.desc}
                </p>
              </div>
              
              <a 
                href="/#cta"
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
              background: 'rgba(108, 29, 95, 0.06)',
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cap.icon}
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: 0 }}>
              {cap.title}
            </h3>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {cap.desc}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
