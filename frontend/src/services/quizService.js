/**
 * quizService.js
 * Quiz CRUD, timer persistence, shuffle logic, and auto-grading.
 */

const QUIZZES_KEY = 'xebia-lms-quizzes-v2';
const ATTEMPTS_KEY = 'xebia-lms-quiz-attempts';
const TIMER_KEY = 'xebia-lms-quiz-timer';

// ─── Initial quiz data ────────────────────────────────────────────────────────
const INITIAL_QUIZZES = [
  {
    id: 'quiz-genai-1',
    title: 'Generative AI Foundations Quiz',
    course: 'Generative AI Foundations',
    subject: 'Artificial Intelligence',
    teacherName: 'Priya Sharma',
    description: 'Test your foundational understanding of LLMs, prompt engineering, RAG, and generative AI concepts.',
    timeLimitMinutes: 15,
    passingPercentage: 70,
    totalMarks: 30,
    maxAttempts: 2,
    randomizeQuestions: true,
    randomizeOptions: true,
    showExplanations: true,
    status: 'Published',
    dueDate: '2026-07-20',
    questions: [
      { id: 'qz1-1', type: 'MCQ', text: 'What does LLM stand for in the context of Generative AI?', options: ['Large Language Model', 'Long Linear Module', 'Layered Learning Method', 'Low Latency Machine'], correct: 0, explanation: 'LLM stands for Large Language Model — a deep learning model trained on vast text datasets to understand and generate human-like text.', marks: 2, bloom: 'Remember' },
      { id: 'qz1-2', type: 'MCQ', text: 'Which architecture is the foundation of most modern LLMs like GPT and BERT?', options: ['Transformer', 'Recurrent Neural Network', 'Convolutional Neural Network', 'Boltzmann Machine'], correct: 0, explanation: 'The Transformer architecture, introduced in "Attention Is All You Need" (2017), is the foundation of modern LLMs due to its self-attention mechanism.', marks: 2, bloom: 'Remember' },
      { id: 'qz1-3', type: 'True/False', text: 'Prompt engineering can significantly improve LLM output quality without changing model weights.', options: ['True', 'False'], correct: 0, explanation: 'True. Prompt engineering techniques like few-shot prompting, chain-of-thought, and role assignment dramatically improve output quality with no model training required.', marks: 1, bloom: 'Understand' },
      { id: 'qz1-4', type: 'MCQ', text: 'What does "hallucination" mean in the context of LLMs?', options: ['Model generates confident but factually incorrect responses', 'Model refuses to answer a query', 'Model generates very slow responses', 'Model copies training data verbatim'], correct: 0, explanation: 'Hallucination refers to LLMs generating plausible-sounding but factually incorrect information, often presented confidently.', marks: 2, bloom: 'Understand' },
      { id: 'qz1-5', type: 'Fill-in-Blank', text: 'RAG stands for Retrieval-_____ Generation — a technique that grounds LLM responses in external knowledge sources.', options: ['Augmented', 'Accelerated', 'Automated', 'Adaptive'], correct: 0, explanation: 'RAG = Retrieval-Augmented Generation. It retrieves relevant documents from a knowledge base and provides them as context to the LLM before generating a response.', marks: 2, bloom: 'Remember' },
      { id: 'qz1-6', type: 'Multi-Select', text: 'Which of the following are common prompt engineering techniques? (Select all that apply)', options: ['Few-shot prompting', 'Chain-of-thought prompting', 'Zero-shot prompting', 'Gradient descent'], correct: [0, 1, 2], explanation: 'Few-shot, chain-of-thought, and zero-shot are all prompt engineering techniques. Gradient descent is a model training optimization algorithm, not a prompting technique.', marks: 3, bloom: 'Apply' },
      { id: 'qz1-7', type: 'MCQ', text: 'What is the primary advantage of using quantized LLM models?', options: ['Reduced memory footprint enabling deployment on smaller hardware', 'Higher accuracy than full precision models', 'Faster training on GPUs', 'Better understanding of code'], correct: 0, explanation: 'Quantization reduces model precision (e.g., from FP32 to INT8), dramatically reducing memory usage, enabling deployment on consumer hardware with minimal accuracy loss.', marks: 2, bloom: 'Understand' },
      { id: 'qz1-8', type: 'True/False', text: 'Fine-tuning an LLM requires the same amount of compute as pre-training it from scratch.', options: ['True', 'False'], correct: 1, explanation: 'False. Fine-tuning requires far less compute since the model already has learned representations. Techniques like LoRA further reduce this significantly.', marks: 1, bloom: 'Understand' },
      { id: 'qz1-9', type: 'MCQ', text: 'Which technique allows an LLM to learn from human feedback to align its outputs with human preferences?', options: ['RLHF (Reinforcement Learning from Human Feedback)', 'Supervised Fine-tuning only', 'Zero-shot learning', 'Contrastive learning'], correct: 0, explanation: 'RLHF trains a reward model from human preferences and then fine-tunes the LLM using reinforcement learning to maximize the reward — used in ChatGPT and Claude.', marks: 2, bloom: 'Understand' },
      { id: 'qz1-10', type: 'Multi-Select', text: 'Which of the following are valid use cases of Generative AI? (Select all that apply)', options: ['Code generation', 'Image synthesis', 'Text summarization', 'Database indexing'], correct: [0, 1, 2], explanation: 'Generative AI excels at code generation, image synthesis, and text summarization. Database indexing is a traditional computer science technique.', marks: 3, bloom: 'Apply' },
      { id: 'qz1-11', type: 'MCQ', text: 'What is the "context window" in an LLM?', options: ['Maximum tokens the model can process in one input/output', 'The UI window for chatting', 'The training data size', 'GPU memory allocation'], correct: 0, explanation: 'Context window is the maximum number of tokens (words/subwords) an LLM can process at once. Larger context windows allow processing of longer documents.', marks: 2, bloom: 'Remember' },
      { id: 'qz1-12', type: 'True/False', text: 'Vector embeddings are used in RAG systems to find semantically similar documents.', options: ['True', 'False'], correct: 0, explanation: 'True. RAG converts documents into vector embeddings and uses cosine/dot-product similarity to retrieve the most relevant chunks for a given query.', marks: 1, bloom: 'Understand' },
      { id: 'qz1-13', type: 'MCQ', text: 'What is "temperature" in the context of LLM inference?', options: ['Controls randomness in token selection — higher = more creative', 'GPU processing temperature', 'Training data distribution', 'Model size parameter'], correct: 0, explanation: 'Temperature controls the randomness of the model\'s output. Temperature=0 is deterministic; higher values (e.g., 1.0+) produce more varied, creative outputs.', marks: 2, bloom: 'Understand' },
      { id: 'qz1-14', type: 'Fill-in-Blank', text: 'LoRA (Low-Rank _____) is a parameter-efficient fine-tuning technique that adds trainable matrices to frozen model weights.', options: ['Adaptation', 'Architecture', 'Aggregation', 'Alignment'], correct: 0, explanation: 'LoRA = Low-Rank Adaptation. It injects trainable rank-decomposition matrices into transformer layers, enabling efficient fine-tuning with far fewer parameters.', marks: 2, bloom: 'Remember' },
      { id: 'qz1-15', type: 'MCQ', text: 'Which evaluation metric measures how often a model\'s generated text overlaps with reference text using n-gram precision?', options: ['BLEU Score', 'Perplexity', 'BERTScore', 'ROUGE-L'], correct: 0, explanation: 'BLEU (Bilingual Evaluation Understudy) measures n-gram precision overlap between generated and reference text. Commonly used for machine translation evaluation.', marks: 2, bloom: 'Remember' },
    ]
  },
  {
    id: 'quiz-docker-1',
    title: 'Docker & Kubernetes Mastery Quiz',
    course: 'Docker & Kubernetes Mastery',
    subject: 'DevOps Engineering',
    teacherName: 'Ananya Desai',
    description: 'Comprehensive quiz on Docker containerization, Kubernetes orchestration, and CI/CD pipelines.',
    timeLimitMinutes: 20,
    passingPercentage: 65,
    totalMarks: 30,
    maxAttempts: 2,
    randomizeQuestions: false,
    randomizeOptions: false,
    showExplanations: true,
    status: 'Published',
    dueDate: '2026-07-25',
    questions: [
      { id: 'qz2-1', type: 'MCQ', text: 'Which command shows resource usage (CPU, memory) of running Docker containers in real-time?', options: ['docker stats', 'docker inspect', 'docker top', 'docker logs'], correct: 0, explanation: 'docker stats provides a live stream of container resource usage statistics including CPU, memory, network I/O, and block I/O.', marks: 2, bloom: 'Remember' },
      { id: 'qz2-2', type: 'True/False', text: 'Docker volumes persist data after the container is deleted.', options: ['True', 'False'], correct: 0, explanation: 'True. Docker volumes are stored outside the container filesystem and persist independently, surviving container removal.', marks: 1, bloom: 'Remember' },
      { id: 'qz2-3', type: 'MCQ', text: 'What is the difference between COPY and ADD in a Dockerfile?', options: ['ADD supports URLs and tar extraction; COPY only copies local files', 'COPY supports URLs; ADD does not', 'They are identical', 'ADD is deprecated'], correct: 0, explanation: 'COPY simply copies files. ADD additionally handles URLs and automatically extracts tar archives. Best practice: prefer COPY unless you need ADD\'s extra features.', marks: 2, bloom: 'Understand' },
      { id: 'qz2-4', type: 'Fill-in-Blank', text: 'In Kubernetes, a _____ defines the desired number of pod replicas and handles rolling updates and rollbacks.', options: ['Deployment', 'ReplicaSet', 'Service', 'ConfigMap'], correct: 0, explanation: 'A Deployment manages ReplicaSets and provides declarative updates for Pods, including rolling updates and rollback capabilities.', marks: 2, bloom: 'Remember' },
      { id: 'qz2-5', type: 'Multi-Select', text: 'Which of the following improve Docker image security? (Select all that apply)', options: ['Use non-root USER', 'Use minimal base image (Alpine)', 'Scan with trivy or Snyk', 'Store secrets in ENV instructions'], correct: [0, 1, 2], explanation: 'Non-root USER, minimal base images, and scanning reduce the attack surface. Storing secrets in ENV instructions is insecure — use Docker secrets or environment injection at runtime.', marks: 3, bloom: 'Evaluate' },
      { id: 'qz2-6', type: 'MCQ', text: 'What does a Kubernetes Liveness Probe do when it fails?', options: ['Restarts the container', 'Stops traffic to the Pod', 'Deletes the Pod', 'Sends an alert email'], correct: 0, explanation: 'When a liveness probe fails, kubelet restarts the container. Liveness probes detect deadlocks or frozen processes.', marks: 2, bloom: 'Understand' },
      { id: 'qz2-7', type: 'True/False', text: 'A Kubernetes Namespace provides network-level isolation between applications by default.', options: ['True', 'False'], correct: 1, explanation: 'False. Namespaces provide logical isolation (RBAC, resource quotas, naming) but NOT network isolation by default. Use NetworkPolicy resources to enforce network isolation.', marks: 1, bloom: 'Analyse' },
      { id: 'qz2-8', type: 'MCQ', text: 'Which Kubernetes resource type stores configuration data as key-value pairs for use by Pods?', options: ['ConfigMap', 'Secret', 'PersistentVolume', 'ServiceAccount'], correct: 0, explanation: 'ConfigMap stores non-sensitive configuration data (application settings, environment variables). Secrets store sensitive data (passwords, tokens) with base64 encoding.', marks: 2, bloom: 'Remember' },
      { id: 'qz2-9', type: 'MCQ', text: 'What is the purpose of docker-compose.yml?', options: ['Define and run multi-container Docker applications', 'Build Docker images', 'Push images to registry', 'Configure Kubernetes clusters'], correct: 0, explanation: 'Docker Compose uses a YAML file to define services, networks, and volumes for multi-container applications, enabling one-command startup with docker-compose up.', marks: 2, bloom: 'Remember' },
      { id: 'qz2-10', type: 'True/False', text: 'Running docker build --no-cache forces Docker to rebuild all layers from scratch.', options: ['True', 'False'], correct: 0, explanation: 'True. --no-cache disables the Docker build cache, forcing all layers to be rebuilt from scratch regardless of whether they changed.', marks: 1, bloom: 'Apply' },
      { id: 'qz2-11', type: 'Multi-Select', text: 'Which are valid Kubernetes probe types? (Select all that apply)', options: ['Liveness', 'Readiness', 'Startup', 'Memory'], correct: [0, 1, 2], explanation: 'Kubernetes supports three probe types: Liveness (restart on failure), Readiness (traffic control), and Startup (for slow-starting apps). Memory is not a probe type.', marks: 3, bloom: 'Remember' },
      { id: 'qz2-12', type: 'MCQ', text: 'What does HPA (Horizontal Pod Autoscaler) scale based on by default?', options: ['CPU utilization', 'Memory usage', 'Network requests per second', 'Number of active users'], correct: 0, explanation: 'HPA scales pods based on CPU utilization by default. It can also scale on memory or custom/external metrics with additional configuration.', marks: 2, bloom: 'Understand' },
      { id: 'qz2-13', type: 'Fill-in-Blank', text: 'The Kubernetes resource _____ allows external traffic to reach services inside the cluster using HTTP routing rules.', options: ['Ingress', 'Service', 'LoadBalancer', 'NodePort'], correct: 0, explanation: 'An Ingress resource defines HTTP/HTTPS routing rules. An Ingress Controller (e.g., nginx, traefik) implements these rules to route external traffic.', marks: 2, bloom: 'Understand' },
      { id: 'qz2-14', type: 'True/False', text: 'Using latest as the Docker image tag is a recommended production practice.', options: ['True', 'False'], correct: 1, explanation: 'False. Using "latest" is unpredictable in production as it changes on each push. Always use specific version tags (e.g., myapp:1.2.3) for reproducible deployments.', marks: 1, bloom: 'Evaluate' },
      { id: 'qz2-15', type: 'MCQ', text: 'What is the purpose of a Kubernetes PersistentVolumeClaim (PVC)?', options: ['Request storage from a PersistentVolume for use in a Pod', 'Backup container data', 'Configure container environment', 'Define network policies'], correct: 0, explanation: 'A PVC is a request for storage by a user. It binds to a PersistentVolume (PV) that meets its requirements, abstracting storage implementation details from Pod definitions.', marks: 2, bloom: 'Understand' },
    ]
  },
  {
    id: 'quiz-spring-1',
    title: 'Spring Boot Enterprise APIs Quiz',
    course: 'Spring Boot Enterprise APIs',
    subject: 'Backend Development',
    teacherName: 'Siddharth Sen',
    description: 'Test your knowledge of Spring Boot REST APIs, JPA, Spring Security, and enterprise patterns.',
    timeLimitMinutes: 18,
    passingPercentage: 65,
    totalMarks: 30,
    maxAttempts: 2,
    randomizeQuestions: false,
    randomizeOptions: false,
    showExplanations: true,
    status: 'Published',
    dueDate: '2026-07-22',
    questions: [
      { id: 'qz3-1', type: 'MCQ', text: 'Which annotation maps an HTTP GET request to a specific handler method?', options: ['@GetMapping', '@RequestMapping(GET)', '@HttpGet', '@WebGet'], correct: 0, explanation: '@GetMapping is a composed annotation that acts as a shortcut for @RequestMapping(method = RequestMethod.GET).', marks: 2, bloom: 'Remember' },
      { id: 'qz3-2', type: 'True/False', text: '@Autowired annotation injects beans by type by default.', options: ['True', 'False'], correct: 0, explanation: 'True. @Autowired injects by type (class/interface). If multiple beans of the same type exist, use @Qualifier or @Primary to disambiguate.', marks: 1, bloom: 'Remember' },
      { id: 'qz3-3', type: 'MCQ', text: 'What does @PathVariable do in a Spring MVC controller?', options: ['Extracts a value from the URI template', 'Reads a request parameter', 'Reads a request header', 'Reads the request body'], correct: 0, explanation: '@PathVariable binds a method parameter to a URI template variable. E.g., @GetMapping("/users/{id}") with @PathVariable Long id.', marks: 2, bloom: 'Understand' },
      { id: 'qz3-4', type: 'Fill-in-Blank', text: 'The Spring annotation _____ validates the method parameter or return value against Jakarta Bean Validation constraints.', options: ['@Valid', '@Validate', '@Check', '@Verified'], correct: 0, explanation: '@Valid triggers Jakarta Bean Validation on annotated method parameters, typically on @RequestBody DTOs. Works with @NotNull, @Size, @Email, etc.', marks: 2, bloom: 'Apply' },
      { id: 'qz3-5', type: 'Multi-Select', text: 'Which Spring Data JPA interfaces provide CRUD operations? (Select all that apply)', options: ['CrudRepository', 'JpaRepository', 'PagingAndSortingRepository', 'MongoRepository'], correct: [0, 1, 2], explanation: 'CrudRepository, JpaRepository, and PagingAndSortingRepository are Spring Data JPA interfaces. MongoRepository is for MongoDB (Spring Data MongoDB).', marks: 3, bloom: 'Remember' },
      { id: 'qz3-6', type: 'MCQ', text: 'Which @Transactional propagation creates a new transaction, suspending any existing one?', options: ['REQUIRES_NEW', 'REQUIRED', 'NESTED', 'SUPPORTS'], correct: 0, explanation: 'REQUIRES_NEW always creates a new transaction, suspending any active transaction. Use when you need an independent transaction regardless of the caller\'s context.', marks: 2, bloom: 'Understand' },
      { id: 'qz3-7', type: 'True/False', text: 'Spring Boot auto-configuration can be completely disabled for a specific class using @SpringBootApplication(exclude = {}).', options: ['True', 'False'], correct: 0, explanation: 'True. @SpringBootApplication(exclude = {DataSourceAutoConfiguration.class}) disables specific auto-configurations, useful when you want manual configuration.', marks: 1, bloom: 'Apply' },
      { id: 'qz3-8', type: 'MCQ', text: 'What is the purpose of @ControllerAdvice in Spring?', options: ['Handles exceptions globally across all @Controller classes', 'Provides AOP advice to controllers', 'Configures security for controllers', 'Enables controller caching'], correct: 0, explanation: '@ControllerAdvice allows you to write global exception handlers, model attributes, and binder initializations that apply across multiple controllers.', marks: 2, bloom: 'Understand' },
      { id: 'qz3-9', type: 'MCQ', text: 'In Spring Security 6, the security filter chain is configured using:', options: ['SecurityFilterChain bean with HttpSecurity', 'WebSecurityConfigurerAdapter (extends)', 'security.xml configuration', '@EnableSecurity annotation'], correct: 0, explanation: 'Spring Security 6 uses a SecurityFilterChain bean approach. WebSecurityConfigurerAdapter was deprecated in Spring Security 5.7 and removed in 6.0.', marks: 2, bloom: 'Apply' },
      { id: 'qz3-10', type: 'True/False', text: 'spring.datasource.url in application.properties overrides the database URL set in environment variables.', options: ['True', 'False'], correct: 1, explanation: 'False. Environment variables have higher precedence than application.properties in Spring Boot\'s property source hierarchy. ENV variables override file-based properties.', marks: 1, bloom: 'Understand' },
      { id: 'qz3-11', type: 'Multi-Select', text: 'Which caching annotations does Spring provide? (Select all that apply)', options: ['@Cacheable', '@CachePut', '@CacheEvict', '@CacheAll'], correct: [0, 1, 2], explanation: '@Cacheable (read from cache), @CachePut (always update cache), and @CacheEvict (remove from cache) are Spring\'s core caching annotations. @CacheAll does not exist.', marks: 3, bloom: 'Remember' },
      { id: 'qz3-12', type: 'Fill-in-Blank', text: 'The _____ annotation in Spring Data JPA marks a repository method to execute a custom JPQL query.', options: ['@Query', '@SQL', '@CustomQuery', '@JPQL'], correct: 0, explanation: '@Query allows you to define JPQL or native SQL queries directly on repository methods. Use nativeQuery=true for native SQL.', marks: 2, bloom: 'Apply' },
      { id: 'qz3-13', type: 'MCQ', text: 'Which HTTP status code is returned by default when a Spring MVC method throws an unhandled exception?', options: ['500 Internal Server Error', '400 Bad Request', '404 Not Found', '503 Service Unavailable'], correct: 0, explanation: 'Unhandled exceptions result in 500 Internal Server Error. Use @ExceptionHandler or @ControllerAdvice to return appropriate status codes.', marks: 2, bloom: 'Understand' },
      { id: 'qz3-14', type: 'True/False', text: 'Lazy loading in JPA can cause the N+1 query problem.', options: ['True', 'False'], correct: 0, explanation: 'True. Lazy loading (default for collections) triggers a separate SQL query for each related entity when accessed, causing N+1 queries. Fix with JOIN FETCH or @EntityGraph.', marks: 1, bloom: 'Analyse' },
      { id: 'qz3-15', type: 'MCQ', text: 'What is the purpose of application.yml compared to application.properties?', options: ['YAML supports nested configuration with better readability', 'YAML has higher precedence', 'YAML is required for Spring Boot 3', 'There is no functional difference'], correct: 0, explanation: 'Both are functionally equivalent, but YAML (application.yml) supports nested structures making hierarchical configuration more readable than flat properties format.', marks: 2, bloom: 'Understand' },
    ]
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadQuizzes() {
  const raw = localStorage.getItem(QUIZZES_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { return [...INITIAL_QUIZZES]; }
  }
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(INITIAL_QUIZZES));
  return [...INITIAL_QUIZZES];
}

function saveQuizzes(list) {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(list));
}

