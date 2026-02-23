import { db } from '../db/index';
import { pnbp } from '../db/schema/pnbp';
import { lahanKhdpk } from '../db/schema/lahan';
import { eq } from 'drizzle-orm';

async function updatePnbpLahan() {
  try {
    console.log('🔄 Updating PNBP records with lahan references...');

    // Get all lahan
    const allLahan = await db.select().from(lahanKhdpk);
    
    // Create mapping anggotaId -> lahanId
    const anggotaLahanMap = new Map();
    for (const lahan of allLahan) {
      anggotaLahanMap.set(lahan.anggotaId, lahan.id);
    }
    
    // Get all PNBP records
    const allPnbp = await db.select().from(pnbp);
    
    let updated = 0;
    for (const record of allPnbp) {
      const lahanId = anggotaLahanMap.get(record.anggotaId);
      if (lahanId && !record.lahanId) {
        await db.update(pnbp)
          .set({ lahanId: lahanId })
          .where(eq(pnbp.id, record.id));
        updated++;
      }
    }
    
    console.log(`✅ Updated ${updated} PNBP records with lahan references!`);
    
  } catch (error) {
    console.error('❌ Error updating PNBP records:', error);
    throw error;
  }
}

updatePnbpLahan()
  .then(() => {
    console.log('✅ Update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });
