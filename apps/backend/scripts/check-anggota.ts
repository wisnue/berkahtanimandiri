import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../src/db/schema/index.js';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'kth_btm',
});

const db = drizzle(pool, { schema });

async function checkAnggota() {
  try {
    console.log('🔍 Checking Anggota Data...\n');
    
    // Count total anggota
    const allAnggota = await db.select().from(schema.anggota);
    console.log(`📊 Total Anggota in Database: ${allAnggota.length}`);
    
    if (allAnggota.length > 0) {
      console.log('\n📋 First 5 Anggota:');
      allAnggota.slice(0, 5).forEach((a, i) => {
        console.log(`\n${i + 1}. ${a.namaLengkap}`);
        console.log(`   - ID: ${a.id}`);
        console.log(`   - NIK: ${a.nik}`);
        console.log(`   - Nomor Anggota: ${a.nomorAnggota}`);
        console.log(`   - No. Telepon: ${a.nomorTelepon || '-'}`);
        console.log(`   - Status: ${a.statusAnggota}`);
      });
      
      console.log('\n\n✅ Data exists in database!');
    } else {
      console.log('\n❌ No anggota data found in database!');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkAnggota();
