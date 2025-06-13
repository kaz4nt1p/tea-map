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
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ClientMap
        spots={spots}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
      />
      {selectedSpot && (
        <SpotModal spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
      )}
      {formCoords && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <SpotForm
            lat={formCoords.lat}
            lng={formCoords.lng}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormCoords(null)}
          />
          {loading && <div style={{ position: 'absolute', top: 20, right: 20, color: '#333' }}>Сохраняем...</div>}
        </div>
      )}
    </div>
  );
}