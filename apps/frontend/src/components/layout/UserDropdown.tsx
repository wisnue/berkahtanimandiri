import { useState, useRef, useEffect } from 'react';
import { User, Settings, Bell, HelpCircle, LogOut, Moon, Shield, Clock, ChevronDown } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useLocation } from 'wouter';

interface UserDropdownProps {
  user: {
    fullName: string;
    role: string;
    email?: string;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data - nanti bisa diganti dengan data real dari API
  const userStats = {
    laporan: 24,
    aktivitas: 156,
    proyek: 8,
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    const response = await authService.logout();
    if (response.success) {
      setLocation('/login');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName}, ${date} ${month} ${year}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}.${minutes}.${String(now.getSeconds()).padStart(2, '0')}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Date/Time and User Button */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right text-xs text-gray-600">
          <div>{getCurrentDate()}</div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {getInitials(user.fullName)}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            3
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[85vh] overflow-y-auto">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                {getInitials(user.fullName)}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{user.fullName}</h3>
                <p className="text-xs text-gray-600">{user.email || 'root@sugarcane.local'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-gray-500">Member sejak Juli 2024</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{userStats.laporan}</div>
                <div className="text-xs text-gray-600">Laporan</div>
              </div>
              <div className="text-center border-l border-r border-gray-300">
                <div className="text-lg font-bold text-gray-900">{userStats.aktivitas}</div>
                <div className="text-xs text-gray-600">Aktivitas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{userStats.proyek}</div>
                <div className="text-xs text-gray-600">Proyek</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <User size={18} className="text-gray-400" />
              <span>Profil Saya</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Settings size={18} className="text-gray-400" />
              <span>Pengaturan</span>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-400" />
                <span>Notifikasi</span>
              </div>
              <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                3
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Moon size={18} className="text-gray-400" />
              <span>Mode Gelap</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <HelpCircle size={18} className="text-gray-400" />
              <span>Bantuan & Dukungan</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
              <Shield size={14} />
              <span>Keamanan: Terverifikasi</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock size={14} />
              <span>Login terakhir: Hari ini, {getCurrentTime()}</span>
            </div>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
