import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Receipt,
  Wallet,
  Package,
  Calendar,
  FileText,
  Settings,
  LogOut,
  // Menu, X — reserved for mobile toggle
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  BookOpen,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user?: {
    fullName: string;
    role: string;
  };
  onCollapseChange?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ user, onCollapseChange, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(() => {
    // Load from localStorage or default
    const saved = localStorage.getItem('sidebarExpandedGroups');
    if (saved) {
      return JSON.parse(saved);
    }
    return { 'DASHBOARD': true };
  });

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => {
      const newState = {
        ...prev,
        [groupTitle]: !prev[groupTitle]
      };
      // Save to localStorage
      localStorage.setItem('sidebarExpandedGroups', JSON.stringify(newState));
      return newState;
    });
  };

  const handleMobileMenuClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const navigationGroups = [
    {
      title: 'DASHBOARD',
      items: [
        { name: 'Beranda', href: '/', icon: LayoutDashboard },
      ]
    },
    {
      title: 'MASTER DATA',
      items: [
        { name: 'Anggota', href: '/anggota', icon: Users },
        { name: 'Lahan KHDPK', href: '/lahan', icon: MapPin },
      ]
    },
    {
      title: 'KEUANGAN & PNBP',
      items: [
        { name: 'PNBP', href: '/pnbp', icon: Receipt },
        { name: 'Keuangan', href: '/keuangan', icon: Wallet },
        { name: 'Buku Kas', href: '/buku-kas', icon: BookOpen },
        { name: 'Rekonsiliasi PNBP', href: '/rekonsiliasi-pnbp', icon: GitCompare },
      ]
    },
    {
      title: 'ASET & KEGIATAN',
      items: [
        { name: 'Aset', href: '/aset', icon: Package },
        { name: 'Kegiatan', href: '/kegiatan', icon: Calendar },
      ]
    },
    {
      title: 'DOKUMEN',
      items: [
        { name: 'Dokumen', href: '/dokumen', icon: FileText },
        { name: 'Dokumen Organisasi', href: '/dokumen-organisasi', icon: Shield },
      ]
    },
    {
      title: 'SISTEM',
      adminOnly: true,
      items: [
        { name: 'Pengaturan', href: '/settings', icon: Settings },
        { name: 'Audit Trail', href: '/audit-trail', icon: Shield },
      ]
    },
  ];

  // Auto-expand group containing current page
  React.useEffect(() => {
    // Find which group contains the current location
    const activeGroup = navigationGroups.find(group => 
      group.items.some(item => item.href === location)
    );

    if (activeGroup) {
      setExpandedGroups(prev => {
        const newState = {
          ...prev,
          [activeGroup.title]: true
        };
        // Save to localStorage
        localStorage.setItem('sidebarExpandedGroups', JSON.stringify(newState));
        return newState;
      });
    }
  }, [location]); // Run when location changes

  return (
    <>
      {/* Mobile menu button - REMOVED, now in Header */}

      {/* Mobile Overlay - Click anywhere to close */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 cursor-pointer"
          onClick={handleMobileMenuClick}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'sidebar transition-all duration-300',
          isCollapsed ? 'lg:w-16' : 'lg:w-56',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ 
          overflowX: 'hidden',
          maxWidth: isCollapsed ? '4rem' : '14rem'
        }}
      >
        {/* Desktop Collapse Toggle */}
        <button
          onClick={handleToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-4 z-40 w-6 h-6 bg-white border border-secondary-200 rounded-full items-center justify-center hover:bg-secondary-50 transition-colors shadow-sm"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 overflow-y-auto">
          {navigationGroups.map((group) => {
            // Skip admin-only groups for non-admin users
            if (group.adminOnly && user?.role !== 'admin') {
              return null;
            }

            const isGroupExpanded = expandedGroups[group.title];
            const hasMultipleItems = group.items.length > 1;
            
            return (
              <div key={group.title} className="mb-2">
                {/* Group Title - Clickable untuk expand/collapse */}
                {!isCollapsed && hasMultipleItems ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full px-4 py-2 text-xs font-bold text-gray-500 tracking-wider hover:bg-secondary-50 transition-colors flex items-center justify-between group"
                  >
                    <span>{group.title}</span>
                    <ChevronDown 
                      size={14} 
                      className={cn(
                        "transition-transform duration-200",
                        isGroupExpanded && "rotate-180"
                      )}
                    />
                  </button>
                ) : !isCollapsed ? (
                  <div className="px-4 py-2 text-xs font-bold text-gray-500 tracking-wider">
                    {group.title}
                  </div>
                ) : null}
                
                {/* Group Items - Show/hide based on expansion state */}
                <div className={cn(
                  "transition-all duration-200 ease-in-out overflow-hidden",
                  isCollapsed ? 'space-y-0.5' : '',
                  !isCollapsed && hasMultipleItems && !isGroupExpanded && 'max-h-0',
                  !isCollapsed && (!hasMultipleItems || isGroupExpanded) && 'max-h-[500px]'
                )}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'sidebar-link',
                          isActive && 'sidebar-link-active',
                          isCollapsed && 'justify-center'
                        )}
                        onClick={handleMobileMenuClick}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon size={16} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 py-2 border-t border-secondary-200 space-y-0.5">
          <button 
            className={cn(
              "sidebar-link w-full text-red-600 hover:bg-red-50",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Keluar" : undefined}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
