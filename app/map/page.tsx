'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientMap from '../../components/ClientMap';
import SpotModal from '../../components/SpotModal';
import SpotForm from '../../components/SpotForm';
import ActivityForm from '../../components/ActivityForm';
import UserMenu from '../../components/auth/UserMenu';
import { Spot } from '../../lib/spots';
import { CreateActivityRequest } from '../../lib/types';
import { tokenManager } from '../../lib/auth';
import { useRequireAuth } from '../../hooks/useAuth';
import { spotsApi, CreateSpotData } from '../../lib/api';
import toast from 'react-hot-toast';

function MapPageContent() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const searchParams = useSearchParams();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activitySpot, setActivitySpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(false);
  const [spotsLoading, setSpotsLoading] = useState(true);

  // Fetch spots from API
  const fetchSpots = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setSpotsLoading(true);
      const { spots: fetchedSpots } = await spotsApi.getSpots();
      
      // Convert backend API data to frontend format
      const convertedSpots = fetchedSpots.map(spot => ({
        id: spot.id,
        name: spot.name,
        description: spot.description,
        longDescription: spot.long_description,
        image: spot.image_url || '',
        lat: spot.latitude,
        lng: spot.longitude,
        created_at: spot.created_at
      }));
      
      setSpots(convertedSpots);
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

  // Handle spot query parameter to auto-open spot modal
  useEffect(() => {
    const spotId = searchParams.get('spot');
    const create = searchParams.get('create');
    
    if (spotId && spots.length > 0) {
      const spot = spots.find(s => s.id === spotId);
      if (spot) {
        setSelectedSpot(spot);
        // Clear the query parameter after opening the modal
        window.history.replaceState({}, '', '/map');
      }
    }
    
    // Handle create parameter - removed auto-opening form
    // Now users must click on the map to select location first
    if (create === 'true') {
      // Clear the query parameter
      window.history.replaceState({}, '', '/map');
    }
  }, [searchParams, spots]);

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
        accessibility_info: '',
        image_url: spotData.image || ''
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

  // Handle activity recording
  const handleRecordActivity = (spot: Spot) => {
    setActivitySpot(spot);
    setSelectedSpot(null);
  };

  // Handle activity form submit
  const handleActivitySubmit = async (activityData: CreateActivityRequest) => {
    if (!isAuthenticated) {
      toast.error('Необходимо войти в систему для создания активности');
      return;
    }
    
    setLoading(true);
    try {
      const token = tokenManager.getAccessToken();
      console.log('Token available:', !!token);
      console.log('Activity data:', activityData);
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Activity creation error:', response.status, errorText);
        throw new Error(`Failed to create activity: ${response.status} - ${errorText}`);
      }

      setActivitySpot(null);
      toast.success('Чайная сессия записана!');
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Ошибка при создании активности');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Map Container */}
      <div className="relative" style={{ height: '100vh' }}>
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
      </div>
      
      {selectedSpot && (
        <SpotModal 
          spot={selectedSpot} 
          onClose={() => setSelectedSpot(null)} 
          onRecordActivity={handleRecordActivity}
        />
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
      
      {activitySpot && (
        <ActivityForm
          initialSpot={activitySpot}
          onSubmit={handleActivitySubmit}
          onCancel={() => setActivitySpot(null)}
          isLoading={loading}
        />
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">Загрузка...</div>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}