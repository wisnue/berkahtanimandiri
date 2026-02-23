import { Client } from 'pg';

async function findAdminAndUpdateRole() {
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

    // Check current roles
    const currentRoles = await client.query(`
      SELECT DISTINCT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role
    `);
    
    console.log('📊 CURRENT ROLES IN DATABASE:');
    console.log('='.repeat(80));
    currentRoles.rows.forEach((r: any) => {
      console.log(`Role: ${r.role.padEnd(20)} Count: ${r.count}`);
    });

    // Update admin user role from "ketua" to "admin"
    console.log('\n🔄 Updating admin@kthbtm.com role to "admin"...');
    
    const updateResult = await client.query(`
      UPDATE users 
      SET role = 'admin', updated_at = NOW()
      WHERE email = 'admin@kthbtm.com'
      RETURNING id, email, username, full_name, role
    `);

    if (updateResult.rows.length > 0) {
      console.log('✅ Successfully updated user:');
      console.log(JSON.stringify(updateResult.rows[0], null, 2));
    }

    // Show all users after update
    console.log('\n📋 ALL USERS AFTER UPDATE:');
    console.log('='.repeat(80));
    const allUsers = await client.query(`
      SELECT id, email, username, full_name, role, is_active
      FROM users
      ORDER BY id
    `);
    
    allUsers.rows.forEach((user: any) => {
      console.log(`
Email: ${user.email}
Username: ${user.username}
Full Name: ${user.full_name}
Role: ${user.role}
Active: ${user.is_active}
${'-'.repeat(80)}`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

findAdminAndUpdateRole();
