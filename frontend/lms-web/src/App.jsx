import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, User, Users, GraduationCap, Settings, 
  Terminal, Server, HelpCircle, Key, RefreshCw, LogOut 
} from 'lucide-react';
import TopologyMap from './components/TopologyMap';
import StudentDashboard from './components/StudentDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import OrganiserDashboard from './components/OrganiserDashboard';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState({ name: '', email: '', role: '' });
  const [persona, setPersona] = useState('student');
  const [activeService, setActiveService] = useState(null);
  
  // Console logging console reference
  const consoleEndRef = useRef(null);

  // Pre-populated mock database mimicking microservices entities
  const getInitialDb = () => {
    const saved = localStorage.getItem('lms_db_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore parsing errors
      }
    }
    return {
      users: [
        { id: 1, name: 'Abhay Kumawat', email: 'abhay@xebia.com', role: 'Student', status: 'Active' },
        { id: 2, name: 'John Doe', email: 'john.doe@xebia.com', role: 'Trainer', status: 'Active' },
        { id: 3, name: 'Sarah Connor', email: 'sarah.c@xebia.com', role: 'Manager', status: 'Active' }
      ],
      courses: [
        { id: 10, title: 'Generative AI & LLM Fine-Tuning Masterclass', duration: '16 hours', progress: 45 },
        { id: 20, title: 'Platform Engineering & K8s Architecture', duration: '32 hours', progress: 10 },
        { id: 30, title: 'Agile Leadership & DevOps Principles', duration: '8 hours', progress: 0 }
      ],
      batches: [
        { id: 501, name: 'Xebia GenAI Cohort 1', studentsCount: 12 },
        { id: 502, name: 'Cloud Architects Jan 2026', studentsCount: 8 }
      ],
      enrolments: [
        { id: 801, studentName: 'Abhay Kumawat', batchName: 'Xebia GenAI Cohort 1', status: 'Active' }
      ],
      assessments: [
        { 
          id: 701, 
          courseId: 10, 
          question: 'Which methodology optimizes LLM model weights locally using low-rank adaptations?', 
          options: ['Fine-Tuning', 'LoRA', 'RAG', 'Prompt Chaining'], 
          correctAnswer: 'LoRA' 
        },
        { 
          id: 702, 
          courseId: 20, 
          question: 'Which Kubernetes resource manages stateful workloads like Postgres databases?', 
          options: ['Deployment', 'DaemonSet', 'StatefulSet', 'Job'], 
          correctAnswer: 'StatefulSet' 
        }
      ],
      comments: [
        { id: 901, courseId: 10, user: 'John Doe (Trainer)', content: 'Please ensure you review the PyTorch notebook in Module 2 before attempting the LoRA task.', timestamp: '2 hours ago' }
      ],
      universities: [
        { id: 301, name: 'Xebia Academy Center', domain: 'xebia.com' },
        { id: 302, name: 'Delhi Tech University', domain: 'dtu.ac.in' }
      ],
      assignments: [
        { id: 401, trainer: 'John Doe', courseTitle: 'Generative AI & LLM Fine-Tuning Masterclass' }
      ],
      approvals: [
        { id: 601, title: 'Syllabus Upgrade: Advanced Kubernetes Security', requestedBy: 'John Doe', status: 'Pending' },
        { id: 602, title: 'Budget Allocation: Partner Training Program', requestedBy: 'Sarah Connor', status: 'Approved' }
      ]
    };
  };

  const [db, setDb] = useState(getInitialDb);

  useEffect(() => {
    localStorage.setItem('lms_db_state', JSON.stringify(db));
  }, [db]);

  const proxyUrl = 'http://localhost:3002/api/users';
  const [isProxyConnected, setIsProxyConnected] = useState(false);

  const syncWithProxy = async () => {
    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const users = await res.json();
        
        const endpoints = [
          { key: 'universities', url: 'http://localhost:3002/api/universities' },
          { key: 'courses', url: 'http://localhost:3002/api/courses' },
          { key: 'batches', url: 'http://localhost:3002/api/batches' },
          { key: 'enrolments', url: 'http://localhost:3002/api/enrolments' },
          { key: 'assessments', url: 'http://localhost:3002/api/assessments' },
          { key: 'comments', url: 'http://localhost:3002/api/comments' },
          { key: 'assignments', url: 'http://localhost:3002/api/assignments' },
          { key: 'approvals', url: 'http://localhost:3002/api/approvals' }
        ];
        
        const fetchedData = {};
        for (const ep of endpoints) {
          try {
            const r = await fetch(ep.url);
            if (r.ok) {
              fetchedData[ep.key] = await r.json();
            } else {
              fetchedData[ep.key] = db[ep.key];
            }
          } catch (err) {
            fetchedData[ep.key] = db[ep.key];
          }
        }

        setDb(prev => ({
          ...prev,
          users,
          ...fetchedData
        }));
        setIsProxyConnected(true);
      } else {
        setIsProxyConnected(false);
      }
    } catch (e) {
      setIsProxyConnected(false);
    }
  };

  useEffect(() => {
    syncWithProxy();
    // Poll to keep in sync
    const interval = setInterval(syncWithProxy, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSetDb = (newDbVal) => {
    if (isProxyConnected) {
      // 1. Users
      if (newDbVal.users !== db.users) {
        const oldUsers = db.users || [];
        const newUsers = newDbVal.users || [];

        if (newUsers.length > oldUsers.length) {
          const added = newUsers.find(nu => !oldUsers.some(ou => ou.id === nu.id));
          if (added) {
            fetch(proxyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: added.name,
                email: added.email,
                role: added.role,
                status: added.status
              })
            }).then(r => r.ok && syncWithProxy());
          }
        } else if (newUsers.length < oldUsers.length) {
          const deleted = oldUsers.find(ou => !newUsers.some(nu => nu.id === ou.id));
          if (deleted) {
            fetch(`${proxyUrl}/${deleted.id}`, {
              method: 'DELETE'
            }).then(r => r.ok && syncWithProxy());
          }
        } else {
          const updated = newUsers.find(nu => {
            const old = oldUsers.find(ou => ou.id === nu.id);
            return old && (old.name !== nu.name || old.email !== nu.email || old.role !== nu.role || old.status !== nu.status);
          });
          if (updated) {
            fetch(`${proxyUrl}/${updated.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: updated.name,
                email: updated.email,
                role: updated.role,
                status: updated.status
              })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }

      // 2. Universities
      if (newDbVal.universities !== db.universities) {
        const oldUnis = db.universities || [];
        const newUnis = newDbVal.universities || [];

        if (newUnis.length > oldUnis.length) {
          const added = newUnis.find(nu => !oldUnis.some(ou => ou.id === nu.id));
          if (added) {
            fetch('http://localhost:3002/api/universities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: added.name, domain: added.domain })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }

      // 3. Courses
      if (newDbVal.courses !== db.courses) {
        const oldCourses = db.courses || [];
        const newCourses = newDbVal.courses || [];

        if (newCourses.length > oldCourses.length) {
          const added = newCourses.find(nu => !oldCourses.some(ou => ou.id === nu.id));
          if (added) {
            fetch('http://localhost:3002/api/courses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: added.title, duration: added.duration, progress: added.progress })
            }).then(r => r.ok && syncWithProxy());
          }
        } else {
          const updated = newCourses.find(nu => {
            const old = oldCourses.find(ou => ou.id === nu.id);
            return old && old.progress !== nu.progress;
          });
          if (updated) {
            fetch(`http://localhost:3002/api/courses/${updated.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ progress: updated.progress })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }

      // 4. Batches
      if (newDbVal.batches !== db.batches) {
        const oldBatches = db.batches || [];
        const newBatches = newDbVal.batches || [];

        if (newBatches.length > oldBatches.length) {
          const added = newBatches.find(nu => !oldBatches.some(ou => ou.id === nu.id));
          if (added) {
            fetch('http://localhost:3002/api/batches', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: added.name, studentsCount: added.studentsCount })
            }).then(r => r.ok && syncWithProxy());
          }
        } else {
          const updated = newBatches.find(nu => {
            const old = oldBatches.find(ou => ou.id === nu.id);
            return old && old.studentsCount !== nu.studentsCount;
          });
          if (updated) {
            fetch(`http://localhost:3002/api/batches/${updated.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ studentsCount: updated.studentsCount })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }

      // 5. Enrolments
      if (newDbVal.enrolments !== db.enrolments) {
        const oldEnrolments = db.enrolments || [];
        const newEnrolments = newDbVal.enrolments || [];

        if (newEnrolments.length > oldEnrolments.length) {
          const added = newEnrolments.find(nu => !oldEnrolments.some(ou => ou.id === nu.id));
          if (added) {
            fetch('http://localhost:3002/api/enrolments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentName: added.studentName,
                batchName: added.batchName,
                status: added.status
              })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }

      // 6. Comments
      if (newDbVal.comments !== db.comments) {
        const oldComments = db.comments || [];
        const newComments = newDbVal.comments || [];

        if (newComments.length > oldComments.length) {
          const added = newComments.find(nu => !oldComments.some(ou => ou.id === nu.id));
          if (added) {
            fetch('http://localhost:3002/api/comments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseId: added.courseId,
                user: added.user,
                content: added.content,
                timestamp: added.timestamp
              })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }

      // 7. Assignments
      if (newDbVal.assignments !== db.assignments) {
        const oldAssignments = db.assignments || [];
        const newAssignments = newDbVal.assignments || [];

        if (newAssignments.length > oldAssignments.length) {
          const added = newAssignments.find(nu => !oldAssignments.some(ou => ou.id === nu.id));
          if (added) {
            fetch('http://localhost:3002/api/assignments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ trainer: added.trainer, courseTitle: added.courseTitle })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }

      // 8. Approvals
      if (newDbVal.approvals !== db.approvals) {
        const oldApprovals = db.approvals || [];
        const newApprovals = newDbVal.approvals || [];

        if (newApprovals.length > oldApprovals.length) {
          const added = newApprovals.find(nu => !oldApprovals.some(ou => ou.id === nu.id));
          if (added) {
            fetch('http://localhost:3002/api/approvals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: added.title, requestedBy: added.requestedBy, status: added.status })
            }).then(r => r.ok && syncWithProxy());
          }
        } else {
          const updated = newApprovals.find(nu => {
            const old = oldApprovals.find(ou => ou.id === nu.id);
            return old && old.status !== nu.status;
          });
          if (updated) {
            fetch(`http://localhost:3002/api/approvals/${updated.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: updated.status })
            }).then(r => r.ok && syncWithProxy());
          }
        }
      }
    }
    setDb(newDbVal);
  };

  // Pre-populate with startup bootstrap messages
  const [eventLogs, setEventLogs] = useState([
    { id: 1, time: '16:28:54', service: 'config', route: 'BOOT', status: 200, msg: 'Config server decrypted configurations successfully.' },
    { id: 2, time: '16:28:55', service: 'discovery', route: 'BOOT', status: 200, msg: 'lms-discovery-server registered 11 backend instances.' },
    { id: 3, time: '16:28:56', service: 'gateway', route: 'BOOT', status: 200, msg: 'lms-gateway routing traffic. CORS enabled. Rate Limit set: 100/min.' }
  ]);

  // Highlight service and push log
  const triggerLog = (serviceId, msg, status = 200, customRoute = null) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // Auto-detect route naming patterns based on service
    const routeMap = {
      gateway: 'API /gateway/config',
      iam: 'AUTH /api/v1/iam',
      course: 'COURSE /api/v1/courses',
      batch: 'BATCH /api/v1/batches',
      assessment: 'ASSESS /api/v1/assessments',
      org: 'ORG /api/v1/org',
      engagement: 'ENGAGE /api/v1/engagement',
      approval: 'APPROVE /api/v1/approvals',
      notification: 'NOTIFY /kafka/event',
      media: 'MEDIA /api/v1/media',
      config: 'CONFIG /configs',
      discovery: 'DISCOVERY /eureka'
    };

    const newLog = {
      id: Date.now(),
      time,
      service: serviceId,
      route: customRoute || routeMap[serviceId] || 'HTTP',
      status,
      msg
    };

    setEventLogs(prev => [...prev, newLog]);
    setActiveService(serviceId);
  };

  // Clear active highlight after 1.5 seconds for visual pulse feedback
  useEffect(() => {
    if (activeService) {
      const timer = setTimeout(() => {
        setActiveService(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeService]);

  // Scroll to bottom of logs console whenever logs change
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [eventLogs]);

  // Log role switches
  const handlePersonaChange = (newPersona) => {
    setPersona(newPersona);
    triggerLog(
      'iam',
      `GET /api/v1/iam/users/me - Authenticated session. Exchanged credentials for JWT (Role: ${newPersona.toUpperCase()})`,
      200
    );
  };

  const handleLoginSuccess = (profile) => {
    setActiveUser(profile);
    setPersona(profile.role);
    setIsAuthenticated(true);
    triggerLog(
      'iam',
      `Session established. Loaded profile settings for target context. User authenticated successfully.`,
      200
    );
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    triggerLog(
      'iam',
      `DELETE /api/v1/iam/auth/session - Invalidated security token. Cleared active session credentials.`,
      200
    );
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--xebia-black)' }}>
        <LandingPage onLoginSuccess={handleLoginSuccess} triggerLog={triggerLog} />
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* Sidebar: Navigation, Branding, Personas */}
      <aside className="sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--xebia-velvet)',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px var(--xebia-velvet-glow)'
            }}>
              <GraduationCap size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.1 }}>
                xebia <span className="gradient-text-velvet">academy</span>
              </h2>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LMS PORTAL
              </span>
            </div>
          </div>

          {/* Persona selector (User role mapping) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch Dashboard Role
            </span>
            
            {[
              { id: 'student', label: 'Student Portal', icon: User, color: 'var(--accent-green)' },
              { id: 'trainer', label: 'Trainer Workspace', icon: GraduationCap, color: 'var(--accent-cyan)' },
              { id: 'manager', label: 'Manager Dashboard', icon: Users, color: '#3b82f6' },
              { id: 'organiser', label: 'Organiser Control', icon: Server, color: 'var(--accent-orange)' },
              { id: 'admin', label: 'System Admin', icon: Settings, color: 'var(--xebia-velvet-light)' }
            ].map(role => {
              const Icon = role.icon;
              const isActive = persona === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handlePersonaChange(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(131, 27, 132, 0.15)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--xebia-velvet)' : 'transparent'}`,
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    textAlign: 'left'
                  }}
                  className="role-btn"
                >
                  <Icon size={16} style={{ color: isActive ? role.color : 'var(--text-muted)' }} />
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400' }}>{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 87, 87, 0.05)',
                border: '1px solid rgba(255, 87, 87, 0.2)',
                color: 'var(--accent-coral)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 87, 87, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 87, 87, 0.05)'}
            >
              <LogOut size={16} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Sign Out Session</span>
            </button>
          </div>

        </div>

        {/* Neon Connection Panel */}
        <div className="glass-panel" style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 245, 255, 0.2)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)' }}>
            <Key size={12} />
            <span style={{ fontWeight: '600' }}>Neon Cloud DB Status</span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Proxy engine status:
          </p>
          {isProxyConnected ? (
            <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
              ✓ Connected to Neon DB
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
              ○ Local Simulated Memory DB
            </span>
          )}
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', borderTop: '1px solid var(--xebia-border)', paddingTop: '6px', marginTop: '4px' }}>
            {isProxyConnected ? 'Proxy active on port 3002' : 'Run proxy-server.js to link Neon DB'}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        
        {/* Header bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>
              Welcome, <span className="gradient-text">{activeUser.name}</span>
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Active Credentials: <strong style={{ color: 'var(--accent-cyan)' }}>{activeUser.email}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <Server size={14} color="var(--accent-cyan)" />
              Gateway Status: <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>ONLINE</span>
            </div>
            <button 
              onClick={() => {
                setEventLogs([]);
                triggerLog('gateway', 'Cleared telemetry display event list. Ready for new operations.', 200);
              }} 
              className="btn btn-secondary"
              style={{ fontSize: '12px' }}
            >
              Clear Logs
            </button>
          </div>
        </header>

        {/* Microservices visual topology map */}
        <TopologyMap activeService={activeService} triggerLog={triggerLog} />

        {/* Core Sub-view Container */}
        <section style={{ minHeight: '380px' }}>
          {persona === 'student' && <StudentDashboard db={db} setDb={handleSetDb} triggerLog={triggerLog} />}
          {persona === 'trainer' && <TrainerDashboard db={db} setDb={handleSetDb} triggerLog={triggerLog} />}
          {persona === 'manager' && <ManagerDashboard db={db} setDb={handleSetDb} triggerLog={triggerLog} />}
          {persona === 'organiser' && <OrganiserDashboard db={db} setDb={handleSetDb} triggerLog={triggerLog} />}
          {persona === 'admin' && <AdminDashboard db={db} setDb={handleSetDb} triggerLog={triggerLog} />}
        </section>



      </main>

    </div>
  );
}
