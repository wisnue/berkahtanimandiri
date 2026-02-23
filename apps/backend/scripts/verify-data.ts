import { db } from '../src/config/db';
import { systemSettings, organizationSettings, backupHistory } from '../src/db/schema/settings';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('=== CHECKING DATABASE DATA ===\n');

  // Check System Settings table
  console.log('1. SYSTEM_SETTINGS TABLE:');
  const allSettings = await db.select().from(systemSettings);
  console.log(`   Total settings: ${allSettings.length}`);
  
  if (allSettings.length > 0) {
    console.log('   Sample settings:');
    allSettings.slice(0, 5).forEach(s => {
      console.log(`   - ${s.settingKey} (${s.settingCategory}): ${s.settingValue}`);
    });
    
    // Check security settings specifically
    const securitySettings = await db.select().from(systemSettings).where(eq(systemSettings.settingCategory, 'security'));
    console.log(`\n   Security settings: ${securitySettings.length}`);
    securitySettings.slice(0, 3).forEach(s => {
      console.log(`   - ${s.settingKey}: ${s.settingValue}`);
    });
  } else {
    console.log('   ⚠️  NO SETTINGS FOUND!');
  }

  // Check Organization Settings table
  console.log('\n1b. ORGANIZATION_SETTINGS TABLE:');
  const orgSettings = await db.select().from(organizationSettings);
  console.log(`   Total organizations: ${orgSettings.length}`);
  
  if (orgSettings.length > 0) {
    const org = orgSettings[0];
    console.log(`   - Name: ${org.organizationName}`);
    console.log(`   - Short: ${org.organizationShortName}`);
    console.log(`   - Phone: ${org.organizationPhone || 'N/A'}`);
    console.log(`   - Email: ${org.organizationEmail || 'N/A'}`);
  } else {
    console.log('   ⚠️  NO ORGANIZATION FOUND!');
  }

  // Check Backup History
  console.log('\n2. BACKUP HISTORY TABLE:');
  const backups = await db
    .select()
    .from(backupHistory)
    .limit(10);
  
  console.log(`   Total backups (not deleted): ${backups.length}`);
  
  if (backups.length > 0) {
    console.log('   Recent backups:');
    backups.slice(0, 5).forEach(b => {
      console.log(`   - ${b.filename} (${b.status}) - ${new Date(b.createdAt).toLocaleDateString()}`);
    });
  } else {
    console.log('   ⚠️  NO BACKUPS FOUND!');
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
