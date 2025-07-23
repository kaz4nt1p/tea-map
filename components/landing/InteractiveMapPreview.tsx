'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveMapPreview() {
  const [activeSpot, setActiveSpot] = useState<number | null>(null);

  const spots = [
    { id: 1, name: "Утренний спот", x: 65, y: 30, description: "Тихое место для утренних сессий" },
    { id: 2, name: "Вечерняя поляна", x: 40, y: 60, description: "Идеально для вечернего чая" },
    { id: 3, name: "Лесная тишина", x: 20, y: 40, description: "Уединенное место в лесу" },
    { id: 4, name: "Озерный берег", x: 80, y: 70, description: "Спокойствие у воды" }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Map Preview - full width */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[400px] bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-lg overflow-hidden border-2 border-tea-300"
      >
          {/* Map-like background with street pattern */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Street-like grid */}
              <defs>
                <pattern id="streetPattern" patternUnits="userSpaceOnUse" width="40" height="30">
                  <rect width="40" height="30" fill="#e8f5e8"/>
                  <path d="M 0,15 L 40,15 M 20,0 L 20,30" stroke="#d4e6d4" strokeWidth="1" opacity="0.7"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#streetPattern)" />
              
              {/* River/park areas */}
              <ellipse cx="120" cy="80" rx="60" ry="30" fill="#c6f0c6" opacity="0.6"/>
              <ellipse cx="280" cy="180" rx="40" ry="25" fill="#c6f0c6" opacity="0.6"/>
              <ellipse cx="80" cy="220" rx="35" ry="20" fill="#c6f0c6" opacity="0.6"/>
            </svg>
          </div>

          {/* Tea markers - similar to actual map */}
          {spots.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2 + 0.5, duration: 0.4 }}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                activeSpot === spot.id ? 'scale-125 z-10' : 'hover:scale-110'
              }`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)}
            >
              {/* Tea cup icon similar to actual map markers */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                activeSpot === spot.id 
                  ? 'bg-amber-400 text-white ring-4 ring-amber-200/50 scale-110' 
                  : 'bg-tea-500 text-white hover:bg-tea-600 hover:shadow-2xl'
              }`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7,3H17A1,1 0 0,1 18,4V8A6,6 0 0,1 12,14A6,6 0 0,1 6,8V4A1,1 0 0,1 7,3M7,5V8A4,4 0 0,0 11,12H13A4,4 0 0,0 17,8V5H7M5,9V12A8,8 0 0,0 12,20A8,8 0 0,0 19,12V9H21V12A10,10 0 0,1 12,22A10,10 0 0,1 2,12V9H5Z"/>
                </svg>
              </div>
              
              {/* Tooltip */}
              <AnimatePresence>
                {activeSpot === spot.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={`absolute bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-xl text-xs font-medium text-forest-800 border border-tea-200/50 w-32 ${
                      spot.y > 50 ? 'top-12' : 'bottom-12'
                    } ${
                      spot.x > 60 ? 'right-4' : spot.x < 40 ? 'left-4' : 'left-1/2 transform -translate-x-1/2'
                    }`}
                  >
                    <div className="font-bold text-tea-700 mb-1 text-xs truncate">{spot.name}</div>
                    <div className="text-tea-600 text-xs leading-tight">{spot.description}</div>
                    <div className={`absolute w-0 h-0 border-l-3 border-r-3 border-transparent ${
                      spot.y > 50 
                        ? 'bottom-full border-b-3 border-b-white/95' 
                        : 'top-full border-t-3 border-t-white/95'
                    } ${
                      spot.x > 60 ? 'right-4' : spot.x < 40 ? 'left-4' : 'left-1/2 transform -translate-x-1/2'
                    }`}></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Welcome message when no spot selected */}
          {!activeSpot && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm border border-tea-200/50 rounded-xl shadow-xl px-4 py-3 max-w-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🗺️</span>
                <div>
                  <h3 className="text-sm font-bold text-tea-800">Исследуйте карту</h3>
                  <p className="text-xs text-tea-600">
                    Нажмите на маркеры чая
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Caption below map */}
        <div className="mt-4 text-center">
          <p className="text-sm text-sage-600">
            {activeSpot ? `Выбрано: ${spots.find(s => s.id === activeSpot)?.name}` : "Нажмите на маркеры чая для исследования"}
          </p>
        </div>
    </div>
  );
}