function loadAttempts() {
  const raw = localStorage.getItem(ATTEMPTS_KEY);
  if (raw) { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

function saveAttempts(list) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list));
}

// Seeded shuffle — same quiz, same order per session
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Get all quizzes */
export function getQuizList() {
  return loadQuizzes();
}

/** Get single quiz by id */
export function getQuizById(id) {
  const list = loadQuizzes();
  return list.find(q => q.id === id) || null;
}

/** Get quiz with shuffled questions/options (for student taking) */
export function getQuizForStudent(id, shuffleSeed) {
  const quiz = getQuizById(id);
  if (!quiz) return null;
  const seed = shuffleSeed || Date.now();
  let questions = [...quiz.questions];
  if (quiz.randomizeQuestions) questions = seededShuffle(questions, seed);
  return { ...quiz, questions, _shuffleSeed: seed };
}

/** Create a new quiz */
export function createQuiz(quizData) {
  const list = loadQuizzes();
  const newQuiz = {
    ...quizData,
    id: quizData.id || `quiz-${Date.now()}`,
    status: quizData.status || 'Draft',
    createdAt: new Date().toISOString()
  };
  saveQuizzes([newQuiz, ...list]);
  return newQuiz;
}

/** Update an existing quiz */
export function updateQuiz(id, updates) {
  const list = loadQuizzes();
  const updated = list.map(q => q.id === id ? { ...q, ...updates } : q);
  saveQuizzes(updated);
  return updated.find(q => q.id === id);
}

