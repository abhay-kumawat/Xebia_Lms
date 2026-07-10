import api from './api';

const ASSESSMENTS_KEY = 'xebia-lms-assessments';
const SUBMISSIONS_KEY = 'xebia-lms-submissions';
const QUIZZES_KEY = 'xebia-lms-quizzes';
const DRAFTS_KEY = 'xebia-lms-drafts';

// ─────────────────────────────────────────────
// Rich initial mock data WITH questions arrays
// ─────────────────────────────────────────────
const INITIAL_ASSESSMENTS = [
  {
    id: 1,
    title: 'GenAI Core Concepts',
    type: 'Quiz',
    course: 'Generative AI Foundations',
    subject: 'Artificial Intelligence',
    teacherName: 'Priya Sharma',
    difficulty: 'Medium',
    totalPoints: 100,
    passingMarks: 70,
    questionsCount: 5,
    dueDate: '2026-07-15',
    description: 'Test your foundational understanding of Generative AI concepts including LLMs, prompt engineering, and RAG pipelines.',
    instructions: 'Read each question carefully. For MCQ, select the best option. For short answers, keep responses under 100 words.',
    status: 'Published',
    questions: [
      {
        id: 'q1-1',
        type: 'MCQ',
        prompt: 'What does LLM stand for in the context of Generative AI?',
        marks: 20,
        required: true,
        options: ['Large Language Model', 'Long Linear Module', 'Layered Learning Method', 'Low Latency Machine']
      },
      {
        id: 'q1-2',
        type: 'MCQ',
        prompt: 'Which architecture is the foundation of most modern LLMs?',
        marks: 20,
        required: true,
        options: ['Transformer', 'RNN', 'LSTM', 'CNN']
      },
      {
        id: 'q1-3',
        type: 'True/False',
        prompt: 'Prompt engineering can significantly affect the quality of LLM outputs without changing model weights.',
        marks: 20,
        required: true,
        options: ['True', 'False']
      },
      {
        id: 'q1-4',
        type: 'Short Answer',
        prompt: 'Explain in 2-3 sentences what RAG (Retrieval-Augmented Generation) is and why it is useful.',
        marks: 20,
        required: true
      },
      {
        id: 'q1-5',
        type: 'MCQ',
        prompt: 'Which of the following best describes "hallucination" in LLMs?',
        marks: 20,
        required: true,
        options: [
          'The model generating factually incorrect but confident-sounding responses',
          'The model refusing to respond to a query',
          'Slow inference speeds due to model size',
          'Training on synthetic data'
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Docker Container Lifecycle',
    type: 'Quiz',
    course: 'Docker & Kubernetes Mastery',
    subject: 'DevOps Engineering',
    teacherName: 'Ananya Desai',
    difficulty: 'Medium',
    totalPoints: 100,
    passingMarks: 65,
    questionsCount: 5,
    dueDate: '2026-07-20',
    description: 'Assess your knowledge of Docker container lifecycle management, networking, and volumes.',
    instructions: 'Complete all questions. Coding question requires valid Docker CLI commands.',
    status: 'Published',
    questions: [
      {
        id: 'q2-1',
        type: 'MCQ',
        prompt: 'Which command stops and removes a running Docker container?',
        marks: 20,
        required: true,
        options: ['docker rm -f <id>', 'docker stop <id>', 'docker kill <id>', 'docker delete <id>']
      },
      {
        id: 'q2-2',
        type: 'True/False',
        prompt: 'Docker volumes persist data even after a container is removed.',
        marks: 20,
        required: true,
        options: ['True', 'False']
      },
      {
        id: 'q2-3',
        type: 'Short Answer',
        prompt: 'What is the difference between a Docker image and a Docker container?',
        marks: 20,
        required: true
      },
      {
        id: 'q2-4',
        type: 'MCQ',
        prompt: 'Which Docker network driver allows containers on different hosts to communicate?',
        marks: 20,
        required: true,
        options: ['Overlay', 'Bridge', 'Host', 'Macvlan']
      },
      {
        id: 'q2-5',
        type: 'Coding',
        prompt: 'Write a Dockerfile to containerize a Node.js application. The app entry point is server.js and runs on port 3000.',
        marks: 20,
        required: true
      }
    ]
  },
  {
    id: 3,
    title: 'Spring Boot REST Endpoints',
    type: 'Assignment',
    course: 'Spring Boot Enterprise APIs',
    subject: 'Backend Development',
    teacherName: 'Siddharth Sen',
    difficulty: 'Hard',
    totalPoints: 100,
    passingMarks: 60,
    questionsCount: 4,
    dueDate: '2026-07-18',
    description: 'Build and document a set of RESTful endpoints using Spring Boot. Demonstrate understanding of JPA, validation, and error handling.',
    instructions: 'Submit your GitHub repository URL in Q1. Answer all theory questions. Code must be runnable.',
    status: 'Published',
    rubrics: [
      { name: 'Code Quality & Structure', points: 30 },
      { name: 'API Design & REST Standards', points: 30 },
      { name: 'Error Handling & Validation', points: 20 },
      { name: 'Documentation & README', points: 20 }
    ],
    questions: [
      {
        id: 'q3-1',
        type: 'Short Answer',
        prompt: 'Paste your GitHub repository URL for the Spring Boot REST API project.',
        marks: 10,
        required: true
      },
      {
        id: 'q3-2',
        type: 'Long Answer',
        prompt: 'Describe the design decisions you made for your API. Include how you handled authentication, validation, and error responses. Minimum 150 words.',
        marks: 30,
        required: true
      },
      {
        id: 'q3-3',
        type: 'Coding',
        prompt: 'Write a Spring Boot controller method that handles a POST /api/users request with JSON body validation. Include annotations and exception handler.',
        marks: 40,
        required: true
      },
      {
        id: 'q3-4',
        type: 'MCQ',
        prompt: 'Which Spring annotation marks a class as a REST controller that automatically serializes return values to JSON?',
        marks: 20,
        required: true,
        options: ['@RestController', '@Controller', '@Service', '@Repository']
      }
    ]
  },
  {
    id: 4,
    title: 'Data Science DataFrame Ops',
    type: 'Quiz',
    course: 'Data Science with Pandas',
    subject: 'Data Engineering',
    teacherName: 'Vikram Nair',
    difficulty: 'Easy',
    totalPoints: 50,
    passingMarks: 35,
    questionsCount: 4,
    dueDate: '2026-07-12',
    description: 'Quick knowledge check on Pandas DataFrame operations and data manipulation techniques.',
    instructions: 'All questions are mandatory. Show understanding of pandas syntax and output.',
    status: 'Published',
    questions: [
      {
        id: 'q4-1',
        type: 'MCQ',
        prompt: 'Which pandas method is used to read a CSV file into a DataFrame?',
        marks: 10,
        required: true,
        options: ['pd.read_csv()', 'pd.load_csv()', 'pd.open_csv()', 'pd.import_csv()']
      },
      {
        id: 'q4-2',
        type: 'True/False',
        prompt: 'The pandas groupby() method returns a DataFrameGroupBy object, not a DataFrame directly.',
        marks: 10,
        required: true,
        options: ['True', 'False']
      },
      {
        id: 'q4-3',
        type: 'Coding',
        prompt: 'Write Python code using pandas to filter rows where column "salary" > 50000 and sort by "name" ascending.',
        marks: 20,
        required: true
      },
      {
        id: 'q4-4',
        type: 'Short Answer',
        prompt: 'What is the difference between df.loc[] and df.iloc[] in pandas?',
        marks: 10,
        required: true
      }
    ]
  }
];

const INITIAL_SUBMISSIONS = [
  {
    id: 101,
    studentName: 'Abhay Kumawat',
    enrollmentNo: 'XEB-2026-081',
    email: 'abhay.kumawat@xebia.com',
    assessmentTitle: 'Docker Container Lifecycle',
    type: 'Quiz',
    submittedDate: '2026-07-07',
    status: 'Graded',
    score: 92,
    letterGrade: 'A+',
    feedback: 'Excellent understanding of container lifecycle. Great code in the Dockerfile question.',
    approved: true
  },
  {
    id: 102,
    studentName: 'Neha Patel',
    enrollmentNo: 'XEB-2026-112',
    email: 'neha.patel@xebia.com',
    assessmentTitle: 'Docker Container Lifecycle',
    type: 'Quiz',
    submittedDate: '2026-07-06',
    status: 'Graded',
    score: 87,
    letterGrade: 'A',
    feedback: 'Good understanding overall.',
    approved: true
  },
  {
    id: 103,
    studentName: 'Aarav Sharma',
    enrollmentNo: 'XEB-2026-095',
    email: 'aarav.sharma@xebia.com',
    assessmentTitle: 'Docker Container Lifecycle',
    type: 'Quiz',
    submittedDate: '2026-07-06',
    status: 'Graded',
    score: 82,
    letterGrade: 'A',
    feedback: 'Solid work.',
    approved: true
  },
  {
    id: 104,
    studentName: 'Abhay Kumawat',
    enrollmentNo: 'XEB-2026-081',
    email: 'abhay.kumawat@xebia.com',
    assessmentTitle: 'Spring Boot REST Endpoints',
    type: 'Assignment',
    submittedDate: '2026-07-07',
    status: 'Pending Evaluation',
    score: null,
    answers: {
      'q3-1': 'https://github.com/abhay-kumawat/spring-boot-api',
      'q3-2': 'I designed the API following REST standards with proper HTTP status codes. For authentication I used JWT tokens with Spring Security. Bean validation via @Valid annotation handles input constraints. For error handling I created a GlobalExceptionHandler with @ControllerAdvice that returns standardized error response DTOs with timestamp, message, and path fields.',
      'q3-3': '@RestController\n@RequestMapping("/api/users")\npublic class UserController {\n  @Autowired private UserService service;\n\n  @PostMapping\n  public ResponseEntity<User> create(@Valid @RequestBody UserRequest req) {\n    return ResponseEntity.status(201).body(service.create(req));\n  }\n\n  @ExceptionHandler(MethodArgumentNotValidException.class)\n  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {\n    return ResponseEntity.badRequest().body(new ErrorResponse("Validation failed", e.getMessage()));\n  }\n}',
      'q3-4': '@RestController'
    }
  },
  {
    id: 105,
    studentName: 'Rohan Das',
    enrollmentNo: 'XEB-2026-204',
    email: 'rohan.das@xebia.com',
    assessmentTitle: 'Spring Boot REST Endpoints',
    type: 'Assignment',
    submittedDate: '2026-07-05',
    status: 'Graded',
    score: 88,
    letterGrade: 'A',
    feedback: 'Very good implementation. Minor improvements needed in error handling.',
    approved: true
  }
];

// ─────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────
function initLocalStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(ASSESSMENTS_KEY)) {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(INITIAL_ASSESSMENTS));
  }
  if (!localStorage.getItem(SUBMISSIONS_KEY)) {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
  }
}

