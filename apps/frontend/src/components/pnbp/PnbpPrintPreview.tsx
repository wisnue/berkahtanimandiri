import { X, Printer } from 'lucide-react';
import { Pnbp } from '../../services/pnbp.service';
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface PnbpPrintPreviewProps {
  pnbp: Pnbp;
  onClose: () => void;
}

export function PnbpPrintPreview({ pnbp, onClose }: PnbpPrintPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Generate QR Code data untuk verifikasi TTE
  const generateQRData = () => {
    return JSON.stringify({
      institusi: 'KTH Berkah Tani Mandiri',
      ketua: 'SUSILO SUYONO',
      jenis_dokumen: 'BUKTI_PEMBAYARAN_PNBP',
      nomor_transaksi: generateNomorTransaksi(),
      tahun_pnbp: pnbp.tahun,
      kode_lahan: pnbp.kodeLahan,
      nama_anggota: pnbp.anggotaNama,
      total_tagihan: pnbp.totalTagihan,
      status: pnbp.statusPembayaran,
      tanggal_bayar: pnbp.tanggalBayar || new Date().toISOString(),
      tanggal_cetak: new Date().toISOString(),
      verifikasi_url: `https://kthbtm.id/verify/${pnbp.id}`,
    });
  };

  // Generate nomor transaksi yang lebih readable
  const generateNomorTransaksi = () => {
    const idShort = pnbp.id.split('-')[0].toUpperCase();
    return `BTM/PNBP/${pnbp.tahun}/${idShort}`;
  };

  // Generate nomor billing (16 digit dari ID)
  const generateBillingCode = () => {
    return pnbp.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16).toUpperCase().padEnd(16, '0');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate QR Code URL using API
    const qrData = encodeURIComponent(generateQRData());
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${qrData}`;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Bukti PNBP - ${pnbp.tahun} - ${pnbp.kodeLahan}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: 215mm 330mm;
              margin: 0;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: 215mm;
              min-height: 330mm;
              background: white;
            }
            
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
            
            @media print {
              body {
                width: 215mm;
                height: 330mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="w-full min-h-screen bg-white p-[15mm]">
            <!-- Header -->
            <div class="rounded-lg overflow-hidden mb-6" style="background: linear-gradient(135deg, #2980b9 0%, #16a085 100%);">
              <div class="p-6 text-white">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <span class="text-2xl">🌳</span>
                    </div>
                    <div>
                      <div class="text-xs font-medium">KELOMPOK TANI HUTAN</div>
                      <div class="text-lg font-bold">BERKAH TANI MANDIRI</div>
                      <div class="text-xs opacity-90">📞 +62 821-xxxx-xxxx | ✉️ kthbtm@example.id</div>
                    </div>
                  </div>
                  <div class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-center border border-white/30">
                    <div class="text-xs font-medium">Dokumen Resmi</div>
                    <div class="text-sm font-bold">BUKTI PEMBAYARAN</div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                  <div>
                    <span class="opacity-90">No. Transaksi:</span>
                    <span class="font-bold ml-2">${generateNomorTransaksi()}</span>
                  </div>
                  <div>
                    <span class="opacity-90">Tanggal Cetak:</span>
                    <span class="font-bold ml-2">${formatDate(new Date())}</span>
                  </div>
                  <div class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-xs">
                    TAHUN ${pnbp.tahun}
                  </div>
                </div>
              </div>
            </div>

            <!-- Informasi Penerima & QR Code -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span class="text-white text-lg">👤</span>
                  </div>
                  <div class="text-sm font-bold text-gray-700">Informasi Penerima</div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div class="text-gray-600 mb-1">Nama Lengkap</div>
                    <div class="font-bold text-gray-900">${pnbp.anggotaNama}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 mb-1">Nomor Anggota</div>
                    <div class="font-bold text-gray-900">${pnbp.anggotaNomor || '-'}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 mb-1">Kode Lahan</div>
                    <div class="font-bold text-blue-600">${pnbp.kodeLahan}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 mb-1">Nomor Petak</div>
                    <div class="font-bold text-orange-600">${pnbp.nomorPetak || '-'}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 mb-1">Luas Lahan</div>
                    <div class="font-bold text-green-600">${pnbp.luasLahan} Hektar</div>
                  </div>
                  <div>
                    <div class="text-gray-600 mb-1">Tahun PNBP</div>
                    <div class="font-bold text-purple-600">${pnbp.tahun}</div>
                  </div>
                </div>
              </div>

              <div class="bg-purple-50 rounded-lg p-4 border border-purple-200 flex flex-col items-center justify-center">
                <div class="text-xs font-bold text-purple-700 mb-2">Scan untuk Verifikasi</div>
                <div class="bg-white p-2 rounded-lg border-2 border-purple-300">
                  <img src="${qrCodeUrl}" alt="QR Code" class="w-[110px] h-[110px]" />
                </div>
                <div class="text-xs text-purple-600 mt-2 font-medium">🔐 TTE Digital</div>
              </div>
            </div>

            <!-- Rincian Pembayaran PNBP -->
            <div class="mb-6">
              <h3 class="text-sm font-bold text-gray-800 mb-3">Rincian Pembayaran PNBP</h3>
              
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-blue-600 text-white">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-bold">No</th>
                      <th class="px-3 py-2 text-left text-xs font-bold">Tahun</th>
                      <th class="px-3 py-2 text-left text-xs font-bold">Jenis Pembayaran</th>
                      <th class="px-3 py-2 text-center text-xs font-bold">Luas (Ha)</th>
                      <th class="px-3 py-2 text-right text-xs font-bold">Tarif/Ha</th>
                      <th class="px-3 py-2 text-right text-xs font-bold">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="bg-gray-50">
                      <td class="px-3 py-3 text-xs text-center">1</td>
                      <td class="px-3 py-3">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">${pnbp.tahun}</span>
                      </td>
                      <td class="px-3 py-3 text-xs">PNBP - Penerimaan Negara Bukan Pajak</td>
                      <td class="px-3 py-3 text-center">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">${pnbp.luasLahan} Ha</span>
                      </td>
                      <td class="px-3 py-3 text-xs text-right">${formatCurrency(pnbp.tarifPerHa)}</td>
                      <td class="px-3 py-3 text-xs text-right font-bold text-green-600">${formatCurrency(pnbp.totalTagihan)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-3 bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xl">💰</span>
                    </div>
                    <div>
                      <div class="text-xs text-gray-600">Total Pembayaran</div>
                      <div class="text-lg font-bold text-green-700">${formatCurrency(pnbp.totalTagihan)}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-gray-600 mb-1">Status Pembayaran</div>
                    <span class="px-4 py-1.5 rounded-full text-xs font-bold ${
                      pnbp.statusPembayaran === 'lunas' 
                        ? 'bg-green-500 text-white' 
                        : pnbp.statusPembayaran === 'belum_bayar'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }">
                      ${pnbp.statusPembayaran.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informasi Pembayaran & Kode Billing -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span class="text-white text-xs">📅</span>
                  </div>
                  <div class="text-xs font-bold text-gray-700">Informasi Pembayaran</div>
                </div>
                <div class="space-y-2 text-xs text-gray-700">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tanggal Bayar</span>
                    <span class="font-bold">${formatDate(pnbp.tanggalBayar || new Date())}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Metode</span>
                    <span class="font-bold">${pnbp.metodePembayaran || 'TUNAI'}</span>
                  </div>
                </div>
              </div>

              <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                    <span class="text-white text-xs">🔖</span>
                  </div>
                  <div class="text-xs font-bold text-gray-700">Kode Billing</div>
                </div>
                <div class="text-xs font-mono font-bold text-purple-700 bg-white px-3 py-2 rounded border border-purple-300">
                  ${generateBillingCode()}
                </div>
              </div>
            </div>

            <!-- Terbilang -->
            <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-3 mb-6">
              <div class="text-xs">
                <span class="font-bold text-gray-700">Terbilang:</span>
                <span class="ml-2 italic text-gray-800">Dua Ratus Tujuh Puluh Dua Ribu Rupiah</span>
              </div>
            </div>

            <!-- Signature -->
            <div class="grid grid-cols-2 gap-8 mb-6 mt-8">
              <div></div>
              <div>
                <div class="text-xs text-gray-700 mb-12 text-center">
                  Mengetahui,<br/>
                  <span class="font-bold">Ketua KTH Berkah Tani Mandiri</span>
                </div>
                <div class="text-center">
                  <div class="font-bold text-sm text-gray-900 border-b-2 border-gray-800 inline-block px-12 pb-1">
                    SUSILO SUYONO
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t-2 border-gray-300 pt-4 mt-8">
              <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                <div class="grid grid-cols-3 gap-4 text-[9px]">
                  <div>
                    <div class="font-bold text-blue-700 mb-2">⚠️ Catatan Penting</div>
                    <ul class="text-gray-700 space-y-1 text-[8px]">
                      <li>• Bukti pembayaran asli harap disimpan</li>
                      <li>• Bukti sah untuk klaim perpajakan</li>
                    </ul>
                  </div>
                  <div>
                    <div class="font-bold text-green-700 mb-2">📱 Informasi Kontak</div>
                    <div class="text-gray-700 space-y-1 text-[8px]">
                      <div>📞 +62 821-xxxx-xxxx</div>
                      <div>✉️ kthbtm@example.id</div>
                    </div>
                  </div>
                  <div>
                    <div class="font-bold text-purple-700 mb-2">🔐 Keamanan</div>
                    <div class="text-gray-700 space-y-1 text-[8px]">
                      <div>QR Code untuk verifikasi TTE</div>
                      <div>Dokumen terenkripsi digital</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center text-[8px] text-gray-500 mt-3 italic">
                Dokumen ini dicetak secara otomatis pada ${formatDate(new Date())} pukul ${new Date().toLocaleTimeString('id-ID')}
              </div>
              <div class="text-center text-[7px] text-gray-400 mt-1">
                ID Dokumen: ${pnbp.id}
              </div>
            </div>

            <!-- Watermark -->
            <div class="fixed inset-0 flex items-center justify-center pointer-events-none" style="transform: rotate(45deg); opacity: 0.03; z-index: 0;">
              <div class="text-9xl font-bold text-gray-900" style="font-size: 200px;">
                KTH BTM
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
          {/* Header - No Print */}
          <div className="no-print flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Printer className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Print Preview - Bukti Pembayaran PNBP</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Preview Area - Scrollable */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            {/* F4 Paper Container */}
            <div 
              ref={printRef}
              className="mx-auto bg-white shadow-lg print-area"
              style={{
                width: '215mm',
                minHeight: '330mm',
                padding: '15mm',
              }}
            >
              {/* Header Box - Ultra Modern */}
              <div className="relative overflow-hidden rounded-xl mb-6" style={{ 
                background: 'linear-gradient(135deg, #2980b9 0%, #16a085 100%)',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(41, 128, 185, 0.2)'
              }}>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 opacity-10" style={{
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '10px 10px'
                }}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    {/* Logo & Organization */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="text-2xl font-bold" style={{ color: '#2980b9' }}>🌾</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5">
                          KELOMPOK TANI HUTAN
                        </div>
                        <div className="text-base font-bold text-white">
                          BERKAH TANI MANDIRI
                        </div>
                        <div className="text-xs text-white/80 mt-1">
                          📞 +62 821-xxxx-xxxx | ✉️ kthbtm@example.id
                        </div>
                      </div>
                    </div>

                    {/* Document Type Badge */}
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                      <div className="text-xs text-white/90 mb-1">Dokumen Resmi</div>
                      <div className="text-sm font-bold text-white">BUKTI PEMBAYARAN</div>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <div className="flex items-center gap-6 text-xs text-white">
                      <div>
                        <span className="opacity-80">No. Transaksi:</span>
                        <span className="ml-2 font-bold">{generateNomorTransaksi()}</span>
                      </div>
                      <div>
                        <span className="opacity-80">Tanggal Cetak:</span>
                        <span className="ml-2 font-bold">{formatDate(new Date())}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                      TAHUN {pnbp.tahun}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Info - Modern Card */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">👤</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">Informasi Penerima</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-600 mb-1">Nama Lengkap</div>
                      <div className="font-bold text-gray-900">{pnbp.anggotaNama}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Nomor Anggota</div>
                      <div className="font-bold text-gray-900">{pnbp.anggotaNomor || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Kode Lahan</div>
                      <div className="font-bold text-blue-600">{pnbp.kodeLahan}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Nomor Petak</div>
                      <div className="font-bold text-orange-600">{pnbp.nomorPetak || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Luas Lahan</div>
                      <div className="font-bold text-green-600">{pnbp.luasLahan} Hektar</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Tahun PNBP</div>
                      <div className="font-bold text-purple-600">{pnbp.tahun}</div>
                    </div>
                  </div>
                </div>

                {/* QR Code Card - Fixed */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-purple-700 mb-2 text-center">Scan untuk Verifikasi</div>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <QRCodeSVG 
                      value={generateQRData()}
                      size={110}
                      level="H"
                      includeMargin={true}
                      style={{ width: '110px', height: '110px' }}
                    />
                  </div>
                  <div className="text-[9px] text-purple-600 mt-2 text-center">TTE Digital</div>
                </div>
              </div>

              {/* Payment Details - Premium Design */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-green-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-gray-900">Rincian Pembayaran PNBP</h3>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3">
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold text-white">
                      <div className="col-span-1">No</div>
                      <div className="col-span-2">Tahun</div>
                      <div className="col-span-3">Jenis Pembayaran</div>
                      <div className="col-span-2 text-center">Luas (Ha)</div>
                      <div className="col-span-2 text-right">Tarif/Ha</div>
                      <div className="col-span-2 text-right">Jumlah</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="px-4 py-4">
                    <div className="grid grid-cols-12 gap-2 text-xs text-gray-800 items-center">
                      <div className="col-span-1 font-bold text-blue-600">1</div>
                      <div className="col-span-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-bold text-xs">
                          {pnbp.tahun}
                        </span>
                      </div>
                      <div className="col-span-3 font-medium">PNBP - Penerimaan Negara Bukan Pajak</div>
                      <div className="col-span-2 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-bold">
                          {pnbp.luasLahan} Ha
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-medium">{formatCurrency(pnbp.tarifPerHa)}</div>
                      <div className="col-span-2 text-right font-bold text-green-600">{formatCurrency(pnbp.totalTagihan)}</div>
                    </div>
                  </div>

                  {/* Table Footer - Total */}
                  <div className="border-t-2 border-blue-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xl">💰</span>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Total Pembayaran</div>
                          <div className="text-base font-bold text-green-700">
                            {formatCurrency(pnbp.totalTagihan)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Status Pembayaran</div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          pnbp.statusPembayaran === 'lunas' 
                            ? 'bg-green-500 text-white' 
                            : pnbp.statusPembayaran === 'belum_bayar'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}>
                          {pnbp.statusPembayaran.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Payment Method & Additional Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">📅</span>
                    </div>
                    <div className="text-xs font-bold text-gray-700">Informasi Pembayaran</div>
                  </div>
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Bayar</span>
                      <span className="font-bold">{formatDate(pnbp.tanggalBayar || new Date())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode</span>
                      <span className="font-bold">{pnbp.metodePembayaran || 'TUNAI'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">🔖</span>
                    </div>
                    <div className="text-xs font-bold text-gray-700">Kode Billing</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-purple-700 bg-white px-3 py-2 rounded border border-purple-300">
                    {generateBillingCode()}
                  </div>
                </div>
              </div>

              {/* Terbilang Section */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-3 mb-6">
                <div className="text-xs">
                  <span className="font-bold text-gray-700">Terbilang:</span>
                  <span className="ml-2 italic text-gray-800">Dua Ratus Tujuh Puluh Dua Ribu Rupiah</span>
                </div>
              </div>

              {/* Signature Section - Professional */}
              <div className="grid grid-cols-2 gap-8 mb-6 mt-8">
                <div></div>
                <div>
                  <div className="text-xs text-gray-700 mb-12 text-center">
                    Mengetahui,<br/>
                    <span className="font-bold">Ketua KTH Berkah Tani Mandiri</span>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-sm text-gray-900 border-b-2 border-gray-800 inline-block px-12 pb-1">
                      SUSILO SUYONO
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Modern Information */}
              <div className="border-t-2 border-gray-300 pt-4 mt-8">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                  <div className="grid grid-cols-3 gap-4 text-[9px]">
                    <div>
                      <div className="font-bold text-blue-700 mb-2">⚠️ Catatan Penting</div>
                      <ul className="text-gray-700 space-y-1 text-[8px]">
                        <li>• Bukti pembayaran asli harap disimpan</li>
                        <li>• Bukti sah untuk klaim perpajakan</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-bold text-green-700 mb-2">📱 Informasi Kontak</div>
                      <div className="text-gray-700 space-y-1 text-[8px]">
                        <div>📞 +62 821-xxxx-xxxx</div>
                        <div>✉️ kthbtm@example.id</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-700 mb-2">🔐 Keamanan</div>
                      <div className="text-gray-700 space-y-1 text-[8px]">
                        <div>QR Code untuk verifikasi TTE</div>
                        <div>Dokumen terenkripsi digital</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[8px] text-gray-500 mt-3 italic">
                  Dokumen ini dicetak secara otomatis pada {formatDate(new Date())} pukul {new Date().toLocaleTimeString('id-ID')}
                </div>
                <div className="text-center text-[7px] text-gray-400 mt-1">
                  ID Dokumen: {pnbp.id}
                </div>
              </div>

              {/* Watermark */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: 'rotate(45deg)',
                  opacity: 0.03,
                  zIndex: 0,
                }}
              >
                <div className="text-9xl font-bold text-gray-900" style={{ fontSize: '200px' }}>
                  KTH BTM
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - No Print */}
          <div className="no-print flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 215mm !important;
            height: auto !important;
            min-height: 330mm !important;
            background: white !important;
            box-shadow: none !important;
            padding: 15mm !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          
          .print-area,
          .print-area *,
          .print-area > *,
          .print-area > div,
          .print-area > div > * {
            visibility: visible !important;
          }
          
          /* Preserve all display properties */
          .print-area .grid {
            display: grid !important;
          }
          
          .print-area .flex {
            display: flex !important;
          }
          
          .print-area .block {
            display: block !important;
          }
          
          .print-area .inline-block {
            display: inline-block !important;
          }
          
          /* Ensure footer and all content is visible */
          .print-area .border-t-2,
          .print-area .border-t-2 *,
          .print-area .bg-gradient-to-r,
          .print-area .bg-gradient-to-r * {
            visibility: visible !important;
            display: block !important;
          }
          
          /* Force grid on footer content */
          .print-area .grid-cols-3 {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          
          @page {
            size: 215mm 330mm;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}