/** Delete a quiz */
export function deleteQuiz(id) {
  const list = loadQuizzes();
  saveQuizzes(list.filter(q => q.id !== id));
}

// ─── Timer persistence ────────────────────────────────────────────────────────

/** Save remaining timer seconds */
export function saveTimer(quizId, email, secondsRemaining) {
  const key = `${TIMER_KEY}-${quizId}-${email}`;
  localStorage.setItem(key, String(secondsRemaining));
}

/** Load remaining timer seconds */
export function loadTimer(quizId, email) {
  const key = `${TIMER_KEY}-${quizId}-${email}`;
  const val = localStorage.getItem(key);
  return val !== null ? parseInt(val, 10) : null;
}

/** Clear timer after submission */
export function clearTimer(quizId, email) {
  const key = `${TIMER_KEY}-${quizId}-${email}`;
  localStorage.removeItem(key);
}

// ─── In-progress attempt save/restore ────────────────────────────────────────

/** Save current answers mid-quiz */
export function saveInProgressAttempt(quizId, email, answers, shuffleSeed) {
  const key = `${ATTEMPTS_KEY}-inprogress-${quizId}-${email}`;
  localStorage.setItem(key, JSON.stringify({ answers, shuffleSeed, savedAt: Date.now() }));
}

/** Restore in-progress attempt */
export function loadInProgressAttempt(quizId, email) {
  const key = `${ATTEMPTS_KEY}-inprogress-${quizId}-${email}`;
  const raw = localStorage.getItem(key);
  if (raw) { try { return JSON.parse(raw); } catch { return null; } }
  return null;
}

