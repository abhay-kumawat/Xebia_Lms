import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle, MessageSquare, Send, BookOpen, Clock, 
  Award, Download, Star, FileText, TrendingUp, Edit3, BarChart2, Lock
} from 'lucide-react';

export default function StudentDashboard({ db, setDb, triggerLog }) {
  const [selectedCourse, setSelectedCourse] = useState(db.courses[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  
  // New Interactive States
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'analytics'
  const [studyTime, setStudyTime] = useState(14.5); // Mock hours spent

  // Simulate video viewing progress updates & increment study time
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setStudyTime(prev => Number((prev + 0.05).toFixed(2)));
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            triggerLog(
              'media',
              `Completed playback of module: ${selectedCourse.title}. Saved viewing progress to Database.`,
              200
            );
            
            const updated = db.courses.map(c => 
              c.id === selectedCourse.id ? { ...c, progress: 100 } : c
            );
            setDb({ ...db, courses: updated });
            return 100;
          }
          const next = prev + 5;
          if (next % 25 === 0) {
            triggerLog(
              'media',
              `POST /api/v1/media/progress - Syncing progress (${next}%) for Course ID: ${selectedCourse.id}`,
              200
            );
          }
          return next;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedCourse, db, setDb]);

  const handlePlayVideo = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      triggerLog(
        'media',
        `GET /api/v1/media/stream/hls?courseId=${selectedCourse.id} - Requesting signed CloudFront URL`,
        200
      );
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now(),
      courseId: selectedCourse.id,
      user: 'Abhay Kumawat (Student)',
      content: commentInput,
      timestamp: 'Just now'
    };

    const updatedComments = [...(db.comments || []), newComment];
    setDb({ ...db, comments: updatedComments });
    setCommentInput('');

    triggerLog(
      'engagement',
      `POST /api/v1/engagement/comments - Course ID ${selectedCourse.id}: "${newComment.content.substring(0, 20)}..."`,
      201
    );
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    const questions = db.assessments.filter(q => q.courseId === selectedCourse.id);
    
    questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const percent = Math.round((score / questions.length) * 100);
    setQuizScore(percent);

    triggerLog(
      'assessment',
      `POST /api/v1/assessments/submissions - Submitted Quiz. Score: ${score}/${questions.length} (${percent}%)`,
      200
    );

    setTimeout(() => {
      triggerLog(
        'notification',
        `Kafka event consumer: lms-assessment-submitted -> Generated certificate/score report, dispatched SMTP welcome mail.`,
        200
      );
    }, 1500);
  };

  const handleRateCourse = (stars) => {
    setRating(stars);
    triggerLog(
      'engagement',
      `POST /api/v1/engagement/ratings - Registered a ${stars}-star rating for Course ID ${selectedCourse.id}`,
      200
    );
  };

  const handleDownloadResource = (resName) => {
    triggerLog(
      'gateway',
      `GET /api/v1/courses/${selectedCourse.id}/resources/${resName} - Mapping object storage signed link`,
      200
    );
    triggerLog(
      'course',
      `Downloading resource ${resName} from secure multi-tenant static assets path.`,
      200
    );
  };

  const handleDownloadNotes = () => {
    triggerLog(
      'gateway',
      `POST /api/v1/reporting/generator/notes - Triggering JasperReports compiler`,
      200
    );
    triggerLog(
      'notification',
      `PDF generation completed. Dispatched notes report download.`,
      200
    );

    // Simple client side text download
    const element = document.createElement("a");
    const file = new Blob([notes], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedCourse.title.replace(/\s+/g, '_')}_StudyNotes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const currentCourseComments = (db.comments || []).filter(c => c.courseId === selectedCourse.id);
  const currentCourseQuiz = db.assessments.filter(q => q.courseId === selectedCourse.id);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
      
      {/* Left Column: Learning Journeys, Badges & Study Analytics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Course List List */}
        <div className="glass-panel floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '15px', borderBottom: '1px solid var(--xebia-border)', paddingBottom: '10px' }} className="gradient-text">
            My Learning Journeys
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {db.courses.map((course) => {
              const isSelected = selectedCourse.id === course.id;
              return (
                <div 
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setIsPlaying(false);
                    setProgress(course.progress || 0);
                    setQuizScore(null);
                    setQuizAnswers({});
                    setRating(0);
                    triggerLog('course', `GET /api/v1/courses/${course.id} - Retrieved course modules`, 200);
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(131, 27, 132, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isSelected ? 'var(--xebia-velvet)' : 'rgba(255,255,255,0.05)'}`,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                    {course.title}
                  </h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={12} /> {course.duration || '6 hours'}
                    </span>
                    <span>{course.progress || 0}% Done</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${course.progress || 0}%`, height: '100%', background: 'var(--accent-green)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Credentials / Badges Panel */}
        <div className="glass-panel floating-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '14px', borderBottom: '1px solid var(--xebia-border)', paddingBottom: '8px' }} className="gradient-text">
            Earned Credentials
          </h4>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-around', padding: '5px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(0, 245, 255, 0.1)', border: '2px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justify: 'center', boxShadow: '0 0 10px rgba(0,245,255,0.2)' }}>
                <Award size={22} color="var(--accent-cyan)" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>GenAI Spec</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(57, 255, 20, 0.1)', border: '2px solid var(--accent-green)', display: 'flex', alignItems: 'center', justify: 'center', boxShadow: '0 0 10px rgba(57,255,20,0.2)' }}>
                <Award size={22} color="var(--accent-green)" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>DevOps Practitioner</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4, textAlign: 'center' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                <Lock size={18} color="var(--text-muted)" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Agile Leader</span>
            </div>
          </div>
        </div>

        {/* Study Analytics Mini Graphic */}
        <div className="glass-panel floating-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '14px', borderBottom: '1px solid var(--xebia-border)', paddingBottom: '8px' }} className="gradient-text">
            Analytics Overview
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} color="var(--accent-cyan)" /> Study Hours
              </span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>{studyTime} hrs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={12} color="var(--accent-green)" /> Avg Score
              </span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>92.4%</span>
            </div>

            {/* Custom SVG Line Graph representation */}
            <div style={{ width: '100%', height: '50px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', padding: '5px', overflow: 'hidden' }}>
              <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,10 L100,30 L0,30 Z" fill="url(#chartGrad)" />
                <path d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,10" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" />
                <circle cx="30" cy="18" r="1.5" fill="var(--accent-green)" />
                <circle cx="60" cy="5" r="1.5" fill="var(--accent-green)" />
                <circle cx="90" cy="12" r="1.5" fill="var(--accent-green)" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Player, Resources, Notepad & Forums */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Split: Video Player & Course Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          
          {/* HLS Video Player */}
          <div className="glass-panel floating-delay-1" style={{ padding: '0px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="video-player-container">
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(45deg, #150027 0%, #2a004e 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{selectedCourse.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '380px', marginBottom: '20px' }}>
                  HLS Stream Source: `/media/stream/${selectedCourse.id}/master.m3u8`
                </p>
                
                {isPlaying && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '13px' }}>
                    <Clock size={14} className="animate-spin" /> Streaming chunk segments...
                  </div>
                )}
              </div>

              {/* Progress Play overlay */}
              <div className="video-overlay-play" onClick={handlePlayVideo}>
                <button className="btn btn-primary" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: '0' }}>
                  {isPlaying ? <span style={{fontSize: '11px'}}>PAUSE</span> : <Play size={20} style={{ marginLeft: '3px' }} />}
                </button>
              </div>

              <div className="video-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 style={{ fontSize: '14px', margin: 0 }}>HLS.js Simulated Player</h5>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Adaptive Bitrates: 1080p | 720p | 480p</span>
              </div>
              <span className="badge badge-velvet" style={{ fontSize: '10px' }}>Progress: {Math.round(progress)}%</span>
            </div>
          </div>

          {/* Course Details, Ratings & Downloads */}
          <div className="glass-panel floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '15px' }} className="gradient-text">Resource Vault</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Securely generate and download certificates or files mapped to your course metadata.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div onClick={() => handleDownloadResource('syllabus.pdf')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--xebia-border)', cursor: 'pointer' }} className="btn-secondary">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <FileText size={14} color="var(--accent-cyan)" /> Syllabus & Outline.pdf
                  </span>
                  <Download size={12} color="var(--text-secondary)" />
                </div>
                <div onClick={() => handleDownloadResource('slides.ppt')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--xebia-border)', cursor: 'pointer' }} className="btn-secondary">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <FileText size={14} color="var(--accent-green)" /> Lecture Slides.pptx
                  </span>
                  <Download size={12} color="var(--text-secondary)" />
                </div>
                <div onClick={() => handleDownloadResource('cheatsheet.pdf')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--xebia-border)', cursor: 'pointer' }} className="btn-secondary">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <FileText size={14} color="var(--accent-orange)" /> Reference Cheatsheet.pdf
                  </span>
                  <Download size={12} color="var(--text-secondary)" />
                </div>
              </div>
            </div>

            {/* Course Rating Option */}
            <div style={{ borderTop: '1px solid var(--xebia-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Rate this curriculum:</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    color={star <= rating ? 'var(--accent-orange)' : 'var(--text-muted)'}
                    fill={star <= rating ? 'var(--accent-orange)' : 'transparent'}
                    style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                    onClick={() => handleRateCourse(star)}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Lower Row: Q&A forum, Assessment Quiz & Personal Notepad Tab block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          
          {/* Discussion board */}
          <div className="glass-panel floating-widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '14px', borderBottom: '1px solid var(--xebia-border)', paddingBottom: '8px' }}>
              Q&A Discussion Board
            </h4>

            <div style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentCourseComments.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  No discussions yet. Start the conversation below!
                </p>
              ) : (
                currentCourseComments.map(c => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{c.user}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{c.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Ask a technical question..." 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="form-control"
                style={{ fontSize: '12px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Tabbed Panel: Assessment Quiz OR Notepad */}
          <div className="glass-panel floating-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--xebia-border)', paddingBottom: '8px' }}>
              <span 
                onClick={() => setActiveTab('quiz')}
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  color: activeTab === 'quiz' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'quiz' ? '2px solid var(--accent-cyan)' : 'none',
                  paddingBottom: '6px'
                }}
              >
                Assessment Quiz
              </span>
              <span 
                onClick={() => setActiveTab('notes')}
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  color: activeTab === 'notes' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'notes' ? '2px solid var(--accent-cyan)' : 'none',
                  paddingBottom: '6px'
                }}
              >
                Study Notepad
              </span>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'quiz' ? (
              /* Quiz Section */
              currentCourseQuiz.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontSize: '12px' }}>
                  No assessments compiled for this module yet.
                </div>
              ) : quizScore !== null ? (
                <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={48} color="var(--accent-green)" />
                  <h5 style={{ fontSize: '15px' }}>Quiz Submission Received!</h5>
                  <span className="badge badge-green" style={{ fontSize: '14px', padding: '6px 16px' }}>
                    Score: {quizScore}%
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Grading event sent to assessment engine. Report card sent to registry.
                  </p>
                  <button className="btn btn-secondary" onClick={() => setQuizScore(null)} style={{ fontSize: '12px' }}>
                    Retake Assessment
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '200px' }}>
                  {currentCourseQuiz.map((q, idx) => (
                    <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '500' }}>Q{idx + 1}: {q.question}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {q.options.map(opt => (
                          <label 
                            key={opt}
                            style={{
                              padding: '8px',
                              background: 'rgba(255,255,255,0.02)',
                              border: `1px solid ${quizAnswers[q.id] === opt ? 'var(--xebia-velvet)' : 'rgba(255,255,255,0.05)'}`,
                              borderRadius: '6px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <input 
                              type="radio" 
                              name={`quiz-${q.id}`} 
                              value={opt}
                              checked={quizAnswers[q.id] === opt}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                              style={{ accentColor: 'var(--xebia-velvet-light)' }}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', marginTop: '10px' }} disabled={Object.keys(quizAnswers).length < currentCourseQuiz.length}>
                    Submit Answers
                  </button>
                </form>
              )
            ) : (
              /* Notes Notepad Section */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down key points, model formulas, or microservices topologies... notes will save locally."
                  className="form-control"
                  style={{ 
                    flex: 1, 
                    minHeight: '120px', 
                    fontSize: '12px', 
                    fontFamily: 'monospace', 
                    resize: 'none', 
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--xebia-border)'
                  }}
                />
                <button 
                  onClick={handleDownloadNotes}
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', fontSize: '11px', padding: '6px 12px' }}
                  disabled={!notes.trim()}
                >
                  <Edit3 size={12} /> Download Notes (.TXT)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
