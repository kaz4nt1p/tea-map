'use client';

import React, { useState } from 'react';
import { CreateActivityRequest, Spot, TEA_TYPES, MOOD_TYPES } from '../lib/types';
import { Spot as LegacySpot } from '../lib/spots';
import { SpotSelector } from './SpotSelector';
import SpotImageUploader from './SpotImageUploader';
import { X, Clock, Thermometer, Timer, Users, Cloud, Leaf, MessageSquare } from 'lucide-react';

interface ActivityFormProps {
  onSubmit: (activity: CreateActivityRequest) => Promise<void>;
  onCancel: () => void;
  initialSpot?: LegacySpot | null;
  isLoading?: boolean;
  initialData?: CreateActivityRequest;
  mode?: 'create' | 'edit';
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  onSubmit,
  onCancel,
  initialSpot = null,
  isLoading = false,
  initialData,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<CreateActivityRequest>(initialData || {
    title: '',
    description: '',
    tea_type: '',
    tea_name: '',
    tea_details: {},
    mood_before: '',
    mood_after: '',
    taste_notes: '',
    insights: '',
    duration_minutes: undefined,
    weather_conditions: '',
    companions: [],
    privacy_level: 'public',
    spot_id: initialSpot?.id
  });

  // Convert legacy spot to new spot format if provided
  const convertedInitialSpot: Spot | null = initialSpot ? {
    id: initialSpot.id,
    creator_id: '', // Will be set when fetching from API
    name: initialSpot.name,
    description: initialSpot.description,
    long_description: initialSpot.longDescription,
    latitude: initialSpot.lat,
    longitude: initialSpot.lng,
    address: '',
    image_url: initialSpot.image,
    created_at: initialSpot.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : null;

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(convertedInitialSpot);
  const [showSpotForm, setShowSpotForm] = useState(false);
  const [companionInput, setCompanionInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }
    
    if (!formData.tea_type) {
      newErrors.tea_type = 'Выберите тип чая';
    }
    
    if (formData.duration_minutes && formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Продолжительность должна быть больше 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const activityData = {
      ...formData,
      spot_id: selectedSpot?.id,
    };
    
    await onSubmit(activityData);
  };

  const handleInputChange = (field: keyof CreateActivityRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTeaDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      tea_details: {
        ...prev.tea_details,
        [field]: value
      }
    }));
  };

  const handleAddCompanion = () => {
    if (companionInput.trim() && !formData.companions?.includes(companionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        companions: [...(prev.companions || []), companionInput.trim()]
      }));
      setCompanionInput('');
    }
  };

  const handleRemoveCompanion = (companion: string) => {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions?.filter(c => c !== companion) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать сессию' : 'Записать чайную сессию'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название сессии *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Например: Утренняя сенча в саду"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Tea Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип чая *
            </label>
            <select
              value={formData.tea_type}
              onChange={(e) => handleInputChange('tea_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Выберите тип чая</option>
              {TEA_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.tea_type && (
              <p className="mt-1 text-sm text-red-600">{errors.tea_type}</p>
            )}
          </div>

          {/* Tea Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название чая
            </label>
            <input
              type="text"
              value={formData.tea_name || ''}
              onChange={(e) => handleInputChange('tea_name', e.target.value)}
              placeholder="Например: Лунцзин, Эрл Грей, Да Хун Пао..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Spot Selection */}
          <SpotSelector
            selectedSpot={selectedSpot}
            onSpotSelect={setSelectedSpot}
            onCreateSpot={() => setShowSpotForm(true)}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание сессии
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Опишите вашу чайную сессию..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Duration and Tea Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 mr-1" />
                Продолжительность (минуты)
              </label>
              <input
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => handleInputChange('duration_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.duration_minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 mr-1" />
                Температура воды (°C)
              </label>
              <input
                type="number"
                value={formData.tea_details?.brewing_temperature || ''}
                onChange={(e) => handleTeaDetailsChange('brewing_temperature', e.target.value ? parseInt(e.target.value) : undefined)}
                min="50"
                max="100"
                placeholder="80"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Настроение до
              </label>
              <select
                value={formData.mood_before}
                onChange={(e) => handleInputChange('mood_before', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Выберите настроение</option>
                {MOOD_TYPES.map(mood => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Настроение после
              </label>
              <select
                value={formData.mood_after}
                onChange={(e) => handleInputChange('mood_after', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Выберите настроение</option>
                {MOOD_TYPES.map(mood => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Taste Notes */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Leaf className="w-4 h-4 mr-1" />
              Заметки о вкусе
            </label>
            <textarea
              value={formData.taste_notes}
              onChange={(e) => handleInputChange('taste_notes', e.target.value)}
              rows={2}
              placeholder="Сладкий, цветочный, с нотками жасмина..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Insights */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 mr-1" />
              Размышления и инсайты
            </label>
            <textarea
              value={formData.insights}
              onChange={(e) => handleInputChange('insights', e.target.value)}
              rows={2}
              placeholder="Что вы почувствовали? Какие мысли возникли?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Weather and Companions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Cloud className="w-4 h-4 mr-1" />
                Погода
              </label>
              <input
                type="text"
                value={formData.weather_conditions}
                onChange={(e) => handleInputChange('weather_conditions', e.target.value)}
                placeholder="Солнечно, прохладно"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 mr-1" />
                Компаньоны
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={companionInput}
                  onChange={(e) => setCompanionInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddCompanion)}
                  placeholder="Добавить компаньона"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddCompanion}
                  className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors"
                >
                  +
                </button>
              </div>
              {formData.companions && formData.companions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.companions.map((companion, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {companion}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompanion(companion)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Приватность
            </label>
            <select
              value={formData.privacy_level}
              onChange={(e) => handleInputChange('privacy_level', e.target.value as 'public' | 'friends' | 'private')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="public">Публичная</option>
              <option value="friends">Только друзья</option>
              <option value="private">Приватная</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : (mode === 'edit' ? 'Сохранить изменения' : 'Записать сессию')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;