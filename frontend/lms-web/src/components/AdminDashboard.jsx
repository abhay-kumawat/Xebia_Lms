import React, { useState } from 'react';
import { Shield, Key, RefreshCw, Cpu, Activity, AlertTriangle, Trash2, Edit2, Plus } from 'lucide-react';

export default function AdminDashboard({ db, setDb, triggerLog }) {
  const [tokenTimeout, setTokenTimeout] = useState(3600); // 1 hour in seconds
  const [rateLimit, setRateLimit] = useState(100); // req/min
  const [metrics, setMetrics] = useState({
    gatewayCpu: '12%',
    gatewayMemory: '256MB',
    activeSessions: 42,
    redisCacheHits: '98.4%'
  });

  // Create user state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');

  // Edit user state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editStatus, setEditStatus] = useState('Active');

  const handleUpdateSecurity = (e) => {
    e.preventDefault();
    triggerLog('gateway', `PUT /api/v1/gateway/config/rate-limit?limit=${rateLimit} - Modified token policy rules`, 200);
    triggerLog('iam', `PUT /api/v1/iam/security/token-policy - JWT lifetime updated to: ${tokenTimeout}s`, 200);
  };

  const handleToggleUserStatus = (userId) => {
    const updatedUsers = db.users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        triggerLog('iam', `PATCH /api/v1/iam/users/${userId}/status - Set state to: ${newStatus}`, 200);
        return { ...u, status: newStatus };
      }
      return u;
    });

    setDb({
      ...db,
      users: updatedUsers
    });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser = {
      id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      status: 'Active'
    };

    triggerLog('gateway', `POST /api/v1/iam/users - Handshaking profile request`, 200);
    triggerLog('iam', `POST /api/v1/iam/users - Provisioned: ${newUser.email} | Role: ${newUser.role}`, 201);

    setDb({
      ...db,
      users: [...db.users, newUser]
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('student');
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;

    triggerLog('gateway', `PUT /api/v1/iam/users/${editingUserId} - Proxying update headers`, 200);
    triggerLog('iam', `PUT /api/v1/iam/users/${editingUserId} - Modified profile parameters`, 200);

    const updated = db.users.map(u => {
      if (u.id === editingUserId) {
        return {
          ...u,
          name: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          role: editRole,
          status: editStatus
        };
      }
      return u;
    });

    setDb({
      ...db,
      users: updated
    });
    setEditingUserId(null);
  };

  const handleDeleteUser = (userId) => {
    triggerLog('gateway', `DELETE /api/v1/iam/users/${userId} - Forwarding request packet`, 200);
    triggerLog('iam', `DELETE /api/v1/iam/users/${userId} - Evicted security context and DB record`, 200);

    const updated = db.users.filter(u => u.id !== userId);
    setDb({
      ...db,
      users: updated
    });
  };

  const handleRefreshMetrics = () => {
    triggerLog('gateway', `GET /actuator/metrics/system.cpu.usage - Dynamic polling triggered`, 200);
    triggerLog('iam', `GET /actuator/prometheus/metrics - Retrieved threadpools status`, 200);
    
    setMetrics({
      gatewayCpu: `${Math.floor(Math.random() * 20) + 5}%`,
      gatewayMemory: `${Math.floor(Math.random() * 50) + 230}MB`,
      activeSessions: Math.floor(Math.random() * 15) + 35,
      redisCacheHits: `${(95 + Math.random() * 4).toFixed(1)}%`
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* Dynamic Security & Gateway Rates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Gateway Security Controller */}
        <div className="glass-panel floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px' }} className="gradient-text">Gateway Routing & Security Policies</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Adjust dynamic rate limits and validation controls for JWT tokens without restarting services.
            </p>
          </div>

          <form onSubmit={handleUpdateSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">JWT Token Lifetime (Seconds)</label>
                <input 
                  type="number" 
                  value={tokenTimeout} 
                  onChange={(e) => setTokenTimeout(Number(e.target.value))}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gateway Rate Limit (Req/Min)</label>
                <input 
                  type="number" 
                  value={rateLimit} 
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', fontSize: '12px' }}>
              Apply Security Rules
            </button>
          </form>
        </div>

        {/* User Identity & Authorization Management (CRUD) */}
        <div className="glass-panel floating-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px' }} className="gradient-text">Identity & Access Manager (IAM)</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Create, read, update, or delete profiles and security access tokens.
            </p>
          </div>

          {/* Create User Form */}
          <form onSubmit={handleCreateUser} style={{ background: 'rgba(0,0,0,0.15)', padding: '14px', borderRadius: '10px', border: '1px solid var(--xebia-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--xebia-velvet-light)' }}>Provision User Profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Name" 
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                className="form-control"
                style={{ fontSize: '11px', padding: '6px 10px' }}
                required
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                className="form-control"
                style={{ fontSize: '11px', padding: '6px 10px' }}
                required
              />
              <select 
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value)}
                className="form-control"
                style={{ fontSize: '11px', padding: '6px 10px', background: 'var(--xebia-black)' }}
              >
                <option value="student">student</option>
                <option value="trainer">trainer</option>
                <option value="manager">manager</option>
                <option value="organiser">organiser</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', fontSize: '11px', padding: '6px 12px' }}>
              <Plus size={12} /> Add User
            </button>
          </form>

          {/* Users List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {db.users.map(user => (
              <div 
                key={user.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '10px',
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '12px 16px', 
                  borderRadius: '10px',
                  border: '1px solid var(--xebia-border)'
                }}
              >
                {editingUserId === user.id ? (
                  /* Edit Mode inline Form */
                  <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        required
                      />
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <select 
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px', background: 'var(--xebia-black)' }}
                      >
                        <option value="student">student</option>
                        <option value="trainer">trainer</option>
                        <option value="manager">manager</option>
                        <option value="organiser">organiser</option>
                        <option value="admin">admin</option>
                      </select>
                      <select 
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px', background: 'var(--xebia-black)' }}
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn btn-primary" style={{ fontSize: '10px', padding: '4px 8px' }}>
                        Save
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingUserId(null)} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Standard Read Mode Row */
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email: {user.email}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-velvet" style={{ fontSize: '9px' }}>{user.role}</span>
                      <span className={`badge ${user.status === 'Active' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '9px' }}>
                        {user.status}
                      </span>
                      
                      <button 
                        onClick={() => startEdit(user)}
                        className="btn btn-secondary" 
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                        title="Edit User"
                      >
                        <Edit2 size={10} />
                      </button>

                      <button 
                        onClick={() => handleToggleUserStatus(user.id)} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                        title="Toggle Status"
                      >
                        Toggle
                      </button>

                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="btn btn-danger" 
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                        title="Delete User"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Actuator & Prometheus Metrics Panel */}
      <div className="glass-panel floating-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '16px' }} className="gradient-text">Actuator Live Metrics</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time resource utilization indices from Spring Boot Prometheus endpoint.
            </p>
          </div>
          <button 
            onClick={handleRefreshMetrics} 
            className="btn btn-secondary" 
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0' }}
            title="Poll microservices stats"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Cpu size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gateway CPU</span>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{metrics.gatewayCpu}</span>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Activity size={20} color="var(--accent-green)" />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gateway JVM RAM</span>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{metrics.gatewayMemory}</span>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Key size={20} color="var(--xebia-velvet-light)" />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Auth Sessions</span>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{metrics.activeSessions}</span>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Activity size={20} color="var(--accent-orange)" />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Redis Cache Hit Rate</span>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{metrics.redisCacheHits}</span>
          </div>
        </div>

        {/* Log verification */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: 'rgba(255, 87, 87, 0.05)', border: '1px solid rgba(255, 87, 87, 0.2)', borderRadius: '10px', marginTop: '10px' }}>
          <AlertTriangle size={16} color="var(--accent-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-coral)' }}>Rate-Limit Warnings</div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              No critical threshold violations reported. Token validation filters are executing standard handshake.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
