'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import ForestTeaLogo from '../ForestTeaLogo';
import InteractiveMapPreview from './InteractiveMapPreview';
import EmailSignup from './EmailSignup';
import ContactForm from './ContactForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const LandingPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const painPoints = [
    {
      icon: "🏙️",
      title: "Городской шум и суета",
      description: "Стресс от городской жизни мешает наслаждаться чайным моментом. Вы ищете тихие места для восстановления внутреннего равновесия, но не знаете, где их найти."
    },
    {
      icon: "☕",
      title: "Забытые вкусы и мысли",
      description: "После прекрасной чайной сессии вкусовые нюансы и глубокие мысли постепенно стираются из памяти. Нет способа сохранить и вернуться к этим ценным моментам осознанности."
    },
    {
      icon: "📍",
      title: "Скрытые места спокойствия",
      description: "Идеальные уголки для чайной медитации существуют рядом с вами, но они остаются неизвестными. Местные жители знают секретные места, но не делятся ими."
    }
  ];

  const outcomes = [
    {
      icon: "🌿",
      title: "Убежище от городского шума",
      description: "Находите проверенные тихие места рядом с собой, где другие любители чая уже насладились покоем и создали особую атмосферу для чайных сессий."
    },
    {
      icon: "💭",
      title: "Общение через вкус",
      description: "Записывайте свои чайные сессии, делитесь впечатлениями о вкусе, настроении и мыслях с сообществом единомышленников, получайте отклики и вдохновение."
    },
    {
      icon: "📸",
      title: "Память о моментах",
      description: "Сохраняйте каждую чайную сессию с фотографиями, заметками и геометками. Создавайте личную историю чайных открытий и делитесь красотой этих моментов."
    }
  ];

  const steps = [
    {
      icon: "🗺️",
      title: "Найдите спокойствие",
      description: "Исследуйте интерактивную карту тихих мест, где другие любители чая уже проводили свои сессии вдали от городского шума"
    },
    {
      icon: "☕",
      title: "Запишите сессию",
      description: "Создайте запись о своей чайной сессии с фотографиями, описанием вкуса, настроения и мыслей от процесса"
    },
    {
      icon: "💬",
      title: "Поделитесь и общайтесь",
      description: "Делитесь впечатлениями с сообществом, ставьте лайки, комментируйте сессии других и находите единомышленников"
    }
  ];

  const testimonials = [
    {
      name: "Анна К.",
      location: "Москва",
      text: "Нашла тихий парк рядом с домом, где теперь провожу утренние чайные сессии. Делюсь фотографиями и получаю вдохновение от других участников!",
      rating: 5
    },
    {
      name: "Дмитрий М.",
      location: "Санкт-Петербург",
      text: "Записываю свои чайные сессии и читаю заметки других. Это как социальная сеть для любителей чая - делишься мыслями и находишь единомышленников.",
      rating: 5
    },
    {
      name: "Екатерина В.",
      location: "Екатеринбург",
      text: "Обожаю функцию фотозагрузки и возможность ставить лайки на сессии других. Чувствую себя частью большого сообщества любителей чая.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Как работает создание чайной сессии?",
      answer: "Выберите место на карте, добавьте фотографии, опишите вкус чая, своё настроение и мысли. Ваша сессия станет частью ленты активности, где другие могут её лайкать и комментировать."
    },
    {
      question: "Бесплатно ли использование Tea Map?",
      answer: "Да! Все основные функции полностью бесплатны - поиск мест, создание сессий, фотозагрузка, общение с сообществом и просмотр статистики."
    },
    {
      question: "Как найти тихие места рядом со мной?",
      answer: "Используйте интерактивную карту для поиска мест, где другие проводили чайные сессии. Вы можете искать по названию или просто исследовать карту в вашем районе."
    },
    {
      question: "Могу ли я общаться с другими любителями чая?",
      answer: "Конечно! Ставьте лайки на сессии, оставляйте комментарии, изучайте профили других пользователей и находите единомышленников через общие интересы к чаю."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navigateToApp = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tea-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-tea-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <ForestTeaLogo size={40} />
              <span className="text-xl font-bold text-forest-800">Tea Map</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('discover')}
                className="text-forest-600 hover:text-tea-600 transition-colors"
              >
                Открыть
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-forest-600 hover:text-tea-600 transition-colors"
              >
                Как это работает
              </button>
              <button 
                onClick={() => scrollToSection('community')}
                className="text-forest-600 hover:text-tea-600 transition-colors"
              >
                Сообщество
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-forest-600 hover:text-tea-600 transition-colors"
              >
                Контакты
              </button>
              <Button 
                onClick={navigateToApp}
                className="bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90 transition-opacity"
              >
                Начать исследование
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <span className="text-2xl">✕</span> : <span className="text-2xl">☰</span>}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-tea-100"
            >
              <div className="px-4 py-2 space-y-2">
                <button 
                  onClick={() => scrollToSection('discover')}
                  className="block w-full text-left px-3 py-2 text-forest-600 hover:text-tea-600 hover:bg-tea-50 rounded-lg transition-colors"
                >
                  Открыть
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="block w-full text-left px-3 py-2 text-forest-600 hover:text-tea-600 hover:bg-tea-50 rounded-lg transition-colors"
                >
                  Как это работает
                </button>
                <button 
                  onClick={() => scrollToSection('community')}
                  className="block w-full text-left px-3 py-2 text-forest-600 hover:text-tea-600 hover:bg-tea-50 rounded-lg transition-colors"
                >
                  Сообщество
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left px-3 py-2 text-forest-600 hover:text-tea-600 hover:bg-tea-50 rounded-lg transition-colors"
                >
                  Контакты
                </button>
                <Button 
                  onClick={navigateToApp}
                  className="w-full bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90 transition-opacity mt-2"
                >
                  Начать исследование
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-tea-100 text-tea-800 hover:bg-tea-200">
                🍃 Находите спокойствие • Записывайте сессии • Общайтесь
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-forest-900 mb-6 leading-tight">
                Убегите от городского шума и найдите 
                <span className="text-tea-600 block">своё место для спокойствия</span>
              </h1>
              
              <p className="text-xl text-forest-600 mb-8 leading-relaxed">
                Социальная платформа для любителей чая, где вы можете находить тихие места вдали от суеты, записывать свои чайные сессии, 
                делиться вкусовыми впечатлениями и мыслями с единомышленниками. Превратите каждое чаепитие в осознанный момент связи с природой и сообществом.
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  "Находите тихие места для чайных сессий вдали от городского шума",
                  "Записывайте свои чайные активности с фотографиями и заметками о вкусе",
                  "Делитесь мыслями и впечатлениями с сообществом любителей чая",
                  "Лайкайте и комментируйте сессии других участников",
                  "Следите за статистикой сообщества и популярными местами"
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="flex items-center space-x-3"
                  >
                    <span className="text-tea-600 text-xl">✓</span>
                    <span className="text-forest-700">{item}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={navigateToApp}
                  className="bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90 transition-opacity px-8 py-4 text-lg shadow-lg hover:shadow-xl"
                >
                  Найти своё место для спокойствия
                  <span className="ml-2">→</span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-tea-600 text-tea-600 hover:bg-tea-50 px-8 py-4 text-lg"
                  onClick={() => scrollToSection('community')}
                >
                  Присоединиться к сообществу
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <InteractiveMapPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Current Pain Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-50 to-orange-50" id="pain-points">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-forest-900 mb-4">
            Ищете убежище от городского шума?
          </h2>
          <p className="text-xl text-forest-600 mb-12 max-w-3xl mx-auto">
            Современная жизнь полна стресса и суеты. Многие любители чая сталкиваются с этими проблемами, пытаясь найти моменты покоя и общения с единомышленниками.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {painPoints.map((pain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-red-100">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{pain.icon}</div>
                    <h3 className="text-xl font-semibold text-forest-900 mb-3">
                      {pain.title}
                    </h3>
                    <p className="text-forest-600 leading-relaxed">
                      {pain.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Desired Outcome Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-tea-50 to-sage-50" id="discover">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-900 mb-4">
              Tea Map решает эти проблемы
            </h2>
            <p className="text-xl text-forest-600 max-w-3xl mx-auto">
              Что если бы вы могли легко находить тихие места для чайных сессий, записывать свои впечатления и делиться ими с сообществом единомышленников? 
              Tea Map делает это возможным.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {outcomes.map((outcome, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow bg-white/20 backdrop-blur-lg border-tea-200">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-tea-500 to-sage-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <span className="text-white text-xl">{outcome.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-forest-900 mb-3">
                      {outcome.title}
                    </h3>
                    <p className="text-forest-600 leading-relaxed">
                      {outcome.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Introduction */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-tea-100 text-tea-800 hover:bg-tea-200">
              Представляем Tea Map
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-forest-900 mb-4">
              Социальная платформа для любителей чая - находите тихие места, записывайте сессии, делитесь впечатлениями с сообществом.
            </h2>
          </div>
          
          {/* 3-Step Process */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-tea-500 to-sage-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">{step.icon}</span>
                </div>
                <h3 className="text-2xl font-semibold text-forest-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-forest-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Founder Message */}
          <Card className="bg-white/20 backdrop-blur-lg border-tea-200 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-tea-400 to-tea-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  TM
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-forest-900 mb-3">
                    От создателя
                  </h3>
                  <p className="text-forest-600 leading-relaxed mb-4">
                    "Городская суета часто мешала мне наслаждаться чайными сессиями. Я хотел найти тихие места и поделиться этими моментами с другими любителями чая. 
                    Tea Map объединяет людей через общую любовь к чаю и помогает находить спокойствие в нашем шумном мире."
                  </p>
                  <p className="text-tea-600 font-medium">
                    — Михаил, Создатель Tea Map
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Final CTA */}
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={navigateToApp}
              className="bg-gradient-to-r from-tea-500 to-sage-600 text-white hover:opacity-90 transition-opacity px-12 py-4 text-xl shadow-lg hover:shadow-xl"
            >
              Найти своё убежище от городского шума
              <span className="ml-2">→</span>
            </Button>
            <p className="text-forest-600 mt-4">
              Присоединяйтесь к растущему сообществу любителей чая, уже делящихся своими тихими местами и сессиями
            </p>
          </div>
        </div>
      </section>

      {/* Community/Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-tea-50 to-amber-50" id="community">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-900 mb-4">
              Отзывы нашего сообщества
            </h2>
            <p className="text-xl text-forest-600">
              Посмотрите, что участники говорят о своём опыте с Tea Map
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/20 backdrop-blur-lg border-tea-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-xl">★</span>
                    ))}
                  </div>
                  <blockquote className="text-xl text-forest-700 mb-6 italic">
                    "{testimonials[activeTestimonial].text}"
                  </blockquote>
                  <div>
                    <p className="font-semibold text-forest-900">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-forest-600">
                      {testimonials[activeTestimonial].location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-tea-600' : 'bg-forest-300'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
          
          {/* Community Stats */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/30 backdrop-blur-sm border-tea-200 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-tea-600 mb-2">500+</div>
                <p className="text-forest-700">Активных пользователей</p>
              </CardContent>
            </Card>
            <Card className="bg-white/30 backdrop-blur-sm border-tea-200 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-tea-600 mb-2">2000+</div>
                <p className="text-forest-700">Записанных чайных сессий</p>
              </CardContent>
            </Card>
            <Card className="bg-white/30 backdrop-blur-sm border-tea-200 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-tea-600 mb-2">150+</div>
                <p className="text-forest-700">Тихих мест на карте</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Email Signup */}
          <div className="mt-12 max-w-2xl mx-auto">
            <EmailSignup 
              title="Получайте уведомления о новых чайных местах в вашем районе"
              buttonText="Уведомить меня"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-900 mb-4">
              Часто задаваемые вопросы
            </h2>
            <p className="text-xl text-forest-600">
              Всё, что вам нужно знать о Tea Map
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-forest-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-forest-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-tea-50 to-sage-50" id="contact">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-900 mb-4">
              Связаться с нами
            </h2>
            <p className="text-xl text-forest-600">
              Есть вопросы или хотите стать партнёром? Мы будем рады услышать от вас.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-forest-900 mb-6">
                Контактная информация
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-tea-600 text-xl">📧</span>
                  <span className="text-forest-700">hello@foresttea.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-tea-600 text-xl">💬</span>
                  <span className="text-forest-700">Онлайн-чат доступен с 9:00 до 17:00 по МСК</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-tea-600 text-xl">📞</span>
                  <span className="text-forest-700">+7 (555) 123-4567</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-forest-900 mb-4">
                  Сообщество и партнёрство
                </h4>
                <p className="text-forest-600 mb-4">
                  Присоединяйтесь к нашему растущему сообществу:
                </p>
                <ul className="space-y-2 text-forest-600">
                  <li>• Любители чая и владельцы чайных магазинов</li>
                  <li>• Создатели уютных пространств и кафе</li>
                  <li>• Организаторы чайных мероприятий и встреч</li>
                  <li>• Блогеры и влиятели в сфере осознанности</li>
                </ul>
              </div>
            </div>
            
            <Card className="bg-white/20 backdrop-blur-lg border-tea-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-forest-900 mb-6">
                  Отправьте нам сообщение
                </h3>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <ForestTeaLogo size={32} />
                <span className="text-xl font-bold">Tea Map</span>
              </div>
              <p className="text-forest-200 leading-relaxed">
                Находите тихие места вдали от городского шума, записывайте чайные сессии и делитесь впечатлениями с сообществом любителей чая.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Платформа</h4>
              <ul className="space-y-2 text-forest-200">
                <li><button onClick={navigateToApp} className="hover:text-white transition-colors">Открыть места</button></li>
                <li><button onClick={navigateToApp} className="hover:text-white transition-colors">Добавить место</button></li>
                <li><button onClick={() => scrollToSection('community')} className="hover:text-white transition-colors">Сообщество</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Мобильное приложение</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Ресурсы</h4>
              <ul className="space-y-2 text-forest-200">
                <li><a href="#" className="hover:text-white transition-colors">Гид по чайной церемонии</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Рекомендации по местам</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Советы по безопасности</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Блог</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-forest-200">
                <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Условия использования</a></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Контакты</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-forest-800 mt-8 pt-8 text-center text-forest-200">
            <p>&copy; 2025 Tea Map. Все права защищены. Создано с 🍃 для сообщества любителей чая.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-tea-500 to-sage-600 rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity z-40"
      >
        <span className="text-xl transform rotate-180">⌄</span>
      </button>
    </div>
  );
};

export default LandingPage;