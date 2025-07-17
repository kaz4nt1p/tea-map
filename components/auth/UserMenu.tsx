'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { AvatarImage } from '../AvatarImage';
import { useRouter } from 'next/navigation';

const UserMenu: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-tea-50 transition-colors"
        disabled={isLoading}
      >
        <AvatarImage
          src={user.avatar_url}
          alt={displayName}
          size="md"
          fallback={<span className="text-white font-medium text-sm">{initials}</span>}
        />
        <span className="text-forest-700 font-medium hidden md:block">
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
            className="absolute right-0 mt-2 w-64 z-50"
          >
            <Card className="shadow-xl border-tea-200 bg-white/95 backdrop-blur-md border-2 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-tea-100">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={displayName}
                    size="lg"
                    className="w-12 h-12"
                    fallback={<span className="text-white font-medium text-lg">{initials}</span>}
                  />
                  <div>
                    <h3 className="font-medium text-forest-900">{displayName}</h3>
                    <p className="text-sm text-forest-600">@{user.username}</p>
                    <p className="text-xs text-forest-500">{user.email}</p>
                  </div>
                </div>

                {user.bio && (
                  <div className="mb-4 pb-4 border-b border-tea-100">
                    <p className="text-sm text-forest-700">{user.bio}</p>
                  </div>
                )}

                {user._count && (
                  <div className="mb-4 pb-4 border-b border-tea-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-forest-900">
                          {user._count.spots}
                        </p>
                        <p className="text-xs text-forest-600">Spots</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-forest-900">
                          {user._count.activities}
                        </p>
                        <p className="text-xs text-forest-600">Activities</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-forest-700 border-tea-200 bg-white hover:bg-tea-50"
                    onClick={handleProfileClick}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Профиль
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start text-forest-700 border-tea-200 bg-white hover:bg-tea-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Настройки
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 bg-white hover:bg-red-50"
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