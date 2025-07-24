'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'framer-motion';

interface EmailSignupProps {
  title?: string;
  buttonText?: string;
  className?: string;
}

export default function EmailSignup({ 
  title = "Получайте уведомления о новых чайных местах в вашем районе",
  buttonText = "Уведомить меня",
  className = ""
}: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Пожалуйста, введите действительный адрес электронной почты');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      console.log('Email signup:', email);
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center p-6 bg-tea-100 rounded-lg border border-tea-200 ${className}`}
      >
        <span className="text-2xl mr-2">✅</span>
        <span className="text-tea-800 font-medium">Спасибо! Мы уведомим вас о новых местах поблизости.</span>
      </motion.div>
    );
  }

  return (
    <div className={`p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md ${className}`}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-2">📧</span>
        <h3 className="text-lg font-semibold text-forest-800">{title}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Введите ваш адрес электронной почты"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white border-tea-300 focus:border-tea-500 focus:ring-tea-500"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90 transition-opacity px-6"
        >
          {isLoading ? 'Подписка...' : buttonText}
        </Button>
      </form>
      
      <p className="text-xs text-sage-600 mt-2">
        Присоединяйтесь к 500+ энтузиастам чайных церемоний. Никакого спама, отписка в любое время.
      </p>
    </div>
  );
}