'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import UserMenu from './auth/UserMenu';
import { 
  Home, 
  Map, 
  User, 
  Menu,
  X 
} from 'lucide-react';
import { TeaIconFilled } from './TeaIcon';
import { useState } from 'react';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      name: 'Лента', 
      href: '/dashboard', 
      icon: Home, 
      active: pathname === '/dashboard' 
    },
    { 
      name: 'Карта', 
      href: '/map', 
      icon: Map, 
      active: pathname === '/map' 
    },
    { 
      name: 'Профиль', 
      href: '/profile', 
      icon: User, 
      active: pathname === '/profile',
      authRequired: true
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.authRequired || (item.authRequired && isAuthenticated)
  );

  // Don't show navigation on auth pages and landing page only
  if (pathname === '/auth' || pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-sage-50 to-tea-50 shadow-sm border-b border-tea-200 w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center flex-shrink-0">
            <div className="flex-shrink-0 flex items-center">
              <TeaIconFilled size={24} className="text-forest-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-forest-800">Tea Map</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-tea-100 text-forest-700'
                      : 'text-sage-600 hover:text-forest-600 hover:bg-tea-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side - User menu or auth button */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 relative">
            {isAuthenticated ? (
              <UserMenu onMenuOpen={() => setIsMobileMenuOpen(false)} />
            ) : (
              <Link
                href="/auth"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Войти
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white relative z-50">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      item.active
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;