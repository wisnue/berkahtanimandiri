import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { anggotaService } from '../../services/anggota.service';
import type { Anggota } from '../../services/anggota.service';
import { ArrowLeft, Edit, Printer, User, MapPin, Phone, Briefcase, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import { useAuth } from '../../app/AuthContext';

export function AnggotaDetailPage() {
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAnggota(id);
    }
  }, [id]);

  const fetchAnggota = async (anggotaId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await anggotaService.getById(anggotaId);
      if (response.success && response.data) {
        setAnggota(response.data);
      } else {
        setError('Anggota tidak ditemukan');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data anggota');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/anggota';
  };

  const handleEdit = () => {
    window.location.href = '/anggota';
    // Note: You might want to trigger the edit modal here
  };

  const handlePrint = () => {
    if (!anggota) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215, 330], // F4 size
    });

    // Page margins
    const margin = 20;
    const pageWidth = 215;
    let yPos = margin;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('KELOMPOK TANI HUTAN BINA TARUNA MANDIRI', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(14);
    doc.text('PROFIL ANGGOTA', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 15;

    // Nomor Anggota & Status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nomor Anggota: ${anggota.noAnggota || '-'}`, margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    const statusText = `Status: ${anggota.statusAnggota}`;
    const statusWidth = doc.getTextWidth(statusText);
    doc.text(statusText, pageWidth - margin - statusWidth, yPos);
    
    yPos += 12;

    // Data Pribadi Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Data Pribadi', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const personalInfo = [
      ['Nama Lengkap', anggota.namaLengkap],
      ['NIK', anggota.nik],
      ['Tempat Lahir', anggota.tempatLahir || '-'],
      ['Tanggal Lahir', anggota.tanggalLahir ? new Date(anggota.tanggalLahir).toLocaleDateString('id-ID') : '-'],
      ['Jenis Kelamin', anggota.jenisKelamin || '-'],
      ['Pendidikan', anggota.pendidikanTerakhir || '-'],
      ['Pekerjaan', anggota.pekerjaan || '-'],
    ];

    personalInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '-', margin + 60, yPos);
      yPos += 6;
    });

    yPos += 6;

    // Alamat Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Alamat', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const addressInfo = [
      ['Alamat Lengkap', anggota.alamatLengkap || '-'],
      ['RT/RW', `${anggota.rt || '-'}/${anggota.rw || '-'}`],
      ['Desa/Kelurahan', anggota.desa || '-'],
      ['Kecamatan', anggota.kecamatan || '-'],
      ['Kabupaten/Kota', anggota.kabupaten || '-'],
      ['Provinsi', anggota.provinsi || '-'],
      ['Kode Pos', anggota.kodePos || '-'],
    ];

    addressInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      
      if (label === 'Alamat Lengkap' && value && value.length > 50) {
        const lines = doc.splitTextToSize(value, pageWidth - margin - 70);
        doc.text(lines, margin + 60, yPos);
        yPos += 6 * lines.length;
      } else {
        doc.text(value || '-', margin + 60, yPos);
        yPos += 6;
      }
    });

    yPos += 6;

    // Kontak Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Kontak', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const contactInfo = [
      ['No. Telepon', anggota.noTelepon || '-'],
      ['Email', anggota.email || '-'],
    ];

    contactInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '-', margin + 60, yPos);
      yPos += 6;
    });

    yPos += 6;

    // Keanggotaan Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Informasi Keanggotaan', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const membershipInfo = [
      ['Tanggal Bergabung', anggota.tanggalBergabung ? new Date(anggota.tanggalBergabung).toLocaleDateString('id-ID') : '-'],
      ['Catatan', anggota.keterangan || '-'],
    ];

    membershipInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      
      if (label === 'Catatan' && value && value.length > 50) {
        const lines = doc.splitTextToSize(value, pageWidth - margin - 70);
        doc.text(lines, margin + 60, yPos);
        yPos += 6 * lines.length;
      } else {
        doc.text(value || '-', margin + 60, yPos);
        yPos += 6;
      }
    });

    yPos += 6;

    // Footer
    yPos = 310; // Near bottom of F4
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, margin, yPos);

    // Signature area
    yPos = 270;
    const sigWidth = 60;
    const leftSigX = margin + 20;
    const rightSigX = pageWidth - margin - sigWidth - 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text('Ketua KTH BTM', leftSigX + (sigWidth / 2), yPos, { align: 'center' });
    doc.text('Anggota', rightSigX + (sigWidth / 2), yPos, { align: 'center' });
    
    yPos += 20;
    doc.line(leftSigX, yPos, leftSigX + sigWidth, yPos);
    doc.line(rightSigX, yPos, rightSigX + sigWidth, yPos);

    // Watermark
    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'bold');
    doc.text('KTH BTM', pageWidth / 2, 165, { 
      align: 'center',
      angle: 45 
    });

    // Save PDF
    doc.save(`Profil-Anggota-${anggota.noAnggota || anggota.namaLengkap}.pdf`);
  };

  if (loading) {
    return (
      <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role, email: user.email } : undefined}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data anggota...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !anggota) {
    return (
      <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role, email: user.email } : undefined}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">{error || 'Anggota tidak ditemukan'}</p>
            <Button onClick={handleBack} variant="primary">
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke Daftar Anggota
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Non-Aktif':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Calon':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role, email: user.email } : undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Detail Anggota</h1>
              <p className="text-sm text-gray-600 mt-1">Informasi lengkap profil anggota</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleEdit}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              <Printer size={16} className="mr-2" />
              Cetak (F4)
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-primary-100 border-4 border-white shadow-lg flex items-center justify-center">
              {anggota.fotoAnggota ? (
                <img
                  src={anggota.fotoAnggota}
                  alt={anggota.namaLengkap}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={48} className="text-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{anggota.namaLengkap}</h2>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <span className="font-semibold text-primary-600">
                      {anggota.noAnggota || '-'}
                    </span>
                    <span>•</span>
                    <span>{anggota.nik}</span>
                  </div>
                  <div className="inline-flex">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(anggota.statusAnggota)}`}>
                      {anggota.statusAnggota}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Pribadi */}
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Data Pribadi</h3>
            </div>
            <div className="space-y-3">
              <InfoRow label="Tempat Lahir" value={anggota.tempatLahir} />
              <InfoRow 
                label="Tanggal Lahir" 
                value={anggota.tanggalLahir ? new Date(anggota.tanggalLahir).toLocaleDateString('id-ID') : null} 
              />
              <InfoRow label="Jenis Kelamin" value={anggota.jenisKelamin} />
              <InfoRow label="Pendidikan" value={anggota.pendidikanTerakhir} />
              <InfoRow label="Pekerjaan" value={anggota.pekerjaan} />
            </div>
          </Card>

          {/* Alamat */}
          <Card className="border-2 border-green-200 bg-green-50/30">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-green-200">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MapPin size={20} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Alamat</h3>
            </div>
            <div className="space-y-3">
              <InfoRow label="Alamat Lengkap" value={anggota.alamatLengkap} />
              <InfoRow label="RT/RW" value={`${anggota.rt || '-'}/${anggota.rw || '-'}`} />
              <InfoRow label="Desa/Kelurahan" value={anggota.desa} />
              <InfoRow label="Kecamatan" value={anggota.kecamatan} />
              <InfoRow label="Kabupaten/Kota" value={anggota.kabupaten} />
              <InfoRow label="Provinsi" value={anggota.provinsi} />
              <InfoRow label="Kode Pos" value={anggota.kodePos} />
            </div>
          </Card>

          {/* Kontak */}
          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-200">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Phone size={20} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Kontak</h3>
            </div>
            <div className="space-y-3">
              <InfoRow label="No. Telepon" value={anggota.noTelepon} />
              <InfoRow label="Email" value={anggota.email} />
            </div>
          </Card>

          {/* Keanggotaan */}
          <Card className="border-2 border-orange-200 bg-orange-50/30">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-orange-200">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Informasi Keanggotaan</h3>
            </div>
            <div className="space-y-3">
              <InfoRow 
                label="Tanggal Bergabung" 
                value={anggota.tanggalBergabung ? new Date(anggota.tanggalBergabung).toLocaleDateString('id-ID') : null} 
              />
              <InfoRow label="Catatan" value={anggota.keterangan} />
            </div>
          </Card>

          {/* Dokumen */}
          {anggota.fotoKTP && (
            <Card className="border-2 border-cyan-200 bg-cyan-50/30 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-cyan-200">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Briefcase size={20} className="text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Dokumen</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">KTP</p>
                  <a 
                    href={anggota.fotoKTP} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Lihat Dokumen
                  </a>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Helper component for displaying info rows
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '-'}</span>
    </div>
  );
}
