'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Spot } from '../lib/spots';
import ForestTeaLogo from './ForestTeaLogo';
import { useRouter } from 'next/navigation';
import { createTeaMarkerDataURL, createTeaEmojiMarkerDataURL, createSimpleTeaMarkerDataURL } from './TeaMarkerIcon';
import UserMenu from './auth/UserMenu';

type ClientMapProps = {
  spots: Spot[];
  onMarkerClick: (spot: Spot) => void;
  onMapClick: (lat: number, lng: number) => void;
};

function Header({ onRandom }: { onRandom: () => void }) {
  const router = useRouter();
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full h-18 md:h-24 relative z-[100] overflow-hidden"
    >
      {/* Glass-morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-100/90 via-tea-50/80 to-forest-100/90 backdrop-blur-lg border-b border-white/20 shadow-xl" />
      
      {/* Organic background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-tea-500/10 via-sage-400/5 to-forest-500/10" />
      
      {/* Content */}
      <div className="relative flex items-center h-full px-4 md:px-8">
        {/* Logo and Brand */}
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 md:gap-5 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <ForestTeaLogo className="drop-shadow-sm" size={40} />
          <div className="flex flex-col">
            <span className="font-bold text-xl md:text-3xl tracking-wide text-forest-800 drop-shadow-sm">
              Forest Tea
            </span>
            <span className="text-xs md:text-sm text-sage-600 font-medium tracking-wider">
              Ceremony Spots
            </span>
          </div>
        </motion.div>
        
        {/* Centered Random Spot Button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 max-w-xs">
          <motion.button
            type="button"
            onClick={onRandom}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-tea-500 to-sage-600 text-white border-none rounded-2xl px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold cursor-pointer shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 backdrop-blur-sm hover:from-tea-600 hover:to-sage-700 group whitespace-nowrap"
            aria-label="Найти случайный чайный спот"
          >
            <span className="flex items-center gap-2">
              <span className="hidden md:inline">Найти лучший спот</span>
              <span className="md:hidden">Случайный спот</span>
              <span className="text-amber-200 group-hover:text-amber-100 transition-colors">🌿</span>
            </span>
          </motion.button>
        </div>
        
        {/* Navigation and Actions - Right side */}
        <div className="ml-auto flex items-center gap-3 md:gap-4 relative z-30">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-forest-700 hover:text-forest-900 hover:bg-white/20 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Лента
            </motion.button>
            <motion.button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 text-sm font-medium text-forest-700 hover:text-forest-900 hover:bg-white/20 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Профиль
            </motion.button>
          </div>
          
          <UserMenu />
        </div>
      </div>
      
      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-tea-400/30 to-transparent" />
    </motion.header>
  );
}

function SpotList({ spots, onMarkerClick }: { spots: Spot[]; onMarkerClick: (spot: Spot) => void }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full md:w-96 lg:w-[28vw] max-w-md h-full bg-white/95 backdrop-blur-sm border-r-2 border-tea-500 shadow-xl rounded-l-2xl md:rounded-l-3xl overflow-hidden flex flex-col z-10 relative"
    >
      <div className="p-4 border-b border-tea-200 bg-gradient-to-r from-tea-50 to-tea-100">
        <h2 className="text-lg font-bold text-tea-800 flex items-center gap-2">
          <span className="text-xl">🍃</span>
          Чайные споты
        </h2>
        <p className="text-sm text-tea-600 mt-1">
          {spots.length} {spots.length === 1 ? 'спот' : spots.length < 5 ? 'спота' : 'спотов'} найдено
        </p>
      </div>
      
      <div className="tea-spot-list flex-1 overflow-y-auto p-3 space-y-3">
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
      <Header onRandom={handleRandomSpot} />
      
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
            <div className="mt-2 max-h-64 overflow-hidden">
              <SpotList spots={spots} onMarkerClick={handleSpotListClick} />
            </div>
          </details>
        </div>
        
        {/* Desktop: Always visible spot list */}
        <div className="hidden md:flex h-full">
          <SpotList spots={spots} onMarkerClick={handleSpotListClick} />
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
          
          {/* Map overlay for loading state */}
          {spots.length === 0 && (
            <div className="absolute inset-0 bg-tea-50/80 backdrop-blur-sm flex items-center justify-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-tea-800 mb-2">Добро пожаловать в Tea Spot!</h3>
                <p className="text-tea-600 max-w-md mx-auto leading-relaxed">
                  Кликните на карту, чтобы добавить свой первый чайный спот и начать создавать карту лучших мест для чаепития.
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
      
      <style>{`.leaflet-control-attribution { display: none !important; }`}</style>
    </div>
  );
}
