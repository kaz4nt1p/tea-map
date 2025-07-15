import { motion, AnimatePresence } from 'framer-motion';
import { Spot } from '../lib/spots';
import { ActivityList } from './ActivityList';
import { useState } from 'react';

export default function SpotModal({
  spot,
  onClose,
  onRecordActivity,
}: {
  spot: Spot | null;
  onClose: () => void;
  onRecordActivity?: (spot: Spot) => void;
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'activities'>('info');
  return (
    <AnimatePresence>
      {spot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative">
              {spot.image && (
                <div className="relative h-48 md:h-64 bg-tea-100 rounded-t-2xl overflow-hidden">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Закрыть модальное окно"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-tea-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">🍃</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-tea-800 mb-1">
                    {spot.name}
                  </h2>
                  {spot.description && (
                    <p className="text-tea-600 text-sm">
                      {spot.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Информация
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'activities'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Чайные сессии
                </button>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'info' ? (
                <div>
                  {spot.longDescription && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-tea-700 mb-2">Подробности</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {spot.longDescription}
                      </p>
                    </div>
                  )}
                  
                  {/* Coordinates */}
                  <div className="bg-tea-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-tea-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    {onRecordActivity && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onRecordActivity(spot)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        🍵 Записать сессию здесь
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigator.clipboard.writeText(`${spot.lat}, ${spot.lng}`);
                        // Could add a toast notification here
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      title="Скопировать координаты"
                    >
                      📍
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <ActivityList
                    endpoint={`/api/activities/spot/${spot.id}`}
                    emptyMessage="Пока нет чайных сессий в этом споте"
                    showPagination={false}
                    limit={10}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
