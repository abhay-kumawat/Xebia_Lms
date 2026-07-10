'use client';

import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailAddress) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setFirstName('');
        setLastName('');
        setEmailAddress('');
      }, 3000);
    }
  };

  return (
    <footer style={{ 
      background: '#ffffff', 
      borderTop: '1px solid #E0DFDF', 
      padding: '80px 80px 40px 80px',
      color: '#202124',
      fontSize: '14px',
      width: '100%',
      fontFamily: 'var(--font-sans)',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: '1.5fr 1fr 1.2fr 1.3fr', 
        gap: '40px',
        marginBottom: '60px'
      }}>
        
        {/* Column 1: Brand Info & Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={24} color="#831B84" />
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#831B84' }}>Xebia Academy</span>
          </div>
          
          <p style={{ color: '#444444', lineHeight: '1.6' }}>
            Xebia Academy is part of Xebia, a leading consultancy boutique with over 5,500 consultants and trainers across the globe.
          </p>
          
          <p style={{ color: '#000000', fontWeight: '700', lineHeight: '1.4' }}>
            Would you like to stay updated? Leave your personal details below to subscribe to our newsletter.
          </p>

          {/* Newsletter form */}
          {isSubscribed ? (
            <div style={{ background: '#F5E6F3', border: '1px solid #FF6200', padding: '16px', borderRadius: '8px', color: '#831B84', fontWeight: '600' }}>
              ✓ Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#000000' }}>First Name*</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 0', border: 'none', borderBottom: '1px solid #CCCCCC', outline: 'none', fontSize: '14px', background: 'transparent' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#000000' }}>Last name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ width: '100%', padding: '10px 0', border: 'none', borderBottom: '1px solid #CCCCCC', outline: 'none', fontSize: '14px', background: 'transparent' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#000000' }}>Email Address*</label>
                <input 
                  type="email" 
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 0', border: 'none', borderBottom: '1px solid #CCCCCC', outline: 'none', fontSize: '14px', background: 'transparent' }} 
                />
              </div>
              
              <p style={{ fontSize: '11px', color: '#999999', lineHeight: '1.5' }}>
                Xebia Group needs your contact details to communicate with you about our products and services. You can opt-out at any time. For details check our <a href="#privacy" style={{ color: '#000000', fontWeight: '700' }}>Privacy Policy</a>.
              </p>

              <button 
                type="submit" 
                style={{
                  background: '#FF6200',
                  color: 'white',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  width: 'fit-content',
                  boxShadow: '0 4px 10px rgba(132, 17, 124, 0.25)',
                  transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#831B84'}
                onMouseOut={(e) => e.currentTarget.style.background = '#FF6200'}
              >
                Subscribe Now
              </button>
            </form>
          )}
        </div>

        {/* Column 2: Target Aud */}
        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999999', letterSpacing: '0.05em', marginBottom: '20px', fontWeight: '700' }}>For:</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li><a href="#teams" style={{ color: '#000000', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>Teams and organizations</a></li>
            <li><a href="#individuals" style={{ color: '#000000', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>Individuals</a></li>
          </ul>
        </div>

        {/* Column 3: Domains with Helix Icon representation */}
        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999999', letterSpacing: '0.05em', marginBottom: '20px', fontWeight: '700' }}>Domains</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Agile', 'Cloud', 'DevOps', 'Data and AI', 'Leadership', 
              'Intelligent Automation', 'GitHub', 'Microsoft', 
              'Product Management', 'Scrum', 'Security', 'Software Development'
            ].map(domain => (
              <li key={domain} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle at 30% 30%, #a932ad, #831B84)', 
                  display: 'inline-block',
                  boxShadow: '0 2px 4px rgba(108,29,95,0.3)' 
                }}></span>
                <a href={`#${domain.toLowerCase().replace(/ /g, '-')}`} style={{ color: '#000000', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>{domain}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Locations & About */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999999', letterSpacing: '0.05em', marginBottom: '20px', fontWeight: '700' }}>Locations:</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: '700', fontSize: '14px' }}>
              <li>Hilversum(NL)</li>
              <li>Amsterdam(NL)</li>
              <li>Antwerp(BE)</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999999', letterSpacing: '0.05em', marginBottom: '20px', fontWeight: '700' }}>About us:</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: '700', fontSize: '14px' }}>
              <li><a href="https://xebia.com" target="_blank" rel="noopener noreferrer" style={{ color: '#000000', textDecoration: 'none' }}>Xebia.com</a></li>
              <li><a href="#faq" style={{ color: '#000000', textDecoration: 'none' }}>FAQ</a></li>
              <li><a href="#contact" style={{ color: '#000000', textDecoration: 'none' }}>Contact</a></li>
              <li style={{ color: '#000000', marginTop: '8px' }}>+31 (0)20 760 9844</li>
              <li><a href="mailto:academy@xebia.com" style={{ color: '#000000', textDecoration: 'none' }}>academy@xebia.com</a></li>
            </ul>
          </div>
        </div>

      </div>

      {/* Copyright bar */}
      <div style={{ 
        borderTop: '1px solid #E0DFDF', 
        paddingTop: '30px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '12px', 
        color: '#999999',
        fontWeight: '600'
      }}>
        <span>© {new Date().getFullYear()} Xebia Academy. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#terms" style={{ color: '#999999', textDecoration: 'none' }}>Terms & Conditions</a>
          <a href="#privacy" style={{ color: '#999999', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
