'use client';
// Обязательно 'use client'; — иначе Next попытается серверно импортировать Leaflet

import 'leaflet/dist/leaflet.css';

import { useEffect, useRef, useState } from 'react';
import { Spot } from '../lib/spots';

type ClientMapProps = {
  spots: Spot[];
  onMarkerClick: (spot: Spot) => void;
  onMapClick: (lat: number, lng: number) => void;
};

function Header({ onRandom }: { onRandom: () => void }) {
  return (
    <header
      style={{
        width: '100vw',
        height: 72,
        minHeight: 56,
        background: 'linear-gradient(90deg, #388e3c 0%, #66bb6a 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '0.04em',
        boxShadow: '0 2px 16px 0 rgba(56,142,60,0.08)',
        padding: '0 3vw',
        position: 'relative',
        zIndex: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'absolute', left: 32 }}>
        <img src="https://openmoji.org/data/color/svg/1F375.svg" alt="tea" style={{ width: 40, height: 40 }} />
        <span style={{ fontWeight: 800, fontSize: '2.1rem', letterSpacing: '0.08em' }}>Tea Spot</span>
      </span>
      <button
        type="button"
        onClick={onRandom}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(90deg, #43cea2 0%, #388e3c 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 16px 0 rgba(56,142,60,0.10)',
          transition: 'background 0.2s, transform 0.2s',
          outline: 'none',
          zIndex: 30,
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.97)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
      >
        Найти лучший спот
      </button>
    </header>
  );
}

function SpotList({ spots, onMarkerClick }: { spots: Spot[]; onMarkerClick: (spot: Spot) => void }) {
  return (
    <aside
      style={{
        width: '28vw',
        minWidth: 320,
        maxWidth: 420,
        height: '100%',
        background: 'rgba(255,255,255,0.92)',
        borderRight: '2px solid #388e3c',
        boxShadow: '8px 0 32px -12px #388e3c',
        borderBottomLeftRadius: 24,
        borderTopLeftRadius: 24,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        position: 'relative',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        className="tea-spot-list"
        style={{
          flex: 1,
          overflowY: 'auto',
          borderBottomLeftRadius: 24,
          borderTopLeftRadius: 24,
          background: 'transparent',
          padding: '1.2em 0.5em',
          gap: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {spots.map((spot, idx) => (
          <div
            key={idx}
            style={{
              minHeight: 90,
              margin: '0.5em 0',
              background: 'linear-gradient(90deg, #e0f7e9 0%, #eafaf1 100%)',
              borderRadius: 18,
              boxShadow: '0 2px 12px 0 rgba(56,142,60,0.07)',
              display: 'flex',
              alignItems: 'center',
              padding: '1em 1.2em',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, background 0.2s, transform 0.15s',
              border: '1.5px solid #d0e6d4',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => onMarkerClick(spot)}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px 0 #43cea2';
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.025)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px 0 rgba(56,142,60,0.07)';
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
            }}
          >
            <img src="https://openmoji.org/data/color/svg/1F33F.svg" alt="spot" style={{ width: 36, height: 36, marginRight: 18 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#205c2c', fontSize: '1.1em', marginBottom: 2 }}>
                {spot.name || `Спот #${idx + 1}`}
              </div>
              <div style={{ fontSize: '0.97em', color: '#2e7d32', marginBottom: 2 }}>
                {spot.description || ''}
              </div>
              {/* координаты убраны */}
            </div>
          </div>
        ))}
      </div>
      <style>
        {`
          .tea-spot-list::-webkit-scrollbar {
            width: 8px;
            background: #eafafc;
            border-radius: 8px;
          }
          .tea-spot-list::-webkit-scrollbar-thumb {
            background: #d0e6d4;
            border-radius: 8px;
          }
        `}
      </style>
    </aside>
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
        iconUrl: 'https://openmoji.org/data/color/svg/1F33F.svg',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
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
        iconUrl: 'https://openmoji.org/data/color/svg/1F33F.svg',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
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
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      }}
    >
      <Header onRandom={handleRandomSpot} />
      <div
        style={{
          display: 'flex',
          width: '100vw',
          height: 'calc(100vh - 72px)',
          background: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            background: 'none',
            borderRadius: 24,
            boxShadow: '0 2px 12px 0 rgba(56,142,60,0.06)',
            margin: '2vh 0 2vh 2vw',
            overflow: 'hidden',
          }}
        >
          <SpotList spots={spots} onMarkerClick={handleSpotListClick} />
        </div>
        <div
          ref={mapContainerRef}
          style={{
            width: '72vw',
            minWidth: 320,
            height: '100%',
            background: 'none',
            borderRadius: 24,
            boxShadow: '0 4px 24px 0 rgba(30,60,114,0.10) inset',
            margin: '2vh 2vw 2vh 1vw',
            overflow: 'hidden',
            border: '2px solid #2a5298',
            position: 'relative',
          }}
        />
      </div>
      <style>{`.leaflet-control-attribution { display: none !important; }`}</style>
    </div>
  );
}
