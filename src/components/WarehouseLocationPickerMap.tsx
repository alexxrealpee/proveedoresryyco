/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass, Layers, Check, Search } from 'lucide-react';

interface WarehouseLocationPickerMapProps {
  lat: number;
  lng: number;
  address?: string;
  tradeName?: string;
  onChange: (coords: { lat: number; lng: number; address?: string }) => void;
  className?: string;
}

// Zonas comerciales y bodegas de referencia en Ipiales y Nariño
const PRESET_ZONES = [
  { name: 'Zona Industrial Ipiales', lat: 0.8350, lng: -77.6400, address: 'Zona Industrial, Lote 12, Ipiales' },
  { name: 'Centro / Plaza de Mercado', lat: 0.8285, lng: -77.6445, address: 'Carrera 6 #14-20, Centro, Ipiales' },
  { name: 'Vía Panamericana Sur', lat: 0.8210, lng: -77.6520, address: 'Km 2 Vía Panamericana Sur, Ipiales' },
  { name: 'Sector Rumichaca', lat: 0.8130, lng: -77.6620, address: 'Paso Fronterizo Rumichaca, Bodegas Ipiales' },
  { name: 'Parque 20 de Julio', lat: 0.8315, lng: -77.6430, address: 'Calle 10 con Carrera 5, Ipiales' },
];

export const WarehouseLocationPickerMap: React.FC<WarehouseLocationPickerMapProps> = ({
  lat,
  lng,
  address,
  tradeName = 'Bodega del Proveedor',
  onChange,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Fallback si no tiene coordenadas iniciales: Ipiales Centro (0.8305, -77.6462)
  const initialLat = Number(lat) && !isNaN(lat) ? Number(lat) : 0.8305;
  const initialLng = Number(lng) && !isNaN(lng) ? Number(lng) : -77.6462;

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [isLocating, setIsLocating] = useState(false);

  // Crear icono personalizado RYYCO con SVG nítido para evitar problemas de assets 404
  const createPinIcon = () => {
    return L.divIcon({
      className: 'ryyco-map-pin',
      html: `
        <div style="position: relative; transform: translate(-50%, -100%);">
          <div style="
            width: 38px;
            height: 38px;
            background: #E52243;
            border: 3px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(229, 34, 67, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: 900;
              font-size: 11px;
              font-family: sans-serif;
            ">📦</div>
          </div>
          <div style="
            width: 14px;
            height: 4px;
            background: rgba(0,0,0,0.25);
            border-radius: 50%;
            margin: -2px auto 0;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destruir mapa previo si existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Inicializar mapa de Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: 'center',
    });

    // Capa de tiles OpenStreetMap en alta resolución
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Crear marcador arrastrable
    const marker = L.marker([initialLat, initialLng], {
      icon: createPinIcon(),
      draggable: true,
      title: 'Arrastra el marcador para fijar tu bodega',
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
        <strong style="color: #111827; display: block; margin-bottom: 2px;">${tradeName}</strong>
        <span style="color: #6B7280;">Punto de despacho / Bodega</span>
      </div>
    `);

    // Evento al arrastrar el marcador
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const updated = { lat: Number(position.lat.toFixed(6)), lng: Number(position.lng.toFixed(6)) };
      setCurrentCoords(updated);
      onChange(updated);
    });

    // Evento al hacer clic en cualquier punto del mapa
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      const updated = { lat: Number(clickLat.toFixed(6)), lng: Number(clickLng.toFixed(6)) };
      marker.setLatLng([clickLat, clickLng]);
      setCurrentCoords(updated);
      onChange(updated);
      map.panTo([clickLat, clickLng], { animate: true });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Asegurar redimensionamiento correcto
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar marcador si cambian las coordenadas externamente
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      if (lat && lng && (lat !== currentCoords.lat || lng !== currentCoords.lng)) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng], { animate: true });
        setCurrentCoords({ lat, lng });
      }
    }
  }, [lat, lng]);

  // Selección de zona preestablecida
  const handleSelectPreset = (zone: typeof PRESET_ZONES[0]) => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([zone.lat, zone.lng]);
      mapInstanceRef.current.flyTo([zone.lat, zone.lng], 16, { animate: true, duration: 1 });
      setCurrentCoords({ lat: zone.lat, lng: zone.lng });
      onChange({ lat: zone.lat, lng: zone.lng, address: zone.address });
    }
  };

  // Geolocalización del navegador
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([userLat, userLng]);
          mapInstanceRef.current.flyTo([userLat, userLng], 16, { animate: true });
          setCurrentCoords({ lat: userLat, lng: userLng });
          onChange({ lat: userLat, lng: userLng });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('No se pudo obtener la ubicación GPS:', err);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barra de cabecera del mapa con coordenadas y acción GPS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl p-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-[#E52243] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-gray-900 flex items-center gap-1.5">
              <span>Ubicación GPS de la bodega</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] font-mono text-gray-500">
              Lat: <strong className="text-gray-900">{currentCoords.lat.toFixed(5)}</strong>, Lng: <strong className="text-gray-900">{currentCoords.lng.toFixed(5)}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 text-[#E52243] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detectando GPS...' : 'Fijar en mi GPS'}</span>
        </button>
      </div>

      {/* Contenedor del mapa interactivo */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xs z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Píldora de instrucción flotante en el mapa */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 shadow-md flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-[#E52243] shrink-0" />
          <span>Haz clic o arrastra el pin para ubicar tu bodega</span>
        </div>
      </div>

      {/* Botones de acceso rápido a zonas comunes en Ipiales */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
          Puntos de referencia en Ipiales (clic rápido):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ZONES.map((zone) => {
            const isNear =
              Math.abs(zone.lat - currentCoords.lat) < 0.003 &&
              Math.abs(zone.lng - currentCoords.lng) < 0.003;
            return (
              <button
                key={zone.name}
                type="button"
                onClick={() => handleSelectPreset(zone)}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  isNear
                    ? 'bg-red-50 border-[#E52243] text-[#E52243]'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{zone.name}</span>
                {isNear && <Check className="w-3 h-3 text-[#E52243]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
