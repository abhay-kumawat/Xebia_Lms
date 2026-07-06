import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, BookOpen, ChevronDown, Search, Clock, Star, Users, CheckCircle,
  Brain, Cloud, Code2, Layers, BarChart2, Zap, ShieldCheck,
  Youtube, Play, BookMarked, ClipboardList, PenLine,
  UploadCloud, AlertCircle, CalendarDays, RefreshCw,
  CheckCircle2, XCircle, Timer, Target
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// XEBIA ACADEMY — Course + Module + YouTube Content Data
// ─────────────────────────────────────────────────────────────
const XEBIA_COURSES = [
  {
    id: 'ai-genai', category: 'AI & GenAI', categoryIcon: Brain,
    categoryColor: 'from-violet-500 to-purple-600', badge: 'Hot 🔥',
    title: 'Generative AI & LLM Engineering',
    description: 'Master agentic AI, prompt engineering, RAG, LLMs, and AI-assisted software development using cutting-edge tools.',
    level: 'Intermediate', duration: '10 weeks', enrolled: 1840, rating: 4.9,
    modules: [
      { id: 'm1', title: 'Introduction to Generative AI', duration: '45 min', completed: true, lessons: [
        { id: 'l1', title: 'What is Generative AI?', type: 'video', duration: '18 min', youtubeId: 'G2fqAlgmoPo', ytTitle: 'Generative AI in a Nutshell – Google' },
        { id: 'l2', title: 'LLMs Explained: GPT, Gemini, Claude', type: 'video', duration: '22 min', youtubeId: 'zjkBMFhNj_g', ytTitle: 'But what is a GPT? Visual intro to transformers' },
        { id: 'l3', title: 'AI Ethics & Responsible Use', type: 'pdf', duration: '10 min', youtubeId: null },
      ]},
      { id: 'm2', title: 'Prompt Engineering Masterclass', duration: '1.5 hr', completed: true, lessons: [
        { id: 'l4', title: 'Zero-shot & Few-shot Prompting', type: 'video', duration: '25 min', youtubeId: 'qbIk7-JPB2c', ytTitle: 'Prompt Engineering Guide' },
        { id: 'l5', title: 'Chain-of-Thought Reasoning', type: 'video', duration: '30 min', youtubeId: 'hVAdUZy3sTI', ytTitle: 'Chain of Thought Prompting' },
        { id: 'l6', title: 'Advanced Prompt Patterns', type: 'video', duration: '35 min', youtubeId: '5ef83Wljm-M', ytTitle: 'Advanced Prompting Techniques' },
      ]},
      { id: 'm3', title: 'RAG & Agentic AI Systems', duration: '2 hr', completed: false, lessons: [
        { id: 'l7', title: 'RAG Architecture Deep Dive', type: 'video', duration: '40 min', youtubeId: 'T-D1OfcDW1M', ytTitle: 'Retrieval Augmented Generation' },
        { id: 'l8', title: 'Building AI Agents with LangChain', type: 'video', duration: '45 min', youtubeId: 'aywZrzNaKjs', ytTitle: 'LangChain Tutorial for Beginners' },
        { id: 'l9', title: 'Vector Databases & Embeddings', type: 'video', duration: '35 min', youtubeId: 'ySus5ZS0b94', ytTitle: 'Vector Databases Explained' },
      ]},
      { id: 'm4', title: 'AI-Assisted Software Engineering', duration: '1.5 hr', completed: false, lessons: [
        { id: 'l10', title: 'GitHub Copilot in Practice', type: 'video', duration: '30 min', youtubeId: 'Fi3AJZZregI', ytTitle: 'GitHub Copilot Full Tutorial' },
        { id: 'l11', title: 'Code Review with AI', type: 'video', duration: '25 min', youtubeId: 'GpRqfuQjJhw', ytTitle: 'AI Code Review Best Practices' },
      ]},
    ]
  },
  {
    id: 'cloud-devops', category: 'Cloud & DevOps', categoryIcon: Cloud,
    categoryColor: 'from-blue-500 to-cyan-600', badge: 'Popular',
    title: 'Cloud Engineering & DevOps Mastery',
    description: 'Cloud architecture on AWS/Azure/GCP, CI/CD pipelines, GitOps, Site Reliability Engineering, and platform engineering.',
    level: 'Intermediate', duration: '12 weeks', enrolled: 2150, rating: 4.8,
    modules: [
      { id: 'm5', title: 'Cloud Foundations', duration: '2 hr', completed: true, lessons: [
        { id: 'l12', title: 'AWS Core Services Overview', type: 'video', duration: '35 min', youtubeId: 'a9__D53WsUs', ytTitle: 'AWS Services Overview for Beginners' },
        { id: 'l13', title: 'Azure vs AWS vs GCP Comparison', type: 'video', duration: '28 min', youtubeId: 'ubCNZFQZZWw', ytTitle: 'AWS vs Azure vs Google Cloud' },
        { id: 'l14', title: 'Cloud Cost Optimization', type: 'video', duration: '30 min', youtubeId: 'wdCMoE9j15U', ytTitle: 'AWS Cost Optimization Strategies' },
      ]},
      { id: 'm6', title: 'CI/CD & GitOps', duration: '2.5 hr', completed: true, lessons: [
        { id: 'l15', title: 'GitHub Actions CI/CD Pipeline', type: 'video', duration: '45 min', youtubeId: 'R8_veQiYBjI', ytTitle: 'GitHub Actions Tutorial' },
        { id: 'l16', title: 'ArgoCD & GitOps Workflow', type: 'video', duration: '40 min', youtubeId: 'MeU5_k9ssrs', ytTitle: 'ArgoCD Tutorial for Beginners' },
        { id: 'l17', title: 'Jenkins Pipeline as Code', type: 'video', duration: '35 min', youtubeId: 's73nhwYBtzE', ytTitle: 'Jenkins Pipeline Tutorial' },
      ]},
      { id: 'm7', title: 'Kubernetes & Containers', duration: '3 hr', completed: false, lessons: [
        { id: 'l18', title: 'Docker & Container Fundamentals', type: 'video', duration: '50 min', youtubeId: 'pg19Z8LL06w', ytTitle: 'Docker Tutorial for Beginners' },
        { id: 'l19', title: 'Kubernetes Complete Course', type: 'video', duration: '60 min', youtubeId: 'X48VuDVv0do', ytTitle: 'Kubernetes Course – Full Beginners Tutorial' },
        { id: 'l20', title: 'Helm Charts & Package Management', type: 'video', duration: '35 min', youtubeId: '-ykwb1d0DXU', ytTitle: 'Helm Tutorial for Beginners' },
      ]},
      { id: 'm8', title: 'Site Reliability Engineering', duration: '2 hr', completed: false, lessons: [
        { id: 'l21', title: 'SRE Principles & SLOs', type: 'video', duration: '40 min', youtubeId: 'tEylFyxbDLE', ytTitle: 'SRE Explained by Google' },
        { id: 'l22', title: 'Observability with Prometheus & Grafana', type: 'video', duration: '45 min', youtubeId: 'h4Sl21AKiDg', ytTitle: 'Prometheus & Grafana Tutorial' },
      ]},
    ]
  },
  {
    id: 'agile-scrum', category: 'Agile & Scrum', categoryIcon: Layers,
    categoryColor: 'from-emerald-500 to-teal-600', badge: 'Certified',
    title: 'Professional Scrum & SAFe Agile',
    description: 'PSM, PSPO certifications, SAFe framework, Evidence-Based Management, and Agile leadership for enterprise teams.',
    level: 'Beginner–Advanced', duration: '6 weeks', enrolled: 3210, rating: 4.9,
    modules: [
      { id: 'm9', title: 'Scrum Fundamentals', duration: '1.5 hr', completed: true, lessons: [
        { id: 'l23', title: 'Scrum Framework Complete Guide', type: 'video', duration: '38 min', youtubeId: '2Vt7Ik8Ublw', ytTitle: 'Scrum in Under 5 Minutes' },
        { id: 'l24', title: 'Scrum Roles: PO, SM, Developers', type: 'video', duration: '30 min', youtubeId: 'XU0llRltyFM', ytTitle: 'Scrum Roles Explained' },
        { id: 'l25', title: 'Sprints, Backlogs & Events', type: 'video', duration: '35 min', youtubeId: 'gy1c4_YixCo', ytTitle: 'Scrum Sprint Planning' },
      ]},
      { id: 'm10', title: 'SAFe & Scaled Agile', duration: '2 hr', completed: false, lessons: [
        { id: 'l26', title: 'SAFe Framework Introduction', type: 'video', duration: '40 min', youtubeId: 'J71N7Zu2mmo', ytTitle: 'SAFe Agile Framework Explained' },
        { id: 'l27', title: 'PI Planning & Agile Release Trains', type: 'video', duration: '35 min', youtubeId: 'FnH7vVFj1O0', ytTitle: 'PI Planning Tutorial' },
      ]},
      { id: 'm11', title: 'Evidence-Based Management', duration: '1 hr', completed: false, lessons: [
        { id: 'l28', title: 'EBM Key Value Areas', type: 'video', duration: '28 min', youtubeId: 'IkJLSjnfz2Q', ytTitle: 'Evidence Based Management Overview' },
        { id: 'l29', title: 'Measuring Agility & Progress', type: 'video', duration: '25 min', youtubeId: '502ILHjX9EE', ytTitle: 'Agile Metrics That Matter' },
      ]},
    ]
  },
  {
    id: 'software-dev', category: 'Software Development', categoryIcon: Code2,
    categoryColor: 'from-amber-500 to-orange-600', badge: 'New',
    title: 'Clean Code, TDD & Microservices',
    description: 'TDD, Clean Architecture, SOLID principles, Go lang, microservices design and enterprise software craftsmanship.',
    level: 'Advanced', duration: '10 weeks', enrolled: 1320, rating: 4.7,
    modules: [
      { id: 'm12', title: 'Clean Code & SOLID Principles', duration: '2 hr', completed: true, lessons: [
        { id: 'l30', title: 'SOLID Principles Explained', type: 'video', duration: '45 min', youtubeId: 'WTIU-tYHBmI', ytTitle: 'SOLID Design Principles' },
        { id: 'l31', title: 'Refactoring Techniques', type: 'video', duration: '40 min', youtubeId: 'vqEg37e4Mkw', ytTitle: 'Refactoring in Practice' },
        { id: 'l32', title: 'Design Patterns in Practice', type: 'video', duration: '35 min', youtubeId: 'BWprw8Nu4eg', ytTitle: '10 Design Patterns Explained in 10 Minutes' },
      ]},
      { id: 'm13', title: 'Test-Driven Development', duration: '2 hr', completed: false, lessons: [
        { id: 'l33', title: 'TDD Red-Green-Refactor Cycle', type: 'video', duration: '40 min', youtubeId: 'qkblc5WRn-U', ytTitle: 'TDD Introduction and Benefits' },
        { id: 'l34', title: 'Unit Testing with JUnit & Jest', type: 'video', duration: '38 min', youtubeId: 'vZm0lHciFsQ', ytTitle: 'Unit Testing Best Practices' },
        { id: 'l35', title: 'BDD with Cucumber', type: 'video', duration: '32 min', youtubeId: 'vs6gkBnVfkQ', ytTitle: 'BDD with Cucumber Tutorial' },
      ]},
      { id: 'm14', title: 'Microservices Architecture', duration: '2.5 hr', completed: false, lessons: [
        { id: 'l36', title: 'Microservices vs Monolith', type: 'video', duration: '30 min', youtubeId: 'lTAcCNbJ7KE', ytTitle: 'Microservices Architecture Explained' },
        { id: 'l37', title: 'Spring Boot Microservices', type: 'video', duration: '50 min', youtubeId: 'BnknNTN8icw', ytTitle: 'Spring Boot Microservices Tutorial' },
        { id: 'l38', title: 'API Gateway & Service Mesh', type: 'video', duration: '40 min', youtubeId: 'qOoIsq_lM4w', ytTitle: 'Service Mesh & API Gateway' },
      ]},
    ]
  },
  {
    id: 'data-ai', category: 'Data & AI Engineering', categoryIcon: BarChart2,
    categoryColor: 'from-rose-500 to-pink-600', badge: 'Trending',
    title: 'Data Science, Engineering & Analytics',
    description: 'Python data science, data engineering pipelines, SQL/NoSQL, ML model deployment, and business intelligence with Power BI.',
    level: 'Intermediate', duration: '12 weeks', enrolled: 1780, rating: 4.8,
    modules: [
      { id: 'm15', title: 'Python for Data Science', duration: '3 hr', completed: true, lessons: [
        { id: 'l39', title: 'Pandas & NumPy Fundamentals', type: 'video', duration: '50 min', youtubeId: 'vmEHCJofslg', ytTitle: 'Pandas Tutorial for Beginners' },
        { id: 'l40', title: 'Data Visualization with Matplotlib', type: 'video', duration: '40 min', youtubeId: 'a9UrKTVEeZA', ytTitle: 'Matplotlib Tutorial' },
        { id: 'l41', title: 'Scikit-Learn ML Pipelines', type: 'video', duration: '50 min', youtubeId: 'pqNCD_5r0IU', ytTitle: 'Scikit-Learn Tutorial' },
      ]},
      { id: 'm16', title: 'Data Engineering & Pipelines', duration: '2.5 hr', completed: false, lessons: [
        { id: 'l42', title: 'Apache Spark & Big Data', type: 'video', duration: '55 min', youtubeId: 'QaoJkXeKT-s', ytTitle: 'Apache Spark Tutorial for Beginners' },
        { id: 'l43', title: 'dbt & Modern Data Stacks', type: 'video', duration: '40 min', youtubeId: 'M8oi7nSaWps', ytTitle: 'dbt Tutorial – Data Build Tool' },
        { id: 'l44', title: 'Kafka Event Streaming', type: 'video', duration: '45 min', youtubeId: 'B5j3uNBH8X4', ytTitle: 'Apache Kafka Tutorial for Beginners' },
      ]},
      { id: 'm17', title: 'ML Model Deployment', duration: '2 hr', completed: false, lessons: [
        { id: 'l45', title: 'MLOps Introduction', type: 'video', duration: '35 min', youtubeId: 'NgWujOrCZFo', ytTitle: 'MLOps Explained' },
        { id: 'l46', title: 'FastAPI for ML Model Serving', type: 'video', duration: '40 min', youtubeId: '0RS9W8MtZe4', ytTitle: 'FastAPI Tutorial' },
      ]},
    ]
  },
  {
    id: 'product-leadership', category: 'Product & Leadership', categoryIcon: Zap,
    categoryColor: 'from-indigo-500 to-blue-600', badge: 'New',
    title: 'Product Management & Agile Leadership',
    description: 'Product discovery, design thinking, OKRs, stakeholder management, and communication skills for technology leaders.',
    level: 'Intermediate', duration: '8 weeks', enrolled: 980, rating: 4.7,
    modules: [
      { id: 'm18', title: 'Product Discovery & Strategy', duration: '2 hr', completed: false, lessons: [
        { id: 'l47', title: 'Jobs-to-be-Done Framework', type: 'video', duration: '35 min', youtubeId: 'PjnTJz3GZGE', ytTitle: 'Jobs to be Done Theory' },
        { id: 'l48', title: 'Design Thinking Process', type: 'video', duration: '40 min', youtubeId: 'a7sEoEvT8l8', ytTitle: 'Design Thinking Crash Course' },
        { id: 'l49', title: 'Product Roadmapping', type: 'video', duration: '30 min', youtubeId: 'vpwx7WGKB7I', ytTitle: 'Product Roadmap Best Practices' },
      ]},
      { id: 'm19', title: 'OKRs & Business Metrics', duration: '1.5 hr', completed: false, lessons: [
        { id: 'l50', title: 'OKR Framework Explained', type: 'video', duration: '30 min', youtubeId: 'EIcLscI7ihk', ytTitle: 'OKRs Explained by Google' },
        { id: 'l51', title: 'North Star Metric & KPIs', type: 'video', duration: '35 min', youtubeId: 'mQHssjLsXBM', ytTitle: 'North Star Metric Framework' },
      ]},
    ]
  },
  {
    id: 'security', category: 'Cybersecurity', categoryIcon: ShieldCheck,
    categoryColor: 'from-slate-600 to-slate-800', badge: 'Essential',
    title: 'Application Security & DevSecOps',
    description: 'Secure coding practices, OWASP Top 10, penetration testing, DevSecOps, and compliance frameworks (ISO 27001, SOC 2).',
    level: 'Intermediate', duration: '8 weeks', enrolled: 1120, rating: 4.8,
    modules: [
      { id: 'm20', title: 'OWASP Top 10 Vulnerabilities', duration: '2 hr', completed: false, lessons: [
        { id: 'l52', title: 'OWASP Top 10 Overview 2024', type: 'video', duration: '40 min', youtubeId: 'ravrgYmBUUQ', ytTitle: 'OWASP Top 10 Explained' },
        { id: 'l53', title: 'SQL Injection & XSS Prevention', type: 'video', duration: '35 min', youtubeId: 'ciNHn38EyRc', ytTitle: 'SQL Injection Tutorial' },
        { id: 'l54', title: 'JWT & OAuth2 Security', type: 'video', duration: '40 min', youtubeId: 'mbsmsi7l3r4', ytTitle: 'JWT Authentication Tutorial' },
      ]},
      { id: 'm21', title: 'DevSecOps Pipelines', duration: '1.5 hr', completed: false, lessons: [
        { id: 'l55', title: 'SAST & DAST in CI/CD', type: 'video', duration: '35 min', youtubeId: 'GfKFmstNNOs', ytTitle: 'DevSecOps Pipeline Setup' },
        { id: 'l56', title: 'Container Security Scanning', type: 'video', duration: '30 min', youtubeId: 'A8-6l0U5rY8', ytTitle: 'Container Security with Trivy' },
      ]},
    ]
  },
];

