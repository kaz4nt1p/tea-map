'use client';

import { useState, useEffect, useCallback } from 'react';
import ClientMap from '../../components/ClientMap';
import SpotModal from '../../components/SpotModal';
import SpotForm from '../../components/SpotForm';
import UserMenu from '../../components/auth/UserMenu';
import { Spot } from '../../lib/spots';
import { useRequireAuth } from '../../hooks/useAuth';
import { spotsApi, CreateSpotData } from '../../lib/api';
import toast from 'react-hot-toast';
import ForestTeaLogo from '../../components/ForestTeaLogo';

export default function MapPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [spotsLoading, setSpotsLoading] = useState(true);

  // Fetch spots from API
  const fetchSpots = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setSpotsLoading(true);
      const { spots: fetchedSpots } = await spotsApi.getSpots();
      setSpots(fetchedSpots);
    } catch (error) {
      console.error('Failed to fetch spots:', error);
      toast.error('Не удалось загрузить споты');
    } finally {
      setSpotsLoading(false);
    }
  }, [isAuthenticated]);

  // Call fetchSpots on component mount
  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // Handle map click to open form
  const handleMapClick = (lat: number, lng: number) => {
    setFormCoords({ lat, lng });
    setSelectedSpot(null);
  };

  // Handle marker click to open modal
  const handleMarkerClick = (spot: Spot) => {
    setSelectedSpot(spot);
    setFormCoords(null);
  };

  // Handle form submit
  const handleFormSubmit = async (spotData: Omit<Spot, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const createData: CreateSpotData = {
        name: spotData.name,
        description: spotData.description,
        long_description: spotData.longDescription,
        latitude: spotData.lat,
        longitude: spotData.lng,
        address: '', // You can add address field to the form later
        amenities: [],
        accessibility_info: ''
      };
      
      await spotsApi.createSpot(createData);
      await fetchSpots();
      setFormCoords(null);
      setSelectedSpot(null);
      toast.success('Спот успешно добавлен!');
    } catch (error) {
      console.error('Failed to create spot:', error);
      toast.error('Ошибка при добавлении спота');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while authenticating
  if (authLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-tea-50 via-white to-amber-50">
        <div className="text-center">
          <ForestTeaLogo size={60} />
          <div className="mt-4 text-forest-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative">
      {/* Header with user menu */}
      <div className="absolute top-4 right-4 z-10">
        <UserMenu />
      </div>

      {/* Loading overlay for spots */}
      {spotsLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tea-600 mx-auto"></div>
            <div className="mt-2 text-forest-600">Загружаем споты...</div>
          </div>
        </div>
      )}

      <ClientMap
        spots={spots}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
      />
      
      {selectedSpot && (
        <SpotModal spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
      )}
      
      {formCoords && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <SpotForm
            lat={formCoords.lat}
            lng={formCoords.lng}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormCoords(null)}
          />
          {loading && <div className="absolute top-5 right-5 text-gray-700">Сохраняем...</div>}
        </div>
      )}
    </div>
  );
}