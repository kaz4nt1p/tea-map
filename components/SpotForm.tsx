import { useState } from 'react';
import { motion } from 'framer-motion';
import { Spot } from '../lib/spots';
import SpotImageUploader from './SpotImageUploader';

interface SpotFormProps {
  lat: number;
  lng: number;
  onSubmit: (spot: Omit<Spot, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function SpotForm({ lat, lng, onSubmit, onCancel }: SpotFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [image, setImage] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      return; // Prevent submission while uploading
    }
    onSubmit({ name, description, longDescription, image, lat, lng });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl w-full mx-auto shadow-xl border border-tea-200 flex flex-col"
      style={{ 
        maxHeight: 'inherit',
        height: 'fit-content'
      }}
    >
      <div className="overflow-y-auto flex-1 p-4 sm:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="text-2xl sm:text-3xl mb-2">🍃</div>
        <h2 className="text-lg sm:text-xl font-bold text-tea-800">Добавить новый спот</h2>
        <p className="text-xs sm:text-sm text-tea-600 mt-1">Поделитесь своим любимым местом для чая</p>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <SpotImageUploader
            onUpload={(url, thumbnailUrl) => {
              setImage(url);
              setThumbnail(thumbnailUrl || url);
            }}
            onUploadStateChange={setIsUploading}
          />
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <div className="relative rounded-xl overflow-hidden border-2 border-tea-300 bg-gradient-to-br from-tea-50 to-tea-100 p-2">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={thumbnail || image}
                    alt="preview"
                    className="w-full max-h-40 sm:max-h-48 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setImage('');
                    setThumbnail('');
                  }}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-tea-700 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                  aria-label="Remove photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-tea-700 mb-1">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Например: Уютное кафе у парка"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm sm:text-base border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-tea-700 mb-1">
            Краткое описание
          </label>
          <input
            id="description"
            type="text"
            placeholder="Что особенного в этом месте?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400"
          />
        </div>
        
        <div>
          <label htmlFor="longDescription" className="block text-xs sm:text-sm font-medium text-tea-700 mb-1">
            Подробное описание
          </label>
          <textarea
            id="longDescription"
            placeholder="Расскажите больше о месте, атмосфере, любимых напитках..."
            value={longDescription}
            onChange={e => setLongDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm sm:text-base border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400 resize-vertical"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-tea-600 hover:bg-tea-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-tea-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={!name.trim() || isUploading}
          >
            {isUploading ? '⏳ Загрузка фото...' : '✨ Добавить спот'}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base"
          >
            Отмена
          </motion.button>
        </div>
      </form>
      </div>
    </motion.div>
  );
}
