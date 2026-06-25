import React, { useState } from 'react';
import { Send, Plus, Users, Layers, MessageSquare, Mail, Phone } from 'lucide-react';

export default function OrganiserDashboard({ db, setDb, triggerLog }) {
  const [batchName, setBatchName] = useState('');
  const [enrollmentStudent, setEnrollmentStudent] = useState('Abhay Kumawat');
  const [enrollmentBatch, setEnrollmentBatch] = useState(db.batches[0] || '');
  
  // Notification dispatch state
  const [notifyTemplate, setNotifyTemplate] = useState('welcome_template');
  const [notifyChannel, setNotifyChannel] = useState('email');
  const [notifyMsg, setNotifyMsg] = useState('Your corporate learning dashboard is now fully active. Head to /dashboard to verify courses.');

  const handleAddBatch = (e) => {
    e.preventDefault();
    if (!batchName.trim()) return;

    const newBatch = {
      id: Date.now(),
      name: batchName,
      studentsCount: 0
    };

    setDb({
      ...db,
      batches: [...db.batches, newBatch]
    });
    setBatchName('');
    triggerLog('batch', `POST /api/v1/batches - Created new cohort: "${newBatch.name}"`, 201);
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    if (!enrollmentBatch) return;

    // Increment student count in mock batch
    const updatedBatches = db.batches.map(b => 
      b.id === enrollmentBatch.id ? { ...b, studentsCount: b.studentsCount + 1 } : b
    );

    const newEnrolment = {
      id: Date.now(),
      studentName: enrollmentStudent,
      batchName: enrollmentBatch.name,
      status: 'Active'
    };

    setDb({
      ...db,
      batches: updatedBatches,
      enrolments: [...(db.enrolments || []), newEnrolment]
    });

    triggerLog('batch', `POST /api/v1/enrolments - Enrolled ${enrollmentStudent} into Cohort "${enrollmentBatch.name}"`, 200);

    // Auto notification trigger
    setTimeout(() => {
      triggerLog(
        'notification',
        `Kafka listener: lms-enrolment-completed -> Automated Dispatcher triggered channel (Type: EMAIL)`,
        200
      );
    }, 1200);
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    triggerLog(
      'notification',
      `POST /api/v1/notifications/send - Type: ${notifyChannel.toUpperCase()} | Template: ${notifyTemplate} | Payload: "${notifyMsg.substring(0, 30)}..."`,
      202
    );

    // Mock callback from the delivery adapter
    setTimeout(() => {
      triggerLog(
        'notification',
        `Delivery Status Callback: Message successfully acknowledged by ${notifyChannel} gateway adapter.`,
        200
      );
    }, 1500);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* Batch Setup & Enrollments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Cohort Manager */}
        <div className="glass-panel floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px' }} className="gradient-text">Academic Cohorts & Batch Setup</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Initialize new corporate learning cycles and configure database settings for lms-batch-service.
            </p>
          </div>

          <form onSubmit={handleAddBatch} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="e.g. AWS Cloud Academy - Fall 2026" 
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="form-control"
              style={{ fontSize: '12px' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
              <Plus size={14} /> Create Cohort
            </button>
          </form>

          {/* Batches Table Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {db.batches.map(batch => (
              <div key={batch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                <span style={{ fontWeight: '500' }}>{batch.name}</span>
                <span className="badge badge-velvet">{batch.studentsCount} Students</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Enrollment */}
        <div className="glass-panel floating-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px' }} className="gradient-text">Enrolment Desk</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Add students to configured cohorts and trigger automatic onboarding courses.
            </p>
          </div>

          <form onSubmit={handleEnrollStudent} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Student Name</label>
              <input 
                type="text" 
                value={enrollmentStudent} 
                onChange={(e) => setEnrollmentStudent(e.target.value)}
                className="form-control"
                style={{ fontSize: '12px' }}
                required
              />
            </div>

            <div style={{ flex: 1 }}>
              <label className="form-label">Batch Target</label>
              <select 
                onChange={(e) => setEnrollmentBatch(db.batches.find(b => b.id === Number(e.target.value)))}
                className="form-control"
              >
                {db.batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>
              Enroll Student
            </button>
          </form>

          {/* Enrolments log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(db.enrolments || []).map(en => (
              <div key={en.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--xebia-border)', fontSize: '11px' }}>
                <span style={{ fontWeight: '600' }}>{en.studentName}</span>
                <span style={{ color: 'var(--text-muted)' }}>Enrolled in: {en.batchName}</span>
                <span className="badge badge-green" style={{ fontSize: '9px' }}>{en.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Notification templates and dispatcher */}
      <div className="glass-panel floating-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '16px' }} className="gradient-text">Notification Dispatcher</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Publish event alerts down Email, SMS, or WhatsApp pipelines. Uses JasperReports templates.
          </p>
        </div>

        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Message Channel</label>
            <select 
              value={notifyChannel} 
              onChange={(e) => setNotifyChannel(e.target.value)}
              className="form-control"
            >
              <option value="email">Email Adapter (SMTP / SSL)</option>
              <option value="whatsapp">WhatsApp Business API Client</option>
              <option value="sms">Sms Gateway (Twilio Provider)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Jasper Template ID</label>
            <select 
              value={notifyTemplate} 
              onChange={(e) => setNotifyTemplate(e.target.value)}
              className="form-control"
            >
              <option value="welcome_template">welcome_onboarding.jrxml</option>
              <option value="assessment_report">assessment_scorecard.jrxml</option>
              <option value="daily_digest">daily_progress_report.jrxml</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Custom Payload</label>
            <textarea 
              rows="3"
              value={notifyMsg}
              onChange={(e) => setNotifyMsg(e.target.value)}
              className="form-control"
              style={{ resize: 'none', fontSize: '12px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <Send size={14} /> Send Broadcast Alert
          </button>
        </form>
      </div>

    </div>
  );
}