initLocalStorage();

// ─────────────────────────────────────────────
// CRUD: Assessments
// ─────────────────────────────────────────────

/** Fetch all assessments */
export async function getAssessments() {
  try {
    const res = await api.get('/assessments');
    const data = res.data.data || [];
    if (data.length > 0) {
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch assessments from backend, using localStorage fallback:', err);
  }
  const local = localStorage.getItem(ASSESSMENTS_KEY);
  return local ? JSON.parse(local) : INITIAL_ASSESSMENTS;
}

/** Create a new assessment */
export async function createAssessment(assessment) {
  const local = localStorage.getItem(ASSESSMENTS_KEY);
  const list = local ? JSON.parse(local) : INITIAL_ASSESSMENTS;
  const newAssessment = { ...assessment, id: assessment.id || Date.now() };
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify([newAssessment, ...list]));
  try {
    const res = await api.post('/assessments', assessment);
    return res.data.data;
  } catch (err) {
    console.warn('Failed to create assessment in backend, saved locally:', err);
    return newAssessment;
  }
}

/** Update an assessment */
export async function updateAssessment(id, updatedData) {
  const local = localStorage.getItem(ASSESSMENTS_KEY);
  let updatedObj = null;
  if (local) {
    const list = JSON.parse(local);
    const updated = list.map(item => {
      if (item.id === Number(id) || item.id === id) {
        updatedObj = { ...item, ...updatedData };
        return updatedObj;
      }
      return item;
    });
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
  }
  return updatedObj;
}

