"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Radar, Users, User, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  // Mock user for now since we don't have actual auth flow hooked up yet.
  const [user, setUser] = useState<{name: string, email: string} | null>({
    name: "Alex Developer",
    email: "alex@example.com"
  });

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Trackers', href: '/trackers', icon: Radar },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-50 font-mono">
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold tracking-tighter text-red-500">JobPing.</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        {user ? (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col truncate">
                <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
                <span className="truncate text-xs text-gray-500">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
                Free plan
              </span>
              <button className="flex items-center text-xs font-medium text-red-500 hover:text-red-700">
                <LogOut className="mr-1 h-3 w-3" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button className="w-full rounded bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600">
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}
