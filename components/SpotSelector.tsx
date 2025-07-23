'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spot, ApiResponse } from '../lib/types';
import { Search, MapPin, Plus, Loader2 } from 'lucide-react';
import apiClient from '../lib/api';

interface SpotSelectorProps {
  selectedSpot?: Spot | null;
  onSpotSelect: (spot: Spot | null) => void;
  onCreateSpot?: () => void;
  placeholder?: string;
}

export const SpotSelector: React.FC<SpotSelectorProps> = ({
  selectedSpot,
  onSpotSelect,
  onCreateSpot,
  placeholder = "Выберите спот..."
}) => {
  const router = useRouter();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch spots from API
  const fetchSpots = async (search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/api/spots${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      const data = response.data;
      
      if (data.data) {
        setSpots(data.data.spots);
      }
    } catch (err) {
      console.error('Error fetching spots:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load spots on mount
  useEffect(() => {
    fetchSpots();
  }, []);

  // Search spots with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSpots(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Use spots directly from API (server-side filtering)
  const filteredSpots = spots;

  const handleSpotSelect = (spot: Spot) => {
    onSpotSelect(spot);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSpotSelect(null);
    setSearchTerm('');
  };

  const handleCreateSpot = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Create spot button clicked!');
    setIsOpen(false);
    
    // Navigate to map page for user to select location
    console.log('Navigating to /map for spot creation');
    router.push('/map');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Спот
      </label>
      
      {/* Selected spot display */}
      {selectedSpot && !isOpen ? (
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-green-600 mr-2" />
            <div>
              <div className="font-medium text-gray-900">{selectedSpot.name}</div>
              {selectedSpot.description && (
                <div className="text-sm text-gray-500">{selectedSpot.description}</div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Изменить
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Очистить
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Create new spot button - moved to top of list and made smaller */}
              <button
                type="button"
                onClick={handleCreateSpot}
                className="w-full text-left p-2 border-b border-gray-200 hover:bg-green-50 focus:bg-green-50 focus:outline-none text-green-600 transition-colors text-sm"
                style={{ pointerEvents: 'all' }}
              >
                <div className="flex items-center">
                  <Plus className="w-3 h-3 mr-2" />
                  <span>Создать новый спот</span>
                </div>
              </button>
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="ml-2 text-sm text-gray-600">Загрузка...</span>
                </div>
              )}
              
              {error && (
                <div className="p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              
              {!loading && !error && filteredSpots.length === 0 && (
                <div className="p-3 text-sm text-gray-500">
                  {searchTerm ? 'Споты не найдены' : 'Нет доступных спотов'}
                </div>
              )}
              
              {!loading && !error && filteredSpots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleSpotSelect(spot)}
                  className="w-full text-left p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{spot.name}</div>
                      {spot.description && (
                        <div className="text-sm text-gray-500 truncate">{spot.description}</div>
                      )}
                      {spot.address && (
                        <div className="text-xs text-gray-400">{spot.address}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SpotSelector;