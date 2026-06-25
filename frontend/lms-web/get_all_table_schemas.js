import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_xWLeKM8bQSC4@ep-bold-art-atnxpmjb-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database!');
    
    const tables = [
      'courses', 'batches', 'enrolments', 'assessments', 
      'comments', 'assignments', 'approvals'
    ];
    
    for (const t of tables) {
      const res = await client.query(`
        SELECT column_name, data_type, column_default
        FROM information_schema.columns 
        WHERE table_name = '${t}'
      `);
      console.log(`Schema for table "${t}":`);
      console.log(res.rows);
      
      const rowsRes = await client.query(`SELECT * FROM ${t}`);
      console.log(`Current rows in "${t}":`, rowsRes.rows);
      console.log('-------------------------------------------');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
