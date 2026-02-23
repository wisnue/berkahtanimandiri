import bcrypt from 'bcrypt';
import { db } from '../db/index';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...');

    // Hash password baru
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update password admin
    const result = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        loginAttempts: '0',
        isActive: true
      })
      .where(eq(users.email, 'admin@kthbtm.com'))
      .returning();

    if (result.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email: admin@kthbtm.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Username:', result[0].username);
      console.log('🆔 Role:', result[0].role);
    } else {
      console.log('❌ Admin user not found!');
    }
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    throw error;
  }
}

resetAdminPassword()
  .then(() => {
    console.log('✅ Password reset completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Password reset failed:', error);
    process.exit(1);
  });
