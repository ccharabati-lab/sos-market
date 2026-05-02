'use client';

import { useMemo } from 'react';
import MapView from './MapView';

export default function MiniMap({ suppliers, selectedId, onSelect, originLat, originLng }) {
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

  return (
    <MapView
      origin={{ lat: originLat, lng: originLng }}
      pins={pins}
      selectedId={selectedId}
      onSelect={onSelect}
      className="w-full aspect-[16/11] rounded-[10px] overflow-hidden border border-line-strong"
    />
  );
}
