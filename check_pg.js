const { Client } = require('pg');

async function checkPostgres() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Sameer%4030020101@localhost:5432/postgres'
  });

  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log('✅ PostgreSQL is installed and running!');
    console.log('Version info:', res.rows[0].version);
    
    // Now check if hrms_portal exists
    const dbRes = await client.query("SELECT datname FROM pg_database WHERE datname = 'hrms_portal'");
    if (dbRes.rows.length > 0) {
      console.log('✅ Database "hrms_portal" already exists!');
    } else {
      console.log('❌ Database "hrms_portal" does not exist yet. Creating it now...');
      await client.query('CREATE DATABASE hrms_portal');
      console.log('✅ Database "hrms_portal" created successfully!');
    }
  } catch (err) {
    if (err.code === '28P01') {
      console.log('❌ Authentication failed! Password for user "postgres" is likely incorrect. Please check your password.');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused! PostgreSQL might not be running on port 5432 yet.');
    } else {
      console.error('❌ Error connecting to PostgreSQL:', err.message);
    }
  } finally {
    await client.end();
  }
}

checkPostgres();
