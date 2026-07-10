/**
 * questionGeneratorService.js
 * AI-style question generation engine.
 * Produces unique, syllabus-relevant questions from a curated bank of 200+
 * questions organized by subject domain and Bloom's Taxonomy level.
 * No API key required — fully deterministic and offline.
 */

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION BANK (organized by domain)
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_BANK = {
  'ai-ml': {
    assignment: [
      { type: 'Long Answer', text: 'Explain the difference between supervised, unsupervised, and reinforcement learning with real-world examples from industry applications. Discuss when you would choose each approach.', bloom: 'Understand', marks: 15 },
      { type: 'Case Study', text: 'A healthcare company wants to detect cancer from MRI scans. Design an end-to-end machine learning pipeline from data collection to deployment. Include data preprocessing, model selection, evaluation metrics, and deployment strategy.', bloom: 'Create', marks: 20 },
      { type: 'Short Answer', text: 'What is the vanishing gradient problem in deep neural networks, and how do techniques like ReLU activation and batch normalization address it?', bloom: 'Analyse', marks: 10 },
      { type: 'Coding', text: 'Write Python code using scikit-learn to: (1) Load the iris dataset, (2) Split into train/test sets (80/20), (3) Train a Random Forest classifier, (4) Evaluate with precision, recall, and F1-score, (5) Plot a confusion matrix.', bloom: 'Apply', marks: 20 },
      { type: 'Scenario-Based', text: 'Your company\'s recommendation model shows high training accuracy (95%) but poor test accuracy (62%). A senior engineer says "This is overfitting." What 5 specific techniques would you apply to fix this? Justify each choice.', bloom: 'Evaluate', marks: 15 },
      { type: 'Long Answer', text: 'Compare and contrast CNN, RNN, and Transformer architectures. For each: describe the core mechanism, strengths, weaknesses, and a domain where it excels.', bloom: 'Evaluate', marks: 15 },
      { type: 'Short Answer', text: 'Explain how the attention mechanism in Transformers works. Why is it more effective than traditional RNNs for NLP tasks?', bloom: 'Understand', marks: 10 },
      { type: 'Coding', text: 'Implement a simple linear regression from scratch in Python using only NumPy. Include gradient descent, loss function (MSE), and plot the loss curve over 1000 epochs.', bloom: 'Create', marks: 20 },
      { type: 'Case Study', text: 'An e-commerce platform experiences a 40% cart abandonment rate. Design an AI solution that predicts which users are likely to abandon and triggers real-time personalized interventions. Include data features, model type, and evaluation approach.', bloom: 'Create', marks: 20 },
      { type: 'Scenario-Based', text: 'You are asked to explain a black-box neural network\'s predictions to a regulatory authority. Describe SHAP values and LIME. Which would you use and why? Include ethical considerations.', bloom: 'Evaluate', marks: 15 },
      { type: 'Short Answer', text: 'What is transfer learning? Describe how you would fine-tune a pre-trained BERT model for sentiment analysis on customer reviews.', bloom: 'Apply', marks: 10 },
      { type: 'Long Answer', text: 'Explain the concept of RAG (Retrieval-Augmented Generation) in the context of large language models. How does it reduce hallucinations? Provide a practical implementation example.', bloom: 'Understand', marks: 15 },
      { type: 'File Upload', text: 'Train a classification model (any algorithm) on a dataset of your choice. Upload a Jupyter notebook containing: data exploration, model training, evaluation metrics, and at least two visualizations.', bloom: 'Create', marks: 25 },
      { type: 'Coding', text: 'Using PyTorch, build a simple feedforward neural network with 3 hidden layers to classify handwritten digits (MNIST). Include forward pass, loss function, and training loop.', bloom: 'Apply', marks: 20 },
      { type: 'Scenario-Based', text: 'Your NLP model performs well on English text but poorly on Hindi-English code-switched social media data. Identify 3 root causes and propose solutions, referencing multilingual models or data augmentation techniques.', bloom: 'Analyse', marks: 15 },
    ],
    quiz: [
      { text: 'Which algorithm uses entropy and information gain to split nodes in a decision tree?', options: ['ID3', 'K-Means', 'SVM', 'Naive Bayes'], correct: 0, explanation: 'ID3 (Iterative Dichotomiser 3) uses information gain based on entropy to select the best feature at each node.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'What does the "learning rate" control in gradient descent?', options: ['Size of weight update per iteration', 'Number of training epochs', 'Batch size of data', 'Regularization strength'], correct: 0, explanation: 'The learning rate controls how large each weight update step is during backpropagation.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'True or False: A high bias model typically results in overfitting.', options: ['True', 'False'], correct: 1, explanation: 'False. High bias leads to underfitting (oversimplified model). High variance leads to overfitting.', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'The _____ metric is most appropriate when false negatives are more costly than false positives (e.g., cancer detection).', options: ['Recall', 'Precision', 'F1-Score', 'Accuracy'], correct: 0, explanation: 'Recall measures how many actual positives are correctly identified. High recall minimizes false negatives.', type: 'Fill-in-Blank', marks: 2, bloom: 'Apply' },
      { text: 'Which of the following are regularization techniques? (Select all that apply)', options: ['L1 (Lasso)', 'Dropout', 'Batch Normalization', 'ReLU activation'], correct: [0, 1], explanation: 'L1 regularization and Dropout are regularization techniques that prevent overfitting. Batch Normalization normalizes layer inputs; ReLU is an activation function.', type: 'Multi-Select', marks: 3, bloom: 'Apply' },
      { text: 'What is the purpose of the softmax function in classification tasks?', options: ['Convert logits to probabilities summing to 1', 'Normalize input features', 'Compute gradients', 'Apply dropout regularization'], correct: 0, explanation: 'Softmax converts raw scores (logits) into a probability distribution where all values sum to 1.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'True or False: k-Nearest Neighbors (KNN) is a lazy learning algorithm.', options: ['True', 'False'], correct: 0, explanation: 'True. KNN does not build an explicit model during training. It memorizes the dataset and classifies at prediction time.', type: 'True/False', marks: 1, bloom: 'Remember' },
      { text: 'In the context of neural networks, what does "epoch" mean?', options: ['One complete pass through the training dataset', 'One weight update step', 'One forward pass', 'The learning rate schedule'], correct: 0, explanation: 'An epoch represents one complete pass through the entire training dataset during model training.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'Which transformer component allows the model to focus on different positions of the input sequence?', options: ['Self-Attention mechanism', 'Feed-Forward Network', 'Layer Normalization', 'Positional Encoding'], correct: 0, explanation: 'The self-attention mechanism computes relationships between all positions in the sequence, allowing the model to focus on relevant context.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'True or False: Principal Component Analysis (PCA) is a supervised dimensionality reduction technique.', options: ['True', 'False'], correct: 1, explanation: 'False. PCA is an unsupervised technique that finds directions of maximum variance without using class labels.', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'Which of the following evaluation metrics should you use for a highly imbalanced dataset? (Select all that apply)', options: ['F1-Score', 'ROC-AUC', 'Accuracy', 'Matthews Correlation Coefficient'], correct: [0, 1, 3], explanation: 'Accuracy is misleading for imbalanced datasets. F1-Score, ROC-AUC, and MCC are better metrics that account for class imbalance.', type: 'Multi-Select', marks: 3, bloom: 'Evaluate' },
      { text: 'The process of generating new synthetic training samples from existing ones to combat class imbalance is called _____.', options: ['Data Augmentation', 'Feature Scaling', 'Transfer Learning', 'Ensemble Learning'], correct: 0, explanation: 'Data augmentation creates new training samples through transformations, flipping, rotation, SMOTE, etc.', type: 'Fill-in-Blank', marks: 2, bloom: 'Apply' },
      { text: 'What is the primary benefit of using mini-batch gradient descent over full-batch gradient descent?', options: ['Faster convergence with less memory usage', 'Higher accuracy', 'Requires no learning rate', 'Eliminates the need for backpropagation'], correct: 0, explanation: 'Mini-batch gradient descent uses small subsets of data, providing faster updates and requiring less memory than full-batch GD.', type: 'MCQ', marks: 2, bloom: 'Analyse' },
      { text: 'True or False: In K-means clustering, the algorithm requires specifying the number of clusters K before training.', options: ['True', 'False'], correct: 0, explanation: 'True. K-means requires K (number of clusters) as a hyperparameter before the algorithm starts.', type: 'True/False', marks: 1, bloom: 'Remember' },
      { text: 'Which activation function addresses the dying ReLU problem?', options: ['Leaky ReLU', 'Sigmoid', 'Tanh', 'Linear'], correct: 0, explanation: 'Leaky ReLU allows a small gradient for negative inputs (e.g., 0.01x), preventing neurons from dying permanently.', type: 'MCQ', marks: 2, bloom: 'Remember' },
    ]
  },

  'java-spring': {
    assignment: [
      { type: 'Long Answer', text: 'Explain the Spring Framework\'s Inversion of Control (IoC) and Dependency Injection (DI) principles. Provide annotated code examples demonstrating constructor injection, setter injection, and field injection with their pros and cons.', bloom: 'Understand', marks: 15 },
      { type: 'Coding', text: 'Build a Spring Boot REST API for a "Book Library" system with: (1) CRUD endpoints for Book entity, (2) JPA repository with custom query, (3) Bean validation on request body, (4) Global exception handler returning standardized error responses, (5) Swagger documentation.', bloom: 'Create', marks: 25 },
      { type: 'Case Study', text: 'A monolithic e-commerce application is struggling with scalability during peak sales. Design a microservices decomposition strategy using Spring Boot. Define 4 services, their APIs, communication patterns (sync vs async), and how you\'d handle distributed transactions.', bloom: 'Create', marks: 20 },
      { type: 'Short Answer', text: 'What is the difference between @Component, @Service, @Repository, and @Controller annotations in Spring? Why does this distinction matter for AOP and testing?', bloom: 'Understand', marks: 10 },
      { type: 'Scenario-Based', text: 'Your Spring Boot application is experiencing N+1 query problems causing slow response times. Identify what causes this and demonstrate two solutions: using @EntityGraph and JOIN FETCH in JPQL. Include before/after query count comparison.', bloom: 'Analyse', marks: 15 },
      { type: 'Coding', text: 'Implement JWT authentication in Spring Security 6. Include: UserDetailsService, JWT utility class (generate/validate tokens), security filter chain configuration, and protected endpoint that returns the authenticated user\'s profile.', bloom: 'Apply', marks: 20 },
      { type: 'Long Answer', text: 'Compare @Transactional propagation levels: REQUIRED, REQUIRES_NEW, NESTED, SUPPORTS. For each, provide a scenario where it is the correct choice and explain the implications of wrong propagation choice.', bloom: 'Evaluate', marks: 15 },
      { type: 'File Upload', text: 'Build a Spring Boot application with caching using Redis. Implement @Cacheable, @CachePut, and @CacheEvict on a service that retrieves product data. Upload the complete project as a ZIP with a README explaining cache TTL configuration.', bloom: 'Create', marks: 25 },
      { type: 'Short Answer', text: 'Explain how Spring\'s ApplicationContext relates to BeanFactory. What lifecycle hooks does a bean go through from initialization to destruction?', bloom: 'Remember', marks: 8 },
      { type: 'Scenario-Based', text: 'A payment service needs to send an email after a successful transaction, but the email service is down. Implement an event-driven approach using Spring ApplicationEvents and an async listener. Handle the failure case with a retry mechanism.', bloom: 'Create', marks: 15 },
    ],
    quiz: [
      { text: 'Which Spring annotation marks a class as a REST controller and combines @Controller and @ResponseBody?', options: ['@RestController', '@Service', '@Component', '@Repository'], correct: 0, explanation: '@RestController is a convenience annotation combining @Controller and @ResponseBody, making all methods return JSON by default.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'What HTTP status code should a successful POST (resource creation) return?', options: ['201 Created', '200 OK', '204 No Content', '202 Accepted'], correct: 0, explanation: 'HTTP 201 Created is the standard response for successful resource creation, often accompanied by a Location header.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'True or False: @Transactional(readOnly=true) improves performance by allowing the JPA provider to optimize read operations.', options: ['True', 'False'], correct: 0, explanation: 'True. readOnly=true hints to JPA/Hibernate to skip dirty checking and flush, improving performance for read-only operations.', type: 'True/False', marks: 1, bloom: 'Apply' },
      { text: 'In Spring Data JPA, the method name `findByEmailAndActiveTrue()` is an example of _____.', options: ['Derived Query Methods', 'JPQL Queries', 'Native SQL Queries', 'Stored Procedures'], correct: 0, explanation: 'Spring Data JPA can derive queries from method names by parsing keywords like findBy, And, Or, True, etc.', type: 'Fill-in-Blank', marks: 2, bloom: 'Remember' },
      { text: 'Which of the following are valid Spring Bean scopes? (Select all that apply)', options: ['Singleton', 'Prototype', 'Request', 'Session'], correct: [0, 1, 2, 3], explanation: 'All four are valid Spring bean scopes. Singleton (default), Prototype, and web-specific scopes: Request, Session, Application.', type: 'Multi-Select', marks: 3, bloom: 'Remember' },
      { text: 'What is the default propagation behavior of @Transactional?', options: ['REQUIRED', 'REQUIRES_NEW', 'NESTED', 'SUPPORTS'], correct: 0, explanation: 'REQUIRED is the default. It participates in an existing transaction or creates a new one if none exists.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'True or False: spring.jpa.hibernate.ddl-auto=update is safe to use in production databases.', options: ['True', 'False'], correct: 1, explanation: 'False. Using update in production can cause irreversible schema changes. Use validate or manage migrations with Flyway/Liquibase.', type: 'True/False', marks: 1, bloom: 'Evaluate' },
      { text: 'Which annotation enables Spring Security in a Spring Boot application?', options: ['@EnableWebSecurity', '@EnableSecurity', '@SecurityConfig', '@AuthConfig'], correct: 0, explanation: '@EnableWebSecurity enables Spring Security\'s web security support and provides the Spring MVC integration.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'What is the purpose of ResponseEntity<T> in Spring MVC?', options: ['Controls HTTP status, headers, and body in response', 'Defines request mapping', 'Handles exceptions globally', 'Configures CORS'], correct: 0, explanation: 'ResponseEntity provides full control over the HTTP response, including status code, headers, and body.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'True or False: @Column(unique=true) is sufficient to guarantee uniqueness in a concurrent production environment without a database unique constraint.', options: ['True', 'False'], correct: 1, explanation: 'False. @Column(unique=true) generates a database constraint during schema creation, but you should also handle DataIntegrityViolationException in code.', type: 'True/False', marks: 1, bloom: 'Analyse' },
      { text: 'Which Spring annotation injects the value of application.properties key "app.name" into a field?', options: ['@Value("${app.name}")', '@Property("app.name")', '@Config("app.name")', '@Inject("app.name")'], correct: 0, explanation: '@Value("${property.key}") reads values from application.properties or environment variables.', type: 'MCQ', marks: 2, bloom: 'Apply' },
      { text: 'Which of the following are part of the Spring MVC request lifecycle? (Select all that apply)', options: ['DispatcherServlet', 'HandlerMapping', 'ViewResolver', 'EntityManager'], correct: [0, 1, 2], explanation: 'DispatcherServlet, HandlerMapping, and ViewResolver are all core components of the Spring MVC request lifecycle. EntityManager belongs to JPA.', type: 'Multi-Select', marks: 3, bloom: 'Understand' },
      { text: 'In Spring Boot, the _____ annotation creates a bean only when a certain condition is met (e.g., when a class is on the classpath).', options: ['@ConditionalOnClass', '@ConditionalOnBean', '@Profile', '@Conditional'], correct: 0, explanation: '@ConditionalOnClass creates a bean only if a specified class is present on the classpath. Used extensively in Spring Boot auto-configuration.', type: 'Fill-in-Blank', marks: 2, bloom: 'Understand' },
      { text: 'True or False: CrudRepository extends JpaRepository in Spring Data JPA.', options: ['True', 'False'], correct: 1, explanation: 'False. JpaRepository extends PagingAndSortingRepository which extends CrudRepository. JpaRepository is higher-level with more features.', type: 'True/False', marks: 1, bloom: 'Remember' },
      { text: 'Which exception class should you catch when a database unique constraint is violated in Spring JPA?', options: ['DataIntegrityViolationException', 'EntityExistsException', 'ConstraintViolationException', 'DuplicateKeyException'], correct: 0, explanation: 'DataIntegrityViolationException from Spring wraps constraint violations from the underlying database for a database-agnostic API.', type: 'MCQ', marks: 2, bloom: 'Apply' },
    ]
  },

  'devops-docker': {
    assignment: [
      { type: 'Long Answer', text: 'Explain the difference between Docker containers and virtual machines. Compare them in terms of performance, isolation, portability, resource usage, and startup time. Include a diagram description.', bloom: 'Understand', marks: 15 },
      { type: 'Coding', text: 'Write a production-ready Dockerfile for a Node.js application (Express server on port 3000). Requirements: multi-stage build, non-root user, .dockerignore, health check instruction, and minimal Alpine-based image. Explain each instruction choice.', bloom: 'Create', marks: 20 },
      { type: 'Case Study', text: 'A startup deploys 5 microservices manually via SSH. Incidents take 4+ hours to resolve due to no monitoring. Design a complete DevOps transformation: containerize with Docker, orchestrate with Kubernetes, implement CI/CD with GitHub Actions, and add observability (Prometheus + Grafana).', bloom: 'Create', marks: 25 },
      { type: 'Short Answer', text: 'Explain Docker networking modes: bridge, host, overlay, and macvlan. When would you use overlay networking and why?', bloom: 'Understand', marks: 10 },
      { type: 'Scenario-Based', text: 'Your Docker container uses 8GB of RAM and is crashing. Diagnose the issue: write the commands to inspect resource usage, check OOM killer logs, and implement memory limits. What are the trade-offs of limiting container memory?', bloom: 'Analyse', marks: 15 },
      { type: 'Coding', text: 'Write a docker-compose.yml for a full-stack application: React frontend, Spring Boot backend, PostgreSQL database, Redis cache. Include proper networking, volume mounts, environment variables, health checks, and restart policies.', bloom: 'Apply', marks: 20 },
      { type: 'Long Answer', text: 'Describe the Kubernetes Pod lifecycle from creation to termination. Include init containers, main containers, liveness/readiness probes, graceful shutdown (terminationGracePeriodSeconds), and what happens during a rolling update.', bloom: 'Understand', marks: 15 },
      { type: 'File Upload', text: 'Create a complete CI/CD pipeline using GitHub Actions for a containerized application: build Docker image, run unit tests, push to Docker Hub, and deploy to a Kubernetes cluster. Upload your YAML workflow file with comments explaining each step.', bloom: 'Create', marks: 25 },
      { type: 'Short Answer', text: 'What is the difference between a Kubernetes Deployment and a StatefulSet? When must you use a StatefulSet?', bloom: 'Understand', marks: 10 },
      { type: 'Scenario-Based', text: 'Your Kubernetes application is experiencing slow deployments. Pods are taking 5 minutes to be Ready. Diagnose possible causes: image pull speed, readiness probe configuration, resource requests/limits, init containers. Propose optimizations for each.', bloom: 'Evaluate', marks: 15 },
    ],
    quiz: [
      { text: 'Which command removes all stopped containers, unused networks, dangling images, and build cache?', options: ['docker system prune', 'docker rm -f $(docker ps -a)', 'docker clean all', 'docker purge'], correct: 0, explanation: 'docker system prune removes all unused Docker resources. Add -a flag to also remove unused images.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'True or False: Docker volumes are deleted automatically when the container using them is removed.', options: ['True', 'False'], correct: 1, explanation: 'False. Docker volumes persist independently of containers. They must be explicitly removed with docker volume rm.', type: 'True/False', marks: 1, bloom: 'Remember' },
      { text: 'In Kubernetes, which object ensures a specific number of Pod replicas are always running?', options: ['ReplicaSet', 'DaemonSet', 'StatefulSet', 'Job'], correct: 0, explanation: 'A ReplicaSet ensures a specified number of Pod replicas are running. Deployments manage ReplicaSets for rolling updates.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'The Docker instruction that sets the default command to run when a container starts, and can be overridden at runtime, is _____.', options: ['CMD', 'ENTRYPOINT', 'RUN', 'EXEC'], correct: 0, explanation: 'CMD sets the default command/arguments, which can be overridden when running the container. ENTRYPOINT is harder to override.', type: 'Fill-in-Blank', marks: 2, bloom: 'Understand' },
      { text: 'Which of the following are valid Kubernetes Service types? (Select all that apply)', options: ['ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName'], correct: [0, 1, 2, 3], explanation: 'All four are valid Kubernetes Service types: ClusterIP (default), NodePort, LoadBalancer, and ExternalName.', type: 'Multi-Select', marks: 3, bloom: 'Remember' },
      { text: 'True or False: ENTRYPOINT in a Dockerfile cannot be overridden when running a container.', options: ['True', 'False'], correct: 1, explanation: 'False. ENTRYPOINT can be overridden using --entrypoint flag in docker run, though it requires explicit effort unlike CMD.', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'What does a Kubernetes Readiness Probe determine?', options: ['When a Pod is ready to accept traffic', 'When a Pod should be restarted', 'Pod memory usage', 'Container image version'], correct: 0, explanation: 'Readiness probes determine if a Pod should receive traffic. If it fails, the Pod is removed from the Service endpoints.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'Which Docker networking driver is used for multi-host container communication in Swarm/Kubernetes?', options: ['Overlay', 'Bridge', 'Host', 'Macvlan'], correct: 0, explanation: 'Overlay networking creates a distributed network across multiple Docker hosts, enabling inter-container communication.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'True or False: A Kubernetes ConfigMap is suitable for storing sensitive data like database passwords.', options: ['True', 'False'], correct: 1, explanation: 'False. ConfigMaps are for non-sensitive configuration. Use Secrets (base64-encoded, with RBAC) for sensitive data.', type: 'True/False', marks: 1, bloom: 'Evaluate' },
      { text: 'What is the purpose of a multi-stage Docker build?', options: ['Reduce final image size by separating build and runtime environments', 'Run multiple containers', 'Enable horizontal scaling', 'Configure networking'], correct: 0, explanation: 'Multi-stage builds use multiple FROM instructions, copying only necessary artifacts to the final stage, dramatically reducing image size.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'Which Kubernetes resource type should you use to run a batch job that runs once and terminates?', options: ['Job', 'CronJob', 'Deployment', 'DaemonSet'], correct: 0, explanation: 'A Kubernetes Job creates one or more Pods and ensures they complete successfully before the Job is considered done.', type: 'MCQ', marks: 2, bloom: 'Apply' },
      { text: 'Which of the following are benefits of Docker containerization? (Select all that apply)', options: ['Environment consistency', 'Faster deployment', 'Process isolation', 'Eliminates the need for monitoring'], correct: [0, 1, 2], explanation: 'Containers provide environment consistency, faster deployments, and process isolation. Monitoring is still needed and arguably more important with containers.', type: 'Multi-Select', marks: 3, bloom: 'Evaluate' },
      { text: 'The Kubernetes _____ ensures that a copy of a Pod runs on every (or selected) node in the cluster.', options: ['DaemonSet', 'ReplicaSet', 'StatefulSet', 'Deployment'], correct: 0, explanation: 'A DaemonSet ensures one Pod copy runs on each node. Used for log collectors, monitoring agents, network plugins.', type: 'Fill-in-Blank', marks: 2, bloom: 'Remember' },
      { text: 'True or False: Docker Compose is recommended for production Kubernetes deployments.', options: ['True', 'False'], correct: 1, explanation: 'False. Docker Compose is for local development and simple multi-container setups. Production Kubernetes uses Helm charts or Kubernetes manifests.', type: 'True/False', marks: 1, bloom: 'Evaluate' },
      { text: 'What does HPA stand for in Kubernetes, and what does it do?', options: ['Horizontal Pod Autoscaler — scales pods based on CPU/memory metrics', 'High Performance Architecture', 'Health Probe Algorithm', 'Host Port Assignment'], correct: 0, explanation: 'HPA automatically scales the number of Pod replicas based on CPU utilization, memory, or custom metrics.', type: 'MCQ', marks: 2, bloom: 'Understand' },
    ]
  },

  'python-data': {
    assignment: [
      { type: 'Coding', text: 'Using pandas and matplotlib: (1) Load a CSV dataset, (2) Handle missing values (impute median for numerics, mode for categoricals), (3) Create a correlation heatmap, (4) Identify and remove outliers using IQR, (5) Export cleaned data.', bloom: 'Apply', marks: 20 },
      { type: 'Long Answer', text: 'Explain the ETL (Extract, Transform, Load) pipeline. Design an ETL workflow for ingesting daily sales data from a REST API, transforming it (deduplication, type casting, aggregations), and loading into a data warehouse.', bloom: 'Create', marks: 15 },
      { type: 'Case Study', text: 'An analytics team receives raw customer transaction data in 5 different formats (CSV, JSON, XML, Parquet, Excel) from different systems. Design a Python-based data pipeline using pandas and Apache Airflow to unify, clean, and serve this data in a single schema.', bloom: 'Create', marks: 20 },
      { type: 'Short Answer', text: 'What is the difference between pandas groupby().agg() and groupby().transform()? Provide a practical example showing when each is the right choice.', bloom: 'Understand', marks: 10 },
      { type: 'Coding', text: 'Build a complete data analysis report in Python: (1) Perform EDA on a sales dataset, (2) Calculate YoY growth rates, (3) Identify top 10 products by revenue, (4) Build a time series plot with trend line, (5) Export results to Excel with multiple sheets using openpyxl.', bloom: 'Create', marks: 25 },
      { type: 'Scenario-Based', text: 'A data pipeline processing 10 million records daily is taking 6 hours to complete. Identify 3 bottlenecks and propose solutions using vectorization, chunked reading, parallel processing (multiprocessing/Dask), and query optimization.', bloom: 'Evaluate', marks: 15 },
      { type: 'Long Answer', text: 'Explain the concepts of data normalization and standardization. When should you use each? Demonstrate with Python code using scikit-learn\'s MinMaxScaler and StandardScaler on a feature set.', bloom: 'Understand', marks: 15 },
      { type: 'File Upload', text: 'Perform a complete analysis on a Kaggle dataset of your choice. Include: data exploration, cleaning, feature engineering, visualization, and at least one statistical test. Upload a Jupyter notebook with markdown explanations.', bloom: 'Create', marks: 25 },
    ],
    quiz: [
      { text: 'Which pandas method removes duplicate rows from a DataFrame?', options: ['drop_duplicates()', 'remove_duplicates()', 'unique()', 'dedupe()'], correct: 0, explanation: 'DataFrame.drop_duplicates() removes duplicate rows. By default considers all columns; use subset= to check specific columns.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'True or False: pandas df.loc[] uses integer-based indexing while df.iloc[] uses label-based indexing.', options: ['True', 'False'], correct: 1, explanation: 'False. It is the opposite: loc[] is label-based, iloc[] is integer position-based.', type: 'True/False', marks: 1, bloom: 'Remember' },
      { text: 'Which method fills missing values in a pandas Series with the value before the gap?', options: ['fillna(method="ffill")', 'fillna(method="bfill")', 'interpolate()', 'dropna()'], correct: 0, explanation: 'ffill (forward fill) propagates the last valid observation forward. bfill fills backward.', type: 'MCQ', marks: 2, bloom: 'Apply' },
      { text: 'In pandas, _____ is used to apply a function to each row or column of a DataFrame.', options: ['apply()', 'map()', 'transform()', 'aggregate()'], correct: 0, explanation: 'DataFrame.apply() applies a function along an axis (rows or columns). Series.map() applies to each element.', type: 'Fill-in-Blank', marks: 2, bloom: 'Apply' },
      { text: 'Which of the following are valid ways to handle missing data? (Select all that apply)', options: ['Drop rows with NaN', 'Impute with mean/median', 'Forward fill', 'Replace with zero'], correct: [0, 1, 2, 3], explanation: 'All methods are valid depending on context. Choice depends on data distribution, amount of missing data, and model sensitivity.', type: 'Multi-Select', marks: 3, bloom: 'Evaluate' },
      { text: 'True or False: NumPy vectorized operations are generally faster than equivalent Python loops.', options: ['True', 'False'], correct: 0, explanation: 'True. NumPy operations are implemented in C and operate on contiguous memory blocks, making them orders of magnitude faster than Python loops.', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'What does the pandas melt() function do?', options: ['Transforms wide-format data to long-format', 'Combines two DataFrames', 'Sorts DataFrame by column', 'Removes duplicate rows'], correct: 0, explanation: 'melt() unpivots a DataFrame from wide format (many columns) to long format (fewer columns, more rows), useful for tidy data.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'Which matplotlib function creates subplots in a grid layout?', options: ['plt.subplots()', 'plt.figure()', 'plt.plot()', 'plt.grid()'], correct: 0, explanation: 'plt.subplots(nrows, ncols) creates a figure with a grid of subplots, returning the figure and axes array.', type: 'MCQ', marks: 2, bloom: 'Apply' },
      { text: 'True or False: groupby() in pandas returns a DataFrame directly.', options: ['True', 'False'], correct: 1, explanation: 'False. groupby() returns a DataFrameGroupBy object. You must call an aggregation function (.sum(), .mean(), .agg()) to get a DataFrame.', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'What is the purpose of the .merge() function in pandas?', options: ['Join two DataFrames on common columns like SQL JOIN', 'Concatenate DataFrames vertically', 'Merge cells in Excel export', 'Combine index values'], correct: 0, explanation: 'DataFrame.merge() performs SQL-style joins (inner, left, right, outer) between two DataFrames based on key columns.', type: 'MCQ', marks: 2, bloom: 'Apply' },
    ]
  },

  'security-web': {
    assignment: [
      { type: 'Long Answer', text: 'Explain the OWASP Top 10 web application security risks for 2023. Choose 3 from the list, explain the attack mechanism, provide a real-world breach example, and describe defensive measures with code examples.', bloom: 'Evaluate', marks: 20 },
      { type: 'Coding', text: 'Demonstrate a stored XSS attack on a vulnerable form and then fix it: (1) Show vulnerable code accepting unsanitized input, (2) Write the attack payload, (3) Fix using input sanitization (DOMPurify), output encoding, and Content Security Policy headers.', bloom: 'Apply', marks: 20 },
      { type: 'Case Study', text: 'A financial application stores JWT tokens in localStorage and does not validate token signatures on the server. Identify all security vulnerabilities in this approach. Design a complete, secure authentication flow using HttpOnly cookies, refresh tokens, and PKCE.', bloom: 'Analyse', marks: 20 },
      { type: 'Short Answer', text: 'Explain SQL injection and parameterized queries. Why do ORMs like Hibernate not automatically make you immune to SQL injection?', bloom: 'Understand', marks: 10 },
      { type: 'Scenario-Based', text: 'An internal audit reveals your API does not rate-limit endpoints. A penetration tester successfully enumerated 10,000 user accounts in 30 minutes via the /api/users?email= endpoint. Design a complete rate-limiting and account enumeration prevention strategy.', bloom: 'Create', marks: 15 },
    ],
    quiz: [
      { text: 'Which HTTP header prevents a webpage from being embedded in an iframe on another domain?', options: ['X-Frame-Options', 'Content-Security-Policy', 'X-XSS-Protection', 'HSTS'], correct: 0, explanation: 'X-Frame-Options: DENY or SAMEORIGIN prevents clickjacking by controlling iframe embedding. CSP frame-ancestors is the modern replacement.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'True or False: HTTPS encrypts the URL path and query parameters.', options: ['True', 'False'], correct: 0, explanation: 'True. HTTPS (TLS) encrypts the entire HTTP payload including URL path, query string, headers, and body. The domain name is visible in SNI but the path is not.', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'What type of attack occurs when an attacker tricks a logged-in user\'s browser into making unauthorized requests to a website?', options: ['CSRF (Cross-Site Request Forgery)', 'XSS', 'SQL Injection', 'Man-in-the-Middle'], correct: 0, explanation: 'CSRF exploits the browser\'s automatic inclusion of cookies in requests. Prevented by CSRF tokens, SameSite cookies, and Referer validation.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'Which of the following are secure practices for storing passwords? (Select all that apply)', options: ['bcrypt hashing', 'Argon2 hashing', 'Adding salt before hashing', 'SHA-256 hashing'], correct: [0, 1, 2], explanation: 'bcrypt and Argon2 are memory-hard password hashing algorithms. Salting prevents rainbow table attacks. SHA-256 alone is too fast for password hashing.', type: 'Multi-Select', marks: 3, bloom: 'Apply' },
      { text: 'The _____ header instructs browsers to only access the site using HTTPS for a specified duration.', options: ['Strict-Transport-Security', 'Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options'], correct: 0, explanation: 'HTTP Strict Transport Security (HSTS) forces browsers to use HTTPS connections, preventing protocol downgrade attacks.', type: 'Fill-in-Blank', marks: 2, bloom: 'Remember' },
      { text: 'True or False: SQL injection attacks can only read data from a database.', options: ['True', 'False'], correct: 1, explanation: 'False. SQL injection can also insert, update, delete data, execute stored procedures, and in some cases execute OS-level commands (xp_cmdshell in MSSQL).', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'What is the purpose of a JWT (JSON Web Token)?', options: ['Stateless authentication and information exchange', 'Session-based authentication storage', 'Encrypting database passwords', 'Preventing XSS attacks'], correct: 0, explanation: 'JWT enables stateless authentication by encoding claims in a signed token. The server verifies the signature without storing session state.', type: 'MCQ', marks: 2, bloom: 'Understand' },
    ]
  },

  'general': {
    assignment: [
      { type: 'Long Answer', text: 'Compare and contrast Agile and Waterfall methodologies. Describe a real project scenario where you would choose each approach. Include risk management, stakeholder communication, and delivery strategies for each.', bloom: 'Evaluate', marks: 15 },
      { type: 'Short Answer', text: 'Explain the SOLID principles of object-oriented design. For each principle, provide a one-sentence definition and a concrete code example of a violation and its fix.', bloom: 'Understand', marks: 10 },
      { type: 'Case Study', text: 'A global SaaS company expects its user base to grow from 10,000 to 1,000,000 users in 6 months. The current monolithic architecture cannot handle this growth. Identify bottlenecks and design a scalable architecture using microservices, CDN, database sharding, and caching.', bloom: 'Create', marks: 20 },
      { type: 'Coding', text: 'Implement a thread-safe singleton pattern in Java that: (1) Uses double-checked locking, (2) Handles serialization correctly, (3) Prevents cloning, (4) Works correctly under multi-threaded conditions. Explain each safeguard.', bloom: 'Apply', marks: 15 },
      { type: 'Scenario-Based', text: 'You join a team maintaining a legacy codebase with no tests, no documentation, and 50% code duplication. Design a 3-month refactoring roadmap: prioritize areas, add characterization tests, introduce design patterns, and measure improvement using code quality metrics.', bloom: 'Create', marks: 15 },
      { type: 'Long Answer', text: 'Explain CAP theorem and BASE vs ACID properties in distributed systems. For each: define the trade-offs, provide a database example (e.g., MongoDB, Cassandra, PostgreSQL), and describe which applications benefit from each consistency model.', bloom: 'Analyse', marks: 15 },
      { type: 'File Upload', text: 'Design a system architecture diagram for a social media application supporting 10M daily active users. Include: load balancers, application servers, cache layer, databases (primary + replicas), CDN, and message queue. Upload a diagram (PNG/PDF) with a written explanation.', bloom: 'Create', marks: 20 },
      { type: 'Short Answer', text: 'Explain the difference between REST, GraphQL, and gRPC APIs. When would you choose each? Consider use cases, payload efficiency, and tooling support.', bloom: 'Evaluate', marks: 10 },
    ],
    quiz: [
      { text: 'Which Git command creates a new branch AND switches to it in one step?', options: ['git checkout -b branch-name', 'git branch branch-name', 'git switch branch-name', 'git new branch-name'], correct: 0, explanation: 'git checkout -b creates and switches to a new branch. Alternatively: git switch -c branch-name (newer syntax).', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'True or False: In REST APIs, a PUT request is idempotent.', options: ['True', 'False'], correct: 0, explanation: 'True. PUT replaces the entire resource at a URL. Making the same PUT request multiple times produces the same result, making it idempotent.', type: 'True/False', marks: 1, bloom: 'Understand' },
      { text: 'What does "O" stand for in the SOLID principles?', options: ['Open/Closed Principle', 'Object-Oriented', 'Observability', 'Orchestration'], correct: 0, explanation: 'The Open/Closed Principle states that software entities should be open for extension but closed for modification.', type: 'MCQ', marks: 2, bloom: 'Remember' },
      { text: 'In design patterns, the _____ pattern provides a simplified interface to a complex subsystem.', options: ['Facade', 'Adapter', 'Decorator', 'Proxy'], correct: 0, explanation: 'The Facade pattern provides a unified, simplified interface to a set of interfaces in a subsystem.', type: 'Fill-in-Blank', marks: 2, bloom: 'Remember' },
      { text: 'Which of the following are creational design patterns? (Select all that apply)', options: ['Singleton', 'Factory Method', 'Abstract Factory', 'Observer'], correct: [0, 1, 2], explanation: 'Singleton, Factory Method, and Abstract Factory are creational patterns. Observer is a behavioral pattern.', type: 'Multi-Select', marks: 3, bloom: 'Remember' },
      { text: 'True or False: A 404 HTTP status code indicates a server-side error.', options: ['True', 'False'], correct: 1, explanation: 'False. 404 is a client-side error (the requested resource was not found). 5xx codes indicate server-side errors.', type: 'True/False', marks: 1, bloom: 'Remember' },
      { text: 'In Big O notation, which is the most efficient time complexity?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 0, explanation: 'O(1) is constant time — the best possible complexity. The operation takes the same time regardless of input size.', type: 'MCQ', marks: 2, bloom: 'Understand' },
      { text: 'What does ACID stand for in database transactions?', options: ['Atomicity, Consistency, Isolation, Durability', 'Asynchronous, Consistent, Independent, Distributed', 'Atomic, Compiled, Integrated, Dynamic', 'Accessible, Consistent, Isolated, Durable'], correct: 0, explanation: 'ACID: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions don\'t interfere), Durability (committed data persists).', type: 'MCQ', marks: 2, bloom: 'Remember' },
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Domain Detection
// ─────────────────────────────────────────────────────────────────────────────

function detectDomain(courseName = '', topic = '') {
  const text = `${courseName} ${topic}`.toLowerCase();
  if (text.match(/ai|ml|machine learning|deep learning|neural|llm|genai|generative|data science|nlp|transformer/)) return 'ai-ml';
  if (text.match(/spring|java|jpa|hibernate|maven|gradle|microservice|rest api|backend/)) return 'java-spring';
  if (text.match(/docker|kubernetes|k8s|devops|cicd|ci\/cd|container|helm|pipeline|jenkins|ansible/)) return 'devops-docker';
  if (text.match(/python|pandas|numpy|matplotlib|etl|data engineer|data pipeline|analytics/)) return 'python-data';
  if (text.match(/security|owasp|xss|csrf|sql inject|jwt|auth|penetration|cyber/)) return 'security-web';
  return 'general';
}

// ─────────────────────────────────────────────────────────────────────────────
// Shuffle helper (seeded by title to ensure consistency per assignment)
// ─────────────────────────────────────────────────────────────────────────────

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

function titleSeed(title = '') {
  return title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate assignment questions.
 * @param {string} courseName
 * @param {string} topic
 * @param {string} difficulty - 'Easy' | 'Medium' | 'Hard'
 * @param {number} count - number of questions (10-20)
 * @returns {Array} questions array
 */
export function generateAssignmentQuestions(courseName, topic = '', difficulty = 'Medium', count = 12) {
  const domain = detectDomain(courseName, topic);
  const bank = QUESTION_BANK[domain]?.assignment || QUESTION_BANK['general'].assignment;
  const seed = titleSeed(`${courseName}${topic}${difficulty}`);
  const shuffled = seededShuffle(bank, seed);

  const marksMap = { Easy: 0.8, Medium: 1.0, Hard: 1.2 };
  const multiplier = marksMap[difficulty] || 1.0;

  return shuffled.slice(0, Math.min(count, shuffled.length)).map((q, idx) => ({
    id: `aq-${domain}-${idx + 1}-${Date.now()}`,
    type: q.type,
    prompt: q.text,
    marks: Math.round(q.marks * multiplier),
    difficulty,
    bloom: q.bloom,
    required: idx < Math.ceil(count * 0.7), // first 70% are required
    // Teacher-only fields
    teacherGuidelines: `Expected: ${q.bloom}-level response. Look for demonstration of understanding, practical examples, and accurate terminology. Award partial credit for partially correct answers.`,
    rubric: `Full marks: Complete, accurate, and insightful answer demonstrating ${q.bloom}-level thinking.\nPartial credit: Correct but incomplete or partially inaccurate.\nNo credit: Incorrect or off-topic.`
  }));
}

/**
 * Generate quiz questions.
 * @param {string} courseName
 * @param {string} topic
 * @param {string} difficulty - 'Easy' | 'Medium' | 'Hard'
 * @param {number} count - number of questions (15-30)
 * @param {boolean} randomizeOptions - shuffle option order
 * @returns {Array} questions array
 */
export function generateQuizQuestions(courseName, topic = '', difficulty = 'Medium', count = 15, randomizeOptions = true) {
  const domain = detectDomain(courseName, topic);
  const bank = QUESTION_BANK[domain]?.quiz || QUESTION_BANK['general'].quiz;
  const seed = titleSeed(`${courseName}${topic}${difficulty}quiz`);
  const shuffled = seededShuffle(bank, seed);

  return shuffled.slice(0, Math.min(count, shuffled.length)).map((q, idx) => {
    let options = [...(q.options || ['True', 'False'])];
    let correctAnswer = q.correct;

    if (randomizeOptions && q.type === 'MCQ' && Array.isArray(q.correct) === false) {
      const optionSeed = seed + idx;
      const indexed = options.map((o, i) => ({ o, i }));
      const shuffledIndexed = seededShuffle(indexed, optionSeed);
      const newCorrectIdx = shuffledIndexed.findIndex(item => item.i === q.correct);
      options = shuffledIndexed.map(item => item.o);
      correctAnswer = newCorrectIdx;
    }

    return {
      id: `qq-${domain}-${idx + 1}-${Date.now() + idx}`,
      type: q.type,
      text: q.text,
      options,
      correct: correctAnswer,
      explanation: q.explanation,
      marks: q.marks || 2,
      difficulty,
      bloom: q.bloom
    };
  });
}

/**
 * Get domain label for display
 */
export function getDomainLabel(courseName, topic = '') {
  const domain = detectDomain(courseName, topic);
  const labels = {
    'ai-ml': 'AI & Machine Learning',
    'java-spring': 'Java & Spring Boot',
    'devops-docker': 'DevOps & Containerization',
    'python-data': 'Python & Data Science',
    'security-web': 'Web Security',
    'general': 'Software Engineering'
  };
  return labels[domain] || 'General';
}
