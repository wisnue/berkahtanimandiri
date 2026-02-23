import { pool } from '../config/db';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSessionMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting session management migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../../migrations/003_session_management.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    console.log('📝 Executing migration...');
    
    // Execute the migration
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Session management migration completed successfully!');
    console.log('\nChanges:');
    console.log('  - Sessions table enhanced with activity tracking');
    console.log('  - Added user_id, last_activity, ip_address, user_agent columns');
    console.log('  - Created session_history table');
    console.log('  - Added triggers for one-session-per-user enforcement');
    console.log('  - Created clean_expired_sessions() function');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runSessionMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