// ─────────────────────────────────────────────────────────────
// ASSIGNMENTS DATA
// ─────────────────────────────────────────────────────────────
const ASSIGNMENTS = {
  'ai-genai': [
    { id: 'a1', title: 'Build a Prompt Engineering Cheat Sheet', module: 'Prompt Engineering Masterclass', dueDate: '2026-07-10', points: 100, status: 'submitted', score: 92, description: 'Create a comprehensive cheat sheet documenting at least 10 prompt patterns with examples for zero-shot, few-shot, chain-of-thought, and role-play prompting.', submittedAt: '2026-07-09' },
    { id: 'a2', title: 'RAG Pipeline Implementation', module: 'RAG & Agentic AI Systems', dueDate: '2026-07-18', points: 150, status: 'pending', score: null, description: 'Implement a RAG system using LangChain + FAISS vector store. Index 10 documents and demonstrate 5 Q&A queries with sources cited.', submittedAt: null },
    { id: 'a3', title: 'AI Ethics Case Study Report', module: 'Introduction to Generative AI', dueDate: '2026-07-14', points: 80, status: 'overdue', score: null, description: 'Write a 500-word report analysing a real-world AI ethics incident (bias, hallucination, misuse). Propose mitigation strategies.', submittedAt: null },
  ],
  'cloud-devops': [
    { id: 'a4', title: 'Deploy a 3-Tier App on AWS', module: 'Cloud Foundations', dueDate: '2026-07-12', points: 200, status: 'submitted', score: 185, description: 'Deploy a React frontend on S3, Node.js API on EC2, and PostgreSQL on RDS. Document the architecture with a diagram.', submittedAt: '2026-07-11' },
    { id: 'a5', title: 'GitHub Actions CI/CD Pipeline', module: 'CI/CD & GitOps', dueDate: '2026-07-20', points: 120, status: 'pending', score: null, description: 'Create a GitHub Actions workflow that lints, tests, builds, and deploys a Node.js app to EC2 on every push to main.', submittedAt: null },
    { id: 'a6', title: 'Kubernetes Deployment Manifest', module: 'Kubernetes & Containers', dueDate: '2026-07-25', points: 150, status: 'pending', score: null, description: 'Write Kubernetes manifests (Deployment, Service, Ingress, ConfigMap, Secret) for a microservice app with HPA for auto-scaling.', submittedAt: null },
  ],
  'agile-scrum': [
    { id: 'a7', title: 'Sprint Retrospective Report', module: 'Scrum Fundamentals', dueDate: '2026-07-08', points: 60, status: 'submitted', score: 58, description: 'Facilitate a mock sprint retrospective. Document what went well, what did not, action items using Start/Stop/Continue format.', submittedAt: '2026-07-07' },
    { id: 'a8', title: 'SAFe PI Planning Simulation', module: 'SAFe & Scaled Agile', dueDate: '2026-07-22', points: 100, status: 'pending', score: null, description: 'Simulate a PI Planning event. Define 3 team objectives, 2 PI risks, and a sprint board for the first sprint.', submittedAt: null },
  ],
  'software-dev': [
    { id: 'a9', title: 'Refactor Legacy Code with SOLID', module: 'Clean Code & SOLID Principles', dueDate: '2026-07-11', points: 120, status: 'submitted', score: 108, description: 'Take the provided legacy Java class and refactor it to comply with all 5 SOLID principles. Include before/after comparison.', submittedAt: '2026-07-10' },
    { id: 'a10', title: 'TDD: Shopping Cart Feature', module: 'Test-Driven Development', dueDate: '2026-07-19', points: 150, status: 'pending', score: null, description: 'Use TDD (red-green-refactor) to build a shopping cart. Achieve 90%+ test coverage.', submittedAt: null },
  ],
  'data-ai': [
    { id: 'a11', title: 'EDA on Kaggle Dataset', module: 'Python for Data Science', dueDate: '2026-07-13', points: 100, status: 'submitted', score: 96, description: 'Perform Exploratory Data Analysis on any Kaggle dataset. Produce 8 visualisations with insights. Submit as a Jupyter Notebook.', submittedAt: '2026-07-12' },
    { id: 'a12', title: 'Build a Kafka Streaming Pipeline', module: 'Data Engineering & Pipelines', dueDate: '2026-07-23', points: 180, status: 'pending', score: null, description: 'Create a Kafka producer streaming IoT sensor data and a consumer aggregating readings into PostgreSQL every 10 seconds.', submittedAt: null },
  ],
  'product-leadership': [
    { id: 'a13', title: 'OKR Drafting Exercise', module: 'OKRs & Business Metrics', dueDate: '2026-07-16', points: 80, status: 'pending', score: null, description: 'Draft quarterly OKRs for a fictional SaaS product. Define 3 Objectives each with 3 measurable, time-bound Key Results.', submittedAt: null },
  ],
  'security': [
    { id: 'a14', title: 'OWASP Vulnerability Audit Report', module: 'OWASP Top 10 Vulnerabilities', dueDate: '2026-07-17', points: 140, status: 'pending', score: null, description: 'Use OWASP ZAP to scan the provided demo web app. Document found vulnerabilities, their CVSS score, and recommended fixes.', submittedAt: null },
  ],
};

