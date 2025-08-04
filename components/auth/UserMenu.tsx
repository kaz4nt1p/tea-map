'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { AvatarImage } from '../AvatarImage';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  onMenuOpen?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onMenuOpen }) => {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push('/profile');
  };

  if (!user) return null;

  const displayName = user.display_name || user.username;
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen && onMenuOpen) {
            onMenuOpen();
          }
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-tea-50 transition-colors"
        disabled={isLoading}
      >
        <AvatarImage
          src={user.avatar_url}
          alt={displayName}
          size="md"
          fallback={<span className="text-white font-medium text-sm">{initials}</span>}
        />
        <span className="text-forest-700 font-medium hidden lg:block max-w-[120px] truncate">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-forest-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-4 w-56 z-[99999]"
          >
            <Card className="shadow-xl border-gray-200 bg-white border rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={displayName}
                    size="md"
                    className="w-10 h-10"
                    fallback={<span className="text-white font-medium text-sm">{initials}</span>}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-forest-900 truncate">{displayName}</h3>
                    <p className="text-xs text-forest-600 truncate">@{user.username}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-gray-700 border-gray-200 bg-white hover:bg-gray-50 text-sm py-2"
                    onClick={handleProfileClick}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Профиль
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-red-600 border-red-200 bg-white hover:bg-red-50 text-sm py-2"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {isLoading ? 'Выход...' : 'Выйти'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;