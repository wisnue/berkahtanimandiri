import { Client } from 'pg';
import bcrypt from 'bcrypt';

async function createAllRoleUsers() {
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

    const defaultPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const passwordExpiresAt = new Date();
    passwordExpiresAt.setDate(passwordExpiresAt.getDate() + 90);

    const users = [
      {
        nik: '1111111111111111',
        email: 'admin@kthbtm.com',
        username: 'admin',
        full_name: 'Administrator',
        role: 'admin',
      },
      {
        nik: '2222222222222222',
        email: 'ketua@kthbtm.com',
        username: 'ketua',
        full_name: 'Ketua KTH BTM',
        role: 'ketua',
      },
      {
        nik: '3333333333333333',
        email: 'sekretaris@kthbtm.com',
        username: 'sekretaris',
        full_name: 'Sekretaris KTH BTM',
        role: 'sekretaris',
      },
      {
        nik: '4444444444444444',
        email: 'bendahara@kthbtm.com',
        username: 'bendahara',
        full_name: 'Bendahara KTH BTM',
        role: 'bendahara',
      },
      {
        nik: '5555555555555555',
        email: 'anggota@kthbtm.com',
        username: 'anggota',
        full_name: 'Anggota KTH BTM',
        role: 'anggota',
      },
    ];

    console.log('🔄 Creating/Updating users for all roles...\n');

    for (const user of users) {
      // Check if user exists
      const existing = await client.query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [user.email]
      );

      if (existing.rows.length > 0) {
        // Update existing user
        await client.query(
          `UPDATE users 
           SET role = $1, full_name = $2, username = $3, updated_at = NOW()
           WHERE email = $4`,
          [user.role, user.full_name, user.username, user.email]
        );
        console.log(`✅ Updated: ${user.email} (${user.role})`);
      } else {
        // Insert new user
        await client.query(
          `INSERT INTO users (
            nik, email, username, password, full_name, role, 
            is_active, two_factor_enabled, password_changed_at, 
            password_expires_at, force_password_change
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)`,
          [
            user.nik,
            user.email,
            user.username,
            hashedPassword,
            user.full_name,
            user.role,
            true,
            false,
            passwordExpiresAt,
            false,
          ]
        );
        console.log(`✅ Created: ${user.email} (${user.role})`);
      }
    }

    // Show all users
    console.log('\n📋 ALL USERS IN SYSTEM:');
    console.log('='.repeat(100));
    const allUsers = await client.query(`
      SELECT email, username, full_name, role, is_active
      FROM users
      ORDER BY 
        CASE role
          WHEN 'admin' THEN 1
          WHEN 'ketua' THEN 2
          WHEN 'sekretaris' THEN 3
          WHEN 'bendahara' THEN 4
          WHEN 'anggota' THEN 5
          ELSE 6
        END
    `);
    
    console.log('');
    allUsers.rows.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.role.toUpperCase().padEnd(12)} | ${user.email.padEnd(30)} | ${user.full_name}`);
    });

    console.log('\n📊 SUMMARY:');
    console.log(`Total Users: ${allUsers.rows.length}`);
    console.log(`Default Password for all users: ${defaultPassword}`);
    console.log('\n⚠️  IMPORTANT: Change passwords after first login!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAllRoleUsers();
