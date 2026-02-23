import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  // Database connection
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'kth_btm',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '004_comprehensive_settings_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Running migration: 004_comprehensive_settings_system.sql');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('\nTables created:');
    console.log('  - system_settings (30+ default settings)');
    console.log('  - organization_settings');
    console.log('  - backup_history');
    console.log('  - backup_schedules');
    console.log('  - settings_audit_log');
    console.log('  - system_health_metrics');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n⚠️ Tables already exist. Migration may have been run before.');
      console.log('If you want to reset, run: DROP TABLE system_settings, organization_settings, backup_history, backup_schedules, settings_audit_log, system_health_metrics CASCADE;');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