/** Delete an assessment */
export async function deleteAssessment(id) {
  const local = localStorage.getItem(ASSESSMENTS_KEY);
  if (local) {
    const list = JSON.parse(local);
    const updated = list.filter(item => item.id !== Number(id) && item.id !== id);
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
  }
  try {
    await api.delete(`/assessments/${id}`);
  } catch (err) {
    console.warn('Failed to delete assessment from backend, deleted locally', err);
  }
}

// ─────────────────────────────────────────────
// CRUD: Submissions
// ─────────────────────────────────────────────

/** Fetch all student submissions */
export async function getSubmissions() {
  try {
    const res = await api.get('/assessments/submissions');
    const data = res.data.data || [];
    if (data.length > 0) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch submissions from backend, using localStorage fallback:', err);
  }
  const local = localStorage.getItem(SUBMISSIONS_KEY);
  return local ? JSON.parse(local) : INITIAL_SUBMISSIONS;
}

/** Submit student quiz/assignment work */
export async function createSubmission(submission) {
  const local = localStorage.getItem(SUBMISSIONS_KEY);
  const list = local ? JSON.parse(local) : INITIAL_SUBMISSIONS;

  // Remove any existing draft for this student+assessment
  const filtered = list.filter(sub => {
    const sameAssessment = sub.assessmentTitle?.toLowerCase() === submission.assessmentTitle?.toLowerCase();
    const sameEmail = sub.email?.toLowerCase() === submission.email?.toLowerCase();
    // If there's an existing draft, replace it. Otherwise keep all entries.
    if (sameAssessment && sameEmail && sub.status === 'Draft') return false;
    return true;
  });

  const newSubmission = {
    ...submission,
    id: submission.id || Date.now(),
    submittedDate: submission.submittedDate || new Date().toISOString().split('T')[0],
    status: submission.status || 'Pending Evaluation',
    score: submission.score !== undefined ? submission.score : null
  };
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([newSubmission, ...filtered]));

  // Also clear draft if this is a final submission
  if (submission.status !== 'Draft') {
    clearDraft(submission.email, submission.assessmentTitle);
  }

  try {
    const res = await api.post('/assessments/submissions', newSubmission);
    return res.data.data;
  } catch (err) {
    console.warn('Failed to post submission to backend, saved locally:', err);
    return newSubmission;
  }
}

