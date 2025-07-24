'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGuestOnly } from '../../hooks/useAuth';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import ForestTeaLogo from '../../components/ForestTeaLogo';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { isLoading } = useGuestOnly();

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tea-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <ForestTeaLogo size={60} />
          <div className="mt-4 text-forest-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tea-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <ForestTeaLogo size={60} />
          <h1 className="text-3xl font-bold text-forest-900 mt-4">
            Forest Tea
          </h1>
          <p className="text-forest-600 mt-2">
            Откройте свои идеальные места для чайных церемоний
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={handleSwitchToRegister} />
          ) : (
            <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-forest-500">
            Продолжая, вы соглашаетесь с нашими{' '}
            <a href="#" className="text-tea-600 hover:text-tea-700">
              Условиями использования
            </a>{' '}
            и{' '}
            <a href="#" className="text-tea-600 hover:text-tea-700">
              Политикой конфиденциальности
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;