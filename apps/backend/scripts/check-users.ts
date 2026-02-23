import { Client } from 'pg';

async function checkUsersSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'kth_btm',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get users table schema
    const schemaResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 USERS TABLE SCHEMA:');
    console.log('='.repeat(80));
    schemaResult.rows.forEach((col: any) => {
      console.log(`${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.character_maximum_length || ''}`);
    });

    // Get all users
    const usersResult = await client.query(`
      SELECT * FROM users ORDER BY id
    `);
    
    console.log('\n\n📋 ALL USERS:');
    console.log('='.repeat(80));
    usersResult.rows.forEach((user: any) => {
      console.log(JSON.stringify(user, null, 2));
      console.log('-'.repeat(80));
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsersSchema();
