import React from 'react';
import { Route, Switch } from 'wouter';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages (will be created)
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AnggotaPage = React.lazy(() => import('@/pages/dashboard/AnggotaPage'));
const AnggotaDetailPage = React.lazy(() => import('@/pages/dashboard/AnggotaDetailPage'));
const LahanPage = React.lazy(() => import('@/pages/dashboard/LahanPage'));
const PnbpPage = React.lazy(() => import('@/pages/dashboard/PnbpPage'));
const KeuanganPage = React.lazy(() => import('@/pages/dashboard/KeuanganPage'));
const AsetPage = React.lazy(() => import('@/pages/dashboard/AsetPage'));
const KegiatanPage = React.lazy(() => import('@/pages/dashboard/KegiatanPage'));
const DokumenPage = React.lazy(() => import('@/pages/dashboard/DokumenPage'));
const SettingsPage = React.lazy(() => import('@/pages/dashboard/SettingsPage'));
const ProfilePage = React.lazy(() => import('@/pages/dashboard/ProfilePage'));
const HelpCenterPage = React.lazy(() => import('@/pages/dashboard/HelpCenterPage'));
const AuditTrailPage = React.lazy(() => import('@/pages/dashboard/AuditTrailPage'));
const BukuKasPage = React.lazy(() => import('@/pages/dashboard/BukuKasPage'));
const RekonsiliasipnbpPage = React.lazy(() => import('@/pages/dashboard/RekonsiliasipnbpPage'));
const DokumenOrganisasiPage = React.lazy(() => import('@/pages/dashboard/DokumenOrganisasiPage'));

export function AppRouter() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
        <Route path="/anggota">
          <ProtectedRoute>
            <AnggotaPage />
          </ProtectedRoute>
        </Route>
        <Route path="/anggota/:id">
          <ProtectedRoute>
            <AnggotaDetailPage />
          </ProtectedRoute>
        </Route>
        <Route path="/lahan">
          <ProtectedRoute>
            <LahanPage />
          </ProtectedRoute>
        </Route>
        <Route path="/pnbp">
          <ProtectedRoute>
            <PnbpPage />
          </ProtectedRoute>
        </Route>
        <Route path="/keuangan">
          <ProtectedRoute>
            <KeuanganPage />
          </ProtectedRoute>
        </Route>
        <Route path="/aset">
          <ProtectedRoute>
            <AsetPage />
          </ProtectedRoute>
        </Route>
        <Route path="/kegiatan">
          <ProtectedRoute>
            <KegiatanPage />
          </ProtectedRoute>
        </Route>
        <Route path="/dokumen">
          <ProtectedRoute>
            <DokumenPage />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        </Route>
        <Route path="/audit-trail">
          <ProtectedRoute>
            <AuditTrailPage />
          </ProtectedRoute>
        </Route>
        <Route path="/buku-kas">
          <ProtectedRoute>
            <BukuKasPage />
          </ProtectedRoute>
        </Route>
        <Route path="/rekonsiliasi-pnbp">
          <ProtectedRoute>
            <RekonsiliasipnbpPage />
          </ProtectedRoute>
        </Route>
        <Route path="/dokumen-organisasi">
          <ProtectedRoute>
            <DokumenOrganisasiPage />
          </ProtectedRoute>
        </Route>
        <Route path="/help">
          <ProtectedRoute>
            <HelpCenterPage />
          </ProtectedRoute>
        </Route>
        
        {/* 404 */}
        <Route component={() => (
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold text-secondary-900">404</h1>
            <p className="text-secondary-600 mt-2">Halaman tidak ditemukan</p>
          </div>
        )} />
      </Switch>
    </React.Suspense>
  );
}
