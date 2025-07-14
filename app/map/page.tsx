'use client';

import { useState, useEffect, useCallback } from 'react';
import ClientMap from '../../components/ClientMap';
import SpotModal from '../../components/SpotModal';
import SpotForm from '../../components/SpotForm';
import { Spot } from '../../lib/spots';

export default function MapPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch spots from API
  const fetchSpots = useCallback(async () => {
    const res = await fetch('/api/spots');
    const data = await res.json();
    setSpots(Array.isArray(data) ? data : []);
  }, []);

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
  const handleFormSubmit = async (spot: Omit<Spot, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spot),
      });
      if (res.ok) {
        await fetchSpots();
        setFormCoords(null);
        setSelectedSpot(null); // Сброс выбранного спота, чтобы карта не центрировалась
      } else {
        alert('Ошибка при добавлении спота');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen relative">
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