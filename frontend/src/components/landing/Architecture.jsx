import React from 'react';
import { ExternalLink, BookOpen, Video } from 'lucide-react';

export default function Architecture() {
  const insights = [
    {
      type: 'White Paper',
      icon: <BookOpen size={14} />,
      title: 'Sovereign AI for Regulated Enterprises',
      desc: 'Move AI from pilots to production without losing control over proprietary data and compliance protocols.',
      image: 'https://xebia.com/media/2026/06/ai-ready-architecture-whitepaper-mockup-square.png',
      url: 'https://pages.xebia.com/artificial-intelligence/whitepaper-sovereign-ai-for-regulated-enterprises-xebia'
    },
    {
      type: 'Webinar',
      icon: <Video size={14} />,
      title: 'Transforming Banking with Cloud & Low-Code',
      desc: 'Discover Appian and AWS strategic patterns to accelerate customer onboarding and core banking modernization.',
      image: 'https://xebia.com/media/2025/03/Transforming_Banking_with_Cloud_Square_430.jpg',
      url: 'https://events.xebia.com/intelligent-automation/webinar-transforming-banking-appian-aws'
    },
    {
      type: 'White Paper',
      icon: <BookOpen size={14} />,
      title: 'How to Prioritize LLM Projects',
      desc: 'A practical framework to evaluate, score, and prioritize Large Language Model use cases in your business.',
      image: 'https://xebia.com/media/2025/07/White_Paper__How_To_Prioritize_Llm_Projects_Square_430.jpg',
      url: 'https://xebia.com/articles/the-journey-of-independent-vendors-to-ecosystem-leaders/'
    }
  ];

  return (
    <section style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Section Header */}
      <div>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#000000', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Insights & Resources.
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: '1.6' }}>
          Stay ahead with latest architectures, case studies, and engineering guidelines developed by our global consultants.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {insights.map(item => (
          <div
            key={item.title}
            style={{
              background: '#ffffff',
              border: '1px solid #E6E6E6',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#84117C';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(106, 29, 87, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#E6E6E6';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.01)';
            }}
          >
            {/* Header Image */}
            <div style={{ height: '200px', width: '100%', overflow: 'hidden', background: '#F9F8F8' }}>
              <img 
                src={item.image} 
                alt={item.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flex: '1' }}>
              
              {/* Type Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(106, 29, 87, 0.06)',
                color: '#6A1D57',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                width: 'fit-content'
              }}>
                {item.icon}
                <span>{item.type.toUpperCase()}</span>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: '4px 0 0 0', lineHeight: '1.3' }}>
                {item.title}
              </h3>
              
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {item.desc}
              </p>

              {/* Link */}
              <a 
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 'auto',
                  paddingTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#84117C',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '14px'
                }}
              >
                Access Resource <ExternalLink size={14} />
              </a>

            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
