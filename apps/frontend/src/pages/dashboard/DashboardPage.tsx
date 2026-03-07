import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Users, MapPin, Receipt, TrendingUp, Activity, RefreshCw, Calendar,
  Clock, User as UserIcon, Wallet, FileText, Shield, BookOpen,
  ChevronRight, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { anggotaService, type AnggotaStatistics } from '@/services/anggota.service';
import { lahanService, type LahanStatistics } from '@/services/lahan.service';
import pnbpService, { type PnbpStatistics } from '@/services/pnbp.service';
import keuanganService, { type KeuanganStatistics, type MonthlyReport } from '@/services/keuangan.service';
import { authService, type User } from '@/services/auth.service';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
const ANGGOTA_COLORS = ['#10b981', '#f59e0b'];
const PNBP_COLORS = ['#10b981', '#3b82f6', '#ef4444'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getCurrentDateTime() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();
  return {
    date: `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
    time: `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}.${String(now.getSeconds()).padStart(2, '0')}`,
  };
}

function formatShort(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [anggotaStats, setAnggotaStats] = useState<AnggotaStatistics | null>(null);
  const [lahanStats, setLahanStats] = useState<LahanStatistics | null>(null);
  const [pnbpStats, setPnbpStats] = useState<PnbpStatistics | null>(null);
  const [keuanganStats, setKeuanganStats] = useState<KeuanganStatistics | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentDateTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [userRes, anggotaRes, lahanRes, pnbpRes, keuanganRes, monthlyRes] = await Promise.all([
      authService.getCurrentUser(),
      anggotaService.getStatistics(),
      lahanService.getStatistics(),
      pnbpService.getStatistics(),
      keuanganService.getStatistics(),
      keuanganService.getMonthlyReport(),
    ]);
    if (userRes.success) setUser(userRes.data);
    if (anggotaRes.success) setAnggotaStats(anggotaRes.data);
    if (lahanRes.success) setLahanStats(lahanRes.data);
    if (pnbpRes.success) setPnbpStats(pnbpRes.data);
    if (keuanganRes.success) setKeuanganStats(keuanganRes.data);
    if (monthlyRes.success) setMonthlyReport(monthlyRes.data);
    setLoading(false);
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const userInfo = { fullName: user.namaLengkap, role: user.role };

  // Chart data
  const chartData = MONTHS_SHORT.map((name, idx) => {
    const found = monthlyReport.find(r => r.bulan === idx + 1);
    return { name, Pemasukan: found?.pemasukan || 0, Pengeluaran: found?.pengeluaran || 0 };
  });

  const anggotaDonut = [
    { name: 'Aktif', value: anggotaStats?.active || 0 },
    { name: 'Tidak Aktif', value: anggotaStats?.inactive || 0 },
  ];

  const pnbpDonut = [
    { name: 'Lunas', value: pnbpStats?.totalLunas || 0 },
    { name: 'Belum Bayar', value: pnbpStats?.totalBelumBayar || 0 },
    { name: 'Terlambat', value: pnbpStats?.totalTerlambat || 0 },
  ];

  const pnbpTotal = (pnbpStats?.totalLunas || 0) + (pnbpStats?.totalBelumBayar || 0) + (pnbpStats?.totalTerlambat || 0);

  const quickLinks = [
    { label: 'Anggota', desc: 'Data anggota', icon: Users, href: '/anggota', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Lahan', desc: 'Lahan KHDPK', icon: MapPin, href: '/lahan', color: 'bg-teal-50 border-teal-200 text-teal-700' },
    { label: 'Keuangan', desc: 'Transaksi', icon: Wallet, href: '/keuangan', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'PNBP', desc: 'Tagihan', icon: Receipt, href: '/pnbp', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { label: 'Aset', desc: 'Inventaris', icon: Shield, href: '/aset', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { label: 'Kegiatan', desc: 'Jadwal', icon: Calendar, href: '/kegiatan', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { label: 'Dokumen', desc: 'Arsip', icon: FileText, href: '/dokumen', color: 'bg-pink-50 border-pink-200 text-pink-700' },
    { label: 'Buku Kas', desc: 'Ledger', icon: BookOpen, href: '/buku-kas', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  ];

  return (
    <MainLayout user={userInfo}>
      <div className="space-y-5">

        {/* ── Hero Banner ── */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white rounded-full -translate-y-1/2 opacity-50" />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium mb-3">
                <Activity className="w-3.5 h-3.5" />
                Dashboard KTH Berkah Tani Mandiri
              </div>
              <h1 className="text-2xl font-bold mb-1">{getGreeting()}, {user.namaLengkap}! 👋</h1>
              <p className="text-white/80 text-sm mb-4 max-w-lg">Selamat datang di sistem manajemen KTH Berkah Tani Mandiri. Berikut ringkasan data terkini.</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/90">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{currentTime.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{currentTime.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={loadData}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shrink-0"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Total Anggota', value: anggotaStats?.total || 0,
              sub: `${anggotaStats?.active || 0} aktif · ${anggotaStats?.inactive || 0} tidak aktif`,
              icon: Users, border: 'border-blue-400', bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
              trend: 'up', trendText: `${anggotaStats?.total ? Math.round(((anggotaStats.active || 0) / anggotaStats.total) * 100) : 0}% aktif`,
            },
            {
              title: 'Total Lahan', value: `${lahanStats?.total || 0} petak`,
              sub: `${lahanStats?.totalLuas || 0} Ha · ${lahanStats?.statusSah || 0} SK Sah`,
              icon: MapPin, border: 'border-teal-400', bg: 'bg-teal-50', iconBg: 'bg-teal-100', iconColor: 'text-teal-600',
              trend: 'up', trendText: `${lahanStats?.statusProses || 0} dalam proses`,
            },
            {
              title: 'Saldo Kas', value: formatCurrency(keuanganStats?.saldoKas || 0),
              sub: `${keuanganStats?.jumlahTransaksi || 0} transaksi`,
              icon: Wallet, border: 'border-green-400', bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600',
              trend: (keuanganStats?.transaksiPending || 0) > 0 ? 'down' : 'up',
              trendText: `${keuanganStats?.transaksiPending || 0} pending`,
            },
            {
              title: 'PNBP Lunas', value: `${pnbpStats?.totalLunas || 0} tagihan`,
              sub: `dari ${pnbpStats?.totalTagihan || 0} total tagihan`,
              icon: Receipt, border: 'border-purple-400', bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
              trend: (pnbpStats?.totalTerlambat || 0) > 0 ? 'down' : 'up',
              trendText: `${pnbpStats?.totalTerlambat || 0} terlambat`,
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`${s.bg} border-2 ${s.border} rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.sub}</p>
                  </div>
                  <div className={`${s.iconBg} p-2.5 rounded-full shrink-0`}>
                    <Icon className={s.iconColor} size={18} />
                  </div>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 leading-tight">{s.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${s.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {s.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{s.trendText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Monthly Financial Chart ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Arus Kas Bulanan {new Date().getFullYear()}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pemasukan dan pengeluaran per bulan</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" />Pemasukan</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-rose-400 inline-block" />Pengeluaran</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPemasukan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPengeluaran" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}rb` : String(v)}
                tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" strokeWidth={2.5} fill="url(#gradPemasukan)" dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradPengeluaran)" dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Donut Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Anggota */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Status Anggota</h3>
                <p className="text-xs text-gray-500 mt-0.5">Distribusi keanggotaan KTH</p>
              </div>
              <button onClick={() => navigate('/anggota')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                Detail <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={anggotaDonut} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={4} dataKey="value" labelLine={false} label={PieLabel}>
                      {anggotaDonut.map((_, i) => <Cell key={i} fill={ANGGOTA_COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {anggotaDonut.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ANGGOTA_COLORS[i] }} />
                        {d.name}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{d.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${anggotaStats?.total ? (d.value / anggotaStats.total) * 100 : 0}%`, backgroundColor: ANGGOTA_COLORS[i] }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Total: <span className="font-bold text-gray-900">{anggotaStats?.total || 0} anggota</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* PNBP */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Status PNBP</h3>
                <p className="text-xs text-gray-500 mt-0.5">Distribusi tagihan PNBP</p>
              </div>
              <button onClick={() => navigate('/pnbp')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                Detail <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={pnbpDonut} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={4} dataKey="value" labelLine={false} label={PieLabel}>
                      {pnbpDonut.map((_, i) => <Cell key={i} fill={PNBP_COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {pnbpDonut.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PNBP_COLORS[i] }} />
                        {d.name}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{d.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pnbpTotal ? (d.value / pnbpTotal) * 100 : 0}%`, backgroundColor: PNBP_COLORS[i] }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Terbayar: <span className="font-bold text-green-600">{formatCurrency(pnbpStats?.totalTerbayar || 0)}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Keuangan + Lahan Progress ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Keuangan Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Ringkasan Keuangan</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tahun {new Date().getFullYear()}</p>
              </div>
              <button onClick={() => navigate('/keuangan')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                Detail <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <ArrowUpRight className="text-green-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Total Pemasukan</p>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(keuanganStats?.totalPemasukan || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <ArrowDownRight className="text-red-500" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Total Pengeluaran</p>
                  <p className="text-sm font-bold text-red-500">{formatCurrency(keuanganStats?.totalPengeluaran || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Wallet className="text-blue-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Saldo Saat Ini</p>
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(keuanganStats?.saldoKas || 0)}</p>
                </div>
                {(keuanganStats?.transaksiPending || 0) > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                    {keuanganStats?.transaksiPending} pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lahan Progress */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Status Lahan KHDPK</h3>
                <p className="text-xs text-gray-500 mt-0.5">Legalitas dan area kelola</p>
              </div>
              <button onClick={() => navigate('/lahan')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                Detail <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-gray-600"><CheckCircle2 size={13} className="text-green-500" />SK Sah</span>
                  <span className="font-bold text-gray-900">{lahanStats?.statusSah || 0} petak · {lahanStats?.total ? Math.round(((lahanStats.statusSah || 0) / lahanStats.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-green-500 transition-all duration-700" style={{ width: `${lahanStats?.total ? ((lahanStats.statusSah || 0) / lahanStats.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-gray-600"><AlertTriangle size={13} className="text-yellow-500" />Dalam Proses</span>
                  <span className="font-bold text-gray-900">{lahanStats?.statusProses || 0} petak · {lahanStats?.total ? Math.round(((lahanStats.statusProses || 0) / lahanStats.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-yellow-400 transition-all duration-700" style={{ width: `${lahanStats?.total ? ((lahanStats.statusProses || 0) / lahanStats.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-100">
                  <p className="text-xl font-bold text-teal-700">{lahanStats?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Petak</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                  <p className="text-xl font-bold text-blue-700">{lahanStats?.totalLuas || 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Ha</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Access ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Akses Cepat</h3>
            <p className="text-xs text-gray-500 mt-0.5">Navigasi cepat ke seluruh modul sistem</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(link.href)}
                  className={`${link.color} border rounded-xl p-3 flex flex-col items-center gap-2 text-center hover:shadow-md transition-all hover:-translate-y-0.5`}
                >
                  <Icon size={20} />
                  <p className="text-xs font-semibold leading-tight">{link.label}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
