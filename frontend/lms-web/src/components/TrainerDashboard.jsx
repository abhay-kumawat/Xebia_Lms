import React, { useState } from 'react';
import { Plus, Play, CheckCircle, Database, Film, FilePlus } from 'lucide-react';

export default function TrainerDashboard({ db, setDb, triggerLog }) {
  // Course creation state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDuration, setCourseDuration] = useState('8 hours');
  
  // Media transcoding state
  const [transcodeJobs, setTranscodeJobs] = useState([
    { id: 101, filename: 'intro_generative_ai.mp4', status: 'Uploaded', resolution: 'Pending', progress: 0 },
    { id: 102, filename: 'kubernetes_architecture_deepdive.mov', status: 'Transcoding', resolution: '720p HLS', progress: 45 },
    { id: 103, filename: 'scrum_mastery_foundations.mp4', status: 'Completed', resolution: '1080p HLS', progress: 100 }
  ]);

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    const newCourse = {
      id: Date.now(),
      title: courseTitle,
      duration: courseDuration,
      progress: 0
    };

    setDb({
      ...db,
      courses: [...db.courses, newCourse]
    });
    setCourseTitle('');
    triggerLog('course', `POST /api/v1/courses - Created Course: "${newCourse.title}"`, 201);
  };

  const runTranscodeJob = (jobId) => {
    triggerLog('media', `PUT /api/v1/media/transcode/trigger/${jobId} - Initializing FFmpeg process on node`, 202);
    
    // Simulate progression of job status
    setTranscodeJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === jobId) {
          return { ...job, status: 'Transcoding', resolution: '1080p/720p/480p Adaptive HLS', progress: 10 };
        }
        return job;
      })
    );

    // Mock progress intervals
    const interval = setInterval(() => {
      setTranscodeJobs(prevJobs => {
        const target = prevJobs.find(j => j.id === jobId);
        if (!target) {
          clearInterval(interval);
          return prevJobs;
        }

        if (target.progress >= 100) {
          clearInterval(interval);
          triggerLog('media', `Kafka Event Producer: lms-media-transcode-complete -> Updated VideoAsset metadata & generated S3 links`, 200);
          return prevJobs.map(j => j.id === jobId ? { ...j, status: 'Completed', progress: 100 } : j);
        }

        return prevJobs.map(j => j.id === jobId ? { ...j, progress: Math.min(target.progress + 30, 100) } : j);
      });
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* Course & Content Compiler panel */}
      <div className="glass-panel floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '16px' }} className="gradient-text">Course Content Compiler</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Publish new lectures, syllabi, or learning items directly to the lms-course-service databases.
          </p>
        </div>

        <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Title</label>
            <input 
              type="text" 
              placeholder="e.g. LLMOps & Production Deployment" 
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assigned Duration</label>
              <select 
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                className="form-control"
              >
                <option value="4 hours">4 hours</option>
                <option value="8 hours">8 hours</option>
                <option value="16 hours">16 hours</option>
                <option value="32 hours">32 hours</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">DB Target</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--xebia-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <Database size={14} color="var(--accent-green)" />
                PostgreSQL (Live)
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Publish Course Syllabus
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <h5 style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Published Modules Checklist</h5>
          {db.courses.map(course => (
            <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
              <span>{course.title}</span>
              <span className="badge badge-velvet">{course.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Media Transcoding Engine console */}
      <div className="glass-panel floating-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '16px' }} className="gradient-text">Media Transcoding Queue</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Monitor and process raw video file inputs into HLS formats for adaptive streaming.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {transcodeJobs.map(job => (
            <div 
              key={job.id} 
              style={{ 
                padding: '16px', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--xebia-border)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Film size={16} color={job.status === 'Completed' ? 'var(--accent-green)' : 'var(--accent-cyan)'} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{job.filename}</span>
                </div>
                <span className={`badge ${
                  job.status === 'Completed' ? 'badge-green' : 
                  job.status === 'Transcoding' ? 'badge-orange' : 'badge-velvet'
                }`}>
                  {job.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Format: {job.resolution}</span>
                <span>Job ID: #{job.id}</span>
              </div>

              {/* Progress bar container */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${job.progress}%`, 
                  height: '100%', 
                  background: job.status === 'Completed' ? 'var(--accent-green)' : 'var(--xebia-velvet-light)',
                  transition: 'width 0.3s ease-out'
                }}></div>
              </div>

              {job.status !== 'Completed' && job.status !== 'Transcoding' && (
                <button 
                  onClick={() => runTranscodeJob(job.id)} 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'flex-start', fontSize: '11px', padding: '6px 12px' }}
                >
                  <Play size={12} /> Trigger FFmpeg Transcoding
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
