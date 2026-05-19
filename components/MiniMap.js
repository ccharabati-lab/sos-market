'use client';

import { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (typeof window !== 'undefined' && TOKEN) {
  mapboxgl.accessToken = TOKEN;
}

const ARROW_UP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>';

function pinClassName(selected) {
  return ['sos-pin', 'sos-pin-offer', selected ? 'sos-pin-selected' : '']
    .filter(Boolean)
    .join(' ');
}

export default function MiniMap({ suppliers, selectedId, originLat, originLng }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const originMarkerRef = useRef(null);
  const markersRef = useRef(new Map());
  const hasFitInitialViewRef = useRef(false);

  const pins = useMemo(
    () =>
      suppliers
        .filter((s) => s.lat != null && s.lng != null)
        .map((s) => ({
          id: s.id,
          lat: s.lat,
          lng: s.lng,
          type: 'offer',
          label: s.name,
        })),
    [suppliers],
  );

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
      center: [originLng, originLat],
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
      hasFitInitialViewRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.setLngLat([originLng, originLat]);
    } else {
      const el = document.createElement('div');
      el.className = 'sos-origin-marker';
      originMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([originLng, originLat])
        .addTo(map);
    }
  }, [originLat, originLng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set();

    pins.forEach((pin) => {
      seen.add(pin.id);
      const isSelected = pin.id === selectedId;
      const existing = markersRef.current.get(pin.id);

      if (existing) {
        existing.marker.setLngLat([pin.lng, pin.lat]);
        existing.el.className = pinClassName(isSelected);
        existing.el.style.cursor = 'default';
        if (pin.label) existing.el.title = pin.label;
      } else {
        const el = document.createElement('div');
        el.className = pinClassName(isSelected);
        el.style.cursor = 'default';
        const inner = document.createElement('div');
        inner.className = 'sos-pin-inner';
        inner.innerHTML = ARROW_UP;
        inner.style.cursor = 'default';
        el.appendChild(inner);
        if (pin.label) el.title = pin.label;

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

    if (!hasFitInitialViewRef.current && pins.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([originLng, originLat]);
      pins.forEach((pin) => bounds.extend([pin.lng, pin.lat]));
      hasFitInitialViewRef.current = true;
      map.fitBounds(bounds, { padding: 50, maxZoom: 13, duration: 600 });
    } else if (!hasFitInitialViewRef.current) {
      map.easeTo({ center: [originLng, originLat], zoom: 11, duration: 600 });
    }
  }, [pins, selectedId, originLat, originLng]);

  return (
    <div className="relative w-full aspect-[16/11] overflow-hidden rounded-[10px] border border-line-strong">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
