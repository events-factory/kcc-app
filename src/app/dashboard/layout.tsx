'use client';

import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { Footer } from '@/components/ui/footer';
// Import debug utils for troubleshooting
import '@/lib/debug-utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state or nothing while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <div className="w-64 bg-white shadow-sm">
        {/* Logo container */}
        <div className="flex h-16 items-center justify-center px-4 bg-[#003480] text-white">
          <Image
            src={logo}
            alt="KCC Logo"
            width={100}
            height={32}
            className="brightness-0 invert" // Makes the logo white
            priority
          />
        </div>
        {/* Navigation */}
        <div className="py-4">
          <SidebarNav />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <h2 className="text-xl font-bold text-[#003480]">Dashboard</h2>
          <div className="text-sm">
            <span className="text-gray-500 mr-1">Signed in as:</span>
            <span className="font-medium">{user.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
