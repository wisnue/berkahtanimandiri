import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import InactivityWarningModal from '../InactivityWarningModal';
import { useActivityTracker } from '@/hooks/useActivityTracker';

interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    fullName: string;
    role: string;
    email?: string;
  };
}

export function MainLayout({ children, user }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Activity tracker for session management
  const { showWarning, secondsRemaining, handleStayLoggedIn } = useActivityTracker();

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar - Fixed position */}
      <Sidebar 
        user={user} 
        onCollapseChange={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      
      {/* Header - Full width, fixed at top */}
      <Header onMenuClick={handleMobileMenuToggle} />
      
      {/* Main content with padding for sidebar and header */}
      <main 
        className={`transition-all duration-300 pt-[56px] bg-white min-h-screen ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'
        }`}
      >
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Inactivity Warning Modal */}
      <InactivityWarningModal
        isOpen={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
        secondsRemaining={secondsRemaining}
      />
    </div>
  );
}
