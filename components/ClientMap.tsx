'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Spot } from '../lib/spots';
import { createSimpleTeaMarkerDataURL } from './TeaMarkerIcon';

type ClientMapProps = {
  spots: Spot[];
  onMarkerClick: (spot: Spot) => void;
  onMapClick: (lat: number, lng: number) => void;
  isCreatingSpot?: boolean;
};


function SpotList({ spots, onMarkerClick, onRandom }: { spots: Spot[]; onMarkerClick: (spot: Spot) => void; onRandom: () => void }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full md:w-96 lg:w-[28vw] max-w-md h-full bg-white/95 backdrop-blur-sm border-r-2 border-tea-500 shadow-xl rounded-l-2xl md:rounded-l-3xl overflow-hidden flex flex-col z-10 relative"
    >
      
      <div className="tea-spot-list flex-1 overflow-y-auto p-3 space-y-3">
        {/* Random spot button at top of list */}
        <motion.button
          type="button"
          onClick={onRandom}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-gradient-to-r from-tea-500 to-sage-600 text-white border-none rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer shadow-sm hover:shadow-md active:shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 backdrop-blur-sm hover:from-tea-600 hover:to-sage-700 group"
          aria-label="Найти случайный чайный спот"
        >
          <span className="flex items-center justify-center gap-2">
            <span>Найти лучший спот</span>
            <span className="text-amber-200 group-hover:text-amber-100 transition-colors">🌿</span>
          </span>
        </motion.button>
        <AnimatePresence>
          {spots.map((spot, idx) => (
            <motion.div
              key={spot.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="min-h-[90px] bg-gradient-to-r from-tea-50 to-tea-100 rounded-2xl shadow-sm hover:shadow-md border border-tea-200 flex items-center p-4 cursor-pointer transition-all duration-200 group"
              onClick={() => onMarkerClick(spot)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMarkerClick(spot);
                }
              }}
              aria-label={`Перейти к споту ${spot.name || `#${idx + 1}`}`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-tea-200 rounded-full flex items-center justify-center group-hover:bg-tea-300 transition-colors">
                <span className="text-lg">🍃</span>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <h3 className="font-bold text-tea-800 text-base truncate mb-1">
                  {spot.name || `Спот #${idx + 1}`}
                </h3>
                {spot.description && (
                  <p className="text-sm text-tea-600 line-clamp-2 leading-relaxed">
                    {spot.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 ml-2 text-tea-400 group-hover:text-tea-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {spots.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-tea-500"
          >
            <div className="text-4xl mb-4">🍃</div>
            <p className="text-lg font-medium mb-2">Пока нет спотов</p>
            <p className="text-sm text-tea-400">Кликните на карту, чтобы добавить первый спот</p>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}

const DEFAULT_CENTER = { lat: 55.751244, lng: 37.618423 }; // Москва, например

export default function ClientMap({
  spots,
  onMarkerClick,
  onMapClick,
  isCreatingSpot = false,
}: ClientMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [pendingSpot, setPendingSpot] = useState<Spot | null>(null);
  const [center, setCenter] = useState<[number, number]>([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]);
  const [shouldCenter, setShouldCenter] = useState(false);

  // Исправление работы handleRandomSpot
  function handleRandomSpot() {
    if (spots.length === 0) return;
    const idx = Math.floor(Math.random() * spots.length);
    setCenter([spots[idx].lat, spots[idx].lng]);
    setShouldCenter(true);
    setPendingSpot(spots[idx]);
  }

  // Инициализация карты только один раз
  useEffect(() => {
    let leaflet: typeof import('leaflet');
    let teaIcon: any;
    (async () => {
      leaflet = await import('leaflet');
      teaIcon = leaflet.icon({
        iconUrl: createSimpleTeaMarkerDataURL(48),
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24],
      });
      const initialCenter: [number, number] = [55.7522, 37.6156];
      const initialZoom = 13;
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = leaflet.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
        });
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);
        // УБРАН обработчик клика отсюда!
      }
    })();
    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // onMapClick не нужен тут

  // Центрировать карту по клику на карту (добавление спота)
  useEffect(() => {
    if (!onMapClick) return;
    if (!mapRef.current) return;
    mapRef.current.off('click');
    mapRef.current.on('click', (e: any) => {
      mapRef.current.setView([e.latlng.lat, e.latlng.lng], mapRef.current.getZoom(), { animate: true });
      setCenter([e.latlng.lat, e.latlng.lng]);
      setShouldCenter(false);
      onMapClick(e.latlng.lat, e.latlng.lng);
    });
  }, [onMapClick, mapRef.current]);

  // Центрировать карту при первом рендере
  useEffect(() => {
    setCenter([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]);
    setShouldCenter(true);
  }, []);

  // Центрировать карту по клику на спот из списка
  const handleSpotListClick = (spot: Spot) => {
    setCenter([spot.lat, spot.lng]);
    setShouldCenter(true);
    setPendingSpot(spot); // для открытия модалки после анимации
  }

  // Центрирование карты, если нужно
  useEffect(() => {
    if (shouldCenter && mapRef.current) {
      mapRef.current.setView(center, mapRef.current.getZoom(), { animate: true });
      setShouldCenter(false);
    }
  }, [center, shouldCenter]);

  // Открытие модалки после анимации (только для клика по списку)
  useEffect(() => {
    if (pendingSpot && mapRef.current) {
      const handleMoveEnd = () => {
        onMarkerClick(pendingSpot);
        setPendingSpot(null);
        mapRef.current.off('moveend', handleMoveEnd);
      };
      mapRef.current.on('moveend', handleMoveEnd);
    }
  }, [pendingSpot, onMarkerClick]);

  // --- Исправление: всегда добавлять маркеры с иконкой ---
  useEffect(() => {
    let leaflet: typeof import('leaflet');
    let teaIcon: any;
    (async () => {
      leaflet = await import('leaflet');
      teaIcon = leaflet.icon({
        iconUrl: createSimpleTeaMarkerDataURL(48),
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24],
      });
      if (!mapRef.current) return;
      // Удаляем старые маркеры
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      // Добавляем новые маркеры с иконкой
      spots.forEach((spot) => {
        const marker = leaflet.marker([spot.lat, spot.lng], { icon: teaIcon }).addTo(mapRef.current);
        marker.on('click', () => {
          setCenter([spot.lat, spot.lng]);
          setShouldCenter(true);
          setPendingSpot(spot);
        });
        markersRef.current.push(marker);
      });
    })();
  }, [spots]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-tea-50 to-tea-100 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 overflow-hidden">
        {/* Mobile: Collapsible spot list */}
        <div className="md:hidden">
          <details className="group">
            <summary className="flex items-center justify-between p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm cursor-pointer hover:bg-tea-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍃</span>
                <span className="font-semibold text-tea-800">Споты ({spots.length})</span>
              </div>
              <svg className="w-5 h-5 text-tea-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto pb-2">
              <SpotList spots={spots} onMarkerClick={handleSpotListClick} onRandom={handleRandomSpot} />
            </div>
          </details>
        </div>
        
        {/* Desktop: Always visible spot list */}
        <div className="hidden md:flex h-full">
          <SpotList spots={spots} onMarkerClick={handleSpotListClick} onRandom={handleRandomSpot} />
        </div>
        
        {/* Map container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex-1 relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg border-2 border-tea-300 min-h-0"
        >
          <div
            ref={mapContainerRef}
            className="w-full h-full bg-tea-100 relative z-0"
            role="application"
            aria-label="Интерактивная карта чайных спотов"
            style={{ minHeight: '400px' }}
          />
          
          {/* Welcome notification */}
          {spots.length === 0 && !isCreatingSpot && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="absolute top-4 right-4 z-20 pointer-events-none"
            >
              <div className="bg-white/95 backdrop-blur-sm border border-tea-200 rounded-xl shadow-lg px-4 py-3 max-w-xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <h3 className="text-sm font-semibold text-tea-800">Добро пожаловать!</h3>
                    <p className="text-xs text-tea-600 leading-relaxed">
                      Кликните на карту, чтобы добавить первый спот
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      <style>{`.leaflet-control-attribution { display: none !important; }`}</style>
    </div>
  );
}
