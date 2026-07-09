import React from 'react';
import { Shield, Check } from 'lucide-react';

export default function Security() {
  const securityFeatures = [
    'Dynamic RBAC enforced at every API gateway request',
    'TLS encryption across all microservice transport layers',
    'Short-lived signed URLs for course media & training materials',
    'Full multi-tenant database schema isolation',
    'Complete audit logging trail for sensitive management actions'
  ];

  return (
    <section id="security" style={{ 
      padding: '80px 20px', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '40px', 
      alignItems: 'center',
      borderTop: '1px solid #E6E6E6'
    }}>
      
      {/* Left side info */}
      <div>
        <span className="badge badge-velvet" style={{ padding: '6px 16px', fontWeight: '800' }}>
          ZERO-TRUST ARCHITECTURE
        </span>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#000000', marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
          Security isn't an afterthought. It's the foundation.
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Our platform operates on a rigid Zero-Trust security approach, ensuring that institutional intellectual property and student privacy remains protected.
        </p>
      </div>

      {/* Right side checklist */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #E6E6E6', 
        borderRadius: '16px', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
      }}>
        {securityFeatures.map((feature, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(108, 29, 95, 0.08)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Check size={16} color="#6C1D5F" strokeWidth={3} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#000000' }}>
              {feature}
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}
