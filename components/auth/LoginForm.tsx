'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../hooks/useAuth';
import { LoginData, emailValidation } from '../../lib/auth';
import GoogleSignIn from './GoogleSignIn';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailValidation.validate(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData);
      // Success handled by AuthContext
    } catch (error) {
      // Error handled by AuthContext
      console.error('Login error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-forest-900 mb-2">
            Войти в Forest Tea
          </h2>
          <p className="text-forest-600">
            Добро пожаловать! Войдите в свой аккаунт
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-forest-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-forest-700 mb-1">
              Пароль
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4 text-sm text-gray-500">или</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <GoogleSignIn 
          text="Войти через Google" 
          disabled={isLoading}
          className="mb-6"
        />

        <div className="mt-6 text-center">
          <p className="text-forest-600">
            Нет аккаунта?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-tea-600 hover:text-tea-700 font-medium"
              disabled={isLoading}
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;