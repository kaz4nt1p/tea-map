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
    <div className="w-full flex flex-col lg:flex-row gap-4 bg-gradient-to-br from-tea-50 to-tea-100 rounded-2xl p-4 shadow-lg border-2 border-tea-200">
      {/* Spot List - similar to actual map */}
      <div className="w-full lg:w-80 space-y-3">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-tea-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍃</span>
            <span className="font-semibold text-tea-800">Споты ({spots.length})</span>
          </div>
          
          {/* Random spot button */}
          <button className="w-full bg-gradient-to-r from-tea-500 to-sage-600 text-white rounded-xl px-4 py-2 text-sm font-semibold mb-3 hover:opacity-90 transition-opacity">
            <span className="flex items-center justify-center gap-2">
              <span>Найти лучший спот</span>
              <span className="text-amber-200">🌿</span>
            </span>
          </button>
          
          {/* Spot list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {spots.map((spot, idx) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-r from-tea-50 to-tea-100 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-md border ${
                  activeSpot === spot.id ? 'border-tea-400 bg-tea-200' : 'border-tea-200'
                }`}
                onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-tea-200 rounded-full flex items-center justify-center">
                    <span className="text-sm">🍃</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-tea-800 text-sm truncate">
                      {spot.name}
                    </h3>
                    <p className="text-xs text-tea-600 truncate">
                      {spot.description}
                    </p>
                  </div>
                  <div className="text-tea-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Preview - more realistic */}
      <div className="flex-1 min-h-[300px] lg:min-h-[400px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-full bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-lg overflow-hidden border-2 border-tea-300"
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                activeSpot === spot.id 
                  ? 'bg-amber-400 text-white ring-4 ring-amber-200 scale-110' 
                  : 'bg-tea-500 text-white hover:bg-tea-600'
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
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium text-forest-800 whitespace-nowrap border border-tea-200 min-w-max"
                  >
                    <div className="font-semibold">{spot.name}</div>
                    <div className="text-tea-600">{spot.description}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Welcome message when no spot selected */}
          {!activeSpot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-tea-200 rounded-xl shadow-lg px-3 py-2 max-w-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <div>
                  <h3 className="text-xs font-semibold text-tea-800">Исследуйте карту</h3>
                  <p className="text-xs text-tea-600">
                    Нажмите на маркеры чая
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}