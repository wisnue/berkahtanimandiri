import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'kth_btm',
});

async function checkSchema() {
  try {
    console.log('🔍 Checking ACTUAL Database Schema...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'anggota'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Columns in anggota table:\n');
    result.rows.forEach((col, i) => {
      console.log(`${i + 1}. ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log(`\n✅ Total columns: ${result.rows.length}`);
    
    // Test simple query
    console.log('\n🧪 Testing simple SELECT...');
    const testResult = await pool.query('SELECT id, nik, nama_lengkap, nomor_anggota, status_anggota FROM anggota LIMIT 5');
    console.log(`✅ Found ${testResult.rows.length} rows`);
    
    if (testResult.rows.length > 0) {
      console.log('\n📋 Sample data:');
      testResult.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.nama_lengkap} (NIK: ${row.nik}, No: ${row.nomor_anggota})`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkSchema();
