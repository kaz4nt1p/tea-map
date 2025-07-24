'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'framer-motion';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      console.log('Contact form:', formData);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <span className="text-4xl mb-4 block">🍃</span>
        <h3 className="text-xl font-semibold text-forest-800 mb-2">Спасибо за ваше сообщение!</h3>
        <p className="text-sage-600">Мы свяжемся с вами в ближайшее время.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          name="name"
          placeholder="Ваше имя"
          value={formData.name}
          onChange={handleChange}
          className="bg-white border-tea-300 focus:border-tea-500 focus:ring-tea-500"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Input
          name="email"
          type="email"
          placeholder="Ваш email"
          value={formData.email}
          onChange={handleChange}
          className="bg-white border-tea-300 focus:border-tea-500 focus:ring-tea-500"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <textarea
          name="message"
          rows={4}
          placeholder="Ваше сообщение"
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-tea-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-tea-500 bg-white resize-vertical"
          disabled={isLoading}
        />
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90 transition-opacity"
      >
        {isLoading ? 'Отправка...' : 'Отправить сообщение'}
      </Button>
    </form>
  );
}