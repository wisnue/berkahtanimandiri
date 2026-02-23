import 'dotenv/config';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'kth_btm',
});

async function runMigration() {
  try {
    console.log('🔄 Running Migration: 001_audit_readiness_enhancement.sql\n');
    
    const migrationPath = path.join(__dirname, '../migrations/001_audit_readiness_enhancement.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing SQL migration...');
    await pool.query(sql);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n🔍 Verifying new columns...');
    
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'anggota'
      AND column_name IN ('jabatan_kth', 'nomor_sk_keanggotaan', 'tanggal_sk_keanggotaan', 'nomor_kk', 'foto_kk', 'periode_kepengurusan', 'alasan_keluar', 'file_sk_keanggotaan')
      ORDER BY column_name;
    `);
    
    console.log('\n📊 New columns added:');
    result.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.column_name} ✅`);
    });
    
    console.log(`\n✅ Total new columns: ${result.rows.length}/8`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
