import React from 'react';

export default function Roles() {
  return (
    <section id="roles" style={{ 
      padding: '80px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '40px',
      borderTop: '1px solid #E6E6E6'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'left', maxWidth: '800px' }}>
        <span className="badge badge-velvet" style={{ padding: '6px 16px', fontWeight: '800' }}>
          ACCESS MATTERS
        </span>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#000000', marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Role-based portals at scale.
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Different user personas interact with the LMS portal dynamically. Each role receives a custom tailored portal dashboard mapped at runtime.
        </p>
      </div>

      {/* Table container */}
      <div style={{ overflowX: 'auto', width: '100%', background: '#ffffff', borderRadius: '16px', border: '1px solid #E6E6E6', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E6E6E6', background: 'rgba(106,29,87,0.04)' }}>
              <th style={{ padding: '20px 24px', color: '#000000', fontWeight: '800', fontSize: '15px' }}>Role</th>
              <th style={{ padding: '20px 24px', color: '#000000', fontWeight: '800', fontSize: '15px' }}>Tailored Workspace View & Access</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E6E6E6', background: 'rgba(106, 29, 87, 0.01)' }}>
              <td style={{ padding: '20px 24px', fontWeight: '800', color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👑</span> Administrator
              </td>
              <td style={{ padding: '20px 24px', color: '#444444', lineHeight: '1.5' }}>Full platform governance, security control, microservice mapping, and global audit logging.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E6E6E6' }}>
              <td style={{ padding: '20px 24px', fontWeight: '800', color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏢</span> Manager
              </td>
              <td style={{ padding: '20px 24px', color: '#444444', lineHeight: '1.5' }}>Manage corporate organizations, departments, universities, assign local trainers, and track metrics.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E6E6E6', background: 'rgba(106, 29, 87, 0.01)' }}>
              <td style={{ padding: '20px 24px', fontWeight: '800', color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span> Trainer / Organiser
              </td>
              <td style={{ padding: '20px 24px', color: '#444444', lineHeight: '1.5' }}>Author courses, configure modules and submodules, upload files, manage cohorts, and review student grades.</td>
            </tr>
            <tr>
              <td style={{ padding: '20px 24px', fontWeight: '800', color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎓</span> Student
              </td>
              <td style={{ padding: '20px 24px', color: '#444444', lineHeight: '1.5' }}>Browse available courses, subscribe to pathways, watch dynamic lecture streams, submit files, and review evaluations.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </section>
  );
}
