import bcrypt from 'bcrypt';
import { db } from '../db/index';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');

    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Check if user exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'test@kthbtm.com'))
      .limit(1);

    if (existing) {
      // Update existing
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          loginAttempts: '0',
          isActive: true,
          lockedUntil: null
        })
        .where(eq(users.email, 'test@kthbtm.com'));
      
      console.log('✅ Test user updated!');
    } else {
      // Create new
      await db.insert(users).values({
        nik: '9876543210987654',
        username: 'testuser',
        email: 'test@kthbtm.com',
        password: hashedPassword,
        fullName: 'Test User',
        role: 'ketua',
        isActive: true,
        twoFactorEnabled: false,
        loginAttempts: '0',
      });
      
      console.log('✅ Test user created!');
    }

    console.log('');
    console.log('📧 Email: test@kthbtm.com');
    console.log('🔑 Password: test123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createTestUser()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
