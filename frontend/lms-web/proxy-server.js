import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xWLeKM8bQSC4@ep-bold-art-atnxpmjb-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

// Prevent unhandled error event from crashing the node process on idle connection issues
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// GET users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST user
app.post('/api/users', async (req, res) => {
  const { name, email, role, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, role, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, role, status || 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH user
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, status = $4 WHERE id = $5 RETURNING *',
      [name, email, role, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET universities
app.get('/api/universities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM universities ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST university
app.post('/api/universities', async (req, res) => {
  const { name, domain } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO universities (name, domain) VALUES ($1, $2) RETURNING *',
      [name, domain]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET courses
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST course
app.post('/api/courses', async (req, res) => {
  const { title, duration, progress } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO courses (title, duration, progress) VALUES ($1, $2, $3) RETURNING *',
      [title, duration, progress || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH course progress
app.patch('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  try {
    const result = await pool.query(
      'UPDATE courses SET progress = $1 WHERE id = $2 RETURNING *',
      [progress, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET batches
app.get('/api/batches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM batches ORDER BY id ASC');
    const mapped = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      studentsCount: r.students_count
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST batch
app.post('/api/batches', async (req, res) => {
  const { name, studentsCount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO batches (name, students_count) VALUES ($1, $2) RETURNING *',
      [name, studentsCount || 0]
    );
    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      studentsCount: result.rows[0].students_count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH batch studentsCount
app.patch('/api/batches/:id', async (req, res) => {
  const { id } = req.params;
  const { studentsCount } = req.body;
  try {
    const result = await pool.query(
      'UPDATE batches SET students_count = $1 WHERE id = $2 RETURNING *',
      [studentsCount, id]
    );
    res.json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      studentsCount: result.rows[0].students_count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET enrolments
app.get('/api/enrolments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enrolments ORDER BY id ASC');
    const mapped = result.rows.map(r => ({
      id: r.id,
      studentName: r.student_name,
      batchName: r.batch_name,
      status: r.status
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST enrolment
app.post('/api/enrolments', async (req, res) => {
  const { studentName, batchName, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO enrolments (student_name, batch_name, status) VALUES ($1, $2, $3) RETURNING *',
      [studentName, batchName, status || 'Active']
    );
    res.status(201).json({
      id: result.rows[0].id,
      studentName: result.rows[0].student_name,
      batchName: result.rows[0].batch_name,
      status: result.rows[0].status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET assessments
app.get('/api/assessments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assessments ORDER BY id ASC');
    const mapped = result.rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      question: r.question,
      options: r.options,
      correctAnswer: r.correct_answer
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET comments
app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comments ORDER BY id ASC');
    const mapped = result.rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      user: r.username,
      content: r.content,
      timestamp: r.timestamp
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST comment
app.post('/api/comments', async (req, res) => {
  const { courseId, user, content, timestamp } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO comments (course_id, username, content, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [courseId, user, content, timestamp || 'Just now']
    );
    res.status(201).json({
      id: result.rows[0].id,
      courseId: result.rows[0].course_id,
      user: result.rows[0].username,
      content: result.rows[0].content,
      timestamp: result.rows[0].timestamp
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments ORDER BY id ASC');
    const mapped = result.rows.map(r => ({
      id: r.id,
      trainer: r.trainer,
      courseTitle: r.course_title
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST assignment
app.post('/api/assignments', async (req, res) => {
  const { trainer, courseTitle } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO assignments (trainer, course_title) VALUES ($1, $2) RETURNING *',
      [trainer, courseTitle]
    );
    res.status(201).json({
      id: result.rows[0].id,
      trainer: result.rows[0].trainer,
      courseTitle: result.rows[0].course_title
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET approvals
app.get('/api/approvals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM approvals ORDER BY id ASC');
    const mapped = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      requestedBy: r.requested_by,
      status: r.status
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST approval
app.post('/api/approvals', async (req, res) => {
  const { title, requestedBy, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO approvals (title, requested_by, status) VALUES ($1, $2, $3) RETURNING *',
      [title, requestedBy, status || 'Pending']
    );
    res.status(201).json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      requestedBy: result.rows[0].requested_by,
      status: result.rows[0].status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH approval status
app.patch('/api/approvals/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE approvals SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      requestedBy: result.rows[0].requested_by,
      status: result.rows[0].status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Neon local proxy server running on http://localhost:${PORT}`);
});
