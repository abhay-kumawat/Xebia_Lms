/**
 * certificateService.js
 * Combined score check, certificate CRUD, and PDF generation trigger.
 * Certificate is issued when BOTH assignment AND quiz individually meet passing marks.
 */

const CERTS_KEY = 'xebia-lms-student-certificates';
const SUBMISSIONS_KEY = 'xebia-lms-submissions';
const ASSESSMENTS_KEY = 'xebia-lms-assessments';

// ─── Grade helper ─────────────────────────────────────────────────────────────

export function scoreToGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadCerts() {
  const raw = localStorage.getItem(CERTS_KEY);
  if (raw) { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

function saveCerts(list) {
  localStorage.setItem(CERTS_KEY, JSON.stringify(list));
}

// ─── Core: Check & Issue Certificate ─────────────────────────────────────────

/**
 * Check whether a student qualifies for a certificate for a given course/assignment.
 * Requires:
 *   - Assignment graded with score >= passingMarks
 *   - Quiz attempt with passed = true
 *   - (Optional) Both can be assignment-only if no quiz exists for the course
 *
 * @param {object} params
 * @param {string} params.studentEmail
 * @param {string} params.studentName
 * @param {string} params.enrollmentNo
 * @param {string} params.courseName
 * @param {string} params.assignmentTitle
 * @param {number} params.assignmentScore     0-100 percentage
 * @param {number} params.assignmentPassing   passing threshold (percentage)
 * @param {number|null} params.quizScore      null if no quiz
 * @param {number} params.quizPassing
 * @param {string} params.instructorName
 * @param {string} params.subject
 * @param {string} params.quizTitle
 * @param {string} params.letterGrade
 * @returns {{ issued: boolean, certificate: object|null, reason: string }}
 */
export function checkAndIssueCertificate(params) {
  const {
    studentEmail,
    studentName,
    enrollmentNo,
    courseName,
    assignmentTitle,
    assignmentScore,
    assignmentPassing,
    quizScore,
    quizPassing,
    instructorName = 'Priya Sharma',
    subject = 'Core Specialization',
    quizTitle = null,
    letterGrade = null
  } = params;

  // ── Check assignment ──────────────────────────────────────────
  if (assignmentScore === null || assignmentScore === undefined) {
    return { issued: false, certificate: null, reason: 'Assignment not yet graded.' };
  }
  const assignmentPassed = assignmentScore >= (assignmentPassing || 60);
  if (!assignmentPassed) {
    return { issued: false, certificate: null, reason: `Assignment score ${assignmentScore}% is below passing mark of ${assignmentPassing || 60}%.` };
  }

  // ── Check quiz (if exists) ────────────────────────────────────
  if (quizScore !== null && quizScore !== undefined) {
    const quizPassed = quizScore >= (quizPassing || 70);
    if (!quizPassed) {
      return { issued: false, certificate: null, reason: `Quiz score ${quizScore}% is below passing mark of ${quizPassing || 70}%.` };
    }
  }

  // ── Check if already issued ───────────────────────────────────
  const certs = loadCerts();
  const existing = certs.find(c =>
    c.studentEmail?.toLowerCase() === studentEmail?.toLowerCase() &&
    c.assignmentName?.toLowerCase() === assignmentTitle?.toLowerCase()
  );
  if (existing) {
    return { issued: false, certificate: existing, reason: 'Certificate already issued.' };
  }

  // ── Calculate final score ─────────────────────────────────────
  let finalPct;
  if (quizScore !== null && quizScore !== undefined) {
    finalPct = Math.round((assignmentScore * 0.6) + (quizScore * 0.4));
  } else {
    finalPct = assignmentScore;
  }
  const grade = letterGrade || scoreToGrade(finalPct);

  // ── Generate certificate ──────────────────────────────────────
  const abbr = courseName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  const certId = `XEB-${abbr}-${rand}`;

  const cert = {
    id: `cert-${Date.now()}`,
    certificateId: certId,
    studentName,
    studentEmail,
    enrollmentNo,
    courseName,
    assignmentName: assignmentTitle,
    quizName: quizTitle,
    subject,
    instructorName,
    completionDate: new Date().toISOString().split('T')[0],
    issuedAt: new Date().toISOString(),
    assignmentScore,
    quizScore,
    finalPercentage: finalPct,
    grade,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/verify-certificate?id=${certId}`)}`
  };

  certs.unshift(cert);
  saveCerts(certs);

  // Update the submission record with the certificate ID
  try {
    const subs = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
    const updatedSubs = subs.map(s => {
      if (
        s.assessmentTitle?.toLowerCase() === assignmentTitle?.toLowerCase() &&
        s.email?.toLowerCase() === studentEmail?.toLowerCase()
      ) {
        return { ...s, certificateId: certId };
      }
      return s;
    });
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updatedSubs));
  } catch (e) {
    console.warn('Failed to update submission with certificate ID', e);
  }

  return { issued: true, certificate: cert, reason: 'Certificate issued successfully!' };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/** Get all certificates for a student by email */
export function getCertificatesByEmail(email) {
  const certs = loadCerts();
  return certs.filter(c => c.studentEmail?.toLowerCase() === email?.toLowerCase());
}

/** Get a certificate by its unique ID (for verification) */
export function getCertificateByIdPublic(id) {
  const certs = loadCerts();
  return certs.find(c => c.certificateId === id || c.id === id) || null;
}

/** Alias for backward compatibility */
export function getCertificateById(id) {
  return getCertificateByIdPublic(id);
}

/** Get all certificates (admin/teacher view) */
export function getAllCertificates() {
  return loadCerts();
}

// ─── Certificate progress helper ─────────────────────────────────────────────

/**
 * Get a student's progress toward a certificate for a given assignment.
 * Returns what's complete, what's missing, and the current combined score.
 */
export function getCertificateProgress(studentEmail, assignmentTitle, quizTitle = null) {
  const certs = loadCerts();
  const existing = certs.find(c =>
    c.studentEmail?.toLowerCase() === studentEmail?.toLowerCase() &&
    c.assignmentName?.toLowerCase() === assignmentTitle?.toLowerCase()
  );
  if (existing) {
    return { status: 'issued', certificate: existing, progress: 100 };
  }

  const subs = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
  const assignmentSub = subs.find(s =>
    s.assessmentTitle?.toLowerCase() === assignmentTitle?.toLowerCase() &&
    s.email?.toLowerCase() === studentEmail?.toLowerCase() &&
    s.status === 'Graded'
  );

  const hasAssignment = !!assignmentSub;
  const assignmentScore = assignmentSub?.score || 0;
  const assignmentPassed = assignmentSub ? assignmentScore >= (
    JSON.parse(localStorage.getItem(ASSESSMENTS_KEY) || '[]')
      .find(a => a.title?.toLowerCase() === assignmentTitle?.toLowerCase())?.passingMarks || 60
  ) : false;

  // Check quiz from quizService attempts
  let quizPassed = false;
  let quizScore = null;
  if (quizTitle) {
    try {
      const attempts = JSON.parse(localStorage.getItem('xebia-lms-quiz-attempts') || '[]');
      const quizAttempt = attempts.find(a =>
        a.quizTitle?.toLowerCase() === quizTitle?.toLowerCase() &&
        a.email?.toLowerCase() === studentEmail?.toLowerCase()
      );
      if (quizAttempt) {
        quizScore = quizAttempt.percentage;
        quizPassed = quizAttempt.passed;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  let progress = 0;
  if (hasAssignment && assignmentPassed) progress += quizTitle ? 50 : 100;
  if (quizTitle && quizPassed) progress += 50;

  return {
    status: 'in-progress',
    certificate: null,
    progress,
    assignmentDone: hasAssignment,
    assignmentPassed,
    assignmentScore,
    quizDone: quizScore !== null,
    quizPassed,
    quizScore
  };
}
