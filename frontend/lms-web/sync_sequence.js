import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_xWLeKM8bQSC4@ep-bold-art-atnxpmjb-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database!');
    
    // Check max id
    const maxIdRes = await client.query('SELECT MAX(id) FROM users');
    const maxId = maxIdRes.rows[0].max;
    console.log('Max ID in users table:', maxId);
    
    if (maxId) {
      // Sync the sequence
      await client.query(`SELECT setval('users_id_seq', ${maxId})`);
      console.log(`Sequence users_id_seq successfully synced to ${maxId}`);
    } else {
      console.log('No users found to sync sequence.');
    }
  } catch (err) {
    console.error('Error syncing sequence:', err);
  } finally {
    await client.end();
  }
}

run();
