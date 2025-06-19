'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FiHome,
  FiCalendar,
  FiUpload,
  FiUsers,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { href: '/dashboard/events', icon: FiCalendar, label: 'Events' },
    { href: '/dashboard/upload', icon: FiUpload, label: 'Upload' },
    { href: '/dashboard/attendees', icon: FiUsers, label: 'Attendees' },
    { href: '/dashboard/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <nav className={cn('flex flex-col h-full', className)}>
      <div className="px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-[#003480]'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#003480]'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-[#003480]' : 'text-gray-500'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Spacer to push logout to bottom */}
      <div className="flex-grow"></div>

      {/* Logout button */}
      <div className="px-3 py-4 mt-auto border-t border-gray-200">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-red-600"
        >
          <FiLogOut className="h-5 w-5 text-gray-500" />
          Logout
        </button>
      </div>
    </nav>
  );
}
