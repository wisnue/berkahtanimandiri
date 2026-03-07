import { useState, useEffect, useRef } from 'react';
import { Bell, Search, LogOut, User, ChevronDown, FileText, Users, MapPin, DollarSign, Calendar, Grid, Wallet, HelpCircle, Moon, Sun, Shield, Clock, Lock, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useLocation } from 'wouter';
import { searchService, type SearchResult } from '@/services/search.service';
import { statsService, type UserStats } from '@/services/stats.service';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';
import { MobileSearchModal } from './MobileSearchModal';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ laporan: 24, aktivitas: 156, proyek: 8 });
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    if (saved) document.documentElement.classList.add('dark');
    return saved;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, icon: '⚠️', message: 'Terdapat tagihan PNBP yang belum dibayar', time: '5 menit lalu', read: false },
    { id: 2, icon: '📋', message: 'Laporan keuangan bulan ini tersedia', time: '1 jam lalu', read: false },
    { id: 3, icon: '✅', message: 'Data anggota aktif berhasil diperbarui', time: '3 jam lalu', read: true },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Load user stats
  useEffect(() => {
    const loadStats = async () => {
      const response = await statsService.getUserStats();
      if (response.success && response.data) {
        setUserStats(response.data);
      }
    };
    loadStats();
  }, []);

  // Dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await searchService.globalSearch(query);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
        setShowResults(response.data.length > 0);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    setLocation(result.link);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'anggota': return <Users size={16} className="text-blue-500" />;
      case 'lahan': return <MapPin size={16} className="text-green-500" />;
      case 'pnbp': return <DollarSign size={16} className="text-purple-500" />;
      case 'kegiatan': return <Calendar size={16} className="text-orange-500" />;
      case 'dokumen': return <FileText size={16} className="text-gray-500" />;
      case 'aset': return <Grid size={16} className="text-teal-500" />;
      case 'keuangan': return <Wallet size={16} className="text-indigo-500" />;
      default: return <FileText size={16} />;
    }
  };

  // Get last login time
  const lastLoginTime = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="shadow-lg fixed top-0 left-0 right-0 z-30" style={{ backgroundColor: '#059669', height: '56px' }}>
      <div className="h-full px-4 md:px-6 flex items-center">
        <div className="flex items-center gap-2 md:gap-6 w-full">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 bg-white/10 backdrop-blur-sm rounded-xl">
              <span className="text-2xl">🌳</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-base leading-tight">DESA GEMBOL</h1>
              <p className="text-green-100 text-xs">Management System</p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md ml-auto mr-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Cari data lahan, pekerja, pengiriman, pembayaran..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                    Hasil Pencarian ({searchResults.length})
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchSelect(result)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className="mt-0.5">{getResultIcon(result.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                        <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Date, Notifications & User */}
          <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
            {/* Current Date */}
            <div className="hidden lg:block text-right">
              <p className="text-white/90 text-xs font-medium">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Mobile Search Button */}
            <button 
              onClick={() => setShowMobileSearchModal(true)}
              className="md:hidden p-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => { setShowNotifications(prev => !prev); setShowUserDropdown(false); }}
                className="relative p-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Notifikasi"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full ring-2 ring-green-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: '#059669' }}>
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-white" />
                      <span className="text-white font-semibold text-sm">Notifikasi</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{unreadCount} baru</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-white/80 hover:text-white text-xs">Tandai dibaca</button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="text-white/80 hover:text-white"><X size={14} /></button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        <Bell size={28} className="mx-auto mb-2 text-gray-300" />
                        <p>Tidak ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-emerald-50/40' : ''}`}>
                          <div className="flex gap-3">
                            <span className="text-base shrink-0 mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5"></span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Lihat semua notifikasi</button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
              title={isDarkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{(user?.namaLengkap || user?.email || 'U').charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white text-sm font-medium leading-tight">{user?.namaLengkap || 'User'}</p>
                  <p className="text-green-100 text-xs capitalize">{user?.role || 'Admin'}</p>
                </div>
                <ChevronDown size={16} className={`text-white transition-transform hidden sm:block ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Enhanced Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  {/* User Profile Header */}
                  <div className="px-5 py-3" style={{ backgroundColor: '#059669' }}>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <span className="text-white font-bold text-xl">{(user?.namaLengkap || user?.email || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{user?.namaLengkap || 'User'}</p>
                        <p className="text-green-100 text-xs truncate">{user?.email || ''}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="h-1.5 w-1.5 bg-green-300 rounded-full"></div>
                          <span className="text-green-100 text-xs">Member sejak Juli 2024</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg py-1.5">
                        <p className="text-white font-bold text-lg">{userStats.laporan}</p>
                        <p className="text-green-100 text-xs">Laporan</p>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg py-1.5">
                        <p className="text-white font-bold text-lg">{userStats.aktivitas}</p>
                        <p className="text-green-100 text-xs">Aktivitas</p>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg py-1.5">
                        <p className="text-white font-bold text-lg">{userStats.proyek}</p>
                        <p className="text-green-100 text-xs">Proyek</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setLocation('/profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="text-gray-500" />
                      <span>Profil Saya</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowChangePasswordModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Lock size={16} className="text-gray-500" />
                      <span>Ubah Password</span>
                    </button>
                    <button
                      onClick={() => { setShowUserDropdown(false); setShowNotifications(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Bell size={16} className="text-gray-500" />
                      <div className="flex items-center justify-between flex-1">
                        <span>Notifikasi</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => { toggleDarkMode(); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {isDarkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-gray-500" />}
                      <div className="flex items-center justify-between flex-1">
                        <span>{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          isDarkMode ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>{isDarkMode ? 'Aktif' : 'Off'}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setLocation('/help');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle size={16} className="text-gray-500" />
                      <span>Bantuan & Dukungan</span>
                    </button>
                  </div>

                  {/* Security Info */}
                  <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Shield size={12} className="text-green-600" />
                      <span className="font-medium">Keamanan: Terverifikasi</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>Login terakhir: {lastLoginTime}</span>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={showMobileSearchModal}
        onClose={() => setShowMobileSearchModal(false)}
      />
    </header>
  );
}
