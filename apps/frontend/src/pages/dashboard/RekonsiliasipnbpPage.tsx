import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GitCompare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import pnbpService from '@/services/pnbp.service';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/app/AuthContext';

interface ReconciliationDiscrepancy {
  type: 'count' | 'amount';
  pnbpValue: number;
  keuanganValue: number;
  difference: number;
  percentage: number;
}

interface ReconciliationReport {
  tahun: number;
  pnbpData: {
    totalRecords: number;
    totalAmount: number;
    paidCount: number;
    paidAmount: number;
    unpaidCount: number;
    unpaidAmount: number;
  };
  keuanganData: {
    totalRecords: number;
    totalAmount: number;
  };
  reconciliation: {
    isMatched: boolean;
    discrepancies: ReconciliationDiscrepancy[];
  };
  details: {
    matchedTransactions: number;
    unmatchedPnbp: Array<{
      nomorPembayaran: string;
      tahun: number;
      jumlah: number;
      status: string;
    }>;
    unmatchedKeuangan: Array<{
      nomorTransaksi: string;
      tanggal: Date;
      jumlah: number;
    }>;
  };
}

export default function PnbpReconciliationPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [tahun]);

  const loadData = async () => {
    try {
      const res = await pnbpService.getReconciliation(tahun);
      if (res.success) {
        setReport(res.data as ReconciliationReport);
      }
    } catch (error: any) {
      console.error('Load reconciliation error:', error);
      alert(error.response?.data?.message || 'Gagal memuat data rekonsiliasi');
    }
  };

  const getDiscrepancyColor = (diff: number) => {
    if (diff === 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <GitCompare className="h-6 w-6 text-purple-600" />
              Rekonsiliasi PNBP
            </h1>
            <p className="text-gray-600 mt-1">Perbandingan data PNBP dengan Keuangan</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <select
              className="border rounded px-4 py-2 w-32"
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Card */}
        {report && (
          <Card className={report.reconciliation.isMatched ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {report.reconciliation.isMatched ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-green-800">Data Cocok ✓</h3>
                      <p className="text-green-700">
                        Data PNBP dan Keuangan untuk tahun {report.tahun} sudah sesuai.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-12 w-12 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-red-800">Ketidaksesuaian Terdeteksi</h3>
                      <p className="text-red-700">
                        Ditemukan {report.reconciliation.discrepancies.length} perbedaan antara data PNBP dan Keuangan.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PNBP Data */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">Data PNBP</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-bold">{report.pnbpData.totalRecords}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold">{formatCurrency(report.pnbpData.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b bg-green-50 -m-2 p-2 rounded">
                  <span className="text-green-700 font-medium">✓ Paid Count:</span>
                  <span className="font-bold text-green-700">{report.pnbpData.paidCount}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b bg-green-50 -m-2 p-2 rounded">
                  <span className="text-green-700 font-medium">✓ Paid Amount:</span>
                  <span className="font-bold text-green-700">{formatCurrency(report.pnbpData.paidAmount)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-yellow-700">⏳ Unpaid Count:</span>
                  <span className="font-bold text-yellow-700">{report.pnbpData.unpaidCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-700">⏳ Unpaid Amount:</span>
                  <span className="font-bold text-yellow-700">{formatCurrency(report.pnbpData.unpaidAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Keuangan Data */}
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-900">Data Keuangan (Kategori: PNBP)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-bold">{report.keuanganData.totalRecords}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold">{formatCurrency(report.keuanganData.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-8">
                  <span className="text-sm text-gray-500 italic">
                    * Hanya transaksi pemasukan dengan kategori PNBP
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Discrepancies */}
        {report && report.reconciliation.discrepancies.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <AlertTriangle size={20} />
                Perbedaan Terdeteksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {report.reconciliation.discrepancies.map((disc, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">
                        {disc.type === 'count' ? 'Perbedaan Jumlah Transaksi' : 'Perbedaan Total Amount'}
                      </h4>
                      <span className={`text-sm font-medium ${getDiscrepancyColor(disc.difference)}`}>
                        {disc.difference > 0 ? '+' : ''}{disc.type === 'count' ? disc.difference : formatCurrency(disc.difference)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">PNBP (Paid):</p>
                        <p className="font-bold text-blue-600">
                          {disc.type === 'count' ? disc.pnbpValue : formatCurrency(disc.pnbpValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Keuangan:</p>
                        <p className="font-bold text-purple-600">
                          {disc.type === 'count' ? disc.keuanganValue : formatCurrency(disc.keuanganValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Persentase:</p>
                        <p className={`font-bold ${getDiscrepancyColor(disc.difference)}`}>
                          {disc.percentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matched Transactions Count */}
        {report && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle size={20} />
                Transaksi Tercocokkan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-2xl font-bold text-green-600">
                {report.details.matchedTransactions} transaksi
              </p>
              <p className="text-gray-600 mt-1">
                Berdasarkan jumlah minimum antara PNBP paid ({report.pnbpData.paidCount}) dan Keuangan ({report.keuanganData.totalRecords})
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {report && !report.reconciliation.isMatched && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Rekomendasi</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>Periksa apakah semua pembayaran PNBP sudah dicatat di Keuangan</li>
                <li>Verifikasi nomor transaksi PNBP dengan keuangan pemasukan</li>
                <li>Pastikan kategori transaksi di Keuangan sudah benar (PNBP)</li>
                <li>Hubungi Bendahara untuk pengecekan manual jika diperlukan</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
