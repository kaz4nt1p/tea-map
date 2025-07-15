'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData, emailValidation, passwordValidation, usernameValidation } from '../../lib/auth';
import GoogleSignIn from './GoogleSignIn';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    username: '',
    password: '',
    display_name: '',
    bio: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterData & { confirmPassword: string }>>({});
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData & { confirmPassword: string }> = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailValidation.validate(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else {
      const usernameCheck = usernameValidation.validate(formData.username);
      if (!usernameCheck.isValid) {
        newErrors.username = usernameCheck.errors[0];
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordCheck = passwordValidation.validate(formData.password);
      if (!passwordCheck.isValid) {
        newErrors.password = passwordCheck.errors[0];
      }
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        display_name: formData.display_name || formData.username,
        bio: formData.bio
      });
      // Success handled by AuthContext
    } catch (error) {
      // Error handled by AuthContext
      console.error('Registration error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-forest-900 mb-2">
            Присоединиться к Forest Tea
          </h2>
          <p className="text-forest-600">
            Создайте аккаунт и начните делиться чайными местами
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-forest-700 mb-1">
              Email *
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
            <label htmlFor="username" className="block text-sm font-medium text-forest-700 mb-1">
              Имя пользователя *
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              className={errors.username ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-forest-700 mb-1">
              Отображаемое имя
            </label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="Как вас называть?"
              className={errors.display_name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.display_name && (
              <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-forest-700 mb-1">
              Пароль *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 8 символов"
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-forest-700 mb-1">
              Подтвердите пароль *
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              className={errors.confirmPassword ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-forest-700 mb-1">
              О себе
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Расскажите о своей любви к чаю..."
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-tea-500 ${
                errors.bio ? 'border-red-500' : ''
              }`}
              rows={3}
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4 text-sm text-gray-500">или</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <GoogleSignIn 
          text="Зарегистрироваться через Google" 
          disabled={isLoading}
          className="mb-6"
        />

        <div className="mt-6 text-center">
          <p className="text-forest-600">
            Уже есть аккаунт?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-tea-600 hover:text-tea-700 font-medium"
              disabled={isLoading}
            >
              Войти
            </button>
          </p>
        </div>

        <div className="mt-4 text-xs text-forest-500">
          <p>
            * Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;