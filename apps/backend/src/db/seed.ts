import bcrypt from 'bcrypt';
import { db } from './index';
import { users } from './schema/users';
import { anggota } from './schema/anggota';
import { lahanKhdpk } from './schema/lahan';
import { pnbp } from './schema/pnbp';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@kthbtm.com')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists, skipping...');
    } else {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(users).values({
        nik: '1234567890123456',
        username: 'admin',
        email: 'admin@kthbtm.com',
        password: hashedPassword,
        fullName: 'Administrator',
        role: 'ketua',
        isActive: true,
        twoFactorEnabled: false,
        loginAttempts: '0',
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@kthbtm.com');
      console.log('🔑 Password: admin123');
    }

    // Check if anggota data already exists
    const existingAnggota = await db.select().from(anggota).limit(1);
    
    if (existingAnggota.length > 0) {
      console.log('⚠️  Anggota data already exists, skipping...');
    } else {
      // Seed 10 anggota data with BTM-{Year}-{Number} format
      const anggotaData = [
        {
          nomorAnggota: 'BTM-2020-001',
          nik: '3524011501900001',
          namaLengkap: 'Budi Santoso',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1990-01-15'),
          jenisKelamin: 'L',
          alamatLengkap: 'Jl. Raya Desa No. 12',
          rt: '002',
          rw: '003',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '081234567890',
          email: 'budi.santoso@gmail.com',
          pendidikan: 'SMA',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2020-01-10'),
          luasLahanGarapan: '2.5',
        },
        {
          nomorAnggota: 'BTM-2020-002',
          nik: '3524012506920002',
          namaLengkap: 'Siti Aminah',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1992-06-25'),
          jenisKelamin: 'P',
          alamatLengkap: 'Jl. Mawar No. 25',
          rt: '001',
          rw: '002',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '082345678901',
          email: 'siti.aminah@gmail.com',
          pendidikan: 'SMA',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2020-02-15'),
          luasLahanGarapan: '1.8',
        },
        {
          nomorAnggota: 'BTM-2019-001',
          nik: '3524011008880003',
          namaLengkap: 'Ahmad Fauzi',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1988-08-10'),
          jenisKelamin: 'L',
          alamatLengkap: 'Jl. Melati No. 8',
          rt: '003',
          rw: '001',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '083456789012',
          email: 'ahmad.fauzi@gmail.com',
          pendidikan: 'S1',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2019-11-20'),
          luasLahanGarapan: '3.2',
        },
        {
          nomorAnggota: 'BTM-2021-001',
          nik: '3524012003950004',
          namaLengkap: 'Dewi Lestari',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1995-03-20'),
          jenisKelamin: 'P',
          alamatLengkap: 'Jl. Kenanga No. 15',
          rt: '004',
          rw: '002',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '084567890123',
          email: 'dewi.lestari@gmail.com',
          pendidikan: 'SMA',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2021-03-05'),
          luasLahanGarapan: '2.0',
        },
        {
          nomorAnggota: 'BTM-2020-003',
          nik: '3524011812910005',
          namaLengkap: 'Joko Widodo',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1991-12-18'),
          jenisKelamin: 'L',
          alamatLengkap: 'Jl. Anggrek No. 20',
          rt: '002',
          rw: '004',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '085678901234',
          email: 'joko.widodo@gmail.com',
          pendidikan: 'SMP',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2020-06-12'),
          luasLahanGarapan: '1.5',
        },
        {
          nomorAnggota: 'BTM-2020-004',
          nik: '3524010507890006',
          namaLengkap: 'Rina Kusuma',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1989-07-05'),
          jenisKelamin: 'P',
          alamatLengkap: 'Jl. Sakura No. 32',
          rt: '001',
          rw: '003',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '086789012345',
          email: 'rina.kusuma@gmail.com',
          pendidikan: 'D3',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2020-08-22'),
          luasLahanGarapan: '2.2',
        },
        {
          nomorAnggota: 'BTM-2021-002',
          nik: '3524012211930007',
          namaLengkap: 'Agus Prasetyo',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1993-11-22'),
          jenisKelamin: 'L',
          alamatLengkap: 'Jl. Dahlia No. 5',
          rt: '005',
          rw: '001',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '087890123456',
          email: 'agus.prasetyo@gmail.com',
          pendidikan: 'SMA',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2021-01-08'),
          luasLahanGarapan: '2.8',
        },
        {
          nomorAnggota: 'BTM-2020-005',
          nik: '3524010309940008',
          namaLengkap: 'Sri Wahyuni',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1994-09-03'),
          jenisKelamin: 'P',
          alamatLengkap: 'Jl. Teratai No. 18',
          rt: '003',
          rw: '005',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '088901234567',
          email: 'sri.wahyuni@gmail.com',
          pendidikan: 'SMA',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2020-09-15'),
          luasLahanGarapan: '1.9',
        },
        {
          nomorAnggota: 'BTM-2019-002',
          nik: '3524011604870009',
          namaLengkap: 'Hendra Gunawan',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1987-04-16'),
          jenisKelamin: 'L',
          alamatLengkap: 'Jl. Bougenville No. 10',
          rt: '004',
          rw: '003',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '089012345678',
          email: 'hendra.gunawan@gmail.com',
          pendidikan: 'S1',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2019-07-30'),
          luasLahanGarapan: '3.5',
        },
        {
          nomorAnggota: 'BTM-2021-003',
          nik: '3524012801960010',
          namaLengkap: 'Nurul Hidayah',
          tempatLahir: 'Ngawi',
          tanggalLahir: new Date('1996-01-28'),
          jenisKelamin: 'P',
          alamatLengkap: 'Jl. Flamboyan No. 7',
          rt: '001',
          rw: '001',
          desa: 'Gembol',
          kecamatan: 'Karanganyar',
          kabupaten: 'Ngawi',
          provinsi: 'Jawa Timur',
          kodePos: '63271',
          nomorTelepon: '081098765432',
          email: 'nurul.hidayah@gmail.com',
          pendidikan: 'D3',
          pekerjaan: 'Petani',
          statusAnggota: 'aktif',
          tanggalBergabung: new Date('2021-05-18'),
          luasLahanGarapan: '2.1',
        },
      ];

      await db.insert(anggota).values(anggotaData);
      console.log('✅ 10 Anggota data created successfully!');
    }

    // Check if lahan data already exists
    const existingLahan = await db.select().from(lahanKhdpk).limit(1);
    
    if (existingLahan.length > 0) {
      console.log('⚠️  Lahan KHDPK data already exists, skipping...');
    } else {
      // Get all anggota for lahan data
      const allAnggota = await db.select().from(anggota);
      
      if (allAnggota.length > 0) {
        const lahanData = [];
        const petakNumbers = [74, 75, 76, 77, 78, 79, 80, 81, 82, 83];
        
        for (let i = 0; i < allAnggota.length && i < petakNumbers.length; i++) {
          const member = allAnggota[i];
          const petakNumber = petakNumbers[i];
          
          lahanData.push({
            kodeLahan: `LHAN-${member.nomorAnggota}`,
            anggotaId: member.id,
            nomorPetak: petakNumber.toString(),
            luasLahan: member.luasLahanGarapan || '0',
            satuanLuas: 'Ha',
            jenisTanaman: 'Jati',
            lokasiLahan: `Petak ${petakNumber}, Kawasan Hutan Gembol, ${member.kecamatan}, ${member.kabupaten}`,
            koordinatLat: `-7.${740000 + i * 100}`,
            koordinatLong: `111.${450000 + i * 100}`,
            statusLegalitas: 'aktif',
            nomorSKKHDPK: `SK/KHDPK/${petakNumber}/2020`,
            tanggalSK: new Date(2020, 0, 15),
            masaBerlakuSK: new Date(2050, 0, 15),
            tahunMulaiKelola: 2020,
            kondisiLahan: 'baik',
            keterangan: `Lahan KHDPK Petak ${petakNumber} - ${member.namaLengkap}`,
          });
        }

        if (lahanData.length > 0) {
          await db.insert(lahanKhdpk).values(lahanData);
          console.log(`✅ ${lahanData.length} Lahan KHDPK data created successfully!`);
          console.log(`   - Petak nomor: ${petakNumbers.slice(0, lahanData.length).join(', ')}`);
        }
      }
    }

    // Check if PNBP data already exists
    const existingPnbp = await db.select().from(pnbp).limit(1);
    
    if (existingPnbp.length > 0) {
      console.log('⚠️  PNBP data already exists, skipping...');
    } else {
      // Get all anggota and lahan for PNBP data
      const allAnggota = await db.select().from(anggota);
      const allLahan = await db.select().from(lahanKhdpk);
      
      // Create mapping anggotaId -> lahanId
      const anggotaLahanMap = new Map();
      for (const lahan of allLahan) {
        anggotaLahanMap.set(lahan.anggotaId, lahan.id);
      }
      
      if (allAnggota.length > 0) {
        const pnbpData = [];
        const currentYear = new Date().getFullYear();
        const tarifPerHa = 50000; // Tarif Rp 50.000 per hektar per tahun

        // Create PNBP data untuk 3 tahun terakhir (2024, 2025, 2026)
        for (let year = currentYear - 2; year <= currentYear; year++) {
          for (const member of allAnggota) {
            const luasLahan = parseFloat(member.luasLahanGarapan || '0');
            const lahanId = anggotaLahanMap.get(member.id);
            
            if (luasLahan > 0) {
              const jumlahPnbp = luasLahan * tarifPerHa;
              
              // Tahun lalu dan kemarin sudah lunas, tahun ini belum bayar
              const isPaid = year < currentYear;
              
              pnbpData.push({
                nomorTransaksi: `PNBP/${year}/${member.nomorAnggota}`,
                anggotaId: member.id,
                lahanId: lahanId || null,
                tahunPNBP: year,
                luasLahanDihitung: member.luasLahanGarapan || '0',
                tarifPerHa: tarifPerHa.toString(),
                jumlahPNBP: jumlahPnbp.toString(),
                statusBayar: isPaid ? 'lunas' : 'belum',
                tanggalJatuhTempo: new Date(year, 11, 31), // 31 Desember
                tanggalBayar: isPaid ? new Date(year, 2, 15) : null, // 15 Maret tahun tersebut jika sudah bayar
                metodeBayar: isPaid ? 'transfer' : null,
                nomorReferensi: isPaid ? `REF${year}${member.nomorAnggota}` : null,
                keterangan: `PNBP Tahun ${year} - ${member.namaLengkap}`,
              });
            }
          }
        }

        if (pnbpData.length > 0) {
          await db.insert(pnbp).values(pnbpData);
          console.log(`✅ ${pnbpData.length} PNBP records created successfully!`);
          console.log(`   - Data untuk tahun ${currentYear - 2}, ${currentYear - 1}, ${currentYear}`);
          console.log(`   - Tarif: Rp ${tarifPerHa.toLocaleString('id-ID')} per hektar`);
        }
      }
    }

    console.log('⚠️  Please change the admin password after first login!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✅ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
