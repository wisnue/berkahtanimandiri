import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'kth_btm',
  user: 'postgres',
  password: 'postgres',
});

async function checkSettings() {
  const client = await pool.connect();
  try {
    console.log('=== SYSTEM SETTINGS ===');
    const settings = await client.query('SELECT * FROM system_settings ORDER BY setting_category, setting_key LIMIT 20');
    console.log(`Total settings: ${settings.rows.length}`);
    console.log('\nFirst 10 settings:');
    settings.rows.slice(0, 10).forEach(s => {
      console.log(`- [${s.setting_category}] ${s.setting_key} = ${s.setting_value} (${s.setting_type})`);
    });

    console.log('\n=== ORGANIZATION SETTINGS ===');
    const org = await client.query('SELECT * FROM organization_settings LIMIT 1');
    if (org.rows.length > 0) {
      console.log('Organization found:');
      console.log(JSON.stringify(org.rows[0], null, 2));
    } else {
      console.log('No organization settings found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSettings();
