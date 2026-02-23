import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, TrendingUp, TrendingDown, AlertTriangle, Wallet } from 'lucide-react';
import bukuKasService, { type BukuKasReport } from '@/services/bukuKas.service';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/app/AuthContext';

export default function BukuKasPage() {
  const { user } = useAuth();
  const currentDate = new Date();
  const [report, setReport] = useState<BukuKasReport | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [tahun, setTahun] = useState(currentDate.getFullYear());
  const [bulan, setBulan] = useState(currentDate.getMonth() + 1);

  useEffect(() => {
    loadData();
    loadCurrentBalance();
  }, [tahun, bulan]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await bukuKasService.getBukuKas(tahun, bulan);
      if (res.success) {
        setReport(res.data as BukuKasReport);
      }
    } catch (error:any) {
      console.error('Load buku kas error:', error);
      alert(error.response?.data?.message || 'Gagal memuat buku kas');
    }
    setLoading(false);
  };

  const loadCurrentBalance = async () => {
    try {
      const res = await bukuKasService.getCurrentBalance();
      if (res.success) {
        const data = res.data as any;
        setCurrentBalance(data.saldoKas || 0);
      }
    } catch (error) {
      console.error('Load balance error:', error);
    }
  };

  const bulanOptions = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleExportPDF = () => {
    // Create printable HTML content
    const printWindow = window.open('', '_blank');
    if (!printWindow || !report) return;

    const bulanNama = bulanOptions[bulan - 1];
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Buku Kas ${bulanNama} ${tahun}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20mm; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { font-size: 18pt; margin-bottom: 5px; }
          .header p { font-size: 11pt; color: #666; }
          .period { text-align: center; margin-bottom: 15px; font-size: 12pt; font-weight: bold; }
          .summary { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .summary-box { flex: 1; padding: 10px; border: 1px solid #ddd; margin: 0 5px; text-align: center; }
          .summary-box .label { font-size: 9pt; color: #666; margin-bottom: 5px; }
          .summary-box .value { font-size: 13pt; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 6px 8px; font-size: 9pt; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .negative { color: red; }
          .footer { margin-top: 30px; text-align: right; }
          .signature-box { display: inline-block; text-align: center; margin-top: 40px; }
          .signature-line { border-top: 1px solid #000; padding-top: 5px; margin-top: 50px; width: 200px; }
          @media print {
            body { padding: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BUKU KAS</h1>
          <p>Kelompok Tani Hutan Bumi Tirtamas Mandiri</p>
        </div>
        
        <div class="period">
          Periode: ${bulanNama} ${tahun}
        </div>

        <div class="summary">
          <div class="summary-box">
            <div class="label">Saldo Awal</div>
            <div class="value">${formatCurrency(report.saldoAwal)}</div>
          </div>
          <div class="summary-box">
            <div class="label">Total Pemasukan</div>
            <div class="value" style="color: green;">${formatCurrency(report.totalPemasukan)}</div>
          </div>
          <div class="summary-box">
            <div class="label">Total Pengeluaran</div>
            <div class="value" style="color: red;">${formatCurrency(report.totalPengeluaran)}</div>
          </div>
          <div class="summary-box">
            <div class="label">Saldo Akhir</div>
            <div class="value">${formatCurrency(report.saldoAkhir)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Tanggal</th>
              <th style="width: 12%;">No. Transaksi</th>
              <th style="width: 28%;">Uraian</th>
              <th style="width: 12%;">Kategori</th>
              <th class="text-right" style="width: 13%;">Pemasukan</th>
              <th class="text-right" style="width: 13%;">Pengeluaran</th>
              <th class="text-right" style="width: 12%;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr class="total-row">
              <td colspan="4">Saldo Awal</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
              <td class="text-right">${formatCurrency(report.saldoAwal)}</td>
            </tr>
            ${report.entries.map(entry => `
              <tr>
                <td>${new Date(entry.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>${entry.nomorTransaksi || '-'}</td>
                <td>${entry.uraian}</td>
                <td>${entry.kategori}</td>
                <td class="text-right">${entry.pemasukan > 0 ? formatCurrency(entry.pemasukan) : '-'}</td>
                <td class="text-right">${entry.pengeluaran > 0 ? formatCurrency(entry.pengeluaran) : '-'}</td>
                <td class="text-right ${entry.saldo < 0 ? 'negative' : ''}">${formatCurrency(entry.saldo)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">Saldo Akhir</td>
              <td class="text-right">${formatCurrency(report.totalPemasukan)}</td>
              <td class="text-right">${formatCurrency(report.totalPengeluaran)}</td>
              <td class="text-right">${formatCurrency(report.saldoAkhir)}</td>
            </tr>
          </tbody>
        </table>

        ${report.hasNegativeBalance ? `
          <div style="margin-top: 20px; padding: 10px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
            <strong>⚠ Peringatan:</strong> Terdapat saldo negatif dalam periode ini
          </div>
        ` : ''}

        <div class="footer">
          <div class="signature-box">
            <div>Mengetahui,</div>
            <div class="signature-line">Bendahara</div>
          </div>
          <div class="signature-box" style="margin-left: 50px;">
            <div>Menyetujui,</div>
            <div class="signature-line">Ketua KTH</div>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 8pt; color: #999;">
          Dicetak pada: ${new Date().toLocaleString('id-ID')}
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-green-600" />
              Buku Kas
            </h1>
            <p className="text-gray-600 mt-1">Catatan general ledger keluar masuk kas</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={handleExportPDF}
              disabled={!report || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Saldo Kas Saat Ini</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <Wallet size={24} />
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tahun</label>
                <select
                  className="border rounded px-3 py-2 w-32"
                  value={tahun}
                  onChange={(e) => setTahun(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bulan</label>
                <select
                  className="border rounded px-3 py-2 w-40"
                  value={bulan}
                  onChange={(e) => setBulan(parseInt(e.target.value))}
                >
                  {bulanOptions.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Saldo Awal</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(report.saldoAwal)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingUp size={14} className="text-green-600" />
                  Total Pemasukan
                </div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(report.totalPemasukan)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingDown size={14} className="text-red-600" />
                  Total Pengeluaran
                </div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(report.totalPengeluaran)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Saldo Akhir</div>
                <div className={`text-2xl font-bold mt-1 ${report.saldoAkhir < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(report.saldoAkhir)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Warning for Negative Balance */}
        {report?.hasNegativeBalance && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle size={20} />
                <div>
                  <p className="font-semibold">Peringatan: Saldo Negatif Terdeteksi</p>
                  <p className="text-sm">
                    Terdapat {report.negativeBalanceDates.length} transaksi yang menyebabkan saldo negatif pada periode ini.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ledger Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Buku Kas - {report?.periode.bulanNama} {report?.periode.tahun}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No. Transaksi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Uraian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Pemasukan
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Pengeluaran
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : !report || report.entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        Tidak ada transaksi pada periode ini
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Saldo Awal Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="px-4 py-3" colSpan={6}>Saldo Awal</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(report.saldoAwal)}</td>
                      </tr>
                      
                      {/* Transaction Rows */}
                      {report.entries.map((entry, idx) => (
                        <tr key={idx} className={`hover:bg-gray-50 ${entry.saldo < 0 ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(entry.tanggal).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {entry.nomorTransaksi}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {entry.uraian}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {entry.kategori}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                            {entry.pemasukan > 0 ? formatCurrency(entry.pemasukan) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                            {entry.pengeluaran > 0 ? formatCurrency(entry.pengeluaran) : '-'}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-semibold ${entry.saldo < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatCurrency(entry.saldo)}
                          </td>
                        </tr>
                      ))}

                      {/* Saldo Akhir Row */}
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-4 py-3" colSpan={4}>Saldo Akhir</td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {formatCurrency(report.totalPemasukan)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatCurrency(report.totalPengeluaran)}
                        </td>
                        <td className={`px-4 py-3 text-right ${report.saldoAkhir < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatCurrency(report.saldoAkhir)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
