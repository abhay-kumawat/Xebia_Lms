import React from 'react';
import { 
  Network, Shield, Settings, Server, Users, BookOpen, 
  Layers, CheckSquare, MessageSquare, ShieldAlert, Bell, Video 
} from 'lucide-react';

export default function TopologyMap({ activeService, triggerLog }) {
  // Define positions and metadata for the 12 services (including common library status)
  const services = [
    { id: 'gateway', label: 'lms-gateway', row: 1, col: 3, icon: Network, color: 'var(--accent-cyan)', desc: 'Route Gateway, Security, Rate Limiter' },
    { id: 'config', label: 'lms-config-server', row: 1, col: 1, icon: Settings, color: '#ff7700', desc: 'Central Properties Registry' },
    { id: 'discovery', label: 'lms-discovery-server', row: 1, col: 5, icon: Server, color: '#a020f0', desc: 'Eureka Service Discovery' },
    
    { id: 'iam', label: 'lms-iam-service', row: 2, col: 1, icon: Shield, color: 'var(--xebia-velvet-light)', desc: 'Auth, RBAC, Redis Token Cache' },
    { id: 'org', label: 'lms-org-service', row: 2, col: 2, icon: Users, color: '#3b82f6', desc: 'Universities, Trainer assignments' },
    { id: 'course', label: 'lms-course-service', row: 2, col: 3, icon: BookOpen, color: 'var(--accent-green)', desc: 'Courses, Modules, Lessons' },
    { id: 'batch', label: 'lms-batch-service', row: 2, col: 4, icon: Layers, color: 'var(--accent-orange)', desc: 'Cohorts, Student Enrolments' },
    { id: 'assessment', label: 'lms-assessment-service', row: 2, col: 5, icon: CheckSquare, color: '#10b981', desc: 'Quizzes, Exams, Grading' },
    
    { id: 'engagement', label: 'lms-engagement-service', row: 3, col: 1, icon: MessageSquare, color: '#ec4899', desc: 'Comments, Replies, Feedbacks' },
    { id: 'approval', label: 'lms-approval-service', row: 3, col: 2, icon: ShieldAlert, color: 'var(--accent-coral)', desc: 'Approval Policies, Access workflows' },
    { id: 'notification', label: 'lms-notification-service', row: 3, col: 4, icon: Bell, color: '#eab308', desc: 'Email, WhatsApp, Kafka Events listener' },
    { id: 'media', label: 'lms-media-service', row: 3, col: 5, icon: Video, color: '#06b6d4', desc: 'HLS Stream, Transcoder, S3 URLs' }
  ];

  return (
    <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }} className="gradient-text">
            Enterprise Architecture Map
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Real-time visual routing topology. Triggered microservices pulse dynamically.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
            Active
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--xebia-velvet)' }}></span>
            Idle
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ 
        display: 'grid', 
        gridTemplateRows: 'repeat(3, 110px)', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '20px', 
        position: 'relative',
        padding: '10px 0'
      }}>
        
        {/* Connection SVGs background */}
        <svg 
          viewBox="0 0 500 330" 
          preserveAspectRatio="none"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none', 
            zIndex: 0 
          }}
        >
          {/* Gateway links to microservices */}
          <line x1="250" y1="55" x2="50" y2="165" stroke="rgba(131, 27, 132, 0.15)" strokeWidth="1.5" />
          <line x1="250" y1="55" x2="150" y2="165" stroke="rgba(131, 27, 132, 0.15)" strokeWidth="1.5" />
          <line x1="250" y1="55" x2="250" y2="165" stroke="rgba(131, 27, 132, 0.15)" strokeWidth="1.5" />
          <line x1="250" y1="55" x2="350" y2="165" stroke="rgba(131, 27, 132, 0.15)" strokeWidth="1.5" />
          <line x1="250" y1="55" x2="450" y2="165" stroke="rgba(131, 27, 132, 0.15)" strokeWidth="1.5" />

          {/* Config & Discovery to services */}
          <line x1="50" y1="55" x2="50" y2="165" stroke="rgba(255, 119, 0, 0.1)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="450" y1="55" x2="450" y2="165" stroke="rgba(160, 32, 240, 0.1)" strokeWidth="1" strokeDasharray="3,3" />

          {/* Service interconnect cascades */}
          {/* IAM to Org/Batch (RBAC verification) */}
          <line x1="50" y1="165" x2="150" y2="165" stroke="rgba(131, 27, 132, 0.15)" strokeWidth="1.5" />
          {/* Course to Media / Batch */}
          <line x1="250" y1="165" x2="350" y2="165" stroke="rgba(57, 255, 20, 0.15)" strokeWidth="1.5" />
          <line x1="250" y1="165" x2="450" y2="275" stroke="rgba(57, 255, 20, 0.15)" strokeWidth="1.5" />
          {/* Batch to Assessment */}
          <line x1="350" y1="165" x2="450" y2="165" stroke="rgba(255, 170, 0, 0.15)" strokeWidth="1.5" />
          
          {/* Kafka broker / Notification pipelines */}
          <path d="M 350 165 Q 400 220 350 275" fill="none" stroke="rgba(234, 179, 8, 0.15)" strokeWidth="1.5" strokeDasharray="4,4" />
          <path d="M 450 165 Q 400 220 350 275" fill="none" stroke="rgba(234, 179, 8, 0.15)" strokeWidth="1.5" strokeDasharray="4,4" />
        </svg>

        {services.map((svc) => {
          const IconComponent = svc.icon;
          const isSelected = activeService === svc.id;
          
          return (
            <div 
              key={svc.id}
              onClick={() => triggerLog(
                svc.id, 
                `Manual status request sent to ${svc.label}. Dynamic health check returned status 200.`, 
                200
              )}
              style={{
                gridRow: svc.row,
                gridColumn: svc.col,
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? 'rgba(131, 27, 132, 0.25)' : 'rgba(18, 6, 30, 0.7)',
                border: `1px solid ${isSelected ? svc.color : 'var(--xebia-border)'}`,
                boxShadow: isSelected ? `0 0 15px ${svc.color}44` : 'none',
                borderRadius: '12px',
                padding: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'center',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}
              className={isSelected ? 'glow-active' : ''}
              title={svc.desc}
            >
              <div style={{
                background: isSelected ? svc.color : 'var(--xebia-grey-light)',
                color: isSelected ? 'var(--xebia-black)' : svc.color,
                borderRadius: '8px',
                padding: '6px',
                display: 'inline-flex',
                marginBottom: '6px',
                transition: 'var(--transition-smooth)'
              }}>
                <IconComponent size={18} />
              </div>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: isSelected ? '#fff' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {svc.label}
              </span>
              <span style={{ 
                fontSize: '8px', 
                color: 'var(--text-muted)',
                marginTop: '2px',
                display: 'block'
              }}>
                {isSelected ? 'PROCESSING' : 'STANDBY'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
