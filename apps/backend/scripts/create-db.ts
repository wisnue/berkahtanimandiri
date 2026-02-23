import { Client } from 'pg';

async function createDatabase() {
  // Connect to postgres database to create our app database
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'kth_btm'"
    );

    if (checkDb.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE kth_btm');
      console.log('✅ Database "kth_btm" created successfully');
    } else {
      console.log('ℹ️  Database "kth_btm" already exists');
    }
  } catch (error) {
    console.error('❌ Error creating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