// ─────────────────────────────────────────────
// Draft persistence helpers
// ─────────────────────────────────────────────

/** Save student answers as draft (keyed by email + assessmentId) */
export function saveDraft(email, assessmentId, answers) {
  const draftKey = `${DRAFTS_KEY}-${email}-${assessmentId}`;
  localStorage.setItem(draftKey, JSON.stringify({ answers, savedAt: new Date().toISOString() }));
}

/** Retrieve a saved draft */
export function getDraft(email, assessmentId) {
  const draftKey = `${DRAFTS_KEY}-${email}-${assessmentId}`;
  const raw = localStorage.getItem(draftKey);
  if (raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return null;
}

/** Clear a draft after submission */
export function clearDraft(email, assessmentTitle) {
  // Clear all draft keys for this student + assessment
  Object.keys(localStorage)
    .filter(k => k.startsWith(`${DRAFTS_KEY}-${email}`))
    .forEach(k => localStorage.removeItem(k));
}

// ─────────────────────────────────────────────
// Grading
// ─────────────────────────────────────────────

/**
 * Grade a student's submission.
 * Certificate is only generated if score >= passingMarks for the assessment.
 */
export async function gradeSubmission(submissionId, score, feedback = '', letterGrade = '', approved = true, questionScores = {}) {
  const local = localStorage.getItem(SUBMISSIONS_KEY);
  let gradedSub = null;

  if (local) {
    const list = JSON.parse(local);
    const updated = list.map(sub => {
      if (sub.id === Number(submissionId) || sub.id === submissionId) {
        gradedSub = {
          ...sub,
          status: approved ? 'Graded' : 'Rejected',
          score: Number(score),
          feedback,
          letterGrade,
          questionScores,
          approved
        };
        return gradedSub;
      }
      return sub;
    });
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  }

  // ── Certificate generation ──────────────────────────────────
  if (gradedSub && gradedSub.status === 'Graded' && approved) {
    // Find the assessment to get passingMarks
    const assessments = JSON.parse(localStorage.getItem(ASSESSMENTS_KEY) || '[]');
    const assessment = assessments.find(a =>
      a.title.toLowerCase() === gradedSub.assessmentTitle?.toLowerCase()
    );
    const passingMarks = assessment?.passingMarks ?? 60;
    const passed = Number(score) >= passingMarks;

    if (passed) {
      const courseMap = {
        'Spring Boot REST Endpoints': 'Spring Boot Enterprise APIs',
        'Docker Container Lifecycle': 'Docker & Kubernetes Mastery',
        'GenAI Core Concepts': 'Generative AI Foundations',
        'Data Science DataFrame Ops': 'Data Science with Pandas',
        'Xebia Portal Orientation Submission': 'Xebia Academy Portal',
        'Course Launch Readiness Checklist': 'Xebia Academy Portal',
        'Capstone Project Submission Plan': 'Xebia Academy Portal'
      };
      const courseName = courseMap[gradedSub.assessmentTitle] || assessment?.course || 'Enterprise Specialization';
      const teacherName = assessment?.teacherName || 'Priya Sharma';
      const subject = assessment?.subject || 'Core Specialization';

      const certsKey = 'xebia-lms-student-certificates';
      let certsList = [];
      try {
        const localCerts = localStorage.getItem(certsKey);
        certsList = localCerts ? JSON.parse(localCerts) : [];
      } catch (e) {
        console.error(e);
        certsList = [];
      }

      const emailKey = gradedSub.email || 'abhay.kumawat@xebia.com';

      // Check if certificate already exists for this submission
      const hasCert = certsList.some(c =>
        c.assignmentName?.toLowerCase() === gradedSub.assessmentTitle?.toLowerCase() &&
        c.studentEmail?.toLowerCase() === emailKey.toLowerCase()
      );

      if (!hasCert) {
        const initials = courseName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const certId = `XEB-${initials}-${randNum}`;
        const newCert = {
          id: 'cert-' + Date.now(),
          courseName,
          assignmentName: gradedSub.assessmentTitle,
          subject,
          completionDate: new Date().toISOString().split('T')[0],
          instructorName: teacherName,
          certificateId: certId,
          thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80',
          studentName: gradedSub.studentName,
          studentEmail: emailKey,
          marksObtained: Number(score),
          grade: letterGrade || 'A',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('http://localhost:5173/verify-certificate?id=' + certId)}`
        };
        certsList.unshift(newCert);
        localStorage.setItem(certsKey, JSON.stringify(certsList));

        // Store certId back on the submission so the student can access it
        const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
        const withCert = submissions.map(s =>
          (s.id === Number(submissionId) || s.id === submissionId)
            ? { ...s, certificateId: certId }
            : s
        );
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(withCert));
      }
    }
  }

  try {
    const res = await api.put(`/assessments/submissions/${submissionId}/grade?score=${score}`);
    return res.data.data;
  } catch (err) {
    console.warn(`Failed to update grading on backend for ${submissionId}, graded locally:`, err);
    return gradedSub || { id: submissionId, score, status: approved ? 'Graded' : 'Rejected' };
  }
}

// ─────────────────────────────────────────────
// Quizzes (Excel-imported)
// ─────────────────────────────────────────────

/** Get imported Excel quizzes */
export async function getQuizzes() {
  try {
    const res = await api.get('/quizzes');
    const list = res.data.data?.quizzes || [];
    if (list.length > 0) {
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Failed to fetch quizzes from backend, using localStorage:', err);
  }
  const local = localStorage.getItem(QUIZZES_KEY);
  return local ? JSON.parse(local) : [];
}

// ─────────────────────────────────────────────
// Certificate lookup
// ─────────────────────────────────────────────

/** Find certificate for verification */
export function getCertificateById(id) {
  const certsKey = 'xebia-lms-student-certificates';
  const local = localStorage.getItem(certsKey);
  if (local) {
    const certs = JSON.parse(local);
    return certs.find(c => c.certificateId === id || c.id === id);
  }
  return null;
}
