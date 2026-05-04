'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (typeof window !== 'undefined' && TOKEN) {
  mapboxgl.accessToken = TOKEN;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: 'offer' | 'need';
  label?: string;
}

interface MapViewProps {
  origin: { lat: number; lng: number };
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

const ARROW_UP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>';
const ARROW_DOWN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 6 12 11 17 6"/><polyline points="7 13 12 18 17 13"/></svg>';

function pinClassName(type: 'offer' | 'need', selected: boolean) {
  return [
    'sos-pin',
    type === 'offer' ? 'sos-pin-offer' : 'sos-pin-need',
    selected ? 'sos-pin-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export default function MapView({
  origin,
  pins,
  selectedId,
  onSelect,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>(
    new Map(),
  );
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!TOKEN) {
      containerRef.current.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8a9485;font-size:0.8rem;padding:1rem;text-align:center;">Carte indisponible : NEXT_PUBLIC_MAPBOX_TOKEN manquant.</div>';
      return;
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [origin.lng, origin.lat],
      zoom: 11,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    mapRef.current = map;

    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      originMarkerRef.current?.remove();
      originMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.setLngLat([origin.lng, origin.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'sos-origin-marker';
      originMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);
    }
  }, [origin.lat, origin.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();

    pins.forEach((pin) => {
      seen.add(pin.id);
      const isSelected = pin.id === selectedId;
      const existing = markersRef.current.get(pin.id);

      if (existing) {
        existing.marker.setLngLat([pin.lng, pin.lat]);
        existing.el.className = pinClassName(pin.type, isSelected);
        if (pin.label) existing.el.title = pin.label;
      } else {
        const el = document.createElement('div');
        el.className = pinClassName(pin.type, isSelected);
        const inner = document.createElement('div');
        inner.className = 'sos-pin-inner';
        inner.innerHTML = pin.type === 'offer' ? ARROW_UP : ARROW_DOWN;
        el.appendChild(inner);
        if (pin.label) el.title = pin.label;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectRef.current?.(pin.id);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map);

        markersRef.current.set(pin.id, { marker, el });
      }
    });

    markersRef.current.forEach(({ marker }, id) => {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    if (pins.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([origin.lng, origin.lat]);
      pins.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 13, duration: 600 });
    } else {
      map.easeTo({ center: [origin.lng, origin.lat], zoom: 11, duration: 600 });
    }
  }, [pins, selectedId, origin.lat, origin.lng]);

  return <div ref={containerRef} className={className} />;
}
