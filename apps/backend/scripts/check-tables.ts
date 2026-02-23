import { Client } from 'pg';

async function checkTables() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'kth_btm',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' 
      ORDER BY table_name
    `);
    
    console.log('Existing tables:');
    result.rows.forEach((row: any) => console.log(' -', row.table_name));
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