// ─────────────────────────────────────────────────────────────
// ASSESSMENTS DATA
// ─────────────────────────────────────────────────────────────
const ASSESSMENTS = {
  'ai-genai': [
    {
      id: 'q1', title: 'GenAI Fundamentals Quiz', module: 'Introduction to Generative AI',
      duration: 15, totalMarks: 50, passMark: 35, attempts: 2, bestScore: 44,
      questions: [
        { id: 'qq1', q: 'Which architecture is the foundation of most modern LLMs?', options: ['CNN', 'RNN', 'Transformer', 'LSTM'], correct: 2 },
        { id: 'qq2', q: 'What does RAG stand for in AI?', options: ['Rapid API Gateway', 'Retrieval-Augmented Generation', 'Recursive Auto-Generative', 'Randomised Attention Graph'], correct: 1 },
        { id: 'qq3', q: 'Which technique feeds a few examples into a prompt to guide output?', options: ['Zero-shot', 'Fine-tuning', 'Few-shot', 'RLHF'], correct: 2 },
        { id: 'qq4', q: 'Hallucination in LLMs refers to:', options: ['Slow response time', 'Generating factually incorrect content confidently', 'Model overfitting', 'Token limit errors'], correct: 1 },
        { id: 'qq5', q: 'Which company developed the GPT series of LLMs?', options: ['Google', 'Meta', 'OpenAI', 'Anthropic'], correct: 2 },
      ]
    },
    {
      id: 'q2', title: 'Prompt Engineering Assessment', module: 'Prompt Engineering Masterclass',
      duration: 20, totalMarks: 80, passMark: 56, attempts: 0, bestScore: null,
      questions: [
        { id: 'qq6', q: 'Chain-of-thought prompting helps LLMs with:', options: ['Faster responses', 'Multi-step reasoning', 'Shorter outputs', 'Image generation'], correct: 1 },
        { id: 'qq7', q: 'What is the "temperature" parameter in LLMs?', options: ['Model speed', 'Randomness of output', 'Context window size', 'API rate limit'], correct: 1 },
        { id: 'qq8', q: 'Which prompt technique assigns the model a specific role?', options: ['Zero-shot', 'Role-play prompting', 'Tree-of-thought', 'Summarisation'], correct: 1 },
        { id: 'qq9', q: 'Prompt injection attacks target:', options: ['Training data', 'Model weights', 'User inputs to manipulate model behaviour', 'Cloud infrastructure'], correct: 2 },
        { id: 'qq10', q: 'Which of these is NOT a valid prompting strategy?', options: ['Few-shot', 'Zero-shot', 'Deep-shot', 'Chain-of-thought'], correct: 2 },
      ]
    },
  ],
  'cloud-devops': [
    {
      id: 'q3', title: 'AWS Cloud Essentials Quiz', module: 'Cloud Foundations',
      duration: 20, totalMarks: 60, passMark: 42, attempts: 1, bestScore: 55,
      questions: [
        { id: 'qq11', q: 'Which AWS service provides managed Kubernetes?', options: ['ECS', 'EKS', 'Lambda', 'Fargate'], correct: 1 },
        { id: 'qq12', q: 'S3 is primarily used for:', options: ['Running VMs', 'Object storage', 'DNS management', 'Database hosting'], correct: 1 },
        { id: 'qq13', q: 'What does "IAM" stand for in AWS?', options: ['Internal Access Management', 'Identity and Access Management', 'Integrated Application Monitor', 'Internet Access Module'], correct: 1 },
        { id: 'qq14', q: 'Which service is AWS serverless compute?', options: ['EC2', 'ECS', 'Lambda', 'Beanstalk'], correct: 2 },
        { id: 'qq15', q: 'A VPC allows you to:', options: ['Run Docker containers', 'Create isolated network environments in AWS', 'Store data objects', 'Monitor metrics'], correct: 1 },
      ]
    },
  ],
  'agile-scrum': [
    {
      id: 'q4', title: 'Scrum Framework MCQ', module: 'Scrum Fundamentals',
      duration: 15, totalMarks: 50, passMark: 35, attempts: 3, bestScore: 48,
      questions: [
        { id: 'qq16', q: "The Scrum Master's primary responsibility is to:", options: ['Write code', 'Serve the team and remove impediments', 'Manage the project budget', 'Define the product vision'], correct: 1 },
        { id: 'qq17', q: 'How long is a typical Scrum sprint?', options: ['1 day', '1–4 weeks', '3 months', '6 months'], correct: 1 },
        { id: 'qq18', q: 'Which Scrum event inspects and adapts the process?', options: ['Sprint Review', 'Daily Scrum', 'Sprint Retrospective', 'Sprint Planning'], correct: 2 },
        { id: 'qq19', q: 'The Product Backlog is owned by the:', options: ['Scrum Master', 'Development Team', 'Product Owner', 'Stakeholders'], correct: 2 },
        { id: 'qq20', q: 'What is the "Definition of Done" in Scrum?', options: ['A list of features to build', 'A shared understanding of what complete means for an increment', 'A list of bugs', 'The sprint goal'], correct: 1 },
      ]
    },
  ],
  'software-dev': [
    {
      id: 'q5', title: 'SOLID & Clean Code Quiz', module: 'Clean Code & SOLID Principles',
      duration: 15, totalMarks: 50, passMark: 35, attempts: 0, bestScore: null,
      questions: [
        { id: 'qq21', q: 'What does the "S" in SOLID stand for?', options: ['Scalability Principle', 'Single Responsibility Principle', 'State Separation Principle', 'Service Orientation'], correct: 1 },
        { id: 'qq22', q: 'Open/Closed Principle: a class should be:', options: ['Open for modification only', 'Closed for extension, open for modification', 'Open for extension, closed for modification', 'Neither'], correct: 2 },
        { id: 'qq23', q: 'Which refactoring replaces a conditional with polymorphism?', options: ['Extract Method', 'Replace Conditional with Polymorphism', 'Inline Method', 'Move Field'], correct: 1 },
        { id: 'qq24', q: 'TDD follows the cycle:', options: ['Green → Red → Refactor', 'Red → Green → Refactor', 'Write → Test → Deploy', 'Design → Code → Test'], correct: 1 },
        { id: 'qq25', q: 'Dependency Inversion Principle states that:', options: ['High-level modules depend on low-level modules', 'Both should depend on abstractions', 'Abstractions depend on details', 'None of the above'], correct: 1 },
      ]
    },
  ],
  'data-ai': [
    {
      id: 'q6', title: 'Data Science Fundamentals Quiz', module: 'Python for Data Science',
      duration: 20, totalMarks: 60, passMark: 42, attempts: 0, bestScore: null,
      questions: [
        { id: 'qq26', q: 'Which Python library is used for data manipulation?', options: ['NumPy', 'Matplotlib', 'Pandas', 'Seaborn'], correct: 2 },
        { id: 'qq27', q: 'What is overfitting in machine learning?', options: ['Model performs well on training but poorly on test data', 'Model is too simple', 'Model trains too slowly', 'Model has high bias'], correct: 0 },
        { id: 'qq28', q: 'Which metric is used for classification problems?', options: ['RMSE', 'MAE', 'F1-Score', 'R-squared'], correct: 2 },
        { id: 'qq29', q: 'What does EDA stand for?', options: ['Exploratory Data Analysis', 'Experimental Design Analysis', 'Extended Data Approach', 'Evaluation and Deployment'], correct: 0 },
        { id: 'qq30', q: 'Apache Kafka is primarily used for:', options: ['Database storage', 'Event streaming and messaging', 'ML training', 'Static file serving'], correct: 1 },
      ]
    },
  ],
  'product-leadership': [
    {
      id: 'q7', title: 'Product Management Fundamentals', module: 'Product Discovery & Strategy',
      duration: 15, totalMarks: 50, passMark: 35, attempts: 0, bestScore: null,
      questions: [
        { id: 'qq31', q: 'OKR stands for:', options: ['Outcomes, Key Roadmaps', 'Objectives and Key Results', 'Operations and Key Risks', 'Output and Key Resources'], correct: 1 },
        { id: 'qq32', q: "Design Thinking's first stage is:", options: ['Prototype', 'Test', 'Empathise', 'Define'], correct: 2 },
        { id: 'qq33', q: 'A North Star Metric represents:', options: ["The company's revenue target", 'The single metric capturing core product value', 'Social media followers', 'Customer churn rate'], correct: 1 },
        { id: 'qq34', q: 'Jobs-to-be-Done framework focuses on:', options: ['Features to build', 'User demographics', 'The underlying need driving product usage', 'Technology stack decisions'], correct: 2 },
        { id: 'qq35', q: 'Which is NOT a principle of Agile leadership?', options: ['Servant leadership', 'Command and control management', 'Continuous improvement', 'Empowering teams'], correct: 1 },
      ]
    },
  ],
  'security': [
    {
      id: 'q8', title: 'Application Security Quiz', module: 'OWASP Top 10 Vulnerabilities',
      duration: 15, totalMarks: 50, passMark: 35, attempts: 0, bestScore: null,
      questions: [
        { id: 'qq36', q: 'SQL Injection is primarily caused by:', options: ['Weak passwords', 'Unsanitized user inputs in SQL queries', 'Outdated libraries', 'Missing HTTPS'], correct: 1 },
        { id: 'qq37', q: 'XSS stands for:', options: ['Cross-Server Scripting', 'Cross-Site Scripting', 'Cross-System Security', 'Cross-Site Session'], correct: 1 },
        { id: 'qq38', q: 'JWT is used for:', options: ['Encrypting databases', 'Stateless authentication tokens', 'Firewall configuration', 'Load balancing'], correct: 1 },
        { id: 'qq39', q: 'OWASP Top 10 #1 in 2021 was:', options: ['XSS', 'SQL Injection', 'Broken Access Control', 'Security Misconfiguration'], correct: 2 },
        { id: 'qq40', q: 'SAST refers to:', options: ['Security Assessment Standard Testing', 'Static Application Security Testing', 'System Audit Security Tools', 'Software Assurance Standard Testing'], correct: 1 },
      ]
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// YouTube Player Modal
// ─────────────────────────────────────────────────────────────
function YouTubePlayer({ videoId, title, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-slate-900" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            <span className="text-sm font-bold text-white line-clamp-1">{title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer bg-transparent border-0 px-2">✕</button>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Lesson Row
// ─────────────────────────────────────────────────────────────
function LessonRow({ lesson, idx, onPlay }) {
  const isVideo = lesson.type === 'video' && lesson.youtubeId;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isVideo ? 'hover:bg-purple-50/70 cursor-pointer' : 'hover:bg-slate-50 cursor-default'}`}
      onClick={() => isVideo && onPlay(lesson.youtubeId, lesson.ytTitle || lesson.title)}>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isVideo ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white' : 'bg-slate-100 text-slate-500'} transition-colors`}>
        {isVideo ? <Youtube className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${isVideo ? 'text-slate-800 group-hover:text-purple-700' : 'text-slate-600'} transition-colors`}>{lesson.title}</p>
        {lesson.ytTitle && <p className="text-[10px] text-slate-400 truncate mt-0.5">{lesson.ytTitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-slate-400 font-medium">{lesson.duration}</span>
        {isVideo && (
          <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-500 transition-colors">
            <Play className="h-3 w-3 text-red-400 group-hover:text-white fill-current ml-0.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Module Accordion
// ─────────────────────────────────────────────────────────────
function ModuleAccordion({ module, onPlay }) {
  const [open, setOpen] = useState(module.completed);
  const videoCount = module.lessons.filter(l => l.youtubeId).length;
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${open ? 'border-purple-200 shadow-sm' : 'border-slate-200'}`}>
      <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${module.completed ? 'bg-emerald-50' : 'bg-purple-50'}`}>
            {module.completed ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <BookMarked className="h-4 w-4 text-purple-500" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">{module.title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{module.lessons.length} lessons · {module.duration} · {videoCount} videos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {module.completed && <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Completed</span>}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 bg-slate-50/50 space-y-1">
              {module.lessons.map((lesson, i) => <LessonRow key={lesson.id} lesson={lesson} idx={i} onPlay={onPlay} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Assignments Panel
// ─────────────────────────────────────────────────────────────
function AssignmentsPanel({ courseId }) {
  const assignments = ASSIGNMENTS[courseId] || [];
  const [expandedId, setExpandedId] = useState(null);
  const [uploadedIds, setUploadedIds] = useState([]);
  const statusMeta = {
    submitted: { label: 'Submitted', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    pending:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 border-amber-200' },
    overdue:   { label: 'Overdue',   color: 'text-red-600 bg-red-50 border-red-200' },
  };
  if (assignments.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <ClipboardList className="h-10 w-10 mx-auto mb-3 text-slate-300" />
      <p className="text-sm font-semibold">No assignments for this course yet.</p>
    </div>
  );
  const totalPoints = assignments.reduce((a, x) => a + x.points, 0);
  const earnedPoints = assignments.filter(x => x.score).reduce((a, x) => a + x.score, 0);
  const submitted = assignments.filter(x => x.status === 'submitted').length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: assignments.length, icon: '📋' },
          { label: 'Submitted', value: `${submitted}/${assignments.length}`, icon: '✅' },
          { label: 'Points Earned', value: `${earnedPoints}/${totalPoints}`, icon: '🏆' },
        ].map(s => (
          <div key={s.label} className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-100 rounded-2xl p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-sm font-black text-slate-800">{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {assignments.map((asgn, idx) => {
        const meta = statusMeta[asgn.status];
        const isExpanded = expandedId === asgn.id;
        const isUploaded = uploadedIds.includes(asgn.id);
        const daysUntil = Math.ceil((new Date(asgn.dueDate) - new Date()) / 86400000);
        return (
          <motion.div key={asgn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
            className={`rounded-2xl border overflow-hidden bg-white ${asgn.status === 'overdue' ? 'border-red-200' : asgn.status === 'submitted' ? 'border-emerald-200' : 'border-slate-200'}`}>
            <button className="w-full flex items-start justify-between p-5 hover:bg-slate-50/60 cursor-pointer text-left transition-colors" onClick={() => setExpandedId(isExpanded ? null : asgn.id)}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${asgn.status === 'submitted' ? 'bg-emerald-50' : asgn.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50'}`}>
                  {asgn.status === 'submitted' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : asgn.status === 'overdue' ? <AlertCircle className="h-4 w-4 text-red-500" /> : <PenLine className="h-4 w-4 text-amber-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{asgn.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{asgn.module}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <div className="text-right">
                  <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                  {asgn.score !== null && <p className="text-[10px] font-bold text-emerald-600 mt-1">{asgn.score}/{asgn.points} pts</p>}
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.div>
              </div>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 bg-slate-50/40 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">{asgn.description}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Due: <strong className={daysUntil < 0 ? 'text-red-500' : daysUntil <= 2 ? 'text-amber-600' : 'text-slate-700'}>{asgn.dueDate} {daysUntil < 0 ? '(Overdue)' : daysUntil === 0 ? '(Due Today!)' : `(${daysUntil}d left)`}</strong></span>
                      <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Points: <strong className="text-slate-700">{asgn.points}</strong></span>
                      {asgn.submittedAt && <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Submitted: <strong className="text-emerald-600">{asgn.submittedAt}</strong></span>}
                    </div>
                    {asgn.status !== 'submitted' && (
                      <div className="border-2 border-dashed border-purple-200 bg-purple-50/40 rounded-2xl p-5 text-center hover:border-purple-400 transition-colors">
                        {isUploaded ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            <p className="text-xs font-bold text-emerald-600">File ready to submit!</p>
                            <button onClick={e => { e.stopPropagation(); alert('Assignment submitted successfully! ✅'); }} className="mt-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl cursor-pointer border-0 transition-colors">Submit Assignment</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <UploadCloud className="h-8 w-8 text-purple-400" />
                            <p className="text-xs font-semibold text-slate-600">Drag & drop your file or</p>
                            <button onClick={e => { e.stopPropagation(); setUploadedIds(p => [...p, asgn.id]); }} className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl cursor-pointer border-0 transition-colors">Browse File</button>
                            <p className="text-[10px] text-slate-400">PDF, DOCX, ZIP, IPYNB · Max 50MB</p>
                          </div>
                        )}
                      </div>
                    )}
                    {asgn.status === 'submitted' && asgn.score !== null && (
                      <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-lg font-black text-emerald-600">{Math.round((asgn.score / asgn.points) * 100)}%</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-700">Graded: {asgn.score}/{asgn.points} points</p>
                          <p className="text-[10px] text-emerald-600 mt-0.5">Submitted on {asgn.submittedAt}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Assessments Panel (Interactive Quiz)
// ─────────────────────────────────────────────────────────────
function AssessmentsPanel({ courseId }) {
  const assessments = ASSESSMENTS[courseId] || [];
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(null);

  const startQuiz = (assessment) => { setActiveQuiz(assessment); setAnswers({}); setFinished(false); setScore(null); };
  const submitQuiz = () => {
    let correct = 0;
    activeQuiz.questions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    const earnedMarks = Math.round((correct / activeQuiz.questions.length) * activeQuiz.totalMarks);
    setScore({ correct, total: activeQuiz.questions.length, marks: earnedMarks, pass: earnedMarks >= activeQuiz.passMark });
    setFinished(true);
  };

  if (assessments.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <Target className="h-10 w-10 mx-auto mb-3 text-slate-300" />
      <p className="text-sm font-semibold">No assessments for this course yet.</p>
    </div>
  );

  // Quiz in progress
  if (activeQuiz && !finished) {
    const totalQ = activeQuiz.questions.length;
    const answered = Object.keys(answers).length;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">In Progress</p>
            <h3 className="text-base font-extrabold mt-0.5">{activeQuiz.title}</h3>
          </div>
          <div className="text-center bg-white/15 border border-white/20 rounded-xl px-4 py-2">
            <div className="text-xl font-black">{answered}/{totalQ}</div>
            <div className="text-[10px] text-purple-200">Answered</div>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${(answered / totalQ) * 100}%` }} className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" />
        </div>
        <div className="space-y-4">
          {activeQuiz.questions.map((q, qi) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm font-bold text-slate-800 mb-4"><span className="text-purple-600 mr-2">Q{qi + 1}.</span>{q.q}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    className={`w-full text-left text-xs px-4 py-3 rounded-xl border cursor-pointer transition-all ${answers[q.id] === oi ? 'border-purple-500 bg-purple-50 text-purple-800 font-bold' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50/40'}`}>
                    <span className={`inline-flex h-5 w-5 rounded-full border text-[10px] font-bold items-center justify-center mr-2 shrink-0 ${answers[q.id] === oi ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 text-slate-500'}`}>{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setActiveQuiz(null)} className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer bg-transparent border-0 font-semibold">← Back</button>
          <button onClick={submitQuiz} disabled={answered < totalQ}
            className={`text-sm font-bold px-6 py-2.5 rounded-xl border-0 transition-all ${answered === totalQ ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            {answered < totalQ ? `${totalQ - answered} question(s) remaining` : 'Submit Assessment →'}
          </button>
        </div>
      </motion.div>
    );
  }

  // Result screen
  if (activeQuiz && finished && score) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
        <div className={`rounded-3xl p-8 text-center ${score.pass ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white`}>
          <div className="text-5xl mb-3">{score.pass ? '🏆' : '📚'}</div>
          <div className="text-4xl font-black">{score.marks}/{activeQuiz.totalMarks}</div>
          <div className="text-lg font-bold mt-1">{score.correct}/{score.total} Correct</div>
          <div className="mt-3 text-sm font-bold px-4 py-1.5 rounded-full inline-block bg-white/20">{score.pass ? '✅ PASSED' : '❌ FAILED — Review & Retry'}</div>
          <p className="text-white/70 text-xs mt-2">Pass mark: {activeQuiz.passMark}/{activeQuiz.totalMarks}</p>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800">Answer Review</h4>
          {activeQuiz.questions.map((q, qi) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correct;
            return (
              <div key={q.id} className={`rounded-2xl border p-4 ${isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-bold text-slate-800">Q{qi + 1}. {q.q}</p>
                    {!isCorrect && <p className="text-[11px] text-red-600 mt-1">Your answer: <span className="font-bold">{q.options[userAns] ?? 'Not answered'}</span></p>}
                    <p className={`text-[11px] mt-0.5 ${isCorrect ? 'text-emerald-600' : 'text-emerald-700'}`}>✓ Correct: <span className="font-bold">{q.options[q.correct]}</span></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveQuiz(null)} className="flex-1 text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl cursor-pointer transition-colors">← All Assessments</button>
          {!score.pass && <button onClick={() => startQuiz(activeQuiz)} className="flex-1 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl cursor-pointer border-0 transition-colors flex items-center justify-center gap-1.5"><RefreshCw className="h-4 w-4" /> Retry Quiz</button>}
        </div>
      </motion.div>
    );
  }

  // Assessment list
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Quizzes', value: assessments.length, icon: '📝' },
          { label: 'Completed', value: assessments.filter(a => a.bestScore !== null).length, icon: '✅' },
        ].map(s => (
          <div key={s.label} className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-100 rounded-2xl p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-base font-black text-slate-800">{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {assessments.map((assessment, idx) => {
        const pct = assessment.bestScore !== null ? Math.round((assessment.bestScore / assessment.totalMarks) * 100) : null;
        const passed = pct !== null && assessment.bestScore >= assessment.passMark;
        return (
          <motion.div key={assessment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-purple-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{assessment.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{assessment.module}</p>
              </div>
              {pct !== null && (
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${passed ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                  {passed ? `✅ Passed · ${pct}%` : `❌ Failed · ${pct}%`}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 mb-4">
              <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> {assessment.duration} min</span>
              <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {assessment.totalMarks} marks · Pass: {assessment.passMark}</span>
              <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> {assessment.questions.length} questions</span>
              <span className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> {assessment.attempts} attempt{assessment.attempts !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={() => startQuiz(assessment)}
              className="w-full text-sm font-bold py-2.5 rounded-xl cursor-pointer border-0 transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-sm flex items-center justify-center gap-2">
              <PenLine className="h-4 w-4" />
              {assessment.bestScore !== null ? 'Retake Assessment' : 'Start Assessment'}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Course Tabs: Modules / Assignments / Assessments
// ─────────────────────────────────────────────────────────────
function CourseTabs({ course, onPlay }) {
  const [courseTab, setCourseTab] = useState('modules');
  const tabs = [
    { id: 'modules',     label: 'Modules',     icon: BookOpen,      count: course.modules.length },
    { id: 'assignments', label: 'Assignments',  icon: ClipboardList, count: (ASSIGNMENTS[course.id] || []).length },
    { id: 'assessments', label: 'Assessments',  icon: PenLine,       count: (ASSESSMENTS[course.id] || []).length },
  ];
  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = courseTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setCourseTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl cursor-pointer border-0 transition-all ${active ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}>
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>{tab.count}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={courseTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {courseTab === 'modules' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <Youtube className="h-3.5 w-3.5 text-red-500" />
                <span>Click any <strong className="text-red-600">▶ video lesson</strong> to watch it directly in the app</span>
              </div>
              {course.modules.map(module => <ModuleAccordion key={module.id} module={module} onPlay={onPlay} />)}
            </div>
          )}
          {courseTab === 'assignments' && <AssignmentsPanel courseId={course.id} />}
          {courseTab === 'assessments' && <AssessmentsPanel courseId={course.id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Course Card
// ─────────────────────────────────────────────────────────────
function CourseCard({ course, onClick, isSelected }) {
  const Icon = course.categoryIcon;
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedModules = course.modules.filter(m => m.completed).length;
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => onClick(course)}
      className={`group cursor-pointer rounded-3xl border p-5 transition-all duration-200 ${isSelected ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-100' : 'border-slate-200 bg-white hover:border-purple-200 hover:shadow-md'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${course.categoryColor} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {course.badge && <span className="text-[9px] font-bold uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">{course.badge}</span>}
      </div>
      <h3 className={`text-sm font-bold leading-snug mb-1 transition-colors ${isSelected ? 'text-purple-800' : 'text-slate-800 group-hover:text-purple-700'}`}>{course.title}</h3>
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-4">{course.description}</p>
      <div className="space-y-2">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${course.categoryColor} transition-all duration-700`} style={{ width: `${(completedModules / course.modules.length) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>{completedModules}/{course.modules.length} modules</span>
          <span className="font-semibold">{totalLessons} lessons</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolled.toLocaleString()}</span>
        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{course.rating}</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function StudentLearningContentPage() {
  const [selectedCourse, setSelectedCourse] = useState(XEBIA_COURSES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState(null);

  const categories = ['All', ...new Set(XEBIA_COURSES.map(c => c.category))];
  const filteredCourses = useMemo(() => XEBIA_COURSES.filter(c => {
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchSearch && matchCat;
  }), [searchQuery, selectedCategory]);

  const totalLessons = selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalVideos = selectedCourse.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.youtubeId).length, 0);
  const completedModules = selectedCourse.modules.filter(m => m.completed).length;
  const progress = Math.round((completedModules / selectedCourse.modules.length) * 100);
  const Icon = selectedCourse.categoryIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center"><BookOpen className="h-4 w-4 text-purple-600" /></div>
          <h1 className="text-xl font-extrabold text-slate-900">Learning Content</h1>
          <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">Xebia Academy</span>
        </div>
        <p className="text-sm text-slate-500 ml-11">{XEBIA_COURSES.length} courses · {XEBIA_COURSES.reduce((a, c) => a + c.modules.length, 0)} modules · YouTube learning paths + assignments + assessments</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT: Course List */}
        <div className="xl:w-96 space-y-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border cursor-pointer transition-all ${selectedCategory === cat ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200' : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} isSelected={selectedCourse.id === course.id} onClick={setSelectedCourse} />
            ))}
            {filteredCourses.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No courses found for "{searchQuery}"</div>}
          </div>
        </div>

        {/* RIGHT: Course Detail */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={selectedCourse.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
              {/* Hero Banner */}
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${selectedCourse.categoryColor} p-7 text-white shadow-xl`}>
                <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center"><Icon className="h-6 w-6 text-white" /></div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{selectedCourse.category}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold bg-white/20 border border-white/20 px-2 py-0.5 rounded-full">{selectedCourse.badge}</span>
                          <span className="text-xs font-bold bg-white/20 border border-white/20 px-2 py-0.5 rounded-full">{selectedCourse.level}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right"><div className="text-2xl font-black">{progress}%</div><div className="text-[10px] text-white/60">Completed</div></div>
                  </div>
                  <h2 className="text-xl font-extrabold mb-2 leading-tight">{selectedCourse.title}</h2>
                  <p className="text-sm text-white/75 leading-relaxed mb-5">{selectedCourse.description}</p>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-4">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-white rounded-full" />
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: 'Modules', value: selectedCourse.modules.length },
                      { label: 'Lessons', value: totalLessons },
                      { label: 'YT Videos', value: totalVideos },
                      { label: 'Assignments', value: (ASSIGNMENTS[selectedCourse.id] || []).length },
                      { label: 'Assessments', value: (ASSESSMENTS[selectedCourse.id] || []).length },
                    ].map(stat => (
                      <div key={stat.label} className="text-center bg-white/10 border border-white/15 rounded-2xl py-2.5">
                        <div className="text-base font-black">{stat.value}</div>
                        <div className="text-[10px] text-white/60 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabbed content: Modules / Assignments / Assessments */}
              <CourseTabs course={selectedCourse} onPlay={(videoId, title) => setActiveVideo({ videoId, title })} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && <YouTubePlayer videoId={activeVideo.videoId} title={activeVideo.title} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>
    </div>
  );
}
