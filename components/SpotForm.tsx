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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, longDescription, image, lat, lng });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-2xl max-w-md mx-auto shadow-xl border border-tea-200"
    >
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <div className="text-3xl mb-2">🍃</div>
        <h2 className="text-xl font-bold text-tea-800">Добавить новый спот</h2>
        <p className="text-sm text-tea-600 mt-1">Поделитесь своим любимым местом для чая</p>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <SpotImageUploader onUpload={setImage} />
          {image && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <img 
                src={image} 
                alt="preview" 
                className="w-full max-h-44 object-cover rounded-xl border border-tea-200"
              />
            </motion.div>
          )}
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-tea-700 mb-1">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Например: Уютное кафе у парка"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-tea-700 mb-1">
            Краткое описание
          </label>
          <input
            id="description"
            type="text"
            placeholder="Что особенного в этом месте?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400"
          />
        </div>
        
        <div>
          <label htmlFor="longDescription" className="block text-sm font-medium text-tea-700 mb-1">
            Подробное описание
          </label>
          <textarea
            id="longDescription"
            placeholder="Расскажите больше о месте, атмосфере, любимых напитках..."
            value={longDescription}
            onChange={e => setLongDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400 resize-vertical"
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-tea-600 hover:bg-tea-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-tea-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            ✨ Добавить спот
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Отмена
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
