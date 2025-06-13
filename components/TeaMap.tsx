'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
const teaIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/194/194933.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
import 'leaflet/dist/leaflet.css';

export default function TeaMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current).setView([14.0583, 108.2772], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup('Вы здесь 🧘‍♂️')
          .openPopup();
      });
    }

    const spots = [
      {
        name: 'Сосновый склон',
        description: 'Чай с видом на горы и хвойный аромат.',
        coords: [14.0583, 108.2772],
      },
      {
        name: 'Озёрная поляна',
        description: 'Идеально для улунов на закате.',
        coords: [30.1, 108.3],
      },
    ];

    spots.forEach((spot) => {
      L.marker(spot.coords, { icon: teaIcon })
        .addTo(map)
        .bindPopup(`<b>${spot.name}</b><br>${spot.description}`);
    });

    return () => map.remove();
  }, []);

  return <div id="map" ref={mapRef} style={{ height: '100vh' }} />;
}

