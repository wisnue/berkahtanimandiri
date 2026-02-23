import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Receipt, TrendingUp, Activity, RefreshCw, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { anggotaService, type AnggotaStatistics } from '@/services/anggota.service';
import { lahanService, type LahanStatistics } from '@/services/lahan.service';
import pnbpService, { type PnbpStatistics } from '@/services/pnbp.service';
import keuanganService, { type KeuanganStatistics } from '@/services/keuangan.service';
import { authService, type User } from '@/services/auth.service';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [anggotaStats, setAnggotaStats] = useState<AnggotaStatistics | null>(null);
  const [lahanStats, setLahanStats] = useState<LahanStatistics | null>(null);
  const [pnbpStats, setPnbpStats] = useState<PnbpStatistics | null>(null);
  const [keuanganStats, setKeuanganStats] = useState<KeuanganStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [userRes, anggotaRes, lahanRes, pnbpRes, keuanganRes] = await Promise.all([
      authService.getCurrentUser(),
      anggotaService.getStatistics(),
      lahanService.getStatistics(),
      pnbpService.getStatistics(),
      keuanganService.getStatistics(),
    ]);

    if (userRes.success) setUser(userRes.data);
    if (anggotaRes.success) setAnggotaStats(anggotaRes.data);
    if (lahanRes.success) setLahanStats(lahanRes.data);
    if (pnbpRes.success) setPnbpStats(pnbpRes.data);
    if (keuanganRes.success) setKeuanganStats(keuanganRes.data);

    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const getCurrentDateTime = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return {
      date: `${dayName}, ${date} ${month} ${year}`,
      time: `${hours}.${minutes}.${String(now.getSeconds()).padStart(2, '0')}`
    };
  };

  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
          <p className="text-secondary-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const userInfo = {
    fullName: user.namaLengkap,
    role: user.role,
  };

  const stats = [
    {
      title: 'LAHAN TEBU',
      subtitle: '11 lokasi terdaftar',
      value: lahanStats?.total.toString() || '0',
      change: '+12.5% vs bulan lalu',
      icon: MapPin,
      color: 'border-teal-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
    },
    {
      title: 'PEKERJA AKTIF',
      subtitle: 'total pekerja terdaftar',
      value: anggotaStats?.active.toString() || '0',
      change: '+8.2% vs bulan lalu',
      icon: Users,
      color: 'border-blue-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'PENDAPATAN',
      subtitle: 'Total pendapatan',
      value: formatCurrency(pnbpStats?.totalTerbayar || 0),
      change: '+15.3% vs bulan lalu',
      icon: Receipt,
      color: 'border-green-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      title: 'PENGIRIMAN',
      subtitle: 'Total pengiriman',
      value: '6',
      change: '+5.7% vs bulan lalu',
      icon: TrendingUp,
      color: 'border-purple-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
  ];

  return (
    <MainLayout user={userInfo}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white overflow-hidden shadow-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>

          <div className="relative z-10">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard Professional</span>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={loadData}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {getGreeting()}, {user?.namaLengkap}! 👋
                </h1>
                <p className="text-white/90 mb-6 max-w-2xl text-base">
                  Kelola sistem manajemen tebu dan tenaga kerja dengan mudah dan efisien menggunakan platform terintegrasi
                </p>

                {/* Info Bar */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{currentTime.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{currentTime.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="capitalize">{user?.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Diperbarui kurang dari 1 menit yang lalu</span>
                  </div>
                </div>
              </div>

              {/* Icon Circle */}
              <div className="hidden lg:flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full">
                <TrendingUp className="w-16 h-16" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`${stat.bgColor} ${stat.color} border-2 rounded-xl p-6 transition-all hover:shadow-md flex flex-col`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-gray-700 tracking-wide">
                        {stat.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.iconBg} p-3 rounded-full`}>
                    <Icon className={stat.iconColor} size={20} />
                  </div>
                </div>
                
                <div className="mt-auto">
                  <p className="card-number text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <TrendingUp size={14} className="text-green-600" />
                    <span>{stat.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Anggota Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Anggota</CardTitle>
              <CardDescription>Status keanggotaan KTH</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-xs text-secondary-600">Anggota Aktif</p>
                    <p className="text-lg font-bold text-green-600">{anggotaStats?.active || 0}</p>
                  </div>
                  <Users className="text-green-600" size={24} />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-xs text-secondary-600">Tidak Aktif</p>
                    <p className="text-lg font-bold text-yellow-600">{anggotaStats?.inactive || 0}</p>
                  </div>
                  <Users className="text-yellow-600" size={24} />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-xs text-secondary-600">Total Keseluruhan</p>
                    <p className="text-lg font-bold text-blue-600">{anggotaStats?.total || 0}</p>
                  </div>
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lahan Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Lahan KHDPK</CardTitle>
              <CardDescription>Status legalitas lahan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-xs text-secondary-600">SK Sah</p>
                    <p className="text-lg font-bold text-green-600">{lahanStats?.statusSah || 0}</p>
                  </div>
                  <MapPin className="text-green-600" size={24} />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-xs text-secondary-600">Dalam Proses</p>
                    <p className="text-lg font-bold text-yellow-600">{lahanStats?.statusProses || 0}</p>
                  </div>
                  <MapPin className="text-yellow-600" size={24} />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-primary-50 rounded-lg">
                  <div>
                    <p className="text-xs text-secondary-600">Total Luas</p>
                    <p className="text-lg font-bold text-primary-600">{lahanStats?.totalLuas || 0} Ha</p>
                  </div>
                  <Activity className="text-primary-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
