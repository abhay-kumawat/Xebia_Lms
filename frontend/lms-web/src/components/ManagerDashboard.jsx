import React, { useState } from 'react';
import { Check, X, Shield, Users, Globe, Building } from 'lucide-react';

export default function ManagerDashboard({ db, setDb, triggerLog }) {
  // Universities list state
  const [uniName, setUniName] = useState('');
  const [uniDomain, setUniDomain] = useState('');
  const [trainerSelect, setTrainerSelect] = useState('John Doe');
  const [courseSelect, setCourseSelect] = useState(db.courses[0]?.id || '');

  const handleAddUniversity = (e) => {
    e.preventDefault();
    if (!uniName.trim() || !uniDomain.trim()) return;

    const newUni = {
      id: Date.now(),
      name: uniName,
      domain: uniDomain
    };

    setDb({
      ...db,
      universities: [...(db.universities || []), newUni]
    });
    setUniName('');
    setUniDomain('');
    triggerLog('org', `POST /api/v1/org/universities - Created registry entry: "${newUni.name}" (${newUni.domain})`, 201);
  };

  const handleAssignTrainer = (e) => {
    e.preventDefault();
    const course = db.courses.find(c => c.id === Number(courseSelect));
    if (!course) return;

    const newAssignment = {
      id: Date.now(),
      trainer: trainerSelect,
      courseTitle: course.title
    };

    setDb({
      ...db,
      assignments: [...(db.assignments || []), newAssignment]
    });
    triggerLog('org', `POST /api/v1/org/trainers/assign - Assigned ${trainerSelect} to Course: "${course.title}"`, 200);
  };

  const handleApprovalAction = (approvalId, status) => {
    const updatedApprovals = db.approvals.map(app => 
      app.id === approvalId ? { ...app, status } : app
    );

    setDb({
      ...db,
      approvals: updatedApprovals
    });

    triggerLog('approval', `PUT /api/v1/approvals/requests/${approvalId} - Transition status to: ${status.toUpperCase()}`, 200);

    // Automatically trigger notification simulation to let student/trainer know
    setTimeout(() => {
      triggerLog(
        'notification',
        `Kafka event listener: lms-approval-status-update -> Dispatched push alerts to owner (Status: ${status})`,
        200
      );
    }, 1500);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* Central Panel: University Registry & Trainer Assignments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* University Registry */}
        <div className="glass-panel floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px' }} className="gradient-text">Partner University Registry</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Configure organization boundaries and assign students using academic domain verification rules.
            </p>
          </div>

          <form onSubmit={handleAddUniversity} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="e.g. Stanford University" 
              value={uniName}
              onChange={(e) => setUniName(e.target.value)}
              className="form-control"
              style={{ fontSize: '12px' }}
              required
            />
            <input 
              type="text" 
              placeholder="e.g. stanford.edu" 
              value={uniDomain}
              onChange={(e) => setUniDomain(e.target.value)}
              className="form-control"
              style={{ fontSize: '12px' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
              Add Registry
            </button>
          </form>

          {/* Universities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
            {(db.universities || []).map(uni => (
              <div key={uni.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                <Building size={16} color="var(--xebia-velvet-light)" />
                <div>
                  <div style={{ fontWeight: '600' }}>{uni.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Domain: {uni.domain}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trainer Assignment */}
        <div className="glass-panel floating-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px' }} className="gradient-text">Trainer Allocations</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Assign certified staff members to specific learning batches and curriculums.
            </p>
          </div>

          <form onSubmit={handleAssignTrainer} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Trainer Profile</label>
              <select 
                value={trainerSelect} 
                onChange={(e) => setTrainerSelect(e.target.value)}
                className="form-control"
              >
                <option value="John Doe">John Doe (Principal Architect)</option>
                <option value="Sarah Connor">Sarah Connor (Cloud Lead)</option>
                <option value="Alex Mercer">Alex Mercer (Data Scientist)</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label className="form-label">Course Target</label>
              <select 
                value={courseSelect} 
                onChange={(e) => setCourseSelect(e.target.value)}
                className="form-control"
              >
                {db.courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>
              Assign
            </button>
          </form>

          {/* Active Assignments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {(db.assignments || []).map(assign => (
              <div key={assign.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--xebia-border)', fontSize: '12px' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{assign.trainer}</span>
                <span style={{ color: 'var(--text-secondary)' }}>→ {assign.courseTitle}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Approvals Workflow queue */}
      <div className="glass-panel floating-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '16px' }} className="gradient-text">Policy Approval Workflow</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Audit and approve course releases, batch budget models, or syllabus upgrades before production.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {db.approvals.map(req => (
            <div key={req.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Workflow Request #{req.id}</span>
                <span className={`badge ${
                  req.status === 'Approved' ? 'badge-green' :
                  req.status === 'Rejected' ? 'badge-orange' : 'badge-velvet'
                }`} style={{ fontSize: '10px' }}>
                  {req.status}
                </span>
              </div>

              <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{req.title}</h5>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Requested By: {req.requestedBy}
              </p>

              {req.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleApprovalAction(req.id, 'Approved')} 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '6px 12px', fontSize: '11px' }}
                  >
                    <Check size={12} /> Approve
                  </button>
                  <button 
                    onClick={() => handleApprovalAction(req.id, 'Rejected')} 
                    className="btn btn-danger" 
                    style={{ flex: 1, padding: '6px 12px', fontSize: '11px' }}
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