/** Clear in-progress attempt */
export function clearInProgressAttempt(quizId, email) {
  const key = `${ATTEMPTS_KEY}-inprogress-${quizId}-${email}`;
  localStorage.removeItem(key);
}

// ─── Auto-grading ─────────────────────────────────────────────────────────────

/**
 * Submit and auto-grade a quiz attempt.
 * Returns detailed result with per-question breakdown.
 */
export function submitQuizAttempt(quizId, email, studentName, enrollmentNo, answers, timeTakenSeconds) {
  const quiz = getQuizById(quizId);
  if (!quiz) return null;

  let totalEarned = 0;
  const totalMarks = quiz.totalMarks || quiz.questions.reduce((s, q) => s + (q.marks || 2), 0);

  const perQuestion = quiz.questions.map(q => {
    const studentAnswer = answers[q.id];
    let isCorrect = false;
    let earnedMarks = 0;

    if (q.type === 'Multi-Select') {
      const correctSet = new Set(Array.isArray(q.correct) ? q.correct : [q.correct]);
      const studentSet = new Set(Array.isArray(studentAnswer) ? studentAnswer : []);
      isCorrect = correctSet.size === studentSet.size && [...correctSet].every(v => studentSet.has(v));
      earnedMarks = isCorrect ? (q.marks || 3) : 0;
    } else if (q.type === 'Fill-in-Blank') {
      const correctOpt = q.options?.[q.correct] || '';
      isCorrect = typeof studentAnswer === 'number'
        ? studentAnswer === q.correct
        : String(studentAnswer || '').toLowerCase().trim() === correctOpt.toLowerCase().trim();
      earnedMarks = isCorrect ? (q.marks || 2) : 0;
    } else {
      isCorrect = studentAnswer === q.correct || String(studentAnswer) === String(q.correct);
      earnedMarks = isCorrect ? (q.marks || 2) : 0;
    }

    totalEarned += earnedMarks;

    return {
      questionId: q.id,
      questionText: q.text,
      type: q.type,
      studentAnswer,
      correctAnswer: q.correct,
      options: q.options,
      isCorrect,
      earnedMarks,
      maxMarks: q.marks || 2,
      explanation: quiz.showExplanations ? q.explanation : null,
      bloom: q.bloom
    };
  });

  const percentage = Math.round((totalEarned / totalMarks) * 100);
  const passed = percentage >= (quiz.passingPercentage || 70);

  const grade = (() => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  })();

  const result = {
    id: `attempt-${Date.now()}`,
    quizId,
    quizTitle: quiz.title,
    course: quiz.course,
    email,
    studentName,
    enrollmentNo,
    submittedAt: new Date().toISOString(),
    timeTakenSeconds,
    totalMarks,
    earnedMarks: totalEarned,
    percentage,
    grade,
    passed,
    perQuestion
  };

  // Persist
  const attempts = loadAttempts();
  // Remove any existing attempt for same student+quiz
  const filtered = attempts.filter(a => !(a.quizId === quizId && a.email?.toLowerCase() === email?.toLowerCase()));
  saveAttempts([result, ...filtered]);

  // Cleanup
  clearTimer(quizId, email);
  clearInProgressAttempt(quizId, email);

  return result;
}

/** Get all attempts for a student */
export function getStudentAttempts(email) {
  const attempts = loadAttempts();
  return attempts.filter(a => a.email?.toLowerCase() === email?.toLowerCase());
}

/** Get a specific attempt by quizId + email */
export function getAttemptByQuizAndEmail(quizId, email) {
  const attempts = loadAttempts();
  return attempts.find(a => a.quizId === quizId && a.email?.toLowerCase() === email?.toLowerCase()) || null;
}

/** Get all attempts for teacher analytics */
export function getAllAttempts() {
  return loadAttempts();
}

/** Check how many attempts a student has used */
export function getAttemptCount(quizId, email) {
  const attempts = loadAttempts();
  return attempts.filter(a => a.quizId === quizId && a.email?.toLowerCase() === email?.toLowerCase()).length;
}
